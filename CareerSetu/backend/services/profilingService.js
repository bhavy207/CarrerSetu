/**
 * profilingService.js
 * AI Career Profiling Engine — Node.js (rule-based + weighted scoring)
 *
 * Covers 50+ job roles across 10+ sectors
 * Returns a rich, structured LearnerPathwayResponse compatible with ResultsView
 */

// ─── Role knowledge base ───────────────────────────────────────────────────
const ROLE_KB = {
    // ── IT & Software ──
    'frontend developer': { sector: 'IT', skills: ['html', 'css', 'javascript', 'react', 'git', 'responsive design'], nsqf: 5 },
    'backend developer': { sector: 'IT', skills: ['node.js', 'python', 'sql', 'rest api', 'git', 'mongodb'], nsqf: 5 },
    'full stack developer': { sector: 'IT', skills: ['javascript', 'react', 'node.js', 'sql', 'mongodb', 'git', 'docker'], nsqf: 6 },
    'software developer': { sector: 'IT', skills: ['python', 'java', 'sql', 'git', 'algorithms', 'data structures'], nsqf: 5 },
    'mobile app developer': { sector: 'IT', skills: ['flutter', 'react native', 'swift', 'kotlin', 'git', 'ui/ux'], nsqf: 5 },
    'data analyst': { sector: 'Analytics', skills: ['python', 'sql', 'excel', 'power bi', 'statistics', 'tableau'], nsqf: 5 },
    'data scientist': { sector: 'Analytics', skills: ['python', 'machine learning', 'statistics', 'sql', 'pandas', 'sklearn'], nsqf: 6 },
    'machine learning engineer': { sector: 'AI/ML', skills: ['python', 'tensorflow', 'sklearn', 'mathematics', 'deep learning', 'ml ops'], nsqf: 7 },
    'ai engineer': { sector: 'AI/ML', skills: ['python', 'deep learning', 'nlp', 'computer vision', 'pytorch', 'cloud'], nsqf: 7 },
    'devops engineer': { sector: 'IT', skills: ['linux', 'docker', 'kubernetes', 'ci/cd', 'aws', 'git'], nsqf: 6 },
    'cloud engineer': { sector: 'IT', skills: ['aws', 'azure', 'gcp', 'terraform', 'linux', 'networking'], nsqf: 6 },
    'cybersecurity analyst': { sector: 'IT', skills: ['networking', 'linux', 'ethical hacking', 'siem', 'firewalls', 'python'], nsqf: 6 },
    'ui/ux designer': { sector: 'Design', skills: ['figma', 'adobe xd', 'user research', 'prototyping', 'html', 'css'], nsqf: 5 },
    'graphic designer': { sector: 'Design', skills: ['photoshop', 'illustrator', 'figma', 'typography', 'branding', 'color theory'], nsqf: 4 },
    'web designer': { sector: 'Design', skills: ['html', 'css', 'javascript', 'wordpress', 'figma', 'seo'], nsqf: 4 },
    'qa engineer': { sector: 'IT', skills: ['selenium', 'jira', 'test cases', 'python', 'api testing', 'sql'], nsqf: 5 },
    'database administrator': { sector: 'IT', skills: ['sql', 'mysql', 'postgresql', 'backup', 'performance tuning', 'security'], nsqf: 6 },
    'network engineer': { sector: 'IT', skills: ['ccna', 'tcp/ip', 'routing', 'switching', 'firewalls', 'troubleshooting'], nsqf: 5 },

    // ── Healthcare ──
    'nurse': { sector: 'Healthcare', skills: ['patient care', 'anatomy', 'medications', 'first aid', 'medical records'], nsqf: 5 },
    'medical lab technician': { sector: 'Healthcare', skills: ['laboratory techniques', 'biology', 'pathology', 'microscopy', 'data recording'], nsqf: 4 },
    'pharmacist': { sector: 'Healthcare', skills: ['pharmacology', 'chemistry', 'patient counselling', 'drug interactions', 'inventory'], nsqf: 6 },
    'physiotherapist': { sector: 'Healthcare', skills: ['anatomy', 'rehabilitation', 'exercise therapy', 'patient assessment', 'documentation'], nsqf: 6 },
    'health worker': { sector: 'Healthcare', skills: ['first aid', 'community health', 'sanitation', 'nutrition', 'record keeping'], nsqf: 3 },

    // ── Finance & Banking ──
    'accountant': { sector: 'Finance', skills: ['accounting', 'tally', 'gst', 'tds', 'excel', 'taxation'], nsqf: 5 },
    'financial analyst': { sector: 'Finance', skills: ['excel', 'financial modelling', 'python', 'sql', 'valuation', 'reporting'], nsqf: 6 },
    'bank clerk': { sector: 'Finance', skills: ['banking operations', 'customer service', 'ms office', 'data entry', 'communication'], nsqf: 4 },
    'insurance agent': { sector: 'Finance', skills: ['sales', 'policy knowledge', 'communication', 'crm', 'negotiation'], nsqf: 3 },
    'tax consultant': { sector: 'Finance', skills: ['income tax', 'gst', 'tally', 'accounting', 'legal compliance'], nsqf: 5 },

    // ── Manufacturing & Trades ──
    'electrician': { sector: 'Electrical', skills: ['wiring', 'circuit diagrams', 'safety standards', 'plc', 'troubleshooting', 'tools'], nsqf: 4 },
    'plumber': { sector: 'Plumbing', skills: ['pipe fitting', 'tools', 'safety', 'blueprint reading', 'soldering'], nsqf: 3 },
    'welder': { sector: 'Manufacturing', skills: ['arc welding', 'mig welding', 'metal cutting', 'safety', 'blueprints'], nsqf: 3 },
    'cnc operator': { sector: 'Manufacturing', skills: ['cnc programming', 'g-code', 'machine setup', 'quality control', 'blueprints'], nsqf: 4 },
    'automobile mechanic': { sector: 'Automotive', skills: ['engine repair', 'diagnostics', 'tools', 'electrical systems', 'safety'], nsqf: 4 },
    'hvac technician': { sector: 'HVAC', skills: ['refrigeration', 'electrical', 'troubleshooting', 'tools', 'safety regulations'], nsqf: 4 },

    // ── Business & Management ──
    'business analyst': { sector: 'Business', skills: ['sql', 'excel', 'requirements gathering', 'uml', 'power bi', 'communication'], nsqf: 6 },
    'project manager': { sector: 'Business', skills: ['pmp', 'agile', 'risk management', 'budgeting', 'ms project', 'leadership'], nsqf: 6 },
    'hr manager': { sector: 'HR', skills: ['recruitment', 'payroll', 'labour law', 'hrms', 'communication', 'conflict resolution'], nsqf: 6 },
    'marketing manager': { sector: 'Marketing', skills: ['digital marketing', 'seo', 'google ads', 'analytics', 'crm', 'content strategy'], nsqf: 6 },
    'sales executive': { sector: 'Sales', skills: ['communication', 'crm', 'negotiation', 'product knowledge', 'lead generation'], nsqf: 4 },
    'supply chain manager': { sector: 'Logistics', skills: ['erp', 'inventory management', 'logistics', 'procurement', 'excel', 'vendor management'], nsqf: 6 },
    'entrepreneur': { sector: 'Business', skills: ['business planning', 'finance', 'marketing', 'leadership', 'sales', 'legal basics'], nsqf: 5 },

    // ── Education ──
    'teacher': { sector: 'Education', skills: ['subject expertise', 'lesson planning', 'classroom management', 'communication', 'assessment'], nsqf: 6 },
    'content writer': { sector: 'Media', skills: ['writing', 'seo', 'research', 'ms word', 'grammar', 'storytelling'], nsqf: 4 },
    'digital marketer': { sector: 'Marketing', skills: ['seo', 'social media', 'google ads', 'email marketing', 'analytics', 'content'], nsqf: 4 },

    // ── Creative Arts ──
    'video editor': { sector: 'Media', skills: ['premiere pro', 'after effects', 'colour grading', 'audio mixing', 'storytelling'], nsqf: 4 },
    'photographer': { sector: 'Media', skills: ['dslr operation', 'lightroom', 'photoshop', 'composition', 'lighting'], nsqf: 4 },
    'animator': { sector: 'Design', skills: ['blender', 'maya', 'adobe animate', 'storyboarding', 'rigging'], nsqf: 5 },

    // ── Agriculture ──
    'agronomist': { sector: 'Agriculture', skills: ['soil science', 'crop management', 'pest control', 'irrigation', 'agri extension'], nsqf: 5 },
    'farm manager': { sector: 'Agriculture', skills: ['crop planning', 'labour management', 'budgeting', 'irrigation', 'supply chain'], nsqf: 5 },

    // ── Hospitality ──
    'chef': { sector: 'Hospitality', skills: ['cooking techniques', 'menu planning', 'food safety', 'inventory', 'kitchen management'], nsqf: 4 },
    'hotel manager': { sector: 'Hospitality', skills: ['pms software', 'customer service', 'revenue management', 'leadership', 'communication'], nsqf: 6 },
    'travel agent': { sector: 'Hospitality', skills: ['booking systems', 'geography', 'customer service', 'communication', 'itinerary planning'], nsqf: 3 },

    // ── Construction ──
    'civil engineer': { sector: 'Construction', skills: ['autocad', 'structural analysis', 'site management', 'estimation', 'ms project'], nsqf: 6 },
    'architect': { sector: 'Construction', skills: ['autocad', 'revit', 'sketchup', 'building codes', 'client management', 'design'], nsqf: 7 },
    'site supervisor': { sector: 'Construction', skills: ['site management', 'blueprint reading', 'safety', 'labour management', 'reporting'], nsqf: 5 },
};

