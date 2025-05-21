require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const apiRoutes = require('./api');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const dbPath = path.resolve(__dirname, 'db/bp-golf-app.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database at', dbPath);
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'Connected',
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Clean exit
process.on('SIGTERM', () => {
  db.close();
  server.close();
  process.exit(0);
});