const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_USERS } = require('../seedData');

const seedHandler = async (req, res) => {
  try {
    await Product.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});

    await Product.insertMany(INITIAL_PRODUCTS);
    await Order.insertMany(INITIAL_ORDERS);
    await User.create(INITIAL_USERS);

    res.json({
      success: true,
      message: 'Successfully seeded MongoDB Atlas with all 33 Vegan Meat products, mock orders, and users!',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET/POST seed database with initial products, orders, users
router.get('/', seedHandler);
router.post('/', seedHandler);

module.exports = router;
