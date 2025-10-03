const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const { hash, compare } = bcryptjs;

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    console.log('Registration attempt:', { email, name }); // Log registration attempt
    
    if (!email || !password || !name) {
      console.log('Missing fields:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    const existingUser = await User.findOne({ email });
    console.log('Existing user check:', { exists: !!existingUser });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'user', // Set default role
    });

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    if (error.message === 'JWT_SECRET is not configured') {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    res.status(500).json({ message: 'Failed to create user account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;