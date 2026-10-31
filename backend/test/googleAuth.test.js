// ============================================
// GOOGLE AUTH TEST SUITE
// Loads backend/.env automatically
// ============================================

const path = require('node:path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const assert = require('node:assert/strict');
const { before, after, beforeEach, test } = require('node:test');
const request = require('supertest');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');

// Test-only environment configuration
process.env.JWT_SECRET = 'google-test-secret-key-12345';
process.env.FRONTEND_URL =
  'http://localhost:3005,https://buy.tnmockmeat.com';

// Google credentials are loaded from backend/.env.
// Never hardcode GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET here.

let replSet;
let app;
let User;

// Mock behavior for Google token verification
let mockVerifyPayload = null;
let mockVerifyError = null;

// ============================================
// SETUP
// ============================================

before(async () => {
  // Mock Google ID token verification
  OAuth2Client.prototype.verifyIdToken = async function ({ idToken }) {
    if (mockVerifyError) {
      throw mockVerifyError;
    }

    if (idToken === 'invalid-token') {
      throw new Error('Invalid token signature');
    }

    return {
      getPayload: () => mockVerifyPayload,
    };
  };

  // Mock Google authorization code exchange
  OAuth2Client.prototype.getToken = async function ({ code }) {
    if (code === 'invalid-code') {
      throw new Error('Invalid authorization code');
    }

    return {
      tokens: {
        id_token: 'valid-mock-id-token',
        access_token: 'valid-mock-access-token',
      },
    };
  };

  // Start in-memory MongoDB replica set
  replSet = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
    },
  });

  process.env.MONGODB_URI = replSet.getUri();

  // Load backend application
  ({ app } = require('../server'));

  await mongoose.connect(process.env.MONGODB_URI);

  User = require('../models/User');
});

// ============================================
// CLEANUP
// ============================================

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (replSet) {
    await replSet.stop();
  }
});

// ============================================
// RESET BEFORE EACH TEST
// ============================================

beforeEach(async () => {
  await User.deleteMany({});

  mockVerifyError = null;
  mockVerifyPayload = null;
});

// ============================================
// TEST 1: Reject missing Google credentials
// ============================================

test('1. Rejects request when neither token nor code is provided', async () => {
  const res = await request(app)
    .post('/api/auth/google')
    .send({})
    .expect(400);

  assert.equal(res.body.success, false);

  assert.match(
    res.body.message,
    /credential or code is required/i
  );
});

// ============================================
// TEST 2: Reject invalid Google token
// ============================================

test('2. Rejects invalid or expired Google token', async () => {
  const res = await request(app)
    .post('/api/auth/google')
    .send({
      idToken: 'invalid-token',
    })
    .expect(401);

  assert.equal(res.body.success, false);

  assert.match(
    res.body.message,
    /Invalid or expired Google/i
  );
});

// ============================================
// TEST 3: Reject unverified Google email
// ============================================

test('3. Rejects user with unverified Google email', async () => {
  mockVerifyPayload = {
    sub: 'google-sub-unverified',
    email: 'unverified@gmail.com',
    email_verified: false,
    name: 'Unverified User',
    picture: 'https://example.com/pic.jpg',
  };

  const res = await request(app)
    .post('/api/auth/google')
    .send({
      idToken: 'valid-unverified-token',
    })
    .expect(400);

  assert.equal(res.body.success, false);

  assert.match(
    res.body.message,
    /not verified/i
  );

  const count = await User.countDocuments({
    email: 'unverified@gmail.com',
  });

  assert.equal(count, 0);
});

// ============================================
// TEST 4: Register new Google user
// ============================================

