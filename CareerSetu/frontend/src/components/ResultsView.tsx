import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Award, TrendingUp, Layers, AlertCircle, ArrowRight, Loader } from 'lucide-react';
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
            await axios.post('http://127.0.0.1:8000/api/v1/learner/save-path', {
                pathwayData: data
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Error saving path", error);
            alert("Failed to save path.");
            setSaving(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-gradient" style={{ fontSize: '2rem' }}>Your Personalized Career Pathway</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onReset} style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>Start Over</button>
                    <button
                        onClick={onStartJourney}
                        disabled={saving}
                        style={{
                            background: 'var(--primary)',
                            border: 'none',
                            color: '#fff',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600
                        }}
                    >
                        {saving ? <Loader size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                        Start Journey
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Summary Card */}
                    <motion.div variants={item} className="glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award /> Assessment Summary</h3>
                        <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>{data.learner_summary}</p>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recommended NSQF Level</span>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-accent)' }}>{data.recommended_nsqf_level}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estimated Timeline</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}><Clock size={20} style={{ verticalAlign: 'middle' }} /> {data.estimated_timeline}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Pathway Steps */}
                    <motion.div variants={item}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><Layers /> Learning Path Progression</h3>
                        <div style={{ position: 'relative', paddingLeft: '20px' }}>
                            <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>
                            {data.learning_path.map((step: any, index: number) => (
                                <div key={index} className="glass-panel" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-34px', top: '20px', width: '26px', height: '26px', background: 'var(--bg-primary)', border: '2px solid var(--primary)', borderRadius: '50%', zIndex: 2 }}></div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{step.step_name}</h4>
                                    <p style={{ margin: '0 0 0.5rem 0' }}>{step.description}</p>
                                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{step.duration}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Skill Gaps */}
                    <motion.div variants={item} className="glass-panel">
                        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff7675' }}><AlertCircle size={20} /> Skill Gaps Identified</h3>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                            {data.skill_gap.map((skill: string, i: number) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>{skill}</li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Career Outcomes */}
                    <motion.div variants={item} className="glass-panel">
                        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#55efc4' }}><TrendingUp size={20} /> Career Growth</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Entry Level</span>
                            <div style={{ fontWeight: 600 }}>{data.career_outcomes.entry_level}</div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mid Level</span>
                            <div style={{ fontWeight: 600 }}>{data.career_outcomes.mid_level}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Future Specialization</span>
                            <div style={{ fontWeight: 600 }}>{data.career_outcomes.future_specialization}</div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
};

export default ResultsView;
