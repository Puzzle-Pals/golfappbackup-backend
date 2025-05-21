const Scoring = require('../models/Scoring');

exports.getScoringStatus = async (req, res) => {
  try {
    const scoring = await Scoring.findOne() || { isEnabled: false };
    res.json(scoring);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scoring status' });
  }
};

exports.updateScoringStatus = async (req, res) => {
  const { isEnabled } = req.body;
  try {
    await Scoring.updateOne({}, { isEnabled }, { upsert: true });
    res.json({ message: 'Scoring updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update scoring' });
  }
};