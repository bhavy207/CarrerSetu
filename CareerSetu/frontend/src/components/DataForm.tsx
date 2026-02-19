import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Book, Briefcase, Code } from 'lucide-react';

interface DataFormProps {
  onSubmit: (data: any) => void;
}

const DataForm: React.FC<DataFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    academic_info: {
      highest_qualification: 'Graduate',
      background_stream: 'Science',
      performance_level: 'High'
    },
    skills: {
      technical_skills: [] as string[],
      soft_skills: ['Communication', 'Teamwork'],
      digital_literacy: 'Intermediate'
    },
    socio_economic: {
      location: 'Urban',
      access_to_internet: true,
      financial_constraints: false,
      time_availability: 'Full-time'
    },
    learning_preferences: {
      pace: 'Medium',
      language: 'English',
      mode: 'Online'
    },
    career_aspirations: {
      target_role: '',
      preferred_industry: '',
      short_term_goal: 'Get a job',
      long_term_goal: 'Become expert'
    }
  });

  const [techInput, setTechInput] = useState('');

  const handleChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const addSkill = () => {
    if (techInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          technical_skills: [...prev.skills.technical_skills, techInput.trim()]
        }
      }));
      setTechInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{maxWidth: '800px', margin: '0 auto'}}>
        <h2 className="text-gradient" style={{marginBottom: '2rem', fontSize: '1.8rem'}}>Learner Profile Setup</h2>

        <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '2rem'}}>
            <section>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a29bfe'}}>
                    <Book size={20} /> Academic Background
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div>
                        <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block'}}>Qualification</label>
                        <select className="input-field" 
                            style={{appearance: 'none', cursor: 'pointer'}}
                            value={formData.academic_info.highest_qualification}
                            onChange={(e) => handleChange('academic_info', 'highest_qualification', e.target.value)}>
                            <option value="Below 10th">Below 10th</option>
                            <option value="10th Pass">10th Pass</option>
                            <option value="12th Pass">12th Pass</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Graduate">Graduate</option>
                            <option value="Post Graduate">Post Graduate</option>
                        </select>
                    </div>
                    <div>
                        <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block'}}>Stream</label>
                        <input className="input-field" placeholder="e.g. Science" 
                            value={formData.academic_info.background_stream}
                            onChange={(e) => handleChange('academic_info', 'background_stream', e.target.value)} />
                    </div>
                </div>
            </section>

            <section>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fab1a0'}}>
                    <Code size={20} /> Skills Assessment
                </h3>
                <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                    <input className="input-field" placeholder="Add Technical Skill (e.g. Python, Excel)" 
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <button type="button" onClick={addSkill} className="btn-primary" style={{padding: '0 1.5rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none'}}>+</button>
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                    {formData.skills.technical_skills.length === 0 && <span style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem'}}>No skills added yet</span>}
                    {formData.skills.technical_skills.map((skill: string, i: number) => (
                        <span key={i} style={{background: 'rgba(108, 99, 255, 0.3)', border: '1px solid rgba(108, 99, 255, 0.5)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem'}}>{skill}</span>
                    ))}
                </div>
            </section>

            <section>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fdcb6e'}}>
                    <Briefcase size={20} /> Career Aspirations
                </h3>
                <div style={{marginBottom: '1rem'}}>
                     <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block'}}>Target Job Role *</label>
                    <input className="input-field" placeholder="e.g. Frontend Developer" 
                        value={formData.career_aspirations.target_role}
                        onChange={(e) => handleChange('career_aspirations', 'target_role', e.target.value)} required />
                </div>
                <div>
                     <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block'}}>Preferred Industry</label>
                    <input className="input-field" placeholder="e.g. IT Services" 
                        value={formData.career_aspirations.preferred_industry}
                        onChange={(e) => handleChange('career_aspirations', 'preferred_industry', e.target.value)} />
                </div>
            </section>
        </div>

        <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="btn-primary" 
            style={{width: '100%', marginTop: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', fontSize: '1.1rem'}}>
            Generate AI Pathway <ArrowRight size={20} />
        </motion.button>
    </form>
  );
};

export default DataForm;
