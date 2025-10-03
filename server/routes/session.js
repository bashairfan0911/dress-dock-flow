const express = require('express');
const router = express.Router();
const { Session } = require('../models');
const { auth } = require('../middleware/auth');

// Get all active sessions for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ 
      user: req.user._id, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current session details
router.get('/current', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const session = await Session.findOne({ 
      token, 
      user: req.user._id,
      isActive: true 
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Revoke a specific session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.isActive = false;
    await session.save();
    
    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Revoke all sessions except current
router.post('/revoke-all', auth, async (req, res) => {
  try {
    const currentToken = req.headers.authorization?.split(' ')[1];
    
    await Session.updateMany(
      { 
        user: req.user._id, 
        token: { $ne: currentToken },
        isActive: true 
      },
      { isActive: false }
    );
    
    res.json({ message: 'All other sessions revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clean up expired sessions (admin or cron job)
router.delete('/cleanup/expired', auth, async (req, res) => {
  try {
    const result = await Session.deleteMany({ 
      expiresAt: { $lt: new Date() }
    });
    
    res.json({ 
      message: 'Expired sessions cleaned up', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
