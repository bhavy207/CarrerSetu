const mongoose = require('mongoose');

const skillGapSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    path: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Path',
        required: true,
    },

    /* skills the learner currently HAS */
    current_skills: {
        type: [String],
        default: [],
    },

    /* skills REQUIRED for the target role */
    required_skills: {
        type: [String],
        default: [],
    },

    /* skills the learner is MISSING (required − current) */
    gaps: {
        type: [String],
        default: [],
    },

    /* target role this analysis was done for */
    target_role: {
        type: String,
        required: true,
    },

}, { timestamps: true });

const SkillGap = mongoose.model('SkillGap', skillGapSchema);

module.exports = SkillGap;
