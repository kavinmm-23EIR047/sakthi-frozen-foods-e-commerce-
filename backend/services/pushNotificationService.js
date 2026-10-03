const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const User = require('../models/User');

let isVapidConfigured = false;

function setupVapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:sakthifrozenfoods@gmail.com';

  if (!publicKey || !privateKey) {
    console.warn('⚠️ Web Push VAPID keys not fully configured in environment variables');
    return false;
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    isVapidConfigured = true;
    return true;
  } catch (err) {
    console.error('Failed to configure VAPID details for Web Push:', err.message);
    return false;
  }
}

// Initialize VAPID config
setupVapid();

/**
 * Format notification payload into Web Push standard structure
 */
function formatPayload(payload) {
  return JSON.stringify({
    title: payload.title || 'Sakthi Frozen Foods',
    body: payload.body || '',
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/favicon-32x32.png',
    image: payload.image || undefined,
    data: {
      url: payload.url || '/',
      timestamp: Date.now(),
      ...(payload.data || {}),
    },
    tag: payload.tag || 'sakthi-notification',
    requireInteraction: Boolean(payload.requireInteraction),
    vibrate: [200, 100, 200],
  });
}

/**
 * Send a single push notification to a specific subscription record
 */
async function sendSinglePush(subscriptionRecord, payloadString) {
  if (!isVapidConfigured && !setupVapid()) {
    return { success: false, error: 'VAPID not configured' };
  }

  const pushSubscription = {
    endpoint: subscriptionRecord.endpoint,
    keys: {
      p256dh: subscriptionRecord.keys.p256dh,
      auth: subscriptionRecord.keys.auth,
    },
  };

  try {
    await webpush.sendNotification(pushSubscription, payloadString, {
      TTL: 60 * 60 * 24, // 24 hours
      urgency: 'high',
    });

    await PushSubscription.updateOne(
      { _id: subscriptionRecord._id },
      { $set: { lastSuccessAt: new Date(), failureCount: 0 } }
    ).catch(() => {});

    return { success: true, subId: subscriptionRecord._id };
  } catch (error) {
    const statusCode = error.statusCode || error.status;
    const isExpiredOrInvalid =
      statusCode === 404 ||
      statusCode === 410 ||
      (error.message && (error.message.includes('expired') || error.message.includes('unsubscribed') || error.message.includes('not registered')));

    if (isExpiredOrInvalid) {
      console.log(`Pruning expired or invalid Web Push subscription (${subscriptionRecord.endpoint.slice(0, 30)}...)`);
      await PushSubscription.deleteOne({ _id: subscriptionRecord._id }).catch(() => {});
    } else {
      await PushSubscription.updateOne(
        { _id: subscriptionRecord._id },
        {
          $set: { lastFailureAt: new Date() },
          $inc: { failureCount: 1 },
        }
      ).catch(() => {});
    }

    return { success: false, subId: subscriptionRecord._id, error: error.message, expired: isExpiredOrInvalid };
  }
}

/**
 * Send Web Push Notification to all active subscriptions of a given user
 */
async function sendPushNotification(userId, payload, category = 'orderUpdates') {
  if (!userId) return { delivered: 0, total: 0 };

  try {
    const filter = {
      userId,
      isActive: true,
    };

    if (category) {
      filter[`preferences.${category}`] = { $ne: false };
    }

    const subscriptions = await PushSubscription.find(filter).lean();
    if (!subscriptions || subscriptions.length === 0) {
      return { delivered: 0, total: 0 };
    }

    const payloadString = typeof payload === 'string' ? payload : formatPayload(payload);
    const results = await Promise.allSettled(
      subscriptions.map((sub) => sendSinglePush(sub, payloadString))
    );

    const delivered = results.filter((r) => r.status === 'fulfilled' && r.value?.success).length;
    return { delivered, total: subscriptions.length };
  } catch (err) {
    console.error('Error in sendPushNotification:', err.message);
    return { delivered: 0, total: 0, error: err.message };
  }
}

/**
 * Direct push send to specific subscription object (useful for instant test upon subscribe)
 */
