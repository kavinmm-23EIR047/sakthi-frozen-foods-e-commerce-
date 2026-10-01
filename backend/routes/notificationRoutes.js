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

module.exports = router;
