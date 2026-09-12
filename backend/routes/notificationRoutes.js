const express = require('express');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/authMiddleware');
const { dispatchNotification } = require('../services/notificationService');

const router = express.Router();

router.get('/', protect, admin, async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '25', 10), 1), 100);
    const filter = req.query.status && ['Pending', 'Sent', 'Failed'].includes(req.query.status)
      ? { status: req.query.status }
      : {};
    if (req.query.channel && ['customer-email', 'admin-email', 'telegram'].includes(req.query.channel)) filter.channel = req.query.channel;
    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-message').lean(),
      Notification.countDocuments(filter),
    ]);
    res.json({ success: true, count: notifications.length, total, page, totalPages: Math.ceil(total / limit), data: notifications });
  } catch (error) {
    next(error);
  }
});

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
