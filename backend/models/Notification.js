const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationKey: { type: String, required: true, unique: true },
  idempotencyKey: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  channel: { type: String, enum: ['customer-email', 'admin-email', 'telegram'], required: true },
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  status: { type: String, enum: ['Pending', 'Sending', 'Sent', 'Failed'], default: 'Pending' },
  attempts: { type: Number, default: 0 },
  sendingAt: { type: Date },
  lastAttemptAt: { type: Date },
  nextAttemptAt: { type: Date },
  sentAt: { type: Date },
  lastError: { type: String },
  failureReason: { type: String },
}, { timestamps: true });

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ orderId: 1, eventType: 1 });
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ status: 1, nextAttemptAt: 1, createdAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
