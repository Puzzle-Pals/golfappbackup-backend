<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../db/bp-golf-app.db'));

// Get all events
router.get('/', (req, res) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add an event
router.post('/', (req, res) => {
  const { name, date, course } = req.body;
  db.run(
    'INSERT INTO events (name, date, course) VALUES (?, ?, ?)',
    [name, date, course],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Update an event
router.put('/:id', (req, res) => {
  const { name, date, course } = req.body;
  db.run(
    'UPDATE events SET name = ?, date = ?, course = ? WHERE id = ?',
    [name, date, course, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Delete an event
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM events WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Bulk upload events via CSV
router.post('/upload', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/events.csv');
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'No CSV file found' });
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const events = result.data;
      db.serialize(() => {
        const stmt = db.prepare('INSERT INTO events (name, date, course) VALUES (?, ?, ?)');
        events.forEach((event) => {
          stmt.run(event.name, event.date, event.course);
        });
        stmt.finalize();
        res.json({ message: 'Events uploaded successfully' });
      });
    },
    error: (err) => res.status(500).json({ error: err.message }),
  });
});

// Export events to CSV
router.get('/export', (req, res) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const csv = Papa.unparse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('events.csv');
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

// GET /api/admin/events - Fetch all events
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date, time');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/events - Add an event
router.post('/', async (req, res) => {
  const { date, time, course = 'Lake of the Sandhills Golf Course', details } = req.body;
  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO events (date, time, course, details) VALUES ($1, $2, $3, $4) RETURNING *',
      [date, time, course, details]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/events/:id - Update an event
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { date, time, course, details } = req.body;
  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required' });
  }
  try {
    const result = await pool.query(
      'UPDATE events SET date = $1, time = $2, course = $3, details = $4 WHERE id = $5 RETURNING *',
      [date, time, course || 'Lake of the Sandhills Golf Course', details, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/events/:id - Delete an event
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
>>>>>>> 0828b8efd2a0749d7766ddab07dd93b0befafd72
