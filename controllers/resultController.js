const Result = require('../models/Result');
const Round = require('../models/Round');
const Player = require('../models/Player');

exports.getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('weekId')
      .populate('winner1Id winner2Id secondPlace1Id secondPlace2Id deucePot1Id deucePot2Id closestToPinId highestScoreId');
    res.json(results.map(r => ({
      _id: r._id,
      weekNumber: r.weekId.weekNumber,
      date: r.weekId.date,
      winner1Name: r.winner1Id?.name,
      winner2Name: r.winner2Id?.name,
      secondPlace1Name: r.secondPlace1Id?.name,
      secondPlace2Name: r.secondPlace2Id?.name,
      deucePot1Name: r.deucePot1Id?.name,
      deucePot2Name: r.deucePot2Id?.name,
      closestToPinName: r.closestToPinId?.name,
      highestScoreName: r.highestScoreId?.name,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

exports.addResult = async (req, res) => {
  const { weekId, winner1Id, winner2Id, secondPlace1Id, secondPlace2Id, deucePot1Id, deucePot2Id, closestToPinId, highestScoreId } = req.body;
  try {
    const result = new Result({
      weekId,
      winner1Id,
      winner2Id,
      secondPlace1Id,
      secondPlace2Id,
      deucePot1Id,
      deucePot2Id,
      closestToPinId,
      highestScoreId,
    });
    await result.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add result' });
  }
};