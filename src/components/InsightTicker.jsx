import { useState, useEffect } from 'react';
import { C, FONT_SANS, FONT_MONO } from '../theme/tokens';

const LINES = [
  'Afcons at 25% variation — 2x portfolio average',
  '3 packages overspending with zero CEs raised',
  '12 Early Warnings without Risk Reduction Meetings',
  '£59K/day cost of inaction on stale EWs',
  '6-week transformer delay cascading to £24M',
  '£400K claim reducible to £220K via clause 63.7',
  '3 contractors behind programme with no EWs raised',
  '£90M budget gap recoverable — board pack ready',
];

export default function InsightTicker() {
  const [lineIdx, setLineIdx] = useState(0);
  const [phase, setPhase] = useState('in'); // 'in' | 'out'

  useEffect(() => {
    // Show for 3s, then dissolve out, then switch line and slide in
    const showTimer = setTimeout(() => setPhase('out'), 3000);
    const switchTimer = setTimeout(() => {
      setLineIdx(prev => (prev + 1) % LINES.length);
      setPhase('in');
    }, 3600); // 600ms for dissolve animation
    return () => { clearTimeout(showTimer); clearTimeout(switchTimer); };
  }, [lineIdx]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      overflow: 'hidden',
      height: 18,
    }}>
      <span style={{
        fontFamily: FONT_MONO,
        fontSize: 13,
        fontWeight: 700,
        color: C.teal,
        opacity: 0.8,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        textShadow: `0 0 12px ${C.teal}40`,
      }}>
        Enterprise Brain is monitoring
      </span>
      <span style={{
        fontFamily: FONT_SANS,
        fontSize: 13,
        fontWeight: 500,
        color: 'rgba(245,247,251,0.35)',
        marginLeft: 2,
        marginRight: 2,
      }}>
        —
      </span>
      <div style={{
        overflow: 'hidden',
        height: 20,
        position: 'relative',
        minWidth: 280,
      }}>
        <span
          key={lineIdx}
          style={{
            fontFamily: FONT_SANS,
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(245,247,251,0.7)',
            whiteSpace: 'nowrap',
            display: 'block',
            animation: phase === 'in'
              ? 'tickerSlideIn 500ms ease both'
              : 'tickerSlideOut 500ms ease both',
          }}
        >
          {LINES[lineIdx]}
        </span>
      </div>
      <style>{`
        @keyframes tickerSlideIn {
          from { transform: translateY(14px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes tickerSlideOut {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-14px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
