require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./models');

const sampleProducts = [
  {
    name: 'Classic White T-Shirt',
    description: 'A comfortable and versatile white t-shirt made from 100% cotton.',
    price: 19.99,
    stock: 100,
    image_url: 'https://example.com/white-tshirt.jpg',
  },
  {
    name: 'Slim Fit Jeans',
    description: 'Modern slim fit jeans in dark blue wash.',
    price: 49.99,
    stock: 50,
    image_url: 'https://example.com/slim-jeans.jpg',
  },
  {
    name: 'Leather Jacket',
    description: 'Classic black leather jacket with silver hardware.',
    price: 199.99,
    stock: 25,
    image_url: 'https://example.com/leather-jacket.jpg',
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const products = await Product.insertMany(sampleProducts);
    console.log('Added sample products:', products);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();