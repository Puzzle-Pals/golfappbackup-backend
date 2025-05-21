const Prize = require('../models/Prize');
const Round = require('../models/Round');

exports.getPrizes = async (req, res) => {
  try {
    const prizes = await Prize.find().populate('weekId');
    res.json(prizes.map(p => ({
      _id: p._id,
      weekNumber: p.weekId.weekNumber,
      date: p.weekId.date,
      totalPrizePool: p.totalPrizePool,
      winnersAmount: p.winnersAmount,
      secondPlaceAmount: p.secondPlaceAmount,
      deucePotAmount: p.deucePotAmount,
      closestToPinAmount: p.closestToPinAmount,
      highestScoreAmount: p.highestScoreAmount,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prizes' });
  }
};

exports.addPrize = async (req, res) => {
  const { weekId, totalPrizePool, winnersAmount, secondPlaceAmount, deucePotAmount, closestToPinAmount, highestScoreAmount } = req.body;
  try {
    const prize = new Prize({
      weekId,
      totalPrizePool,
      winnersAmount,
      secondPlaceAmount,
      deucePotAmount,
      closestToPinAmount,
      highestScoreAmount,
    });
    await prize.save();
    res.json(prize);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add prize' });
  }
};