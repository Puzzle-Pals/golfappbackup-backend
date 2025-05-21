const Player = require('../models/Player');

exports.getPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
};

exports.addPlayer = async (req, res) => {
  const { name, email } = req.body;
  try {
    const player = new Player({ name, email });
    await player.save();
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add player' });
  }
};

exports.updatePlayer = async (req, res) => {
  const { name, email } = req.body;
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, { name, email }, { new: true });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update player' });
  }
};

exports.deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
};

exports.bulkUploadPlayers = async (req, res) => {
  const { players } = req.body;
  try {
    const validPlayers = players.filter(p => p.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email));
    if (validPlayers.length !== players.length) {
      return res.status(400).json({ error: 'Some entries have invalid data' });
    }
    await Player.insertMany(validPlayers, { ordered: false });
    res.json({ message: 'Players uploaded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload players' });
  }
};