import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DataForm from './components/DataForm';
import ResultsView from './components/ResultsView';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Auth from './components/Auth';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

/* =============================================
   THEME TOGGLE — shared button component
   ============================================= */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        width: 38, height: 38, borderRadius: '50%',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: '1.05rem',
        transition: 'all 0.3s ease',
        flexShrink: 0,
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </motion.button>
  );
};

/* =============================================
   NAVBAR (shown on protected pages only)
   ============================================= */
const Navbar = () => {
  const { logout, username } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = username ? username.slice(0, 2).toUpperCase() : 'CS';

  return (
    <header
      className="navbar"
      style={{
        background: theme === 'dark'
          ? 'rgba(6,6,20,0.85)'
          : 'rgba(248,247,255,0.90)',
        transition: 'background 0.4s ease',
      } as React.CSSProperties}
    >
      {/* Brand */}
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <div className="navbar-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="white" stroke="white" />
          </svg>
        </div>
        <span className="navbar-wordmark">CareerSetu</span>
      </div>

      {/* Nav Links */}
      <nav className="navbar-nav">
        <button
          className={`nav-link ${location.pathname === '/generate' ? 'active' : ''}`}
          onClick={() => navigate('/generate')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Generate Path
        </button>
        <button
          className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </button>
      </nav>

      {/* Right: theme toggle + user chip + logout */}
      <div className="navbar-actions">
        <ThemeToggle />
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <span className="user-name">{username || 'User'}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout} title="Logout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
};

/* =============================================
   MAIN LAYOUT (protected pages wrapper)
   ============================================= */
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: '100vh' }}>
    <Navbar />
    <main style={{ paddingTop: 'var(--nav-height)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {children}
      </div>
    </main>
  </div>
);

/* =============================================
   LOADING SCREEN
   ============================================= */
const LoadingScreen = () => (
  <motion.div
    key="loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: '2rem', textAlign: 'center',
    }}
  >
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--brand-600), var(--accent-violet))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 50px rgba(99,102,241,0.5)',
      }}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="white" stroke="white" />
      </svg>
    </motion.div>
    <div>
      <h3 style={{ marginBottom: '0.5rem' }}>Analysing Your Profile</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Our AI is crafting your personalised career pathway…</p>
    </div>
    <div style={{ width: '260px' }}>
      <div className="loading-bar"><div className="loading-bar-fill" style={{ width: '100%' }} /></div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>This may take a few seconds</p>
    </div>
    <div style={{ display: 'flex', gap: '0.4rem' }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay, ease: 'easeInOut' }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-500)' }} />
      ))}
    </div>
  </motion.div>
);

/* =============================================
   GENERATOR PAGE
   ============================================= */
const GeneratePage = () => {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [pathwayData, setPathwayData] = useState<any>(null);

  const handleFormSubmit = async (formData: any) => {
    setStep('loading');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/learner/profile', formData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setPathwayData(response.data);
      setStep('result');
    } catch (err) {
      console.error(err);
      alert('Error fetching pathway. Please make sure the backend is running.');
      setStep('form');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'form' && (
        <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-brand" style={{ marginBottom: '1rem' }}>✦ AI-Powered Career Intelligence</span>
            <h1 className="gradient-text" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>Your Career, Your Path</h1>
            <p style={{ maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
              Answer a few questions and our AI will generate a personalised roadmap from where you are to where you want to be.
            </p>
          </div>
          <DataForm onSubmit={handleFormSubmit} />
        </motion.div>
      )}
      {step === 'loading' && <LoadingScreen />}
      {step === 'result' && pathwayData && (
        <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <ResultsView data={pathwayData} onReset={() => setStep('form')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* =============================================
   PROTECTED ROUTE
   ============================================= */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>🔐</div>
        <h2>Login Required</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please log in to access this page.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }
  return <>{children}</>;
};

/* =============================================
   APP ROOT
   ============================================= */
const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />

          {/* Protected routes */}
          <Route path="/generate" element={
            <ProtectedRoute>
              <AppLayout><GeneratePage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
