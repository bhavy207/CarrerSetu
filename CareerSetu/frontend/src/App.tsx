import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DataForm from './components/DataForm';
import ResultsView from './components/ResultsView';
import Dashboard from './components/Dashboard';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}
      >
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1 className="text-gradient" style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', fontWeight: 800 }}>Career Setu</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            AI-Powered Intelligent Career Navigator & Personalized Pathway Engine
          </p>
        </div>
        <div style={{ position: 'absolute', top: '20px', right: '0', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </motion.header>
      {children}
    </div>
  );
};

const Generator = () => {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [pathwayData, setPathwayData] = useState<any>(null);

  const handleFormSubmit = async (formData: any) => {
    setStep('loading');
    try {
      // Use axios to post to backend
      const response = await axios.post('http://127.0.0.1:8000/api/v1/learner/profile', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPathwayData(response.data);
      setStep('result');
    } catch (err) {
      console.error(err);
      alert("Error fetching pathway. Please make sure the backend is running.");
      setStep('form');
    }
  };

  return (
    <AnimatePresence mode='wait'>
      {step === 'form' && (
        <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <DataForm onSubmit={handleFormSubmit} />
        </motion.div>
      )}

      {step === 'loading' && (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Loader size={48} color="var(--primary)" />
          </motion.div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Analysing Profile & Generating Pathway...</p>
        </motion.div>
      )}

      {step === 'result' && pathwayData && (
        <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
          <ResultsView data={pathwayData} onReset={() => setStep('form')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Auth />;
  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <Generator />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
