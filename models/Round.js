const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Round', roundSchema);