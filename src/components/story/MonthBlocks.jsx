import { useState } from 'react';
import { motion } from 'framer-motion';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';
import { FONT_MONO, rgb, C } from '../../theme/tokens';

const MAX_HEIGHT = 160;

export default function MonthBlocks({ cumulativeValues, maxValue, isRevealed }) {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      gap: 8, height: MAX_HEIGHT + 24, marginBottom: 16,
    }}>
      {cumulativeValues.map((cum, i) => {
        if (i === 0) return null;
        const delta = cum - (cumulativeValues[i - 1] || 0);
        const heightPct = cum / maxValue;
        const blockHeight = heightPct * MAX_HEIGHT;
        const opacityRamp = 0.1 + (i / (cumulativeValues.length - 1)) * 0.35;
        const isLast = i === cumulativeValues.length - 1;

        return (
          <MonthBlock
            key={i}
            month={`M${i}`}
            delta={delta}
            cumulative={cum}
            blockHeight={blockHeight}
            opacity={opacityRamp}
            isLast={isLast}
            isRevealed={isRevealed}
            delay={i * 0.12}
            isHovered={hoveredMonth === i}
            onHover={() => setHoveredMonth(i)}
            onLeave={() => setHoveredMonth(null)}
          />
        );
      })}
    </div>
  );
}

function MonthBlock({ month, delta, cumulative, blockHeight, opacity, isLast, isRevealed, delay, isHovered, onHover, onLeave }) {
  const counter = useAnimatedCounter(delta, 300, isRevealed, {
    decimals: 1, prefix: '+£', suffix: 'M',
  });

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        cursor: 'default', position: 'relative',
      }}
    >
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={isRevealed ? {
          height: blockHeight,
          opacity: 1,
          y: isHovered ? -4 : 0,
        } : {}}
        transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 48, borderRadius: '4px 4px 0 0',
          background: `rgba(240, 96, 96, ${isHovered ? opacity + 0.15 : opacity})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          border: isLast || isHovered ? `1px solid ${rgb(C.red, isHovered ? 0.5 : 0.3)}` : 'none',
          boxShadow: isHovered
            ? `0 0 24px ${rgb(C.red, 0.25)}`
            : isLast && isRevealed
              ? `0 0 20px ${rgb(C.red, 0.15)}`
              : 'none',
          transition: 'background 200ms ease, box-shadow 200ms ease, border 200ms ease',
        }}
      >
        <span style={{
          fontFamily: FONT_MONO,
          fontSize: blockHeight > 40 ? 11 : 9,
          color: `rgba(240, 96, 96, ${0.5 + opacity})`,
          fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          {counter.displayValue}
        </span>
      </motion.div>

      <span style={{
        fontFamily: FONT_MONO, fontSize: 10, fontWeight: 500,
        color: isHovered ? 'rgba(255,255,255,0.7)' : isLast ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.35)',
        transition: 'color 200ms ease',
      }}>
        {month}
      </span>

      {/* Hover tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute', bottom: '100%', marginBottom: 8,
            padding: '6px 12px', borderRadius: 6,
            background: 'rgba(12, 20, 32, 0.95)',
            border: `1px solid ${rgb(C.red, 0.2)}`,
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            fontFamily: FONT_MONO, fontSize: 10,
            color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          <span style={{ color: C.red, fontWeight: 700 }}>£{cumulative.toFixed(1)}M</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 6px' }}>total</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>+£{delta.toFixed(1)}M this month</span>
        </motion.div>
      )}
    </div>
  );
}
