const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Mixed },
});

module.exports = mongoose.model('Setting', settingSchema);