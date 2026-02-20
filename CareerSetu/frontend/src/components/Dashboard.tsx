import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    CheckCircle, Circle, Clock, Target, Award, BarChart2, Plus,
    ExternalLink, Globe, Code2, Layers, Cpu, BookOpen, Flame,
    TrendingUp, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ────────────────────────────────────────────────────────── */
/*  TYPES                                                    */
/* ────────────────────────────────────────────────────────── */
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

/* ────────────────────────────────────────────────────────── */
/*  WEB RESOURCES DATA                                       */
/* ────────────────────────────────────────────────────────── */
const webResources = [
    {
        category: 'HTML & CSS',
        icon: Globe,
        color: '#f97316',
        bg: 'rgba(249,115,22,0.12)',
        border: 'rgba(249,115,22,0.3)',
        links: [
            { label: 'MDN Web Docs', url: 'https://developer.mozilla.org', tag: 'Reference' },
            { label: 'CSS-Tricks', url: 'https://css-tricks.com', tag: 'Guide' },
            { label: 'Flexbox Froggy', url: 'https://flexboxfroggy.com', tag: 'Interactive' },
        ],
    },
    {
        category: 'JavaScript',
        icon: Code2,
        color: '#eab308',
        bg: 'rgba(234,179,8,0.12)',
        border: 'rgba(234,179,8,0.3)',
        links: [
            { label: 'JavaScript.info', url: 'https://javascript.info', tag: 'Tutorial' },
            { label: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net', tag: 'Book' },
            { label: 'JS30 by Wes Bos', url: 'https://javascript30.com', tag: 'Projects' },
        ],
    },
    {
        category: 'React & Ecosystem',
        icon: Layers,
        color: '#22d3ee',
        bg: 'rgba(34,211,238,0.10)',
        border: 'rgba(34,211,238,0.3)',
        links: [
            { label: 'React Docs (Beta)', url: 'https://react.dev', tag: 'Official' },
            { label: 'Vite.js', url: 'https://vitejs.dev', tag: 'Tooling' },
            { label: 'TanStack Query', url: 'https://tanstack.com/query', tag: 'Library' },
        ],
    },
    {
        category: 'Backend & APIs',
        icon: Cpu,
        color: '#a78bfa',
        bg: 'rgba(167,139,250,0.12)',
        border: 'rgba(167,139,250,0.3)',
        links: [
            { label: 'Node.js Docs', url: 'https://nodejs.org/en/docs', tag: 'Reference' },
            { label: 'Express.js Guide', url: 'https://expressjs.com/en/guide', tag: 'Guide' },
            { label: 'REST API Design', url: 'https://restfulapi.net', tag: 'Concepts' },
        ],
    },
];

/* ────────────────────────────────────────────────────────── */
/*  QUICK TIPS                                               */
/* ────────────────────────────────────────────────────────── */
const webTips = [
    { icon: '⚡', tip: 'Use semantic HTML tags for better SEO & accessibility.' },
    { icon: '🎨', tip: 'CSS custom properties make your design system maintainable.' },
    { icon: '📦', tip: 'Learn async/await before diving into React hooks.' },
    { icon: '🔍', tip: 'Browser DevTools are your best debugging friend.' },
    { icon: '🚀', tip: 'Lighthouse audits help you ship faster & accessible apps.' },
];

/* ────────────────────────────────────────────────────────── */
/*  PROGRESS RING                                            */
/* ────────────────────────────────────────────────────────── */
const ProgressRing = ({ progress, size = 100 }: { progress: number; size?: number }) => {
    const radius = (size - 16) / 2;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (progress / 100) * circ;
    return (
        <div className="progress-ring-container" style={{ width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="url(#ringGrad)" strokeWidth="8" strokeLinecap="round"
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
                <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', lineHeight: 1, color: 'var(--brand-300)' }}>{progress}%</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.1rem' }}>Done</div>
            </div>
        </div>
    );
};

const statusConfig = {
    'Completed': { color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)', label: 'Completed' },
    'In Progress': { color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)', label: 'In Progress' },
    'Pending': { color: 'var(--text-muted)', bg: 'var(--glass-bg)', border: 'var(--glass-border)', label: 'Pending' },
};

/* ────────────────────────────────────────────────────────── */
/*  DASHBOARD                                                */
/* ────────────────────────────────────────────────────────── */
const Dashboard = () => {
    const [path, setPath] = useState<Path | null>(null);
    const [loading, setLoading] = useState(true);
    const [tipIndex] = useState(() => Math.floor(Math.random() * webTips.length));
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

    /* ── Loading ── */
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

    /* ── Empty state ── */
    if (!path) {
        return (
            <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1rem' }}>
                {/* Empty path card */}
                <div className="empty-state glass-card" style={{ maxWidth: 480, margin: '3rem auto', padding: '3.5rem 2rem' }}>
                    <span className="empty-icon">🗺️</span>
                    <h2 style={{ marginBottom: '0.75rem' }}>No Active Path Yet</h2>
                    <p style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
                        Generate your first AI-powered career pathway to start tracking your progress here.
                    </p>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/')} className="btn btn-primary btn-lg">
                        <Plus size={18} /> Generate My Path
                    </motion.button>
                </div>

                {/* Web Resources still visible without a path */}
                <WebResourcesSection tipIndex={tipIndex} />
            </div>
        );
    }

    const completedSteps = path.steps.filter(s => s.status === 'Completed').length;
    const inProgressSteps = path.steps.filter(s => s.status === 'In Progress').length;
    const totalSteps = path.steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1rem' }}>

            {/* ── HEADER ── */}
            <div className="dash-header">
                <div>
                    <span className="badge badge-brand" style={{ marginBottom: '0.6rem' }}>
                        <Target size={12} /> Active Path
                    </span>
                    <h1 style={{ marginBottom: '0.3rem', fontSize: 'clamp(1.4rem,4vw,2rem)' }}>{path.title}</h1>
                    <p style={{ fontSize: '0.9rem' }}>
                        Target Role: <strong style={{ color: 'var(--brand-300)' }}>{path.target_role}</strong>
                    </p>
                </div>
                {/* Daily tip pill */}
                <div className="dash-tip-pill">
                    <Flame size={14} style={{ color: '#f97316', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Tip: </strong>
                        {webTips[tipIndex].tip}
                    </span>
                </div>
            </div>

            {/* ── STATS ROW ── */}
            <div className="dash-stats-grid">
                {[
                    { icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-bg)', value: completedSteps, label: 'Completed' },
                    { icon: Clock, color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.1)', value: inProgressSteps, label: 'In Progress' },
                    { icon: Circle, color: 'var(--text-muted)', bg: 'var(--glass-bg-strong)', value: totalSteps - completedSteps - inProgressSteps, label: 'Pending' },
                    { icon: Award, color: 'var(--accent-violet)', bg: 'rgba(167,139,250,0.12)', value: totalSteps, label: 'Total Steps' },
                ].map(({ icon: Icon, color, bg, value, label }, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }} className="stat-card">
                        <div className="stat-icon" style={{ background: bg }}>
                            <Icon size={18} color={color} />
                        </div>
                        <div className="stat-value" style={{ color }}>{value}</div>
                        <div className="stat-label">{label}</div>
                    </motion.div>
                ))}
            </div>

            {/* ── PROGRESS + STEPS ── */}
            <div className="glass-card" style={{ padding: 'clamp(1rem,3vw,2rem)', marginBottom: '2rem' }}>

                {/* Progress header */}
                <div className="dash-progress-header">
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem 0' }}>Learning Progress</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>
                            {completedSteps} of {totalSteps} steps completed
                        </p>
                    </div>
                    <ProgressRing progress={progress} size={90} />
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '1.5rem' }}>
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
                                    className="step-row"
                                    style={{
                                        background: step.status === 'Completed' ? 'var(--success-bg)'
                                            : step.status === 'In Progress' ? 'rgba(34,211,238,0.06)'
                                                : 'var(--glass-bg)',
                                        border: `1px solid ${cfg.border}`,
                                    }}
                                >
                                    {/* Step bubble */}
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: step.status === 'Completed' ? 'var(--success)' : 'var(--bg-elevated)',
                                        border: `2px solid ${cfg.color}`,
                                        color: step.status === 'Completed' ? '#fff' : cfg.color,
                                        fontWeight: 700, fontSize: '0.8rem',
                                    }}>
                                        {step.status === 'Completed' ? <CheckCircle size={16} /> : <span>{index + 1}</span>}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="step-content-row">
                                            <div style={{ minWidth: 0 }}>
                                                <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.92rem', color: step.status === 'Completed' ? 'var(--success)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {step.step_name}
                                                </h4>
                                                <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.5 }}>{step.description}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                                                        <Clock size={11} /> {step.duration}
                                                    </span>
                                                    <span className={`badge ${step.status === 'Completed' ? 'badge-success' : step.status === 'In Progress' ? 'badge-brand' : 'badge-neutral'}`}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Buttons */}
                                            <div className="step-actions">
                                                {step.status === 'Pending' && (
                                                    <button onClick={() => updateStepStatus(step._id, 'In Progress')}
                                                        className="btn btn-sm"
                                                        style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(34,211,238,0.3)', whiteSpace: 'nowrap' }}>
                                                        Start
                                                    </button>
                                                )}
                                                {step.status !== 'Completed' && (
                                                    <button onClick={() => updateStepStatus(step._id, 'Completed')}
                                                        className="btn btn-success btn-sm" style={{ whiteSpace: 'nowrap' }}>
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

            {/* ── WEB RESOURCES ── */}
            <WebResourcesSection tipIndex={tipIndex} />
        </motion.div>
    );
};

