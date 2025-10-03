const express = require('express');
const { Order, Product } = require('../models');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

// Create an order
router.post('/', auth, async (req, res) => {
  try {
    const { products } = req.body;
    
    const orderProducts = await Promise.all(
      products.map(async ({ productId, quantity }) => {
        const product = await Product.findById(productId);
        if (!product || product.stock < quantity) {
          throw new Error(`Product ${productId} is out of stock`);
        }
        return {
          product: productId,
          quantity,
        };
      })
    );

    const total = await orderProducts.reduce(async (acc, { product, quantity }) => {
      const productData = await Product.findById(product);
      return (await acc) + (productData.price * quantity);
    }, Promise.resolve(0));

    const order = await Order.create({
      user: req.user._id,
      products: orderProducts,
      total,
    });

    // Update product stock
    await Promise.all(
      orderProducts.map(({ product, quantity }) =>
        Product.findByIdAndUpdate(product, { $inc: { stock: -quantity } })
      )
    );

    await order.populate('products.product');
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
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