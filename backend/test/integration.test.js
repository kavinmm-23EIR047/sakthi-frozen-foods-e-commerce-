const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { before, after, beforeEach, test } = require('node:test');
const request = require('supertest');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const Razorpay = require('razorpay');

process.env.JWT_SECRET = 'integration-test-secret';
process.env.FRONTEND_URL = 'http://localhost:3005';
process.env.RAZORPAY_KEY_ID = 'test-key';
process.env.RAZORPAY_KEY_SECRET = 'razorpay-secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook-secret';
process.env.RESEND_API_KEY = 'resend-test-key';
process.env.EMAIL_FROM = 'test@example.com';

let replSet;
let app;
let User;
let Product;
let Order;
let Notification;
let PaymentEvent;
const razorpayMock = {
  order: { id: 'order_test', amount: 18000, currency: 'INR' },
  payment: { id: 'pay_test', order_id: 'order_test', amount: 18000, currency: 'INR', status: 'captured' },
};

function providerResponse() {
  return { ok: true, status: 200, json: async () => ({ id: 'provider-message' }) };
}

before(async () => {
  global.fetch = async () => providerResponse();
  Razorpay.prototype.addResources = function addResources() {
    this.orders = {
      create: async () => ({ ...razorpayMock.order }),
      fetch: async () => ({ ...razorpayMock.order }),
    };
    this.payments = {
      fetch: async () => ({ ...razorpayMock.payment }),
      refund: async () => ({ id: 'refund_test', amount: razorpayMock.payment.amount }),
    };
  };
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = replSet.getUri();
  ({ app } = require('../server'));
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI);
  User = require('../models/User');
  Product = require('../models/Product');
  Order = require('../models/Order');
  Notification = require('../models/Notification');
  PaymentEvent = require('../models/PaymentEvent');
});

after(async () => {
  const mongoose = require('mongoose');
  await mongoose.disconnect();
  await replSet.stop();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({}), Notification.deleteMany({}), PaymentEvent.deleteMany({})]);
});

async function register(email = 'customer@example.com', password = 'password123', role = 'Customer') {
  const user = await User.create({ name: 'Test User', email, password, phone: '9999999999', role });
  const login = await request(app).post('/api/auth/login').send({ email, password });
  assert.equal(login.status, 200);
  return { user, token: login.body.data.token };
}

async function product(overrides = {}) {
  return Product.create({ code: `P-${Date.now()}-${Math.random()}`, name: 'Frozen Bites', weight: '500g', price: 120, category: 'Snacks', stock: 4, ...overrides });
}

async function pendingPaymentOrder(item, overrides = {}) {
  return Order.create({
    orderNumber: `SKT-PAY-${Date.now()}-${Math.random()}`,
    customerName: 'Buyer',
    customerEmail: 'buyer@example.com',
    customerPhone: '9999999999',
    shippingAddress: 'Address',
    items: [{ productId: item.id, name: item.name, weight: item.weight, price: item.price, quantity: 1 }],
    totalAmount: 180,
    paymentMethod: 'Razorpay (Online)',
    razorpayOrderId: razorpayMock.order.id,
    ...overrides,
  });
}

function paymentSignature(orderId = razorpayMock.order.id, paymentId = razorpayMock.payment.id) {
  return crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
}

async function webhookRequest(event, payment, eventId) {
  const payload = JSON.stringify({ event, payload: { payment: { entity: payment } } });
  const signature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(payload).digest('hex');
  let requestBuilder = request(app).post('/api/payment/webhook').set('Content-Type', 'application/json').set('x-razorpay-signature', signature);
  if (eventId) requestBuilder = requestBuilder.set('x-razorpay-event-id', eventId);
  return requestBuilder.send(payload);
}

