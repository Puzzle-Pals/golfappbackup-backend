const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  score: { type: Number, required: true },
  date: { type: String, required: true },
  points: { type: Number, default: 0 }, // For optional point system
});

module.exports = mongoose.model('Score', scoreSchema);