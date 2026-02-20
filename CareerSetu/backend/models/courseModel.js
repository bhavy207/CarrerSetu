const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    course_id: { type: String, required: true, unique: true },
    course_name: { type: String, required: true },
    sector: { type: String, required: true },
    skills_covered: { type: [String], default: [] },   // stored as array
    nsqf_level: { type: Number, required: true, min: 1, max: 10 },
    duration: { type: String, required: true },
    job_role: { type: String, required: true },
}, { timestamps: true });

// Full-text search index across the most-searched fields
courseSchema.index(
    { course_name: 'text', job_role: 'text', sector: 'text', skills_covered: 'text' },
    { name: 'course_text_index', weights: { course_name: 10, job_role: 8, sector: 5, skills_covered: 3 } }
);

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
