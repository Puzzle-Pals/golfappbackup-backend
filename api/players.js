const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Papa = require('papaparse');
const fs = require('fs');

const db = new sqlite3.Database(path.resolve(__dirname, '../db/bp-golf-app.db'));

// Get all players
router.get('/', (req, res) => {
  db.all('SELECT * FROM players', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new player
router.post('/', (req, res) => {
  const { name, email, handicap } = req.body;
  db.run(
    'INSERT INTO players (name, email, handicap) VALUES (?, ?, ?)',
    [name, email, handicap || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Update player
router.put('/:id', (req, res) => {
  const { name, email, handicap } = req.body;
  db.run(
    'UPDATE players SET name = ?, email = ?, handicap = ? WHERE id = ?',
    [name, email, handicap || null, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changes: this.changes });
    }
  );
});

// Delete player
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM players WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// CSV Import/Export
router.post('/import', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/players.csv');
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'CSV file not found' });
  }

  const csvData = fs.readFileSync(filePath, 'utf8');
  Papa.parse(csvData, {
    header: true,
    complete: (results) => {
      db.serialize(() => {
        const stmt = db.prepare('INSERT INTO players (name, email, handicap) VALUES (?, ?, ?)');
        results.data.forEach(player => {
          stmt.run(player.name, player.email, player.handicap || null);
        });
        stmt.finalize();
        res.json({ imported: results.data.length });
      });
    },
    error: (err) => res.status(500).json({ error: err.message })
  });
});

router.get('/export', (req, res) => {
  db.all('SELECT * FROM players', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const csv = Papa.unparse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('players_export.csv');
    res.send(csv);
  });
});

module.exports = router;