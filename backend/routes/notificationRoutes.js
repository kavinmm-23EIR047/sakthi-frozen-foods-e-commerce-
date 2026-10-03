const express = require('express');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/authMiddleware');
const { dispatchNotification } = require('../services/notificationService');
const {
  getTelegramBotInfo,
  getTelegramUpdates,
  sendTestTelegramMessage,
  getTelegramConfig,
} = require('../services/telegramService');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get notification delivery logs
// @access  Private (Admin)
router.get('/', protect, admin, async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '25', 10), 1), 100);
    const filter = req.query.status && ['Pending', 'Sent', 'Failed'].includes(req.query.status)
      ? { status: req.query.status }
      : {};
    if (req.query.channel && ['customer-email', 'admin-email', 'telegram'].includes(req.query.channel)) {
      filter.channel = req.query.channel;
    }
    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-message').lean(),
      Notification.countDocuments(filter),
    ]);
    res.json({ success: true, count: notifications.length, total, page, totalPages: Math.ceil(total / limit), data: notifications });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/telegram-status
// @desc    Get Telegram bot status & connection info
// @access  Private (Admin)
router.get('/telegram-status', protect, admin, async (req, res, next) => {
  try {
    const botInfo = await getTelegramBotInfo();
    const config = getTelegramConfig();
    res.json({
      success: true,
      data: {
        ...botInfo,
        chatId: config.chatId ? `${config.chatId.slice(0, 4)}****` : null,
        isFullyConfigured: Boolean(botInfo.valid && config.chatId),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/telegram-updates
// @desc    Get recent chat IDs from Telegram to help admin configure TELEGRAM_CHAT_ID
// @access  Private (Admin)
router.get('/telegram-updates', protect, admin, async (req, res, next) => {
  try {
    const result = await getTelegramUpdates();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/test-telegram
// @desc    Send a test Telegram message to the configured admin chat
// @access  Private (Admin)
router.post('/test-telegram', protect, admin, async (req, res, next) => {
  try {
    const overrideChatId = req.body?.chatId;
    const result = await sendTestTelegramMessage(overrideChatId);
    res.json({ success: true, message: 'Test notification sent to Telegram successfully!', data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   POST /api/notifications/:id/retry
// @desc    Retry a failed notification
// @access  Private (Admin)
router.post('/:id/retry', protect, admin, async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, error: 'Notification not found' });
    if (notification.status === 'Sent') return res.json({ success: true, data: notification });
    if (notification.attempts >= 3) return res.status(409).json({ success: false, error: 'Maximum notification attempts reached' });
    const updated = await dispatchNotification(notification.toObject());
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// WEB PUSH NOTIFICATION ENDPOINTS (Standards-based, Zero 3rd-party)
// ══════════════════════════════════════════════════════════════════════════════

const PushSubscription = require('../models/PushSubscription');
const {
  sendPushNotification,
  sendTestNotification,
  isVapidConfigured,
} = require('../services/pushNotificationService');

// @route   GET /api/notifications/vapid-public-key
// @desc    Get VAPID public key for frontend subscription
// @access  Public
router.get('/vapid-public-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(503).json({
      success: false,
      error: 'VAPID public key is not configured on the server',
    });
  }
  return res.json({
    success: true,
    publicKey,
  });
});

// @route   POST /api/notifications/subscribe
// @desc    Register / update a browser Web Push subscription
// @access  Private (Authenticated User)
router.post('/subscribe', protect, async (req, res, next) => {
  try {
    const { subscription, userAgent, deviceType, preferences } = req.body || {};

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return res.status(400).json({
        success: false,
        error: 'Invalid push subscription payload. Missing endpoint or encryption keys.',
      });
    }

    const defaultPreferences = {
      orderUpdates: true,
      paymentUpdates: true,
      deliveryUpdates: true,
      promotional: false,
    };

    const mergedPreferences = {
      ...defaultPreferences,
      ...(preferences || {}),
    };

    // Upsert subscription tied securely to authenticated req.user._id
    const saved = await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        $set: {
          userId: req.user._id,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: String(subscription.keys.p256dh).trim(),
            auth: String(subscription.keys.auth).trim(),
          },
          expirationTime: subscription.expirationTime ? new Date(subscription.expirationTime) : null,
          userAgent: userAgent || req.headers['user-agent'] || '',
          deviceType: deviceType || 'Unknown',
          preferences: mergedPreferences,
          isActive: true,
          failureCount: 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Subscribed to push notifications successfully',
      data: {
        id: saved._id,
        preferences: saved.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/subscribe
// @desc    Unsubscribe the current browser endpoint
// @access  Private (Authenticated User)
router.delete('/subscribe', protect, async (req, res, next) => {
  try {
    const { endpoint } = req.body || {};

    if (endpoint) {
      await PushSubscription.deleteOne({
        endpoint,
        userId: req.user._id,
      });
    } else {
      // If no specific endpoint provided, mark user's subscriptions inactive
      await PushSubscription.updateMany(
        { userId: req.user._id },
        { $set: { isActive: false } }
      );
    }

    return res.json({
      success: true,
      message: 'Unsubscribed from push notifications successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/status
// @desc    Get user's push notification status & active subscription count
// @access  Private (Authenticated User)
router.get('/status', protect, async (req, res, next) => {
  try {
    const subscriptions = await PushSubscription.find({
      userId: req.user._id,
      isActive: true,
    }).lean();

    const latest = subscriptions[0];
    const defaultPreferences = {
      orderUpdates: true,
      paymentUpdates: true,
      deliveryUpdates: true,
      promotional: false,
    };

    return res.json({
      success: true,
      data: {
        isSubscribed: subscriptions.length > 0,
        subscriptionCount: subscriptions.length,
        preferences: latest?.preferences || defaultPreferences,
        isVapidReady: isVapidConfigured(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/preferences
// @desc    Update push notification preferences
// @access  Private (Authenticated User)
router.put('/preferences', protect, async (req, res, next) => {
  try {
    const { orderUpdates, paymentUpdates, deliveryUpdates, promotional } = req.body || {};

    const updateFields = {};
    if (typeof orderUpdates === 'boolean') updateFields['preferences.orderUpdates'] = orderUpdates;
    if (typeof paymentUpdates === 'boolean') updateFields['preferences.paymentUpdates'] = paymentUpdates;
    if (typeof deliveryUpdates === 'boolean') updateFields['preferences.deliveryUpdates'] = deliveryUpdates;
    if (typeof promotional === 'boolean') updateFields['preferences.promotional'] = promotional;

    await PushSubscription.updateMany(
      { userId: req.user._id },
      { $set: updateFields }
    );

    return res.json({
      success: true,
      message: 'Notification preferences updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/notifications/test
// @desc    Send a test Web Push notification to current user's registered devices
// @access  Private (Authenticated User)
router.post('/test', protect, async (req, res, next) => {
  try {
    const result = await sendTestNotification(req.user._id);

    if (result.total === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active browser subscriptions found for your account. Please enable notifications in this browser first.',
      });
    }

    return res.json({
      success: true,
      message: `Test push notification dispatched! Sent to ${result.delivered} of ${result.total} device(s).`,
      delivered: result.delivered,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
