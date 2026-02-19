import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Award, TrendingUp, Layers, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ResultProps {
    data: any;
    onReset: () => void;
}

const ResultsView: React.FC<ResultProps> = ({ data, onReset }) => {
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
                            Start Over
                        </button>
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
                            <h3 className="section-title" style={{ color: 'var(--danger)' }}>Skill Gaps</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {data.skill_gap.map((skill: string, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + i * 0.07 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.625rem 0.875rem',
                                        background: 'var(--danger-bg)',
                                        border: '1px solid var(--danger-border)',
                                        borderRadius: 10,
                                        fontSize: '0.875rem',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0 }} />
                                    {skill}
                                </motion.div>
                            ))}
                        </div>
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
                            <div className="stat-label">Skill Gaps</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ResultsView;
