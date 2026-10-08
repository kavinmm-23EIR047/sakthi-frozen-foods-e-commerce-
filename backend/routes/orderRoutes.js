const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { protect, optionalProtect, admin } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const { queueOrderNotifications } = require('../services/notificationService');
const { getDeliveryCalculation } = require('../utils/deliveryRates');
const { buildInvoiceHtml } = require('../services/emailService');
const { generateInvoicePdf } = require('../services/pdfService');
const cacheService = require('../services/cacheService');
const socketService = require('../services/socketService');

const router = express.Router();
const createOrderLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured');
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

async function checkAndAutoHealRazorpayPayment(order) {
  if (!order || order.paymentStatus === 'Paid' || !order.razorpayOrderId) {
    return order;
  }

  try {
    const razorpay = getRazorpay();
    const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
    const capturedPayment = payments?.items?.find((p) => p.status === 'captured');

    if (capturedPayment) {
      const updated = await Order.findOneAndUpdate(
        { _id: order._id, paymentStatus: { $ne: 'Paid' } },
        {
          paymentStatus: 'Paid',
          status: 'Confirmed',
          razorpayPaymentId: capturedPayment.id,
          paymentVerifiedAt: new Date(),
          stockCommitted: true,
          isLocked: false,
          failureReason: null,
        },
        { new: true, runValidators: true }
      );

      if (updated) {
        if (updated.user) {
          await Cart.deleteOne({ userId: updated.user }).catch(() => {});
        }
        void queueOrderNotifications(updated, 'payment.success');
        return updated;
      }
    }
  } catch (err) {
    console.error(`Razorpay status auto-heal check error for order ${order._id}:`, err.message);
  }

  return order;
}

function publicOrder(order) {
  let createdAtDate = new Date();
  if (order.createdAt && !isNaN(new Date(order.createdAt).getTime())) {
    createdAtDate = new Date(order.createdAt);
  }
  
  let paymentExpiresAt;
  if (order.paymentExpiresAt && !isNaN(new Date(order.paymentExpiresAt).getTime())) {
    paymentExpiresAt = new Date(order.paymentExpiresAt).toISOString();
  } else {
    paymentExpiresAt = new Date(createdAtDate.getTime() + 30 * 60 * 1000).toISOString();
  }

  const isOnline = order.paymentMethod === 'Razorpay (Online)';
  const isExpired = isOnline && order.paymentStatus === 'Pending' && Date.now() > new Date(paymentExpiresAt).getTime();
  
  let paymentStatus = order.paymentStatus || 'Pending';
  if (isExpired) paymentStatus = 'Failed';

  let status = order.status || 'Pending';
  if (isExpired || paymentStatus === 'Failed' || order.status === 'Payment Failed') {
    status = 'Payment Failed';
  } else if (order.status === 'Cancelled' || paymentStatus === 'Refunded') {
    status = 'Cancelled';
  } else if (paymentStatus === 'Paid') {
    status = 'Confirmed';
  } else if (paymentStatus === 'Pending') {
    status = 'Awaiting Payment';
  }

  const isLocked = order.isLocked || isExpired || paymentStatus === 'Failed' || status === 'Payment Failed' || status === 'Cancelled';

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
    district: order.district || null,
    state: order.state || null,
    coordinates: order.coordinates || null,
    subtotal: order.subtotal ?? null,
    deliveryFee: order.deliveryFee ?? null,
    convenienceFee: order.convenienceFee ?? 0,
    items: order.items,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    paymentStatus,
    razorpayOrderId: order.razorpayOrderId || null,
    razorpayPaymentId: order.razorpayPaymentId || null,
    refundStatus: order.refundStatus || 'None',
    refundedAmount: order.refundedAmount || null,
    status,
    isLocked,
    failureReason: order.failureReason || (isExpired ? 'Payment window expired (30 minutes elapsed without completion)' : null),
    paymentExpiresAt,
    followUpStatus: order.followUpStatus || 'Not Contacted',
    followUpNotes: order.followUpNotes || '',
    createdAt: createdAtDate.toISOString(),
  };
}

async function autoExpirePendingOrders() {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await Order.updateMany(
      {
        paymentMethod: 'Razorpay (Online)',
        paymentStatus: 'Pending',
        isLocked: { $ne: true },
        $or: [
          { createdAt: { $lte: thirtyMinutesAgo } },
          { paymentExpiresAt: { $lte: new Date() } },
        ],
      },
      {
        $set: {
          paymentStatus: 'Failed',
          status: 'Payment Failed',
          isLocked: true,
          failureReason: 'Payment window expired (30 minutes elapsed without completion)',
        },
      }
    );
  } catch (err) {
    console.error('Error auto-expiring pending orders:', err);
  }
}

