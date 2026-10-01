const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { retryDueNotifications } = require('./services/notificationService');

// Load environment variables
dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    if (res.statusCode >= 400 || durationMs >= 500) {
      console.log(JSON.stringify({ requestId: req.requestId, method: req.method, path: req.path, status: res.statusCode, durationMs }));
    }
  });
  next();
});
app.use(express.json({
  limit: '100kb',
  verify: (req, res, buffer) => {
    if (req.originalUrl === '/api/payment/webhook') req.rawBody = Buffer.from(buffer);
  },
}));

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false }));
app.use('/api/payment', rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ success: connected, status: connected ? 'ready' : 'starting', database: connected ? 'connected' : 'connecting' });
});

app.use('/api', (req, res, next) => {
  if (req.path === '/health' || mongoose.connection.readyState === 1) return next();
  res.set('Retry-After', '3');
  return res.status(503).json({ success: false, error: 'Backend is starting; database is not ready yet.' });
});

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Serve Uploads folder as static
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint test
app.get('/', (req, res) => {
  res.json({
    name: 'Sakthi Frozen Foods API Backend',
    status: 'Running',
    version: '1.0.0',
    endpoints: [
      '/api/products',
      '/api/orders',
      '/api/users',
    ],
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Sakthi Frozen Foods Backend API running on port ${PORT}`);
  });

  let retryTimer;
  let retrying = false;
  const connectWithRetry = async () => {
    if (retrying || mongoose.connection.readyState === 1) return;
    retrying = true;
    try {
      await connectDB();
      console.log('Backend database is ready.');
      if (!retryTimer) {
        const runNotificationRetry = () => {
          retryDueNotifications().catch((error) => console.error(JSON.stringify({ type: 'notification_retry_worker_failure', error: error.message })));
        };
        runNotificationRetry();
        retryTimer = setInterval(runNotificationRetry, 30 * 1000);
        retryTimer.unref();
      }
    } catch (error) {
      console.error(`Backend database is not ready; retrying shortly: ${error.message}`);
    } finally {
      retrying = false;
      if (mongoose.connection.readyState !== 1) {
        const retry = setTimeout(connectWithRetry, 3000);
        retry.unref();
      }
    }
  };
  void connectWithRetry();
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
