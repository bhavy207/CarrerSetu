import { motion } from 'framer-motion';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showWordmark?: boolean;
}

const Logo = ({ size = 'md', showWordmark = true }: LogoProps) => {
    const dim = size === 'sm' ? 28 : size === 'lg' ? 52 : 38;
    const radius = size === 'sm' ? 7 : size === 'lg' ? 13 : 10;
    const iconSize = Math.round(dim * 0.52);
    const wordSize = size === 'sm' ? '0.88rem' : size === 'lg' ? '1.65rem' : '1.25rem';
    const wordGap = size === 'sm' ? '0.45rem' : size === 'lg' ? '0.9rem' : '0.65rem';

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: wordGap, cursor: 'pointer' }}>

            {/* ── 3D ANIMATED ICON ── */}
            {/* Perspective wrapper so rotateY looks 3D */}
            <motion.div
                style={{ perspective: 500, perspectiveOrigin: 'center' }}
                whileHover="hover"
                animate="idle"
            >
                {/* Outer glow pulse */}
                <motion.div
                    variants={{
                        idle: {
                            boxShadow: [
                                '0 0 14px 3px rgba(99,102,241,0.55)',
                                '0 0 28px 7px rgba(99,102,241,0.75)',
                                '0 0 14px 3px rgba(99,102,241,0.55)',
                            ],
                        },
                    }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                    style={{ borderRadius: radius }}
                >
                    {/* 3D flip + float shell */}
                    <motion.div
                        variants={{
                            idle: {
                                rotateY: [0, 18, 0, -18, 0],
                                y: [0, -4, 0, -4, 0],
                            },
                            hover: {
                                rotateY: 180,
                                scale: 1.12,
                                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                            },
                        }}
                        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.2 }}
                        style={{
                            width: dim, height: dim,
                            borderRadius: radius,
                            background: 'linear-gradient(145deg, #a78bfa 0%, #6366f1 35%, #4f46e5 65%, #7c3aed 100%)',
                            boxShadow: '0 6px 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.22)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {/* Top gloss layer */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0,
                            height: '46%',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)',
                            borderRadius: `${radius}px ${radius}px 0 0`,
                            pointerEvents: 'none',
                        }} />

                        {/* Bottom depth shadow */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: '30%',
                            background: 'linear-gradient(0deg, rgba(0,0,0,0.25) 0%, transparent 100%)',
                            pointerEvents: 'none',
                        }} />

                        {/* Slowly spinning inner icon mark */}
                        <motion.svg
                            width={iconSize} height={iconSize}
                            viewBox="0 0 24 24" fill="none"
                            animate={{ rotate: [0, 360] }}
                            transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
                            style={{ position: 'relative', zIndex: 1 }}
                        >
                            {/* Compass outer ring */}
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                            {/* Tick marks at cardinal points */}
                            <line x1="12" y1="2.5" x2="12" y2="4.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="12" y1="19.5" x2="12" y2="21.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
                            <line x1="2.5" y1="12" x2="4.5" y2="12" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
                            <line x1="19.5" y1="12" x2="21.5" y2="12" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
                            {/* North needle — bright */}
                            <path d="M12 12 L10 16 L12 7 L14 16 Z" fill="white" opacity="0.95" />
                            {/* South needle — dimmed */}
                            <path d="M12 12 L10 8 L12 17 L14 8 Z" fill="rgba(255,255,255,0.3)" />
                            {/* Center dot */}
                            <circle cx="12" cy="12" r="1.6" fill="white" />
                        </motion.svg>

                        {/* Hover back face — shows "CS" monogram when flipped */}
                        <motion.div
                            variants={{ hover: { opacity: 1 }, idle: { opacity: 0 } }}
                            style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'linear-gradient(145deg, #7c3aed, #4f46e5)',
                                borderRadius: radius,
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                            }}
                        >
                            <span style={{
                                color: 'white', fontFamily: 'Outfit, sans-serif',
                                fontWeight: 900,
                                fontSize: size === 'sm' ? '0.7rem' : size === 'lg' ? '1.1rem' : '0.85rem',
                                letterSpacing: '-0.03em',
                            }}>CS</span>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* ── WORDMARK ── */}
            {showWordmark && (
                <span style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    fontSize: wordSize,
                    letterSpacing: '-0.025em',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                }}>
                    <span style={{
                        background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>Career</span>
                    <span style={{
                        background: 'linear-gradient(135deg, #e2e8f0 0%, #c4b5fd 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>Setu</span>
                </span>
            )}
        </div>
    );
};

export default Logo;
