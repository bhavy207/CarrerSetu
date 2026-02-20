import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Book, Briefcase, Code, MapPin, Clock, User } from 'lucide-react';

interface DataFormProps {
  onSubmit: (data: any) => void;
}

const STEPS = [
  { label: 'Academic', icon: Book },
  { label: 'Skills', icon: Code },
  { label: 'Career', icon: Briefcase },
];

const PillSelect = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="pill-group">
    {options.map(o => (
      <button
        key={o}
        type="button"
        className={`pill-option ${value === o ? 'selected' : ''}`}
        onClick={() => onChange(o)}
      >
        {o}
      </button>
    ))}
  </div>
);

const Toggle = ({ value, onChange, label, sublabel }: { value: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string }) => (
  <div className="toggle-wrapper" onClick={() => onChange(!value)}>
    <div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
      {sublabel && <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{sublabel}</div>}
    </div>
    <div className={`toggle ${value ? 'on' : ''}`}>
      <div className="toggle-thumb" />
    </div>
  </div>
);

const DataForm: React.FC<DataFormProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    /* ── Personal Info (spec required) ── */
    full_name: '',
    age: '',
    preferred_language: 'English',
    /* ── Existing fields ── */
    academic_info: {
      highest_qualification: 'Graduate',
      background_stream: 'Science',
      performance_level: 'High',
    },
    skills: {
      technical_skills: [] as string[],
      soft_skills: ['Communication', 'Teamwork'],
      digital_literacy: 'Intermediate',
    },
    socio_economic: {
      location: 'Urban',
      access_to_internet: true,
      financial_constraints: false,
      time_availability: 'Full-time',
    },
    learning_preferences: {
      pace: 'Medium',
      language: 'English',
      mode: 'Online',
    },
    career_aspirations: {
      target_role: '',
      preferred_industry: '',
      short_term_goal: 'Get a job',
      long_term_goal: 'Become expert',
    },
  });

  const [techInput, setTechInput] = useState('');

  const set = (section: string, field: string, value: any) =>
    setFormData(prev => ({ ...prev, [section]: { ...(prev as any)[section], [field]: value } }));

  const addSkill = () => {
    if (techInput.trim() && !formData.skills.technical_skills.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: { ...prev.skills, technical_skills: [...prev.skills.technical_skills, techInput.trim()] },
      }));
      setTechInput('');
    }
  };

  const removeSkill = (skill: string) =>
    setFormData(prev => ({ ...prev, skills: { ...prev.skills, technical_skills: prev.skills.technical_skills.filter(s => s !== skill) } }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const canGoNext = () => {
    if (currentStep === 2) return formData.career_aspirations.target_role.trim().length > 0;
    return true;
  };

  /* ── STEP PANELS ── */

  const step1 = (
    <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Personal Info ── */}
      <div style={{ padding: '1.25rem', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--brand-300)' }}>
          <User size={18} /> Personal Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-input" placeholder="e.g. Archi Sharma"
              value={formData.full_name}
              onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Age</label>
            <input className="form-input" type="number" min={10} max={80} placeholder="e.g. 21"
              value={formData.age}
              onChange={e => setFormData(p => ({ ...p, age: e.target.value }))} />
          </div>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.6rem' }}>Preferred Language</label>
          <PillSelect
            options={['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada']}
            value={formData.preferred_language}
            onChange={v => setFormData(p => ({ ...p, preferred_language: v }))}
          />
        </div>
      </div>

      {/* ── Academic Background ── */}
      <div style={{ padding: '1.25rem', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 12 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--brand-300)' }}>
          <Book size={18} /> Academic Background
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Highest Qualification</label>
            <select className="form-input" value={formData.academic_info.highest_qualification}
              onChange={e => set('academic_info', 'highest_qualification', e.target.value)}>
              {['Below 10th', '10th Pass', '12th Pass', 'Diploma', 'Graduate', 'Post Graduate'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Background Stream</label>
            <input className="form-input" placeholder="e.g. Science, Commerce, Arts"
              value={formData.academic_info.background_stream}
              onChange={e => set('academic_info', 'background_stream', e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.6rem' }}>Academic Performance</label>
          <PillSelect options={['Low', 'Medium', 'High']} value={formData.academic_info.performance_level}
            onChange={v => set('academic_info', 'performance_level', v)} />
        </div>
      </div>

      {/* ── Location & Availability ── */}
      <div style={{ padding: '1.25rem', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 12 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--accent-violet)' }}>
          <MapPin size={18} /> Location & Availability
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Location Type</label>
            <PillSelect options={['Urban', 'Semi-Urban', 'Rural']} value={formData.socio_economic.location}
              onChange={v => set('socio_economic', 'location', v)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Time Availability</label>
            <PillSelect options={['Part-time', 'Full-time']} value={formData.socio_economic.time_availability}
              onChange={v => set('socio_economic', 'time_availability', v)} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Toggle label="Internet Access" sublabel="Reliable broadband/mobile" value={formData.socio_economic.access_to_internet}
            onChange={v => set('socio_economic', 'access_to_internet', v)} />
          <Toggle label="Financial Constraints" sublabel="Budget is a factor?" value={formData.socio_economic.financial_constraints}
            onChange={v => set('socio_economic', 'financial_constraints', v)} />
        </div>
      </div>
    </motion.div>
  );

  const step2 = (
    <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ padding: '1.25rem', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 12 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--accent-amber)' }}>
          <Code size={18} /> Technical Skills
        </h3>

        {/* Skill tag input */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            className="form-input"
            placeholder="Type a skill (e.g. Python, Excel, Photoshop) and press Enter"
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={addSkill} className="btn btn-secondary" style={{ flexShrink: 0 }}>
            + Add
          </button>
        </div>

        {/* Skill tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '2rem' }}>
          {formData.skills.technical_skills.length === 0
            ? <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>No skills added yet — add at least one</span>
            : formData.skills.technical_skills.map((skill, i) => (
              <span key={i} className="skill-tag">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, opacity: 0.7, fontSize: '0.9rem' }}
                >×</button>
              </span>
            ))
          }
        </div>
      </div>

      <div style={{ padding: '1.25rem', background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 12 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--accent-cyan)' }}>
          <Clock size={18} /> Learning Preferences
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.6rem' }}>Digital Literacy</label>
            <PillSelect options={['Beginner', 'Intermediate', 'Advanced']} value={formData.skills.digital_literacy}
              onChange={v => set('skills', 'digital_literacy', v)} />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.6rem' }}>Learning Pace</label>
            <PillSelect options={['Slow', 'Medium', 'Fast']} value={formData.learning_preferences.pace}
              onChange={v => set('learning_preferences', 'pace', v)} />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.6rem' }}>Mode</label>
            <PillSelect options={['Online', 'Offline', 'Hybrid']} value={formData.learning_preferences.mode}
              onChange={v => set('learning_preferences', 'mode', v)} />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const step3 = (
    <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 12 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--accent-emerald)' }}>
          <Briefcase size={18} /> Career Aspirations
        </h3>

        <div className="form-group">
          <label className="form-label">
            Target Job Role <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input className="form-input" placeholder="e.g. Frontend Developer, Data Analyst, Graphic Designer"
            value={formData.career_aspirations.target_role}
            onChange={e => set('career_aspirations', 'target_role', e.target.value)}
            required
            style={{ fontSize: '1rem', padding: '0.875rem 1rem' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Preferred Industry</label>
          <input className="form-input" placeholder="e.g. IT Services, Healthcare, Finance, E-commerce"
            value={formData.career_aspirations.preferred_industry}
            onChange={e => set('career_aspirations', 'preferred_industry', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Short-term Goal</label>
            <input className="form-input" placeholder="e.g. Land first job"
              value={formData.career_aspirations.short_term_goal}
              onChange={e => set('career_aspirations', 'short_term_goal', e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Long-term Goal</label>
            <input className="form-input" placeholder="e.g. Become a tech lead"
              value={formData.career_aspirations.long_term_goal}
              onChange={e => set('career_aspirations', 'long_term_goal', e.target.value)} />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const stepContent = [step1, step2, step3];

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Card wrapper */}
      <div className="glass-card" style={{ padding: '2.5rem' }}>

        {/* Step Indicator */}
        <div className="step-indicator">
          {STEPS.map((s, i) => {
            const state = i < currentStep ? 'done' : i === currentStep ? 'active' : '';
            const Icon = s.icon;
            return (
              <div key={i} className={`step-item ${state}`}>
                <div className="step-circle">
                  {i < currentStep
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    : <Icon size={14} />
                  }
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Step Title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <span className="badge badge-brand" style={{ marginBottom: '0.5rem' }}>Step {currentStep + 1} of 3</span>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
            {currentStep === 0 && 'Academic Background & Location'}
            {currentStep === 1 && 'Skills & Learning Style'}
            {currentStep === 2 && 'Career Goals'}
          </h2>
        </div>

        {/* Step content with animation */}
        <AnimatePresence mode="wait">
          {stepContent[currentStep]}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setCurrentStep(s => s - 1)}
            style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
          >
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
            Back
          </button>

          {currentStep < 2 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentStep(s => s + 1)}
              disabled={!canGoNext()}
            >
              Next Step
              <ArrowRight size={16} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={!canGoNext()}
              style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--accent-emerald))', boxShadow: '0 4px 20px rgba(52,211,153,0.3)' }}
            >
              ✦ Generate AI Pathway
              <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </form>
  );
};

export default DataForm;
