import { motion } from 'framer-motion';
import useScrollReveal from '../../hooks/useScrollReveal';
import MonthBlocks from './MonthBlocks';
import { C, FONT_SANS, FONT_MONO, rgb } from '../../theme/tokens';

export default function Beat4Twist({ afcons, ncc }) {
  const [ref, isRevealed] = useScrollReveal({ threshold: 0.3 });

  const maxValue = afcons.trend[afcons.trend.length - 1];

  const nccTrend = ncc.trend;
  const nccLast3 = [
    nccTrend[nccTrend.length - 3],
    nccTrend[nccTrend.length - 2],
    nccTrend[nccTrend.length - 1],
  ];

  return (
    <div ref={ref} style={{ padding: '80px 40px', maxWidth: 680, margin: '0 auto' }}>
      {/* Statement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isRevealed ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          textAlign: 'center', marginBottom: 10,
          fontSize: 22, fontStyle: 'italic', color: 'rgba(255,255,255,0.75)',
          fontFamily: FONT_SANS,
        }}
      >
        "And it's accelerating."
      </motion.div>

      {/* Sub-label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isRevealed ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{
          textAlign: 'center', marginBottom: 36,
          fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600,
          color: rgb(C.purple, 0.6), textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}
      >
        Afcons NCE accumulation — month by month
      </motion.div>

      {/* Month blocks */}
      <MonthBlocks
        cumulativeValues={afcons.trend}
        maxValue={maxValue}
        isRevealed={isRevealed}
      />

      {/* Cumulative label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isRevealed ? { opacity: 1 } : {}}
        transition={{ delay: 1.6, duration: 0.4 }}
        style={{
          textAlign: 'center',
          fontFamily: FONT_MONO, fontSize: 14, fontWeight: 600,
          color: rgb(C.red, 0.7), marginBottom: 36,
        }}
      >
        cumulative: £{afcons.nceVariation}M and climbing
      </motion.div>

      {/* NCC secondary reveal */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isRevealed ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 2.0, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderTop: `1px solid rgba(255,255,255,0.06)`,
          paddingTop: 28, textAlign: 'center',
        }}
      >
        <div style={{
          fontSize: 15, color: rgb(C.orange, 0.7), marginBottom: 14,
          fontFamily: FONT_SANS,
        }}>
          And there's a second story brewing...
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 14, flexWrap: 'wrap',
        }}>
          <span style={{
            fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.75)',
            fontFamily: FONT_SANS,
          }}>
            NCC Ltd
          </span>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 13, fontWeight: 500,
            color: rgb(C.orange, 0.8),
          }}>
            £{nccLast3[0]}M → £{nccLast3[1]}M → £{nccLast3[2]}M in last 3 months
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: 5,
            background: rgb(C.orange, 0.18),
            fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700,
            color: C.orange, textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Accelerating
          </span>
        </div>
      </motion.div>
    </div>
  );
}
