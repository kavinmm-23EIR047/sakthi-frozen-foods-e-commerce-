const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3005';
const COMPANY_NAME = 'Sakthi Frozen Foods';

function getTelegramConfig() {
  const token = (
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.TELEGRAM_TOKEN ||
    process.env.telegam ||
    ''
  ).trim();

  const chatId = (
    process.env.TELEGRAM_CHAT_ID ||
    process.env.TELEGRAM_ADMIN_CHAT_ID ||
    ''
  ).trim();

  return { token, chatId };
}

function isTelegramConfigured() {
  const { token, chatId } = getTelegramConfig();
  return Boolean(token && chatId);
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramMessage(text, { chatId: overrideChatId, parseMode = 'HTML', replyMarkup } = {}) {
  const { token, chatId: defaultChatId } = getTelegramConfig();
  const targetChatId = overrideChatId || defaultChatId;

  if (!token) {
    const error = new Error('Telegram bot token is not configured (TELEGRAM_BOT_TOKEN in .env)');
    error.statusCode = 503;
    error.retryable = false;
    throw error;
  }
  if (!targetChatId) {
    const error = new Error('Telegram chat ID is not configured (TELEGRAM_CHAT_ID in .env)');
    error.statusCode = 503;
    error.retryable = false;
    throw error;
  }

  const payload = {
    chat_id: targetChatId,
    text,
    disable_web_page_preview: false,
  };

  if (parseMode) {
    payload.parse_mode = parseMode;
  }

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  let result;
  try {
    result = await response.json();
  } catch (err) {
    result = null;
  }

  if (!response.ok || result?.ok === false) {
    const desc = result?.description || `HTTP ${response.status}`;
    const error = new Error(`Telegram API Error: ${desc}`);
    error.statusCode = response.status || 400;
    error.retryable = response.status === 408 || response.status === 429 || response.status >= 500;
    throw error;
  }

  return result;
}

function formatAdminOrderMessage(order, eventType = 'order.created') {
  const orderNumber = escapeHtml(order.orderNumber || 'N/A');
  const customerName = escapeHtml(order.customerName || 'N/A');
  const customerEmail = escapeHtml(order.customerEmail || 'N/A');
  const customerPhone = escapeHtml(order.customerPhone || 'N/A');
  const shippingAddress = escapeHtml(order.shippingAddress || 'N/A');
  const landmark = order.landmark ? escapeHtml(order.landmark) : '';
  const city = order.city ? escapeHtml(order.city) : '';
  const pincode = order.pincode ? escapeHtml(order.pincode) : '';
  const state = order.state ? escapeHtml(order.state) : '';

  const fullAddress = [
    shippingAddress,
    landmark ? `(Landmark: ${landmark})` : '',
    city,
    state,
    pincode,
  ].filter(Boolean).join(', ');

  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  let headerEmoji = '🔔';
  let headerTitle = 'NEW ORDER RECEIVED!';
  if (eventType === 'order.cancelled') {
    headerEmoji = '❌';
    headerTitle = 'ORDER CANCELLED';
  } else if (eventType === 'payment.success' || eventType === 'payment.verified' || eventType === 'order.confirmed') {
    headerEmoji = '✅';
    headerTitle = 'ORDER CONFIRMED (PAID)';
  } else if (eventType === 'payment.failed') {
    headerEmoji = '⚠️';
    headerTitle = 'PAYMENT FAILED';
  }

  const itemsList = (order.items || []).map((item, idx) => {
    const itemName = escapeHtml(item.name || 'Item');
    const weight = item.weight ? ` (${escapeHtml(item.weight)})` : '';
    const qty = item.quantity || 1;
    const price = ((item.price || 0) * qty).toFixed(2);
    return `  <b>${idx + 1}.</b> ${itemName}${weight} x <b>${qty}</b> — ₹${price}`;
  }).join('\n');

  const subtotal = (order.subtotal || 0).toFixed(2);
  const deliveryFee = (order.deliveryFee || 0).toFixed(2);
  const convenienceFee = order.convenienceFee ? `• Convenience Fee: ₹${Number(order.convenienceFee).toFixed(2)}\n` : '';
  const totalAmount = (order.totalAmount || 0).toFixed(2);
  const paymentMethod = escapeHtml(order.paymentMethod || 'N/A');
  const paymentStatus = order.paymentStatus === 'Paid' ? '✅ Paid' : `⏳ ${escapeHtml(order.paymentStatus || 'Pending')}`;
  const orderStatus = escapeHtml(order.status || 'Pending');

  const lines = [
    `${headerEmoji} <b>${headerTitle}</b>`,
    '━━━━━━━━━━━━━━━━━━━━━',
    `📦 <b>Order ID:</b> <code>${orderNumber}</code>`,
    `📅 <b>Date:</b> ${dateStr}`,
    `📊 <b>Order Status:</b> ${orderStatus}`,
    '',
    '👤 <b>CUSTOMER DETAILS:</b>',
    `• <b>Name:</b> ${customerName}`,
    `• <b>Phone:</b> <a href="tel:${customerPhone}">${customerPhone}</a>`,
    `• <b>Email:</b> ${customerEmail}`,
    `• <b>Address:</b> ${fullAddress}`,
  ];

  if (order.coordinates && order.coordinates.lat && order.coordinates.lng) {
    lines.push(`• <b>Location:</b> <a href="https://www.google.com/maps?q=${order.coordinates.lat},${order.coordinates.lng}">Open in Google Maps</a>`);
  }

  lines.push('');
  lines.push(`🛒 <b>ITEMS ORDERED (${order.items?.length || 0}):</b>`);
  lines.push(itemsList || '  (No items)');
  lines.push('');
  lines.push('💰 <b>BILL DETAILS:</b>');
  lines.push(`• Subtotal: ₹${subtotal}`);
  lines.push(`• Delivery Fee: ₹${deliveryFee}`);
  if (convenienceFee) lines.push(convenienceFee.trim());
  lines.push(`• <b>TOTAL AMOUNT: ₹${totalAmount}</b>`);
  lines.push('');
  lines.push('💳 <b>PAYMENT INFO:</b>');
  lines.push(`• <b>Method:</b> ${paymentMethod}`);
  lines.push(`• <b>Payment Status:</b> ${paymentStatus}`);
  if (order.razorpayPaymentId) {
    lines.push(`• <b>Razorpay Payment ID:</b> <code>${escapeHtml(order.razorpayPaymentId)}</code>`);
  }
  lines.push('━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`🏢 <i>${COMPANY_NAME} Admin Alert</i>`);

  return lines.join('\n');
}

async function sendAdminOrderTelegram(order, eventType = 'order.created') {
  const { token, chatId } = getTelegramConfig();
  if (!token || !chatId) {
    return null;
  }

  const text = formatAdminOrderMessage(order, eventType);
  const adminUrl = `${FRONTEND_URL}/admin/orders`;

  const inlineKeyboard = [
    [
      { text: '📋 View in Admin Panel', url: adminUrl },
    ],
  ];

  if (order.coordinates && order.coordinates.lat && order.coordinates.lng) {
    inlineKeyboard[0].push({
      text: '📍 Google Maps',
      url: `https://www.google.com/maps?q=${order.coordinates.lat},${order.coordinates.lng}`,
    });
  }

  return sendTelegramMessage(text, {
    parseMode: 'HTML',
    replyMarkup: { inline_keyboard: inlineKeyboard },
  });
}

async function getTelegramBotInfo() {
  const { token, chatId } = getTelegramConfig();
  if (!token) {
    return {
      configured: false,
      tokenConfigured: false,
      chatIdConfigured: Boolean(chatId),
      chatId,
      error: 'TELEGRAM_BOT_TOKEN is not configured in .env',
    };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        configured: true,
        tokenConfigured: true,
        chatIdConfigured: Boolean(chatId),
        chatId,
        valid: false,
        error: data.description || `HTTP ${res.status}`,
      };
    }
    return {
      configured: true,
      tokenConfigured: true,
      chatIdConfigured: Boolean(chatId),
      chatId,
      valid: true,
      bot: data.result,
    };
  } catch (err) {
    return {
      configured: true,
      tokenConfigured: true,
      chatIdConfigured: Boolean(chatId),
      chatId,
      valid: false,
      error: err.message,
    };
  }
}

