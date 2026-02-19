const express = require('express');
const router = express.Router();
const profilingService = require('../services/profilingService');
const { protect } = require('../middleware/authMiddleware');

const Path = require('../models/pathModel');

// Generate profile (existing)
router.post('/profile', protect, (req, res) => {
    try {
        const result = profilingService.analyzeLearner(req.body);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error profiling learner' });
    }
});

// Save a path for the user
router.post('/save-path', protect, async (req, res) => {
    try {
        const { pathwayData } = req.body; // Expecting the full object returned from /profile

        // Deactivate any existing active paths for this user
        await Path.updateMany({ user: req.user._id, isActive: true }, { isActive: false });

        const steps = pathwayData.learning_path.map(step => ({
            step_name: step.step_name,
            description: step.description,
            duration: step.duration,
            status: 'Pending'
        }));

        const newPath = await Path.create({
            user: req.user._id,
            title: `Path to ${pathwayData.career_outcomes.entry_level}`, // Use entry level or target role
            target_role: pathwayData.career_outcomes.entry_level, // Or get from input if passed
            steps: steps,
            isActive: true
        });

        res.status(201).json(newPath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving path' });
    }
});

// Get current active path
router.get('/current-path', protect, async (req, res) => {
    try {
        const path = await Path.findOne({ user: req.user._id, isActive: true });
        if (path) {
            res.json(path);
        } else {
            res.json(null); // No active path
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching path' });
    }
});

// Update step status
router.put('/update-step', protect, async (req, res) => {
    try {
        const { pathId, stepId, status } = req.body;

        const path = await Path.findOne({ _id: pathId, user: req.user._id });
        if (!path) {
            return res.status(404).json({ message: 'Path not found' });
        }

        const step = path.steps.id(stepId);
        if (!step) {
            return res.status(404).json({ message: 'Step not found' });
        }

        step.status = status;
        if (status === 'Completed') {
            step.completedAt = new Date();
        }

        await path.save();
        res.json(path);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating step' });
    }
});

module.exports = router;
