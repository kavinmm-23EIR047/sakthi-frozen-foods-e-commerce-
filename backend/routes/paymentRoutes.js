const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');

// POST verify payment signature
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecretHere';

    // Verify signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      // Signature mismatch - potential tampering
      // Update order status to Failed if you want, but for now just return error
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Failed' });
      return res.status(400).json({ success: false, error: 'Transaction not legit!' });
    }

    // Signature verified
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus: 'Paid',
        status: 'Processing', // Move to processing after payment
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
