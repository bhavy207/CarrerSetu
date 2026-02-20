import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Award, TrendingUp, Layers, AlertCircle, ArrowRight, CheckCircle, Brain, GraduationCap, Briefcase, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ResultProps {
    data: any;
    onReset: () => void;
    readOnly?: boolean;
}

/* ── Match quality colour ── */
const qColor = (q?: string) =>
    q === 'High' ? 'var(--success)' : q === 'Medium' ? 'var(--warning)' : 'var(--text-muted)';

/* ── Course Card (for recommendations) ── */
const RecommendedCourseCard = ({ course, index }: { course: any; index: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.07 }}
        style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.875rem 1rem', borderRadius: 12,
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
        }}
    >
        {/* Rank badge */}
        <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: index === 0 ? 'linear-gradient(135deg,var(--brand-600),var(--accent-violet))' : 'var(--glass-bg-strong)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.78rem',
            color: index === 0 ? '#fff' : 'var(--text-secondary)',
            border: index === 0 ? 'none' : '1px solid var(--glass-border)',
            boxShadow: index === 0 ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
        }}>#{course.rank}</div>

        {/* Course info */}
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {course.course_name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.18rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Briefcase size={10} />{course.job_role}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} />{course.duration}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><GraduationCap size={10} />NSQF {course.nsqf_level}</span>
            </div>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0 }}>
            {course.similarity_score !== undefined && (
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: qColor(course.match_quality), fontFamily: 'Outfit,sans-serif' }}>
                    {Math.round(course.similarity_score * 100)}%
                </div>
            )}
            <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.12rem 0.45rem', borderRadius: '9999px', background: `${qColor(course.match_quality)}18`, color: qColor(course.match_quality), border: `1px solid ${qColor(course.match_quality)}40` }}>
                {course.match_quality}
            </span>
        </div>
        <ChevronRight size={13} color="var(--text-muted)" />
    </motion.div>
);

