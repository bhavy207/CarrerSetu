const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/v1/auth/token
// @access  Public
router.post('/token', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Login attempt for:", username);

        const user = await User.findOne({ username });
        console.log("User found:", user ? "Yes" : "No");

        if (user) {
            if (!user.password) {
                console.error("Critical Error: User found but has no password field.", user);
                // Fallback for legacy data or corrupted data
                return res.status(500).json({ message: 'User data corrupted (missing password)' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return res.json({
                    access_token: generateToken(user._id),
                    token_type: 'bearer',
                    username: user.username,
                });
            }
        }

        res.status(401).json({ message: 'Invalid username or password' });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @desc    Register a new user
// @route   POST /api/v1/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

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
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

module.exports = router;
