<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../db/bp-golf-app.db'));

// Get all players
router.get('/', (req, res) => {
  db.all('SELECT * FROM players', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add a player
router.post('/', (req, res) => {
  const { name, email, handicap } = req.body;
  db.run(
    'INSERT INTO players (name, email, handicap) VALUES (?, ?, ?)',
    [name, email, handicap],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Update a player
router.put('/:id', (req, res) => {
  const { name, email, handicap } = req.body;
  db.run(
    'UPDATE players SET name = ?, email = ?, handicap = ? WHERE id = ?',
    [name, email, handicap, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Delete a player
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM players WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Bulk upload players via CSV
router.post('/upload', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/players.csv');
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'No CSV file found' });
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const players = result.data;
      db.serialize(() => {
        const stmt = db.prepare('INSERT INTO players (name, email, handicap) VALUES (?, ?, ?)');
        players.forEach((player) => {
          stmt.run(player.name, player.email, player.handicap || null);
        });
        stmt.finalize();
        res.json({ message: 'Players uploaded successfully' });
      });
    },
    error: (err) => res.status(500).json({ error: err.message }),
  });
});

// Export players to CSV
router.get('/export', (req, res) => {
  db.all('SELECT * FROM players', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const csv = Papa.unparse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('players.csv');
    res.send(csv);
  });
});

module.exports = router;
=======
import express from 'express';
import { Pool } from 'pg';
import 'dotenv/config';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

// Public: GET /api/players - Fetch players (name only)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM players ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: GET /api/admin/players - Fetch players (including email)
router.get('/admin/players', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, created_at FROM players ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: POST /api/admin/players - Add a player
router.post('/admin/players', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO players (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: PUT /api/admin/players/:id - Update a player
router.put('/admin/players/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    const result = await pool.query(
      'UPDATE players SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at',
      [name, email, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: DELETE /api/admin/players/:id - Delete a player
router.delete('/admin/players/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM players WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ message: 'Player deleted' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: POST /api/admin/players/bulk - Bulk upload players via CSV
router.post('/admin/players/bulk', async (req, res) => {
  if (!req.body.csvData) {
    return res.status(400).json({ error: 'CSV data is required' });
  }
  const parser = parse({ columns: true, trim: true });
  const stream = Readable.from(req.body.csvData);
  const players = [];
  parser.on('readable', () => {
    let record;
    while ((record = parser.read())) {
      if (record.name && record.email) {
        players.push([record.name, record.email]);
      }
    }
  });
  parser.on('error', (error) => {
    console.error('Error parsing CSV:', error);
    res.status(500).json({ error: 'Failed to parse CSV' });
  });
  parser.on('end', async () => {
    try {
      await pool.query('BEGIN');
      for (const [name, email] of players) {
        await pool.query('INSERT INTO players (name, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING', [name, email]);
      }
      await pool.query('COMMIT');
      res.json({ message: `${players.length} players processed` });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error uploading players:', error);
      res.status(500).json({ error: 'Failed to upload players' });
    }
  });
  stream.pipe(parser);
});

export default router;
>>>>>>> 0828b8efd2a0749d7766ddab07dd93b0befafd72
