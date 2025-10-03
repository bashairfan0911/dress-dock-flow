const express = require('express');
const { Order, Product } = require('../models');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

// Create an order
router.post('/', auth, async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in order' });
    }

    console.log('Creating order for user:', req.user._id);
    console.log('Products:', JSON.stringify(products));
    
    // Validate all products first
    const validatedProducts = [];
    for (const { productId, quantity } of products) {
      const product = await Product.findById(productId);
      
      if (!product) {
        console.log(`Product not found: ${productId}`);
        return res.status(404).json({ message: `Product ${productId} not found` });
      }
      
      if (product.stock < quantity) {
        console.log(`Insufficient stock for ${product.name}: requested=${quantity}, available=${product.stock}`);
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}` 
        });
      }
      
      validatedProducts.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    // Calculate total
    const total = validatedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log('Order total:', total);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      products: validatedProducts.map(({ product, quantity }) => ({ product, quantity })),
      total,
    });

    // Update product stock
    await Promise.all(
      validatedProducts.map(({ product, quantity }) =>
        Product.findByIdAndUpdate(product, { $inc: { stock: -quantity } })
      )
    );

    await order.populate('products.product');
    
    console.log('Order created successfully:', order._id);
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get user's orders
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const orders = await Order.find({ user: req.params.userId })
      .populate('products.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email name')
      .populate('products.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;