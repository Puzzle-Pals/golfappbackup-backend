const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Player = require('../models/Player');
const Score = require('../models/Score');
const Setting = require('../models/Setting');
const XLSX = require('xlsx');
const { createObjectCsvStringifier } = require('csv-writer');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1029';

router.use((req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
});

// Create Event
router.post('/events', async (req, res) => {
  try {
    const event = new Event({
      date: req.body.date,
      course: req.body.course,
      time: req.body.time,
      details: req.body.details,
    });
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error creating event:', err.message);
    res.status(400).json({ message: 'Server error creating event' });
  }
});

// Edit Event
router.put('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        date: req.body.date,
        course: req.body.course,
        time: req.body.time,
        details: req.body.details,
      },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error('Error updating event:', err.message);
    res.status(400).json({ message: 'Server error updating event' });
  }
});

// Delete Event
router.delete('/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Error deleting event:', err.message);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

// Create Player
router.post('/players', async (req, res) => {
  try {
    const player = new Player({
      name: req.body.name,
      handicap: req.body.handicap || 0,
    });
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (err) {
    console.error('Error creating player:', err.message);
    res.status(400).json({ message: 'Server error creating player' });
  }
});

// Edit Player
router.put('/players/:id', async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        handicap: req.body.handicap || 0,
      },
      { new: true }
    );
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) {
    console.error('Error updating player:', err.message);
    res.status(400).json({ message: 'Server error updating player' });
  }
});

// Delete Player
router.delete('/players/:id', async (req, res) => {
  try {
    await Player.findByIdAndDelete(req.params.id);
    res.json({ message: 'Player deleted' });
  } catch (err) {
    console.error('Error deleting player:', err.message);
    res.status(500).json({ message: 'Server error deleting player' });
  }
});

// Create Score
router.post('/scores', async (req, res) => {
  try {
    const score = new Score({
      player: req.body.playerId,
      event: req.body.eventId,
      score: req.body.score,
      date: req.body.date,
      points: req.body.points || 0,
    });
    const newScore = await score.save();
    res.status(201).json(newScore);
  } catch (err) {
    console.error('Error creating score:', err.message);
    res.status(400).json({ message: 'Server error creating score' });
  }
});

// Edit Score
router.put('/scores/:id', async (req, res) => {
  try {
    const score = await Score.findByIdAndUpdate(
      req.params.id,
      {
        player: req.body.playerId,
        event: req.body.eventId,
        score: req.body.score,
        date: req.body.date,
        points: req.body.points || 0,
      },
      { new: true }
    );
    if (!score) return res.status(404).json({ message: 'Score not found' });
    res.json(score);
  } catch (err) {
    console.error('Error updating score:', err.message);
    res.status(400).json({ message: 'Server error updating score' });
  }
});

// Delete Score
router.delete('/scores/:id', async (req, res) => {
  try {
    await Score.findByIdAndDelete(req.params.id);
    res.json({ message: 'Score deleted' });
  } catch (err) {
    console.error('Error deleting score:', err.message);
    res.status(500).json({ message: 'Server error deleting score' });
  }
});

// Upload XLSX
router.post('/upload', async (req, res) => {
  try {
    const buffer = req.body.buffer;
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const errors = [];
    for (const row of data) {
      try {
        if (row.type === 'event') {
          await Event.create({
            date: row.date,
            course: row.course,
            time: row.time,
            details: row.details,
          });
        } else if (row.type === 'player') {
          await Player.create({
            name: row.name,
            handicap: row.handicap || 0,
          });
        } else if (row.type === 'score') {
          const player = await Player.findOne({ name: row.player });
          const event = await Event.findOne({ course: row.course, date: row.date });
          if (!player) errors.push(`Player not found: ${row.player}`);
          if (!event) errors.push(`Event not found: ${row.course} on ${row.date}`);
          if (player && event) {
            await Score.create({
              player: player._id,
              event: event._id,
              score: row.score,
              date: row.date,
              points: row.points || 0,
            });
          }
        } else {
          errors.push(`Invalid type: ${row.type}`);
        }
      } catch (err) {
        errors.push(`Error processing row: ${JSON.stringify(row)} - ${err.message}`);
      }
    }
    res.json({ message: 'Data uploaded', errors });
  } catch (err) {
    console.error('Error uploading XLSX:', err.message);
    res.status(500).json({ message: 'Server error uploading XLSX', error: err.message });
  }
});

// Export CSV
router.get('/export', async (req, res) => {
  try {
    const events = await Event.find().lean();
    const players = await Player.find().lean();
    const scores = await Score.find().populate('player event').lean();

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'type', title: 'Type' },
        { id: 'name', title: 'Name' },
        { id: 'course', title: 'Course' },
        { id: 'date', title: 'Date' },
        { id: 'time', title: 'Time' },
        { id: 'details', title: 'Details' },
        { id: 'handicap', title: 'Handicap' },
        { id: 'score', title: 'Score' },
        { id: 'points', title: 'Points' },
      ],
    });

    const records = [
      ...events.map(e => ({
        type: 'event',
        course: e.course,
        date: e.date,
        time: e.time,
        details: e.details,
      })),
      ...players.map(p => ({
        type: 'player',
        name: p.name,
        handicap: p.handicap,
      })),
      ...scores.map(s => ({
        type: 'score',
        name: s.player.name,
        course: s.event.course,
        date: s.date,
        score: s.score,
        points: s.points,
      })),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=data.csv');
    res.send(csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records));
  } catch (err) {
    console.error('Error exporting CSV:', err.message);
    res.status(500).json({ message: 'Server error exporting CSV' });
  }
});

// Get/Set Point System
router.get('/settings/point-system', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'pointSystem' });
    res.json({ enabled: setting ? setting.value : false });
  } catch (err) {
    console.error('Error fetching point system:', err.message);
    res.status(500).json({ message: 'Server error fetching point system' });
  }
});

router.post('/settings/point-system', async (req, res) => {
  try {
    const { enabled } = req.body;
    await Setting.findOneAndUpdate(
      { key: 'pointSystem' },
      { key: 'pointSystem', value: enabled },
      { upsert: true }
    );
    res.json({ message: 'Point system updated', enabled });
  } catch (err) {
    console.error('Error updating point system:', err.message);
    res.status(500).json({ message: 'Server error updating point system' });
  }
});

module.exports = router;