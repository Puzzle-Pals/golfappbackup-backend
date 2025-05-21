const express = require('express');
const router = express.Router();
const players = require('./players');

router.use('/players', players);

router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

module.exports = router;