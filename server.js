const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bp-golf', {
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

// --- Admin Auth Middleware ---
function adminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Malformed token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.admin) throw new Error("Not admin");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// --- Admin Routes ---
// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// GET /api/admin/check-auth (protected)
app.get('/api/admin/check-auth', adminAuth, (req, res) => {
    res.json({ success: true, message: 'You are authenticated as admin.' });
});

// --- Existing Routes ---
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

// Admin page (not linked, just static HTML)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve static files
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});