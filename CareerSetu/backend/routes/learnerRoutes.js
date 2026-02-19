const express = require('express');
const router = express.Router();
const profilingService = require('../services/profilingService');
const { protect } = require('../middleware/authMiddleware');
const Path = require('../models/pathModel');
const SkillGap = require('../models/skillGapModel');
const Notification = require('../models/notificationModel');

// ─────────────────────────────────────────────
// @desc    Analyse learner profile & generate pathway
// @route   POST /api/v1/learner/profile
// @access  Private
// ─────────────────────────────────────────────
router.post('/profile', protect, (req, res) => {
    try {
        const result = profilingService.analyzeLearner(req.body);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error profiling learner' });
    }
});

// ─────────────────────────────────────────────
// @desc    Save a generated path + create SkillGap doc + Notification
// @route   POST /api/v1/learner/save-path
// @access  Private
// ─────────────────────────────────────────────
router.post('/save-path', protect, async (req, res) => {
    try {
        const { pathwayData, profileInput } = req.body;

        // 1. Deactivate any existing active paths for this user
        await Path.updateMany({ user: req.user._id, isActive: true }, { isActive: false });

        // 2. Map learning path steps
        const steps = pathwayData.learning_path.map(step => ({
            step_name: step.step_name,
            description: step.description,
            duration: step.duration,
            status: 'Pending',
        }));

        // 3. Create the Path document (without skillGap ref yet)
        const newPath = await Path.create({
            user: req.user._id,
            title: `Path to ${pathwayData.career_outcomes.entry_level}`,
            target_role: pathwayData.career_outcomes.entry_level,
            steps,
            isActive: true,
            profileSnapshot: profileInput || {},
        });

        // 4. Create linked SkillGap document
        const skillGapDoc = await SkillGap.create({
            user: req.user._id,
            path: newPath._id,
            target_role: pathwayData.career_outcomes.entry_level,
            current_skills: profileInput?.skills?.technical_skills || [],
            required_skills: pathwayData.skill_gap || [],
            gaps: pathwayData.skill_gap || [],
        });

        // 5. Link SkillGap back to Path
        newPath.skillGap = skillGapDoc._id;
        await newPath.save();

        // 6. Create a PATH_SAVED notification
        await Notification.create({
            user: req.user._id,
            type: 'PATH_SAVED',
            title: '🎉 Career Path Generated!',
            message: `Your path to "${pathwayData.career_outcomes.entry_level}" is ready. ${steps.length} steps await you.`,
            metadata: { pathId: newPath._id },
        });

        res.status(201).json(newPath);
    } catch (error) {
        console.error('Save path error:', error);
        res.status(500).json({ message: 'Error saving path' });
    }
});

// ─────────────────────────────────────────────
// @desc    Get current active path (with SkillGap populated)
// @route   GET /api/v1/learner/current-path
// @access  Private
// ─────────────────────────────────────────────
router.get('/current-path', protect, async (req, res) => {
    try {
        const path = await Path.findOne({ user: req.user._id, isActive: true })
            .populate('skillGap');
        res.json(path || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching path' });
    }
});

// ─────────────────────────────────────────────
// @desc    Update a step status + Notification on completion
// @route   PUT /api/v1/learner/update-step
// @access  Private
// ─────────────────────────────────────────────
router.put('/update-step', protect, async (req, res) => {
    try {
        const { pathId, stepId, status } = req.body;

        const path = await Path.findOne({ _id: pathId, user: req.user._id });
        if (!path) return res.status(404).json({ message: 'Path not found' });

        const step = path.steps.id(stepId);
        if (!step) return res.status(404).json({ message: 'Step not found' });

        step.status = status;
        if (status === 'Completed') {
            step.completedAt = new Date();

            // Count completed steps for milestone check
            const completedCount = path.steps.filter(s => s.status === 'Completed').length;
            const totalSteps = path.steps.length;

            // Notify on every step completion
            await Notification.create({
                user: req.user._id,
                type: 'STEP_COMPLETED',
                title: `✅ Step Completed`,
                message: `You completed "${step.step_name}". ${totalSteps - completedCount} steps remaining.`,
                metadata: { pathId, stepId },
            });

            // Milestone: all steps done
            if (completedCount === totalSteps) {
                await Notification.create({
                    user: req.user._id,
                    type: 'MILESTONE',
                    title: '🏆 Path Completed!',
                    message: `Congratulations! You've completed your entire career path: "${path.title}".`,
                    metadata: { pathId },
                });
            }
        }

        await path.save();
        res.json(path);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating step' });
    }
});

// ─────────────────────────────────────────────
// @desc    Get all saved paths for current user
// @route   GET /api/v1/learner/paths
// @access  Private
// ─────────────────────────────────────────────
router.get('/paths', protect, async (req, res) => {
    try {
        const paths = await Path.find({ user: req.user._id })
            .populate('skillGap')
            .sort({ createdAt: -1 });
        res.json(paths);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching paths' });
    }
});

module.exports = router;