/* ────────────────────────────────────────────────────────── */
/*  WEB RESOURCES SECTION (sub-component)                   */
/* ────────────────────────────────────────────────────────── */
const WebResourcesSection = ({ tipIndex }: { tipIndex: number }) => (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={18} color="var(--brand-400)" />
            </div>
            <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Web Development Resources</h2>
                <p style={{ margin: 0, fontSize: '0.78rem' }}>Curated links to level up your skills</p>
            </div>
            <span className="badge badge-brand" style={{ marginLeft: 'auto' }}>
                <Star size={11} /> Handpicked
            </span>
        </div>

        {/* Resource cards grid */}
        <div className="resources-grid">
            {webResources.map((cat, i) => (
                <motion.div
                    key={cat.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    className="glass-card resource-card"
                    style={{ padding: '1.25rem' }}
                >
                    {/* Card header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '8px', background: cat.bg, border: `1px solid ${cat.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <cat.icon size={16} color={cat.color} />
                        </div>
                        <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                            {cat.category}
                        </span>
                    </div>

                    {/* Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {cat.links.map((link) => (
                            <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resource-link"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                                    <ExternalLink size={12} style={{ color: cat.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.label}</span>
                                </div>
                                <span className="resource-tag" style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                                    {link.tag}
                                </span>
                            </a>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Pro Tips row */}
        <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TrendingUp size={16} color="var(--accent-emerald)" />
                <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Pro Tips for Web Devs</span>
            </div>
            <div className="tips-grid">
                {webTips.map((t, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        className={`tip-item ${i === tipIndex ? 'tip-item--active' : ''}`}
                    >
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{t.icon}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.tip}</span>
                    </motion.div>
                ))}
            </div>
        </div>

    </motion.div>
);

export default Dashboard;
