<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../db/bp-golf-app.db'));

// Get all weekly rounds
router.get('/', (req, res) => {
  db.all('SELECT * FROM weekly_rounds', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add a weekly round
router.post('/', (req, res) => {
  const { eventId, date, course } = req.body;
  db.run(
    'INSERT INTO weekly_rounds (eventId, date, course) VALUES (?, ?, ?)',
    [eventId, date, course],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Update a weekly round
router.put('/:id', (req, res) => {
  const { eventId, date, course } = req.body;
  db.run(
    'UPDATE weekly_rounds SET eventId = ?, date = ?, course = ? WHERE id = ?',
    [eventId, date, course, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Delete a weekly round
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM weekly_rounds WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Bulk upload weekly rounds via CSV
router.post('/upload', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/weekly_rounds.csv');
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'No CSV file found' });
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const rounds = result.data;
      db.serialize(() => {
        const stmt = db.prepare('INSERT INTO weekly_rounds (eventId, date, course) VALUES (?, ?, ?)');
        rounds.forEach((round) => {
          stmt.run(round.eventId, round.date, round.course);
        });
        stmt.finalize();
        res.json({ message: 'Weekly rounds uploaded successfully' });
      });
    },
    error: (err) => res.status(500).json({ error: err.message }),
  });
});

// Export weekly rounds to CSV
router.get('/export', (req, res) => {
  db.all('SELECT * FROM weekly_rounds', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const csv = Papa.unparse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('weekly_rounds.csv');
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

// GET /api/admin/weekly_rounds - Fetch all weekly rounds
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT wr.id, wr.week_number, wr.created_at, e.date, e.time, e.course
      FROM weekly_rounds wr
      JOIN events e ON wr.event_id = e.id
      ORDER BY e.date
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching weekly rounds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/weekly_rounds - Add a weekly round
router.post('/', async (req, res) => {
  const { event_id, week_number } = req.body;
  if (!event_id || !week_number) {
    return res.status(400).json({ error: 'Event ID and week number are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO weekly_rounds (event_id, week_number) VALUES ($1, $2) RETURNING *',
      [event_id, week_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding weekly round:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/weekly_rounds/:id - Delete a weekly round
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM weekly_rounds WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Weekly round not found' });
    }
    res.json({ message: 'Weekly"].concat([" round deleted' });
  } catch (error) {
    console.error('Error deleting weekly round:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
>>>>>>> 0828b8efd2a0749d7766ddab07dd93b0befafd72
