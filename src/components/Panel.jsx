import { useState, useEffect, useRef } from 'react';
import { C, rgb, FONT_MONO, FONT_SANS } from '../theme/tokens';
import { useViewport } from '../hooks/useViewport';

export default function Panel({ title, subtitle, accent = C.blue, delay = 0, active = false, onClick, clickable, children, style, onMouseEnter: onHoverProp, storyLabel, onStoryClick, badges }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const contentRef = useRef(null);
  const { width, height } = useViewport(contentRef);

  useEffect(() => {
    if (!active) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  return (
    <div
      className="panel-card"
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => { clickable && setHovered(true); onHoverProp && onHoverProp(); }}
      onMouseLeave={() => clickable && setHovered(false)}
      style={{
        background: C.sf,
        border: `1px solid ${hovered && clickable ? rgb(accent, 0.4) : C.bd}`,
        borderRadius: 12,
        padding: '14px 16px',
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? 'translateY(-2px)' : 'translateY(0)') : 'translateY(20px)',
        transition: 'opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 300ms cubic-bezier(0.22,1,0.36,1), border-color 200ms ease, box-shadow 200ms ease',
        cursor: clickable ? 'pointer' : 'default',
        flex: 1,
        minWidth: 0,
        boxShadow: hovered ? `0 4px 20px ${rgb(accent, 0.06)}` : 'none',
        ...style,
      }}
    >
      {/* Header row */}
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: subtitle ? 2 : 10 }}>
          <div style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            fontWeight: 600,
            color: rgb(accent, 0.7),
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {title}
          </div>
          <div style={{ flex: 1 }} />
          {/* Story entry button */}
          {storyLabel && (
            <button
              onClick={onStoryClick || undefined}
              style={{
                padding: '4px 10px',
                background: hovered ? rgb(accent, 0.1) : rgb(accent, 0.04),
                border: `1px solid ${hovered ? rgb(accent, 0.3) : rgb(accent, 0.12)}`,
                borderRadius: 5,
                color: hovered ? accent : rgb(accent, 0.6),
                fontSize: 9,
                fontFamily: FONT_MONO,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {storyLabel} →
            </button>
          )}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div className="panel-subtitle" style={{
          fontFamily: FONT_SANS,
          fontSize: 10,
          color: C.t3,
          marginBottom: badges ? 4 : 10,
        }}>
          {subtitle}
        </div>
      )}

      {/* Surface metric badges (#8) */}
      {badges && badges.length > 0 && (
        <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {badges.map((b, i) => (
            <span key={i} className="surface-metric-badge">
              {b.label}: {b.value}
            </span>
          ))}
        </div>
      )}

      <div ref={contentRef} className="panel-content" style={{ width: '100%' }}>
        {typeof children === 'function' ? children({ width, height }) : children}
      </div>
    </div>
  );
}
