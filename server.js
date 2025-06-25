const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigin = 'https://golfappbackup-frontend.vercel.app'; // change to your frontend
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

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bp-golf', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// ...rest of your routes...

// Serve static files
app.use(express.static('public'));

// REMOVE THIS:
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// ADD THIS:
module.exports = (req, res) => {
    app(req, res);
};