import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, TrendingUp, Briefcase, GraduationCap, ArrowRight, Waypoints, List as ListIcon } from 'lucide-react';
import axios from 'axios';
import SkillTree from './SkillTree';

const AI_API = 'http://127.0.0.1:8001/api/v1';

const DEFAULT_ROLE_SKILLS: Record<string, string[]> = {
    'Data Analyst': ['python', 'sql', 'excel', 'statistics', 'tableau', 'power bi'],
    'Frontend Developer': ['html', 'css', 'javascript', 'react', 'typescript', 'responsive design'],
    'Backend Developer': ['nodejs', 'python', 'sql', 'rest api', 'mongodb', 'docker'],
    'Machine Learning Engineer': ['python', 'tensorflow', 'pandas', 'sklearn', 'statistics', 'deep learning'],
    'Full Stack Developer': ['javascript', 'react', 'nodejs', 'sql', 'mongodb', 'docker'],
    'DevOps Engineer': ['linux', 'docker', 'kubernetes', 'ci/cd', 'aws', 'git'],
    'Software Developer': ['python', 'java', 'sql', 'git', 'algorithms', 'data structures'],
};

// Case-insensitive fuzzy match: find the best role from available list
const matchRole = (targetRole: string, roles: any[]): string => {
    const input = (targetRole || '').toString().trim();
    if (!input) return 'Data Analyst';
    const lowerInput = input.toLowerCase();

    // Exact match first
    const exact = roles.find((r: any) => r.job_role.toLowerCase() === lowerInput);
    if (exact) return exact.job_role;

    // Partial and token match
    const partial = roles.find((r: any) => r.job_role.toLowerCase().includes(lowerInput) || lowerInput.includes(r.job_role.toLowerCase()));
    if (partial) return partial.job_role;

    const inputTokens = lowerInput.split(/\s+/).filter(Boolean);
    const tokenMatch = roles.find((r: any) => inputTokens.some(tok => r.job_role.toLowerCase().includes(tok)));
    if (tokenMatch) return tokenMatch.job_role;

    // Keep the requested role if unknown, otherwise fallback to first role
    return input || (roles.length > 0 ? roles[0].job_role : 'Data Analyst');
};

interface SkillGapAnalyzerProps {
    profile: any;
}

