import { useRef, useCallback } from 'react';
import { C, FONT_MONO, FONT_SANS } from '../../theme/tokens';

const HELPER_TEXTS = [
  'Drag forward to watch NCE submissions appear over time.',
  'Some contractors submit one large claim. Others keep coming back...',
  'Notice who keeps submitting — and how much each time.',
  'The pattern is clear. Click a logo to see their full breakdown →',
];

export default function TimeScrubber({ value, onChange, months }) {
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const updateFromPointer = useCallback((clientX) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const raw = (clientX - rect.left) / rect.width;
    onChange(Math.max(0, Math.min(1, raw)));
  }, [onChange]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  }, [updateFromPointer]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current) return;
    updateFromPointer(e.clientX);
  }, [updateFromPointer]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const currentMonth = Math.min(Math.floor(value * months.length), months.length - 1);
  const helperText = HELPER_TEXTS[currentMonth];

  return (
    <div style={{ padding: '20px 0 8px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)',
        }}>
          NCE Submissions Across All Contractors
        </div>
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: `${C.amber}b3`,
        }}>
          Month {currentMonth + 1} of {months.length}
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          height: 6,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 99,
          cursor: 'pointer',
          touchAction: 'none',
        }}
      >
        {/* Fill */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${value * 100}%`,
          background: `linear-gradient(90deg, ${C.amber}4d, ${C.amber}80)`,
          borderRadius: 99,
        }} />

        {/* Thumb */}
        <div style={{
          position: 'absolute',
          left: `${value * 100}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 14,
          height: 14,
          borderRadius: 99,
          background: C.amber,
          boxShadow: `0 0 ${8 + value * 12}px ${C.amber}66`,
        }} />
      </div>

      {/* Month labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 6,
        fontFamily: FONT_MONO,
        fontSize: 8,
        color: 'rgba(255,255,255,0.2)',
      }}>
        {months.map((m, i) => (
          <span
            key={m}
            style={{
              color: i <= currentMonth ? `${C.amber}80` : 'rgba(255,255,255,0.2)',
              transition: 'color 200ms ease',
            }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* Helper text — contextual guidance */}
      <div style={{
        marginTop: 8,
        fontFamily: FONT_SANS,
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
        fontStyle: 'italic',
        minHeight: 16,
        transition: 'opacity 300ms ease',
        opacity: value > 0.02 ? 1 : 0,
      }}>
        {helperText}
      </div>
    </div>
  );
}
