import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

/* ── THEME TOGGLE BUTTON ── */
const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
                width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1.15rem', transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-sm)',
            }}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </motion.button>
    );
};

/* ── CAREER ANIMATION SCENE ── */
const CareerScene3D = () => {
    // Cards positioned at true N / E / S / W around the center globe
    const cards = [
        { label: 'Skill Analysis', icon: '📊', color: '#6366f1', top: '0%', left: '50%', tx: '-50%', ty: '-100%' },
        { label: 'Career Match', icon: '🎯', color: '#22d3ee', top: '50%', left: '100%', tx: '0%', ty: '-50%' },
        { label: 'Learning Path', icon: '🗺️', color: '#a78bfa', top: '100%', left: '50%', tx: '-50%', ty: '0%' },
        { label: 'Job Ready', icon: '🚀', color: '#34d399', top: '50%', left: '0%', tx: '-100%', ty: '-50%' },
    ];

    return (
        <div style={{
            position: 'relative',
            width: 380,
            height: 380,
            flexShrink: 0,
        }}>
            {/* ── BACKGROUND GLOW ── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)',
                filter: 'blur(28px)',
                pointerEvents: 'none',
            }} />

            {/* ── STATIC ORBIT RING ── */}
            <div style={{
                position: 'absolute',
                inset: 40,
                borderRadius: '50%',
                border: '1.5px dashed rgba(99,102,241,0.28)',
                pointerEvents: 'none',
            }} />

            {/* ── ROTATING DOTTED RING (subtle, slow) ── */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    inset: 55,
                    borderRadius: '50%',
                    border: '1px dotted rgba(34,211,238,0.2)',
                    pointerEvents: 'none',
                }}
            />

            {/* ── CENTRAL AI GLOBE ── */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
            }}>
                {/* Pulse rings */}
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: 'easeOut' }}
                    style={{
                        position: 'absolute', inset: -18,
                        borderRadius: '50%',
                        border: '2px solid rgba(99,102,241,0.5)',
                        pointerEvents: 'none',
                    }}
                />
                <motion.div
                    animate={{ scale: [1, 1.9, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2.8, delay: 0.5, ease: 'easeOut' }}
                    style={{
                        position: 'absolute', inset: -28,
                        borderRadius: '50%',
                        border: '1.5px solid rgba(99,102,241,0.25)',
                        pointerEvents: 'none',
                    }}
                />

                {/* Globe sphere */}
                <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    style={{
                        width: 96, height: 96, borderRadius: '50%',
                        background: 'radial-gradient(circle at 32% 30%, #8b8ff5 0%, #4f46e5 45%, #1e1270 100%)',
                        boxShadow: '0 0 50px rgba(99,102,241,0.75), 0 0 100px rgba(99,102,241,0.3), inset -12px -12px 24px rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                    }}
                >
                    <span style={{
                        color: 'white', fontSize: '1.6rem', fontWeight: 900,
                        fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em',
                        position: 'relative', zIndex: 1,
                    }}>AI</span>
                    {/* Globe grid lines */}
                    <svg width="96" height="96" viewBox="0 0 96 96" fill="none"
                        style={{ position: 'absolute', inset: 0, opacity: 0.15, borderRadius: '50%' }}>
                        <ellipse cx="48" cy="48" rx="47" ry="17" stroke="white" strokeWidth="0.8" />
                        <ellipse cx="48" cy="48" rx="47" ry="34" stroke="white" strokeWidth="0.5" />
                        <line x1="1" y1="48" x2="95" y2="48" stroke="white" strokeWidth="0.5" />
                        <line x1="48" y1="1" x2="48" y2="95" stroke="white" strokeWidth="0.5" />
                    </svg>
                </motion.div>
            </div>

            {/* ── CONNECTOR LINES (SVG, static) ── */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}
                viewBox="0 0 380 380">
                {/* Top card → center */}
                <motion.line x1="190" y1="55" x2="190" y2="142" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" animate={{ opacity: [0.2, 0.55, 0.2] }} transition={{ repeat: Infinity, duration: 2.5 }} />
                {/* Right card → center */}
                <motion.line x1="325" y1="190" x2="238" y2="190" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 3" animate={{ opacity: [0.2, 0.55, 0.2] }} transition={{ repeat: Infinity, duration: 3, delay: 0.4 }} />
                {/* Bottom card → center */}
                <motion.line x1="190" y1="325" x2="190" y2="238" stroke="#a78bfa" strokeWidth="1" strokeDasharray="4 3" animate={{ opacity: [0.2, 0.55, 0.2] }} transition={{ repeat: Infinity, duration: 2.8, delay: 0.8 }} />
                {/* Left card → center */}
                <motion.line x1="55" y1="190" x2="142" y2="190" stroke="#34d399" strokeWidth="1" strokeDasharray="4 3" animate={{ opacity: [0.2, 0.55, 0.2] }} transition={{ repeat: Infinity, duration: 2.6, delay: 1.2 }} />
            </svg>

            {/* ── DOT ENDPOINTS ON RING ── */}
            {[
                { cx: 190, cy: 55, color: '#6366f1' },
                { cx: 325, cy: 190, color: '#22d3ee' },
                { cx: 190, cy: 325, color: '#a78bfa' },
                { cx: 55, cy: 190, color: '#34d399' },
            ].map((d, i) => (
                <motion.div key={i}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                    style={{
                        position: 'absolute',
                        width: 9, height: 9, borderRadius: '50%',
                        background: d.color,
                        boxShadow: `0 0 10px ${d.color}`,
                        top: d.cy - 4.5, left: d.cx - 4.5,
                        zIndex: 3, pointerEvents: 'none',
                    }}
                />
            ))}

            {/* ── MILESTONE CARDS (top / right / bottom / left) ── */}
            {cards.map((card, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 220, damping: 18 }}
                    style={{
                        position: 'absolute',
                        top: card.top, left: card.left,
                        transform: `translate(${card.tx}, ${card.ty})`,
                        zIndex: 6,
                    }}
                >
                    <motion.div
                        animate={{ y: [0, i % 2 === 0 ? -8 : 8, 0] }}
                        transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: 'easeInOut' }}
                        style={{
                            background: 'var(--glass-bg-strong)',
                            border: `1.5px solid ${card.color}55`,
                            borderRadius: 14,
                            padding: '10px 16px',
                            display: 'flex', alignItems: 'center', gap: 9,
                            boxShadow: `0 0 22px ${card.color}35, 0 4px 18px rgba(0,0,0,0.25)`,
                            backdropFilter: 'blur(16px)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>{card.icon}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: card.color, letterSpacing: '0.01em' }}>
                            {card.label}
                        </span>
                    </motion.div>
                </motion.div>
            ))}

            {/* ── FLOATING PARTICLES ── */}
            {[...Array(8)].map((_, i) => (
                <motion.div key={i}
                    animate={{
                        y: [0, -12, 0],
                        x: [0, (i % 2 === 0 ? 5 : -5), 0],
                        opacity: [0.1, 0.45, 0.1],
                    }}
                    transition={{ repeat: Infinity, duration: 3.5 + (i % 3), delay: i * 0.5, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute',
                        width: i % 3 === 0 ? 4 : 3, height: i % 3 === 0 ? 4 : 3,
                        borderRadius: '50%',
                        background: ['#6366f1', '#22d3ee', '#a78bfa', '#34d399'][i % 4],
                        top: `${15 + (i * 11) % 70}%`,
                        left: `${10 + (i * 12) % 80}%`,
                        pointerEvents: 'none', zIndex: 1,
                    }}
                />
            ))}
        </div>
    );
};


