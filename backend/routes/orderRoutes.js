const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const { queueOrderNotifications } = require('../services/notificationService');

const router = express.Router();
const createOrderLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured');
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

function publicOrder(order) {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    landmark: order.landmark || null,
    pincode: order.pincode || null,
    city: order.city || null,
    state: order.state || null,
    coordinates: order.coordinates || null,
    subtotal: order.subtotal ?? null,
    deliveryFee: order.deliveryFee ?? null,
    convenienceFee: order.convenienceFee ?? 0,
    items: order.items,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus || 'Pending',
    razorpayPaymentId: order.razorpayPaymentId || null,
    refundStatus: order.refundStatus || 'None',
    refundedAmount: order.refundedAmount || null,
    status: order.status,
    createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
  };
}

function validateCustomer(body) {
  return body.customerName && body.customerEmail && body.customerPhone && body.shippingAddress;
}

const allowedStatusTransitions = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

async function commitCashOnDeliveryStock(order) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const committed = await Order.findOneAndUpdate(
        { _id: order._id, paymentStatus: 'Pending', stockCommitted: false },
        { paymentStatus: 'Paid', stockCommitted: true },
        { new: true, session, runValidators: true }
      );
      if (!committed) throw Object.assign(new Error('Order was already processed'), { statusCode: 409 });

      for (const item of order.items) {
        const result = await Product.updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session }
        );
        if (result.modifiedCount !== 1) throw Object.assign(new Error(`Insufficient stock for ${item.name}`), { statusCode: 409 });
      }
    });
  } finally {
    await session.endSession();
  }
  return Order.findById(order._id);
}

router.get('/', protect, admin, async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '20', 10), 1), 100);
    const [orders, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments(),
    ]);
    res.json({ success: true, count: orders.length, total, page, totalPages: Math.ceil(total / limit), data: orders.map(publicOrder) });
  } catch (error) {
    next(error);
  }
});

