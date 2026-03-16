import { useState, useEffect, useRef } from 'react';
import { C, rgb, FONT_MONO } from '../theme/tokens';
import { useViewport } from '../hooks/useViewport';

export default function Panel({ title, accent = C.blue, delay = 0, active = false, onClick, clickable, children, style, onMouseEnter: onHoverProp }) {
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
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => { clickable && setHovered(true); onHoverProp && onHoverProp(); }}
      onMouseLeave={() => clickable && setHovered(false)}
      style={{
        background: C.sf,
        border: `1px solid ${hovered && clickable ? rgb(accent, 0.4) : C.bd}`,
        borderRadius: 12,
        padding: '14px 16px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1), border-color 200ms ease',
        cursor: clickable ? 'pointer' : 'default',
        flex: 1,
        minWidth: 0,
        ...style,
      }}
    >
      {title && (
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          fontWeight: 600,
          color: rgb(accent, 0.7),
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 10,
        }}>
          {title}
        </div>
      )}
      <div ref={contentRef} style={{ width: '100%' }}>
        {typeof children === 'function' ? children({ width, height }) : children}
      </div>
    </div>
  );
}
