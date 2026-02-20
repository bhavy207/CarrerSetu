const express = require('express');
const router = express.Router();
const axios = require('axios');
const Profile = require('../models/profileModel');
const { protect } = require('../middleware/authMiddleware');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8001';

// ─────────────────────────────────────────────────
// @desc   Get AI course recommendations for the logged-in user
// @route  POST /api/v1/recommend
// @access Private
// ─────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        // 1. Fetch user profile for skills + interest
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found. Please complete your profile first.' });
        }

        const skills = profile.skills.technical_skills.join(' ');
        const interest = profile.career_aspirations.target_role || profile.career_aspirations.preferred_industry || '';

        // 2. Call Python AI engine
        const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/v1/predict`, {
            skills,
            interest,
            top_n: 5,
        }, { timeout: 5000 });

        res.json(aiResponse.data);
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
            return res.status(503).json({
                message: 'AI recommendation engine is offline. Start the Python server on port 8001.',
            });
        }
        console.error('Recommend error:', error.message);
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
});

module.exports = router;
