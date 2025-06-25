const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../db/bp-golf-app.db'));

// [Keep all your original CRUD endpoints unchanged...]

// Updated CSV upload using papaparse
router.post('/upload', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/players.csv');
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'No CSV file found' });
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  Papa.parse(fileContent, {
    header: true,
    complete: (results) => {
      db.serialize(() => {
        const stmt = db.prepare('INSERT INTO players (name, email, handicap) VALUES (?, ?, ?)');
        results.data.forEach((row) => {
          stmt.run(row.name, row.email, row.handicap || null);
        });
        stmt.finalize();
        res.json({ message: `Successfully imported ${results.data.length} players` });
      });
    },
    error: (err) => res.status(500).json({ error: err.message })
  });
});

// Updated CSV export using papaparse
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