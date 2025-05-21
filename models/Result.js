const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  weekId: { type: mongoose.Schema.Types.ObjectId, ref: 'Round', required: true },
  winner1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  winner2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  secondPlace1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  secondPlace2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  deucePot1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  deucePot2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  closestToPinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  highestScoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
});

module.exports = mongoose.model('Result', resultSchema);