// ─── Salary & demand data ───────────────────────────────────────────────────
const ROLE_MARKET = {
    'IT': { salary_range: '₹3–12 LPA', demand: 'Very High', growth: '+22% YoY' },
    'AI/ML': { salary_range: '₹8–25 LPA', demand: 'Very High', growth: '+35% YoY' },
    'Analytics': { salary_range: '₹4–15 LPA', demand: 'High', growth: '+25% YoY' },
    'Design': { salary_range: '₹3–10 LPA', demand: 'High', growth: '+18% YoY' },
    'Finance': { salary_range: '₹3–12 LPA', demand: 'Moderate', growth: '+12% YoY' },
    'Healthcare': { salary_range: '₹2.5–8 LPA', demand: 'High', growth: '+15% YoY' },
    'Marketing': { salary_range: '₹3–10 LPA', demand: 'High', growth: '+20% YoY' },
    'Sales': { salary_range: '₹2.5–7 LPA', demand: 'High', growth: '+15% YoY' },
    'Business': { salary_range: '₹4–15 LPA', demand: 'Moderate', growth: '+14% YoY' },
    'HR': { salary_range: '₹3–10 LPA', demand: 'Moderate', growth: '+10% YoY' },
    'Manufacturing': { salary_range: '₹2–6 LPA', demand: 'Moderate', growth: '+8% YoY' },
    'Electrical': { salary_range: '₹2–5 LPA', demand: 'High', growth: '+12% YoY' },
    'Automotive': { salary_range: '₹2–5 LPA', demand: 'Moderate', growth: '+10% YoY' },
    'Construction': { salary_range: '₹3–10 LPA', demand: 'Moderate', growth: '+12% YoY' },
    'Agriculture': { salary_range: '₹2–6 LPA', demand: 'Moderate', growth: '+10% YoY' },
    'Education': { salary_range: '₹2.5–7 LPA', demand: 'High', growth: '+10% YoY' },
    'Hospitality': { salary_range: '₹2–6 LPA', demand: 'High', growth: '+15% YoY' },
    'Media': { salary_range: '₹2.5–8 LPA', demand: 'High', growth: '+18% YoY' },
    'Logistics': { salary_range: '₹3–9 LPA', demand: 'High', growth: '+18% YoY' },
    'Plumbing': { salary_range: '₹1.8–4 LPA', demand: 'Moderate', growth: '+8% YoY' },
    'HVAC': { salary_range: '₹2–5 LPA', demand: 'Moderate', growth: '+10% YoY' },
};

