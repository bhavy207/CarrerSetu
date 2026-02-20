/**
 * recommendationEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Content-Based Recommendation System using:
 *   • TF-IDF Vectorization  (built from scratch — no external libraries)
 *   • Cosine Similarity
 *
 * The engine reads courses from MongoDB (already seeded) and builds an
 * in-memory TF-IDF matrix at startup. Recommendations are returned in
 * well under 2 seconds (typically <50ms after warm-up).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Course = require('../models/courseModel');

/* ─────────────────────────────────────────────
   MODULE STATE  (in-memory, rebuilt on demand)
───────────────────────────────────────────── */
let _courses = [];          // Array of course documents
let _documents = [];          // Processed text per course
let _tfidfMatrix = [];          // tfidf[docIndex][term] = weight
let _vocabulary = new Set();   // All unique terms
let _vocabArray = [];          // Sorted vocab for vector indexing
let _termIndex = {};          // term → column index
let _idf = {};          // term → IDF score
let _isReady = false;
let _lastBuildTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;   // Rebuild index every 10 minutes

/* ─────────────────────────────────────────────
   TEXT PROCESSING
───────────────────────────────────────────── */
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'its', 'it', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'your', 'our', 'their', 'my', 'his',
]);

function tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s\/\-]/g, ' ')   // keep slashes, hyphens
        .split(/\s+/)
        .map(t => t.replace(/^[-\/]+|[-\/]+$/g, ''))  // strip edge punctuation
        .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function buildDocument(course) {
    const parts = [
        // Repeat high-weight fields for natural TF boost
        course.course_name,
        course.course_name,
        course.job_role,
        course.job_role,
        course.sector,
        ...(course.skills_covered || []),
        ...(course.skills_covered || []),   // double skills weight
        course.duration,
    ];
    return parts.filter(Boolean).join(' ');
}

/* ─────────────────────────────────────────────
   TF-IDF IMPLEMENTATION
───────────────────────────────────────────── */

/** Term Frequency: count occurrences of each term in doc */
function computeTF(tokens) {
    const tf = {};
    const total = tokens.length || 1;
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
    Object.keys(tf).forEach(t => { tf[t] = tf[t] / total; });
    return tf;
}

/** Inverse Document Frequency across all docs */
function computeIDF(allTF) {
    const N = allTF.length;
    const df = {};
    allTF.forEach(tf => {
        Object.keys(tf).forEach(term => {
            df[term] = (df[term] || 0) + 1;
        });
    });
    const idf = {};
    Object.keys(df).forEach(term => {
        // Smooth IDF: log((N + 1) / (df + 1)) + 1
        idf[term] = Math.log((N + 1) / (df[term] + 1)) + 1;
    });
    return idf;
}

/** Build sparse TF-IDF vector (object form) for a TF map */
function buildTFIDFVector(tf, idf) {
    const vec = {};
    Object.keys(tf).forEach(term => {
        if (idf[term] !== undefined) {
            vec[term] = tf[term] * idf[term];
        }
    });
    return vec;
}

/** Cosine similarity between two sparse vectors */
function cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    Object.keys(vecA).forEach(t => {
        normA += vecA[t] * vecA[t];
        if (vecB[t]) dot += vecA[t] * vecB[t];
    });
    Object.keys(vecB).forEach(t => {
        normB += vecB[t] * vecB[t];
    });
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0;
}

/* ─────────────────────────────────────────────
   BUILD INDEX
───────────────────────────────────────────── */
async function buildIndex() {
    console.log('🤖  [Recommender] Building TF-IDF index…');
    const start = Date.now();

    _courses = await Course.find({}).lean();
    if (_courses.length === 0) {
        console.warn('⚠️  [Recommender] No courses in DB — index is empty. Run `npm run seed:courses` first.');
        _isReady = false;
        return;
    }

    // Build documents
    _documents = _courses.map(buildDocument);

    // Tokenize all docs
    const allTokens = _documents.map(tokenize);

    // Compute TF for each doc
    const allTF = allTokens.map(computeTF);

    // Compute IDF across corpus
    _idf = computeIDF(allTF);

    // Build TF-IDF matrix (sparse vectors)
    _tfidfMatrix = allTF.map(tf => buildTFIDFVector(tf, _idf));

    _isReady = true;
    _lastBuildTime = Date.now();

    console.log(`✅  [Recommender] Index ready: ${_courses.length} courses, ${Object.keys(_idf).length} terms — ${Date.now() - start}ms`);
}