function validateCustomer(body) {
  return body.customerName && body.customerEmail && body.customerPhone && body.shippingAddress;
}

const allowedStatusTransitions = {
  Pending: ['Confirmed', 'Payment Failed', 'Cancelled'],
  'Awaiting Payment': ['Confirmed', 'Payment Failed', 'Cancelled'],
  Processing: ['Confirmed', 'Cancelled'],
  Shipped: ['Confirmed', 'Cancelled'],
  Delivered: ['Confirmed', 'Cancelled'],
  Confirmed: ['Cancelled'],
  'Payment Failed': [],
  Cancelled: [],
};

async function commitCashOnDeliveryStock(order) {
  const decremented = [];
  try {
    for (const item of order.items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, isAvailable: { $ne: false }, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!product) {
        throw Object.assign(new Error(`Not enough stock for ${item.name || 'product'}`), { statusCode: 409 });
      }
      decremented.push(item);
    }
  } catch (err) {
    for (const item of decremented) {
      await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }).catch(() => {});
    }
    throw err;
  }

  const updated = await Order.findOneAndUpdate(
    { _id: order._id },
    { paymentStatus: 'Paid', status: 'Confirmed', stockCommitted: true },
    { new: true, runValidators: true }
  );
  return updated || order;
}

router.get('/', protect, admin, async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '20', 10), 1), 100);
    const cacheKey = `sakthi:orders:admin:${page}:${limit}`;

    res.set('Cache-Control', 'private, max-age=15');

    const { data: payload } = await cacheService.getOrSet(cacheKey, async () => {
      const [orders, total] = await Promise.all([
        Order.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Order.countDocuments(),
      ]);
      return { count: orders.length, total, page, totalPages: Math.ceil(total / limit), data: orders.map(publicOrder) };
    }, 30); // 30s cache — admin list stays fresh

    res.json({ success: true, ...payload });
  } catch (error) {
    next(error);
  }
});