test('4. Registers a new user via Google authentication', async () => {
  mockVerifyPayload = {
    sub: 'google-1092837465',
    email: 'newuser@gmail.com',
    email_verified: true,
    name: 'Sakthi Customer',
    picture: 'https://lh3.googleusercontent.com/a/photo123',
  };

  const res = await request(app)
    .post('/api/auth/google')
    .send({
      idToken: 'valid-new-user-token',
    })
    .expect(200);

  assert.equal(res.body.success, true);

  assert.ok(res.body.data.token);

  assert.equal(
    res.body.data.email,
    'newuser@gmail.com'
  );

  assert.equal(
    res.body.data.name,
    'Sakthi Customer'
  );

  assert.equal(
    res.body.data.avatar,
    'https://lh3.googleusercontent.com/a/photo123'
  );

  assert.equal(
    res.body.data.authProvider,
    'google'
  );

  assert.equal(
    res.body.data.role,
    'Customer'
  );

  const createdUser = await User.findOne({
    email: 'newuser@gmail.com',
  });

  assert.ok(createdUser);

  assert.equal(
    createdUser.googleId,
    'google-1092837465'
  );

  assert.equal(
    createdUser.authProvider,
    'google'
  );

  assert.equal(
    createdUser.isEmailVerified,
    true
  );

  assert.equal(
    createdUser.avatar,
    'https://lh3.googleusercontent.com/a/photo123'
  );
});

// ============================================
// TEST 5: Link existing email/password account
// ============================================

test('5. Handles existing email/password account safely (links Google ID without duplicate)', async () => {
  await User.create({
    name: 'Legacy Customer',
    email: 'existing@gmail.com',
    password: 'Password123!',
    phone: '9876543210',
    role: 'Customer',
  });

  mockVerifyPayload = {
    sub: 'google-sub-existing-user-999',
    email: 'existing@gmail.com',
    email_verified: true,
    name: 'Legacy Customer Updated',
    picture: 'https://lh3.googleusercontent.com/a/photo999',
  };

  const res = await request(app)
    .post('/api/auth/google')
    .send({
      idToken: 'valid-existing-user-token',
    })
    .expect(200);

  assert.equal(res.body.success, true);

  assert.ok(res.body.data.token);

  assert.equal(
    res.body.data.email,
    'existing@gmail.com'
  );

  const allUsersWithEmail = await User.find({
    email: 'existing@gmail.com',
  });

  assert.equal(allUsersWithEmail.length, 1);

  const updatedUser = allUsersWithEmail[0];

  assert.equal(
    updatedUser.googleId,
    'google-sub-existing-user-999'
  );

  assert.equal(
    updatedUser.avatar,
    'https://lh3.googleusercontent.com/a/photo999'
  );

  assert.equal(
    updatedUser.isEmailVerified,
    true
  );

  assert.equal(
    updatedUser.phone,
    '9876543210'
  );

  const passwordMatches = await updatedUser.matchPassword(
    'Password123!'
  );

  assert.equal(passwordMatches, true);
});

// ============================================
// TEST 6: Returning Google user login
// ============================================

test('6. Logs in returning user via Google (existing googleId)', async () => {
  await User.create({
    name: 'Returning Google User',
    email: 'returning@gmail.com',
    googleId: 'google-sub-returning-777',
    avatar: 'https://example.com/avatar.jpg',
    authProvider: 'google',
    isEmailVerified: true,
    phone: '',
  });

  mockVerifyPayload = {
    sub: 'google-sub-returning-777',
    email: 'returning@gmail.com',
    email_verified: true,
    name: 'Returning Google User',
    picture: 'https://example.com/avatar.jpg',
  };

  const res = await request(app)
    .post('/api/auth/google')
    .send({
      idToken: 'valid-returning-token',
    })
    .expect(200);

  assert.equal(res.body.success, true);

  assert.ok(res.body.data.token);

  assert.equal(
    res.body.data.name,
    'Returning Google User'
  );
});

// ============================================
// TEST 7: Authorization code exchange
// ============================================

test('7. Supports authorization code exchange flow', async () => {
  mockVerifyPayload = {
    sub: 'google-sub-code-flow-444',
    email: 'codeflow@gmail.com',
    email_verified: true,
    name: 'Code Flow User',
    picture: 'https://lh3.googleusercontent.com/codeflow.jpg',
  };

  const res = await request(app)
    .post('/api/auth/google')
    .send({
      code: 'valid-auth-code-123',
    })
    .expect(200);

  assert.equal(res.body.success, true);

  assert.equal(
    res.body.data.email,
    'codeflow@gmail.com'
  );
});

