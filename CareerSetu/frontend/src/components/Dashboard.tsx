import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    CheckCircle, Circle, Clock, Target, Award, BarChart2, Plus,
    BookOpen, Flame, TrendingUp, Star, User, Zap, X,
    ChevronRight, Layers, Brain, GraduationCap, MapPin, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://127.0.0.1:8000/api/v1';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

/* ── Types ── */
interface Step { _id: string; step_name: string; description: string; duration: string; status: 'Pending' | 'In Progress' | 'Completed'; completedAt?: string; }
interface Path { _id: string; title: string; target_role: string; steps: Step[]; isActive: boolean; }
interface Profile { full_name: string; age: number; preferred_language: string; nsqf_level: number; academic_info: { highest_qualification: string; background_stream: string; institution: string; }; career_aspirations: { target_role: string; preferred_industry: string; preferred_location: string; }; skills: { technical_skills: string[]; soft_skills: string[]; certifications: string[]; }; }
interface Course { course_id: string; course_name: string; sector: string; skills_covered: string[]; nsqf_level: number; duration: string; job_role: string; similarity_score?: number; match_quality?: string; rank?: number; }

/* ── NSQF config ── */
const NSQF_LEVELS = [
    { level: 1, label: 'Entry', color: '#94a3b8', desc: 'Basic awareness' },
    { level: 2, label: 'Foundation', color: '#34d399', desc: 'Semi-skilled' },
    { level: 3, label: 'Skilled', color: '#22d3ee', desc: 'Operational skills' },
    { level: 4, label: 'Proficient', color: '#6366f1', desc: 'Independent work' },
    { level: 5, label: 'Advanced', color: '#a78bfa', desc: 'Complex tasks' },
    { level: 6, label: 'Expert', color: '#f59e0b', desc: 'Supervisory role' },
    { level: 7, label: 'Specialist', color: '#fb7185', desc: 'Strategic role' },
    { level: 8, label: 'Master', color: '#ec4899', desc: 'Research & design' },
];

