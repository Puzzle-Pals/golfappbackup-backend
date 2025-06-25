const express = require('express');
const cors = require('cors');
const app = express();

// Change this to your actual deployed frontend URL:
const allowedOrigin = 'https://golfappbackup-frontend.vercel.app';

// CORS for all requests and preflight
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Import all your API routes from the api/index.js file
const apiRouter = require('./api/index.js');
app.use('/api', apiRouter);

// 404 handler for all other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// For Vercel: export as a serverless function handler
module.exports = (req, res) => app(req, res);

// For local testing only:
if (require.main === module) {
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
} 