const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        weight: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Razorpay (Online)' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
