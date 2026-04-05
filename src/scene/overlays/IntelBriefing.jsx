import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { C, rgb, FONT_MONO, FONT_SANS } from '../../theme/tokens';

// ─── HUD overlay only: header, timestamp, chain summary ───
// Cards are rendered in 3D space by IntelCards3D

export default function IntelBriefing() {
  const scanPhase = useStore(s => s.scanPhase);
  const [cardCount, setCardCount] = useState(0);
  const [fading, setFading] = useState(false);

  // Track card appearances (synced with IntelCards3D delays: 2s, 6s, 10s)
  useEffect(() => {
    if (scanPhase !== 'intel') return;
    const delays = [2.0, 6.0, 10.0];
    const timers = delays.map((d, i) =>
      setTimeout(() => setCardCount(i + 1), d * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [scanPhase]);

  useEffect(() => {
    if (scanPhase === 'scanning') setFading(true);
  }, [scanPhase]);

  if (scanPhase !== 'intel' && scanPhase !== 'scanning') return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 15,
      pointerEvents: 'none',
      opacity: fading ? 0 : 1,
      transition: 'opacity 2.5s ease-out',
    }}>
      {/* Top-left system header */}
      <div style={{
        position: 'absolute',
        top: 28,
        left: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: rgb(C.cyan, 0.4),
          letterSpacing: '0.2em',
        }}>
          TATA STEEL — JAMSHEDPUR WORKS
        </div>
        <div style={{
          fontFamily: FONT_SANS,
          fontSize: 15,
          fontWeight: 700,
          color: C.cyan,
          letterSpacing: '0.08em',
        }}>
          ENTERPRISE BRAIN
        </div>
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: C.t4,
          letterSpacing: '0.06em',
          marginTop: 2,
        }}>
          <TypingText text="Active causal chain detected..." delay={0.5} />
        </div>
      </div>

      {/* Top-right timestamp */}
      <div style={{
        position: 'absolute',
        top: 28,
        right: 32,
        textAlign: 'right',
      }}>
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: C.t4,
          letterSpacing: '0.1em',
        }}>
          SHIFT B — 06:00–14:00
        </div>
      </div>

      {/* Bottom-left — chain summary, appears after all 3 cards */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: cardCount >= 3 ? 1 : 0,
        transform: cardCount >= 3 ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 1s cubic-bezier(0.22, 1, 0.36, 1)',
      }}>
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 9,
          color: C.t4,
          letterSpacing: '0.12em',
        }}>
          COMPOUND CONFIDENCE
        </div>
        <ChainDots />
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 13,
          fontWeight: 700,
          color: C.amber,
          textShadow: `0 0 12px ${rgb(C.amber, 0.4)}`,
        }}>
          59%
        </div>
      </div>
    </div>
  );
}

// ─── Chain confidence dots ───

function ChainDots() {
  const nodes = [
    { label: 'Supplier', pct: 92 },
    { label: 'BF-3', pct: 87 },
    { label: 'CCM-3', pct: 74 },
    { label: 'Grade', pct: 59 },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {nodes.map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 9,
            color: n.pct < 70 ? C.amber : C.t3,
          }}>
            {n.pct}%
          </div>
          {i < nodes.length - 1 && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.t4 }}>→</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Typing text effect ───

function TypingText({ text, delay = 0 }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(start);
  }, [text, delay]);

  return (
    <>
      {displayed}
      <span style={{ opacity: 0.5, animation: 'blink 1s step-end infinite' }}>_</span>
    </>
  );
}