/** Ensure index is fresh; rebuild if stale or empty */
async function ensureReady() {
    if (!_isReady || Date.now() - _lastBuildTime > CACHE_TTL_MS) {
        await buildIndex();
    }
}

/* ─────────────────────────────────────────────
   MAIN RECOMMENDATION FUNCTION
───────────────────────────────────────────── */
/**
 * getRecommendations(options)
 *
 * @param {string}   skills       Comma or space-separated learner skills
 * @param {string}   interest     Target role / preferred industry
 * @param {string[]} softSkills   Optional soft skills
 * @param {number}   nsqf_level   Learner's NSQF level for filtering/ranking
 * @param {number}   topN         Number of results (default 5)
 * @returns {object} { recommendations: [...], meta: {...} }
 */
async function getRecommendations({
    skills = '',
    interest = '',
    softSkills = [],
    nsqf_level = null,
    topN = 5,
} = {}) {
    const t0 = Date.now();
    await ensureReady();

    if (!_isReady || _courses.length === 0) {
        return {
            recommendations: [],
            meta: {
                query: '',
                total_courses: 0,
                response_ms: Date.now() - t0,
                engine: 'TF-IDF + Cosine Similarity',
                error: 'Course database is empty. Run the seeder first.',
            },
        };
    }

    // ── Build query string from learner profile ──
    const skillsText = Array.isArray(skills)
        ? skills.join(' ')
        : skills.replace(/,/g, ' ');

    const softText = Array.isArray(softSkills)
        ? softSkills.join(' ')
        : (softSkills || '').replace(/,/g, ' ');

    const query = `${skillsText} ${interest} ${softText}`.trim() || 'vocational training';

    // Tokenize query and build its TF-IDF vector using corpus IDF
    const queryTokens = tokenize(query);
    const queryTF = computeTF(queryTokens);
    const queryVec = buildTFIDFVector(queryTF, _idf);

    // ── Score every course ──
    const scored = _courses.map((course, idx) => {
        let score = cosineSimilarity(queryVec, _tfidfMatrix[idx]);

        // Bonus: bump courses whose NSQF level is ≤ learner's level + 2
        // (achievable next step), linear decay beyond
        if (nsqf_level !== null) {
            const diff = course.nsqf_level - nsqf_level;
            if (diff >= 0 && diff <= 2) score *= (1 + 0.15 * (2 - diff));
            else if (diff < 0) score *= 0.85;  // slight penalty for lower level
        }

        return { course, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Filter out zero-score results and take topN
    const top = scored
        .filter(r => r.score > 0)
        .slice(0, topN);

    const recommendations = top.map((r, rank) => ({
        rank: rank + 1,
        course_id: r.course.course_id,
        course_name: r.course.course_name,
        sector: r.course.sector,
        skills_covered: r.course.skills_covered,
        nsqf_level: r.course.nsqf_level,
        duration: r.course.duration,
        job_role: r.course.job_role,
        similarity_score: parseFloat(r.score.toFixed(4)),
        match_quality: r.score >= 0.35 ? 'High' : r.score >= 0.15 ? 'Medium' : 'Low',
    }));

    return {
        recommendations,
        meta: {
            query,
            total_courses: _courses.length,
            results_returned: recommendations.length,
            response_ms: Date.now() - t0,
            engine: 'TF-IDF + Cosine Similarity',
            index_built_at: new Date(_lastBuildTime).toISOString(),
        },
    };
}

/** Force rebuild the index (used when new courses are imported) */
async function rebuildIndex() {
    _isReady = false;
    await buildIndex();
}

module.exports = { getRecommendations, buildIndex, rebuildIndex };
