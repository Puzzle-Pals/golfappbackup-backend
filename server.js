const express = require('express');
const cors = require('cors');
const app = express();

// Change to your actual deployed frontend:
const allowedOrigin = 'https://golfappbackup-frontend.vercel.app';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS for all routes
app.options('*', cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// -- YOUR ROUTES BELOW --
// (example test route)
app.post('/api/admin/login', (req, res) => {
  res.json({ success: true });
});

// 404 handler for all other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// THIS IS CRUCIAL: DO NOT CALL app.listen() ON VERCEL!
module.exports = (req, res) => app(req, res);

// For local testing only:
if (require.main === module) {
  app.listen(3000, () => console.log('Server running'));
}