async function sendDirectPush(subscriptionObj, payload) {
  if (!isVapidConfigured && !setupVapid()) {
    return { success: false, error: 'VAPID not configured' };
  }

  const payloadString = typeof payload === 'string' ? payload : formatPayload(payload);
  try {
    await webpush.sendNotification(subscriptionObj, payloadString, {
      TTL: 60 * 60 * 24,
      urgency: 'high',
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── High-Level E-commerce Notification Functions ─────────────────────────

async function notifyOrderPlaced(userId, order) {
  return sendPushNotification(userId, {
    title: `🛒 Order Placed #${order.orderNumber}`,
    body: `Your order for ₹${order.totalAmount} has been placed. We are preparing your fresh cold-chain items.`,
    url: `/orders/${order._id || order.id}`,
    tag: `order-${order._id || order.id}`,
  }, 'orderUpdates');
}

async function notifyPaymentSuccessful(userId, order) {
  return sendPushNotification(userId, {
    title: '💳 Payment Successful 🎉',
    body: `Payment of ₹${order.totalAmount} was verified for Order #${order.orderNumber}.`,
    url: `/orders/${order._id || order.id}?success=true`,
    tag: `payment-${order._id || order.id}`,
  }, 'paymentUpdates');
}

async function notifyOrderConfirmed(userId, order) {
  return sendPushNotification(userId, {
    title: `✅ Order Confirmed #${order.orderNumber}`,
    body: `Your order #${order.orderNumber} is confirmed and packed at -18°C cold-chain standards.`,
    url: `/orders/${order._id || order.id}`,
    tag: `order-${order._id || order.id}`,
  }, 'orderUpdates');
}

async function notifyOrderShipped(userId, order) {
  return sendPushNotification(userId, {
    title: `📦 Order Shipped #${order.orderNumber}`,
    body: `Your order #${order.orderNumber} is on the way in express temperature-controlled packaging.`,
    url: `/orders/${order._id || order.id}`,
    tag: `delivery-${order._id || order.id}`,
  }, 'deliveryUpdates');
}

async function notifyOutForDelivery(userId, order) {
  return sendPushNotification(userId, {
    title: `🚚 Out for Delivery #${order.orderNumber}`,
    body: `Your cold-chain order #${order.orderNumber} is arriving today!`,
    url: `/orders/${order._id || order.id}`,
    tag: `delivery-${order._id || order.id}`,
  }, 'deliveryUpdates');
}

async function notifyOrderDelivered(userId, order) {
  return sendPushNotification(userId, {
    title: `🎉 Order Delivered #${order.orderNumber}`,
    body: `Order #${order.orderNumber} has been delivered safely. Enjoy your premium frozen foods!`,
    url: `/orders/${order._id || order.id}`,
    tag: `delivery-${order._id || order.id}`,
  }, 'deliveryUpdates');
}

async function notifyOrderCancelled(userId, order) {
  return sendPushNotification(userId, {
    title: `❌ Order Cancelled #${order.orderNumber}`,
    body: `Order #${order.orderNumber} has been cancelled.`,
    url: `/orders/${order._id || order.id}`,
    tag: `order-${order._id || order.id}`,
  }, 'orderUpdates');
}

async function notifyAdminNewOrder(order) {
  try {
    const adminUsers = await User.find({ role: 'Admin' }).select('_id').lean();
    if (!adminUsers || adminUsers.length === 0) return { delivered: 0 };

    const payload = {
      title: `🔔 New Order Received #${order.orderNumber}`,
      body: `Customer: ${order.customerName} | Amount: ₹${order.totalAmount} (${order.paymentMethod})`,
      url: '/admin/orders',
      tag: `admin-order-${order._id || order.id}`,
      requireInteraction: true,
    };

    let totalDelivered = 0;
    for (const admin of adminUsers) {
      const res = await sendPushNotification(admin._id, payload, 'orderUpdates');
      totalDelivered += res.delivered;
    }

    return { delivered: totalDelivered };
  } catch (err) {
    console.error('Error notifying admins via Web Push:', err.message);
    return { delivered: 0, error: err.message };
  }
}

async function sendTestNotification(userId) {
  return sendPushNotification(userId, {
    title: '🔔 Test Notification',
    body: 'Web Push notifications are working successfully on Sakthi Frozen Foods!',
    url: '/orders',
    tag: 'test-notification',
  }, null);
}

module.exports = {
  isVapidConfigured: () => isVapidConfigured,
  sendPushNotification,
  sendDirectPush,
  notifyOrderPlaced,
  notifyPaymentSuccessful,
  notifyOrderConfirmed,
  notifyOrderShipped,
  notifyOutForDelivery,
  notifyOrderDelivered,
  notifyOrderCancelled,
  notifyAdminNewOrder,
  sendTestNotification,
};