// ─── NSQF level from qualification ─────────────────────────────────────────
const determineNsqfLevel = (qualification) => {
    if (!qualification) return { level: 1, justification: 'Default entry level.' };
    const q = qualification.toLowerCase();
    if (q.includes('below') || q.includes('8th') || q.includes('5th') || q.includes('7th'))
        return { level: 1, justification: 'Entry level — foundational vocational path recommended.' };
    if (q.includes('10th') || q.includes('ssc'))
        return { level: 3, justification: 'Secondary education — eligible for trade and skill courses.' };
    if (q.includes('12th') || q.includes('hsc') || q.includes('higher secondary'))
        return { level: 4, justification: 'Higher secondary — wide range of certification paths available.' };
    if (q.includes('diploma') || q.includes('iti') || q.includes('polytechnic'))
        return { level: 5, justification: 'Technical diploma — advanced vocational and industry entry roles.' };
    if (q.includes('graduate') || q.includes('degree') || q.includes('btech') ||
        q.includes('b.tech') || q.includes('b.e.') || q.includes('bca') ||
        q.includes('bsc') || q.includes('b.com') || q.includes('b.a'))
        return { level: 6, justification: 'Graduate — professional / specialist programmes aligned.' };
    if (q.includes('post graduate') || q.includes('mtech') || q.includes('msc') ||
        q.includes('mba') || q.includes('m.tech') || q.includes('mca'))
        return { level: 7, justification: 'Post-graduate — leadership and expert-level programmes.' };
    if (q.includes('phd') || q.includes('doctorate'))
        return { level: 8, justification: 'Doctoral level — research and master practitioner path.' };
    return { level: 4, justification: 'Standard proficiency entry point.' };
};

