const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const learnerRoutes = require('./routes/learnerRoutes');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // Essential for parsing JSON body
app.use(express.urlencoded({ extended: true }));

// Debug logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    // console.log("Body:", req.body);
    next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/learner', learnerRoutes);

app.get('/', (req, res) => {
    res.send({ message: 'Welcome to Career Setu AI Engine' });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
