import { useState } from 'react';
import { motion } from 'framer-motion';
import useScrollReveal from '../../hooks/useScrollReveal';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';
import { C, FONT_SANS, FONT_MONO, rgb } from '../../theme/tokens';
import { CONTRACTOR_LOGOS } from './contractorLogos';

const EASE_OUT = [0.16, 1, 0.3, 1];

export default function Beat5Clarity({ afcons, lt, potentialSaving }) {
  const [ref, isRevealed] = useScrollReveal({ threshold: 0.3 });
  const [hoveredCard, setHoveredCard] = useState(null); // 'afcons' | 'lt' | null

  const afconsPct = useAnimatedCounter(25, 700, isRevealed, { decimals: 0, suffix: '%' });
  const ltPct = useAnimatedCounter(6, 700, isRevealed, { decimals: 0, suffix: '%' });
  const savingCounter = useAnimatedCounter(potentialSaving, 600, isRevealed, {
    decimals: 0, prefix: '£', suffix: 'M',
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
          fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600,
          color: rgb(C.blue, 0.6), textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>
          The proof that 25% isn't inevitable
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isRevealed ? { opacity: 1 } : {}}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{
          textAlign: 'center', marginBottom: 36,
          fontSize: 20, color: 'rgba(255,255,255,0.75)', fontFamily: FONT_SANS,
          fontWeight: 500,
        }}
      >
        Same project. Same conditions. Different outcomes.
      </motion.div>

      {/* Comparison cards */}
      <div style={{
        display: 'flex', gap: 20, maxWidth: 560, margin: '0 auto 36px',
        alignItems: 'stretch',
      }}>
        {/* Afcons card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isRevealed ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5, ease: EASE_OUT }}
          onMouseEnter={() => setHoveredCard('afcons')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            flex: 1, padding: 28, borderRadius: 16,
            border: `1px solid ${rgb(C.red, hoveredCard === 'afcons' ? 0.45 : 0.25)}`,
            background: rgb(C.red, hoveredCard === 'afcons' ? 0.08 : 0.05),
            boxShadow: hoveredCard === 'afcons' ? `0 0 30px ${rgb(C.red, 0.12)}` : 'none',
            transition: 'border-color 200ms ease, background 200ms ease, box-shadow 200ms ease',
            cursor: 'default',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
          }}>
            <img src={CONTRACTOR_LOGOS['Afcons Infra']} alt="" style={{
              height: 18, width: 'auto', objectFit: 'contain',
            }} />
            <span style={{
              fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500,
              color: hoveredCard === 'afcons' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)',
              transition: 'color 200ms ease',
            }}>
              Afcons Infra
            </span>
          </div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 44, fontWeight: 800,
            color: C.red, marginBottom: 12,
            textShadow: hoveredCard === 'afcons' ? `0 0 20px ${rgb(C.red, 0.3)}` : 'none',
            transition: 'text-shadow 200ms ease',
          }}>
            {afconsPct.displayValue}
          </div>
          <Details items={[
            `£${afcons.nceVariation}M NCE variation`,
            `${afcons.nceCount} NCEs in 7 months`,
            `£${afcons.originalValue}M original contract`,
          ]} isRevealed={isRevealed} delay={1.2} />
          <Badge label="Needs forensic review" color={C.red} isRevealed={isRevealed} delay={1.8} />
        </motion.div>

        {/* vs */}
        <div style={{
          display: 'flex', alignItems: 'center',
          fontSize: 16, color: 'rgba(255,255,255,0.25)', flexShrink: 0,
          fontFamily: FONT_SANS, fontWeight: 500,
        }}>
          vs
        </div>

        {/* L&T card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={isRevealed ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5, ease: EASE_OUT }}
          onMouseEnter={() => setHoveredCard('lt')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            flex: 1, padding: 28, borderRadius: 16,
            border: `1px solid ${rgb(C.green, hoveredCard === 'lt' ? 0.45 : 0.25)}`,
            background: rgb(C.green, hoveredCard === 'lt' ? 0.08 : 0.05),
            boxShadow: hoveredCard === 'lt' ? `0 0 30px ${rgb(C.green, 0.12)}` : 'none',
            transition: 'border-color 200ms ease, background 200ms ease, box-shadow 200ms ease',
            cursor: 'default',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
          }}>
            <img src={CONTRACTOR_LOGOS['L&T Construction']} alt="" style={{
              height: 18, width: 'auto', objectFit: 'contain',
            }} />
            <span style={{
              fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500,
              color: hoveredCard === 'lt' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)',
              transition: 'color 200ms ease',
            }}>
              L&T Construction
            </span>
          </div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 44, fontWeight: 800,
            color: C.green, marginBottom: 12,
            textShadow: hoveredCard === 'lt' ? `0 0 20px ${rgb(C.green, 0.3)}` : 'none',
            transition: 'text-shadow 200ms ease',
          }}>
            {ltPct.displayValue}
          </div>
          <Details items={[
            `£${lt.nceVariation}M NCE variation`,
            `${lt.nceCount} NCEs in 7 months`,
            `£${lt.originalValue}M original contract`,
          ]} isRevealed={isRevealed} delay={1.2} />
          <Badge label="The benchmark" color={C.green} isRevealed={isRevealed} delay={1.8} />
        </motion.div>
      </div>

      {/* Action line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isRevealed ? { opacity: 1 } : {}}
        transition={{ delay: 2.2, duration: 0.4 }}
        style={{
          textAlign: 'center', paddingTop: 28,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{
          fontSize: 17, color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.6, maxWidth: 440, margin: '0 auto',
          fontFamily: FONT_SANS, fontWeight: 500,
        }}>
          If Afcons operated at L&T's rate, the portfolio would save{' '}
          <span style={{
            color: C.green, fontWeight: 700,
            textShadow: hoveredCard === 'afcons'
              ? `0 0 20px ${rgb(C.green, 0.5)}`
              : `0 0 16px ${rgb(C.green, 0.35)}`,
            transition: 'text-shadow 200ms ease',
          }}>
            {savingCounter.displayValue}
          </span>
          . The variation isn't the market — it's management.
        </div>
      </motion.div>
    </div>
  );
}

function Details({ items, isRevealed, delay }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={isRevealed ? { opacity: 1 } : {}}
          transition={{ delay: delay + i * 0.08, duration: 0.3 }}
          style={{
            fontFamily: FONT_SANS, fontSize: 13,
            color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}

function Badge({ label, color, isRevealed, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isRevealed ? { opacity: 1 } : {}}
      transition={{ delay, duration: 0.3 }}
      style={{
        padding: '8px 12px', borderRadius: 8,
        background: rgb(color, 0.12),
        fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600,
        color: rgb(color, 0.8), textAlign: 'center',
      }}
    >
      {label}
    </motion.div>
  );
}
