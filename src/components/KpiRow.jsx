import { C, FONT_SANS, FONT_MONO } from '../theme/tokens';

const KPIS = [
  { label: 'Silent Overruns', value: '3 packages', detail: 'burning budget', color: C.red },
  { label: 'Budget Risk', value: '£2.4M', detail: 'undetected exposure', color: C.red },
  { label: 'Open Early Warnings', value: '12 EWs', detail: '19 days avg age', color: C.amber },
  { label: 'True Delay Cost', value: '£780K/day', detail: '4.3x visible cost', color: C.orange },
  { label: 'Cascade Exposure', value: '£24M', detail: 'from 6-wk delay', color: C.purple },
];

export default function KpiRow() {
  return (
    <div style={{
      display: 'flex', gap: 12,
      padding: '0 clamp(18px, 2vw, 32px)',
    }}>
      {KPIS.map((kpi, i) => (
        <div key={i} style={{
          flex: 1,
          padding: '14px 16px',
          borderRadius: 18,
          border: `1px solid ${C.line}`,
          background: 'linear-gradient(180deg, rgba(12, 20, 32, 0.96), rgba(17, 27, 40, 0.96))',
          animation: `card-enter 300ms ease-out ${100 + i * 60}ms both`,
        }}>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600,
            color: C.t3, letterSpacing: '0.04em', textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            {kpi.label}
          </div>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 20, fontWeight: 700,
            color: kpi.color, marginBottom: 2, letterSpacing: '-0.02em',
          }}>
            {kpi.value}
          </div>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500,
            color: C.t3,
          }}>
            {kpi.detail}
          </div>
        </div>
      ))}
    </div>
  );
}