router.get('/mine', protect, async (req, res, next) => {
  try {
    const userEmail = (req.user.email || '').toLowerCase();
    const queryConditions = [
      { user: req.user._id },
    ];
    if (userEmail) {
      queryConditions.push({ customerEmail: userEmail });
    }
    const orders = await Order.find({ $or: queryConditions })
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
    if (req.user.role !== 'Admin' && order.customerEmail !== req.user.email) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
    }

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

router.post('/', createOrderLimiter, optionalProtect, async (req, res, next) => {
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
    const products = await Product.find({ _id: { $in: productIds } }).select('_id name weight price variants stock isAvailable').lean();
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
          }).select('_id name weight price variants stock isAvailable').lean();

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

    for (const [productId] of quantitiesByProduct) {
      const product = productMap.get(productId) || (await Product.findById(productId).select('name stock isAvailable').lean());
      if (!product || product.isAvailable === false || (product.stock ?? 0) <= 0) return res.status(409).json({ success: false, error: `${product?.name || 'Product'} is currently out of stock` });
    }

    const coordinates = body.coordinates ? {
      lat: Number(body.coordinates.lat),
      lng: Number(body.coordinates.lng),
      precision: ['area', 'map-search', 'gps'].includes(body.coordinates.precision) ? body.coordinates.precision : 'area',
      accuracyMeters: Number.isFinite(Number(body.coordinates.accuracyMeters)) ? Number(body.coordinates.accuracyMeters) : undefined,
    } : undefined;

    const calc = getDeliveryCalculation({
      subtotal,
      coordinates,
      cityOrDistrictText: body.city,
      state: body.state,
    });
    if (!calc.isServiceable) {
      return res.status(400).json({ success: false, error: 'We could not find a delivery rate for this address. Search a Coimbatore address within 25 km or choose one of the listed delivery cities.' });
    }
    const deliveryFee = calc.fee;
    const convenienceFee = Math.round(subtotal * 0.025 * 100) / 100;
    const totalAmount = Math.round((subtotal + deliveryFee + convenienceFee) * 100) / 100;
    const paymentMethod = 'Razorpay (Online)';
    created = await Order.create({
      orderNumber: `SKT-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
      user: req.user ? req.user._id : undefined,
      customerName: String(body.customerName).trim(),
      customerEmail: String(body.customerEmail || req.user?.email).trim().toLowerCase(),
      customerPhone: String(body.customerPhone || req.user?.phone).trim(),
      shippingAddress: String(body.shippingAddress).trim(),
      landmark: body.landmark ? String(body.landmark).trim() : undefined,
      pincode: body.pincode ? String(body.pincode).trim() : undefined,
      city: body.city ? String(body.city).trim() : undefined,
      district: body.district ? String(body.district).trim() : undefined,
      state: body.state ? String(body.state).trim() : undefined,
      coordinates,
      deliveryZoneId: calc.zoneId,
      deliveryMode: calc.mode,
      distanceKm: calc.distanceKm,
      subtotal,
      deliveryFee,
      convenienceFee,
      items,
      totalAmount,
      paymentMethod,
      status: 'Awaiting Payment',
      paymentStatus: 'Pending',
    });

    let razorpayOrder;
    try {
      razorpayOrder = await getRazorpay().orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: created._id.toString(),
      });
      created.razorpayOrderId = razorpayOrder.id;
      created.razorpayAmount = razorpayOrder.amount;
      await created.save();
    } catch (rzpErr) {
      console.error('Razorpay order creation failed:', rzpErr?.message || rzpErr);
      if (created?._id) {
        await Order.findByIdAndDelete(created._id).catch(() => {});
      }
      const rzpMessage =
        rzpErr?.error?.description ||
        rzpErr?.description ||
        rzpErr?.message ||
        'Razorpay order creation failed';
      return res.status(400).json({
        success: false,
        error: `Razorpay Payment Gateway Error: ${rzpMessage}. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment settings.`,
      });
    }

    // Clear user's active cart in MongoDB upon placing order
    if (req.user?._id) {
      await Cart.deleteOne({ userId: req.user._id }).catch(() => {});
    }

    await cacheService.del('sakthi:users:all');
    void queueOrderNotifications(created, 'order.created');
    socketService.emitEvent('newOrder', publicOrder(created)); // Emit real-time event

    res.status(201).json({
      success: true,
      data: publicOrder(created),
      razorpayOrderId: razorpayOrder.id,
      razorpayAmount: razorpayOrder.amount,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
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
      if (order.status === 'Cancelled' || order.status === 'Payment Failed' || order.paymentStatus === 'Paid') {
        throw Object.assign(new Error('This order has already been paid/confirmed and can only be cancelled by contacting support'), { statusCode: 409 });
      }
      if (order.stockCommitted) {
        for (const item of order.items) {
          await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }, { session });
        }
      }
      cancelled = await Order.findOneAndUpdate(
        { _id: order._id },
        { status: 'Cancelled', isLocked: true, stockCommitted: false },
        { new: true, session, runValidators: true }
      );
    });
    await cacheService.del('sakthi:users:all');
    void queueOrderNotifications(cancelled, 'order.cancelled');
    res.json({ success: true, data: publicOrder(cancelled) });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

router.post('/:id/retry-payment', protect, async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (req.user.role !== 'Admin' && order.customerEmail !== req.user.email) {
      return res.status(403).json({ success: false, error: 'Not authorized to retry payment for this order' });
    }

    if (order.paymentStatus === 'Paid' || order.status === 'Confirmed') {
      return res.json({
        success: true,
        alreadyPaid: true,
        data: publicOrder(order),
        message: 'This order is already paid and confirmed.',
      });
    }

    // Auto-check Razorpay API first: did user already pay?
    if (order.razorpayOrderId) {
      const healed = await checkAndAutoHealRazorpayPayment(order);
      if (healed.paymentStatus === 'Paid' || healed.status === 'Confirmed') {
        return res.json({
          success: true,
          alreadyPaid: true,
          data: publicOrder(healed),
          message: 'Payment was already verified and captured from Razorpay!',
        });
      }
      order = healed;
    }

    // Check if 30 minutes have elapsed
    const createdAtTime = new Date(order.createdAt).getTime();
    const isPast30Mins = Date.now() > createdAtTime + 30 * 60 * 1000;

    if (isPast30Mins || order.isLocked || order.paymentStatus === 'Failed' || order.status === 'Payment Failed') {
      // Mark permanently as Payment Failed and locked
      order.paymentStatus = 'Failed';
      order.status = 'Payment Failed';
      order.isLocked = true;
      order.failureReason = 'Payment window expired (30-minute grace period exceeded).';
      await order.save();

      return res.status(400).json({
        success: false,
        error: 'Payment window expired after 30 minutes. This order is marked as Payment Failed. Please place a new order.',
      });
    }

    // Still within 30 minutes: Refresh or create Razorpay order if needed
    let razorpayOrderId = order.razorpayOrderId;
    let razorpayAmount = order.razorpayAmount || Math.round(order.totalAmount * 100);

    if (!razorpayOrderId) {
      const razorpayOrder = await getRazorpay().orders.create({
        amount: razorpayAmount,
        currency: 'INR',
        receipt: order._id.toString(),
      });
      order.razorpayOrderId = razorpayOrder.id;
      order.razorpayAmount = razorpayOrder.amount;
      await order.save();
      razorpayOrderId = razorpayOrder.id;
      razorpayAmount = razorpayOrder.amount;
    }

    res.json({
      success: true,
      alreadyPaid: false,
      data: publicOrder(order),
      razorpayOrderId,
      razorpayAmount,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/follow-up', protect, admin, async (req, res, next) => {
  try {
    const { followUpStatus, followUpNotes } = req.body;
    const allowedStatuses = ['Not Contacted', 'Contacted', 'Recovered', 'Lost'];
    if (followUpStatus && !allowedStatuses.includes(followUpStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid follow-up status' });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...(followUpStatus ? { followUpStatus } : {}),
        ...(typeof followUpNotes === 'string' ? { followUpNotes } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: publicOrder(updated) });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const allowedStatuses = ['Confirmed', 'Cancelled', 'Payment Failed'];
    if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ success: false, error: 'Invalid order status. Status can only be Confirmed or Cancelled.' });
    const existing = await Order.findById(req.params.id).select('status paymentStatus isLocked createdAt paymentMethod items stockCommitted');
    if (!existing) return res.status(404).json({ success: false, error: 'Order not found' });

    // Lock condition: After 30 minutes or if failed/locked, do NOT make any edit option
    const isExpired = existing.paymentMethod === 'Razorpay (Online)' && existing.paymentStatus === 'Pending' && (Date.now() > new Date(existing.createdAt).getTime() + 30 * 60 * 1000);
    if (existing.isLocked || existing.paymentStatus === 'Failed' || existing.status === 'Payment Failed' || isExpired) {
      if (isExpired && existing.paymentStatus !== 'Failed') {
        await Order.findByIdAndUpdate(existing._id, { paymentStatus: 'Failed', status: 'Payment Failed', isLocked: true });
      }
      return res.status(400).json({
        success: false,
        error: 'This order is marked as Payment Failed and is permanently locked. No status edits are allowed.',
      });
    }

    // Payment Pending condition: Do not allow status progression to Confirmed until payment is Paid
    if (existing.paymentMethod === 'Razorpay (Online)' && existing.paymentStatus === 'Pending') {
      if (req.body.status !== 'Cancelled') {
        return res.status(400).json({
          success: false,
          error: 'Online payment is currently Awaiting Payment (30-minute grace window). Status will automatically update to Confirmed once customer completes payment.',
        });
      }
    }

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
          cancelled = await Order.findOneAndUpdate({ _id: current._id }, { status: 'Cancelled', isLocked: true, stockCommitted: false }, { new: true, session, runValidators: true });
        });
      } finally {
        await session.endSession();
      }
      if (!cancelled) return res.status(409).json({ success: false, error: 'Order was already changed' });
      await cacheService.del('sakthi:users:all');
      void queueOrderNotifications(cancelled, 'order.cancelled');
      return res.json({ success: true, data: publicOrder(cancelled) });
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Order not found' });
    await cacheService.del('sakthi:users:all');
    void queueOrderNotifications(updated, `order.${req.body.status.toLowerCase()}`);
    
    const pub = publicOrder(updated);
    socketService.emitEvent('orderUpdated', pub); // Emit real-time event
    
    res.json({ success: true, data: pub });
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
      const refunded = await Order.findByIdAndUpdate(order._id, { paymentStatus: 'Refunded', refundStatus: 'Processed', razorpayRefundId: refund.id, refundedAmount: refund.amount, refundedAt: new Date(), status: 'Cancelled', isLocked: true }, { new: true, runValidators: true });
      await cacheService.del('sakthi:users:all');
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

// @desc    Get printable / downloadable PDF invoice for an order
// @route   GET /api/orders/:id/invoice
// @access  Private (order owner, admin, or signed email link)
router.get('/:id/invoice', optionalProtect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    let isAuthorized = false;

    // 1. Authenticated user check
    if (req.user && (req.user.role === 'Admin' || order.customerEmail === req.user.email)) {
      isAuthorized = true;
    }

    // 2. Token in query parameter (from email links)
    const token = req.query.token;
    if (!isAuthorized && token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sakthi_jwt_secret');
        if (
          decoded.role === 'Admin' ||
          decoded.email === order.customerEmail ||
          decoded.orderId === order._id.toString() ||
          decoded.id === order.user?.toString()
        ) {
          isAuthorized = true;
        }
      } catch (err) {
        // invalid token fallthrough
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this invoice. Please sign in or use the secure invoice link from your confirmation email.' });
    }

    // Return real, clean, high-contrast PDF document stream
    const pdfBuffer = await generateInvoicePdf(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Invoice-${order.orderNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

router.autoExpirePendingOrders = autoExpirePendingOrders;
module.exports = router;
