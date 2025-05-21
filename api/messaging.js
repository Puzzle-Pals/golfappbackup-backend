<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../db/bp-golf-app.db'));

// Send message to all players
router.post('/', (req, res) => {
  const { subject, message } = req.body;
  
  // In a real app, you would implement actual email/SMS sending here
  // For now, we'll just log it
  console.log(`New message to all players:
    Subject: ${subject}
    Message: ${message}
  `);
  
  res.json({ message: 'Message sent to all players' });
});

module.exports = router;
=======
import express from 'express';
import { Pool } from 'pg';
import 'dotenv/config';

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

// POST /api/admin/messaging - Send message to players
router.post('/', async (req, res) => {
  const { player_ids, message } = req.body;
  if (!message || !Array.isArray(player_ids)) {
    return res.status(400).json({ error: 'Message and player IDs array are required' });
  }
  try {
    const result = await pool.query(
      'SELECT email FROM players WHERE id = ANY($1)',
      [player_ids]
    );
    const emails = result.rows.map(row => row.email);
    // Mock email sending (replace with actual email service, e.g., Nodemailer)
    console.log('Sending message to:', emails);
    console.log('Message:', message);
    res.json({ message: `Message sent to ${emails.length} players` });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
>>>>>>> 0828b8efd2a0749d7766ddab07dd93b0befafd72
