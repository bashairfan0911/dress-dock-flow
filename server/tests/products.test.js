const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { Product, User } = require('../models');

describe('Products API Tests', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    
    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User'
      });
    
    await User.findByIdAndUpdate(adminRes.body.user._id, { role: 'admin' });
    
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });
    
    adminToken = adminLogin.body.token;

    // Create regular user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        password: 'user123',
        name: 'Regular User'
      });
    
    userToken = userRes.body.token;
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const res = await request(app).get('/api/products');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/products', () => {
    it('should create product with admin token', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 10,
          image_url: 'https://example.com/image.jpg',
          category: 'men'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('name', 'Test Product');
    });

    it('should not create product without admin token', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Product',
          description: 'Test',
          price: 50,
          stock: 5,
          image_url: 'https://example.com/image.jpg'
        });
      
      expect(res.statusCode).toBe(403);
    });
  });
});