// ─── Find best matching KB role ────────────────────────────────────────────
const findMatchingRole = (targetRole) => {
    const t = targetRole.toLowerCase().trim();
    // Exact match
    if (ROLE_KB[t]) return { key: t, ...ROLE_KB[t] };
    // Partial match — longest key that is a substring of target
    let best = null, bestLen = 0;
    for (const [key, data] of Object.entries(ROLE_KB)) {
        if (t.includes(key) && key.length > bestLen) { best = { key, ...data }; bestLen = key.length; }
    }
    if (best) return best;
    // Reverse partial — target is substring of key
    for (const [key, data] of Object.entries(ROLE_KB)) {
        if (key.includes(t) && key.length > bestLen) { best = { key, ...data }; bestLen = key.length; }
    }
    return best;
};

// ─── Skill gap analysis ─────────────────────────────────────────────────────
const analyzeSkillGaps = (currentSkills, targetRole) => {
    const currentLower = (currentSkills || []).map(s => s.toLowerCase().trim());
    const matched = findMatchingRole(targetRole);
    if (!matched) return { gaps: ['Industry-specific technical knowledge', 'Domain fundamentals', 'Communication & teamwork', 'Project-based learning'], matched_skills: [] };

    const required = matched.skills;
    const gaps = required.filter(s => !currentLower.some(c => c.includes(s) || s.includes(c)));
    const matched_skills = required.filter(s => currentLower.some(c => c.includes(s) || s.includes(c)));
    return { gaps: gaps.length ? gaps : ['Advanced specialization skills', 'Industry best practices'], matched_skills, required };
};

// ─── Pathway generator ─────────────────────────────────────────────────────
const generatePathway = (nsqfLevel, targetRole, qualification, gapSkills, matchedSkills) => {
    const roleInfo = findMatchingRole(targetRole);
    const sector = roleInfo ? roleInfo.sector : 'General';
    const targetNsqf = roleInfo ? roleInfo.nsqf : Math.min(nsqfLevel + 1, 6);

    const steps = [];

    // Step 1 — Foundation (always)
    steps.push({
        step_name: 'Industry Orientation',
        description: `Gain an overview of the ${sector} sector: key trends, job profiles, and required competencies for a ${targetRole}.`,
        duration: '2 Weeks',
    });

    // Step 2 — Gap bridging (only if there are gaps)
    if (gapSkills.length > 0) {
        const topGaps = gapSkills.slice(0, 3).join(', ');
        steps.push({
            step_name: 'Core Skill Development',
            description: `Build foundational skills in ${topGaps} through structured online/offline modules. Hands-on mini-projects included.`,
            duration: nsqfLevel <= 3 ? '3 Months' : '2 Months',
        });
    }

    // Step 3 — NSQF Certification
    steps.push({
        step_name: `NSQF Level ${Math.max(nsqfLevel, targetNsqf - 1)} Certification`,
        description: `Complete a government-recognised NSQF Level ${Math.max(nsqfLevel, targetNsqf - 1)} course for ${targetRole} under the PMKVY / sector-skill-council framework.`,
        duration: nsqfLevel <= 3 ? '3 Months' : '2 Months',
    });

    // Step 4 — Practical / Project training
    steps.push({
        step_name: 'Practical & Project-Based Training',
        description: `Apply skills through real-world projects, simulations, and case studies. Build a portfolio or skill-evidence document.`,
        duration: '2 Months',
    });

    // Step 5 — Advanced certification (if needed nsqf gap > 1)
    if (targetNsqf > nsqfLevel + 1) {
        const remaining = gapSkills.slice(3).join(', ') || 'advanced tools';
        steps.push({
            step_name: `NSQF Level ${targetNsqf} Advanced Specialisation`,
            description: `Advance to Level ${targetNsqf} with specialisation in ${remaining || 'sector-specific tools and leadership skills'}.`,
            duration: '4 Months',
        });
    }

    // Step 6 — Job readiness
    steps.push({
        step_name: 'Job Readiness & Placement Prep',
        description: 'Resume building, mock interviews, LinkedIn optimisation, and connections to placement partners in the sector.',
        duration: '1 Month',
    });

    return steps;
};

