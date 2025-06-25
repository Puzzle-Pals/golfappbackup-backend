const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminRoutes = require('./admin');
// ...import other routers as needed

const router = express.Router();

// --- Startup diagnostics (log presence of critical env vars, do NOT log secrets) ---
if (!process.env.ADMIN_PASSWORD) {
  console.error('[BOOT] Missing ADMIN_PASSWORD environment variable!');
}
if (!process.env.JWT_SECRET) {
  console.error('[BOOT] Missing JWT_SECRET environment variable!');
}

// --- Admin Login Endpoint ---
router.post('/admin/login', (req, res) => {
  try {
    // Runtime check for env vars
    if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
      console.error('[RUNTIME] Missing env vars: ADMIN_PASSWORD or JWT_SECRET');
      return res.status(500).json({
        success: false,
        error: 'Server misconfiguration: Missing environment variables'
      });
    }

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

// --- JWT Middleware for Protected Routes ---
const authenticateAdmin = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error('[RUNTIME] Missing env var: JWT_SECRET');
    return res.status(500).json({ error: 'Server misconfiguration: Missing JWT_SECRET' });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error();
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Example Protected Route ---
router.get('/admin/check-auth', authenticateAdmin, (req, res) => {
  res.json({ success: true, message: 'You are authenticated as admin.' });
});

// --- Mount Other Routers, With JWT Middleware ---
router.use('/admin', authenticateAdmin, adminRoutes);
// ... mount other routers as needed, e.g.:
// router.use('/events', eventsRoutes);

router.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

module.exports = router;