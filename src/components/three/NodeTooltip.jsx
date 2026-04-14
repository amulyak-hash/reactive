import { Html } from '@react-three/drei';
import { useStore } from '../../store';
import { getEntityById, getEntityColor } from '../../data/entityGraph';
import { C } from '../../theme/tokens';

function formatValue(value) {
  if (value >= 1000) return `£${(value / 1000).toFixed(1)}M`;
  return `£${value}K`;
}

const TYPE_LABELS = {
  'contractor': 'Contractor',
  'early-warning': 'Early Warning',
  'nce': 'NCE',
  'package': 'Package',
  'hub': 'Programme',
};

export default function NodeTooltip({ positions }) {
  const hoveredEntity = useStore(s => s.hoveredEntity);
  const expandedEntity = useStore(s => s.expandedEntity);

  // Don't show tooltip for expanded entities (they show ExpandedPanel instead)
  if (!hoveredEntity || hoveredEntity === expandedEntity) return null;

  const entity = getEntityById(hoveredEntity);
  if (!entity) return null;

  const pos = positions[hoveredEntity];
  if (!pos) return null;

  const color = getEntityColor(entity);

  return (
    <Html
      position={[pos[0], pos[1] - 2.5, pos[2]]}
      center
      style={{ pointerEvents: 'none', userSelect: 'none' }}
      zIndexRange={[100, 0]}
    >
      <div style={{
        padding: '10px 16px',
        borderRadius: 12,
        background: 'rgba(10, 16, 29, 0.96)',
        border: `1px solid ${color}40`,
        boxShadow: `0 12px 32px rgba(0,0,0,0.5), 0 0 16px ${color}15`,
        fontFamily: "'Satoshi', sans-serif",
        minWidth: 180,
        maxWidth: 280,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
        }}>
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#f5f7fb',
          }}>
            {entity.label}
          </span>
          <span style={{
            fontSize: 8, fontWeight: 600, color: color,
            background: `${color}15`,
            padding: '2px 6px',
            borderRadius: 4,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {TYPE_LABELS[entity.type] || entity.type}
          </span>
        </div>

        <div style={{ fontSize: 11, color: 'rgba(245,247,251,0.55)', lineHeight: 1.4 }}>
          {entity.type === 'contractor' && `${entity.metrics.variationPct}% variation · ${entity.metrics.nceCount} NCEs`}
          {entity.type === 'early-warning' && `${entity.metrics.daysOpen} days open · ${entity.metrics.subject}`}
          {entity.type === 'nce' && (entity.subtitle || `${entity.metrics.clause} claim`)}
          {entity.type === 'package' && `${entity.metrics.overrunPct}% over plan · ${entity.metrics.code}`}
        </div>

        <div style={{
          marginTop: 6, paddingTop: 6,
          borderTop: `1px solid ${color}20`,
        }}>
          <span style={{
            fontSize: 14, fontWeight: 700, color: color,
            fontFamily: "'SFMono-Regular', monospace",
          }}>
            {formatValue(entity.value)}
          </span>
        </div>
      </div>
    </Html>
  );
}
