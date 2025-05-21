const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  playerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  subject: { type: String, required: true },
  message: { type: String, required: true },
  recipients: [{ name: String, email: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);