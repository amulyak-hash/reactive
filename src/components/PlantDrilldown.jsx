import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';
import { NARRATIVES, PLANT_B_LINES, MACHINE_FAULTS, SUPPLIER_STATUS } from '../data/tataSteel';
import NarrativeBlock from './NarrativeBlock';
import SectionLabel from './SectionLabel';
import Panel from './Panel';
import Breadcrumb from './Breadcrumb';

const PLANT_B_STATS = [
  { label: 'Output', value: '78%', sub: 'vs 95% target', color: C.red },
  { label: 'Lines Active', value: '5/5', sub: 'Line 3 degraded', color: C.amber },
  { label: 'Faults (24h)', value: '12', sub: 'M21 dominant', color: C.red },
  { label: 'Supplier', value: 'Delayed', sub: '12h behind', color: C.red },
];

export default function PlantDrilldown() {
  const ready = useStore(s => s.plantBReady);
  const goBack = useStore(s => s.goBack);
  const goToZones = useStore(s => s.goToZones);
  const enterStory = useStore(s => s.enterStory);
  const setAIContext = useStore(s => s.setAIContext);

  return (
    <div style={{ padding: '0 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          backLabel="Overview"
          onBack={() => goBack('dashboard')}
          items={['Overview', 'Plant B · Jamshedpur']}
          current="Plant B · Jamshedpur"
        />
      </div>

      {/* F: Plant B At-a-Glance Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${PLANT_B_STATS.length}, 1fr)`,
        gap: 10,
        marginBottom: 16,
        opacity: ready ? 1 : 0,
        transform: ready ? 'none' : 'translateY(12px)',
        transition: 'opacity 400ms ease 100ms, transform 400ms ease 100ms',
      }}>
        {PLANT_B_STATS.map((stat, i) => (
          <div key={i} style={{
            background: C.sf,
            border: `1px solid ${C.bd}`,
            borderRadius: 10,
            padding: '12px 14px',
            borderTop: `2px solid ${rgb(stat.color, 0.5)}`,
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.t4, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 9, color: C.t4, marginTop: 3 }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* AI Narrative */}
      <NarrativeBlock
        text={NARRATIVES.plantB}
        accentColor={C.red}
        label="AI ANALYSIS · PLANT B"
        active={ready}
      />

      {/* Section: Line Performance */}
      <SectionLabel text="Line Performance" delay={400} active={ready} accent={C.red} />
      <Panel title="Output by Line · Plant B" subtitle="Target: 85%+ per line · Line 3 critical" accent={C.red} delay={600} active={ready} clickable onClick={goToZones} onMouseEnter={() => setAIContext({ type: 'card', id: 'output_line', layer: 'plantB', label: 'Output by Line', accent: C.red })} storyLabel="Explore Story" onStoryClick={(e) => { e.stopPropagation(); enterStory('output_line'); }}>
        <LinePerformanceBars ready={ready} />
      </Panel>

      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${rgb(C.bd, 0.4)}, transparent)`, margin: '32px 0' }} />

      {/* Section: Machine Faults */}
      <SectionLabel text="Machine Faults" delay={1000} active={ready} accent={C.red} />
      <Panel title="Fault Count · Last 24h" subtitle="12 total · M21 accounts for 58%" accent={C.red} delay={1200} active={ready} clickable onClick={() => enterStory('fault_count')} onMouseEnter={() => setAIContext({ type: 'card', id: 'fault_count', layer: 'plantB', label: 'Fault Count', accent: C.red })} storyLabel="Explore Story">
        <FaultBars ready={ready} />
      </Panel>

      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${rgb(C.bd, 0.4)}, transparent)`, margin: '32px 0' }} />

      {/* Section: Supply Chain */}
      <SectionLabel text="Supply Chain" delay={1600} active={ready} accent={C.amber} />
      <Panel title="Material Dependency · Line 3" subtitle="68% single-source risk · 14h buffer" accent={C.amber} delay={1800} active={ready} clickable onClick={() => enterStory('material_dep')} onMouseEnter={() => setAIContext({ type: 'card', id: 'material_dep', layer: 'plantB', label: 'Material Dependency', accent: C.amber })} storyLabel="Explore Story">
        <DependencyFlow />
      </Panel>
    </div>
  );
}

