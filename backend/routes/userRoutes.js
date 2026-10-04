const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');
const cacheService = require('../services/cacheService');

const USERS_CACHE_KEY = 'sakthi:users:all';
const USERS_TTL = 120; // 2 minutes — admin-only data

// GET all users — cached
router.get('/', protect, admin, async (req, res) => {
  try {
    res.set('Cache-Control', 'private, max-age=30');
    const { data: users } = await cacheService.getOrSet(USERS_CACHE_KEY, async () => {
      const [rawUsers, orderStats] = await Promise.all([
        User.find().sort({ createdAt: -1 }).select('-password -sessionVersion').lean(),
        Order.aggregate([
          { $match: { status: { $nin: ['Cancelled', 'Failed', 'Payment Failed'] } } },
          { $group: { _id: "$user", totalOrders: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" } } }
        ])
      ]);

      const statsMap = orderStats.reduce((acc, curr) => {
        if (curr._id) acc[curr._id.toString()] = curr;
        return acc;
      }, {});

      return rawUsers.map((u) => {
        const stats = statsMap[u._id.toString()] || { totalOrders: 0, totalSpent: 0 };
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          joinedDate: u.joinedDate,
          address: u.address,
        };
      });
    }, USERS_TTL);

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update user role — invalidates cache
router.put('/:id/role', protect, admin, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    await cacheService.del(USERS_CACHE_KEY);
    res.json({ success: true, message: 'Role updated successfully', role: updated.role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE user — invalidates cache
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await cacheService.del(USERS_CACHE_KEY);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
