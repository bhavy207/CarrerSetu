const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    course_id: { type: String, required: true, unique: true },
    course_name: { type: String, required: true },
    sector: { type: String, required: true },
    skills: { type: [String], default: [] },   // stored as array
    nsqf_level: { type: Number, required: true },
    duration: { type: String, required: true },
    job_role: { type: String, required: true },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
