import { useState } from 'react';
import { useStore } from '../../store';
import { CARD_REGISTRY } from '../../data/tataSteel';
import { C, rgb, FONT_SANS, FONT_MONO } from '../../theme/tokens';

// System-wide cards (not zone-specific) — shown at orbit zoom level
const SYSTEM_CARDS = [
  'downtime', 'prod_trend', 'machine_util', 'defect_rate', 'supplier',
  'plant_perf', 'factory_map', 'output_line', 'fault_count', 'material_dep',
];

function CardChip({ cardId, card, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 10,
        background: hovered ? rgb(card.accent, 0.1) : `${C.bg}dd`,
        border: `1px solid ${hovered ? rgb(card.accent, 0.3) : C.bd}`,
        color: hovered ? card.accent : C.t2,
        cursor: 'pointer',
        transition: 'all 180ms ease',
        fontFamily: FONT_SANS,
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: card.accent,
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 180ms ease',
      }} />
      {card.label}
    </button>
  );
}

export default function OrbitCardRing() {
  const zoomLevel = useStore(s => s.zoomLevel);
  const enterStory = useStore(s => s.enterStory);
  const story = useStore(s => s.story);

  // Only show at orbit level and when no story is active
  const visible = zoomLevel === 'orbit' && !story;

  return (
    <div style={{
      position: 'fixed',
      bottom: 70,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 80,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 6,
      maxWidth: '80vw',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity 400ms ease',
    }}>
      <div style={{
        width: '100%',
        textAlign: 'center',
        fontFamily: FONT_MONO,
        fontSize: 9,
        color: C.t4,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: 4,
      }}>
        System Intelligence
      </div>

      {SYSTEM_CARDS.map(id => {
        const card = CARD_REGISTRY[id];
        if (!card) return null;

        return (
          <CardChip
            key={id}
            cardId={id}
            card={card}
            onClick={() => enterStory(id)}
          />
        );
      })}
    </div>
  );
}