// ─── Timeline estimator ─────────────────────────────────────────────────────
const estimateTimeline = (nsqfLevel, targetNsqf, numGaps) => {
    let months = 3;
    const gap = Math.max(0, targetNsqf - nsqfLevel);
    months += gap * 2;
    months += Math.min(numGaps, 5);
    if (months <= 3) return '3 Months';
    if (months <= 6) return '6 Months';
    if (months <= 9) return '9 Months';
    if (months <= 12) return '1 Year';
    return '1–1.5 Years';
};

// ─── Learner summary builder ────────────────────────────────────────────────
const buildSummary = (profile, nsqfLevel, roleInfo) => {
    const qual = profile.academic_info?.highest_qualification || 'an unspecified qualification';
    const role = profile.career_aspirations?.target_role || 'their target role';
    const industry = profile.career_aspirations?.preferred_industry || (roleInfo ? roleInfo.sector : 'the chosen field');
    const skills = (profile.skills?.technical_skills || []).join(', ') || 'no technical skills listed yet';
    const mode = profile.learning_preferences?.mode || 'online';
    const location = profile.socio_economic?.location || 'their area';

    return `${qual} graduate from ${location}, targeting a role as ${role} in the ${industry} sector. ` +
        `Current skills include: ${skills}. Recommended NSQF entry at Level ${nsqfLevel}, ` +
        `preferring ${mode.toLowerCase()} learning. The pathway is tailored to bridge skill gaps efficiently.`;
};

// ─── Main export ────────────────────────────────────────────────────────────
const profilingService = {
    analyzeLearner: (profile) => {
        if (!profile || !profile.academic_info || !profile.career_aspirations || !profile.skills) {
            throw new Error('Invalid profile: academic_info, career_aspirations, and skills are required.');
        }

        const qualification = profile.academic_info.highest_qualification || '';
        const targetRole = profile.career_aspirations.target_role || 'General Vocational';
        const technicalSkills = profile.skills.technical_skills || [];

        // 1. NSQF Level
        const { level: nsqfLevel, justification } = determineNsqfLevel(qualification);

        // 2. Role match & skill gap
        const roleInfo = findMatchingRole(targetRole);
        const { gaps: gapSkills, matched_skills, required: requiredSkills } = analyzeSkillGaps(technicalSkills, targetRole);
        const targetNsqf = roleInfo ? roleInfo.nsqf : Math.min(nsqfLevel + 1, 6);
        const sector = roleInfo ? roleInfo.sector : 'General';

        // 3. Pathway
        const learningPath = generatePathway(nsqfLevel, targetRole, qualification, gapSkills, matched_skills);

        // 4. Timeline
        const estimatedTimeline = estimateTimeline(nsqfLevel, targetNsqf, gapSkills.length);

        // 5. Career outcomes
        const market = ROLE_MARKET[sector] || { salary_range: '₹2–8 LPA', demand: 'Moderate', growth: '+10% YoY' };
        const careerOutcomes = {
            entry_level: `Junior ${targetRole}`,
            mid_level: `${targetRole}`,
            future_specialization: `Senior ${targetRole} / Team Lead`,
            salary_range: market.salary_range,
            market_demand: market.demand,
            growth_rate: market.growth,
        };

        // 6. Summary
        const learnerSummary = buildSummary(profile, nsqfLevel, roleInfo);

        return {
            learner_summary: learnerSummary,
            recommended_nsqf_level: String(nsqfLevel),
            justification,
            learning_path: learningPath,
            skill_gap: gapSkills,
            matched_skills: matched_skills || [],
            required_skills: requiredSkills || [],
            estimated_timeline: estimatedTimeline,
            career_outcomes: careerOutcomes,
            sector,
            target_nsqf: targetNsqf,
        };
    },
};

module.exports = profilingService;
