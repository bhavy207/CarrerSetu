const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Path = require('../models/pathModel');
const { protect, adminProtect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────────
// @desc    Get dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
// ─────────────────────────────────────────────
router.get('/stats', protect, adminProtect, async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const coursesCount = await Course.countDocuments();
        const pathsCount = await Path.countDocuments();

        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');

        res.json({
            users: usersCount,
            courses: coursesCount,
            paths: pathsCount,
            recentUsers
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// ─────────────────────────────────────────────
// @desc    Setup default admin user
// @route   POST /api/v1/admin/setup
// @access  Public
// ─────────────────────────────────────────────
router.post('/setup', async (req, res) => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin user already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@careersetu.com',
            password: hashedPassword,
            role: 'admin',
        });

        res.status(201).json({ message: 'Admin user created successfully', user: adminUser.username });
    } catch (error) {
        console.error("Setup Error:", error);
        res.status(500).json({ message: 'Error setting up admin' });
    }
});

// ─────────────────────────────────────────────
// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
// ─────────────────────────────────────────────
router.get('/users', protect, adminProtect, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// ─────────────────────────────────────────────
// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
// ─────────────────────────────────────────────
router.delete('/users/:id', protect, adminProtect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete an admin user' });
        }
        await User.findByIdAndDelete(req.params.id);
        // Alternatively, delete associated paths and profiles:
        // await Path.deleteMany({ user: req.params.id });
        // await Profile.deleteMany({ user: req.params.id });

        res.json({ message: 'User removed successfully' });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// ─────────────────────────────────────────────
// @desc    Get all courses
// @route   GET /api/v1/admin/courses
// @access  Private/Admin
// ─────────────────────────────────────────────
router.get('/courses', protect, adminProtect, async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        console.error("Get Courses Error:", error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// ─────────────────────────────────────────────
// @desc    Add a new course
// @route   POST /api/v1/admin/courses
// @access  Private/Admin
// ─────────────────────────────────────────────
router.post('/courses', protect, adminProtect, async (req, res) => {
    try {
        const { course_id, course_name, sector, skills_covered, nsqf_level, duration, job_role } = req.body;
        
        const courseExists = await Course.findOne({ course_id });
        if (courseExists) {
            return res.status(400).json({ message: 'Course ID already exists' });
        }

        const newCourse = await Course.create({
            course_id,
            course_name,
            sector,
            skills_covered: Array.isArray(skills_covered) ? skills_covered : skills_covered.split(',').map(s => s.trim()),
            nsqf_level: Number(nsqf_level),
            duration,
            job_role
        });

        res.status(201).json(newCourse);
    } catch (error) {
        console.error("Add Course Error:", error);
        res.status(500).json({ message: 'Error adding course' });
    }
});

// ─────────────────────────────────────────────
// @desc    Delete a course
// @route   DELETE /api/v1/admin/courses/:id
// @access  Private/Admin
// ─────────────────────────────────────────────
router.delete('/courses/:id', protect, adminProtect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course removed successfully' });
    } catch (error) {
        console.error("Delete Course Error:", error);
        res.status(500).json({ message: 'Error deleting course' });
    }
});

module.exports = router;
