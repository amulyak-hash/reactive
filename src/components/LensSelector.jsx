import { useState } from 'react';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';
import { ICONS } from './lensIcons';

export default function LensSelector({ lenses, activeLens, onSelect, accent }) {
  const [hovIdx, setHovIdx] = useState(null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
      {lenses.map((lens, i) => {
        const isActive = i === activeLens;
        const isHov = i === hovIdx;
        return (
          <div
            key={i}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(i); }}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: `1.5px solid ${isActive ? rgb(accent, .5) : isHov ? rgb(accent, .25) : C.bd}`,
                background: isActive ? rgb(accent, .15) : isHov ? rgb(accent, .06) : C.sf,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                color: isActive ? accent : C.t3,
                transition: 'all .2s ease',
                animation: isActive ? 'lensPulse 2.5s ease-in-out infinite' : 'none',
                '--accent-r': parseInt(accent.replace('#', '').substring(0, 2), 16),
                '--accent-g': parseInt(accent.replace('#', '').substring(2, 4), 16),
                '--accent-b': parseInt(accent.replace('#', '').substring(4, 6), 16),
                padding: 0,
              }}
            >
              {ICONS[lens.icon] || '●'}
            </button>
            {/* Tooltip */}
            {isHov && (
              <div style={{
                position: 'absolute',
                top: 34,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                padding: '3px 8px',
                borderRadius: 4,
                background: C.bgL,
                border: `1px solid ${C.bd}`,
                fontSize: 9,
                fontFamily: FONT_SANS,
                fontWeight: 600,
                color: C.t2,
                zIndex: 20,
                pointerEvents: 'none',
              }}>
                {lens.name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
