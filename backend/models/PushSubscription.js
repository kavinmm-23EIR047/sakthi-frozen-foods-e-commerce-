const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    keys: {
      p256dh: { type: String, required: true, trim: true },
      auth: { type: String, required: true, trim: true },
    },
    expirationTime: {
      type: Date,
      default: null,
    },
    userAgent: {
      type: String,
      default: '',
    },
    deviceType: {
      type: String,
      enum: ['Mobile', 'Tablet', 'Desktop', 'Unknown'],
      default: 'Unknown',
    },
    preferences: {
      orderUpdates: { type: Boolean, default: true },
      paymentUpdates: { type: Boolean, default: true },
      deliveryUpdates: { type: Boolean, default: true },
      promotional: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastSuccessAt: {
      type: Date,
      default: null,
    },
    lastFailureAt: {
      type: Date,
      default: null,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
