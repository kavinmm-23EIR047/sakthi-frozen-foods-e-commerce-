const Notification = require('../models/Notification');

const MAX_ATTEMPTS = 3;
const SENDING_LEASE_MS = 2 * 60 * 1000;

function isRetryableError(error) {
  if (error?.retryable === false) return false;
  const status = error?.statusCode || error?.status;
  return !status || status === 408 || status === 429 || status >= 500;
}

function retryDelay(attempt) {
  return (150 * (2 ** Math.max(attempt - 1, 0))) + Math.floor(Math.random() * 100);
}

function providerError(message, statusCode, retryable = undefined) {
  const error = new Error(message);
  if (statusCode) error.statusCode = statusCode;
  if (retryable !== undefined) error.retryable = retryable;
  return error;
}

async function sendEmail({ recipient, subject, message }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw providerError('Email provider is not configured', 503, false);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [recipient], subject, text: message }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw providerError(`Email provider returned ${response.status}`, response.status);
}

async function sendTelegram({ message }) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) throw providerError('Telegram provider is not configured', 503, false);
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message }),
    signal: AbortSignal.timeout(10000),
  });
  let result;
  try {
    result = await response.json();
  } catch (error) {
    result = null;
  }
  if (!response.ok || result?.ok === false) {
    throw providerError(`Telegram provider returned ${response.status}`, response.status || 400, response.status === 408 || response.status === 429 || response.status >= 500);
  }
}

async function deliverNotification(notificationId) {
  const now = new Date();
  const staleSendingBefore = new Date(now.getTime() - SENDING_LEASE_MS);
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      $or: [
        { status: { $in: ['Pending', 'Failed'] } },
        { status: 'Sending', sendingAt: { $lt: staleSendingBefore } },
      ],
      attempts: { $lt: MAX_ATTEMPTS },
      $and: [{ $or: [{ nextAttemptAt: { $exists: false } }, { nextAttemptAt: null }, { nextAttemptAt: { $lte: now } }] }],
    },
    { $set: { status: 'Sending', sendingAt: now, lastAttemptAt: now }, $inc: { attempts: 1 } },
    { new: true }
  );
  if (!notification) return null;

  try {
    if (notification.channel === 'telegram') await sendTelegram(notification);
    else await sendEmail(notification);
    return Notification.findByIdAndUpdate(notification._id, {
      $set: { status: 'Sent', sentAt: new Date() },
      $unset: { lastError: 1, failureReason: 1, nextAttemptAt: 1, sendingAt: 1 },
    }, { new: true });
  } catch (error) {
    const retryable = isRetryableError(error);
    const canRetry = retryable && notification.attempts < MAX_ATTEMPTS;
    const update = {
      $set: {
        status: 'Failed',
        lastError: error.message,
        failureReason: error.message,
        sendingAt: undefined,
        ...(canRetry ? { nextAttemptAt: new Date(Date.now() + retryDelay(notification.attempts)) } : {}),
      },
    };
    update.$unset = { sendingAt: 1 };
    if (!canRetry) update.$unset.nextAttemptAt = 1;
    await Notification.findByIdAndUpdate(notification._id, update);
    console.error(JSON.stringify({ type: 'notification_failure', notificationKey: notification.notificationKey, channel: notification.channel, attempts: notification.attempts, retryable, error: error.message }));
    return Notification.findById(notification._id);
  }
}

async function dispatchNotification({ notificationKey, eventType, channel, recipient, subject, message, orderId }) {
  let notification;
  try {
    notification = await Notification.findOneAndUpdate(
      { notificationKey },
      { $setOnInsert: { notificationKey, idempotencyKey: notificationKey, eventType, channel, recipient, subject, message, orderId, status: 'Pending', attempts: 0 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code === 11000) notification = await Notification.findOne({ notificationKey });
    else throw error;
  }
  if (!notification || notification.status === 'Sent') return notification;
  return deliverNotification(notification._id);
}

async function retryDueNotifications(batchSize = 20) {
  let processed = 0;
  for (let index = 0; index < batchSize; index += 1) {
    const now = new Date();
    const staleSendingBefore = new Date(now.getTime() - SENDING_LEASE_MS);
    const due = await Notification.findOne({
      $or: [
        { status: { $in: ['Pending', 'Failed'] } },
        { status: 'Sending', sendingAt: { $lt: staleSendingBefore } },
      ],
      attempts: { $lt: MAX_ATTEMPTS },
      $or: [{ nextAttemptAt: { $exists: false } }, { nextAttemptAt: null }, { nextAttemptAt: { $lte: now } }],
    }).sort({ createdAt: 1 }).select('_id').lean();
    if (!due) break;
    if (await deliverNotification(due._id)) processed += 1;
  }
  return processed;
}

function orderMessage(order, eventType) {
  return [`Sakthi Frozen Foods: ${eventType}`, `Order: ${order.orderNumber}`, `Customer: ${order.customerName}`, `Amount: INR ${order.totalAmount}`, `Payment: ${order.paymentStatus}`, `Status: ${order.status}`].join('\n');
}

function queueOrderNotifications(order, eventType) {
  const message = orderMessage(order, eventType);
  const jobs = [dispatchNotification({ notificationKey: `${order._id}:${eventType}:customer-email`, eventType, channel: 'customer-email', recipient: order.customerEmail, subject: `Sakthi Frozen Foods - ${eventType} - ${order.orderNumber}`, message, orderId: order._id })];
  if (process.env.ADMIN_EMAIL) jobs.push(dispatchNotification({ notificationKey: `${order._id}:${eventType}:admin-email`, eventType, channel: 'admin-email', recipient: process.env.ADMIN_EMAIL, subject: `Sakthi Frozen Foods admin alert - ${eventType}`, message, orderId: order._id }));
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) jobs.push(dispatchNotification({ notificationKey: `${order._id}:${eventType}:telegram`, eventType, channel: 'telegram', recipient: process.env.TELEGRAM_CHAT_ID, subject: eventType, message, orderId: order._id }));
  return Promise.allSettled(jobs);
}

module.exports = { MAX_ATTEMPTS, isRetryableError, retryDelay, sendEmail, sendTelegram, deliverNotification, dispatchNotification, retryDueNotifications, queueOrderNotifications };