async function getTelegramUpdates() {
  const { token } = getTelegramConfig();
  if (!token) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN is not configured in .env' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=10`, {
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || `HTTP ${res.status}` };
    }

    // Extract unique chats that have sent messages to the bot
    const recentChats = [];
    const seenChats = new Set();

    if (Array.isArray(data.result)) {
      for (const update of data.result) {
        const chat = update.message?.chat || update.channel_post?.chat || update.my_chat_member?.chat;
        if (chat && chat.id && !seenChats.has(chat.id)) {
          seenChats.add(chat.id);
          recentChats.push({
            id: chat.id,
            type: chat.type,
            title: chat.title || null,
            username: chat.username || null,
            firstName: chat.first_name || null,
            lastName: chat.last_name || null,
          });
        }
      }
    }

    return { success: true, updates: data.result, recentChats };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function sendTestTelegramMessage(overrideChatId) {
  const { token, chatId: defaultChatId } = getTelegramConfig();
  const targetChatId = overrideChatId || defaultChatId;

  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured in .env');
  if (!targetChatId) throw new Error('TELEGRAM_CHAT_ID is not configured in .env');

  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const testText = `
🎉 <b>TELEGRAM NOTIFICATIONS WORKING!</b>
━━━━━━━━━━━━━━━━━━━━━
✅ <b>${COMPANY_NAME}</b> Telegram bot is successfully connected!

🔔 <b>You will receive instant alerts for:</b>
• 🛍️ New customer orders (COD & Online)
• 💳 Online payment confirmations
• ❌ Order cancellations
• 📊 Order status changes

⏰ <b>Verified at:</b> ${dateStr}
━━━━━━━━━━━━━━━━━━━━━
🏢 <i>Sakthi Frozen Foods Notification System</i>
`.trim();

  return sendTelegramMessage(testText, {
    chatId: targetChatId,
    parseMode: 'HTML',
    replyMarkup: {
      inline_keyboard: [[{ text: '🏪 Visit Store', url: FRONTEND_URL }]],
    },
  });
}

module.exports = {
  getTelegramConfig,
  isTelegramConfigured,
  sendTelegramMessage,
  formatAdminOrderMessage,
  sendAdminOrderTelegram,
  getTelegramBotInfo,
  getTelegramUpdates,
  sendTestTelegramMessage,
  escapeHtml,
};