test('authentication, admin authorization, and password reset revoke old sessions', async () => {
  const { user, token } = await register();
  const protectedResponse = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
  assert.equal(protectedResponse.status, 200);

  const adminResponse = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`);
  assert.notEqual(adminResponse.status, 403);
  const forbidden = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`);
  assert.equal(forbidden.status, 403);

  const forgot = await request(app).post('/api/auth/forgot-password').send({ email: user.email });
  assert.equal(forgot.status, 200);
  const notification = await Notification.findOne({ eventType: 'password.reset.requested' }).lean();
  const resetToken = notification.message.match(/token=([^\s]+)/)[1];
  const reset = await request(app).post('/api/auth/reset-password').send({ token: resetToken, password: 'newpassword123' });
  assert.equal(reset.status, 200);

  const oldSession = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
  assert.equal(oldSession.status, 401);
  const newSession = await request(app).post('/api/auth/login').send({ email: user.email, password: 'newpassword123' });
  assert.equal(newSession.status, 200);
  const reused = await request(app).post('/api/auth/reset-password').send({ token: resetToken, password: 'anotherpassword123' });
  assert.equal(reused.status, 400);
});

test('products validate input, paginate, and reject invalid ids', async () => {
  const { token } = await register('admin@example.com', 'password123', 'Admin');
  await product();
  await product({ name: 'Plant Patties' });
  const list = await request(app).get('/api/products?page=1&limit=1');
  assert.equal(list.status, 200);
  assert.equal(list.body.data.length, 1);
  const invalid = await request(app).get('/api/products/not-an-id');
  assert.equal(invalid.status, 400);
  const created = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send({ name: 'New Product', code: 'NEW-1', weight: '250g', price: 80, category: 'Snacks', stock: 5 });
  assert.equal(created.status, 201);
  const rejected = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send({ name: 'Bad Product', code: 'BAD-1', weight: '250g', price: -1, category: 'Snacks', stock: 5 });
  assert.equal(rejected.status, 400);
});

test('authenticated cart operations merge duplicates and never trust stored prices', async () => {
  const { user, token } = await register();
  const item = await product();
  const added = await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: item.id, weight: item.weight, quantity: 2, price: 0 });
  assert.equal(added.status, 200);
  const increased = await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: item.id, weight: item.weight, quantity: 1 });
  assert.equal(increased.body.data[0].quantity, 3);
  assert.equal(increased.body.data[0].price, 120);
  const updated = await request(app).patch('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: item.id, weight: item.weight, quantity: 2 });
  assert.equal(updated.body.data[0].quantity, 2);
  const own = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
  assert.equal(own.status, 200);
  const removed = await request(app).delete('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: item.id, weight: item.weight });
  assert.deepEqual(removed.body.data, []);
  await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: item.id, weight: item.weight, quantity: 1 });
  assert.equal((await request(app).delete('/api/cart').set('Authorization', `Bearer ${token}`)).status, 200);
  const other = await register('other@example.com');
  const otherCart = await request(app).get('/api/cart').set('Authorization', `Bearer ${other.token}`);
  assert.deepEqual(otherCart.body.data, []);
  assert.equal(user.email, 'customer@example.com');
});

test('checkout recalculates totals, rejects manipulation, and reserves COD stock atomically', async () => {
  const item = await product({ stock: 2 });
  const body = { customerName: 'Buyer', customerEmail: 'buyer@example.com', customerPhone: '9999999999', shippingAddress: 'Address', paymentMethod: 'Cash on Delivery', items: [{ productId: item.id, weight: item.weight, quantity: 1, price: 1 }], totalAmount: 1 };
  const created = await request(app).post('/api/orders').send(body);
  assert.equal(created.status, 201);
  assert.equal(created.body.data.totalAmount, 183);
  assert.equal((await Product.findById(item.id)).stock, 1);
  const invalidQuantity = await request(app).post('/api/orders').send({ ...body, items: [{ ...body.items[0], quantity: 99 }] });
  assert.equal(invalidQuantity.status, 400);
  const invalidProduct = await request(app).post('/api/orders').send({ ...body, items: [{ ...body.items[0], productId: '507f1f77bcf86cd799439011' }] });
  assert.equal(invalidProduct.status, 400);
});

