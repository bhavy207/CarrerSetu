import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, ChevronDown } from 'lucide-react';

interface SkillTreeProps {
    matched_skills: string[];
    missing_skills: string[];
}

const SkillTree: React.FC<SkillTreeProps> = ({ matched_skills, missing_skills }) => {
    // Combine to form a progression tree
    // Typically, user's current matched skills form the "base", missing form the "top"
    // So we'll put matched at the upper tiers and missing at the lower tiers.

    const allSkills = [...matched_skills, ...missing_skills];

    const tiers = [];
    const tierNames = ['Foundation Phase', 'Core Competencies', 'Advanced Specialization', 'Mastery'];

    let currentIndex = 0;
    const chunkSize = Math.max(1, Math.ceil(allSkills.length / 3));

    for (let i = 0; i < 4; i++) {
        if (currentIndex >= allSkills.length) break;
        // Make the middle row explicitly larger if we have many skills
        const size = (i === 1 && allSkills.length > 5) ? chunkSize + 1 : chunkSize;
        const slice = allSkills.slice(currentIndex, currentIndex + size);
        if (slice.length > 0) {
            tiers.push({
                name: tierNames[i] || `Phase ${i + 1}`,
                skills: slice
            });
        }
        currentIndex += size;
    }

    return (
        <div style={{ padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(10, 10, 25, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}>
            <motion.h3
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2.5rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}
            >
                Career Progression Path
            </motion.h3>

            {tiers.map((tier, tIdx) => (
                <React.Fragment key={tIdx}>
                    <div style={{ width: '100%', textAlign: 'center', marginBottom: '0.5rem', position: 'relative', zIndex: 10 }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-400)', marginBottom: '1.2rem', fontWeight: 700 }}>
                            {tier.name}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                            {tier.skills.map((skill, sIdx) => {
                                const isUnlocked = matched_skills.includes(skill);
                                return (
                                    <motion.div
                                        key={sIdx}
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: (tIdx * 0.25) + (sIdx * 0.1), type: 'spring', stiffness: 200, damping: 15 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        className="glass-card"
                                        style={{
                                            padding: '0.9rem 1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.6rem',
                                            background: isUnlocked ? 'rgba(16,185,129,0.1)' : 'rgba(30,30,40,0.6)',
                                            border: isUnlocked ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: isUnlocked ? '0 0 20px rgba(16,185,129,0.15)' : 'none',
                                            filter: isUnlocked ? 'none' : 'grayscale(0.5)',
                                            minWidth: '160px',
                                            justifyContent: 'center',
                                            cursor: 'default'
                                        }}
                                    >
                                        {isUnlocked ? (
                                            <div style={{ padding: '4px', background: 'var(--success)', borderRadius: '50%', display: 'flex', color: '#111' }}><Check size={12} strokeWidth={3} /></div>
                                        ) : (
                                            <div style={{ padding: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', color: 'var(--text-muted)' }}><Lock size={12} /></div>
                                        )}
                                        <span style={{
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)'
                                        }}>
                                            {skill}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                    {tIdx < tiers.length - 1 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 50, opacity: 1 }}
                            transition={{ delay: (tIdx * 0.25) + 0.4, duration: 0.6 }}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                margin: '0 0 1.5rem 0', color: 'var(--brand-500)',
                                position: 'relative', zIndex: 1
                            }}
                        >
                            <div style={{ width: '2px', flexGrow: 1, background: 'linear-gradient(to bottom, var(--brand-500), rgba(99,102,241,0.2))' }}></div>
                            <ChevronDown size={20} style={{ marginTop: '-4px', opacity: 0.7 }} />
                        </motion.div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default SkillTree;
