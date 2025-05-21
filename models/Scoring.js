const mongoose = require('mongoose');

const scoringSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, default: false },
});

module.exports = mongoose.model('Scoring', scoringSchema);