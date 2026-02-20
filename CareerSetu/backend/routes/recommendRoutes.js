const express = require('express');
const router = express.Router();
const Profile = require('../models/profileModel');
const { protect } = require('../middleware/authMiddleware');
const { getRecommendations, rebuildIndex } = require('../services/recommendationEngine');

// ─────────────────────────────────────────────────────────────
// @desc   Get AI course recommendations for the logged-in user
// @route  POST /api/v1/recommend
// @access Private
//
// Body (optional overrides — profile is fetched automatically):
//   { skills: "python react", interest: "Full Stack Developer", top_n: 5 }
// ─────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        // 1. Fetch user profile
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(404).json({
                message: 'Profile not found. Please complete your profile first.',
            });
        }

        // 2. Extract features from profile (body overrides allowed for testing)
        const skills = req.body.skills
            || [...(profile.skills.technical_skills || [])].join(', ');

        const softSkills = profile.skills.soft_skills || [];

        const interest = req.body.interest
            || profile.career_aspirations.target_role
            || profile.career_aspirations.preferred_industry
            || '';

        const nsqf_level = profile.nsqf_level || null;
        const topN = parseInt(req.body.top_n) || 5;

        // 3. Get recommendations from TF-IDF engine
        const result = await getRecommendations({
            skills,
            interest,
            softSkills,
            nsqf_level,
            topN,
        });

        res.json(result);
    } catch (error) {
        console.error('Recommend error:', error.message);
        res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────
// @desc   Get recommendations from a raw query (no auth — useful for demos)
// @route  POST /api/v1/recommend/query
// @access Public
//
// Body: { skills: "python ml", interest: "Data Analyst", top_n: 5 }
// ─────────────────────────────────────────────────────────────
router.post('/query', async (req, res) => {
    try {
        const { skills = '', interest = '', soft_skills = [], nsqf_level, top_n = 5 } = req.body;

        if (!skills && !interest) {
            return res.status(400).json({ message: 'Provide at least skills or interest' });
        }

        const result = await getRecommendations({
            skills,
            interest,
            softSkills: soft_skills,
            nsqf_level: nsqf_level ? parseInt(nsqf_level) : null,
            topN: Math.min(parseInt(top_n) || 5, 10),
        });

        res.json(result);
    } catch (error) {
        console.error('Recommend query error:', error.message);
        res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────
// @desc   Force rebuild the TF-IDF index (run after new CSV import)
// @route  POST /api/v1/recommend/rebuild
// @access Private
// ─────────────────────────────────────────────────────────────
router.post('/rebuild', protect, async (req, res) => {
    try {
        await rebuildIndex();
        res.json({ message: 'Recommendation index rebuilt successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error rebuilding index', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────
// @desc   Health check + index status
// @route  GET /api/v1/recommend/status
// @access Public
// ─────────────────────────────────────────────────────────────
router.get('/status', async (req, res) => {
    try {
        const testResult = await getRecommendations({ skills: 'test', topN: 1 });
        res.json({
            status: 'online',
            engine: testResult.meta.engine,
            total_courses: testResult.meta.total_courses,
            index_built_at: testResult.meta.index_built_at,
            response_ms: testResult.meta.response_ms,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
