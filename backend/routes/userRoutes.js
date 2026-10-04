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
      const rawUsers = await User.find().sort({ createdAt: -1 }).select('-password -sessionVersion').lean();
      const userIds = rawUsers.map((user) => user._id);
      const userEmails = rawUsers
        .map((user) => String(user.email || '').trim())
        .filter(Boolean)
        .map((email) => new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'));
      const rawOrders = userIds.length ? await Order.find({
        $or: [
          { user: { $in: userIds } },
          { customerEmail: { $in: userEmails } },
        ],
      }).sort({ createdAt: -1 }).select('-razorpaySignature').lean() : [];

      const usersById = new Map(rawUsers.map((user) => [user._id.toString(), user]));
      const usersByEmail = new Map(rawUsers.map((user) => [String(user.email || '').trim().toLowerCase(), user]));
      const ordersByUser = new Map(rawUsers.map((user) => [user._id.toString(), []]));

      for (const order of rawOrders) {
        const user = (order.user && usersById.get(order.user.toString())) || usersByEmail.get(String(order.customerEmail || '').trim().toLowerCase());
        if (user) ordersByUser.get(user._id.toString()).push(order);
      }

      return rawUsers.map((user) => {
        const userOrders = ordersByUser.get(user._id.toString()) || [];
        const countedOrders = userOrders.filter((order) => !['Cancelled', 'Failed', 'Payment Failed'].includes(order.status));
        const paidOrders = countedOrders.filter((order) => order.paymentStatus === 'Paid' || order.status === 'Confirmed');
        const totalSpent = paidOrders.reduce((total, order) => total + Number(order.totalAmount || 0), 0);

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          totalOrders: countedOrders.length,
          totalSpent,
          joinedDate: user.joinedDate,
          address: user.address,
          orderHistory: userOrders.map((order) => ({
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            status: order.status || 'Pending',
            paymentStatus: order.paymentStatus || 'Pending',
            totalAmount: Number(order.totalAmount || 0),
            createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : '',
            items: Array.isArray(order.items) ? order.items : [],
          })),
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
