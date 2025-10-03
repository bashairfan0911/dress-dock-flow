const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function auth(req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    console.log('Auth middleware - Authorization header present:', !!authHeader);
    console.log('Auth middleware - token present:', !!token);

    if (!token) {
      console.log('Auth middleware - No token found');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware - decoded token:', decoded);
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('Auth middleware - user not found for token');
        return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = user;
      next();
    } catch (innerErr) {
      console.error('Auth middleware - token verification failed:', innerErr.message);
      return res.status(401).json({ message: 'Token is invalid' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Token is invalid' });
  }
}

module.exports = { auth };