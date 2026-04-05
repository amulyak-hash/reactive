import { useState } from 'react';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';
import { ICONS } from './lensIcons';

export default function LensSelector({
  lenses,
  activeLens,
  onSelect,
  accent,
  orientation = 'horizontal',
  minHeight = 36,
}) {
  const [hovIdx, setHovIdx] = useState(null);
  const isVertical = orientation === 'vertical';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isVertical ? 'column' : 'row',
      alignItems: isVertical ? 'stretch' : 'center',
      gap: 4,
      padding: 4,
      width: '100%',
      minWidth: 0,
      background: rgb(C.bg, 0.36),
      borderRadius: 12,
      border: `1px solid ${rgb(C.bd, 0.42)}`,
      boxShadow: `inset 0 1px 0 ${rgb(C.t1, 0.03)}`,
      overflow: isVertical ? 'visible' : 'hidden',
      backdropFilter: 'blur(14px)',
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
              justifyContent: isVertical ? 'flex-start' : 'center',
              width: isVertical ? '100%' : 0,
              flex: isVertical ? '0 0 auto' : '1 1 0',
              minWidth: 0,
              minHeight,
              padding: isVertical ? '10px 14px' : '8px 14px',
              borderRadius: 10,
              border: 'none',
              background: isActive
                ? `linear-gradient(180deg, ${rgb(accent, 0.18)} 0%, ${rgb(accent, 0.08)} 100%)`
                : isHov
                  ? rgb(accent, 0.08)
                  : 'transparent',
              cursor: 'pointer',
              transition: 'transform .18s ease, background .18s ease, color .18s ease, box-shadow .18s ease',
              position: 'relative',
              boxShadow: isActive ? `0 10px 22px ${rgb(accent, 0.12)}` : 'none',
              '--accent-r': parseInt(accent.replace('#', '').substring(0, 2), 16),
              '--accent-g': parseInt(accent.replace('#', '').substring(2, 4), 16),
              '--accent-b': parseInt(accent.replace('#', '').substring(4, 6), 16),
              transform: isHov && !isActive ? 'translateY(-1px)' : 'translateY(0)',
            }}
          >
            {/* Active indicator line */}
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: isVertical ? 8 : 0,
                left: isVertical ? 0 : 10,
                top: isVertical ? 8 : 'auto',
                right: isVertical ? 'auto' : 10,
                width: isVertical ? 3 : 'auto',
                height: isVertical ? 'calc(100% - 16px)' : 3,
                borderRadius: isVertical ? 2 : 1,
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
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