/* ── Progress Ring ── */
const ProgressRing = ({ progress, size = 90 }: { progress: number; size?: number }) => {
    const r = (size - 14) / 2, circ = 2 * Math.PI * r, offset = circ - (progress / 100) * circ;
    return (
        <div style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#rg)" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
                <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a78bfa" /></linearGradient></defs>
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.15rem', lineHeight: 1, color: 'var(--brand-300)' }}>{progress}%</div>
                <div style={{ fontSize: '0.58rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Done</div>
            </div>
        </div>
    );
};

/* ── Course Detail Modal ── */
const CourseModal = ({ course, onClose }: { course: Course; onClose: () => void }) => {
    const qColor = course.match_quality === 'High' ? 'var(--success)' : course.match_quality === 'Medium' ? 'var(--warning)' : 'var(--text-muted)';
    const nsqfCfg = NSQF_LEVELS.find(n => n.level === course.nsqf_level) || NSQF_LEVELS[0];
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={onClose}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '2rem', maxWidth: 520, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                            <span className="badge badge-brand">{course.sector}</span>
                            {course.match_quality && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: `${qColor}18`, color: qColor, border: `1px solid ${qColor}40` }}><Star size={11} />{course.match_quality} Match</span>}
                        </div>
                        <h3 style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>{course.course_name}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID: {course.course_id}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', lineHeight: 0 }}><X size={16} /></button>
                </div>
                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {[
                        { icon: <Briefcase size={14} />, label: 'Job Role', value: course.job_role },
                        { icon: <Clock size={14} />, label: 'Duration', value: course.duration },
                        { icon: <GraduationCap size={14} />, label: 'NSQF Level', value: `Level ${course.nsqf_level} — ${nsqfCfg.label}` },
                        { icon: <Layers size={14} />, label: 'Sector', value: course.sector },
                    ].map(({ icon, label, value }) => (
                        <div key={label} style={{ background: 'var(--glass-bg)', borderRadius: '10px', padding: '0.75rem', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{icon}{label}</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
                        </div>
                    ))}
                </div>
                {/* NSQF bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>NSQF Level Progress</div>
                    <div style={{ display: 'flex', gap: '3px' }}>
                        {NSQF_LEVELS.slice(0, 8).map(n => (
                            <motion.div key={n.level} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: n.level * 0.04 }}
                                title={`Level ${n.level}: ${n.label}`}
                                style={{ flex: 1, height: 8, borderRadius: '3px', background: n.level <= course.nsqf_level ? n.color : 'rgba(255,255,255,0.06)', transition: 'all 0.3s' }} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        <span>Entry (1)</span><span>Master (8)</span>
                    </div>
                </div>
                {/* Skills */}
                {course.skills_covered?.length > 0 && (
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Skills Covered</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {course.skills_covered.map(s => <span key={s} className="skill-tag" style={{ fontSize: '0.75rem' }}>{s}</span>)}
                        </div>
                    </div>
                )}
                {course.similarity_score !== undefined && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Match Score</span>
                        <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, color: 'var(--brand-300)' }}>{Math.round(course.similarity_score * 100)}%</span>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

/* ── Profile Summary Card ── */
const ProfileCard = ({ profile, username }: { profile: Profile; username: string | null }) => {
    const navigate = useNavigate();
    const initials = (profile.full_name || username || 'U').slice(0, 2).toUpperCase();
    const allSkills = [...(profile.skills?.technical_skills || []), ...(profile.skills?.soft_skills || [])];
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-600), var(--accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>{initials}</div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{profile.full_name || username || 'Learner'}</h3>
                        <span className="badge badge-brand"><GraduationCap size={11} /> NSQF Level {profile.nsqf_level || 1}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {profile.career_aspirations?.target_role && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Target size={12} />{profile.career_aspirations.target_role}</span>}
                        {profile.career_aspirations?.preferred_location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} />{profile.career_aspirations.preferred_location}</span>}
                        {profile.academic_info?.highest_qualification && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><BookOpen size={12} />{profile.academic_info.highest_qualification}</span>}
                    </div>
                    {allSkills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {allSkills.slice(0, 6).map(s => <span key={s} className="skill-tag" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>{s}</span>)}
                            {allSkills.length > 6 && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>+{allSkills.length - 6} more</span>}
                        </div>
                    )}
                </div>
                {/* Edit button */}
                <button onClick={() => navigate('/profile-settings')} className="btn btn-sm btn-secondary" style={{ flexShrink: 0 }}><User size={13} /> Edit Profile</button>
            </div>
        </motion.div>
    );
};

/* ── NSQF Progression ── */
const NSQFProgression = ({ currentLevel }: { currentLevel: number }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="var(--brand-400)" />
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>NSQF Level Progression</h3>
                <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)' }}>National Skills Qualifications Framework</p>
            </div>
            <span className="badge badge-brand" style={{ marginLeft: 'auto' }}>Level {currentLevel}</span>
        </div>
        {/* Level track */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {NSQF_LEVELS.map((n, i) => {
                const isDone = n.level < currentLevel;
                const isCurrent = n.level === currentLevel;
                const isNext = n.level === currentLevel + 1;
                return (
                    <motion.div key={n.level}
                        initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        style={{
                            padding: '0.75rem 0.6rem', borderRadius: '12px', textAlign: 'center',
                            background: isCurrent ? `${n.color}18` : isDone ? 'rgba(16,185,129,0.08)' : 'var(--glass-bg)',
                            border: `1px solid ${isCurrent ? n.color + '55' : isDone ? 'rgba(16,185,129,0.3)' : 'var(--glass-border)'}`,
                            boxShadow: isCurrent ? `0 0 16px ${n.color}30` : 'none',
                            position: 'relative', transition: 'all 0.3s',
                        }}>
                        {isNext && <div style={{ position: 'absolute', top: -8, right: -4, background: 'var(--accent-amber)', borderRadius: '9999px', padding: '1px 6px', fontSize: '0.6rem', fontWeight: 700, color: '#000' }}>NEXT</div>}
                        <div style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                            {isDone ? '✅' : isCurrent ? '🎯' : isNext ? '⭐' : '🔒'}
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isCurrent ? n.color : isDone ? 'var(--success)' : 'var(--text-muted)', marginBottom: '0.15rem' }}>L{n.level}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: isCurrent ? n.color : isDone ? 'var(--success)' : 'var(--text-secondary)' }}>{n.label}</div>
                        <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.3 }}>{n.desc}</div>
                    </motion.div>
                );
            })}
        </div>
    </motion.div>
);

