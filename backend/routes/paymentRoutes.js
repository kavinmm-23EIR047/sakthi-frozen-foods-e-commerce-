const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const PaymentEvent = require('../models/PaymentEvent');
const { queueOrderNotifications } = require('../services/notificationService');

const router = express.Router();

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error('Razorpay credentials are not configured');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

function signaturesMatch(expected, actual) {
  const expectedBuffer = Buffer.from(expected || '', 'utf8');
  const actualBuffer = Buffer.from(actual || '', 'utf8');
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function isRetryable(error) {
  const status = error.statusCode || error.status;
  return !status || status === 408 || status === 429 || status >= 500;
}

async function withRetry(operation, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === attempts || !isRetryable(error)) throw error;
      const delay = (100 * (2 ** (attempt - 1))) + Math.floor(Math.random() * 100);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function fetchVerifiedPayment(razorpayOrderId, razorpayPaymentId, expectedAmount) {
  const razorpay = getRazorpay();
  const [razorpayOrder, payment] = await Promise.all([
    withRetry(() => razorpay.orders.fetch(razorpayOrderId)),
    withRetry(() => razorpay.payments.fetch(razorpayPaymentId)),
  ]);
  if (
    razorpayOrder.id !== razorpayOrderId ||
    razorpayOrder.currency !== 'INR' ||
    razorpayOrder.amount !== expectedAmount ||
    payment.order_id !== razorpayOrderId ||
    payment.amount !== expectedAmount ||
    payment.currency !== 'INR' ||
    payment.status !== 'captured'
  ) {
    const error = new Error('Payment amount or status could not be verified');
    error.statusCode = 400;
    throw error;
  }
  return payment;
}

async function markPaymentCaptured({ razorpayOrderId, razorpayPaymentId, razorpaySignature, eventId, eventType }) {
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    const error = new Error('Payment order not found');
    error.statusCode = 404;
    throw error;
  }

  if (order.paymentStatus === 'Paid') {
    if (order.razorpayPaymentId === razorpayPaymentId) return order;
    const error = new Error('This order has already been paid');
    error.statusCode = 409;
    throw error;
  }

  await fetchVerifiedPayment(razorpayOrderId, razorpayPaymentId, Math.round(order.totalAmount * 100));
  const session = await mongoose.startSession();
  let updatedOrder;
  try {
    await session.withTransaction(async () => {
      if (eventId) {
        await PaymentEvent.create([{ eventId, eventType, razorpayPaymentId }], { session });
      }

      updatedOrder = await Order.findOneAndUpdate(
        { _id: order._id, paymentStatus: 'Pending', stockCommitted: false },
        { razorpayPaymentId, razorpaySignature, paymentStatus: 'Paid', status: 'Processing', paymentVerifiedAt: new Date(), stockCommitted: true },
        { new: true, session, runValidators: true }
      );
      if (!updatedOrder) return;

      for (const item of updatedOrder.items) {
        const result = await Product.updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session }
        );
        if (result.modifiedCount !== 1) {
          const error = new Error(`Insufficient stock for ${item.name}`);
          error.statusCode = 409;
          throw error;
        }
      }
    });
  } catch (error) {
    if (error.code === 11000 && eventId) return Order.findOne({ razorpayOrderId });
    throw error;
  } finally {
    await session.endSession();
  }

  if (!updatedOrder) {
    const current = await Order.findById(order._id);
    if (current?.paymentStatus === 'Paid' && current.razorpayPaymentId === razorpayPaymentId) return current;
    const error = new Error('Payment was already processed');
    error.statusCode = 409;
    throw error;
  }
  return updatedOrder;
}

router.post('/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body || {};
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) return res.status(400).json({ success: false, error: 'Incomplete payment response' });

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
    if (!signaturesMatch(expectedSignature, razorpaySignature)) return res.status(400).json({ success: false, error: 'Payment verification failed' });

    const updated = await markPaymentCaptured({ razorpayOrderId, razorpayPaymentId, razorpaySignature, eventType: 'client.payment.verify' });
    void queueOrderNotifications(updated, 'payment.success');
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    if (!webhookSecret || !signature || !req.rawBody) return res.status(400).json({ success: false, error: 'Invalid webhook configuration' });

    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(req.rawBody).digest('hex');
    if (!signaturesMatch(expectedSignature, signature)) return res.status(400).json({ success: false, error: 'Invalid webhook signature' });

    const eventType = req.body?.event;
    const eventId = req.headers['x-razorpay-event-id'] || `${eventType}:${req.body?.payload?.payment?.entity?.id || 'unknown'}`;
    const payment = req.body?.payload?.payment?.entity;
    if (!payment?.id || !payment.order_id) return res.status(400).json({ success: false, error: 'Unsupported webhook payload' });

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      await markPaymentCaptured({ razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id, eventId, eventType });
    } else if (eventType === 'payment.failed') {
      const verifiedPayment = await withRetry(() => getRazorpay().payments.fetch(payment.id));
      if (verifiedPayment.order_id !== payment.order_id || verifiedPayment.status !== 'failed') return res.status(400).json({ success: false, error: 'Payment could not be verified' });
      await PaymentEvent.updateOne({ eventId }, { $setOnInsert: { eventId, eventType, razorpayPaymentId: payment.id } }, { upsert: true });
      const failedOrder = await Order.findOneAndUpdate({ razorpayOrderId: payment.order_id, paymentStatus: 'Pending' }, { $set: { paymentStatus: 'Failed' } }, { new: true });
      if (failedOrder) void queueOrderNotifications(failedOrder, 'payment.failed');
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
