import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';
import { NARRATIVES, ZONES, CAUSAL_CHAIN, STORIES } from '../data/tataSteel';
import NarrativeBlock from './NarrativeBlock';
import SectionLabel from './SectionLabel';
import Panel from './Panel';
import Breadcrumb from './Breadcrumb';

export default function ZoneView() {
  const ready = useStore(s => s.zonesReady);
  const goBack = useStore(s => s.goBack);
  const enterStory = useStore(s => s.enterStory);
  const setAIContext = useStore(s => s.setAIContext);

  return (
    <div style={{ padding: '0 24px 40px' }}>
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

      {/* Zone cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ZONES.map((zone, i) => (
          <ZoneCard key={zone.id} zone={zone} delay={600 + i * 150} active={ready} onExplore={() => enterStory(zone.id)} onHover={() => setAIContext({ type: 'zone', id: zone.id, layer: 'zones', label: zone.label, accent: zone.accent })} />
        ))}
      </div>

      {/* Causal Chain Summary */}
      <CausalChainBlock delay={600 + ZONES.length * 150 + 200} active={ready} />
    </div>
  );
}

function ZoneCard({ zone, delay, active, onExplore, onHover }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isAlert = zone.status === 'alert';

  useEffect(() => {
    if (!active) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  return (
    <div
      onMouseEnter={onHover}
      style={{
      background: C.sf,
      border: `1px solid ${C.bd}`,
      borderRadius: 12,
      padding: '14px 16px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
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
          padding: '1px 6px', borderRadius: 3,
        }}>
          {zone.code}
        </span>

        <div style={{ flex: 1 }} />

        {/* Metric value */}
        <span style={{
          fontFamily: FONT_MONO, fontSize: 20, fontWeight: 800,
          color: isAlert ? zone.accent : C.t1,
        }}>
          {zone.metric}
        </span>

        {/* Explore button */}
        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onExplore}
          style={{
            fontFamily: FONT_SANS, fontSize: 10, fontWeight: 600,
            color: hovered ? zone.accent : C.t2,
            background: 'transparent',
            border: `1px solid ${hovered ? zone.accent : C.bd}`,
            padding: '6px 14px', borderRadius: 6,
            cursor: 'pointer',
            transition: 'color 200ms, border-color 200ms',
          }}
        >
          Explore →
        </button>
      </div>

      {/* Status description */}
      <div style={{
        fontFamily: FONT_SANS, fontSize: 10, color: C.t3,
        marginTop: 6, paddingLeft: 18,
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
      marginTop: 20,
      background: rgb(C.orange, 0.04),
      border: `1px solid ${rgb(C.orange, 0.15)}`,
      borderRadius: 10,
      padding: '14px 18px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1)',
    }}>
      {/* Tag */}
      <div style={{
        fontFamily: FONT_MONO, fontSize: 9, color: rgb(C.orange, 0.6),
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 12,
      }}>
        ACTIVE CAUSAL CHAIN
      </div>

      {/* Chain nodes */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, flexWrap: 'wrap', marginBottom: 12,
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
              padding: '6px 12px', borderRadius: 6,
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
