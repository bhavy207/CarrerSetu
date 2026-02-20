const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Course = require('../models/courseModel');
const { protect } = require('../middleware/authMiddleware');

/* ─────────────────────────────────────────────────────────
   HELPER: RFC-4180 compliant CSV parser
   Handles quoted fields containing commas and newlines.
───────────────────────────────────────────────────────── */
function parseCSV(content) {
    const rows = [];
    const lines = content.replace(/\r\n/g, '\n').trim();

    // Tokenise character by character to respect quotes
    let fields = [], field = '', inQuotes = false, i = 0;

    while (i < lines.length) {
        const ch = lines[i];
        const next = lines[i + 1];

        if (ch === '"') {
            if (inQuotes && next === '"') {
                // Escaped quote inside quoted field
                field += '"';
                i += 2;
                continue;
            }
            inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            fields.push(field.trim());
            field = '';
        } else if (ch === '\n' && !inQuotes) {
            fields.push(field.trim());
            rows.push(fields);
            fields = [];
            field = '';
        } else {
            field += ch;
        }
        i++;
    }
    // Push last field/row
    if (field !== '' || fields.length > 0) {
        fields.push(field.trim());
        rows.push(fields);
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.toLowerCase().trim());
    return rows.slice(1).map(values => {
        const obj = {};
        headers.forEach((h, idx) => {
            obj[h] = (values[idx] || '').trim();
        });
        return obj;
    });
}

// ─────────────────────────────────────────────────────────
// @desc   Import courses from CSV into MongoDB (upsert)
// @route  POST /api/v1/courses/import
// @access Private (protected — run once as admin action)
// ─────────────────────────────────────────────────────────
router.post('/import', protect, async (req, res) => {
    try {
        const csvPath = path.join(__dirname, '../data/courses.csv');
        if (!fs.existsSync(csvPath)) {
            return res.status(404).json({ message: 'courses.csv not found in /data directory' });
        }

        const content = fs.readFileSync(csvPath, 'utf-8');
        const rows = parseCSV(content);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'CSV is empty or has no data rows' });
        }

        let imported = 0, skipped = 0;
        const errors = [];

        for (const row of rows) {
            try {
                const courseDoc = {
                    course_id: row.course_id,
                    course_name: row.course_name,
                    sector: row.sector,
                    skills_covered: row.skills_covered
                        ? row.skills_covered.split(',').map(s => s.trim()).filter(Boolean)
                        : [],
                    nsqf_level: parseInt(row.nsqf_level, 10) || 1,
                    duration: row.duration,
                    job_role: row.job_role,
                };

                if (!courseDoc.course_id || !courseDoc.course_name || !courseDoc.sector) {
                    skipped++;
                    errors.push(`Skipped row: missing required fields — ${JSON.stringify(row)}`);
                    continue;
                }

                await Course.findOneAndUpdate(
                    { course_id: courseDoc.course_id },
                    courseDoc,
                    { upsert: true, returnDocument: 'after', runValidators: true }
                );
                imported++;
            } catch (rowErr) {
                skipped++;
                errors.push(`Error on ${row.course_id}: ${rowErr.message}`);
            }
        }

        res.json({
            message: `Import complete: ${imported} imported, ${skipped} skipped.`,
            total: imported,
            skipped,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error('Course import error:', error);
        res.status(500).json({ message: 'Error importing courses', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────
// @desc   Get all courses with filtering, search & pagination
// @route  GET /api/v1/courses
// @access Public
//
// Query params:
//   ?sector=IT
//   ?nsqf_level=5
//   ?search=python
//   ?job_role=Developer
//   ?page=1&limit=20
// ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { sector, nsqf_level, search, job_role, page = 1, limit = 50 } = req.query;
        const filter = {};

        if (sector) filter.sector = { $regex: new RegExp(sector, 'i') };
        if (nsqf_level) filter.nsqf_level = parseInt(nsqf_level, 10);
        if (job_role) filter.job_role = { $regex: new RegExp(job_role, 'i') };

        if (search) {
            // Try MongoDB text search, fall back to regex if no text index yet
            filter.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = Course.find(filter)
            .sort({ nsqf_level: 1, course_name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        if (search) {
            query = query.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
        }

        const [courses, total] = await Promise.all([
            query.exec(),
            Course.countDocuments(filter),
        ]);

        res.json({
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            courses,
        });
    } catch (error) {
        // Fallback: if text index not ready, try regex search
        if (error.code === 27) {
            try {
                const { sector, nsqf_level, search, job_role, page = 1, limit = 50 } = req.query;
                const filter = {};
                if (sector) filter.sector = { $regex: new RegExp(sector, 'i') };
                if (nsqf_level) filter.nsqf_level = parseInt(nsqf_level, 10);
                if (job_role) filter.job_role = { $regex: new RegExp(job_role, 'i') };
                if (search) {
                    filter.$or = [
                        { course_name: { $regex: new RegExp(search, 'i') } },
                        { job_role: { $regex: new RegExp(search, 'i') } },
                        { sector: { $regex: new RegExp(search, 'i') } },
                        { skills_covered: { $regex: new RegExp(search, 'i') } },
                    ];
                }
                const skip = (parseInt(page) - 1) * parseInt(limit);
                const [courses, total] = await Promise.all([
                    Course.find(filter).sort({ nsqf_level: 1 }).skip(skip).limit(parseInt(limit)),
                    Course.countDocuments(filter),
                ]);
                return res.json({ total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), courses });
            } catch (fallbackErr) {
                return res.status(500).json({ message: 'Error fetching courses', error: fallbackErr.message });
            }
        }
        console.error('Course fetch error:', error);
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────
// @desc   Get distinct sectors list
// @route  GET /api/v1/courses/sectors
// @access Public
// ─────────────────────────────────────────────────────────
router.get('/sectors', async (req, res) => {
    try {
        const sectors = await Course.distinct('sector');
        res.json(sectors.sort());
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sectors' });
    }
});

// ─────────────────────────────────────────────────────────
// @desc   Get a single course by course_id or MongoDB _id
// @route  GET /api/v1/courses/:id
// @access Public
// ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findOne({
            $or: [{ course_id: id }, { _id: id.match(/^[a-f\d]{24}$/i) ? id : null }]
        });
        if (!course) {
            return res.status(404).json({ message: `Course '${id}' not found` });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }
});

module.exports = router;
