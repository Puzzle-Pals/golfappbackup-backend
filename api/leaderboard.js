const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

router.get('/', async (req, res) => {
  try {
    const leaderboard = await Score.aggregate([
      {
        $group: {
          _id: '$player',
          totalPoints: { $sum: '$points' },
          totalScore: { $sum: '$score' },
          eventsPlayed: { $count: {} },
        },
      },
      {
        $lookup: {
          from: 'players',
          localField: '_id',
          foreignField: '_id',
          as: 'player',
        },
      },
      { $unwind: '$player' },
      {
        $project: {
          name: '$player.name',
          totalPoints: 1,
          totalScore: 1,
          eventsPlayed: 1,
        },
      },
      { $sort: { totalPoints: -1, totalScore: 1 } },
    ]);
    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err.message);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

module.exports = router;