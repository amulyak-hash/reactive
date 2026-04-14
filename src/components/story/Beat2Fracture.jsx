import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';
import { C, FONT_SANS, FONT_MONO, rgb } from '../../theme/tokens';
import { CONTRACTOR_LOGOS } from './contractorLogos';

export default function Beat2Fracture({ sortedContractors, onComplete }) {
  const [stage, setStage] = useState(0);
  const [hoveredName, setHoveredName] = useState(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 800),
      setTimeout(() => setStage(3), 1600),
      setTimeout(() => setStage(4), 2200),
      setTimeout(() => setStage(5), 2800),
      setTimeout(() => onComplete?.(), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 340px)', padding: '40px 40px',
    }}>
      {/* Statement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 1 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          fontSize: 22, fontStyle: 'italic', color: 'rgba(255,255,255,0.75)',
          letterSpacing: '0.01em', marginBottom: 48, textAlign: 'center',
          fontFamily: FONT_SANS,
        }}
      >
        "But the bleeding isn't equal."
      </motion.div>

      {/* Contractor list */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 18,
        maxWidth: 540, width: '100%',
      }}>
        {sortedContractors.map((c, i) => {
          const pct = (c.nceVariation / c.originalValue) * 100;
          const isAfcons = c.name === 'Afcons Infra';
          const isLast = i === sortedContractors.length - 1;
          const delay = isLast ? 0 : i * 0.08;
          const showAt = isLast ? 3 : 2;
          const dimOpacity = isAfcons ? 1 : [0.45, 0.45, 0.5, 0.6][i] ?? 0.45;

          return (
            <ContractorRow
              key={c.name}
              contractor={c}
              pct={pct}
              isAfcons={isAfcons}
              stage={stage}
              showAt={showAt}
              delay={delay}
              dimOpacity={dimOpacity}
              isHovered={hoveredName === c.name}
              anyHovered={hoveredName !== null}
              onHover={() => setHoveredName(c.name)}
              onLeave={() => setHoveredName(null)}
            />
          );
        })}
      </div>

      {/* Micro-narration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 5 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          marginTop: 40, fontSize: 15, color: rgb(C.red, 0.6),
          textAlign: 'center', fontFamily: FONT_SANS,
        }}
      >
        One contractor. A quarter of every pound. What happened?
      </motion.div>
    </div>
  );
}

function ContractorRow({
  contractor, pct, isAfcons, stage, showAt, delay, dimOpacity,
  isHovered, anyHovered, onHover, onLeave,
}) {
  const { name, color, originalValue, nceCount, ncesByClause } = contractor;
  const counter = useAnimatedCounter(pct, 500, stage >= showAt, {
    decimals: isAfcons ? 0 : 1, suffix: '%',
  });

  const barMaxPct = 25;
  const barWidth = `${(pct / barMaxPct) * 100}%`;
  const barHeight = isAfcons ? 12 : 8;
  const isDimmed = stage >= 4 && !isAfcons;

  // Hover overrides dimming
  const effectiveOpacity = isHovered ? 1
    : (anyHovered && !isAfcons) ? 0.3
    : isDimmed ? dimOpacity
    : 1;

  const topClause = ncesByClause?.reduce((a, b) => a.value > b.value ? a : b, ncesByClause[0]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={stage >= showAt
        ? { opacity: effectiveOpacity, x: 0 }
        : { opacity: 0, x: -12 }
      }
      transition={isAfcons
        ? { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        : { duration: 0.3, ease: [0.16, 1, 0.3, 1], delay }
      }
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        display: 'flex', alignItems: 'center', gap: 18,
        marginTop: isAfcons ? 10 : 0,
        cursor: 'default',
        position: 'relative',
      }}
    >
      {/* Logo + Name */}
      <div style={{
        width: 150, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: 10, flexShrink: 0,
      }}>
        {CONTRACTOR_LOGOS[name] && (
          <img
            src={CONTRACTOR_LOGOS[name]}
            alt=""
            style={{
              height: isAfcons ? 22 : 18, width: 'auto',
              objectFit: 'contain',
              filter: isHovered ? 'none' : isAfcons ? 'none' : 'brightness(0.8) grayscale(0.3)',
              opacity: isHovered ? 1 : isAfcons ? 1 : 0.7,
              transition: 'filter 200ms ease, opacity 200ms ease',
            }}
          />
        )}
        <span style={{
          fontSize: isAfcons ? 16 : 15,
          fontWeight: isAfcons || isHovered ? 600 : 400,
          color: isHovered ? C.t1 : isAfcons ? C.t1 : 'rgba(255,255,255,0.6)',
          fontFamily: FONT_SANS, whiteSpace: 'nowrap',
          transition: 'color 200ms ease',
        }}>
          {name.replace(' Construction', '').replace(' International', ' Intl')}
        </span>
      </div>

      {/* Bar */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          height: isHovered && !isAfcons ? 10 : barHeight,
          borderRadius: (isHovered && !isAfcons ? 10 : barHeight) / 2,
          width: barWidth,
          background: isAfcons
            ? `linear-gradient(90deg, ${rgb(color, 0.6)}, ${rgb(color, 0.3)})`
            : isHovered
              ? `linear-gradient(90deg, ${rgb(color, 0.5)}, ${rgb(color, 0.2)})`
              : rgb(color, 0.3),
          boxShadow: (isAfcons && stage >= 3) || isHovered
            ? `0 0 24px ${rgb(isAfcons ? C.red : color, 0.25)}`
            : 'none',
          animation: isAfcons && stage >= 4
            ? 'glow-pulse 2.5s ease-in-out infinite'
            : 'none',
          transition: 'height 200ms ease, box-shadow 200ms ease, background 200ms ease',
        }} />
      </div>

      {/* Percentage */}
      <div style={{
        fontFamily: FONT_MONO, width: 56, textAlign: 'right', flexShrink: 0,
        fontSize: isAfcons ? 24 : isHovered ? 18 : 16,
        fontWeight: isAfcons ? 700 : isHovered ? 700 : 500,
        color: isAfcons ? C.red : isHovered ? color : rgb(color, 0.7),
        textShadow: (isAfcons && stage >= 4) || isHovered
          ? `0 0 20px ${rgb(isAfcons ? C.red : color, 0.4)}`
          : 'none',
        transition: 'font-size 200ms ease, color 200ms ease',
      }}>
        {counter.displayValue}
      </div>

      {/* Hover tooltip */}
      {isHovered && !isAfcons && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute', top: '100%', left: 150, marginTop: 6,
            padding: '8px 14px', borderRadius: 8,
            background: 'rgba(12, 20, 32, 0.95)',
            border: `1px solid ${rgb(color, 0.2)}`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.4)`,
            display: 'flex', gap: 16,
            fontFamily: FONT_MONO, fontSize: 10, color: 'rgba(255,255,255,0.5)',
            whiteSpace: 'nowrap', zIndex: 10,
          }}
        >
          <span>£{originalValue}M contract</span>
          <span>{nceCount} NCEs</span>
          {topClause && <span style={{ color: rgb(color, 0.7) }}>Top: {topClause.clause}</span>}
        </motion.div>
      )}
    </motion.div>
  );
}