const SkillGapAnalyzer: React.FC<SkillGapAnalyzerProps> = ({ profile }) => {
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [serviceError, setServiceError] = useState('');
    const [roles, setRoles] = useState<any[]>([]);
    const [targetRole, setTargetRole] = useState('Data Analyst');  // will be updated after roles load
    const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');

    useEffect(() => {
        // Fetch available roles from backend
        axios.get(`${AI_API}/skill-gap/roles`)
            .then(res => {
                const fetchedRoles = res.data.roles || [];
                if (fetchedRoles.length > 0) {
                    setRoles(fetchedRoles);
                    // Set targetRole to best match from available roles
                    const profileRole = profile?.career_aspirations?.target_role || '';
                    setTargetRole(matchRole(profileRole, fetchedRoles));
                } else {
                    const fallbackRoles = Object.keys(DEFAULT_ROLE_SKILLS).map(job_role => ({ job_role, required_skills: DEFAULT_ROLE_SKILLS[job_role] }));
                    setRoles(fallbackRoles);
                    const profileRole = profile?.career_aspirations?.target_role || '';
                    setTargetRole(matchRole(profileRole, fallbackRoles));
                }
            })
            .catch(() => {
                const fallbackRoles = Object.keys(DEFAULT_ROLE_SKILLS).map(job_role => ({ job_role, required_skills: DEFAULT_ROLE_SKILLS[job_role] }));
                setRoles(fallbackRoles);
                const profileRole = profile?.career_aspirations?.target_role || '';
                setTargetRole(matchRole(profileRole, fallbackRoles));
            });
    }, [profile]);

    const performAnalysis = async () => {
        if (!profile) return;
        setLoading(true);
        setServiceError('');

        const learnerSkills = (profile.skills?.technical_skills || []).map((s: string) => s.toLowerCase().trim());

        // Get required skills: prefer from roles API response, fall back to DEFAULT_ROLE_SKILLS
        const normalizedTarget = (targetRole || '').toLowerCase().trim();
        const roleData = roles.find((r: any) => r.job_role.toLowerCase() === normalizedTarget)
            || roles.find((r: any) => r.job_role.toLowerCase().includes(normalizedTarget) || normalizedTarget.includes(r.job_role.toLowerCase()));

        const roleKey = Object.keys(DEFAULT_ROLE_SKILLS).find(k => k.toLowerCase() === normalizedTarget);
        const rawTargetSkills: string[] = roleData?.required_skills
            || (roleKey ? DEFAULT_ROLE_SKILLS[roleKey] : [])
            || [];

        const targetSkills = rawTargetSkills.length > 0
            ? rawTargetSkills.map((s: string) => s.toLowerCase().trim())
            : learnerSkills;

        try {
            const res = await axios.post(`${AI_API}/skill-gap/analyze`, {
                learner_skills: profile.skills?.technical_skills || [],
                target_role: targetRole,
                top_n: 3
            });
            setAnalysis(res.data);
            setServiceError('');
        } catch (err) {
            console.warn('Skill Gap AI backend failed, using fallback', err);

            // Substring-based matching (same as Python backend)
            const matched = targetSkills.filter((s: string) =>
                learnerSkills.some((l: string) => l.includes(s) || s.includes(l))
            );
            const missing = targetSkills.filter((s: string) =>
                !learnerSkills.some((l: string) => l.includes(s) || s.includes(l))
            );

            const fallbackAnalysis = {
                job_ready_pct: targetSkills.length === 0 ? 0 : Math.round((matched.length / targetSkills.length) * 100),
                job_ready: matched.length / Math.max(1, targetSkills.length) >= 0.7,
                total_matched: matched.length,
                total_missing: missing.length,
                matched_skills: matched,
                missing_skills: missing,
                sector: roleData?.sector || 'N/A',
                nsqf_level: roleData?.nsqf_level || profile.nsqf_level || 1,
                training_suggestions: missing.slice(0, 4).map((m: string) => ({ course_name: `Learn ${m}`, duration: '2-4 weeks' })),
            };

            setAnalysis(fallbackAnalysis);
            setServiceError('AI backend not reachable; showing fallback skill gap estimation.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile && roles.length > 0) {
            performAnalysis();
        }
    }, [profile, roles, targetRole]);

    return (
        <div style={{ padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={22} className="gradient-text-brand" /> Skill Gap Analyzer
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Discover missing skills for your dream role.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="form-input"
                        style={{ padding: '0.4rem 0.8rem', minWidth: '200px' }}
                    >
                        {roles.map((r: any, i) => (
                            <option key={i} value={r.job_role}>{r.job_role}</option>
                        ))}
                        {roles.length === 0 && <option value="Data Analyst">Data Analyst</option>}
                        {roles.length === 0 && <option value="Frontend Developer">Frontend Developer</option>}
                    </select>
                    <button onClick={performAnalysis} disabled={loading} className="btn btn-primary btn-sm">
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </div>

            {serviceError && (
                <div style={{ marginBottom: '0.75rem', padding: '0.8rem 1rem', background: 'rgba(255,223,186,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '10px', color: 'var(--warning)', fontSize: '0.8rem' }}>
                    {serviceError}
                </div>
            )}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div className="spinner" style={{ borderColor: 'var(--brand-500)', borderRightColor: 'transparent', width: 24, height: 24, margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Running Random Forest AI Model...</p>
                </div>
            ) : analysis ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '10px', display: 'flex', gap: '5px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '8px 20px', borderRadius: '8px', border: 'none', background: viewMode === 'list' ? 'var(--brand-600)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
                            >
                                <ListIcon size={16} /> List View
                            </button>
                            <button
                                onClick={() => setViewMode('tree')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '8px 20px', borderRadius: '8px', border: 'none', background: viewMode === 'tree' ? 'var(--brand-600)' : 'transparent', color: viewMode === 'tree' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
                            >
                                <Waypoints size={16} /> Skill Tree
                            </button>
                        </div>
                    </div>

                    {viewMode === 'list' ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>

                            {/* Left Column: Readiness Stats */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--success)', fontWeight: 700, marginBottom: '0.25rem' }}>AI Job Readiness</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{analysis.job_ready_pct}%</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status</div>
                                        <div style={{ fontWeight: 600, color: analysis.job_ready ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                                            {analysis.job_ready ? '✅ You are Ready' : 'Upskilling Needed'}
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}><CheckCircle size={14} /> Skills You Have ({analysis.total_matched})</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            {analysis.matched_skills.map((s: string, i: number) => (
                                                <span key={i} className="badge badge-success">{s}</span>
                                            ))}
                                            {analysis.matched_skills.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None matched</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}><AlertCircle size={14} /> Skills Missing ({analysis.total_missing})</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            {analysis.missing_skills.map((s: string, i: number) => (
                                                <span key={i} className="badge" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)' }}>{s}</span>
                                            ))}
                                            {analysis.missing_skills.length === 0 && <span className="badge badge-success">You have all required skills!</span>}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Right Column: AI Course Suggestions & Market */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span className="badge badge-neutral"><Briefcase size={12} /> Sector: {analysis.sector}</span>
                                    <span className="badge badge-brand"><GraduationCap size={12} /> Target NSQF: {analysis.nsqf_level}</span>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>AI Suggested Courses</h3>
                                    {analysis.training_suggestions && analysis.training_suggestions.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {analysis.training_suggestions.map((c: any, i: number) => (
                                                <div key={i} className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{c.course_name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Duration: {c.duration}</div>
                                                    </div>
                                                    <ArrowRight size={14} color="var(--text-muted)" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No courses needed right now!</p>
                                    )}
                                </div>
                            </div>

                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                            <SkillTree matched_skills={analysis.matched_skills} missing_skills={analysis.missing_skills} />
                        </motion.div>
                    )}
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1.5rem', color: 'var(--text-muted)' }}>
                    <AlertCircle size={40} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Could not load analysis</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Make sure your profile has technical skills and a target role
                    </p>
                    <a href="/profile-settings" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--brand-600)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Complete Profile →</a>
                </div>
            )}
        </div>
    );
};

export default SkillGapAnalyzer;
