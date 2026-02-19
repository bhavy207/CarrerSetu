const express = require('express');
const router = express.Router();
const Notification = require('../models/notificationModel');
const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────
// @desc    Get all notifications for current user (newest first)
// @route   GET /api/v1/notifications
// @access  Private
// ─────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Notifications fetch error:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// ─────────────────────────────────────────────
// @desc    Mark a single notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
// ─────────────────────────────────────────────
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Error updating notification' });
    }
});

// ─────────────────────────────────────────────
// @desc    Mark ALL notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
// ─────────────────────────────────────────────
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Error updating notifications' });
    }
});

module.exports = router;
