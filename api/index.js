<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const players = require('./players');
const events = require('./events');
const weeklyRounds = require('./weekly_rounds');
const weeklyResults = require('./weekly_results');
const scoringSystem = require('./scoring_system');
const prizePayouts = require('./prize_payouts');
const messaging = require('./messaging');

router.use('/players', players);
router.use('/events', events);
router.use('/weekly_rounds', weeklyRounds);
router.use('/weekly_results', weeklyResults);
router.use('/scoring_system', scoringSystem);
router.use('/prize_payouts', prizePayouts);
router.use('/messaging', messaging);

router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

module.exports = router;
=======
import express from 'express';
import players from './players.js';
import events from './events.js';
import weeklyRounds from './weekly_rounds.js';
import weeklyResults from './weekly_results.js';
import scoringSystem from './scoring_system.js';
import prizePayouts from './prize_payouts.js';
import messaging from './messaging.js';

const router = express.Router();

// Public routes
router.use('/players', players);

// Admin routes (protected by authMiddleware in server.js)
router.use('/admin/players', players);
router.use('/admin/events', events);
router.use('/admin/weekly_rounds', weeklyRounds);
router.use('/admin/weekly_results', weeklyResults);
router.use('/admin/scoring_system', scoringSystem);
router.use('/admin/prize_payouts', prizePayouts);
router.use('/admin/messaging', messaging);

export default router;
>>>>>>> 0828b8efd2a0749d7766ddab07dd93b0befafd72
