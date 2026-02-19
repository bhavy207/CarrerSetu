const profilingService = {
    analyzeLearner: (profile) => {
        // 1. Determine NSQF Level based on qualification
        const { highest_qualification, background_stream } = profile.academic_info;
        const { target_role } = profile.career_aspirations;
        const { technical_skills } = profile.skills;

        const nsqf_level = determine_nsqf_level(highest_qualification);

        // 2. Identify Skill Gaps
        const skill_gaps = analyze_skill_gaps(technical_skills, target_role);

        // 3. Generate Pathway
        const pathway = generate_pathway(nsqf_level, target_role);

        // 4. Career Outcomes
        const outcomes = predict_outcomes(target_role);

        const estimated_timeline = nsqf_level < 5 ? "6 Months" : "1 Year";

        return {
            learner_summary: `Learner with ${highest_qualification} interested in ${profile.career_aspirations.preferred_industry}.`,
            recommended_nsqf_level: String(nsqf_level),
            justification: "Based on previous qualification.",
            learning_path: pathway,
            skill_gap: skill_gaps,
            estimated_timeline: estimated_timeline,
            career_outcomes: outcomes
        };
    }
};

const determine_nsqf_level = (qualification) => {
    const q = qualification.toLowerCase();
    if (q.includes("8th") || q.includes("below")) return 1;
    if (q.includes("10th")) return 3;
    if (q.includes("12th")) return 4;
    if (q.includes("diploma")) return 5;
    if (q.includes("graduate") || q.includes("btech") || q.includes("degree")) return 6;
    return 1;
};

const analyze_skill_gaps = (current_skills, target_role) => {
    const required_skills = {
        "developer": ["python", "sql", "git"],
        "data scientist": ["python", "statistics", "ml"],
        "electrician": ["wiring", "safety", "tools"]
    };

    const target = target_role.toLowerCase();
    let needed = [];
    for (const [role, skills] of Object.entries(required_skills)) {
        if (target.includes(role)) {
            needed = skills;
            break;
        }
    }

    if (needed.length === 0) {
        needed = ["industry knowledge", "communication"];
    }

    const current_lower = current_skills.map(s => s.toLowerCase());
    const gaps = needed.filter(s => !current_lower.includes(s));
    return gaps.length > 0 ? gaps : ["Advanced specialized skills"];
};

const generate_pathway = (start_level, role) => {
    const steps = [];
    steps.push({ step_name: "Foundation", description: "Basic industry orientation", duration: "1 Month" });
    steps.push({ step_name: "Core Certification", description: `NSQF Level ${start_level} Certification in ${role}`, duration: "3 Months" });
    steps.push({ step_name: "Practical Training", description: "On-job training or simulation", duration: "2 Months" });

    if (start_level >= 4) {
        steps.push({ step_name: "Advanced Certification", description: `NSQF Level ${start_level + 1} Specialization`, duration: "6 Months" });
    }

    return steps;
};

const predict_outcomes = (role) => {
    return {
        entry_level: `Junior ${role}`,
        mid_level: `Senior ${role}`,
        future_specialization: `Lead ${role} / Specialist`
    };
};

module.exports = profilingService;
