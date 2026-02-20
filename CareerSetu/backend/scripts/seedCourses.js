/**
 * seedCourses.js
 * ─────────────────────────────────────────────────────────────
 * Run:  node seedCourses.js
 * 
 * Reads /data/courses.csv and upserts all rows into MongoDB.
 * Handles RFC-4180 quoted CSV (commas inside quoted fields).
 * ─────────────────────────────────────────────────────────────
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Course = require('../models/courseModel');

/* ── RFC-4180 CSV parser ── */
function parseCSV(content) {
    const rows = [];
    const lines = content.replace(/\r\n/g, '\n').trim();
    let fields = [], field = '', inQuotes = false, i = 0;

    while (i < lines.length) {
        const ch = lines[i];
        const next = lines[i + 1];

        if (ch === '"') {
            if (inQuotes && next === '"') { field += '"'; i += 2; continue; }
            inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            fields.push(field.trim()); field = '';
        } else if (ch === '\n' && !inQuotes) {
            fields.push(field.trim()); rows.push(fields); fields = []; field = '';
        } else {
            field += ch;
        }
        i++;
    }
    if (field !== '' || fields.length > 0) { fields.push(field.trim()); rows.push(fields); }
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.toLowerCase().trim());
    return rows.slice(1).map(values => {
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = (values[idx] || '').trim(); });
        return obj;
    });
}

async function seed() {
    try {
        console.log('\n🌱  CareerSetu — Course Database Seeder');
        console.log('─'.repeat(48));

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅  Connected to MongoDB');

        const csvPath = path.join(__dirname, '../data/courses.csv');
        if (!fs.existsSync(csvPath)) {
            console.error('❌  courses.csv not found at:', csvPath);
            process.exit(1);
        }

        const rows = parseCSV(fs.readFileSync(csvPath, 'utf-8'));
        console.log(`📄  Parsed ${rows.length} rows from courses.csv`);

        let imported = 0, skipped = 0, updated = 0;

        for (const row of rows) {
            if (!row.course_id || !row.course_name || !row.sector) {
                console.warn(`⚠️   Skipping incomplete row:`, row);
                skipped++;
                continue;
            }

            const doc = {
                course_id: row.course_id,
                course_name: row.course_name,
                sector: row.sector,
                skills_covered: (row.skills_covered || '').split(',').map(s => s.trim()).filter(Boolean),
                nsqf_level: parseInt(row.nsqf_level, 10) || 1,
                duration: row.duration,
                job_role: row.job_role,
            };

            const result = await Course.findOneAndUpdate(
                { course_id: doc.course_id },
                doc,
                { upsert: true, returnDocument: 'after', runValidators: true }
            );

            if (result.createdAt < result.updatedAt) updated++;
            else imported++;
        }

        console.log('\n📊  Seeding Summary:');
        console.log(`    ✅  Inserted  : ${imported}`);
        console.log(`    🔄  Updated   : ${updated}`);
        console.log(`    ⚠️   Skipped   : ${skipped}`);
        console.log(`    📚  Total DB  : ${await Course.countDocuments()}`);
        console.log('\n🎉  Course database seeded successfully!\n');

    } catch (err) {
        console.error('❌  Seeder error:', err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
