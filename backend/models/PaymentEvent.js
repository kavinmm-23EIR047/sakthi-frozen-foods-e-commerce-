const mongoose = require('mongoose');

const paymentEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  razorpayPaymentId: { type: String },
  processedAt: { type: Date, default: Date.now },
}, { timestamps: true });

paymentEventSchema.index({ razorpayPaymentId: 1 });

module.exports = mongoose.model('PaymentEvent', paymentEventSchema);