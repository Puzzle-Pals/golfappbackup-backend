const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigin = 'https://golfappbackup-frontend.vercel.app'; // your real frontend

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

// Import routers
const apiRouter = require('./api/index.js');
app.use('/api', apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Vercel serverless handler
module.exports = (req, res) => app(req, res);

// Local dev only
if (require.main === module) {
  app.listen(3000, () => console.log('Local server running on http://localhost:3000'));
}