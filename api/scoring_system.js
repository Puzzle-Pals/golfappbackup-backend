<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(path.resolve(__dirname, '../db/bp-golf-app.db'));

// Get current scoring system
router.get('/', (req, res) => {
  db.get('SELECT * FROM scoring_system ORDER BY id DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || { system: 'default' });
  });
});

// Update scoring system
router.post('/', (req, res) => {
  const { system } = req.body;
  db.run(
    'INSERT INTO scoring_system (system) VALUES (?)',
    [system],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

module.exports = router;
=======
import express from 'express';
import { Pool } from 'pg';
import 'dotenv/config';

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

// GET /api/admin/scoring_system - Get scoring system status
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT is_enabled FROM scoring_system WHERE id = 1');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching scoring system:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/scoring_system - Update scoring system status
router.put('/', async (req, res) => {
  const { is_enabled } = req.body;
  if (typeof is_enabled !== 'boolean') {
    return res.status(400).json({ error: 'is_enabled must be a boolean' });
  }
  try {
    const result = await pool.query(
      'UPDATE scoring_system SET is_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING *',
      [is_enabled]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating scoring system:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
>>>>>>> 0828b8efd2a0749d7766ddab07dd93b0befafd72
