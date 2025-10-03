require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./models');

const menProducts = [
  {
    name: "Men's Classic White T-Shirt",
    description: 'Comfortable cotton t-shirt perfect for everyday wear.',
    price: 24.99,
    stock: 100,
    category: 'men',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
  },
  {
    name: "Men's Slim Fit Jeans",
    description: 'Modern slim fit jeans in dark blue wash.',
    price: 59.99,
    stock: 75,
    category: 'men',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
  },
  {
    name: "Men's Leather Jacket",
    description: 'Classic black leather jacket with premium quality.',
    price: 249.99,
    stock: 30,
    category: 'men',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
  },
  {
    name: "Men's Casual Sneakers",
    description: 'Comfortable white sneakers for daily activities.',
    price: 89.99,
    stock: 60,
    category: 'men',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
  },
  {
    name: "Men's Formal Shirt",
    description: 'Elegant formal shirt for business occasions.',
    price: 45.99,
    stock: 50,
    category: 'men',
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500',
  },
  {
    name: "Men's Hoodie",
    description: 'Cozy pullover hoodie for casual comfort.',
    price: 54.99,
    stock: 80,
    category: 'men',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
  },
  {
    name: "Men's Chino Pants",
    description: 'Versatile chino pants in khaki color.',
    price: 49.99,
    stock: 65,
    category: 'men',
    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500',
  },
  {
    name: "Men's Sports Watch",
    description: 'Stylish sports watch with multiple features.',
    price: 129.99,
    stock: 40,
    category: 'men',
    image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500',
  },
  {
    name: "Men's Winter Coat",
    description: 'Warm winter coat with insulated lining.',
    price: 179.99,
    stock: 35,
    category: 'men',
    image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500',
  },
  {
    name: "Men's Running Shoes",
    description: 'High-performance running shoes with cushioning.',
    price: 119.99,
    stock: 55,
    category: 'men',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  },
];

const womenProducts = [
  {
    name: "Women's Summer Dress",
    description: 'Flowy summer dress perfect for warm weather.',
    price: 64.99,
    stock: 70,
    category: 'women',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
  },
  {
    name: "Women's Denim Jacket",
    description: 'Classic denim jacket for casual style.',
    price: 79.99,
    stock: 50,
    category: 'women',
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
  },
  {
    name: "Women's High Heels",
    description: 'Elegant high heels for special occasions.',
    price: 94.99,
    stock: 45,
    category: 'women',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
  },
  {
    name: "Women's Yoga Pants",
    description: 'Comfortable yoga pants with stretch fabric.',
    price: 39.99,
    stock: 90,
    category: 'women',
    image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500',
  },
  {
    name: "Women's Blouse",
    description: 'Elegant silk blouse for office wear.',
    price: 54.99,
    stock: 60,
    category: 'women',
    image_url: 'https://images.unsplash.com/photo-1564257577-d18b5b6c4b3d?w=500',
  },
  {
    name: "Women's Handbag",
    description: 'Stylish leather handbag with multiple compartments.',
    price: 149.99,
    stock: 40,
    category: 'women',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
  },
  {
    name: "Women's Cardigan",
    description: 'Cozy knit cardigan for layering.',
    price: 49.99,
    stock: 75,
    category: 'women',
    image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500',
  },
  {
    name: "Women's Maxi Skirt",
    description: 'Flowing maxi skirt in floral pattern.',
    price: 44.99,
    stock: 55,
    category: 'women',
    image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500',
  },
  {
    name: "Women's Ankle Boots",
    description: 'Trendy ankle boots with block heel.',
    price: 109.99,
    stock: 48,
    category: 'women',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
  },
  {
    name: "Women's Sunglasses",
    description: 'Designer sunglasses with UV protection.',
    price: 89.99,
    stock: 65,
    category: 'women',
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
  },
];

const sampleProducts = [...menProducts, ...womenProducts];

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