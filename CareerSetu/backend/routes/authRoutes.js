const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────
// @desc    Auth user & get token (Login)
// @route   POST /api/v1/auth/token
// @access  Public
// ─────────────────────────────────────────────
router.post('/token', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Input validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        console.log("Login attempt for:", username);
        const user = await User.findOne({ username });
        console.log("User found:", user ? "Yes" : "No");

        if (user) {
            if (!user.password) {
                console.error("Critical Error: User found but has no password field.", user);
                return res.status(500).json({ message: 'User data corrupted (missing password)' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return res.json({
                    access_token: generateToken(user._id),
                    token_type: 'bearer',
                    username: user.username,
                    profileComplete: user.profileComplete,
                });
            }
        }

        res.status(401).json({ message: 'Invalid username or password' });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// ─────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/v1/auth/signup
// @access  Public
// ─────────────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }
        if (username.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Check for existing username or email
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password and create user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                access_token: generateToken(user._id),
                token_type: 'bearer',
                username: user.username,
                profileComplete: user.profileComplete,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// ─────────────────────────────────────────────
// @desc    Get current logged-in user's account info
// @route   GET /api/v1/auth/me
// @access  Private
// ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profileComplete: user.profileComplete,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: 'Error fetching user info' });
    }
});

// ─────────────────────────────────────────────
// @desc    Update current user's email or password
// @route   PUT /api/v1/auth/me
// @access  Private
// ─────────────────────────────────────────────
router.put('/me', protect, async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update email if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Please provide a valid email address' });
            }
            const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
            if (emailTaken) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
            user.email = email;
        }

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            profileComplete: updatedUser.profileComplete,
            message: 'Account updated successfully',
        });
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: 'Error updating account' });
    }
});

module.exports = router;
