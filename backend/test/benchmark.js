const request = require('supertest');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'benchmark-secret-key-12345';
process.env.FRONTEND_URL = 'http://localhost:3005';
process.env.RAZORPAY_KEY_ID = 'test-key';
process.env.RAZORPAY_KEY_SECRET = 'test-secret';
process.env.UPSTASH_REDIS_REST_URL = ''; // Benchmark with L1 memory cache
process.env.UPSTASH_REDIS_REST_TOKEN = '';

async function runBenchmark() {
  console.log('🚀 Starting Performance Benchmark...');
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = replSet.getUri();

  const { app } = require('../server');
  await mongoose.connect(process.env.MONGODB_URI);

  const User = require('../models/User');
  const Product = require('../models/Product');
  const Category = require('../models/Category');

  // Seed sample products
  const productsToSeed = [];
  for (let i = 1; i <= 60; i++) {
    productsToSeed.push({
      code: `PROD-${String(i).padStart(3, '0')}`,
      name: `Mock Mutton Variant ${i}`,
      weight: '1 KG',
      mrp: 350 + i * 5,
      price: 300 + i * 5,
      category: i % 2 === 0 ? 'Mutton Alternatives' : 'Chicken Alternatives',
      description: `Premium plant-based frozen mock meat delicious healthy ${i}`,
      stock: 50,
      isAvailable: true,
      isPopular: i % 3 === 0,
      variants: [{ weight: '500g', price: 160 }, { weight: '1 KG', price: 300 + i * 5 }],
    });
  }
  await Product.insertMany(productsToSeed);

  // Seed categories
  await Category.insertMany([
    { name: 'Mutton Alternatives', description: 'Plant-based mutton' },
    { name: 'Chicken Alternatives', description: 'Plant-based chicken' },
    { name: 'Seafood Alternatives', description: 'Plant-based fish & prawn' },
  ]);

  // Seed test user
  const testUser = await User.create({
    name: 'Speed Test User',
    email: 'speedtest@sakthifrozen.com',
    phone: '9876543210',
    password: 'password123',
    role: 'Customer',
  });

  console.log('✓ Seeded database with 60 products, 3 categories, and 1 user.\n');

  // Benchmark 1: Login Performance
  console.log('--- 1. Testing Login Performance (/api/auth/login) ---');
  const loginTimes = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    const res = await request(app).post('/api/auth/login').send({
      phone: '9876543210',
      password: 'password123',
    });
    const duration = performance.now() - start;
    loginTimes.push(duration);
    if (i === 0) {
      if (res.status !== 200 || !res.body.data?.token) {
        throw new Error('Login failed: ' + JSON.stringify(res.body));
      }
    }
  }
  const avgLogin = (loginTimes.reduce((a, b) => a + b) / loginTimes.length).toFixed(2);
  console.log(`Login response times: ${loginTimes.map(t => t.toFixed(1) + 'ms').join(', ')}`);
  console.log(`⭐ Average Login Response Time: ${avgLogin}ms\n`);

  const token = (await request(app).post('/api/auth/login').send({
    phone: '9876543210',
    password: 'password123',
  })).body.data.token;

  // Benchmark 2: Authenticated /api/auth/me (Protected Route with Session Cache)
  console.log('--- 2. Testing Authenticated Route (/api/auth/me) ---');
  const authMeTimes = [];
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    const duration = performance.now() - start;
    authMeTimes.push(duration);
  }
  const avgAuthMe = (authMeTimes.slice(1).reduce((a, b) => a + b) / (authMeTimes.length - 1)).toFixed(2);
  console.log(`Auth me response times: ${authMeTimes.map(t => t.toFixed(2) + 'ms').join(', ')}`);
  console.log(`⭐ First cold auth: ${authMeTimes[0].toFixed(2)}ms | Warm L1 Cache Avg: ${avgAuthMe}ms\n`);

  // Benchmark 3: Product Listing Performance (/api/products)
  console.log('--- 3. Testing Product Listing (/api/products) ---');
  const prodTimes = [];
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    const res = await request(app).get('/api/products?limit=50');
    const duration = performance.now() - start;
    prodTimes.push(duration);
  }
  console.log(`Product list response times: ${prodTimes.map(t => t.toFixed(2) + 'ms').join(', ')}`);
  console.log(`⭐ Cold DB fetch: ${prodTimes[0].toFixed(2)}ms | L1 Cache Avg: ${(prodTimes.slice(1).reduce((a, b) => a + b) / 9).toFixed(2)}ms\n`);

  // Benchmark 4: Category Listing Performance (/api/categories)
  console.log('--- 4. Testing Category Listing (/api/categories) ---');
  const catTimes = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    const res = await request(app).get('/api/categories');
    const duration = performance.now() - start;
    catTimes.push(duration);
  }
  console.log(`Category response times: ${catTimes.map(t => t.toFixed(2) + 'ms').join(', ')}`);
  console.log(`⭐ Category Average: ${(catTimes.reduce((a, b) => a + b) / catTimes.length).toFixed(2)}ms\n`);

  // Benchmark 5: Wishlist Toggle Performance (/api/wishlist/toggle)
  console.log('--- 5. Testing Wishlist Toggle (/api/wishlist/toggle) ---');
  const firstProd = (await Product.findOne().lean())._id.toString();
  const wishTimes = [];
  for (let i = 0; i < 6; i++) {
    const start = performance.now();
    const res = await request(app)
      .post('/api/wishlist/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: firstProd });
    const duration = performance.now() - start;
    wishTimes.push(duration);
  }
  console.log(`Wishlist toggle response times: ${wishTimes.map(t => t.toFixed(2) + 'ms').join(', ')}`);
  console.log(`⭐ Wishlist Toggle Average: ${(wishTimes.reduce((a, b) => a + b) / wishTimes.length).toFixed(2)}ms\n`);

  // Benchmark 6: Cart Hydration & Storage (/api/cart)
  console.log('--- 6. Testing Cart Hydration (/api/cart) ---');
  const allProds = await Product.find().limit(3).lean();
  const cartItems = allProds.map(p => ({ productId: p._id.toString(), weight: p.weight, quantity: 2 }));
  const cartTimes = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    const res = await request(app)
      .put('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: cartItems });
    const duration = performance.now() - start;
    cartTimes.push(duration);
  }
  console.log(`Cart put response times: ${cartTimes.map(t => t.toFixed(2) + 'ms').join(', ')}`);
  console.log(`⭐ Cart Hydration Average: ${(cartTimes.reduce((a, b) => a + b) / cartTimes.length).toFixed(2)}ms\n`);

  // Benchmark 7: Full Admin Dashboard Load (5 parallel API requests with admin token)
  console.log('--- 7. Testing Full Admin Dashboard Load (All 5 APIs in parallel) ---');
  const adminUser = await User.create({
    name: 'Admin Boss',
    email: 'admin@sakthifrozen.com',
    phone: '9876543299',
    password: 'password123',
    role: 'Admin',
  });
  const adminToken = (await request(app).post('/api/auth/login').send({
    email: 'admin@sakthifrozen.com',
    password: 'password123',
  })).body.data.token;

  const adminLoadTimes = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    const [p, o, u, c, r] = await Promise.all([
      request(app).get('/api/products').set('Authorization', `Bearer ${adminToken}`),
      request(app).get('/api/orders').set('Authorization', `Bearer ${adminToken}`),
      request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`),
      request(app).get('/api/categories').set('Authorization', `Bearer ${adminToken}`),
      request(app).get('/api/reviews').set('Authorization', `Bearer ${adminToken}`),
    ]);
    const duration = performance.now() - start;
    adminLoadTimes.push(duration);
    if (i === 0) {
      if (p.status !== 200 || o.status !== 200 || u.status !== 200 || c.status !== 200 || r.status !== 200) {
        throw new Error(`Admin fetch failed: p=${p.status}, o=${o.status}, u=${u.status}, c=${c.status}, r=${r.status}`);
      }
    }
  }
  console.log(`Admin 5-API parallel response times: ${adminLoadTimes.map(t => t.toFixed(2) + 'ms').join(', ')}`);
  console.log(`⭐ First cold load: ${adminLoadTimes[0].toFixed(2)}ms | Warm Micro-Cache Avg: ${(adminLoadTimes.slice(1).reduce((a, b) => a + b) / 4).toFixed(2)}ms\n`);

  console.log('🎉 Benchmark complete. Clean shutdown...');
  await mongoose.disconnect();
  await replSet.stop();
  process.exit(0);
}

runBenchmark().catch(err => {
  console.error('Benchmark Error:', err);
  process.exit(1);
});
