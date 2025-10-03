require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const addressRoutes = require('./routes/address');
const sessionRoutes = require('./routes/session');

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Health check endpoint for Kubernetes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/sessions', sessionRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});