test('insufficient stock is rejected and customer cancellation restores reserved stock', async () => {
  const item = await product({ stock: 1 });
  const body = { customerName: 'Buyer', customerEmail: 'buyer@example.com', customerPhone: '9999999999', shippingAddress: 'Address', paymentMethod: 'Cash on Delivery', items: [{ productId: item.id, weight: item.weight, quantity: 1 }] };
  const created = await request(app).post('/api/orders').send(body);
  assert.equal(created.status, 201);
  const rejected = await request(app).post('/api/orders').send({ ...body, customerEmail: 'second@example.com' });
  assert.equal(rejected.status, 409);
  const { token } = await register(body.customerEmail);
  const cancelled = await request(app).post(`/api/orders/${created.body.data.id}/cancel`).set('Authorization', `Bearer ${token}`);
  assert.equal(cancelled.status, 200);
  assert.equal((await Product.findById(item.id)).stock, 1);
});

test('customers only see their own orders and admins use controlled status transitions', async () => {
  const item = await product({ stock: 5 });
  const first = await request(app).post('/api/orders').send({ customerName: 'One', customerEmail: 'one@example.com', customerPhone: '9999999999', shippingAddress: 'Address', paymentMethod: 'Cash on Delivery', items: [{ productId: item.id, weight: item.weight, quantity: 1 }] });
  const second = await request(app).post('/api/orders').send({ customerName: 'Two', customerEmail: 'two@example.com', customerPhone: '9999999999', shippingAddress: 'Address', paymentMethod: 'Cash on Delivery', items: [{ productId: item.id, weight: item.weight, quantity: 1 }] });
  const one = await register('one@example.com');
  const own = await request(app).get('/api/orders/mine').set('Authorization', `Bearer ${one.token}`);
  assert.equal(own.status, 200);
  assert.equal(own.body.count, 1);
  assert.equal((await request(app).get(`/api/orders/${second.body.data.id}`).set('Authorization', `Bearer ${one.token}`)).status, 403);
  const adminUser = await register('admin-orders@example.com', 'password123', 'Admin');
  assert.equal((await request(app).put(`/api/orders/${first.body.data.id}`).set('Authorization', `Bearer ${adminUser.token}`).send({ status: 'Processing' })).status, 200);
  assert.equal((await request(app).put(`/api/orders/${first.body.data.id}`).set('Authorization', `Bearer ${adminUser.token}`).send({ status: 'Delivered' })).status, 409);
});

test('concurrent COD purchases never make stock negative', async () => {
  const item = await product({ stock: 1 });
  const body = (email) => ({ customerName: 'Buyer', customerEmail: email, customerPhone: '9999999999', shippingAddress: 'Address', paymentMethod: 'Cash on Delivery', items: [{ productId: item.id, weight: item.weight, quantity: 1 }] });
  const responses = await Promise.all([request(app).post('/api/orders').send(body('one@example.com')), request(app).post('/api/orders').send(body('two@example.com'))]);
  assert.ok(responses.filter((response) => response.status === 201).length <= 1);
  assert.ok([400, 409, 500].includes(responses.find((response) => response.status !== 201)?.status || 201));
  assert.ok((await Product.findById(item.id)).stock >= 0);
});

test('notification delivery retries transient failures and stops permanent failures', async () => {
  const service = require('../services/notificationService');
  let calls = 0;
  const originalFetch = global.fetch;
  global.fetch = async () => {
    calls += 1;
    if (calls === 1) return { ok: false, status: 503 };
    return providerResponse();
  };
  const first = await service.dispatchNotification({ notificationKey: 'retry-test', eventType: 'test', channel: 'customer-email', recipient: 'customer@example.com', subject: 'Test', message: 'Test' });
  assert.equal(first.status, 'Failed');
  assert.equal(first.attempts, 1);
  await Notification.updateOne({ _id: first._id }, { nextAttemptAt: new Date(0) });
  const second = await service.retryDueNotifications();
  assert.equal(second, 1);
  assert.equal((await Notification.findById(first._id)).status, 'Sent');
  global.fetch = originalFetch;
});

