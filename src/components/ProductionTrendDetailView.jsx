import { useMemo } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../theme/tokens';
import { PRODUCTION_HOURS, PRODUCTION_EXPECTED, PRODUCTION_ACTUAL } from '../data/tataSteel';

function getProdTrendSelectionDetail(selectedHitZone, renderedLens) {
  if (!selectedHitZone) return null;

  const { id, label, color } = selectedHitZone;

  if (renderedLens === 0 && id?.startsWith('seg-')) {
    const segIndex = Number(id.replace('seg-', ''));
    const hour = PRODUCTION_HOURS[segIndex];
    const expected = PRODUCTION_EXPECTED[segIndex];
    const actual = PRODUCTION_ACTUAL[segIndex];

    if (hour != null && expected != null && actual != null) {
      const delta = actual - expected;
      const deltaPct = (delta / expected) * 100;
      const isNegative = delta < 0;
      const varianceText = `${isNegative ? '' : '+'}${deltaPct.toFixed(1)}%`;
      const tonsText = `${actual.toFixed(1)} actual vs ${expected.toFixed(1)} target`;
      const severityLabel =
        hour <= 10
          ? 'Stable output'
          : hour === 11
            ? 'First deviation'
            : hour <= 15
              ? 'Widening shortfall'
              : 'Post-shift impact';

      return {
        title: `${hour}:00 hitzone`,
        body: `${severityLabel}. ${tonsText}. Variance ${varianceText}.`,
        tone: color || C.blue,
        metrics: [
          { label: 'Observed output', value: `${actual.toFixed(1)} actual`, tone: color || C.blue },
          { label: 'Context', value: `${varianceText} vs target`, tone: C.t2 },
          { label: 'Window', value: `${hour}:00`, tone: C.t4 },
        ],
      };
    }
  }

  return {
    title: label,
    body: `${selectedHitZone.value}. ${selectedHitZone.sublabel}.`,
    tone: color || C.blue,
    metrics: [
      { label: 'Observed value', value: selectedHitZone.value || 'N/A', tone: color || C.blue },
      { label: 'Context', value: selectedHitZone.sublabel || 'Selected hitzone', tone: C.t2 },
      { label: 'Lens', value: renderedLens === 0 ? 'Shift Replay' : renderedLens === 1 ? 'Pressure Map' : 'Gap Anatomy', tone: C.t4 },
    ],
  };
}

export default function ProductionTrendDetailView() {
  const detail = useStore(s => s.storyDetail);
  const exitStoryDetail = useStore(s => s.exitStoryDetail);

  const insight = useMemo(() => getProdTrendSelectionDetail(detail, detail?.lens ?? 0), [detail]);

  if (!detail || !insight) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(circle at 18% 0%, ${rgb(C.blue, 0.08)} 0%, transparent 24%), radial-gradient(circle at 88% 8%, ${rgb(C.green, 0.06)} 0%, transparent 20%), ${C.bg}`,
      color: C.t1,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        height: 64,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: `1px solid ${rgb(C.bd, 0.4)}`,
        background: `linear-gradient(to bottom, ${rgb(C.bgL, 0.82)}, ${rgb(C.bg, 0.9)})`,
        backdropFilter: 'blur(16px)',
      }}>
        <button onClick={exitStoryDetail} style={{
          padding: '8px 12px',
          background: rgb(C.sf, 0.42),
          border: `1px solid ${rgb(C.bd, 0.5)}`,
          borderRadius: 10,
          color: C.t3,
          fontSize: 11,
          cursor: 'pointer',
          fontFamily: FONT_SANS,
          fontWeight: 500,
        }}>
          ← Back
        </button>
        <div style={{ width: 1, height: 16, background: rgb(C.bd, 0.4) }} />
        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT_SANS, color: C.t1 }}>
          Production Trend
        </span>
      </div>

      <div style={{
        height: 30,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: `1px solid ${rgb(C.bd, 0.22)}`,
        background: rgb(C.bg, 0.22),
      }}>
        <button
          onClick={exitStoryDetail}
          style={{
            fontFamily: FONT_SANS,
            fontSize: 12,
            color: C.t2,
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          Production Trend
        </button>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.t4 }}>&gt;</span>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.t1 }}>{detail.label}</span>
      </div>

      <div style={{
        flex: 1,
        padding: '28px 24px 32px',
        overflow: 'auto',
      }}>
        <div style={{
          maxWidth: 980,
          margin: '0 auto',
          borderRadius: 30,
          border: `1px solid ${rgb(insight.tone, 0.24)}`,
          background: `linear-gradient(180deg, ${rgb(insight.tone, 0.12)} 0%, ${rgb(C.bgL, 0.92)} 24%, ${rgb(C.bg, 0.98)} 100%)`,
          boxShadow: `0 30px 80px ${rgb('#000000', 0.24)}`,
          padding: '34px 34px 38px',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: rgb(insight.tone, 0.92),
            }}>
              Selected hitzone
            </div>
            <div style={{
              fontFamily: FONT_SERIF,
              fontSize: 42,
              lineHeight: 0.98,
              letterSpacing: '-0.04em',
              color: C.t1,
            }}>
              {insight.title}
            </div>
            <div style={{
              fontFamily: FONT_SANS,
              fontSize: 16,
              lineHeight: 1.75,
              color: rgb(C.t2, 0.95),
            }}>
              {insight.body}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
          }}>
            {insight.metrics.map((metric) => (
              <div key={`${metric.label}-${metric.value}`} style={{
                padding: '18px 18px 20px',
                borderRadius: 20,
                border: `1px solid ${rgb(metric.tone, 0.18)}`,
                background: `linear-gradient(180deg, ${rgb(metric.tone, 0.1)} 0%, ${rgb(C.sf, 0.5)} 100%)`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <div style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: rgb(metric.tone, 0.82),
                }}>
                  {metric.label}
                </div>
                <div style={{
                  fontFamily: FONT_SANS,
                  fontSize: 18,
                  lineHeight: 1.35,
                  color: C.t1,
                }}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
