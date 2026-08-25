const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyIdHere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecretHere',
});

// GET all orders (with optional email filter)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    const query = {};
    if (email) {
      query.customerEmail = email;
    }
    const rawOrders = await Order.find(query).sort({ createdAt: -1 });
    const orders = rawOrders.map((o) => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      shippingAddress: o.shippingAddress,
      items: o.items,
      totalAmount: o.totalAmount,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus || 'Pending',
      razorpayPaymentId: o.razorpayPaymentId || null,
      status: o.status,
      createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
    }));
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new order
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const orderNumber = `SKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = Number(body.totalAmount);
    
    // 1. Create order in database as Pending
    const created = await Order.create({
      orderNumber,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      items: body.items,
      totalAmount,
      paymentMethod: 'Razorpay (Online)',
      status: 'Pending',
      paymentStatus: 'Pending'
    });

    // 2. Create Razorpay order
    const options = {
      amount: Math.round(totalAmount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: created._id.toString(),
    };
    
    const razorpayOrder = await razorpay.orders.create(options);
    
    // 3. Update DB order with Razorpay Order ID
    created.razorpayOrderId = razorpayOrder.id;
    await created.save();

    res.status(201).json({
      success: true,
      data: {
        id: created._id.toString(),
        orderNumber: created.orderNumber,
        customerName: created.customerName,
        customerEmail: created.customerEmail,
        customerPhone: created.customerPhone,
        shippingAddress: created.shippingAddress,
        items: created.items,
        totalAmount: created.totalAmount,
        paymentMethod: created.paymentMethod,
        paymentStatus: created.paymentStatus,
        status: created.status,
        createdAt: created.createdAt.toISOString(),
      },
      razorpayOrderId: razorpayOrder.id,
      razorpayAmount: options.amount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update order status
router.put('/:id', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({
      success: true,
      data: {
        id: updated._id.toString(),
        orderNumber: updated.orderNumber,
        customerName: updated.customerName,
        customerEmail: updated.customerEmail,
        customerPhone: updated.customerPhone,
        shippingAddress: updated.shippingAddress,
        items: updated.items,
        totalAmount: updated.totalAmount,
        paymentMethod: updated.paymentMethod,
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