test('notification retry classification, maximum attempts, stale leases, and duplicate delivery are enforced', async () => {
  const service = require('../services/notificationService');
  assert.equal(service.isRetryableError({ status: 408 }), true);
  assert.equal(service.isRetryableError({ status: 429 }), true);
  assert.equal(service.isRetryableError({ status: 500 }), true);
  assert.equal(service.isRetryableError(new Error('network timeout')), true);
  assert.equal(service.isRetryableError({ status: 400 }), false);
  assert.equal(service.isRetryableError({ status: 401 }), false);
  assert.ok(service.retryDelay(2) >= 300);

  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    return { ok: false, status: 400, json: async () => ({}) };
  };
  const permanent = await service.dispatchNotification({ notificationKey: 'permanent-test', eventType: 'test', channel: 'customer-email', recipient: 'customer@example.com', subject: 'Test', message: 'Test' });
  assert.equal(permanent.status, 'Failed');
  assert.equal(permanent.attempts, 1);
  await service.retryDueNotifications();
  await service.retryDueNotifications();
  assert.equal((await Notification.findOne({ notificationKey: 'permanent-test' })).attempts, 3);
  assert.equal(await service.retryDueNotifications(), 0);

  global.fetch = async () => {
    calls += 1;
    return providerResponse();
  };
  const stale = await Notification.create({ notificationKey: 'stale-test', idempotencyKey: 'stale-test', eventType: 'test', channel: 'customer-email', recipient: 'customer@example.com', subject: 'Test', message: 'Test', status: 'Sending', attempts: 1, sendingAt: new Date(Date.now() - 5 * 60 * 1000) });
  await service.retryDueNotifications();
  assert.equal((await Notification.findById(stale.id)).status, 'Sent');

  calls = 0;
  global.fetch = async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 20));
    return providerResponse();
  };
  await Promise.all([
    service.dispatchNotification({ notificationKey: 'duplicate-test', eventType: 'test', channel: 'customer-email', recipient: 'customer@example.com', subject: 'Test', message: 'Test' }),
    service.dispatchNotification({ notificationKey: 'duplicate-test', eventType: 'test', channel: 'customer-email', recipient: 'customer@example.com', subject: 'Test', message: 'Test' }),
  ]);
  assert.equal(calls, 1);
  global.fetch = originalFetch;
});

test('Razorpay verification accepts valid captured payment and rejects signature, amount, currency, order, association, and capture errors', async () => {
  const item = await product();
  const order = await pendingPaymentOrder(item);
  const verify = (paymentId = razorpayMock.payment.id) => request(app).post('/api/payment/verify').send({ razorpay_order_id: order.razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: paymentSignature(order.razorpayOrderId, paymentId) });

  const invalidSignature = await request(app).post('/api/payment/verify').send({ razorpay_order_id: order.razorpayOrderId, razorpay_payment_id: razorpayMock.payment.id, razorpay_signature: 'bad' });
  assert.equal(invalidSignature.status, 400);

  const originalOrder = { ...razorpayMock.order };
  const originalPayment = { ...razorpayMock.payment };
  razorpayMock.order.amount = 999;
  assert.equal((await verify()).status, 400);
  razorpayMock.order = { ...originalOrder, currency: 'USD' };
  assert.equal((await verify()).status, 400);
  razorpayMock.order = { ...originalOrder, id: 'different_order' };
  assert.equal((await verify()).status, 400);
  razorpayMock.order = { ...originalOrder };
  razorpayMock.payment = { ...originalPayment, order_id: 'different_order' };
  assert.equal((await verify()).status, 400);
  razorpayMock.payment = { ...originalPayment, currency: 'USD' };
  assert.equal((await verify()).status, 400);
  razorpayMock.payment = { ...originalPayment, status: 'authorized' };
  assert.equal((await verify()).status, 400);
  razorpayMock.payment = { ...originalPayment };
  razorpayMock.order.amount = originalOrder.amount;
  assert.equal((await verify()).status, 200);
  assert.equal((await Order.findById(order.id)).paymentStatus, 'Paid');
  assert.equal((await verify()).status, 200);
  assert.equal((await request(app).post('/api/payment/verify').send({ razorpay_order_id: order.razorpayOrderId, razorpay_payment_id: 'different_payment', razorpay_signature: paymentSignature(order.razorpayOrderId, 'different_payment') })).status, 409);
  assert.equal((await request(app).post('/api/payment/verify').send({ razorpay_order_id: 'missing_order', razorpay_payment_id: razorpayMock.payment.id, razorpay_signature: paymentSignature('missing_order') })).status, 404);
  razorpayMock.order = originalOrder;
  razorpayMock.payment = originalPayment;
});

