import { useState } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_MONO, FONT_SANS } from '../theme/tokens';

const LAYERS = [
  { key: 'thermal',   label: 'Thermal',   icon: '🌡', accent: C.red,    shortcut: '1' },
  { key: 'flow',      label: 'Flow',      icon: '〰', accent: C.cyan,   shortcut: '2' },
  { key: 'financial', label: 'Financial', icon: '₹',  accent: C.amber,  shortcut: '3' },
  { key: 'safety',    label: 'Safety',    icon: '⚠',  accent: C.orange, shortcut: '4' },
  { key: 'timeline',  label: 'Timeline',  icon: '◷',  accent: C.purple, shortcut: '5' },
];

export default function LayerToggleBar() {
  const activeLayers = useStore(s => s.activeLayers);
  const toggleLayer = useStore(s => s.toggleLayer);
  const story = useStore(s => s.story);

  // When panel is open, shift to left half and stay at bottom
  const panelOpen = !!story;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: panelOpen ? '30%' : '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      transition: 'left 400ms cubic-bezier(0.22, 1, 0.36, 1)',
      display: 'flex',
      gap: 6,
      padding: '6px 8px',
      background: `${C.bg}ee`,
      border: `1px solid ${C.bd}`,
      borderRadius: 14,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {LAYERS.map((layer) => {
        const active = activeLayers[layer.key];
        return (
          <LayerButton
            key={layer.key}
            layer={layer}
            active={active}
            onClick={() => toggleLayer(layer.key)}
          />
        );
      })}
    </div>
  );
}

function LayerButton({ layer, active, onClick }) {
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
        padding: '7px 14px',
        borderRadius: 10,
        background: active
          ? rgb(layer.accent, 0.15)
          : hovered ? rgb(C.sf, 0.8) : 'transparent',
        border: `1px solid ${active ? rgb(layer.accent, 0.35) : hovered ? C.bd : 'transparent'}`,
        color: active ? layer.accent : hovered ? C.t2 : C.t3,
        cursor: 'pointer',
        transition: 'all 180ms ease',
        fontFamily: FONT_SANS,
        fontSize: 11,
        fontWeight: active ? 600 : 400,
        whiteSpace: 'nowrap',
      }}
      title={`Toggle ${layer.label} layer (${layer.shortcut})`}
    >
      <span style={{ fontSize: 13 }}>{layer.icon}</span>
      <span>{layer.label}</span>
      <span style={{
        fontFamily: FONT_MONO,
        fontSize: 8,
        color: active ? rgb(layer.accent, 0.6) : C.t4,
        marginLeft: 2,
      }}>
        {layer.shortcut}
      </span>
    </button>
  );
}
