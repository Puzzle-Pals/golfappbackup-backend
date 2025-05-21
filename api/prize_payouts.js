<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../db/bp-golf-app.db'));

// Get all prize payouts
router.get('/', (req, res) => {
  db.all('SELECT * FROM prize_payouts ORDER BY place ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update prize payouts
router.post('/', (req, res) => {
  const { payouts } = req.body; // Array of {place, percentage}
  
  db.serialize(() => {
    db.run('DELETE FROM prize_payouts', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const stmt = db.prepare('INSERT INTO prize_payouts (place, percentage) VALUES (?, ?)');
      payouts.forEach((payout) => {
        stmt.run(payout.place, payout.percentage);
      });
      stmt.finalize();
      res.json({ message: 'Prize payouts updated successfully' });
    });
  });
});

// Bulk upload prize payouts via CSV
router.post('/upload', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/prize_payouts.csv');
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'No CSV file found' });
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const payouts = result.data;
      db.serialize(() => {
        db.run('DELETE FROM prize_payouts', (err) => {
          if (err) return res.status(500).json({ error: err.message });
          
          const stmt = db.prepare('INSERT INTO prize_payouts (place, percentage) VALUES (?, ?)');
          payouts.forEach((payout) => {
            stmt.run(payout.place, payout.percentage);
          });
          stmt.finalize();
          res.json({ message: 'Prize payouts uploaded successfully' });
        });
      });
    },
    error: (err) => res.status(500).json({ error: err.message }),
  });
});

// Export prize payouts to CSV
router.get('/export', (req, res) => {
  db.all('SELECT * FROM prize_payouts ORDER BY place ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const csv = Papa.unparse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('prize_payouts.csv');
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

// GET /api/admin/prize_payouts - Fetch all prize payouts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pp.*, wr.weekly_round_id, e.date, e.course, wk.week_number
      FROM prize_payouts pp
      JOIN weekly_results wr ON pp.weekly_result_id = wr.id
      JOIN weekly_rounds wk ON wr.weekly_round_id = wk.id
      JOIN events e ON wk.event_id = e.id
      ORDER BY e.date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching prize payouts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/prize_payouts - Add a prize payout
router.post('/', async (req, res) => {
  const { weekly_result_id, total_prize_pool } = req.body;
  if (!weekly_result_id || !total_prize_pool) {
    return res.status(400).json({ error: 'Weekly result ID and total prize pool are required' });
  }
  const winners_amount = total_prize_pool * 0.3;
  const second_place_amount = total_prize_pool * 0.2;
  const deuce_pot_amount = total_prize_pool * 0.2;
  const closest_to_pin_amount = total_prize_pool * 0.2;
  const highest_score_amount = total_prize_pool * 0.1;
  try {
    const result = await pool.query(
      `INSERT INTO prize_payouts (
        weekly_result_id, total_prize_pool, winners_amount, second_place_amount,
        deuce_pot_amount, closest_to_pin_amount, highest_score_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        weekly_result_id, total_prize_pool, winners_amount, second_place_amount,
        deuce_pot_amount, closest_to_pin_amount, highest_score_amount
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding prize payout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
>>>>>>> 0828b8efd2a0749d7766ddab07dd93b0befafd72