router.get('/mine', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ customerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .select('-razorpaySignature')
      .lean();
    res.json({ success: true, count: orders.length, data: orders.map(publicOrder) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).select('-razorpaySignature').lean();
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (req.user.role !== 'Admin' && order.customerEmail !== req.user.email) return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
    res.json({ success: true, data: publicOrder(order) });
  } catch (error) {
    next(error);
  }
});

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanBaseName(name) {
  return String(name || '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/\s*-\s*Retail\s*Pack\s*/i, '')
    .replace(/\s+Retail\s+Pack\s*/i, '')
    .trim()
    .toLowerCase();
}

function normalizeWeight(w) {
  return String(w || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/grm|grams?|gm/i, 'g');
}

router.post('/', createOrderLimiter, async (req, res, next) => {
  let created;
  try {
    const body = req.body || {};
    if (!validateCustomer(body) || !Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
      return res.status(400).json({ success: false, error: 'Customer details and at least one item are required' });
    }

    const requestedItems = body.items.map((item) => ({
      productId: String(item.productId || ''),
      weight: String(item.weight || ''),
      quantity: Number(item.quantity),
    }));
    if (requestedItems.some((item) => !mongoose.isValidObjectId(item.productId) || !item.weight || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50)) {
      return res.status(400).json({ success: false, error: 'Invalid order items' });
    }

    const productIds = [...new Set(requestedItems.map((item) => item.productId))];
    const products = await Product.find({ _id: { $in: productIds } }).select('_id name weight price variants stock').lean();
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const quantitiesByProduct = new Map();
    let subtotal = 0;

    const items = await Promise.all(requestedItems.map(async (requested) => {
      let product = productMap.get(requested.productId);
      if (!product) throw Object.assign(new Error('One or more products are unavailable'), { statusCode: 400 });

      let variant = product.variants?.find((candidate) => normalizeWeight(candidate.weight) === normalizeWeight(requested.weight));
      let isBaseWeight = normalizeWeight(product.weight) === normalizeWeight(requested.weight);

      if (!variant && !isBaseWeight) {
        // Fallback: Check companion product (e.g. Retail vs Regular pack)
        const baseName = cleanBaseName(product.name);
        if (baseName) {
          const companion = await Product.findOne({
            _id: { $ne: product._id },
            name: new RegExp('^' + escapeRegex(baseName), 'i'),
          }).select('_id name weight price variants stock').lean();

          if (companion) {
            const compVariant = companion.variants?.find((candidate) => normalizeWeight(candidate.weight) === normalizeWeight(requested.weight));
            const compBase = normalizeWeight(companion.weight) === normalizeWeight(requested.weight);
            if (compVariant || compBase) {
              product = companion;
              variant = compVariant;
              isBaseWeight = compBase;
            }
          }
        }
      }

      if (!variant && !isBaseWeight) {
        throw Object.assign(new Error(`Invalid weight for ${product.name}`), { statusCode: 400 });
      }

      const price = variant ? variant.price : product.price;
      const targetId = product._id.toString();
      quantitiesByProduct.set(targetId, (quantitiesByProduct.get(targetId) || 0) + requested.quantity);
      subtotal += price * requested.quantity;
      return { productId: targetId, name: product.name, weight: requested.weight, price, quantity: requested.quantity };
    }));

    for (const [productId, quantity] of quantitiesByProduct) {
      const product = productMap.get(productId) || (await Product.findById(productId).select('name stock').lean());
      if (quantity > (product?.stock ?? 0)) return res.status(409).json({ success: false, error: `Insufficient stock for ${product?.name || 'product'}` });
    }

    const deliveryFee = subtotal >= 999 ? 0 : 60;
    const convenienceFee = Math.round(subtotal * 0.025 * 100) / 100;
    const totalAmount = Math.round((subtotal + deliveryFee + convenienceFee) * 100) / 100;
    const paymentMethod = body.paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Razorpay (Online)';
    created = await Order.create({
      orderNumber: `SKT-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
      customerName: String(body.customerName).trim(),
      customerEmail: String(body.customerEmail).trim().toLowerCase(),
      customerPhone: String(body.customerPhone).trim(),
      shippingAddress: String(body.shippingAddress).trim(),
      landmark: body.landmark ? String(body.landmark).trim() : undefined,
      pincode: body.pincode ? String(body.pincode).trim() : undefined,
      city: body.city ? String(body.city).trim() : undefined,
      state: body.state ? String(body.state).trim() : undefined,
      coordinates: body.coordinates ? { lat: Number(body.coordinates.lat), lng: Number(body.coordinates.lng) } : undefined,
      subtotal,
      deliveryFee,
      convenienceFee,
      items,
      totalAmount,
      paymentMethod,
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    let razorpayOrder;
    if (paymentMethod === 'Razorpay (Online)') {
      razorpayOrder = await getRazorpay().orders.create({ amount: Math.round(totalAmount * 100), currency: 'INR', receipt: created._id.toString() });
      created.razorpayOrderId = razorpayOrder.id;
      created.razorpayAmount = razorpayOrder.amount;
      await created.save();
    } else {
      created = await commitCashOnDeliveryStock(created);
    }

    void queueOrderNotifications(created, 'order.created');
    res.status(201).json({
      success: true,
      data: publicOrder(created),
      ...(razorpayOrder ? { razorpayOrderId: razorpayOrder.id, razorpayAmount: razorpayOrder.amount, razorpayKeyId: process.env.RAZORPAY_KEY_ID } : {}),
    });
  } catch (error) {
    if (created?._id && !created.razorpayOrderId) await Order.findByIdAndDelete(created._id).catch(() => {});
    next(error);
  }
});

router.post('/:id/cancel', protect, async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    let cancelled;
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);
      if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
      if (req.user.role !== 'Admin' && order.customerEmail !== req.user.email) throw Object.assign(new Error('Not authorized to cancel this order'), { statusCode: 403 });
      if (order.status !== 'Pending' || (order.paymentStatus === 'Paid' && order.paymentMethod !== 'Cash on Delivery')) throw Object.assign(new Error('This order can no longer be cancelled'), { statusCode: 409 });
      if (order.stockCommitted) {
        for (const item of order.items) await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }, { session });
      }
      cancelled = await Order.findOneAndUpdate(
        { _id: order._id, status: 'Pending' },
        { status: 'Cancelled', stockCommitted: false },
        { new: true, session, runValidators: true }
      );
    });
    void queueOrderNotifications(cancelled, 'order.cancelled');
    res.json({ success: true, data: publicOrder(cancelled) });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ success: false, error: 'Invalid order status' });
    const existing = await Order.findById(req.params.id).select('status');
    if (!existing) return res.status(404).json({ success: false, error: 'Order not found' });
    if (!allowedStatusTransitions[existing.status].includes(req.body.status)) return res.status(409).json({ success: false, error: `Cannot change order from ${existing.status} to ${req.body.status}` });
    if (req.body.status === 'Cancelled') {
      const session = await mongoose.startSession();
      let cancelled;
      try {
        await session.withTransaction(async () => {
          const current = await Order.findById(req.params.id).session(session);
          if (!current) return;
          if (current.paymentMethod === 'Razorpay (Online)' && current.paymentStatus === 'Paid') throw Object.assign(new Error('Use the refund endpoint before cancelling a paid Razorpay order'), { statusCode: 409 });
          if (current.stockCommitted) {
            for (const item of current.items) await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }, { session });
          }
          cancelled = await Order.findOneAndUpdate({ _id: current._id, status: current.status }, { status: 'Cancelled', stockCommitted: false }, { new: true, session, runValidators: true });
        });
      } finally {
        await session.endSession();
      }
      if (!cancelled) return res.status(409).json({ success: false, error: 'Order was already changed' });
      void queueOrderNotifications(cancelled, 'order.cancelled');
      return res.json({ success: true, data: publicOrder(cancelled) });
    }
    const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Order not found' });
    void queueOrderNotifications(updated, `order.${req.body.status.toLowerCase()}`);
    res.json({ success: true, data: publicOrder(updated) });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/refund', protect, admin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.paymentMethod !== 'Razorpay (Online)' || order.paymentStatus !== 'Paid' || !order.razorpayPaymentId) return res.status(409).json({ success: false, error: 'Only captured Razorpay orders can be refunded' });
    if (order.refundStatus === 'Processed' || order.refundStatus === 'Pending') return res.status(409).json({ success: false, error: 'Refund is already processed or pending' });
    const reserved = await Order.findOneAndUpdate({ _id: order._id, paymentStatus: 'Paid', refundStatus: 'None' }, { refundStatus: 'Pending' }, { new: true });
    if (!reserved) return res.status(409).json({ success: false, error: 'Refund is already being processed' });
    try {
      const refund = await getRazorpay().payments.refund(order.razorpayPaymentId, { amount: Math.round(order.totalAmount * 100), notes: { orderId: order._id.toString() } });
      const refunded = await Order.findByIdAndUpdate(order._id, { paymentStatus: 'Refunded', refundStatus: 'Processed', razorpayRefundId: refund.id, refundedAmount: refund.amount, refundedAt: new Date(), status: 'Cancelled' }, { new: true, runValidators: true });
      void queueOrderNotifications(refunded, 'payment.refunded');
      return res.json({ success: true, data: publicOrder(refunded) });
    } catch (error) {
      await Order.findByIdAndUpdate(order._id, { refundStatus: 'Failed' });
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;