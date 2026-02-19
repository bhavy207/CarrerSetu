import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CheckCircle, Circle, Clock, Target, Award, BarChart2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step {
    _id: string;
    step_name: string;
    description: string;
    duration: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    completedAt?: string;
}

interface Path {
    _id: string;
    title: string;
    target_role: string;
    steps: Step[];
    isActive: boolean;
}

/* ── CIRCULAR PROGRESS RING ── */
const ProgressRing = ({ progress, size = 120 }: { progress: number; size?: number }) => {
    const radius = (size - 16) / 2;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (progress / 100) * circ;

    return (
        <div className="progress-ring-container" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
                <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="progress-ring-text">
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.6rem', lineHeight: 1, color: 'var(--brand-300)' }}>{progress}%</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.1rem' }}>Done</div>
            </div>
        </div>
    );
};

const statusConfig = {
    'Completed': { color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)', label: 'Completed' },
    'In Progress': { color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)', label: 'In Progress' },
    'Pending': { color: 'var(--text-muted)', bg: 'var(--glass-bg)', border: 'var(--glass-border)', label: 'Pending' },
};

const Dashboard = () => {
    const [path, setPath] = useState<Path | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { fetchPath(); }, []);

    const fetchPath = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await axios.get('http://127.0.0.1:8000/api/v1/learner/current-path', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPath(response.data);
        } catch (error) {
            console.error('Error fetching path', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStepStatus = async (stepId: string, status: string) => {
        if (!path) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://127.0.0.1:8000/api/v1/learner/update-step', {
                pathId: path._id, stepId, status,
            }, { headers: { Authorization: `Bearer ${token}` } });
            fetchPath();
        } catch (error) {
            console.error('Error updating step', error);
        }
    };

    /* Loading */
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem' }}>
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-600), var(--accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart2 size={28} color="white" />
                </motion.div>
                <div style={{ width: 200 }}>
                    <div className="loading-bar"><div className="loading-bar-fill" style={{ width: '100%' }} /></div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading your dashboard…</p>
            </div>
        );
    }

    /* Empty state */
    if (!path) {
        return (
            <div className="empty-state glass-card" style={{ maxWidth: 480, margin: '4rem auto', padding: '3.5rem 2.5rem' }}>
                <span className="empty-icon">🗺️</span>
                <h2 style={{ marginBottom: '0.75rem' }}>No Active Path Yet</h2>
                <p style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
                    Generate your first AI-powered career pathway to start tracking your progress here.
                </p>
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/')}
                    className="btn btn-primary btn-lg"
                >
                    <Plus size={18} /> Generate My Path
                </motion.button>
            </div>
        );
    }

    const completedSteps = path.steps.filter(s => s.status === 'Completed').length;
    const inProgressSteps = path.steps.filter(s => s.status === 'In Progress').length;
    const totalSteps = path.steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* ── HEADER SECTION ── */}
            <div style={{ marginBottom: '2rem' }}>
                <span className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>
                    <Target size={12} /> Active Path
                </span>
                <h1 style={{ marginBottom: '0.375rem' }}>{path.title}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Target Role: <strong style={{ color: 'var(--brand-300)' }}>{path.target_role}</strong>
                </p>
            </div>

            {/* ── STATS ROW ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-bg)', value: completedSteps, label: 'Completed' },
                    { icon: Clock, color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.1)', value: inProgressSteps, label: 'In Progress' },
                    { icon: Circle, color: 'var(--text-muted)', bg: 'var(--glass-bg-strong)', value: totalSteps - completedSteps - inProgressSteps, label: 'Pending' },
                    { icon: Award, color: 'var(--accent-violet)', bg: 'rgba(167,139,250,0.12)', value: totalSteps, label: 'Total Steps' },
                ].map(({ icon: Icon, color, bg, value, label }, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="stat-card"
                    >
                        <div className="stat-icon" style={{ background: bg }}>
                            <Icon size={18} color={color} />
                        </div>
                        <div className="stat-value" style={{ color }}>{value}</div>
                        <div className="stat-label">{label}</div>
                    </motion.div>
                ))}
            </div>

            {/* ── PROGRESS + STEPS ── */}
            <div className="glass-card" style={{ padding: '2rem' }}>

                {/* Progress header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem 0' }}>Learning Progress</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>
                            {completedSteps} of {totalSteps} steps completed
                        </p>
                    </div>
                    <ProgressRing progress={progress} />
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '1.75rem' }}>
                    <div className="loading-bar" style={{ height: 6 }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, var(--brand-600), var(--accent-violet))', borderRadius: 'var(--radius-full)' }}
                        />
                    </div>
                </div>

                <hr className="divider" />

                {/* Steps list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <AnimatePresence>
                        {path.steps.map((step, index) => {
                            const cfg = statusConfig[step.status];
                            return (
                                <motion.div
                                    key={step._id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.06 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '1rem',
                                        padding: '1rem 1.25rem',
                                        background: step.status === 'Completed' ? 'var(--success-bg)' : step.status === 'In Progress' ? 'rgba(34,211,238,0.06)' : 'var(--glass-bg)',
                                        border: `1px solid ${cfg.border}`,
                                        borderRadius: 14,
                                        transition: 'all 0.25s ease',
                                    }}
                                >
                                    {/* Step number / icon */}
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: step.status === 'Completed' ? 'var(--success)' : 'var(--bg-elevated)',
                                        border: `2px solid ${cfg.color}`,
                                        color: step.status === 'Completed' ? '#fff' : cfg.color,
                                        fontWeight: 700, fontSize: '0.8rem',
                                    }}>
                                        {step.status === 'Completed'
                                            ? <CheckCircle size={16} />
                                            : <span>{index + 1}</span>
                                        }
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: step.status === 'Completed' ? 'var(--success)' : 'var(--text-primary)' }}>
                                                    {step.step_name}
                                                </h4>
                                                <p style={{ margin: 0, fontSize: '0.825rem', lineHeight: 1.5 }}>{step.description}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.5rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        <Clock size={11} /> {step.duration}
                                                    </span>
                                                    <span className={`badge ${step.status === 'Completed' ? 'badge-success' : step.status === 'In Progress' ? 'badge-brand' : 'badge-neutral'}`}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                {step.status === 'Pending' && (
                                                    <button
                                                        onClick={() => updateStepStatus(step._id, 'In Progress')}
                                                        className="btn btn-sm"
                                                        style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(34,211,238,0.3)' }}
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                {step.status !== 'Completed' && (
                                                    <button
                                                        onClick={() => updateStepStatus(step._id, 'Completed')}
                                                        className="btn btn-success btn-sm"
                                                    >
                                                        <CheckCircle size={12} /> Done
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
