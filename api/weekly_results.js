<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../db/bp-golf-app.db'));

// Get all weekly results
router.get('/', (req, res) => {
  db.all('SELECT * FROM weekly_results', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add a weekly result
router.post('/', (req, res) => {
  const { roundId, playerId, score } = req.body;
  db.run(
    'INSERT INTO weekly_results (roundId, playerId, score) VALUES (?, ?, ?)',
    [roundId, playerId, score],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Update a weekly result
router.put('/:id', (req, res) => {
  const { roundId, playerId, score } = req.body;
  db.run(
    'UPDATE weekly_results SET roundId = ?, playerId = ?, score = ? WHERE id = ?',
    [roundId, playerId, score, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Delete a weekly result
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM weekly_results WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Bulk upload weekly results via CSV
router.post('/upload', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/weekly_results.csv');
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'No CSV file found' });
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const results = result.data;
      db.serialize(() => {
        const stmt = db.prepare('INSERT INTO weekly_results (roundId, playerId, score) VALUES (?, ?, ?)');
        results.forEach((result) => {
          stmt.run(result.roundId, result.playerId, result.score);
        });
        stmt.finalize();
        res.json({ message: 'Weekly results uploaded successfully' });
      });
    },
    error: (err) => res.status(500).json({ error: err.message }),
  });
});

// Export weekly results to CSV
router.get('/export', (req, res) => {
  db.all('SELECT * FROM weekly_results', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const csv = Papa.unparse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('weekly_results.csv');
    res.send(csv);
  });
});

module.exports = router;
=======
import express from 'express';
import { Pool } from 'pg';
import 'dotenv/config';

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

// GET /api/admin/weekly_results - Fetch all weekly results
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        wr.id, wr.weekly_round_id, wr.created_at,
        w1.name AS winner1_name, w2.name AS winner2_name,
        s1.name AS second_place1_name, s2.name AS second_place2_name,
        d1.name AS deuce_pot1_name, d2.name AS deuce_pot2_name,
        ctp.name AS closest_to_pin_name, hs.name AS highest_score_name,
        e.date, e.course, wk.week_number
      FROM weekly_results wr
      JOIN weekly_rounds wk ON wr.weekly_round_id = wk.id
      JOIN events e ON wk.event_id = e.id
      LEFT JOIN players w1 ON wr.winner1_id = w1.id
      LEFT JOIN players w2 ON wr.winner2_id = w2.id
      LEFT JOIN players s1 ON wr.second_place1_id = s1.id
      LEFT JOIN players s2 ON wr.second_place2_id = s2.id
      LEFT JOIN players d1 ON wr.deuce_pot1_id = d1.id
      LEFT JOIN players d2 ON wr.deuce_pot2_id = d2.id
      LEFT JOIN players ctp ON wr.closest_to_pin_id = ctp.id
      LEFT JOIN players hs ON wr.highest_score_id = hs.id
      ORDER BY e.date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching weekly results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/weekly_results - Add weekly results
router.post('/', async (req, res) => {
  const {
    weekly_round_id, winner1_id, winner2_id, second_place1_id, second_place2_id,
    deuce_pot1_id, deuce_pot2_id, closest_to_pin_id, highest_score_id
  } = req.body;
  if (!weekly_round_id) {
    return res.status(400).json({ error: 'Weekly round ID is required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO weekly_results (
        weekly_round_id, winner1_id, winner2_id, second_place1_id, second_place2_id,
        deuce_pot1_id, deuce_pot2_id, closest_to_pin_id, highest_score_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        weekly_round_id, winner1_id || null, winner2_id || null,
        second_place1_id || null, second_place2_id || null,
        deuce_pot1_id || null, deuce_pot2_id || null,
        closest_to_pin_id || null, highest_score_id || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding weekly result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
>>>>>>> 0828b8efd2a0749d7766ddab07dd93b0befafd72
