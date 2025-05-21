const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  weekId: { type: mongoose.Schema.Types.ObjectId, ref: 'Round', required: true },
  totalPrizePool: { type: Number, required: true },
  winnersAmount: { type: Number, required: true },
  secondPlaceAmount: { type: Number, required: true },
  deucePotAmount: { type: Number, required: true },
  closestToPinAmount: { type: Number, required: true },
  highestScoreAmount: { type: Number, required: true },
});

module.exports = mongoose.model('Prize', prizeSchema);