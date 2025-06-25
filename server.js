const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigin = 'https://golfappbackup-frontend.vercel.app'; // Set to your deployed frontend domain

// CORS for all requests and preflight
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Connect to MongoDB (for production, use environment variable for the URI)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bp-golf', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Score Schema
const scoreSchema = new mongoose.Schema({
    playerName: String,
    date: { type: Date, default: Date.now },
    scores: [Number],
    total: Number,
    course: String
});
const Score = mongoose.model('Score', scoreSchema);

// Course Schema
const courseSchema = new mongoose.Schema({
    name: String,
    holes: [{
        holeNumber: Number,
        par: Number
    }]
});
const Course = mongoose.model('Course', courseSchema);

// Routes
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await Score.find().sort({ date: -1 });
        res.json(scores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/scores', async (req, res) => {
    const { playerName, scores, course } = req.body;
    const total = scores.reduce((a, b) => a + b, 0);

    const score = new Score({
        playerName,
        scores,
        total,
        course
    });

    try {
        const newScore = await score.save();
        res.status(201).json(newScore);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/courses', async (req, res) => {
    const course = new Course(req.body);
    try {
        const newCourse = await course.save();
        res.status(201).json(newCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Admin route - no password protection but no links to it
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve static files
app.use(express.static('public'));

// DO NOT call app.listen() on Vercel!
// Instead, export as a serverless function handler:
module.exports = (req, res) => {
    app(req, res);
};

// For local development, you can still use app.listen():
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}