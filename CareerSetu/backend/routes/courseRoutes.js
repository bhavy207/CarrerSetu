const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Course = require('../models/courseModel');
const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────────
// @desc   Import courses from CSV into MongoDB
// @route  POST /api/v1/courses/import
// @access Private
// ─────────────────────────────────────────────────
router.post('/import', protect, async (req, res) => {
    try {
        const csvPath = path.join(__dirname, '../data/courses.csv');
        const content = fs.readFileSync(csvPath, 'utf-8');
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',');

        const courses = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((h, idx) => {
                row[h.trim()] = values[idx] ? values[idx].trim() : '';
            });

            courses.push({
                course_id: row.course_id,
                course_name: row.course_name,
                sector: row.sector,
                skills: row.skills.split(' ').map(s => s.trim()).filter(Boolean),
                nsqf_level: parseInt(row.nsqf_level, 10),
                duration: row.duration,
                job_role: row.job_role,
            });
        }

        // Upsert each course by course_id
        let imported = 0;
        for (const c of courses) {
            await Course.findOneAndUpdate(
                { course_id: c.course_id },
                c,
                { upsert: true, new: true, runValidators: true }
            );
            imported++;
        }

        res.json({ message: `Successfully imported ${imported} courses.`, total: imported });
    } catch (error) {
        console.error('Course import error:', error);
        res.status(500).json({ message: 'Error importing courses', error: error.message });
    }
});

// ─────────────────────────────────────────────────
// @desc   Get all courses (optional sector filter)
// @route  GET /api/v1/courses?sector=IT
// @access Public
// ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const filter = req.query.sector ? { sector: req.query.sector } : {};
        const courses = await Course.find(filter).sort({ nsqf_level: 1, course_name: 1 });
        res.json(courses);
    } catch (error) {
        console.error('Course fetch error:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

module.exports = router;
