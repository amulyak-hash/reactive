import { Html } from '@react-three/drei';
import { C, FONT_SANS, FONT_MONO } from '../../theme/tokens';

export default function ZoneLabel({ position, label, code, status, accent, onClick }) {
  const isAlert = status === 'alert';

  return (
    <Html
      position={position}
      center
      distanceFactor={18}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        onClick={onClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'transform 200ms ease, opacity 200ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {/* Status dot */}
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isAlert ? accent : C.green,
          boxShadow: isAlert ? `0 0 12px ${accent}` : 'none',
          animation: isAlert ? 'pulse-dot 2s ease infinite' : 'none',
        }} />

        {/* Code badge */}
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          fontWeight: 600,
          color: accent,
          background: `${C.bg}dd`,
          border: `1px solid ${accent}44`,
          borderRadius: 6,
          padding: '3px 10px',
          letterSpacing: '0.05em',
          backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap',
        }}>
          {code}
        </div>

        {/* Label */}
        <div style={{
          fontFamily: FONT_SANS,
          fontSize: 10,
          color: C.t3,
          whiteSpace: 'nowrap',
          background: `${C.bg}aa`,
          padding: '1px 6px',
          borderRadius: 3,
        }}>
          {label}
        </div>
      </div>
    </Html>
  );
}
