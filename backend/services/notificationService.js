const Notification = require('../models/Notification');
const {
  sendMail,
  sendAdminOrderNotification,
  sendUserOrderConfirmation,
  sendOrderStatusUpdate,
  generateInvoicePdf,
  buildUserOrderEmail,
  buildAdminOrderEmail,
  buildOrderStatusUpdateEmail,
} = require('./emailService');
const {
  formatAdminOrderMessage,
  getTelegramConfig,
  sendTelegramMessage,
} = require('./telegramService');

const MAX_ATTEMPTS = 3;
const SENDING_LEASE_MS = 2 * 60 * 1000;

function isRetryableError(error) {
  if (error?.retryable === false) return false;
  const status = error?.statusCode || error?.status;
  return !status || status === 408 || status === 429 || status >= 500;
}

function retryDelay(attempt) {
  return (150 * (2 ** Math.max(attempt - 1, 0))) + Math.floor(Math.random() * 100);
}

function providerError(message, statusCode, retryable = undefined) {
  const error = new Error(message);
  if (statusCode) error.statusCode = statusCode;
  if (retryable !== undefined) error.retryable = retryable;
  return error;
}

async function sendEmail({ recipient, subject, message, html, pdfBase64, pdfFilename }) {
  try {
    const attachments = pdfBase64 ? [{
      filename: pdfFilename || 'Invoice.pdf',
      content: pdfBase64,
      contentType: 'application/pdf',
    }] : [];

    await sendMail({
      to: recipient,
      subject,
      html: html || `<p style="font-family:sans-serif;font-size:14px;color:#1a1e16;">${(message || '').replace(/\n/g, '<br/>')}</p>`,
      text: message,
      attachments,
    });
  } catch (err) {
    throw providerError(err.message, err.statusCode || 500);
  }
}

async function sendTelegram({ recipient, message }) {
  const { token, chatId: defaultChatId } = getTelegramConfig();
  const targetChatId = recipient || defaultChatId;
  if (!token || !targetChatId) {
    throw providerError('Telegram provider is not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID)', 503, false);
  }

  try {
    await sendTelegramMessage(message, { chatId: targetChatId, parseMode: 'HTML' });
  } catch (error) {
    if (error.message && (error.message.includes("can't parse entities") || error.message.includes('Bad Request'))) {
      await sendTelegramMessage(message, { chatId: targetChatId, parseMode: undefined });
    } else {
      throw error;
    }
  }
}

async function deliverNotification(notificationId) {
  const now = new Date();
  const staleSendingBefore = new Date(now.getTime() - SENDING_LEASE_MS);
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      $or: [
        { status: { $in: ['Pending', 'Failed'] } },
        { status: 'Sending', sendingAt: { $lt: staleSendingBefore } },
      ],
      attempts: { $lt: MAX_ATTEMPTS },
      $and: [{ $or: [{ nextAttemptAt: { $exists: false } }, { nextAttemptAt: null }, { nextAttemptAt: { $lte: now } }] }],
    },
    { $set: { status: 'Sending', sendingAt: now, lastAttemptAt: now }, $inc: { attempts: 1 } },
    { new: true }
  );
  if (!notification) return null;

  try {
    if (notification.channel === 'telegram') {
      await sendTelegram(notification);
    } else {
      await sendEmail(notification);
    }
    return Notification.findByIdAndUpdate(notification._id, {
      $set: { status: 'Sent', sentAt: new Date() },
      $unset: { lastError: 1, failureReason: 1, nextAttemptAt: 1, sendingAt: 1 },
    }, { new: true });
  } catch (error) {
    const retryable = isRetryableError(error);
    const canRetry = retryable && notification.attempts < MAX_ATTEMPTS;
    const update = {
      $set: {
        status: 'Failed',
        lastError: error.message,
        failureReason: error.message,
        sendingAt: undefined,
        ...(canRetry ? { nextAttemptAt: new Date(Date.now() + retryDelay(notification.attempts)) } : {}),
      },
    };
    update.$unset = { sendingAt: 1 };
    if (!canRetry) update.$unset.nextAttemptAt = 1;
    await Notification.findByIdAndUpdate(notification._id, update);
    console.error(JSON.stringify({ type: 'notification_failure', notificationKey: notification.notificationKey, channel: notification.channel, attempts: notification.attempts, retryable, error: error.message }));
    return Notification.findById(notification._id);
  }
}

