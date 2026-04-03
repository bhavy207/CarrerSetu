import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Save, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

/* ─────────────────────────────────────────────────────── */
/*  Types                                                  */
/* ─────────────────────────────────────────────────────── */
interface ProfileData {
    full_name: string;
    age: string;
    preferred_language: string;
    academic_info: {
        highest_qualification: string;
        background_stream: string;
        institution: string;
        year_of_completion: string;
    };
    career_aspirations: {
        target_role: string;
        preferred_industry: string;
        preferred_location: string;
    };
    skills: {
        technical_skills: string;
        soft_skills: string;
        certifications: string;
    };
}

/* ─────────────────────────────────────────────────────── */
/*  Toast notification                                     */
/* ─────────────────────────────────────────────────────── */
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        style={{
            position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999,
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.75rem 1.25rem', borderRadius: '12px',
            background: type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            color: type === 'success' ? 'var(--success)' : '#f87171',
            fontWeight: 600, fontSize: '0.875rem',
            maxWidth: '340px',
        }}
    >
        {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        {message}
    </motion.div>
);

/* ─────────────────────────────────────────────────────── */
/*  Collapsible Section                                    */
/* ─────────────────────────────────────────────────────── */
const Section = ({ title, icon, children, defaultOpen = true }: {
    title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="glass-card" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-primary)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {icon}
                    </div>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem' }}>{title}</span>
                </div>
                {open ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '0 1.5rem 1.5rem' }}>
                            <hr className="divider" style={{ marginTop: 0, marginBottom: '1.25rem' }} />
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─────────────────────────────────────────────────────── */
/*  Field helpers                                          */
/* ─────────────────────────────────────────────────────── */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label">{label}</label>
        {children}
    </div>
);

const Input = ({ value, onChange, placeholder, type = 'text' }: {
    value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
    <input
        className="form-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
    />
);

const MultiSelect = ({ label, value, onChange, options, placeholder }: { label: string, value: string, onChange: (v: string) => void, options: string[], placeholder: string }) => {
    const items = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val && !items.includes(val)) {
            onChange([...items, val].join(', '));
        }
        e.target.value = "";
    };

    const remove = (item: string) => {
        onChange(items.filter(i => i !== item).join(', '));
    };

    return (
        <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{label}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: items.length > 0 ? '0.5rem' : 0 }}>
                {items.map(i => (
                    <span key={i} style={{ 
                        background: 'rgba(99,102,241,0.15)', color: 'var(--brand-300)', 
                        padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: '0.3rem' 
                    }}>
                        {i}
                        <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>&times;</button>
                    </span>
                ))}
            </div>
            <select className="form-input" onChange={handleSelect} defaultValue="">
                <option value="" disabled>{placeholder}</option>
                {options.map(opt => (
                    <option key={opt} value={opt} disabled={items.includes(opt)}>{opt}</option>
                ))}
            </select>
        </div>
    );
};

