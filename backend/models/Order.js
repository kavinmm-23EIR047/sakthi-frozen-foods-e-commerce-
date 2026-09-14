const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    landmark: { type: String },
    pincode: { type: String },
    city: { type: String },
    state: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        weight: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number },
    deliveryFee: { type: Number },
    convenienceFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Razorpay (Online)' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    razorpayAmount: { type: Number },
    paymentVerifiedAt: { type: Date },
    stockCommitted: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    refundStatus: { type: String, enum: ['None', 'Pending', 'Processed', 'Failed'], default: 'None' },
    razorpayRefundId: { type: String },
    refundedAmount: { type: Number },
    refundedAt: { type: Date },
    paymentExpiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 30 * 60 * 1000);
      },
    },
    isLocked: { type: Boolean, default: false },
    failureReason: { type: String, default: '' },
    followUpStatus: {
      type: String,
      enum: ['Not Contacted', 'Contacted', 'Recovered', 'Lost'],
      default: 'Not Contacted',
    },
    followUpNotes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

orderSchema.index({ customerEmail: 1, createdAt: -1 });
orderSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Order', orderSchema);