async function dispatchNotification({ notificationKey, eventType, channel, recipient, subject, message, html, pdfBase64, pdfFilename, orderId }) {
  let notification;
  try {
    notification = await Notification.findOneAndUpdate(
      { notificationKey },
      {
        $setOnInsert: {
          notificationKey,
          idempotencyKey: notificationKey,
          eventType,
          channel,
          recipient,
          subject,
          message,
          html,
          pdfBase64,
          pdfFilename,
          orderId,
          status: 'Pending',
          attempts: 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code === 11000) notification = await Notification.findOne({ notificationKey });
    else throw error;
  }
  if (!notification || notification.status === 'Sent') return notification;
  return deliverNotification(notification._id);
}

async function retryDueNotifications(batchSize = 20) {
  let processed = 0;
  for (let index = 0; index < batchSize; index += 1) {
    const now = new Date();
    const staleSendingBefore = new Date(now.getTime() - SENDING_LEASE_MS);
    const due = await Notification.findOne({
      $or: [
        { status: { $in: ['Pending', 'Failed'] } },
        { status: 'Sending', sendingAt: { $lt: staleSendingBefore } },
      ],
      attempts: { $lt: MAX_ATTEMPTS },
      $or: [{ nextAttemptAt: { $exists: false } }, { nextAttemptAt: null }, { nextAttemptAt: { $lte: now } }],
    }).sort({ createdAt: 1 }).select('_id').lean();
    if (!due) break;
    if (await deliverNotification(due._id)) processed += 1;
  }
  return processed;
}

/**
 * Main Order Notification Queuer
 * 
 * Rules (Simplified Direct Flow):
 * 1. Customer receives EXACTLY ONE confirmation + PDF invoice email per successful order:
 *    - COD orders: sent once on 'order.created'
 *    - Online orders: sent once ONLY after payment succeeds ('payment.success' / 'payment.verified')
 * 2. Admin receives ONE Email & Telegram notification when the new order is placed / paid.
 * 3. No intermediate status change emails (Shipped/Delivered), customer contacts directly via WhatsApp/Phone if needed.
 */
async function queueOrderNotifications(order, eventType) {
  const jobs = [];

  const isCOD = order.paymentMethod === 'Cash on Delivery';
  const isOnlinePaid = order.paymentStatus === 'Paid';

  // ── 1. Customer Confirmation & Tax Invoice Email (EXACTLY ONE PER ORDER) ──
  const shouldSendCustomerInvoice =
    (eventType === 'order.created' && isCOD) ||
    (eventType === 'payment.success' || eventType === 'payment.verified');

  if (shouldSendCustomerInvoice) {
    const customerHtml = buildUserOrderEmail(order);
    let pdfBase64 = null;
    try {
      const pdfBuffer = await generateInvoicePdf(order);
      pdfBase64 = pdfBuffer.toString('base64');
    } catch (err) {
      console.warn('Could not generate PDF buffer for notification:', err.message);
    }

    jobs.push(
      dispatchNotification({
        notificationKey: `${order._id}:confirmed-invoice:customer-email`,
        eventType: isCOD ? 'order.confirmed.cod' : 'payment.verified.online',
        channel: 'customer-email',
        recipient: order.customerEmail,
        subject: `✅ Order Confirmed & Invoice #${order.orderNumber} - Sakthi Frozen Foods`,
        message: `Your order #${order.orderNumber} for ₹${Number(order.totalAmount).toFixed(2)} has been confirmed.`,
        html: customerHtml,
        pdfBase64,
        pdfFilename: `Invoice-${order.orderNumber}.pdf`,
        orderId: order._id,
      }).catch((err) => {
        console.error(JSON.stringify({ type: 'user_notification_error', orderNumber: order.orderNumber, error: err.message }));
      })
    );
  }

  // ── 2. Admin Email & Telegram Alerts (Single New Order Notification) ──
  const shouldSendAdminAlert =
    (eventType === 'order.created' && isCOD) ||
    (eventType === 'payment.success' || eventType === 'payment.verified') ||
    eventType === 'order.cancelled';

  if (shouldSendAdminAlert) {
    const adminHtml = buildAdminOrderEmail(order);
    const adminRecipient = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'sakthifrozenfoods@gmail.com';
    jobs.push(
      dispatchNotification({
        notificationKey: `${order._id}:${eventType}:admin-email`,
        eventType,
        channel: 'admin-email',
        recipient: adminRecipient,
        subject: `🔔 Admin Alert: Order #${order.orderNumber} (${eventType}) - ₹${Number(order.totalAmount).toFixed(2)}`,
        message: `Admin Order Alert #${order.orderNumber} - ₹${Number(order.totalAmount).toFixed(2)}`,
        html: adminHtml,
        orderId: order._id,
      }).catch((err) => {
        console.error(JSON.stringify({ type: 'admin_email_notification_error', orderNumber: order.orderNumber, error: err.message }));
      })
    );

    const { token, chatId } = getTelegramConfig();
    if (token && chatId) {
      const telegramMessage = formatAdminOrderMessage(order, eventType);
      jobs.push(
        dispatchNotification({
          notificationKey: `${order._id}:${eventType}:telegram`,
          eventType,
          channel: 'telegram',
          recipient: chatId,
          subject: `Sakthi Frozen Foods admin Telegram alert - ${eventType}`,
          message: telegramMessage,
          orderId: order._id,
        }).catch((err) => {
          console.error(JSON.stringify({ type: 'telegram_notification_error', orderNumber: order.orderNumber, error: err.message }));
        })
      );
    }
  }

  return Promise.allSettled(jobs);
}

module.exports = {
  MAX_ATTEMPTS,
  isRetryableError,
  retryDelay,
  sendEmail,
  sendTelegram,
  deliverNotification,
  dispatchNotification,
  retryDueNotifications,
  queueOrderNotifications,
};
