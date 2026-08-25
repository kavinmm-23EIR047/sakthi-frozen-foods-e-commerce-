const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/seed', require('./routes/seedRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

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
      '/api/seed',
    ],
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Sakthi Frozen Foods Backend API running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/`);
  console.log(`====================================================`);
});
