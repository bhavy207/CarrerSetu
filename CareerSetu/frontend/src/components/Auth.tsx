import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/token', { username, password });
                login(response.data.access_token, username);
            } else {
                await axios.post('http://127.0.0.1:8000/api/v1/auth/signup', { username, email, password });
                const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/token', { username, password });
                login(response.data.access_token, username);
            }
            navigate('/generate');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)',
            overflow: 'hidden',
        }}>

            {/* ── LEFT 3D ANIMATION PANEL ── */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    background: 'linear-gradient(160deg, #0d0b2e 0%, #080820 50%, #060618 100%)',
                    borderRight: '1px solid rgba(99,102,241,0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '2rem',
                }}
            >
                {/* Animated grid background */}
                <motion.div
                    animate={{ opacity: [0.03, 0.07, 0.03] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: `
                            linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
                    }}
                />

                {/* Floating particles */}
                {[...Array(14)].map((_, i) => (
                    <motion.div key={i}
                        animate={{
                            y: [0, -18, 0],
                            x: [0, (i % 3 - 1) * 8, 0],
                            opacity: [0.15, 0.55, 0.15],
                        }}
                        transition={{ repeat: Infinity, duration: 3 + (i % 4), delay: i * 0.35, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute',
                            width: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
                            height: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
                            borderRadius: '50%',
                            background: i % 2 === 0 ? '#6366f1' : '#22d3ee',
                            top: `${10 + (i * 6.5) % 80}%`,
                            left: `${5 + (i * 7.3) % 90}%`,
                            pointerEvents: 'none',
                        }}
                    />
                ))}

                {/* Main 3D Scene */}
                <div style={{ position: 'relative', width: 280, height: 280 }}>

                    {/* Outer orbit ring - SVG */}
                    <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                        viewBox="0 0 280 280"
                    >
                        <ellipse cx="140" cy="140" rx="130" ry="46"
                            fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" strokeDasharray="6 5" />
                    </motion.svg>

                    {/* Inner orbit ring - SVG (counter-rotate) */}
                    <motion.svg
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                        viewBox="0 0 280 280"
                    >
                        <ellipse cx="140" cy="140" rx="90" ry="32"
                            fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                    </motion.svg>

                    {/* ── CENTRAL COMPASS GLOBE ── */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        {/* Outer glow ring */}
                        <motion.div
                            animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.7, 0.3] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                            style={{
                                position: 'absolute', inset: -18,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
                                pointerEvents: 'none',
                            }}
                        />
                        {/* Globe sphere */}
                        <motion.div
                            animate={{ rotateY: 360 }}
                            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                            style={{
                                width: 88, height: 88, borderRadius: '50%',
                                background: 'radial-gradient(circle at 35% 35%, #7c7fe8 0%, #4f46e5 45%, #2d1b8c 100%)',
                                boxShadow: '0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(99,102,241,0.2), inset -12px -12px 24px rgba(0,0,0,0.5)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            {/* Compass needle SVG */}
                            <motion.svg
                                animate={{ rotate: [0, 15, -10, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                                width="44" height="44" viewBox="0 0 44 44" fill="none"
                                style={{ position: 'absolute' }}
                            >
                                <circle cx="22" cy="22" r="21" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                                <circle cx="22" cy="22" r="14" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                                <polygon points="22,4 26,22 22,19 18,22" fill="white" opacity="0.95" />
                                <polygon points="22,40 26,22 22,25 18,22" fill="rgba(255,255,255,0.35)" />
                                <circle cx="22" cy="22" r="3" fill="white" opacity="0.9" />
                            </motion.svg>
                            {/* Globe latitude lines */}
                            <svg width="88" height="88" viewBox="0 0 88 88" fill="none" style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                                <ellipse cx="44" cy="44" rx="43" ry="15" stroke="white" strokeWidth="0.8" />
                                <ellipse cx="44" cy="44" rx="43" ry="30" stroke="white" strokeWidth="0.5" />
                                <line x1="1" y1="44" x2="87" y2="44" stroke="white" strokeWidth="0.5" />
                                <line x1="44" y1="1" x2="44" y2="87" stroke="white" strokeWidth="0.5" />
                            </svg>
                        </motion.div>
                    </div>

                    {/* ── ORBITING MILESTONE CARDS ── */}
                    {[
                        { label: 'AI Analysis', icon: '🤖', color: '#6366f1', angle: 0, orbitR: 128 },
                        { label: 'Career Path', icon: '🗺️', color: '#22d3ee', angle: 90, orbitR: 128 },
                        { label: 'Skill Gap', icon: '📊', color: '#a78bfa', angle: 180, orbitR: 128 },
                        { label: 'Track Progress', icon: '📈', color: '#34d399', angle: 270, orbitR: 128 },
                    ].map((node, i) => (
                        <motion.div
                            key={i}
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 22, ease: 'linear', delay: -(node.angle / 360) * 22 }}
                            style={{
                                position: 'absolute', top: '50%', left: '50%',
                                width: node.orbitR * 2, height: node.orbitR * 2,
                                marginTop: -node.orbitR, marginLeft: -node.orbitR,
                                transformOrigin: 'center center',
                            }}
                        >
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ repeat: Infinity, duration: 22, ease: 'linear', delay: -(node.angle / 360) * 22 }}
                                style={{
                                    position: 'absolute',
                                    top: 0, left: '50%',
                                    transform: 'translateX(-50%) translateY(-50%)',
                                }}
                            >
                                <motion.div
                                    animate={{ y: [0, -5, 0], scale: [1, 1.06, 1] }}
                                    transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: 'easeInOut' }}
                                    style={{
                                        background: 'rgba(10,10,30,0.85)',
                                        border: `1px solid ${node.color}55`,
                                        borderRadius: 12,
                                        padding: '6px 11px',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        boxShadow: `0 0 18px ${node.color}33, 0 4px 12px rgba(0,0,0,0.5)`,
                                        backdropFilter: 'blur(12px)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <span style={{ fontSize: '0.95rem' }}>{node.icon}</span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: node.color, letterSpacing: '0.03em' }}>{node.label}</span>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    ))}

                    {/* Connection dots on orbit */}
                    {[0, 1, 2].map(i => (
                        <motion.div key={i}
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 14 + i * 4, ease: 'linear' }}
                            style={{
                                position: 'absolute', top: '50%', left: '50%',
                                width: 260, height: 260,
                                marginTop: -130, marginLeft: -130,
                                transformOrigin: 'center',
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 0, left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 6, height: 6, borderRadius: '50%',
                                background: i === 0 ? '#6366f1' : i === 1 ? '#22d3ee' : '#a78bfa',
                                boxShadow: `0 0 8px ${i === 0 ? '#6366f1' : i === 1 ? '#22d3ee' : '#a78bfa'}`,
                            }} />
                        </motion.div>
                    ))}
                </div>

                {/* Label below */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    style={{ marginTop: '2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}
                >
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                        fontSize: 'clamp(1.2rem,2.5vw,1.7rem)',
                        background: 'linear-gradient(135deg, #fff 30%, var(--brand-300))',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem',
                    }}>
                        Navigate Your Career
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', maxWidth: 240, lineHeight: 1.6 }}>
                        AI-powered pathways tailored to your goals, skills &amp; ambitions
                    </p>
                </motion.div>

                {/* Footer */}
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.15)', position: 'absolute', bottom: '1.25rem', zIndex: 1 }}>
                    © 2025 CareerSetu · AI-Powered Career Navigation
                </p>
            </motion.div>

            {/* ── RIGHT AUTH PANEL ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: 'var(--bg-canvas)',
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    style={{ width: '100%', maxWidth: 420 }}
                >
                    {/* Tab switcher */}
                    <div style={{
                        display: 'flex',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 12,
                        padding: 4,
                        marginBottom: '2rem',
                    }}>
                        {['Login', 'Sign Up'].map((tab, i) => {
                            const active = (i === 0) === isLogin;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => { setIsLogin(i === 0); setError(''); }}
                                    style={{
                                        flex: 1, padding: '0.625rem',
                                        borderRadius: 9, border: 'none', cursor: 'pointer',
                                        fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                                        transition: 'all 0.25s ease',
                                        background: active ? 'linear-gradient(135deg, var(--brand-600), var(--brand-500))' : 'transparent',
                                        color: active ? '#fff' : 'var(--text-secondary)',
                                        boxShadow: active ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
                                    }}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>

                    {/* Heading */}
                    <div style={{ marginBottom: '1.75rem' }}>
                        <h2 style={{ marginBottom: '0.4rem', fontSize: '1.75rem' }}>
                            {isLogin ? 'Welcome back' : 'Create account'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {isLogin ? 'Sign in to access your career pathway' : 'Start your AI-guided career journey today'}
                        </p>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="alert-error"
                                style={{ marginBottom: '1.25rem' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Username */}
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Username</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </span>
                                <input className="form-input" type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required />
                            </div>
                        </div>

                        {/* Email (signup only) */}
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Email Address</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                            </span>
                                            <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Password */}
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Password</label>
                            <div className="input-wrapper" style={{ position: 'relative' }}>
                                <span className="input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                                </span>
                                <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" style={{ paddingRight: '2.75rem' }} value={password} onChange={e => setPassword(e.target.value)} required />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                                        display: 'flex', alignItems: 'center', padding: 0,
                                    }}
                                >
                                    {showPassword
                                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            className="btn btn-primary btn-xl btn-full"
                            style={{ marginTop: '0.5rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg width="16" height="16" style={{ animation: 'spin-smooth 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3" /><path d="M21 12a9 9 0 01-9 9" /></svg>
                                    Processing…
                                </>
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Switch mode */}
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--brand-400)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', padding: 0, textDecoration: 'underline', textUnderlineOffset: '3px' }}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Auth;
