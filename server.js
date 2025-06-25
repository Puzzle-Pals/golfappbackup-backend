const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRouter = require('./api/index.js');

const app = express();

const allowedOrigin = 'https://bp-golf-app.vercel.app'; // Your actual frontend domain

// CORS for all requests
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight globally
app.options('*', cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Mount all your API routes under /api
app.use('/api', apiRouter);

// Fallback 404 for anything not handled
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- THIS IS THE CRITICAL PART FOR VERCEL ---
module.exports = (req, res) => {
  app(req, res);
};

// For local dev (optional, not used by Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}