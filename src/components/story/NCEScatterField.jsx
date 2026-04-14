import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { C, FONT_MONO, FONT_SANS } from '../../theme/tokens';

const MAX_VALUE = 200; // £K y-axis ceiling
const THRESHOLD = 50;
const PADDING = { top: 20, right: 28, bottom: 44, left: 56 };

// Clause zone centers (0-1 within plot area)
const CLAUSE_X = [0.18, 0.5, 0.82];

// Deterministic jitter so dots don't overlap
function jitter(seed, range = 16) {
  return Math.sin(seed * 127.1 + 311.7) * range;
}

export default function NCEScatterField({
  width, height, scrubValue, contractors, clauses, months,
  hasStartedDragging, selectedContractor, onContractorClick,
}) {
  const plotLeft = PADDING.left;
  const plotRight = width - PADDING.right;
  const plotTop = PADDING.top;
  const plotBottom = height - PADDING.bottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  const monthCount = months.length;
  const thresholdY = plotTop + plotHeight * (1 - THRESHOLD / MAX_VALUE);

  // Pre-compute dot positions
  const allDots = useMemo(() => {
    const dots = [];
    contractors.forEach((c, ci) => {
      c.nces.forEach((nce, ni) => {
        const x = plotLeft + CLAUSE_X[nce.clause] * plotWidth + jitter(ci * 11 + ni * 7 + 50);
        const y = plotTop + plotHeight * (1 - nce.value / MAX_VALUE) + jitter(ci * 13 + ni * 3 + 80, 12);
        const monthNorm = nce.month / (monthCount - 1);
        dots.push({ ...nce, x, y, monthNorm, contractor: c, dotIdx: `${c.id}-${ni}` });
      });
    });
    return dots;
  }, [plotLeft, plotWidth, plotTop, plotHeight, monthCount, contractors]);

  // Y-axis labels
  const yLabels = [0, 50, 120, 180];

  return (
    <div style={{
      position: 'relative',
      width,
      height,
      overflow: 'hidden',
    }}>
      {/* ─── Grid lines ─── */}
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={width} height={height}>
        {/* Horizontal guides */}
        {yLabels.filter(v => v > 0).map(v => {
          const y = plotTop + plotHeight * (1 - v / MAX_VALUE);
          return <line key={v} x1={plotLeft} y1={y} x2={plotRight} y2={y} stroke="rgba(255,255,255,0.05)" />;
        })}
        {/* Vertical clause guides */}
        {CLAUSE_X.map((cx, i) => {
          const x = plotLeft + cx * plotWidth;
          return <line key={i} x1={x} y1={plotTop} x2={x} y2={plotBottom} stroke="rgba(255,255,255,0.04)" />;
        })}
        {/* Threshold line */}
        <line
          x1={plotLeft} y1={thresholdY} x2={plotRight} y2={thresholdY}
          stroke="rgba(240,96,96,0.4)" strokeDasharray="5,4"
        />
      </svg>

      {/* ─── Y-axis labels ─── */}
      {yLabels.map(v => {
        const y = plotTop + plotHeight * (1 - v / MAX_VALUE);
        return (
          <div key={v} style={{
            position: 'absolute', left: 0, top: y, transform: 'translateY(-50%)',
            width: PADDING.left - 8, textAlign: 'right',
            fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(255,255,255,0.4)',
          }}>
            £{v}K
          </div>
        );
      })}

      {/* Threshold label */}
      <div style={{
        position: 'absolute', right: PADDING.right, top: thresholdY - 18,
        fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(240,96,96,0.7)',
      }}>
        £50K threshold
      </div>

      {/* ─── X-axis clause labels ─── */}
      {clauses.map((label, i) => (
        <div key={label} style={{
          position: 'absolute',
          left: plotLeft + CLAUSE_X[i] * plotWidth,
          top: plotBottom + 10,
          transform: 'translateX(-50%)',
          fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(255,255,255,0.4)',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </div>
      ))}

      {/* ─── Dots as logos ─── */}
      <AnimatePresence>
        {allDots.map(dot => {
          const visible = scrubValue >= dot.monthNorm;
          if (!visible) return null;

          const c = dot.contractor;
          const isFlagged = c.isFlagged;
          const isSelected = selectedContractor === c.id;
          const isOtherSelected = selectedContractor && selectedContractor !== c.id;
          const size = isFlagged ? 32 : Math.max(28, (dot.value / MAX_VALUE) * 44);

          return (
            <motion.div
              key={dot.dotIdx}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: isOtherSelected ? 0.3 : 1,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              onClick={() => onContractorClick(c.id)}
              style={{
                position: 'absolute',
                left: dot.x - size / 2,
                top: dot.y - size / 2,
                width: size,
                height: size,
                cursor: 'pointer',
                zIndex: isSelected ? 10 : isFlagged ? 5 : 1,
              }}
            >
              {/* Glow ring */}
              <div style={{
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${c.color}${isFlagged ? '40' : '20'}, transparent 70%)`,
                transition: 'opacity 200ms ease',
                opacity: isSelected ? 1 : isFlagged ? 0.8 : 0.4,
              }} />

              {/* Logo circle */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `2px solid ${isSelected ? c.color : isFlagged ? `${c.color}aa` : `${c.color}55`}`,
                background: 'rgba(7,11,18,0.9)',
                boxShadow: isSelected
                  ? `0 0 16px ${c.color}66, 0 0 32px ${c.color}22`
                  : isFlagged
                    ? `0 0 12px ${c.color}44`
                    : 'none',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
              }}>
                <img
                  src={c.logo}
                  alt={c.shortName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: 4,
                    filter: isOtherSelected ? 'grayscale(0.6)' : 'none',
                    transition: 'filter 200ms ease',
                  }}
                  draggable={false}
                />
              </div>

              {/* Value label */}
              <div style={{
                position: 'absolute',
                bottom: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: FONT_MONO,
                fontSize: 8,
                color: c.color,
                opacity: isOtherSelected ? 0.3 : 0.85,
                whiteSpace: 'nowrap',
                transition: 'opacity 200ms ease',
              }}>
                £{dot.value}K
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ─── KEC label — fades in after month 3 ─── */}
      <AnimatePresence>
        {scrubValue > 0.75 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: PADDING.bottom + 8,
              transform: 'translateX(-50%)',
              fontFamily: FONT_MONO,
              fontSize: 11,
              fontWeight: 700,
              color: C.amber,
              background: 'rgba(0,0,0,0.6)',
              padding: '5px 14px',
              borderRadius: 4,
              border: `1px solid ${C.amber}44`,
              whiteSpace: 'nowrap',
            }}
          >
            KEC International — 7 NCEs, all under £50K
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Instruction cue ─── */}
      <AnimatePresence>
        {!hasStartedDragging && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              color: 'rgba(255,255,255,0.55)',
              textAlign: 'center',
              fontWeight: 500,
              lineHeight: 1.6,
            }}>
              Drag the timeline to see NCE submissions appear
              <div style={{
                marginTop: 6, fontSize: 20, opacity: 0.6,
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                →
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
