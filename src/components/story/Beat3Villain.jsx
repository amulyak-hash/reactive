import { useState } from 'react';
import { motion } from 'framer-motion';
import useScrollReveal from '../../hooks/useScrollReveal';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';
import WeightedStream from './WeightedStream';
import { C, FONT_SANS, FONT_MONO, rgb } from '../../theme/tokens';
import { CONTRACTOR_LOGOS } from './contractorLogos';

const CAPTIONS = {
  'Ground conditions': 'the ground told a different story than the survey',
  'Design changes': 'scope kept shifting under their feet',
};

const STREAM_CONFIG = [
  { dotSize: 12, streamHeight: 44, color: C.red },
  { dotSize: 10, streamHeight: 36, color: C.orange },
  { dotSize: 8, streamHeight: 28, color: C.amber },
  { dotSize: 6, streamHeight: 22, color: 'rgba(255,255,255,0.4)' },
];

export default function Beat3Villain({ afcons }) {
  const [ref, isRevealed] = useScrollReveal({ threshold: 0.3 });
  const [hoveredClause, setHoveredClause] = useState(null);

  const sortedClauses = [...afcons.ncesByClause].sort((a, b) => b.value - a.value);
  const maxValue = sortedClauses[0]?.value || 1;

  const totalCounter = useAnimatedCounter(afcons.nceVariation, 800, isRevealed, {
    decimals: 1, prefix: '£', suffix: 'M',
  });

  return (
    <div ref={ref} style={{ padding: '80px 40px', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isRevealed ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ textAlign: 'center', marginBottom: 10 }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <img src={CONTRACTOR_LOGOS['Afcons Infra']} alt="" style={{
            height: 22, width: 'auto', objectFit: 'contain',
          }} />
          <span style={{
            fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600,
            color: rgb(C.red, 0.6), textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            Afcons Infra — Where the money went
          </span>
        </div>
      </motion.div>

      {/* Total */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isRevealed ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <span style={{
          fontFamily: FONT_MONO, fontSize: 48, fontWeight: 800,
          color: C.red,
          textShadow: `0 0 30px ${rgb(C.red, 0.25)}`,
        }}>
          {totalCounter.displayValue}
        </span>
        <span style={{
          fontSize: 17, color: 'rgba(255,255,255,0.5)', marginLeft: 10,
          fontFamily: FONT_SANS,
        }}>
          on a £{afcons.originalValue}M contract
        </span>
      </motion.div>

      {/* Weighted streams */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 20,
        maxWidth: 560, margin: '0 auto',
      }}>
        {sortedClauses.map((clause, i) => {
          const config = STREAM_CONFIG[i] || STREAM_CONFIG[STREAM_CONFIG.length - 1];
          const widthPercent = (clause.value / maxValue) * 100;
          const caption = CAPTIONS[clause.clause] || null;

          return (
            <WeightedStream
              key={clause.clause}
              clause={clause.clause}
              value={clause.value}
              nceCount={clause.count}
              color={config.color}
              dotSize={config.dotSize}
              streamHeight={config.streamHeight}
              widthPercent={widthPercent}
              caption={caption}
              isRevealed={isRevealed}
              delay={0.4 + i * 0.2}
              isHovered={hoveredClause === clause.clause}
              anyHovered={hoveredClause !== null}
              onHover={() => setHoveredClause(clause.clause)}
              onLeave={() => setHoveredClause(null)}
            />
          );
        })}
      </div>
    </div>
  );
}
