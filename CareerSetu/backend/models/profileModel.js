const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,       // one profile per user
    },

    /* ── ACADEMIC INFO ── */
    academic_info: {
        highest_qualification: { type: String, required: true },
        background_stream: { type: String, default: '' },
        institution: { type: String, default: '' },
        year_of_completion: { type: Number },
    },

    /* ── CAREER ASPIRATIONS ── */
    career_aspirations: {
        target_role: { type: String, required: true },
        preferred_industry: { type: String, default: '' },
        preferred_location: { type: String, default: '' },
    },

    /* ── SKILLS ── */
    skills: {
        technical_skills: { type: [String], default: [] },
        soft_skills: { type: [String], default: [] },
        certifications: { type: [String], default: [] },
    },

    /* ── COMPUTED NSQF LEVEL ── */
    nsqf_level: { type: Number, default: 1 },

}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
