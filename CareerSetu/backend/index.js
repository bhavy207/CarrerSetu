const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const learnerRoutes = require('./routes/learnerRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const courseRoutes = require('./routes/courseRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const { buildIndex } = require('./services/recommendationEngine');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// ── Routes ──────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/learner', learnerRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/recommend', recommendRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Career Setu AI Engine', version: '2.0' });
});

const PORT = process.env.PORT || 8000;

// Connect to DB, start server, warm up AI index
connectDB();
app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));

// Warm up TF-IDF recommendation index after DB connects
const mongoose = require('mongoose');
mongoose.connection.once('open', () => {
    buildIndex().catch(err => console.error('⚠️  Index build failed:', err.message));
});
