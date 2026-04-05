import { Html } from '@react-three/drei';
import { ZONES } from '../../data/tataSteel';
import { C, rgb, FONT_MONO, FONT_SANS } from '../../theme/tokens';

/**
 * FinancialLayer — floating ₹ billboards at each zone
 * showing financial exposure proportional to risk.
 */

// Financial exposure data per zone (in Cr)
const FINANCIAL_DATA = {
  bf:  { value: '₹4.2 Cr', risk: 'high', detail: 'Material variance → grade risk' },
  sms: { value: '₹0.8 Cr', risk: 'low', detail: 'Within operating margin' },
  cc:  { value: '₹1.8 Cr', risk: 'high', detail: 'Casting deviation → rework' },
  rm:  { value: '₹0.6 Cr', risk: 'low', detail: 'Yield stable at 97.1%' },
  ql:  { value: '₹0.7 Cr', risk: 'medium', detail: 'Quality holds pending' },
};

function FinancialBillboard({ position, data, zoneCode }) {
  const isHigh = data.risk === 'high';
  const accent = isHigh ? C.red : data.risk === 'medium' ? C.amber : C.green;

  return (
    <Html
      position={[position[0], position[1] + 5, position[2]]}
      center
      distanceFactor={14}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        animation: 'surfaceRise 500ms ease both',
      }}>
        {/* Value */}
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: isHigh ? 16 : 12,
          fontWeight: 700,
          color: accent,
          textShadow: isHigh ? `0 0 12px ${accent}` : 'none',
          background: `${C.bg}dd`,
          padding: '4px 12px',
          borderRadius: 8,
          border: `1px solid ${rgb(accent, 0.3)}`,
          backdropFilter: 'blur(8px)',
        }}>
          {data.value}
        </div>

        {/* Detail */}
        <div style={{
          fontFamily: FONT_SANS,
          fontSize: 9,
          color: C.t3,
          background: `${C.bg}bb`,
          padding: '2px 8px',
          borderRadius: 4,
          maxWidth: 140,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          {data.detail}
        </div>
      </div>
    </Html>
  );
}

export default function FinancialLayer({ zonePositions }) {
  return (
    <group>
      {ZONES.map(zone => {
        const pos = zonePositions[zone.id];
        const data = FINANCIAL_DATA[zone.id];
        if (!pos || !data) return null;

        return (
          <FinancialBillboard
            key={zone.id}
            position={pos}
            data={data}
            zoneCode={zone.code}
          />
        );
      })}
    </group>
  );
}
