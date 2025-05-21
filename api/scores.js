const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

router.get('/', async (req, res) => {
  try {
    const scores = await Score.find().populate('player event').lean();
    res.json(scores);
  } catch (err) {
    console.error('Error fetching scores:', err.message);
    res.status(500).json({ message: 'Server error fetching scores' });
  }
});

router.post('/', async (req, res) => {
  try {
    const score = new Score({
      player: req.body.playerId,
      event: req.body.eventId,
      score: req.body.score,
      date: req.body.date,
      points: req.body.points || 0,
    });
    const newScore = await score.save();
    res.status(201).json(newScore);
  } catch (err) {
    console.error('Error creating score:', err.message);
    res.status(400).json({ message: 'Server error creating score' });
  }
});

module.exports = router;