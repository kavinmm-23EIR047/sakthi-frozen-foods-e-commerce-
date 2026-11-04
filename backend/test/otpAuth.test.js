const path = require('node:path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { app } = require('../server');
const User = require('../models/User');

const TEST_EMAIL = `test.otp.${Date.now()}@tnmockmeat.com`;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sakthi-frozen-foods-test');
  }
  await User.deleteMany({ email: { $regex: /test\.otp\./ } });
});

test.after(async () => {
  await User.deleteMany({ email: { $regex: /test\.otp\./ } });
  await mongoose.connection.close();
});

test('1. Rejects OTP send with invalid email', async () => {
  const res = await request(app)
    .post('/api/auth/otp/send')
    .send({ email: 'invalid-email' })
    .expect(400);

  assert.equal(res.body.success, false);
});

test('2. Successfully sends OTP for new registration', async () => {
  const res = await request(app)
    .post('/api/auth/otp/send')
    .send({ email: TEST_EMAIL, name: 'Test OTP User' })
    .expect(200);

  assert.equal(res.body.success, true);

  const user = await User.findOne({ email: TEST_EMAIL }).select('+otpHash +otpExpiresAt');
  assert.ok(user);
  assert.equal(user.name, 'Test OTP User');
  assert.ok(user.otpHash);
  assert.ok(user.otpExpiresAt);
});

test('3. Rejects incorrect OTP code', async () => {
  const res = await request(app)
    .post('/api/auth/otp/verify')
    .send({ email: TEST_EMAIL, otp: '000000' })
    .expect(400);

  assert.equal(res.body.success, false);
  assert.match(res.body.message, /incorrect/i);
});

test('4. Successfully verifies OTP and returns JWT auth session', async () => {
  // Set known OTP
  const knownOtp = '654321';
  const knownHash = crypto.createHash('sha256').update(knownOtp).digest('hex');
  await User.updateOne(
    { email: TEST_EMAIL },
    { otpHash: knownHash, otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000) }
  );

  const res = await request(app)
    .post('/api/auth/otp/verify')
    .send({
      email: TEST_EMAIL,
      otp: knownOtp,
      name: 'Verified OTP User',
      phone: '9876543210',
    })
    .expect(200);

  assert.equal(res.body.success, true);
  assert.ok(res.body.data.token);
  assert.equal(res.body.data.email, TEST_EMAIL);
  assert.equal(res.body.data.name, 'Test OTP User');
  assert.equal(res.body.data.phone, '9876543210');

  const updatedUser = await User.findOne({ email: TEST_EMAIL });
  assert.equal(updatedUser.isEmailVerified, true);
});
