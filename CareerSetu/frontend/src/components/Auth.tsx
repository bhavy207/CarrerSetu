import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/token', { username, password });
                login(response.data.access_token, username);
            } else {
                // Signup
                await axios.post('http://127.0.0.1:8000/api/v1/auth/signup', {
                    username,
                    email,
                    password
                });
                // Auto login after signup
                // Auto login after signup
                const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/token', { username, password });
                login(response.data.access_token, username);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
            >
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && <div style={{ background: 'rgba(255, 99, 132, 0.2)', border: '1px solid #ff6384', padding: '10px', borderRadius: '8px', marginBottom: '1rem', color: '#ff6384', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                                <input
                                    type="email"
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                        {!loading && <ArrowRight size={18} />}
                    </motion.button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-accent)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