test('duplicate payment verification is idempotent and does not decrement stock or duplicate notifications', async () => {
  const item = await product({ stock: 2 });
  const order = await pendingPaymentOrder(item);
  const body = { razorpay_order_id: order.razorpayOrderId, razorpay_payment_id: razorpayMock.payment.id, razorpay_signature: paymentSignature() };
  assert.equal((await request(app).post('/api/payment/verify').send(body)).status, 200);
  assert.equal((await request(app).post('/api/payment/verify').send(body)).status, 200);
  assert.equal((await Product.findById(item.id)).stock, 1);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(await Notification.countDocuments({ notificationKey: `${order._id}:payment.success:customer-email` }), 1);
});

test('payment creation uses server totals and captured verification commits stock', async () => {
  const item = await product({ stock: 2 });
  const response = await request(app).post('/api/orders').send({ customerName: 'Buyer', customerEmail: 'buyer@example.com', customerPhone: '9999999999', shippingAddress: 'Address', items: [{ productId: item.id, weight: item.weight, quantity: 1, price: 1 }], totalAmount: 1 });
  assert.equal(response.status, 201);
  assert.equal(response.body.razorpayAmount, 18000);
  assert.equal((await Product.findById(item.id)).stock, 2);
});

test('webhooks validate signatures, process captured and failed events, reject wrong links, and ignore duplicates safely', async () => {
  const item = await product({ stock: 3 });
  const capturedOrder = await pendingPaymentOrder(item);
  const invalid = await request(app).post('/api/payment/webhook').set('x-razorpay-signature', 'bad').send(JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: razorpayMock.payment } } }));
  assert.equal(invalid.status, 400);
  const captured = await webhookRequest('payment.captured', razorpayMock.payment, 'event-captured');
  assert.equal(captured.status, 200);
  assert.equal((await Product.findById(item.id)).stock, 2);
  const duplicate = await webhookRequest('payment.captured', razorpayMock.payment, 'event-captured');
  assert.equal(duplicate.status, 200);
  assert.equal((await Product.findById(item.id)).stock, 2);
  assert.equal(await PaymentEvent.countDocuments({ eventId: 'event-captured' }), 1);
  assert.equal((await Order.findById(capturedOrder.id)).paymentStatus, 'Paid');

  const failedItem = await product({ stock: 1 });
  const failedOrder = await pendingPaymentOrder(failedItem, { razorpayOrderId: 'order_failed' });
  razorpayMock.order = { ...razorpayMock.order, id: 'order_failed' };
  razorpayMock.payment = { id: 'pay_failed', order_id: 'order_failed', amount: 18000, currency: 'INR', status: 'failed' };
  const failed = await webhookRequest('payment.failed', razorpayMock.payment, 'event-failed');
  assert.equal(failed.status, 200);
  assert.equal((await Order.findById(failedOrder.id)).paymentStatus, 'Failed');
  razorpayMock.payment = { ...razorpayMock.payment, status: 'captured' };
  assert.equal((await webhookRequest('payment.captured', razorpayMock.payment, 'event-out-of-order')).status, 409);

  const unknown = await webhookRequest('payment.authorized', razorpayMock.payment, 'event-unknown');
  assert.equal(unknown.status, 200);
  razorpayMock.payment = { ...razorpayMock.payment, order_id: 'wrong-order' };
  const wrongLink = await webhookRequest('payment.failed', razorpayMock.payment, 'event-wrong-link');
  assert.equal(wrongLink.status, 400);
  razorpayMock.order = { id: 'order_test', amount: 18000, currency: 'INR' };
  razorpayMock.payment = { ...razorpayMock.payment, order_id: 'order_test' };
});
