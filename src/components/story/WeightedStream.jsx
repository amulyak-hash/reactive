import { useState } from 'react';
import { motion } from 'framer-motion';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';
import { FONT_SANS, FONT_MONO, rgb } from '../../theme/tokens';

const EASE_OUT = [0.16, 1, 0.3, 1];

export default function WeightedStream({
  clause, value, color, dotSize, streamHeight, widthPercent,
  caption, isRevealed, delay = 0, nceCount,
  isHovered, anyHovered, onHover, onLeave,
}) {
  const counter = useAnimatedCounter(value, 500, isRevealed, {
    decimals: 1, prefix: '£', suffix: 'M',
  });

  const pulseDuration = 1.5 + (dotSize / 10) * 1;

  // Hover: expand stream, intensify glow, show caption even if hidden
  const hoverHeight = isHovered ? streamHeight + 8 : streamHeight;
  const spotlightOpacity = anyHovered && !isHovered ? 0.4 : 1;

  return (
    <motion.div
      animate={{ opacity: spotlightOpacity }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 16, cursor: 'default' }}
    >
      {/* Glowing dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isRevealed ? {
          scale: isHovered ? 1.3 : 1,
          opacity: 1,
        } : {}}
        transition={{ delay: isRevealed ? delay : 0, duration: 0.4, ease: EASE_OUT }}
        style={{
          width: dotSize, height: dotSize, borderRadius: '50%',
          background: color, flexShrink: 0, marginTop: (hoverHeight - dotSize) / 2,
          boxShadow: isHovered
            ? `0 0 ${dotSize * 2}px ${rgb(color, 0.7)}, 0 0 ${dotSize * 3}px ${rgb(color, 0.3)}`
            : `0 0 ${dotSize}px ${rgb(color, 0.5)}, 0 0 ${dotSize * 2}px ${rgb(color, 0.2)}`,
          animation: isRevealed ? `glow-pulse ${pulseDuration}s ease-in-out infinite` : 'none',
          transition: 'box-shadow 200ms ease, margin-top 200ms ease',
        }}
      />

      {/* Stream body */}
      <div style={{ flex: 1 }}>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isRevealed ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ delay: isRevealed ? delay : 0, duration: 0.5, ease: EASE_OUT }}
          style={{
            height: hoverHeight, borderRadius: hoverHeight / 2,
            width: `${widthPercent}%`,
            background: isHovered
              ? `linear-gradient(90deg, ${rgb(color, 0.45)}, ${rgb(color, 0.12)})`
              : `linear-gradient(90deg, ${rgb(color, 0.35)}, ${rgb(color, 0.08)})`,
            position: 'relative', overflow: 'hidden',
            transformOrigin: 'left center',
            boxShadow: isHovered ? `0 0 20px ${rgb(color, 0.15)}` : 'none',
            transition: 'height 200ms ease, background 200ms ease, box-shadow 200ms ease',
          }}
        >
          {/* Clause name */}
          <div style={{
            position: 'absolute', left: 16,
            top: '50%', transform: 'translateY(-50%)',
            fontFamily: FONT_SANS, fontSize: hoverHeight > 30 ? 14 : 12,
            fontWeight: isHovered ? 600 : 500,
            color: isHovered
              ? 'rgba(255,255,255,0.95)'
              : `rgba(255,255,255,${streamHeight > 30 ? 0.8 : 0.65})`,
            whiteSpace: 'nowrap',
            transition: 'color 200ms ease',
          }}>
            {clause}
          </div>

          {/* Value */}
          <div style={{
            position: 'absolute', right: 16,
            top: '50%', transform: 'translateY(-50%)',
            fontFamily: FONT_MONO, fontSize: hoverHeight > 30 ? 16 : 13,
            fontWeight: 700, color: isHovered ? color : color,
            whiteSpace: 'nowrap',
          }}>
            {counter.displayValue}
          </div>
        </motion.div>

        {/* Caption — always show on hover, otherwise only if prop exists */}
        {(caption || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isRevealed ? { opacity: isHovered ? 0.7 : caption ? 1 : 0, y: 0 } : {}}
            transition={{ delay: isRevealed ? delay + 0.2 : 0, duration: 0.3, ease: EASE_OUT }}
            style={{
              marginTop: 6, paddingLeft: 16,
              fontFamily: FONT_SANS, fontSize: 12, fontStyle: 'italic',
              color: isHovered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.4)',
              transition: 'color 200ms ease',
            }}
          >
            {nceCount ? `${nceCount} NCEs — ` : ''}{caption || `${nceCount} NCEs filed under this clause`}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
