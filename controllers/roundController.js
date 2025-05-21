const Round = require('../models/Round');

exports.getRounds = async (req, res) => {
  try {
    const rounds = await Round.find();
    res.json(rounds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rounds' });
  }
};

exports.addRound = async (req, res) => {
  const { weekNumber, date } = req.body;
  try {
    const round = new Round({ weekNumber, date });
    await round.save();
    res.json(round);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add round' });
  }
};

exports.deleteRound = async (req, res) => {
  try {
    const round = await Round.findByIdAndDelete(req.params.id);
    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }
    res.json({ message: 'Round deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete round' });
  }
};