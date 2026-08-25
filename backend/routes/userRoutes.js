const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
  try {
    const rawUsers = await User.find().sort({ createdAt: -1 });
    const users = rawUsers.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      totalOrders: u.totalOrders,
      totalSpent: u.totalSpent,
      joinedDate: u.joinedDate,
      address: u.address,
    }));
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update user role
router.put('/:id/role', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'Role updated successfully', role: updated.role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
