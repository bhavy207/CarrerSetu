const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
    step_name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    completedAt: {
        type: Date
    }
});

const pathSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    target_role: {
        type: String,
        required: true
    },
    steps: [stepSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    /* link to the SkillGap analysis document for this path */
    skillGap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SkillGap',
    },
    /* snapshot of the profile input that generated this path */
    profileSnapshot: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true
});

const Path = mongoose.model('Path', pathSchema);

module.exports = Path;