/* ── Recommended Courses ── */
const RecommendedCourses = ({ onSelectCourse }: { onSelectCourse: (c: Course) => void }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.post(`${API}/recommend`, {}, { headers: authHeader() })
            .then(r => { setCourses(r.data.recommendations || []); })
            .catch(() => setError('Could not load recommendations. Complete your profile first.'))
            .finally(() => setLoading(false));
    }, []);

    const qColor = (q?: string) => q === 'High' ? 'var(--success)' : q === 'Medium' ? 'var(--warning)' : 'var(--text-muted)';

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={16} color="var(--brand-400)" />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>AI Recommended Courses</h3>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)' }}>TF-IDF + Cosine Similarity · Based on your profile</p>
                </div>
                <span className="badge badge-brand" style={{ marginLeft: 'auto' }}><Zap size={11} /> AI</span>
            </div>

            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ height: 72, borderRadius: '12px', background: 'var(--glass-bg)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />)}
                </div>
            )}
            {error && <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}><Brain size={28} style={{ marginBottom: '0.5rem', opacity: 0.4 }} /><br />{error}</div>}
            {!loading && !error && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {courses.map((c, i) => (
                        <motion.div key={c.course_id}
                            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                            onClick={() => onSelectCourse(c)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: '12px',
                                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            whileHover={{ scale: 1.01, borderColor: 'var(--glass-border-hover)' }}>
                            {/* Rank */}
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,var(--brand-600),var(--accent-violet))' : 'var(--glass-bg-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: i === 0 ? '#fff' : 'var(--text-secondary)', flexShrink: 0, border: i === 0 ? 'none' : '1px solid var(--glass-border)', boxShadow: i === 0 ? '0 0 12px rgba(99,102,241,0.4)' : 'none' }}>#{c.rank}</div>
                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.course_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                                    <span>{c.sector}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} />{c.duration}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><GraduationCap size={10} />NSQF {c.nsqf_level}</span>
                                </div>
                            </div>
                            {/* Match badge */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                                {c.similarity_score !== undefined && <div style={{ fontSize: '0.82rem', fontWeight: 800, color: qColor(c.match_quality), fontFamily: 'Outfit,sans-serif' }}>{Math.round(c.similarity_score * 100)}%</div>}
                                <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: `${qColor(c.match_quality)}18`, color: qColor(c.match_quality), border: `1px solid ${qColor(c.match_quality)}40` }}>{c.match_quality}</span>
                            </div>
                            <ChevronRight size={14} color="var(--text-muted)" />
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

/* ── Career Path Steps ── */
const statusConfig = {
    'Completed': { color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)', label: 'Completed' },
    'In Progress': { color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.3)', label: 'In Progress' },
    'Pending': { color: 'var(--text-muted)', bg: 'var(--glass-bg)', border: 'var(--glass-border)', label: 'Pending' },
};

const CareerPathSection = ({ path, onUpdate }: { path: Path; onUpdate: () => void }) => {
    const completed = path.steps.filter(s => s.status === 'Completed').length;
    const inProgress = path.steps.filter(s => s.status === 'In Progress').length;
    const total = path.steps.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const updateStep = async (stepId: string, status: string) => {
        await axios.put(`${API}/learner/update-step`, { pathId: path._id, stepId, status }, { headers: authHeader() });
        onUpdate();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <Target size={16} color="var(--brand-400)" />
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Career Path</h3>
                        <span className="badge badge-brand">Active</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem' }}>{path.title}</p>
                </div>
                <ProgressRing progress={progress} />
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[
                    { icon: <CheckCircle size={14} />, color: 'var(--success)', bg: 'var(--success-bg)', value: completed, label: 'Completed' },
                    { icon: <Clock size={14} />, color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.1)', value: inProgress, label: 'In Progress' },
                    { icon: <Circle size={14} />, color: 'var(--text-muted)', bg: 'var(--glass-bg)', value: total - completed - inProgress, label: 'Pending' },
                ].map(({ icon, color, bg, value, label }) => (
                    <div key={label} style={{ background: bg, borderRadius: '10px', padding: '0.6rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem', color }}>{icon}</div>
                        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.2rem', color }}>{value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    </div>
                ))}
            </div>
            {/* Progress bar */}
            <div style={{ height: 5, borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--brand-600), var(--accent-violet))', borderRadius: '9999px' }} />
            </div>
            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <AnimatePresence>
                    {path.steps.map((step, i) => {
                        const cfg = statusConfig[step.status];
                        return (
                            <motion.div key={step._id}
                                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.875rem', borderRadius: '12px', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: step.status === 'Completed' ? 'var(--success)' : 'var(--bg-elevated)', border: `2px solid ${cfg.color}`, color: step.status === 'Completed' ? '#fff' : cfg.color, fontWeight: 700, fontSize: '0.78rem' }}>
                                    {step.status === 'Completed' ? <CheckCircle size={14} /> : i + 1}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.88rem', color: step.status === 'Completed' ? 'var(--success)' : 'var(--text-primary)' }}>{step.step_name}</h4>
                                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                            {step.status === 'Pending' && <button onClick={() => updateStep(step._id, 'In Progress')} className="btn btn-sm" style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(34,211,238,0.3)' }}>Start</button>}
                                            {step.status !== 'Completed' && <button onClick={() => updateStep(step._id, 'Completed')} className="btn btn-success btn-sm"><CheckCircle size={11} /> Done</button>}
                                        </div>
                                    </div>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', lineHeight: 1.5 }}>{step.description}</p>
                                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={10} />{step.duration}</span>
                                        <span className={`badge ${step.status === 'Completed' ? 'badge-success' : step.status === 'In Progress' ? 'badge-brand' : 'badge-neutral'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>{cfg.label}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

/* ── Tips ── */
const tips = [
    { icon: '⚡', tip: 'Consistent 1hr/day learning beats weekend marathons.' },
    { icon: '🎯', tip: 'Focus on your NSQF next level — one course at a time.' },
    { icon: '📊', tip: 'Track your progress daily to stay motivated.' },
    { icon: '🤝', tip: 'Soft skills + technical skills = complete professional.' },
    { icon: '🚀', tip: 'Certifications validate your skills to employers.' },
];

/* ══════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════ */
const Dashboard = () => {
    const { username } = useAuth();
    const navigate = useNavigate();
    const [path, setPath] = useState<Path | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [tipIndex] = useState(() => Math.floor(Math.random() * tips.length));
    const [activeTab, setActiveTab] = useState<'path' | 'recommend' | 'nsqf'>('path');

    const fetchData = async () => {
        try {
            const [pathRes, profileRes] = await Promise.allSettled([
                axios.get(`${API}/learner/current-path`, { headers: authHeader() }),
                axios.get(`${API}/profile`, { headers: authHeader() }),
            ]);
            if (pathRes.status === 'fulfilled') setPath(pathRes.value.data);
            if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem' }}>
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand-600),var(--accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={26} color="white" />
            </motion.div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading your dashboard…</p>
        </div>
    );

    const nsqfLevel = profile?.nsqf_level || 1;

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '960px', margin: '0 auto' }}>

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
                <div>
                    <span className="badge badge-brand" style={{ marginBottom: '0.5rem' }}><BarChart2 size={11} /> Dashboard</span>
                    <h1 style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', marginBottom: '0.2rem' }}>
                        Welcome back, <span className="gradient-text-brand">{profile?.full_name?.split(' ')[0] || username}</span> 👋
                    </h1>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {path ? `Tracking: ${path.title}` : 'No active path yet — generate one!'}
                    </p>
                </div>
                {/* Daily tip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.7rem 1rem', maxWidth: 280 }}>
                    <Flame size={14} style={{ color: '#f97316', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Tip: </strong>{tips[tipIndex].tip}
                    </span>
                </div>
            </div>

            {/* ── PROFILE SUMMARY ── */}
            {profile ? <ProfileCard profile={profile} username={username} /> : (
                <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={20} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Complete your profile to get personalised recommendations</span>
                    </div>
                    <button onClick={() => navigate('/profile-settings')} className="btn btn-primary btn-sm">Complete Profile</button>
                </div>
            )}

            {/* ── TAB SWITCHER ── */}
            <div style={{ display: 'flex', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '4px', marginBottom: '1.5rem', gap: '2px' }}>
                {[
                    { id: 'path', label: 'Career Path', icon: <Target size={14} /> },
                    { id: 'recommend', label: 'AI Courses', icon: <Brain size={14} /> },
                    { id: 'nsqf', label: 'NSQF Progress', icon: <TrendingUp size={14} /> },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s ease',
                            background: activeTab === tab.id ? 'linear-gradient(135deg,var(--brand-600),var(--brand-500))' : 'transparent',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                            boxShadow: activeTab === tab.id ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
                        }}>
                        {tab.icon}{tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB CONTENT ── */}
            <AnimatePresence mode="wait">
                {activeTab === 'path' && (
                    <motion.div key="path" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        {path ? (
                            <CareerPathSection path={path} onUpdate={fetchData} />
                        ) : (
                            <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                                <h2 style={{ marginBottom: '0.75rem' }}>No Active Path Yet</h2>
                                <p style={{ marginBottom: '2rem', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto 2rem' }}>Generate an AI-powered career pathway tailored to your skills and goals.</p>
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/generate')} className="btn btn-primary btn-lg">
                                    <Plus size={18} /> Generate My Path
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
                {activeTab === 'recommend' && (
                    <motion.div key="recommend" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <RecommendedCourses onSelectCourse={setSelectedCourse} />
                    </motion.div>
                )}
                {activeTab === 'nsqf' && (
                    <motion.div key="nsqf" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <NSQFProgression currentLevel={nsqfLevel} />
                        {/* Stats below NSQF */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {[
                                { icon: <Award size={18} />, color: 'var(--accent-violet)', bg: 'rgba(167,139,250,0.12)', value: `Level ${nsqfLevel}`, label: 'Current NSQF' },
                                { icon: <Star size={18} />, color: 'var(--accent-amber)', bg: 'rgba(251,191,36,0.12)', value: `Level ${Math.min(nsqfLevel + 1, 8)}`, label: 'Next Target' },
                                { icon: <BookOpen size={18} />, color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.1)', value: path ? `${path.steps.length} Steps` : 'No path', label: 'Path Steps' },
                                { icon: <TrendingUp size={18} />, color: 'var(--success)', bg: 'var(--success-bg)', value: `${8 - nsqfLevel} more`, label: 'Levels to Master' },
                            ].map(({ icon, color, bg, value, label }) => (
                                <div key={label} style={{ background: bg, border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ color, opacity: 0.8 }}>{icon}</div>
                                    <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.2rem', color }}>{value}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── COURSE DETAIL MODAL ── */}
            <AnimatePresence>
                {selectedCourse && <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
            </AnimatePresence>
        </motion.div>
    );
};

export default Dashboard;