function LinePerformanceBars({ ready }) {
  const [animated, setAnimated] = useState(false);
  const TARGET = 85;

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(t);
    }
    setAnimated(false);
  }, [ready]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {PLANT_B_LINES.map((line, i) => {
        const isLine3 = i === 2;
        const isBelowTarget = line.output < TARGET;
        return (
          <div key={line.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: FONT_MONO, fontSize: 10, width: 50,
              color: isLine3 ? C.red : C.t2,
              fontWeight: isLine3 ? 700 : 400,
            }}>
              {line.name}
            </span>
            <div style={{
              flex: 1, height: 18, background: rgb(C.bd, 0.2),
              borderRadius: 4, overflow: 'hidden', position: 'relative',
            }}>
              {/* Bar fill */}
              <div style={{
                width: animated ? `${line.output}%` : '0%',
                height: '100%',
                background: isLine3 ? rgb(C.red, 0.6) : rgb(C.blue, 0.35),
                borderRadius: 4,
                transition: 'width 1s ease',
              }} />
              {/* Target line */}
              <div style={{
                position: 'absolute',
                left: `${TARGET}%`,
                top: 0,
                width: 1,
                height: '100%',
                background: rgb(C.t3, 0.5),
              }} />
              {/* Value label on bar */}
              <span style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                fontFamily: FONT_MONO,
                fontSize: 9,
                fontWeight: 600,
                color: isBelowTarget ? C.red : C.t3,
              }}>
                {line.output}%
              </span>
            </div>
            {/* Delta indicator */}
            {isBelowTarget && (
              <span style={{
                fontFamily: FONT_MONO, fontSize: 9, color: C.red, fontWeight: 600, width: 40, textAlign: 'right',
              }}>
                ↓{TARGET - line.output}
              </span>
            )}
            {!isBelowTarget && (
              <span style={{ width: 40 }} />
            )}
          </div>
        );
      })}
      {/* Target legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 60 }}>
        <div style={{ width: 12, height: 1, background: rgb(C.t3, 0.5) }} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.t4 }}>Target {TARGET}%</span>
      </div>
    </div>
  );
}

function FaultBars({ ready }) {
  const [animated, setAnimated] = useState(false);
  const maxFaults = Math.max(...MACHINE_FAULTS.map(m => m.faults));

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(t);
    }
    setAnimated(false);
  }, [ready]);

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around',
      height: 120, padding: '0 4px',
    }}>
      {MACHINE_FAULTS.map(m => {
        const isM21 = m.id === 'M21';
        const barH = m.faults > 0 ? Math.max((m.faults / maxFaults) * 80, 4) : 0;
        return (
          <div key={m.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            flex: 1, gap: 4,
          }}>
            {/* Fault count label on top of bar */}
            <span style={{
              fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700,
              color: isM21 ? C.red : m.faults > 0 ? C.t3 : C.t4,
              minHeight: 14,
            }}>
              {m.faults > 0 ? m.faults : ''}
            </span>
            <div style={{
              width: '100%', maxWidth: 32,
              height: animated ? barH : 0,
              background: isM21 ? rgb(C.red, 0.6) : m.faults > 0 ? rgb(C.blue, 0.25) : rgb(C.bd, 0.15),
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.8s ease',
            }} />
            <span style={{
              fontFamily: FONT_MONO, fontSize: 9,
              color: isM21 ? C.red : C.t4,
              fontWeight: isM21 ? 700 : 400,
            }}>
              {m.id}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DependencyFlow() {
  const nodes = [
    { label: 'Supplier X', sub: 'Delayed 12h', accent: C.red },
    { label: 'Material Y', sub: 'Iron Ore Batch', accent: C.amber },
    { label: 'Line 3', sub: 'Primary', accent: C.cyan },
    { label: 'Plant B Output', sub: '−17% impact', accent: C.red },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 6, flexWrap: 'wrap', padding: '8px 0',
    }}>
      {nodes.map((node, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <span style={{ color: C.t4, fontSize: 14 }}>→</span>}
          <div style={{
            padding: '10px 16px', borderRadius: 8,
            border: `1px solid ${rgb(node.accent, 0.3)}`,
            background: rgb(node.accent, 0.06),
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600,
              color: node.accent,
            }}>
              {node.label}
            </div>
            <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>
              {node.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
