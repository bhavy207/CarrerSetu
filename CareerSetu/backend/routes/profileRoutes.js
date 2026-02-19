const express = require('express');
const router = express.Router();
const Profile = require('../models/profileModel');
const User = require('../models/userModel');
const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────
// @desc    Save or update the learner's profile
// @route   POST /api/v1/profile
// @access  Private
// ─────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        const { academic_info, career_aspirations, skills, nsqf_level } = req.body;

        // Upsert: create if not exists, update if exists
        const profile = await Profile.findOneAndUpdate(
            { user: req.user._id },
            {
                user: req.user._id,
                academic_info,
                career_aspirations,
                skills,
                nsqf_level: nsqf_level || 1,
            },
            { new: true, upsert: true, runValidators: true }
        );

        // Mark the user's profileComplete flag as true
        await User.findByIdAndUpdate(req.user._id, { profileComplete: true });

        res.status(200).json(profile);
    } catch (error) {
        console.error('Profile save error:', error);
        res.status(500).json({ message: 'Error saving profile' });
    }
});

// ─────────────────────────────────────────────
// @desc    Get the current user's profile
// @route   GET /api/v1/profile
// @access  Private
// ─────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found. Please complete your profile.' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

module.exports = router;
