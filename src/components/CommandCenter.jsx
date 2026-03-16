import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../theme/tokens';
import { NARRATIVES, SUPPLIER_STATUS, ZONES } from '../data/tataSteel';
import NarrativeBlock from './NarrativeBlock';
import SectionLabel from './SectionLabel';
import Panel from './Panel';
import ProductionTrend from '../canvas/ProductionTrend';
import PlantBars from '../canvas/PlantBars';
import Heatmap from '../canvas/Heatmap';
import DowntimeTimeline from '../canvas/DowntimeTimeline';
import DefectTrend from '../canvas/DefectTrend';
import FactoryMap from '../canvas/FactoryMap';
import CardPreview from '../canvas/CardPreview';

export default function CommandCenter() {
  const ready = useStore(s => s.dashboardReady);
  const goToPlantB = useStore(s => s.goToPlantB);
  const enterStory = useStore(s => s.enterStory);
  const setAIContext = useStore(s => s.setAIContext);
  const [hov, setHov] = useState(null);
  const [mapSz, setMapSz] = useState({ w: 800, h: 280 });
  const mapRef = useRef(null);
  const [cardVis, setCardVis] = useState(Array(ZONES.length).fill(false));

  useEffect(() => {
    const update = () => {
      if (mapRef.current) {
        const r = mapRef.current.getBoundingClientRect();
        setMapSz({ w: r.width, h: Math.max(280, r.height) });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timers = ZONES.map((_, i) =>
      setTimeout(() => setCardVis(prev => { const next = [...prev]; next[i] = true; return next; }), 500 + i * 80)
    );
    return () => {
      timers.forEach(clearTimeout);
      setCardVis(Array(ZONES.length).fill(false));
    };
  }, [ready]);

  const handleHov = useCallback((id) => {
    setHov(id);
    if (id) {
      const z = ZONES.find(z => z.id === id);
      if (z) setAIContext({ type: 'zone', id: z.id, layer: 'dashboard', label: z.label, accent: z.accent });
    }
  }, [setAIContext]);

  return (
    <div style={{ padding: '0 24px 40px' }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        height: 48, display: 'flex', alignItems: 'center', gap: 8,
        background: C.bg, borderBottom: `1px solid ${rgb(C.bd, 0.3)}`,
        marginBottom: 16,
      }}>
        <div style={{
          width: 7, height: 7, background: C.orange,
          transform: 'rotate(45deg)',
        }} />
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: C.t1 }}>
          Enterprise Brain
        </span>
        <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: C.t4 }}>
          · Tata Steel Operations
        </span>
      </div>

      {/* AI Intelligence Hero */}
      <div style={{
        background: C.sf,
        border: `1px solid ${C.bd}`,
        borderRadius: 12,
        marginBottom: 6,
        opacity: ready ? 1 : 0,
        transform: ready ? 'none' : 'translateY(20px)',
        transition: 'opacity 500ms cubic-bezier(.4,0,.2,1), transform 500ms cubic-bezier(.4,0,.2,1)',
      }}>
        <NarrativeBlock
          text={NARRATIVES.overview}
          accentColor={C.blue}
          label="AI ANALYSIS"
          active={ready}
          embedded
        />

        <div style={{ height: 1, background: rgb(C.bd, 0.5), margin: '0 18px' }} />

        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 9, color: C.t3,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            Intelligence Layers
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ZONES.map((z, i) => (
              <button
                key={z.id}
                onClick={() => enterStory(z.id)}
                style={{
                  background: C.bgL, border: `1px solid ${C.bd}`, borderRadius: 10,
                  padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                  fontFamily: FONT_SANS, display: 'flex', gap: 12, alignItems: 'center',
                  opacity: cardVis[i] ? 1 : 0,
                  transform: cardVis[i] ? 'none' : 'translateY(12px)',
                  transition: 'opacity 400ms ease, transform 400ms ease, border-color .2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = rgb(z.accent, .4); e.currentTarget.style.transform = 'translateY(-1px)'; setAIContext({ type: 'zone', id: z.id, layer: 'dashboard', label: z.label, accent: z.accent }); }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.bd; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{z.storyTitle}</span>
                    <span style={{
                      fontSize: 8, padding: '1px 5px', borderRadius: 3,
                      background: rgb(z.accent, .1), color: z.accent,
                      fontWeight: 600, fontFamily: FONT_MONO,
                    }}>
                      {z.code}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{z.storyDesc}</div>
                  <div style={{
                    fontSize: 14, fontWeight: 800, color: C.t1,
                    fontFamily: FONT_MONO, marginTop: 8,
                  }}>
                    {z.metric}
                  </div>
                </div>
                <CardPreview zone={z} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Enterprise Operational Pulse */}
      <SectionLabel text="Enterprise Operational Pulse" delay={1200} active={ready} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
        <Panel title="Production Trend · Today" accent={C.blue} delay={1400} active={ready} clickable onClick={() => enterStory('prod_trend')} onMouseEnter={() => setAIContext({ type: 'card', id: 'prod_trend', layer: 'dashboard', label: 'Production Trend', accent: C.blue })} style={{ flex: '0 0 62%' }}>
          {({ width }) => width > 0 && <ProductionTrend width={width} height={180} animate={ready} />}
        </Panel>
        <Panel title="Plant Performance" accent={C.blue} delay={1600} active={ready} clickable onClick={goToPlantB} onMouseEnter={() => setAIContext({ type: 'card', id: 'plant_perf', layer: 'dashboard', label: 'Plant Performance', accent: C.blue })} style={{ flex: '0 0 calc(38% - 12px)' }}>
          {({ width }) => width > 0 && (
            <>
              <PlantBars width={width} height={148} animate={ready} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 9, color: C.t4 }}>
                  Click for Plant B drill-down →
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); enterStory('plant_perf'); }}
                  style={{
                    padding: '3px 8px', background: rgb(C.blue, .08), border: `1px solid ${rgb(C.blue, .2)}`,
                    borderRadius: 4, color: rgb(C.blue, .7), fontSize: 8, cursor: 'pointer',
                    fontFamily: FONT_MONO, fontWeight: 600,
                  }}
                >
                  ◉ Story
                </button>
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* Section 3: Operational Risk Signals */}
      <SectionLabel text="Operational Risk Signals" delay={2200} active={ready} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
        <Panel title="Machine Utilization" accent={C.amber} delay={2400} active={ready} clickable onClick={() => enterStory('machine_util')} onMouseEnter={() => setAIContext({ type: 'card', id: 'machine_util', layer: 'dashboard', label: 'Machine Utilization', accent: C.amber })} style={{ flex: '0 0 50%' }}>
          {({ width }) => width > 0 && <Heatmap width={width} height={160} animate={ready} />}
        </Panel>
        <Panel title="Downtime Events · Line 3" accent={C.red} delay={2600} active={ready} clickable onClick={() => enterStory('downtime')} onMouseEnter={() => setAIContext({ type: 'card', id: 'downtime', layer: 'dashboard', label: 'Downtime Events', accent: C.red })} style={{ flex: '0 0 calc(50% - 12px)' }}>
          {({ width }) => width > 0 && <DowntimeTimeline width={width} height={160} animate={ready} />}
        </Panel>
      </div>

      {/* Section 4: External Operational Signals */}
      <SectionLabel text="External Operational Signals" delay={3200} active={ready} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
        <Panel title="Supplier Status" accent={C.red} delay={3400} active={ready} clickable onClick={() => enterStory('supplier')} onMouseEnter={() => setAIContext({ type: 'card', id: 'supplier', layer: 'dashboard', label: 'Supplier Status', accent: C.red })} style={{ flex: '0 0 50%' }}>
          <SupplierStatusContent />
        </Panel>
        <Panel title="Defect Rate · 7 Day" accent={C.amber} delay={3600} active={ready} clickable onClick={() => enterStory('defect_rate')} onMouseEnter={() => setAIContext({ type: 'card', id: 'defect_rate', layer: 'dashboard', label: 'Defect Rate', accent: C.amber })} style={{ flex: '0 0 calc(50% - 12px)' }}>
          {({ width }) => width > 0 && <DefectTrend width={width} height={140} animate={ready} />}
        </Panel>
      </div>

      {/* Section 5: Steel Production Flow */}
      <SectionLabel text="Steel Production Flow" delay={4000} active={ready} accent={C.cyan} />
      <div ref={mapRef} style={{
        height: 280, background: C.bgL, borderRadius: 10,
        border: `1px solid ${C.bd}`, overflow: 'hidden', marginBottom: 6,
      }}>
        {mapSz.w > 0 && (
          <FactoryMap
            w={mapSz.w}
            h={280}
            hov={hov}
            onHov={handleHov}
            onClick={(id) => enterStory(id)}
          />
        )}
      </div>
      <div style={{
        fontFamily: FONT_SANS, fontSize: 9, color: C.t4,
        textAlign: 'center', marginBottom: 16,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
      }}>
        <span>Click any zone to explore its intelligence layer</span>
        <button
          onClick={() => enterStory('factory_map')}
          style={{
            padding: '3px 8px', background: rgb(C.cyan, .08), border: `1px solid ${rgb(C.cyan, .2)}`,
            borderRadius: 4, color: rgb(C.cyan, .7), fontSize: 8, cursor: 'pointer',
            fontFamily: FONT_MONO, fontWeight: 600,
          }}
        >
          ◉ Flow Story
        </button>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 20, padding: '8px 14px', background: C.bgL,
        borderRadius: 6, border: `1px dashed ${C.bd}`, textAlign: 'center',
      }}>
        <span style={{
          fontSize: 10, color: C.t4, fontFamily: FONT_SERIF, fontStyle: 'italic',
        }}>
          ~200 citations of cognitive science · Enterprise Brain · Devami Design Labs · 2026
        </span>
      </div>
    </div>
  );
}

function SupplierStatusContent() {
  const s = SUPPLIER_STATUS;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: C.t1 }}>
          {s.name} — {s.material}
        </span>
        <span style={{
          fontFamily: FONT_MONO, fontSize: 9, fontWeight: 700,
          background: rgb(C.red, 0.15), color: C.red,
          padding: '2px 8px', borderRadius: 4,
        }}>
          {s.status}
        </span>
      </div>
      <div style={{
        width: '100%', height: 6, background: rgb(C.bd, 0.3),
        borderRadius: 3, marginBottom: 10, overflow: 'hidden',
      }}>
        <div style={{
          width: `${s.transit}%`, height: '100%',
          background: rgb(C.blue, 0.5), borderRadius: 3,
        }} />
      </div>
      <div style={{
        display: 'flex', gap: 16, fontFamily: FONT_MONO, fontSize: 9, color: C.t4,
      }}>
        <span>Dispatched: {s.dispatched}</span>
        <span>Expected: {s.expected}</span>
        <span style={{ color: C.red }}>Revised: {s.revised}</span>
      </div>
    </div>
  );
}