const ResultsView: React.FC<ResultProps> = ({ data, onReset, readOnly }) => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    const onStartJourney = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://127.0.0.1:8000/api/v1/learner/save-path', { pathwayData: data }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving path', error);
            alert('Failed to save path.');
            setSaving(false);
        }
    };

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

    return (
        <motion.div variants={container} initial="hidden" animate="show" style={{ maxWidth: '1040px', margin: '0 auto' }}>

            {/* ── HERO BANNER ── */}
            <motion.div
                variants={item}
                style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(167,139,250,0.12) 50%, rgba(34,211,238,0.08) 100%)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: 20,
                    padding: '2rem 2.5rem',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background decoration */}
                <div style={{ position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
                            <span className="badge badge-brand">
                                <Award size={12} /> NSQF Level {data.recommended_nsqf_level}
                            </span>
                            <span className="badge badge-neutral">
                                <Clock size={12} /> {data.estimated_timeline}
                            </span>
                            {data.sector && (
                                <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(52,211,153,0.3)' }}>
                                    <Briefcase size={12} /> {data.sector}
                                </span>
                            )}
                            <span className="badge badge-success">
                                <CheckCircle size={12} /> AI Personalised
                            </span>
                        </div>
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
                            Your Personalized Career Pathway
                        </h2>
                        <p style={{ margin: 0, maxWidth: '560px' }}>
                            {data.learner_summary}
                        </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-end' }}>
                        <button
                            onClick={onReset}
                            className="btn btn-secondary"
                        >
                            {readOnly ? 'Back to Dashboard' : 'Start Over'}
                        </button>
                        {!readOnly && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onStartJourney}
                                disabled={saving}
                                className="btn btn-primary"
                                style={{ minWidth: 150, boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
                            >
                                {saving ? (
                                    <>
                                        <svg width="16" height="16" style={{ animation: 'spin-smooth 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3" /><path d="M21 12a9 9 0 01-9 9" /></svg>
                                        Saving…
                                    </>
                                ) : (
                                    <> Start Journey <ArrowRight size={16} /> </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ── MAIN GRID ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* LEFT COLUMN — Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <motion.div variants={item} className="glass-card" style={{ padding: '1.75rem' }}>
                        <div className="section-header">
                            <div className="section-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
                                <Layers size={18} color="var(--brand-400)" />
                            </div>
                            <h3 className="section-title">Learning Path Progression</h3>
                        </div>

                        {/* Timeline */}
                        <div className="timeline">
                            <AnimatePresence>
                                {data.learning_path.map((step: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        className="timeline-item"
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                    >
                                        <div className="timeline-node">{index + 1}</div>
                                        <div
                                            className="glass-card"
                                            style={{ padding: '1.25rem 1.5rem', marginBottom: 0, cursor: 'default' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--brand-300)', fontSize: '1rem' }}>
                                                        {step.step_name}
                                                    </h4>
                                                    <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6 }}>
                                                        {step.description}
                                                    </p>
                                                </div>
                                                <span className="badge badge-brand" style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                                                    <Clock size={11} /> {step.duration}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN — Skill Gaps + Career Growth */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Skill Gaps */}
                    <motion.div variants={item} className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="section-header">
                            <div className="section-icon" style={{ background: 'var(--danger-bg)' }}>
                                <AlertCircle size={17} color="var(--danger)" />
                            </div>
                            <h3 className="section-title" style={{ color: 'var(--danger)' }}>Skills to Learn</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {data.skill_gap && data.skill_gap.map((skill: string, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + i * 0.07 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.55rem 0.875rem',
                                        background: 'var(--danger-bg)',
                                        border: '1px solid var(--danger-border)',
                                        borderRadius: 10,
                                        fontSize: '0.85rem',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0 }} />
                                    {skill}
                                </motion.div>
                            ))}
                        </div>
                        {/* Matched Skills */}
                        {data.matched_skills && data.matched_skills.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <CheckCircle size={11} /> Already Have
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {data.matched_skills.map((skill: string, i: number) => (
                                        <span key={i} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(52,211,153,0.12)', color: 'var(--accent-emerald)', border: '1px solid rgba(52,211,153,0.3)', fontWeight: 600 }}>
                                            ✓ {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Career Growth Ladder */}
                    <motion.div variants={item} className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="section-header">
                            <div className="section-icon" style={{ background: 'var(--success-bg)' }}>
                                <TrendingUp size={17} color="var(--success)" />
                            </div>
                            <h3 className="section-title" style={{ color: 'var(--success)' }}>Career Growth</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {[
                                { label: 'Entry Level', value: data.career_outcomes?.entry_level, icon: '🌱', color: 'var(--success)' },
                                { label: 'Mid Level', value: data.career_outcomes?.mid_level, icon: '🚀', color: 'var(--accent-cyan)' },
                                { label: 'Future Specialization', value: data.career_outcomes?.future_specialization, icon: '⭐', color: 'var(--accent-violet)' },
                            ].map((tier, i) => (
                                <React.Fragment key={i}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.875rem 0' }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: 'var(--glass-bg-strong)',
                                            border: '1px solid var(--glass-border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.1rem', flexShrink: 0,
                                        }}>
                                            {tier.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: tier.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem' }}>
                                                {tier.label}
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                                {tier.value || '—'}
                                            </div>
                                        </div>
                                    </div>
                                    {i < 2 && (
                                        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '0.875rem', gap: '0.25rem' }}>
                                            <div style={{ width: 1.5, height: 20, background: 'var(--glass-border)', marginLeft: 16.5 }} />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        {/* Market Insights */}
                        {(data.career_outcomes?.salary_range || data.career_outcomes?.market_demand) && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Market Insights</div>
                                {data.career_outcomes.salary_range && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>💰 Salary Range</span>
                                        <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{data.career_outcomes.salary_range}</span>
                                    </div>
                                )}
                                {data.career_outcomes.market_demand && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>📈 Market Demand</span>
                                        <span style={{ fontWeight: 700, color: 'var(--brand-300)' }}>{data.career_outcomes.market_demand}</span>
                                    </div>
                                )}
                                {data.career_outcomes.growth_rate && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>🚀 Job Growth</span>
                                        <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{data.career_outcomes.growth_rate}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Summary stats */}
                    <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
                                <Layers size={18} color="var(--brand-400)" />
                            </div>
                            <div className="stat-value" style={{ color: 'var(--brand-400)' }}>
                                {data.learning_path?.length || 0}
                            </div>
                            <div className="stat-label">Learning Steps</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
                                <AlertCircle size={18} color="var(--danger)" />
                            </div>
                            <div className="stat-value" style={{ color: 'var(--danger)' }}>
                                {data.skill_gap?.length || 0}
                            </div>
                            <div className="stat-label">Skills to Build</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(52,211,153,0.12)' }}>
                                <CheckCircle size={18} color="var(--accent-emerald)" />
                            </div>
                            <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
                                {data.matched_skills?.length || 0}
                            </div>
                            <div className="stat-label">Skills Matched</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(34,211,238,0.1)' }}>
                                <GraduationCap size={18} color="var(--accent-cyan)" />
                            </div>
                            <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
                                {data.target_nsqf || data.recommended_nsqf_level || '—'}
                            </div>
                            <div className="stat-label">Target NSQF</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── AI RECOMMENDED COURSES ── */}
            {Array.isArray(data.course_recommendations) && data.course_recommendations.length > 0 && (
                <motion.div variants={item} className="glass-card" style={{ padding: '1.75rem', marginTop: '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(167,139,250,0.15))', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Brain size={18} color="var(--brand-400)" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>AI Recommended Courses</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>TF-IDF + Cosine Similarity · Matched to your skills, NSQF level &amp; job role</p>
                        </div>
                        <span className="badge badge-brand" style={{ flexShrink: 0 }}>Top {data.course_recommendations.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {data.course_recommendations.map((course: any, i: number) => (
                            <RecommendedCourseCard key={course.course_id} course={course} index={i} />
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ResultsView;
