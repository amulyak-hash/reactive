import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';
import { NARRATIVES, ZONES, CAUSAL_CHAIN, STORIES } from '../data/tataSteel';
import NarrativeBlock from './NarrativeBlock';
import SectionLabel from './SectionLabel';
import Breadcrumb from './Breadcrumb';

// Simulated trend data per zone
const ZONE_TRENDS = {
  bf:  { direction: 'down', delta: '−12°C', label: 'below target' },
  sms: { direction: 'stable', delta: '±0.01%', label: 'nominal' },
  cc:  { direction: 'down', delta: '−15%', label: 'speed reduced' },
  rm:  { direction: 'up', delta: '+2.1%', label: 'improving' },
  ql:  { direction: 'stable', delta: '0.8/1K', label: 'within spec' },
};

export default function ZoneView() {
  const ready = useStore(s => s.zonesReady);
  const goBack = useStore(s => s.goBack);
  const enterStory = useStore(s => s.enterStory);
  const setAIContext = useStore(s => s.setAIContext);

  // Sort: alerts first, then ok
  const sortedZones = [...ZONES].sort((a, b) => {
    if (a.status === 'alert' && b.status !== 'alert') return -1;
    if (a.status !== 'alert' && b.status === 'alert') return 1;
    return 0;
  });

  const alertZones = sortedZones.filter(z => z.status === 'alert');
  const okZones = sortedZones.filter(z => z.status !== 'alert');

  return (
    <div style={{ padding: '0 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          backLabel="Plant B"
          onBack={() => goBack('plantB')}
          items={['Overview', 'Plant B', 'Line 3 · Production Zones']}
          current="Line 3 · Production Zones"
        />
      </div>

      {/* AI Narrative */}
      <NarrativeBlock
        text={NARRATIVES.line3}
        accentColor={C.cyan}
        label="AI ANALYSIS · LINE 3"
        active={ready}
      />

      {/* Section: Production Flow */}
      <SectionLabel
        text="Production Flow · BF → SMS → CCM → HSM → QC"
        delay={400}
        active={ready}
        accent={C.cyan}
      />

      {/* Alert zones first */}
      {alertZones.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 8, color: C.red,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.red, animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
            Requires Attention
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alertZones.map((zone, i) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                trend={ZONE_TRENDS[zone.id]}
                delay={600 + i * 120}
                active={ready}
                onExplore={() => enterStory(zone.id)}
                onHover={() => setAIContext({ type: 'zone', id: zone.id, layer: 'zones', label: zone.label, accent: zone.accent })}
              />
            ))}
          </div>
        </div>
      )}

      {/* OK zones */}
      {okZones.length > 0 && (
        <div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 8, color: C.green,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 8, marginTop: alertZones.length > 0 ? 8 : 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />
            Operating Normal
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {okZones.map((zone, i) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                trend={ZONE_TRENDS[zone.id]}
                delay={600 + alertZones.length * 120 + i * 120}
                active={ready}
                onExplore={() => enterStory(zone.id)}
                onHover={() => setAIContext({ type: 'zone', id: zone.id, layer: 'zones', label: zone.label, accent: zone.accent })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${rgb(C.bd, 0.4)}, transparent)`, margin: '32px 0' }} />

      {/* Causal Chain Summary */}
      <CausalChainBlock delay={600 + ZONES.length * 120 + 200} active={ready} />
    </div>
  );
}

function ZoneCard({ zone, trend, delay, active, onExplore, onHover }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isAlert = zone.status === 'alert';

  useEffect(() => {
    if (!active) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  const trendColor = trend?.direction === 'down' ? C.red : trend?.direction === 'up' ? C.green : C.t3;
  const trendArrow = trend?.direction === 'down' ? '↓' : trend?.direction === 'up' ? '↑' : '→';

  return (
    <div
      onClick={onExplore}
      onMouseEnter={() => { setHovered(true); onHover(); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? rgb(zone.accent, 0.03) : C.sf,
        border: `1px solid ${hovered ? rgb(zone.accent, 0.4) : C.bd}`,
        borderRadius: 12,
        padding: '16px 18px',
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? 'translateY(-2px)' : 'translateY(0)') : 'translateY(16px)',
        transition: 'opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 300ms cubic-bezier(0.22,1,0.36,1), border-color .2s ease, background .2s ease, box-shadow .2s ease',
        boxShadow: hovered ? `0 4px 16px ${rgb(zone.accent, 0.06)}` : 'none',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {/* Status dot */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: isAlert ? C.red : C.green,
          animation: isAlert ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }} />

        {/* Zone label */}
        <span style={{
          fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: C.t1,
        }}>
          {zone.label}
        </span>

        {/* Code badge */}
        <span style={{
          fontFamily: FONT_MONO, fontSize: 8, fontWeight: 600,
          background: rgb(zone.accent, 0.1), color: zone.accent,
          padding: '2px 6px', borderRadius: 4,
          border: `1px solid ${rgb(zone.accent, 0.15)}`,
        }}>
          {zone.code}
        </span>

        <div style={{ flex: 1 }} />

        {/* Trend indicator */}
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: trendColor }}>
              {trendArrow}
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600, color: trendColor }}>
              {trend.delta}
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.t4 }}>
              {trend.label}
            </span>
          </div>
        )}

        {/* Metric value */}
        <span style={{
          fontFamily: FONT_MONO, fontSize: 22, fontWeight: 800,
          color: isAlert ? zone.accent : C.t1,
          lineHeight: 1,
        }}>
          {zone.metric}
        </span>

        {/* Explore arrow */}
        <span style={{
          fontFamily: FONT_SANS, fontSize: 16,
          color: hovered ? zone.accent : C.t4,
          transition: 'color .2s ease, transform .2s ease',
          transform: hovered ? 'translateX(2px)' : 'none',
          marginLeft: 4,
        }}>
          →
        </span>
      </div>

      {/* Description */}
      <div style={{
        fontFamily: FONT_SANS, fontSize: 10, color: C.t3,
        marginTop: 6, paddingLeft: 18, lineHeight: 1.4,
      }}>
        {zone.description}
      </div>
    </div>
  );
}

function CausalChainBlock({ delay, active }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  return (
    <div style={{
      background: rgb(C.orange, 0.04),
      border: `1px solid ${rgb(C.orange, 0.15)}`,
      borderRadius: 12,
      padding: '16px 20px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1)',
    }}>
      {/* Tag */}
      <div style={{
        fontFamily: FONT_MONO, fontSize: 9, color: rgb(C.orange, 0.6),
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 14,
      }}>
        ACTIVE CAUSAL CHAIN
      </div>

      {/* Chain nodes */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, flexWrap: 'wrap', marginBottom: 14,
      }}>
        {CAUSAL_CHAIN.map((node, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, fontWeight: 700, color: C.cyan }}>
                  {CAUSAL_CHAIN[i - 1].confidence}
                </span>
                <span style={{ color: C.t4, fontSize: 12 }}>→</span>
              </span>
            )}
            <span style={{
              padding: '7px 14px', borderRadius: 6,
              border: `1px solid ${rgb(C.orange, 0.25)}`,
              background: rgb(C.orange, 0.04),
              fontFamily: FONT_SANS, fontSize: 10, fontWeight: 600,
              color: C.t1,
            }}>
              {node.label}
            </span>
          </div>
        ))}
      </div>

      {/* Compound confidence */}
      <div style={{
        textAlign: 'center', fontSize: 10, color: C.t3,
      }}>
        Compound confidence:{' '}
        <span style={{
          fontFamily: FONT_MONO, fontWeight: 700, color: C.orange,
        }}>
          59%
        </span>
        <span style={{ color: C.t4, marginLeft: 6 }}>
          ( 0.92 × 0.87 × 0.74 )
        </span>
      </div>
    </div>
  );
}