/* ── FEATURES DATA ── */
const features = [
    { icon: '🧭', title: 'AI Career Mapping', desc: 'Personalised roadmap aligned to your goals', color: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
    { icon: '📊', title: 'Skill Gap Analysis', desc: 'Know exactly what to learn next', color: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.22)' },
    { icon: '🎯', title: 'NSQF-Aligned', desc: 'Recognised framework across India', color: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.22)' },
    { icon: '📈', title: 'Progress Tracking', desc: 'Visual dashboard to stay on track', color: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
    { icon: '🌐', title: 'Offline-Friendly', desc: 'Works with limited connectivity', color: 'rgba(34,211,238,0.07)', border: 'rgba(34,211,238,0.20)' },
    { icon: '🚀', title: 'Instant Results', desc: 'Get your pathway in seconds', color: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.22)' },
];

const stats = [
    { value: '50+', label: 'Career Paths' },
    { value: 'AI', label: 'Powered Engine' },
    { value: 'NSQF', label: 'Aligned' },
    { value: '100%', label: 'Personalised' },
];

/* ── LANDING PAGE ── */
const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { theme } = useTheme();

    const handleCTA = () => navigate(isAuthenticated ? '/generate' : '/login');

    return (
        <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

            {/* ── NAVBAR ── */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                height: 'var(--nav-height)', zIndex: 100,
                background: theme === 'dark' ? 'rgba(6,6,20,0.85)' : 'rgba(248,247,255,0.88)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center',
                padding: '0 2.5rem', gap: '1rem',
                transition: 'background 0.4s ease',
            }}>
                {/* Logo */}
                <div onClick={() => navigate('/')}>
                    <Logo size="md" animate />
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ThemeToggle />
                    {isAuthenticated ? (
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/generate')} className="btn btn-primary">Go to App →</motion.button>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} className="btn btn-ghost">Login</button>
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')} className="btn btn-primary">Get Started Free</motion.button>
                        </>
                    )}
                </div>
            </header>

            {/* ── HERO SECTION ── */}
            <section style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>

                    {/* Left: text */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <span className="badge badge-brand" style={{ marginBottom: '1.25rem', display: 'inline-flex', fontSize: '0.8rem', padding: '0.375rem 1rem' }}>
                                ✦ India's AI-Powered Career Navigator
                            </span>
                        </motion.div>

                        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} style={{ marginBottom: '1.25rem', lineHeight: 1.1 }}>
                            Bridge the Gap Between You and Your{' '}
                            <span style={{ background: 'linear-gradient(135deg, var(--brand-400), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dream Career</span>
                        </motion.h1>

                        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.25rem', color: 'var(--text-secondary)' }}>
                            CareerSetu uses AI to create a personalised, step-by-step roadmap based on your background, skills, and goals — completely free.
                        </motion.p>

                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.55)' }} whileTap={{ scale: 0.97 }} onClick={handleCTA} className="btn btn-primary btn-xl" style={{ minWidth: 190 }}>
                                ✦ Generate My Career Path
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.03 }} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-secondary btn-xl">
                                Learn More ↓
                            </motion.button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '3rem' }}>
                            {stats.map((s, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.1 }}>
                                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-400)', letterSpacing: '-0.03em' }}>{s.value}</div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '0.15rem' }}>{s.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right: 3D Animation */}
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CareerScene3D />
                    </motion.div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section style={{ padding: '5rem 2.5rem', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <span className="badge badge-neutral" style={{ marginBottom: '1rem', display: 'inline-flex' }}>How It Works</span>
                    <h2 style={{ marginBottom: '0.75rem' }}>Three Steps to Your Career Path</h2>
                    <p style={{ maxWidth: 460, margin: '0 auto 3rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>No lengthy consultations. No guesswork. Just your profile and our AI.</p>
                </motion.div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
                    {[
                        { step: '01', icon: '📝', title: 'Fill Your Profile', desc: 'Answer a quick 3-step form about your education, skills, and goals.' },
                        { step: '02', icon: '🤖', title: 'AI Analyses You', desc: 'Our engine processes your data and maps it against thousands of career paths.' },
                        { step: '03', icon: '🗺️', title: 'Get Your Roadmap', desc: 'Receive a step-by-step learning roadmap tailored precisely to you.' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(167,139,250,0.1))', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brand-400)', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>STEP {s.step}</div>
                            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: 0, color: 'var(--text-secondary)' }}>{s.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES GRID ── */}
            <section id="features" style={{ padding: '4rem 2.5rem', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <span className="badge badge-brand" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Features</span>
                    <h2 style={{ marginBottom: '0.75rem' }}>Everything You Need to Succeed</h2>
                    <p style={{ maxWidth: 440, margin: '0 auto 3rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Built specifically for Indian learners at every stage.</p>
                </motion.div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
                    {features.map((f, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}
                            style={{ background: f.color, border: `1px solid ${f.border}`, borderRadius: 16, padding: '1.75rem', textAlign: 'left', transition: 'all 0.25s ease' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>{f.icon}</div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.65, margin: 0, color: 'var(--text-secondary)' }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section style={{ padding: '4rem 2.5rem 6rem', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    style={{ maxWidth: 640, margin: '0 auto', background: 'linear-gradient(135deg,rgba(99,102,241,0.15) 0%,rgba(167,139,250,0.10) 100%)', border: '1px solid rgba(99,102,241,0.28)', borderRadius: 24, padding: '3.5rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -50, top: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
                        <h2 style={{ marginBottom: '1rem' }}>Ready to Chart Your Career?</h2>
                        <p style={{ marginBottom: '2rem', fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 380, margin: '0 auto 2rem' }}>Join learners who've discovered their path with CareerSetu. Free. Instant. Personalised.</p>
                        <motion.button whileHover={{ scale: 1.05, boxShadow: '0 10px 36px rgba(99,102,241,0.55)' }} whileTap={{ scale: 0.97 }} onClick={handleCTA} className="btn btn-primary btn-xl" style={{ minWidth: 220 }}>
                            ✦ Start for Free
                        </motion.button>
                    </div>
                </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <Logo size="sm" />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>© 2025 CareerSetu · AI-Powered Career Navigation for India</p>
            </footer>
        </div>
    );
};

export default LandingPage;
