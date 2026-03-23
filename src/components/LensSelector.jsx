import { useState } from 'react';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';
import { ICONS } from './lensIcons';

export default function LensSelector({ lenses, activeLens, onSelect, accent }) {
  const [hovIdx, setHovIdx] = useState(null);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: 3,
      background: rgb(C.bg, 0.6),
      borderRadius: 10,
      border: `1px solid ${rgb(C.bd, 0.5)}`,
    }}>
      {lenses.map((lens, i) => {
        const isActive = i === activeLens;
        const isHov = i === hovIdx;
        return (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onSelect(i); }}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: isActive
                ? rgb(accent, 0.15)
                : isHov
                  ? rgb(accent, 0.06)
                  : 'transparent',
              cursor: 'pointer',
              transition: 'all .2s ease',
              position: 'relative',
              '--accent-r': parseInt(accent.replace('#', '').substring(0, 2), 16),
              '--accent-g': parseInt(accent.replace('#', '').substring(2, 4), 16),
              '--accent-b': parseInt(accent.replace('#', '').substring(4, 6), 16),
            }}
          >
            {/* Active indicator line */}
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 10,
                right: 10,
                height: 2,
                borderRadius: 1,
                background: accent,
                animation: 'fadeIn 0.3s ease',
              }} />
            )}
            <span style={{
              fontSize: 13,
              color: isActive ? accent : C.t3,
              transition: 'color .2s ease',
              lineHeight: 1,
            }}>
              {ICONS[lens.icon] || '●'}
            </span>
            <span style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? C.t1 : isHov ? C.t2 : C.t3,
              transition: 'color .2s ease',
              whiteSpace: 'nowrap',
            }}>
              {lens.name}
            </span>
            {isActive && (
              <span style={{
                fontFamily: FONT_MONO,
                fontSize: 8,
                color: rgb(accent, 0.6),
                fontWeight: 600,
              }}>
                {lens.stories?.length || 0}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
