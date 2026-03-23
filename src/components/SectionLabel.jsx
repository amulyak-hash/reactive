import { useState, useEffect } from 'react';
import { C, FONT_MONO } from '../theme/tokens';

export default function SectionLabel({ text, delay = 0, active = false, accent = C.blue }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  return (
    <div className="section-label" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 20,
      marginBottom: 10,
      opacity: visible ? 1 : 0,
      transition: 'opacity 400ms ease',
    }}>
      <div style={{
        width: 3,
        height: 14,
        background: accent,
        borderRadius: 2,
      }} />
      <span style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        fontWeight: 600,
        color: C.t2,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        {text}
      </span>
    </div>
  );
}