/* ─────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                         */
/* ─────────────────────────────────────────────────────── */
const ProfileSettings = () => {
    const { token, username, setProfileComplete, profileData, setProfileData } = useAuth();
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingAccount, setSavingAccount] = useState(false);

    /* ── Profile form state ── */
    const [profile, setProfile] = useState<ProfileData>({
        full_name: '',
        age: '',
        preferred_language: 'English',
        academic_info: { highest_qualification: '', background_stream: '', institution: '', year_of_completion: '' },
        career_aspirations: { target_role: '', preferred_industry: '', preferred_location: '' },
        skills: { technical_skills: '', soft_skills: '', certifications: '' },
    });

    /* ── Account form state ── */
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    /* ── Load existing profile ── */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // First, try to load from context (local cache) - instant display
                if (profileData) {
                    setProfile({
                        full_name: profileData.full_name || '',
                        age: profileData.age ? String(profileData.age) : '',
                        preferred_language: profileData.preferred_language || 'English',
                        academic_info: {
                            highest_qualification: profileData.academic_info?.highest_qualification || '',
                            background_stream: profileData.academic_info?.background_stream || '',
                            institution: profileData.academic_info?.institution || '',
                            year_of_completion: profileData.academic_info?.year_of_completion ? String(profileData.academic_info.year_of_completion) : '',
                        },
                        career_aspirations: {
                            target_role: profileData.career_aspirations?.target_role || '',
                            preferred_industry: profileData.career_aspirations?.preferred_industry || '',
                            preferred_location: profileData.career_aspirations?.preferred_location || '',
                        },
                        skills: {
                            technical_skills: (profileData.skills?.technical_skills || []).join(', '),
                            soft_skills: (profileData.skills?.soft_skills || []).join(', '),
                            certifications: (profileData.skills?.certifications || []).join(', '),
                        },
                    });
                    setLoadingProfile(false);
                    return; // Use cached data, don't fetch from backend
                }

                // If no cache, fetch from backend
                const res = await axios.get('http://127.0.0.1:8000/api/v1/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const d = res.data;
                const loadedProfile = {
                    full_name: d.full_name || '',
                    age: d.age ? String(d.age) : '',
                    preferred_language: d.preferred_language || 'English',
                    academic_info: {
                        highest_qualification: d.academic_info?.highest_qualification || '',
                        background_stream: d.academic_info?.background_stream || '',
                        institution: d.academic_info?.institution || '',
                        year_of_completion: d.academic_info?.year_of_completion ? String(d.academic_info.year_of_completion) : '',
                    },
                    career_aspirations: {
                        target_role: d.career_aspirations?.target_role || '',
                        preferred_industry: d.career_aspirations?.preferred_industry || '',
                        preferred_location: d.career_aspirations?.preferred_location || '',
                    },
                    skills: {
                        technical_skills: (d.skills?.technical_skills || []).join(', '),
                        soft_skills: (d.skills?.soft_skills || []).join(', '),
                        certifications: (d.skills?.certifications || []).join(', '),
                    },
                };
                setProfile(loadedProfile);

                // Update context with fresh data from MongoDB
                setProfileData({
                    _id: d._id,
                    full_name: d.full_name,
                    age: d.age,
                    preferred_language: d.preferred_language,
                    academic_info: d.academic_info,
                    career_aspirations: d.career_aspirations,
                    skills: d.skills,
                });

                // Also load email
                const meRes = await axios.get('http://127.0.0.1:8000/api/v1/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setNewEmail(meRes.data.email || '');
            } catch {
                // Profile may not exist yet — that's fine
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [token, profileData, setProfileData]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    /* ── Save profile ── */
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields with clearer messages
        const missingFields: string[] = [];
        if (!profile.academic_info.highest_qualification?.trim()) {
            missingFields.push('Highest Qualification');
        }
        if (!profile.career_aspirations.target_role?.trim()) {
            missingFields.push('Target Role');
        }
        
        if (missingFields.length > 0) {
            showToast(`Required: ${missingFields.join(', ')}`, 'error');
            return;
        }
        
        setSavingProfile(true);
        try {
            const payload = {
                full_name: profile.full_name || 'Not provided',
                age: profile.age ? Number(profile.age) : null,
                preferred_language: profile.preferred_language,
                academic_info: {
                    ...profile.academic_info,
                    year_of_completion: profile.academic_info.year_of_completion
                        ? Number(profile.academic_info.year_of_completion) : undefined,
                },
                career_aspirations: profile.career_aspirations,
                skills: {
                    technical_skills: profile.skills.technical_skills
                        .split(',').map(s => s.trim()).filter(Boolean),
                    soft_skills: profile.skills.soft_skills
                        .split(',').map(s => s.trim()).filter(Boolean),
                    certifications: profile.skills.certifications
                        .split(',').map(s => s.trim()).filter(Boolean),
                },
            };
            const response = await axios.post('http://127.0.0.1:8000/api/v1/profile', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Save to context for persistence
            setProfileData({
                _id: response.data._id,
                full_name: response.data.full_name,
                age: response.data.age,
                preferred_language: response.data.preferred_language,
                academic_info: response.data.academic_info,
                career_aspirations: response.data.career_aspirations,
                skills: response.data.skills,
            });

            setProfileComplete(true);
            showToast('Profile saved successfully!', 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Error saving profile.', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    /* ── Save account ── */
    const handleSaveAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            showToast('New passwords do not match.', 'error');
            return;
        }
        if (newPassword && newPassword.length < 6) {
            showToast('New password must be at least 6 characters.', 'error');
            return;
        }
        setSavingAccount(true);
        try {
            const payload: any = {};
            if (newEmail) payload.email = newEmail;
            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }
            if (Object.keys(payload).length === 0) {
                showToast('Nothing to update.', 'error');
                setSavingAccount(false);
                return;
            }
            await axios.put('http://127.0.0.1:8000/api/v1/auth/me', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showToast('Account updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Error updating account.', 'error');
        } finally {
            setSavingAccount(false);
        }
    };

    const setAcademic = (key: keyof ProfileData['academic_info'], val: string) =>
        setProfile(p => ({ ...p, academic_info: { ...p.academic_info, [key]: val } }));
    const setCareer = (key: keyof ProfileData['career_aspirations'], val: string) =>
        setProfile(p => ({ ...p, career_aspirations: { ...p.career_aspirations, [key]: val } }));
    const setSkills = (key: keyof ProfileData['skills'], val: string) =>
        setProfile(p => ({ ...p, skills: { ...p.skills, [key]: val } }));

    if (loadingProfile) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem' }}>
                <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-600), var(--accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <User size={24} color="white" />
                </motion.div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading your settings…</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '720px', margin: '0 auto' }}
        >
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <span className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>
                    <User size={12} /> Profile Settings
                </span>
                <h1 style={{ marginBottom: '0.4rem', fontSize: 'clamp(1.4rem,4vw,2rem)' }}>
                    My Profile & Account
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Update your learning profile and account credentials. Logged in as{' '}
                    <strong style={{ color: 'var(--brand-300)' }}>@{username}</strong>
                </p>
            </div>

            {/* ── PROFILE INFO SECTION ── */}
            <form onSubmit={handleSaveProfile}>
                <Section title="Personal Information" icon={<User size={16} color="var(--brand-400)" />}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Full Name">
                            <Input value={profile.full_name} onChange={v => setProfile(p => ({ ...p, full_name: v }))}
                                placeholder="e.g. Rahul Sharma" />
                        </Field>
                        <Field label="Age">
                            <Input type="number" value={profile.age} onChange={v => setProfile(p => ({ ...p, age: v }))}
                                placeholder="e.g. 22" />
                        </Field>
                        <Field label="Preferred Language">
                            <select className="form-input" value={profile.preferred_language}
                                onChange={e => setProfile(p => ({ ...p, preferred_language: e.target.value }))}>
                                {['English', 'Hindi', 'Gujarati', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Kannada'].map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </Section>

                <Section title="Academic Information" icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="2" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                }>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Highest Qualification *">
                            <select className="form-input" value={profile.academic_info.highest_qualification}
                                onChange={e => setAcademic('highest_qualification', e.target.value)}>
                                <option value="">Select qualification</option>
                                {['10th Pass', '12th Pass', 'Diploma', 'Graduate (B.Sc/B.A/B.Com)', "Graduate (B.Tech/B.E.)", 'Post Graduate (M.Tech/MBA)', 'PhD', 'Other'].map(q => (
                                    <option key={q} value={q}>{q}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Stream / Branch">
                            <Input value={profile.academic_info.background_stream}
                                onChange={v => setAcademic('background_stream', v)}
                                placeholder="e.g. Computer Science" />
                        </Field>
                        <Field label="Institution">
                            <Input value={profile.academic_info.institution}
                                onChange={v => setAcademic('institution', v)}
                                placeholder="e.g. GTU" />
                        </Field>
                        <Field label="Year of Completion">
                            <Input type="number" value={profile.academic_info.year_of_completion}
                                onChange={v => setAcademic('year_of_completion', v)}
                                placeholder="e.g. 2024" />
                        </Field>
                    </div>
                </Section>

                <Section title="Career Aspirations" icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
                }>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Target Role *">
                            <select className="form-input" value={profile.career_aspirations.target_role}
                                onChange={e => setCareer('target_role', e.target.value)}>
                                <option value="">Select target role</option>
                                {['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'Data Scientist', 'UI/UX Designer', 'Product Manager', 'DevOps Engineer', 'Mobile Developer', 'Cyber Security Analyst', 'Other'].map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Preferred Industry">
                            <select className="form-input" value={profile.career_aspirations.preferred_industry}
                                onChange={e => setCareer('preferred_industry', e.target.value)}>
                                <option value="">Select preferred industry</option>
                                {['Information Technology', 'FinTech', 'EdTech', 'HealthTech', 'E-commerce', 'Gaming', 'Consulting', 'Automobile', 'Aerospace', 'Other'].map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Preferred Location">
                            <select className="form-input" value={profile.career_aspirations.preferred_location}
                                onChange={e => setCareer('preferred_location', e.target.value)}>
                                <option value="">Select preferred location</option>
                                {['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai', 'Remote', 'Hybrid', 'Other'].map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </Section>

                <Section title="Skills & Certifications" icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                }>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Add skills by selecting them from the dropdown. Minimum 1 requires for full profile completion.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <MultiSelect 
                            label="Technical Skills"
                            value={profile.skills.technical_skills}
                            onChange={v => setSkills('technical_skills', v)}
                            placeholder="Select technical skills..."
                            options={['React', 'Node.js', 'Python', 'SQL', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'Figma', 'Git']}
                        />
                        <MultiSelect 
                            label="Soft Skills"
                            value={profile.skills.soft_skills}
                            onChange={v => setSkills('soft_skills', v)}
                            placeholder="Select soft skills..."
                            options={['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management', 'Adaptability', 'Critical Thinking', 'Work Ethic', 'Interpersonal Skills']}
                        />
                        <MultiSelect 
                            label="Certifications"
                            value={profile.skills.certifications}
                            onChange={v => setSkills('certifications', v)}
                            placeholder="Select certifications..."
                            options={['AWS Certified Cloud Practitioner', 'Google Data Analytics', 'Meta Front-End Developer', 'IBM Data Science', 'Cisco CCNA', 'Microsoft Certified: Azure Fundamentals', 'PMP', 'Scrum Master']}
                        />
                    </div>
                </Section>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="btn btn-primary btn-lg btn-full"
                    disabled={savingProfile}
                    style={{ marginBottom: '2rem' }}
                >
                    {savingProfile ? (
                        <>
                            <svg width="16" height="16" style={{ animation: 'spin-smooth 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3" /><path d="M21 12a9 9 0 01-9 9" /></svg>
                            Saving Profile…
                        </>
                    ) : (
                        <><Save size={16} /> Save Profile</>
                    )}
                </motion.button>
            </form>

            {/* ── ACCOUNT SECURITY SECTION ── */}
            <form onSubmit={handleSaveAccount}>
                <Section title="Email Address" icon={<Mail size={16} color="var(--brand-400)" />} defaultOpen={false}>
                    <Field label="Email Address">
                        <Input type="email" value={newEmail} onChange={setNewEmail}
                            placeholder="you@example.com" />
                    </Field>
                </Section>

                <Section title="Change Password" icon={<Lock size={16} color="var(--brand-400)" />} defaultOpen={false}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Field label="Current Password">
                            <Input type="password" value={currentPassword} onChange={setCurrentPassword}
                                placeholder="Enter your current password" />
                        </Field>
                        <Field label="New Password">
                            <Input type="password" value={newPassword} onChange={setNewPassword}
                                placeholder="At least 6 characters" />
                        </Field>
                        <Field label="Confirm New Password">
                            <Input type="password" value={confirmPassword} onChange={setConfirmPassword}
                                placeholder="Repeat new password" />
                        </Field>
                    </div>
                </Section>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="btn btn-xl btn-full"
                    disabled={savingAccount}
                    style={{
                        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                    }}
                >
                    {savingAccount ? (
                        <>
                            <svg width="16" height="16" style={{ animation: 'spin-smooth 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3" /><path d="M21 12a9 9 0 01-9 9" /></svg>
                            Updating Account…
                        </>
                    ) : (
                        <><Save size={16} /> Update Account</>
                    )}
                </motion.button>
            </form>

            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} />}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProfileSettings;
