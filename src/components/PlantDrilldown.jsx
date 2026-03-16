import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';
import { NARRATIVES, PLANT_B_LINES, MACHINE_FAULTS, SUPPLIER_STATUS } from '../data/tataSteel';
import NarrativeBlock from './NarrativeBlock';
import SectionLabel from './SectionLabel';
import Panel from './Panel';
import Breadcrumb from './Breadcrumb';

export default function PlantDrilldown() {
  const ready = useStore(s => s.plantBReady);
  const goBack = useStore(s => s.goBack);
  const goToZones = useStore(s => s.goToZones);
  const enterStory = useStore(s => s.enterStory);
  const setAIContext = useStore(s => s.setAIContext);

  return (
    <div style={{ padding: '0 24px 40px' }}>
      {/* Header */}
      <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          backLabel="Overview"
          onBack={() => goBack('dashboard')}
          items={['Overview', 'Plant B · Jamshedpur']}
          current="Plant B · Jamshedpur"
        />
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
      <Panel title="Output by Line · Plant B" accent={C.red} delay={600} active={ready} clickable onClick={goToZones} onMouseEnter={() => setAIContext({ type: 'card', id: 'output_line', layer: 'plantB', label: 'Output by Line', accent: C.red })}>
        <LinePerformanceBars ready={ready} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 9, color: C.t4 }}>
            Click for Line 3 zones →
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); enterStory('output_line'); }}
            style={{
              padding: '3px 8px', background: rgb(C.red, .08), border: `1px solid ${rgb(C.red, .2)}`,
              borderRadius: 4, color: rgb(C.red, .7), fontSize: 8, cursor: 'pointer',
              fontFamily: FONT_MONO, fontWeight: 600,
            }}
          >
            ◉ Story
          </button>
        </div>
      </Panel>

      {/* Section: Machine Faults */}
      <SectionLabel text="Machine Faults" delay={1000} active={ready} accent={C.red} />
      <Panel title="Fault Count · Last 24h" accent={C.red} delay={1200} active={ready} clickable onClick={() => enterStory('fault_count')} onMouseEnter={() => setAIContext({ type: 'card', id: 'fault_count', layer: 'plantB', label: 'Fault Count', accent: C.red })}>
        <FaultBars ready={ready} />
      </Panel>

      {/* Section: Supply Chain */}
      <SectionLabel text="Supply Chain" delay={1600} active={ready} accent={C.amber} />
      <Panel title="Material Dependency · Line 3" accent={C.amber} delay={1800} active={ready} clickable onClick={() => enterStory('material_dep')} onMouseEnter={() => setAIContext({ type: 'card', id: 'material_dep', layer: 'plantB', label: 'Material Dependency', accent: C.amber })}>
        <DependencyFlow />
      </Panel>
    </div>
  );
}

function LinePerformanceBars({ ready }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(t);
    }
    setAnimated(false);
  }, [ready]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {PLANT_B_LINES.map((line, i) => {
        const isLine3 = i === 2;
        return (
          <div key={line.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: FONT_MONO, fontSize: 10, width: 50,
              color: isLine3 ? C.red : C.t2,
              fontWeight: isLine3 ? 700 : 400,
            }}>
              {line.name}
            </span>
            <div style={{
              flex: 1, height: 14, background: rgb(C.bd, 0.2),
              borderRadius: 4, overflow: 'hidden',
            }}>
              <div style={{
                width: animated ? `${line.output}%` : '0%',
                height: '100%',
                background: isLine3 ? rgb(C.red, 0.6) : rgb(C.blue, 0.35),
                borderRadius: 4,
                transition: 'width 1s ease',
              }} />
            </div>
            <span style={{
              fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600, width: 32,
              color: isLine3 ? C.red : C.t2, textAlign: 'right',
            }}>
              {line.output}%
            </span>
          </div>
        );
      })}
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
      height: 100, padding: '0 4px',
    }}>
      {MACHINE_FAULTS.map(m => {
        const isM21 = m.id === 'M21';
        const barH = m.faults > 0 ? Math.max((m.faults / maxFaults) * 80, 4) : 0;
        return (
          <div key={m.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            flex: 1, gap: 4,
          }}>
            <div style={{
              width: '100%', maxWidth: 28,
              height: animated ? barH : 0,
              background: isM21 ? rgb(C.red, 0.6) : rgb(C.blue, 0.25),
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.8s ease',
            }} />
            <span style={{
              fontFamily: FONT_MONO, fontSize: 8,
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
            padding: '8px 14px', borderRadius: 8,
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
