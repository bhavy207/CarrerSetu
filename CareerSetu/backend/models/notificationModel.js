const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    type: {
        type: String,
        enum: ['PATH_SAVED', 'STEP_COMPLETED', 'MILESTONE', 'SYSTEM'],
        required: true,
    },

    title: {
        type: String,
        required: true,
    },

    message: {
        type: String,
        required: true,
    },

    isRead: {
        type: Boolean,
        default: false,
    },

    /* optional extra payload — e.g. { pathId, stepId } */
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },

}, { timestamps: true });

// Index so we can efficiently query unread notifications per user
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
