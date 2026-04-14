import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';
import { C, FONT_SANS, FONT_MONO } from '../../theme/tokens';

const EASE_OUT = [0.16, 1, 0.3, 1];

export default function Beat1Hook({ leakageRatio, contractorCount }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 0),
      setTimeout(() => setStage(2), 300),
      setTimeout(() => setStage(3), 500),
      setTimeout(() => setStage(4), 700),
      setTimeout(() => setStage(5), 1400),
      setTimeout(() => setStage(6), 2000),
      setTimeout(() => setStage(7), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const pound = useAnimatedCounter(1, 600, stage >= 2, { decimals: 0, prefix: '£' });
  const pence = useAnimatedCounter(leakageRatio, 600, stage >= 4, { decimals: 0, suffix: 'p' });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 340px)', padding: '40px 40px', textAlign: 'center',
    }}>
      {/* Stage label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 1 ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600,
          color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
          letterSpacing: '0.2em', marginBottom: 36,
        }}
      >
        Portfolio Leakage
      </motion.div>

      {/* The ratio */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 28,
      }}>
        {/* £1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={stage >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 10, mass: 1 }}
        >
          <div style={{
            fontFamily: FONT_MONO, fontSize: 88, fontWeight: 800,
            color: C.t1, letterSpacing: '-0.04em', lineHeight: 1,
          }}>
            {pound.displayValue}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 5 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 10,
              fontFamily: FONT_SANS, letterSpacing: '0.02em',
            }}
          >
            contracted
          </motion.div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 3 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: 36, color: 'rgba(255,255,255,0.25)', marginBottom: 20,
          }}
        >
          →
        </motion.div>

        {/* 13p */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={stage >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 10, mass: 1 }}
        >
          <div style={{
            fontFamily: FONT_MONO, fontSize: 88, fontWeight: 800,
            color: C.red, letterSpacing: '-0.04em', lineHeight: 1,
            animation: stage >= 4 ? 'glow-pulse-text 2s ease-in-out infinite' : 'none',
          }}>
            {pence.displayValue}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 5 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: 14, color: 'rgba(240,96,96,0.65)', marginTop: 10,
              fontFamily: FONT_SANS, letterSpacing: '0.02em',
            }}
          >
            already leaked
          </motion.div>
        </motion.div>
      </div>

      {/* Context line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 6 ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        style={{
          marginTop: 44, fontSize: 18, color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.01em', fontFamily: FONT_SANS, fontWeight: 500,
        }}
      >
        Across {contractorCount} contractors. In 7 months.
      </motion.div>

      {/* Advance cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 7 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          marginTop: 52, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 10,
        }}
      >
        <span style={{
          fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600,
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Scroll to continue
        </span>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          animation: stage >= 7 ? 'advance-cue 1.5s ease-in-out infinite' : 'none',
        }}>
          <div style={{
            width: 1, height: 24,
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.35))',
          }} />
          <div style={{
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(255,255,255,0.4)',
          }} />
        </div>
      </motion.div>
    </div>
  );
}
