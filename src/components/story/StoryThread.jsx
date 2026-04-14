import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { C, FONT_MONO, rgb } from '../../theme/tokens';

const BEATS = [
  { id: 1, label: '13p has already leaked', color: C.red },
  { id: 2, label: 'The bleeding isn\'t equal', color: C.amber },
  { id: 3, label: 'Where the money went', color: C.red },
  { id: 4, label: 'It\'s accelerating', color: C.purple },
  { id: 5, label: 'The benchmark exists', color: C.blue },
];

export default function StoryThread({ activeBeat }) {
  const [hoveredBeat, setHoveredBeat] = useState(null);

  if (!activeBeat) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        right: 28,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}
    >
      {BEATS.map((beat, i) => {
        const isPast = beat.id < activeBeat;
        const isActive = beat.id === activeBeat;
        const isFuture = beat.id > activeBeat;
        const isLast = i === BEATS.length - 1;
        const isHovered = hoveredBeat === beat.id;

        return (
          <div key={beat.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Node + label row */}
            <div
              style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'default' }}
              onMouseEnter={() => setHoveredBeat(beat.id)}
              onMouseLeave={() => setHoveredBeat(null)}
            >
              {/* The node */}
              <motion.div
                animate={{
                  width: isActive ? 12 : isHovered ? 9 : 6,
                  height: isActive ? 12 : isHovered ? 9 : 6,
                  backgroundColor: isPast ? rgb(beat.color, isHovered ? 0.8 : 0.5)
                    : isActive ? beat.color
                    : isHovered ? rgb(beat.color, 0.3)
                    : 'transparent',
                  boxShadow: isActive
                    ? `0 0 14px ${rgb(beat.color, 0.5)}`
                    : isHovered
                      ? `0 0 10px ${rgb(beat.color, 0.3)}`
                      : '0 0 0 transparent',
                }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  borderRadius: '50%',
                  border: isFuture && !isHovered
                    ? '1px solid rgba(255,255,255,0.15)'
                    : '1px solid transparent',
                  flexShrink: 0,
                }}
              />

              {/* Label — shows on active OR hover */}
              <AnimatePresence mode="wait">
                {(isActive || isHovered) && (
                  <motion.div
                    key={`${beat.id}-${isActive ? 'active' : 'hover'}`}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'absolute',
                      right: 22,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{
                      fontFamily: FONT_MONO, fontSize: 9, fontWeight: 600,
                      color: rgb(beat.color, isActive ? 0.8 : 0.5),
                      background: rgb(beat.color, isActive ? 0.08 : 0.04),
                      padding: '3px 10px',
                      borderRadius: 5,
                      border: `1px solid ${rgb(beat.color, isActive ? 0.15 : 0.08)}`,
                      letterSpacing: '0.03em',
                    }}>
                      {beat.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div style={{
                width: 1,
                height: 22,
                background: isPast
                  ? rgb(BEATS[i + 1].color, 0.3)
                  : isActive
                    ? `linear-gradient(180deg, ${rgb(beat.color, 0.3)}, rgba(255,255,255,0.06))`
                    : 'rgba(255,255,255,0.04)',
                transition: 'background 400ms ease',
              }} />
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
