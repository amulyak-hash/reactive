import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';

const CONTRACTORS = [
  { name: 'Balfour Beatty', ews: 16, nces: 15, rate: 94, status: 'critical' },
  { name: 'Kier Civil', ews: 24, nces: 21, rate: 88, status: 'alert' },
  { name: 'Morgan Sindall', ews: 13, nces: 11, rate: 85, status: 'alert' },
  { name: 'Murphy', ews: 19, nces: 13, rate: 68, status: 'elevated' },
  { name: 'Skanska', ews: 21, nces: 11, rate: 52, status: 'normal' },
  { name: 'Galliford Try', ews: 18, nces: 8, rate: 44, status: 'normal' },
  { name: 'Amey', ews: 10, nces: 4, rate: 40, status: 'normal' },
  { name: 'VINCI', ews: 4, nces: 7, rate: null, status: 'silent', flag: '0 EW + 7 NCE' },
  { name: 'BAM Nuttall', ews: 0, nces: 5, rate: null, status: 'silent', flag: '0 EW + 5 NCE' },
];

const STATUS_CONFIG = {
  critical: { label: 'Critical — escalate', bg: 'rgba(240,96,96,0.1)', color: C.red, border: 'rgba(240,96,96,0.2)' },
  alert: { label: 'Alert >80%', bg: 'rgba(240,96,96,0.08)', color: C.red, border: 'rgba(240,96,96,0.15)' },
  elevated: { label: 'Elevated — monitor', bg: 'rgba(251,191,36,0.08)', color: C.amber, border: 'rgba(251,191,36,0.15)' },
  normal: { label: 'Normal', bg: 'rgba(52,211,153,0.06)', color: C.green, border: 'rgba(52,211,153,0.12)' },
  silent: { label: 'Silent bypass', bg: 'rgba(240,96,96,0.06)', color: '#c0926a', border: 'rgba(192,146,106,0.15)' },
};

// Benchmark: ~50% is "normal" conversion rate
const NORMAL_RATE = 50;

export default function ContractorDrilldown() {
  return (
    <div>
      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '140px 80px 80px 110px 140px 150px',
        gap: 0,
        padding: '10px 12px',
        borderRadius: '12px 12px 0 0',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: `1px solid ${C.line}`,
      }}>
        {['Contractor', 'EWs Raised', 'NCEs Raised', 'Conversion Rate', 'Rate vs Normal', 'Status'].map(h => (
          <div key={h} style={{
            fontFamily: FONT_MONO, fontSize: 9, fontWeight: 700,
            color: C.t4, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {CONTRACTORS.map((c, i) => {
        const cfg = STATUS_CONFIG[c.status];
        return (
          <div key={c.name} style={{
            display: 'grid',
            gridTemplateColumns: '140px 80px 80px 110px 140px 150px',
            gap: 0,
            padding: '12px 12px',
            borderBottom: i < CONTRACTORS.length - 1 ? `1px solid ${C.line}` : 'none',
            alignItems: 'center',
            transition: 'background 200ms ease',
            borderRadius: i === CONTRACTORS.length - 1 ? '0 0 12px 12px' : 0,
            cursor: 'default',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Name */}
            <div style={{
              fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.t1,
            }}>
              {c.name}
            </div>

            {/* EWs */}
            <div style={{
              fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600, color: C.t2,
            }}>
              {c.ews}
            </div>

            {/* NCEs */}
            <div style={{
              fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600, color: C.t2,
            }}>
              {c.nces}
            </div>

            {/* Conversion rate */}
            <div style={{
              fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700,
              color: c.rate === null ? cfg.color : c.rate > 80 ? C.red : c.rate > 60 ? C.amber : C.t2,
            }}>
              {c.rate !== null ? `${c.rate}%` : (
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700,
                  color: cfg.color,
                  padding: '2px 6px', borderRadius: 4,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                }}>
                  {c.flag}
                </span>
              )}
            </div>

            {/* Rate bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <RateBar rate={c.rate} status={c.status} nces={c.nces} ews={c.ews} />
            </div>

            {/* Status badge */}
            <div>
              <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 999,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600,
                color: cfg.color,
                whiteSpace: 'nowrap',
              }}>
                {cfg.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RateBar({ rate, status, nces, ews }) {
  const barW = 120;
  const barH = 10;

  if (status === 'silent') {
    // Show tiny EW bar + NCE dot for silent bypass
    const ewW = Math.max(2, (ews / 25) * barW);
    const nceW = Math.max(4, (nces / 25) * barW);
    return (
      <svg width={barW} height={barH + 4} style={{ display: 'block' }}>
        {/* Background */}
        <rect x={0} y={2} width={barW} height={barH} rx={5} fill="rgba(255,255,255,0.04)" />
        {/* EW portion (tiny) */}
        <rect x={0} y={2} width={ewW} height={barH} rx={5} fill={C.t4} opacity={0.4} />
        {/* NCE dot (red, showing bypass) */}
        <circle cx={ewW + 8} cy={7} r={4} fill={C.red} opacity={0.8} />
      </svg>
    );
  }

  const fillW = rate ? (rate / 100) * barW : 0;
  const normalW = (NORMAL_RATE / 100) * barW;

  let fillColor;
  if (rate > 80) fillColor = C.red;
  else if (rate > 60) fillColor = C.amber;
  else fillColor = C.green;

  return (
    <svg width={barW} height={barH + 4} style={{ display: 'block' }}>
      {/* Background */}
      <rect x={0} y={2} width={barW} height={barH} rx={5} fill="rgba(255,255,255,0.04)" />
      {/* Fill */}
      <rect x={0} y={2} width={fillW} height={barH} rx={5} fill={fillColor} opacity={0.7}>
        <animate attributeName="width" from="0" to={fillW} dur="0.8s" fill="freeze" />
      </rect>
      {/* Normal threshold marker */}
      <rect x={normalW} y={0} width={1.5} height={barH + 4} fill="rgba(255,255,255,0.15)" rx={1} />
    </svg>
  );
}