// ============================================
// TEST 8: JWT session persistence
// ============================================

test('8. Session persistence: User profile retrieved via /api/auth/me using issued JWT', async () => {
  mockVerifyPayload = {
    sub: 'google-sub-me-555',
    email: 'meuser@gmail.com',
    email_verified: true,
    name: 'Me Profile User',
    picture: 'https://example.com/me.jpg',
  };

  const loginRes = await request(app)
    .post('/api/auth/google')
    .send({
      idToken: 'valid-me-token',
    })
    .expect(200);

  const token = loginRes.body.data.token;

  assert.ok(token);

  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(meRes.body.success, true);

  assert.equal(
    meRes.body.data.email,
    'meuser@gmail.com'
  );

  assert.equal(
    meRes.body.data.name,
    'Me Profile User'
  );

  assert.equal(
    meRes.body.data.avatar,
    'https://example.com/me.jpg'
  );
});

// ============================================
// TEST 9: CORS validation
// ============================================

test('9. CORS: Allows localhost:3005 and buy.tnmockmeat.com origins', async () => {
  const localRes = await request(app)
    .options('/api/auth/google')
    .set('Origin', 'http://localhost:3005')
    .set('Access-Control-Request-Method', 'POST');

  assert.equal(
    localRes.headers['access-control-allow-origin'],
    'http://localhost:3005'
  );

  const prodRes = await request(app)
    .options('/api/auth/google')
    .set('Origin', 'https://buy.tnmockmeat.com')
    .set('Access-Control-Request-Method', 'POST');

  assert.equal(
    prodRes.headers['access-control-allow-origin'],
    'https://buy.tnmockmeat.com'
  );
});

// ============================================
// TEST 10: Add mobile number after Google login
// ============================================

test('10. Allows Google user to add mobile number after login (PUT /api/auth/phone)', async () => {
  mockVerifyPayload = {
    sub: 'google-sub-phone-test-101',
    email: 'needphone@gmail.com',
    email_verified: true,
    name: 'Need Phone User',
    picture: 'https://example.com/pic.jpg',
  };

  const loginRes = await request(app)
    .post('/api/auth/google')
    .send({
      idToken: 'valid-token',
    })
    .expect(200);

  const token = loginRes.body.data.token;

  assert.equal(
    loginRes.body.data.phone,
    ''
  );

  const phoneRes = await request(app)
    .put('/api/auth/phone')
    .set('Authorization', `Bearer ${token}`)
    .send({
      phone: '9876543210',
    })
    .expect(200);

  assert.equal(phoneRes.body.success, true);

  assert.equal(
    phoneRes.body.data.phone,
    '9876543210'
  );

  const userInDb = await User.findOne({
    email: 'needphone@gmail.com',
  });

  assert.equal(
    userInDb.phone,
    '9876543210'
  );
});

// ============================================
// TEST 11: Reject duplicate mobile number
// ============================================

test('11. Rejects duplicate mobile number already used by another account', async () => {
  await User.create({
    name: 'Existing Customer',
    email: 'other@gmail.com',
    phone: '9123456789',
    role: 'Customer',
  });

  mockVerifyPayload = {
    sub: 'google-sub-dup-test',
    email: 'newgoogle@gmail.com',
    email_verified: true,
    name: 'New Google User',
    picture: '',
  };

  const loginRes = await request(app)
    .post('/api/auth/google')
    .send({
      idToken: 'valid-token',
    })
    .expect(200);

  const token = loginRes.body.data.token;

  const phoneRes = await request(app)
    .put('/api/auth/phone')
    .set('Authorization', `Bearer ${token}`)
    .send({
      phone: '9123456789',
    })
    .expect(400);

  assert.equal(phoneRes.body.success, false);

  assert.match(
    phoneRes.body.message,
    /already associated/i
  );
});