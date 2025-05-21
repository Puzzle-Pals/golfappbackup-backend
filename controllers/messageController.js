const Message = require('../models/Message');
const Player = require('../models/Player');
// Note: Email sending requires a service like Nodemailer, which isn't implemented here.
// You'll need to add Nodemailer or another email service in production.

exports.sendMessage = async (req, res) => {
  const { playerIds, subject, message } = req.body;
  try {
    const players = await Player.find({ _id: { $in: playerIds } });
    const msg = new Message({
      playerIds,
      subject,
      message,
      recipients: players.map(p => ({ name: p.name, email: p.email })),
    });
    await msg.save();
    // Placeholder for email sending logic
    console.log('Sending email to:', players.map(p => p.email));
    res.json({ message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};