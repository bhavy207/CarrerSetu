import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, TrendingUp, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';
import axios from 'axios';

const AI_API = 'http://127.0.0.1:8001/api/v1';

interface SkillGapAnalyzerProps {
    profile: any;
}

const SkillGapAnalyzer: React.FC<SkillGapAnalyzerProps> = ({ profile }) => {
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [targetRole, setTargetRole] = useState(profile?.target_role || 'Data Analyst');
    const [roles, setRoles] = useState<any[]>([]);

    useEffect(() => {
        // Fetch available roles from backend
        axios.get(`${AI_API}/skill-gap/roles`)
            .then(res => setRoles(res.data.roles || []))
            .catch(err => console.error("Error fetching roles", err));
    }, []);

    const performAnalysis = async () => {
        if (!profile) return;
        setLoading(true);
        try {
            const res = await axios.post(`${AI_API}/skill-gap/analyze`, {
                learner_skills: profile.skills?.technical_skills || [],
                target_role: targetRole,
                top_n: 3
            });
            setAnalysis(res.data);
        } catch (err) {
            console.error("Skill Gap Analysis error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile) performAnalysis();
    }, [profile]);

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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div className="spinner" style={{ borderColor: 'var(--brand-500)', borderRightColor: 'transparent', width: 24, height: 24, margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Running Random Forest AI Model...</p>
                </div>
            ) : analysis ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>

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
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Could not load analysis.</p>
            )}
        </div>
    );
};

export default SkillGapAnalyzer;
