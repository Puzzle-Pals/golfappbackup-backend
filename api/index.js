const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to ensure JSON responses
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Admin Login Endpoint
router.post('/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        success: false,
        error: 'Password is required' 
      });
    }

    if (password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { role: 'admin' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );
      return res.json({ 
        success: true,
        token,
        message: 'Login successful' 
      });
    }

    return res.status(401).json({ 
      success: false,
      error: 'Invalid password' 
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Protected Admin Routes
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error();
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.use('/admin', authenticateAdmin, require('./admin'));

module.exports = router;