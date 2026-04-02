const express = require('express');
const router = express.Router();
const Profile = require('../models/profileModel');
const User = require('../models/userModel');
const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────
// @desc    Create or update the learner's profile (upsert)
// @route   POST /api/v1/profile
// @access  Private
// ─────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        const { full_name, age, preferred_language, academic_info, career_aspirations, skills, nsqf_level } = req.body;

        // Validate required fields
        if (!academic_info?.highest_qualification || academic_info.highest_qualification.trim() === '') {
            return res.status(400).json({ message: 'Highest qualification is required' });
        }
        if (!career_aspirations?.target_role || career_aspirations.target_role.trim() === '') {
            return res.status(400).json({ message: 'Target role is required' });
        }

        // Prepare profile data - ensure all fields are preserved
        const profileUpdate = {
            user: req.user._id,
            full_name: full_name || '',
            age: age ? Number(age) : null,
            preferred_language: preferred_language || 'English',
            academic_info: {
                highest_qualification: academic_info.highest_qualification || '',
                background_stream: academic_info.background_stream || '',
                institution: academic_info.institution || '',
                year_of_completion: academic_info.year_of_completion ? Number(academic_info.year_of_completion) : undefined,
            },
            career_aspirations: {
                target_role: career_aspirations.target_role || '',
                preferred_industry: career_aspirations.preferred_industry || '',
                preferred_location: career_aspirations.preferred_location || '',
            },
            skills: {
                technical_skills: Array.isArray(skills?.technical_skills) ? skills.technical_skills : [],
                soft_skills: Array.isArray(skills?.soft_skills) ? skills.soft_skills : [],
                certifications: Array.isArray(skills?.certifications) ? skills.certifications : [],
            },
            nsqf_level: nsqf_level || 1,
        };

        // Upsert: create if not exists, update if exists
        const profile = await Profile.findOneAndUpdate(
            { user: req.user._id },
            profileUpdate,
            { new: true, upsert: true, runValidators: true }
        );

        // Ensure the profile is persisted
        if (!profile) {
            return res.status(500).json({ message: 'Failed to save profile to database' });
        }

        // Mark the user's profileComplete flag as true
        await User.findByIdAndUpdate(req.user._id, { profileComplete: true });

        console.log(`Profile saved for user ${req.user._id}:`, profile._id);
        res.status(200).json(profile);
    } catch (error) {
        console.error('Profile save error:', error);
        res.status(500).json({ message: 'Error saving profile', error: error.message });
    }
});

// ─────────────────────────────────────────────
// @desc    Update existing learner profile (partial update)
// @route   PUT /api/v1/profile
// @access  Private
// ─────────────────────────────────────────────
router.put('/', protect, async (req, res) => {
    try {
        const existing = await Profile.findOne({ user: req.user._id });
        if (!existing) {
            return res.status(404).json({ message: 'Profile not found. Please create your profile first via POST /api/v1/profile.' });
        }

        const { full_name, age, preferred_language, academic_info, career_aspirations, skills, nsqf_level } = req.body;

        // Apply only provided fields (partial update) - preserve existing data
        if (full_name !== undefined) existing.full_name = full_name;
        if (age !== undefined) existing.age = age ? Number(age) : null;
        if (preferred_language !== undefined) existing.preferred_language = preferred_language;
        
        if (academic_info !== undefined) {
            existing.academic_info = { 
                ...existing.academic_info.toObject(),
                ...academic_info 
            };
        }
        if (career_aspirations !== undefined) {
            existing.career_aspirations = { 
                ...existing.career_aspirations.toObject(),
                ...career_aspirations 
            };
        }
        if (skills !== undefined) {
            existing.skills = { 
                ...existing.skills.toObject(),
                technical_skills: Array.isArray(skills.technical_skills) ? skills.technical_skills : existing.skills.technical_skills,
                soft_skills: Array.isArray(skills.soft_skills) ? skills.soft_skills : existing.skills.soft_skills,
                certifications: Array.isArray(skills.certifications) ? skills.certifications : existing.skills.certifications,
            };
        }
        if (nsqf_level !== undefined) existing.nsqf_level = nsqf_level;

        const updated = await existing.save();
        console.log(`Profile updated for user ${req.user._id}:`, updated._id);
        res.json(updated);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
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
        console.log(`Profile retrieved for user ${req.user._id}:`, profile._id);
        res.json(profile);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

module.exports = router;
