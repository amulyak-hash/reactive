import { useState, useCallback } from 'react';
import { useStore } from '../store';
import { CARD_REGISTRY } from '../data/tataSteel';
import { ZONE_PRESETS } from '../scene/utils/cameraPresets';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';

const LAYERS = [
  { key: 'thermal',   label: 'Thermal',   icon: '🌡', accent: C.red },
  { key: 'flow',      label: 'Flow',      icon: '〰', accent: C.cyan },
  { key: 'financial', label: 'Financial', icon: '₹',  accent: C.amber },
  { key: 'safety',    label: 'Safety',    icon: '⚠',  accent: C.orange },
  { key: 'timeline',  label: 'Timeline',  icon: '◷',  accent: C.purple },
];

const SYSTEM_CARDS = [
  'downtime', 'prod_trend', 'machine_util', 'defect_rate', 'supplier',
  'plant_perf', 'factory_map', 'output_line', 'fault_count', 'material_dep',
];
const ZONE_CARDS = ['bf', 'sms', 'cc', 'rm', 'ql'];

export default function LayerOrb() {
  const [expanded, setExpanded] = useState(false);
  const activeLayers = useStore(s => s.activeLayers);
  const toggleLayer = useStore(s => s.toggleLayer);
  const mode = useStore(s => s.mode);
  const setMode = useStore(s => s.setMode);
  const story = useStore(s => s.story);
  const enterStory = useStore(s => s.enterStory);
  const flyTo = useStore(s => s.flyTo);

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  const handleCardClick = useCallback((id) => {
    if (ZONE_CARDS.includes(id) && ZONE_PRESETS[id]) flyTo(ZONE_PRESETS[id]);
    enterStory(id);
    setExpanded(false);
  }, [flyTo, enterStory]);

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      left: 16,
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Main orb button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="liquid-glass-strong"
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          borderColor: expanded ? 'rgba(34, 211, 238, 0.25)' : undefined,
          color: expanded ? C.cyan : C.t2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontFamily: FONT_SANS,
          transition: 'all 200ms ease',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        ◎
        {/* Active layer count badge */}
        {activeCount > 0 && !expanded && (
          <div style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: C.cyan,
            color: C.bg,
            fontSize: 9,
            fontWeight: 700,
            fontFamily: FONT_MONO,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {activeCount}
          </div>
        )}
      </button>

      {/* Expanded menu */}
      {expanded && (
        <div
          className="liquid-glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            borderRadius: 16,
            padding: '8px 6px',
            animation: 'fadeIn 200ms ease both',
          }}
        >
          {/* Layer toggles */}
          {LAYERS.map((layer) => {
            const active = activeLayers[layer.key];
            return (
              <button
                key={layer.key}
                onClick={() => toggleLayer(layer.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: active ? rgb(layer.accent, 0.12) : 'transparent',
                  border: `1px solid ${active ? rgb(layer.accent, 0.25) : 'transparent'}`,
                  color: active ? layer.accent : C.t3,
                  cursor: 'pointer',
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap',
                  minWidth: 120,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{layer.icon}</span>
                <span style={{ flex: 1 }}>{layer.label}</span>
                <span style={{
                  fontFamily: FONT_MONO,
                  fontSize: 8,
                  color: C.t4,
                }}>{LAYERS.indexOf(layer) + 1}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div style={{
            height: 1,
            background: C.bd,
            margin: '4px 8px',
          }} />

          {/* 2D Dashboard toggle */}
          <button
            onClick={() => setMode(mode === '3d' ? '2d' : '3d')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid transparent',
              color: C.t3,
              cursor: 'pointer',
              fontFamily: FONT_SANS,
              fontSize: 11,
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>◫</span>
            <span style={{ flex: 1 }}>
              {mode === '3d' ? '2D Dashboard' : '3D Factory'}
            </span>
          </button>

          {/* Divider */}
          <div style={{ height: 1, background: C.bd, margin: '4px 8px' }} />

          {/* System cards */}
          <div style={{
            fontFamily: FONT_MONO,
            fontSize: 8,
            color: C.t4,
            letterSpacing: '0.12em',
            padding: '2px 12px',
          }}>
            INTELLIGENCE
          </div>
          {SYSTEM_CARDS.map(id => {
            const card = CARD_REGISTRY[id];
            if (!card) return null;
            return (
              <button
                key={id}
                onClick={() => handleCardClick(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 12px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: C.t3,
                  cursor: 'pointer',
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap',
                  minWidth: 120,
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: card.accent, opacity: 0.6,
                }} />
                <span style={{ flex: 1 }}>{card.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
