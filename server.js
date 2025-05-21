<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const apiRoutes = require('./api');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

const db = new sqlite3.Database(path.resolve(__dirname, 'db/bp-golf-app.db'), (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    // Initialize database if tables don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        handicap INTEGER
      );
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        course TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS weekly_rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId INTEGER NOT NULL,
        date TEXT NOT NULL,
        course TEXT NOT NULL,
        FOREIGN KEY (eventId) REFERENCES events(id)
      );
      CREATE TABLE IF NOT EXISTS weekly_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roundId INTEGER NOT NULL,
        playerId INTEGER NOT NULL,
        score INTEGER NOT NULL,
        FOREIGN KEY (roundId) REFERENCES weekly_rounds(id),
        FOREIGN KEY (playerId) REFERENCES players(id)
      );
      CREATE TABLE IF NOT EXISTS scoring_system (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        system TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS prize_payouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        place INTEGER NOT NULL,
        percentage REAL NOT NULL
      );
    `, (err) => {
      if (err) console.error('Database initialization error:', err);
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
=======
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});
const Player = mongoose.model('Player', playerSchema);

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
});
const Event = mongoose.model('Event', eventSchema);

const newsSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const News = mongoose.model('News', newsSchema);

const resultSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  winner1Name: { type: String, required: true },
  winner2Name: { type: String },
});
const Result = mongoose.model('Result', resultSchema);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Players
app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.post('/api/players', authenticateToken, async (req, res) => {
  try {
    const players = Array.isArray(req.body) ? req.body : [req.body];
    const savedPlayers = await Promise.all(
      players.map(async ({ name, email }) => {
        let player = await Player.findOne({ email });
        if (player) {
          player.name = name;
          return await player.save();
        } else {
          return await new Player({ name, email }).save();
        }
      })
    );
    res.status(201).json(savedPlayers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add players' });
  }
});

app.put('/api/players/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const player = await Player.findByIdAndUpdate(req.params.id, { name, email }, { new: true });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update player' });
  }
});

app.delete('/api/players/:id', authenticateToken, async (req, res) => {
  try {
    await Player.findByIdAndDelete(req.params.id);
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

// Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { name, date, location } = req.body;
    const event = new Event({ name, date, location });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add event' });
  }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const { name, date, location } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, { name, date, location }, { new: true });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// News
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.post('/api/news', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const news = new News({ content });
    await news.save();
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add news' });
  }
});

app.put('/api/news/:id', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const news = await News.findByIdAndUpdate(req.params.id, { content }, { new: true });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update news' });
  }
});

app.delete('/api/news/:id', authenticateToken, async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'News deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

// Results
app.get('/api/results', async (req, res) => {
  try {
    const results = await Result.find();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

app.post('/api/results', authenticateToken, async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save result' });
  }
});

app.put('/api/results/:id', authenticateToken, async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update result' });
  }
});

app.delete('/api/results/:id', authenticateToken, async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: 'Result deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete result' });
  }
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!process.env.ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD not set in .env');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
>>>>>>> 0828b8efd2a0749d7766ddab07dd93b0befafd72
