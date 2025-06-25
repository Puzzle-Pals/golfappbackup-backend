const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminRoutes = require('./admin');
// ...import other routers as needed

const app = express();

// Only allow your deployed frontend
const allowedOrigin = 'https://bp-golf-app.vercel.app'; // or your actual frontend domain

// CORS for all requests
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Explicitly handle all OPTIONS preflight
app.options('*', cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// --- Admin Login Endpoint ---
app.post('/admin/login', (req, res) => {
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

// --- JWT Middleware for Protected Routes ---
const authenticateAdmin = (req, res, next) => {
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
app.get('/admin/check-auth', authenticateAdmin, (req, res) => {
  res.json({ success: true, message: 'You are authenticated as admin.' });
});

// --- Mount Other Routers, With JWT Middleware ---
app.use('/admin', authenticateAdmin, adminRoutes);
// ... mount other routers as needed, e.g.:
// app.use('/events', eventsRoutes);

// --- Catch-all 404 for unknown API routes ---
app.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// --- Export for Vercel serverless ---
module.exports = app;

// --- Allow local dev running (optional, not used by Vercel) ---
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}