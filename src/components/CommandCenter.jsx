import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../theme/tokens';
import { NARRATIVES, PLANTS, SUPPLIER_STATUS, ZONES, ARCHETYPES, COG_STYLES, ARCHETYPE_NARRATIVES, ARCHETYPE_SIGNALS, ARCHETYPE_KPIS, ZONE_ARCHETYPE_METRICS, DASHBOARD_SECTIONS, ARCHETYPE_SECTION_OVERRIDES, SDM_FINANCIAL_SUMMARY, CARD_SURFACE_METRICS, COMBO_SECTION_TRANSFORMS } from '../data/tataSteel';
import LensMenu from './LensMenu';
import SectionLabel from './SectionLabel';
import Panel from './Panel';
import ProductionTrend from '../canvas/ProductionTrend';
import PlantBars from '../canvas/PlantBars';
import Heatmap from '../canvas/Heatmap';
import DowntimeTimeline from '../canvas/DowntimeTimeline';
import DefectTrend from '../canvas/DefectTrend';
import FactoryMap from '../canvas/FactoryMap';
import CardPreview from '../canvas/CardPreview';

// Simulated live clock for the command bar
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const SHIFT_NAME = () => {
  const h = new Date().getHours();
  if (h >= 6 && h < 14) return 'Morning';
  if (h >= 14 && h < 22) return 'Afternoon';
  return 'Night';
};

export default function CommandCenter() {
  const ready = useStore(s => s.dashboardReady);
  const goToPlantB = useStore(s => s.goToPlantB);
  const enterStory = useStore(s => s.enterStory);
  const setAIContext = useStore(s => s.setAIContext);
  const activeArchetype = useStore(s => s.activeArchetype);
  const activeCogStyle = useStore(s => s.activeCogStyle);
  const lensMenuOpen = useStore(s => s.lensMenuOpen);
  const toggleLensMenu = useStore(s => s.toggleLensMenu);
  const [hov, setHov] = useState(null);
  const [mapSz, setMapSz] = useState({ w: 800, h: 340 });
  const mapRef = useRef(null);
  const [cardVis, setCardVis] = useState(Array(ZONES.length).fill(false));
  const clock = useClock();

  useEffect(() => {
    const update = () => {
      if (mapRef.current) {
        const r = mapRef.current.getBoundingClientRect();
        setMapSz({ w: r.width, h: Math.max(340, r.height) });
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

  const alertCount = ZONES.filter(z => z.status === 'alert').length;
  const plantsOnline = PLANTS.length;
  const timeStr = clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });

  return (
    <div
      data-archetype={activeArchetype || undefined}
      data-cogstyle={activeCogStyle || undefined}
      data-cogcluster={activeCogStyle ? COG_STYLES[activeCogStyle].cluster : undefined}
      style={{ padding: '0 24px 40px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column' }}
    >

      {/* ─── A: Command Bar Header ─── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: C.bg,
        borderBottom: `1px solid ${rgb(C.bd, 0.4)}`,
        padding: '10px 0 10px',
        marginBottom: 24,
      }}>
        {/* Row 1: Title + Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, position: 'relative' }}>
          <button
            onClick={toggleLensMenu}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 8px 4px 0', borderRadius: 6,
            }}
          >
            <div style={{
              width: 8, height: 8,
              background: activeArchetype ? ARCHETYPES[activeArchetype].accent : C.orange,
              transform: 'rotate(45deg)', flexShrink: 0,
              transition: 'background 300ms ease',
            }} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 15, fontWeight: 700, color: C.t1, letterSpacing: '-0.01em' }}>
              Enterprise Brain
            </span>
            {activeArchetype && (
              <span style={{
                fontFamily: FONT_MONO, fontSize: 8, padding: '1px 5px', borderRadius: 3,
                background: rgb(ARCHETYPES[activeArchetype].accent, 0.15),
                color: ARCHETYPES[activeArchetype].accent,
              }}>
                {ARCHETYPES[activeArchetype].shortName}
              </span>
            )}
          </button>
          <div style={{ width: 1, height: 14, background: rgb(C.bd, 0.4) }} />
          <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.t3 }}>
            Tata Steel · Jamshedpur
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.t2, fontWeight: 600 }}>
            {timeStr} IST
          </span>
        </div>

        {/* Row 2: Status pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 18 }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: C.green,
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live
            </span>
          </div>

          {(activeArchetype ? ARCHETYPE_KPIS[activeArchetype] : [
            { label: 'Shift', value: SHIFT_NAME() },
            { label: 'Plants', value: `${plantsOnline}/${plantsOnline} online` },
            { label: 'Alerts', value: `${alertCount} active`, color: alertCount > 0 ? C.red : C.green },
          ]).map((kpi, i) => (
            <StatusPill key={i} label={kpi.label} value={kpi.value} color={kpi.color} />
          ))}
        </div>

        {/* Lens Menu dropdown */}
        {lensMenuOpen && <LensMenu />}
      </div>

      {/* ─── Dashboard Sections (render-array pattern for #3 section topology) ─── */}
      {(() => {
        const comboKey = activeArchetype && activeCogStyle ? `${activeArchetype}:${activeCogStyle}` : null;
        const transforms = comboKey ? COMBO_SECTION_TRANSFORMS[comboKey] : null;
        const overrides = activeArchetype ? ARCHETYPE_SECTION_OVERRIDES[activeArchetype] : null;
        const getBadges = (cardId) => activeArchetype ? CARD_SURFACE_METRICS[cardId]?.[activeArchetype] : null;
        const divider = <div className="section-divider" style={{ height: 1, background: `linear-gradient(to right, transparent, ${rgb(C.bd, 0.4)}, transparent)`, marginBottom: 40 }} />;

        const sectionRenderers = {
          briefing: () => (
            <div key="briefing" className="section-briefing" style={{
              marginBottom: 40,
              opacity: ready ? 1 : 0,
              transform: ready ? 'none' : 'translateY(20px)',
              transition: 'opacity 500ms cubic-bezier(.4,0,.2,1), transform 500ms cubic-bezier(.4,0,.2,1)',
            }}>
              <AIBriefing ready={ready} onSignalClick={enterStory} activeArchetype={activeArchetype} narrativeOverride={transforms?.briefing?.mode === 'safety-narrative' ? transforms.briefing.text : null} />
            </div>
          ),
          intelligence: () => (
            <div key="intelligence" className="section-intelligence" style={{
              marginBottom: 40,
              opacity: ready ? 1 : 0,
              transform: ready ? 'none' : 'translateY(20px)',
              transition: 'opacity 500ms cubic-bezier(.4,0,.2,1), transform 500ms cubic-bezier(.4,0,.2,1)',
            }}>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 9, color: C.t3,
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 3, height: 12, background: C.cyan, borderRadius: 2 }} />
                Intelligence Layers
              </div>
              <div className="intelligence-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}>
                {ZONES.map((z, i) => (
                  <IntelligenceCard
                    key={z.id}
                    zone={z}
                    visible={cardVis[i]}
                    onClick={() => enterStory(z.id)}
                    onHover={() => setAIContext({ type: 'zone', id: z.id, layer: 'dashboard', label: z.label, accent: z.accent })}
                    activeArchetype={activeArchetype}
                  />
                ))}
              </div>
            </div>
          ),
          operational_pulse: () => (
            <div key="operational_pulse" className="section-operational-pulse">
              <SectionLabel text="Enterprise Operational Pulse" delay={1200} active={ready} />
              <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
                <Panel title="Production Trend · Today" subtitle="8% below target · gap widening since 11:00" accent={C.blue} delay={1400} active={ready} clickable onClick={() => enterStory('prod_trend')} onMouseEnter={() => setAIContext({ type: 'card', id: 'prod_trend', layer: 'dashboard', label: 'Production Trend', accent: C.blue })} style={{ flex: '0 0 62%' }} storyLabel="Explore Story" badges={getBadges('prod_trend')}>
                  {({ width }) => width > 0 && (transforms?.prod_trend?.mode === 'single-line'
                    ? <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: C.red, padding: '8px 0' }}>{transforms.prod_trend.text}</div>
                    : <ProductionTrend width={width} height={180} animate={ready} />
                  )}
                </Panel>
                <Panel title="Plant Performance" subtitle={`${plantsOnline} plants · Plant B flagged`} accent={C.blue} delay={1600} active={ready} clickable onClick={goToPlantB} onMouseEnter={() => setAIContext({ type: 'card', id: 'plant_perf', layer: 'dashboard', label: 'Plant Performance', accent: C.blue })} style={{ flex: '0 0 calc(38% - 12px)' }} storyLabel="Drill Down" onStoryClick={(e) => { e.stopPropagation(); enterStory('plant_perf'); }} badges={getBadges('plant_perf')}>
                  {({ width }) => width > 0 && <PlantBars width={width} height={148} animate={ready} />}
                </Panel>
              </div>
            </div>
          ),
          risk: () => (
            <div key="risk" className="risk-section section-risk">
              <SectionLabel text="Operational Risk Signals" delay={2200} active={ready} accent={C.red} />
              <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
                <Panel title="Machine Utilization · Line 3" subtitle="Bimodal pattern · Line 3 at 42%" accent={C.amber} delay={2400} active={ready} clickable onClick={() => enterStory('machine_util')} onMouseEnter={() => setAIContext({ type: 'card', id: 'machine_util', layer: 'dashboard', label: 'Machine Utilization', accent: C.amber })} style={{ flex: '0 0 50%' }} storyLabel="Explore Story" badges={getBadges('machine_util')}>
                  {({ width }) => width > 0 && <Heatmap width={width} height={160} animate={ready} />}
                </Panel>
                <Panel title="Downtime Events · Line 3" subtitle="Last 4h · 8 events · M21 dominant" accent={C.red} delay={2600} active={ready} clickable onClick={() => enterStory('downtime')} onMouseEnter={() => setAIContext({ type: 'card', id: 'downtime', layer: 'dashboard', label: 'Downtime Events', accent: C.red })} style={{ flex: '0 0 calc(50% - 12px)' }} storyLabel="Explore Story" badges={getBadges('downtime')}>
                  {({ width }) => width > 0 && <DowntimeTimeline width={width} height={160} animate={ready} />}
                </Panel>
              </div>
            </div>
          ),
          external: () => (
            <div key="external" className="section-external">
              <SectionLabel text="External Operational Signals" delay={3200} active={ready} accent={C.amber} />
              <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
                <Panel title="Supplier Status" subtitle={`${SUPPLIER_STATUS.name} · ${SUPPLIER_STATUS.status}`} accent={C.red} delay={3400} active={ready} clickable onClick={() => enterStory('supplier')} onMouseEnter={() => setAIContext({ type: 'card', id: 'supplier', layer: 'dashboard', label: 'Supplier Status', accent: C.red })} style={{ flex: '0 0 50%' }} storyLabel="Explore Story" badges={getBadges('supplier')}>
                  <SupplierStatusContent />
                </Panel>
                <Panel title="Defect Rate · 7 Day" subtitle="Trending up weekends · Sunday 1.1%" accent={C.amber} delay={3600} active={ready} clickable onClick={() => enterStory('defect_rate')} onMouseEnter={() => setAIContext({ type: 'card', id: 'defect_rate', layer: 'dashboard', label: 'Defect Rate', accent: C.amber })} style={{ flex: '0 0 calc(50% - 12px)' }} storyLabel="Explore Story" badges={getBadges('defect_rate')}>
                  {({ width }) => width > 0 && <DefectTrend width={width} height={140} animate={ready} />}
                </Panel>
              </div>
            </div>
          ),
          factory_map: () => (
            <div key="factory_map" className="factory-map-section section-factory-map">
              <SectionLabel text="Steel Production Flow" delay={4000} active={ready} accent={C.cyan} />
              <div style={{
                fontFamily: FONT_SANS, fontSize: 11, color: C.t2, marginBottom: 12, marginTop: -4,
                paddingLeft: 11, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>Material flow from ore to quality check — click any zone to explore</span>
                {getBadges('factory_map')?.map((b, i) => (
                  <span key={i} className="surface-metric-badge">{b.label}: {b.value}</span>
                ))}
              </div>
              <div ref={mapRef} style={{
                height: 340, background: C.bgL, borderRadius: 12,
                border: `1px solid ${C.bd}`, overflow: 'hidden', marginBottom: 8,
                position: 'relative',
              }}>
                {mapSz.w > 0 && (
                  <FactoryMap
                    w={mapSz.w}
                    h={340}
                    hov={hov}
                    onHov={handleHov}
                    onClick={(id) => enterStory(id)}
                    cogCluster={activeCogStyle ? COG_STYLES[activeCogStyle].cluster : null}
                  />
                )}
                <button
                  onClick={() => enterStory('factory_map')}
                  style={{
                    position: 'absolute', bottom: 12, right: 12,
                    padding: '6px 14px',
                    background: rgb(C.sf, 0.9),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${rgb(C.cyan, .25)}`,
                    borderRadius: 8,
                    color: C.cyan,
                    fontSize: 10,
                    fontFamily: FONT_MONO,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = rgb(C.cyan, 0.1); e.currentTarget.style.borderColor = rgb(C.cyan, 0.5); }}
                  onMouseLeave={e => { e.currentTarget.style.background = rgb(C.sf, 0.9); e.currentTarget.style.borderColor = rgb(C.cyan, 0.25); }}
                >
                  Explore Flow Story →
                </button>
              </div>
            </div>
          ),
        };

        // Compute visible + ordered sections
        const visibleSections = DASHBOARD_SECTIONS
          .filter(s => !overrides?.hidden?.includes(s.id))
          .sort((a, b) => {
            const orderA = overrides?.order?.[a.id] ?? a.defaultOrder;
            const orderB = overrides?.order?.[b.id] ?? b.defaultOrder;
            return orderA - orderB;
          });

        return (
          <>
            {/* SDM Financial Summary Band */}
            {overrides?.inject?.includes('financial_summary') && (
              <div className="financial-summary-band" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', background: `linear-gradient(135deg, ${rgb(C.cyan, 0.04)}, ${rgb(C.blue, 0.04)})`, border: `1px solid ${rgb(C.cyan, 0.15)}`, borderRadius: 12, marginBottom: 24 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 800, color: C.red }}>{SDM_FINANCIAL_SUMMARY.headline}</span>
                <div style={{ flex: 1 }} />
                {SDM_FINANCIAL_SUMMARY.items.map((item, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: C.t1 }}>{item.value}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.t3, textTransform: 'uppercase' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            )}
            {visibleSections.map((s, i) => (
              <div key={s.id}>
                {sectionRenderers[s.id]?.()}
                {i < visibleSections.length - 1 && divider}
              </div>
            ))}
          </>
        );
      })()}

      {/* ─── K: Status bar footer ─── */}
      <div style={{
        marginTop: 40, padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: `1px solid ${rgb(C.bd, 0.3)}`,
      }}>
        <span style={{ fontSize: 9, color: C.t3, fontFamily: FONT_MONO }}>
          Enterprise Brain · Devami Design Labs · 2026
        </span>
        <span style={{ fontSize: 9, color: C.t3, fontFamily: FONT_MONO }}>
          {PLANTS.length} plants · {ZONES.length} zones · {15} stories
        </span>
      </div>
    </div>
  );
}

/* ─── AI Persona Briefing (Option 2) ─── */

const AI_SIGNALS = [
  { label: 'Plant B', value: '−17%', sub: 'below target', color: C.red, storyId: 'plant_perf' },
  { label: 'Line 3', value: '8 events', sub: 'downtime spike', color: C.red, storyId: 'downtime' },
  { label: 'Supplier X', value: '12h late', sub: 'single source', color: C.amber, storyId: 'supplier' },
];

function AIBriefing({ ready, onSignalClick, activeArchetype, narrativeOverride }) {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=header, 2=typing, 3=signals
  const [typedText, setTypedText] = useState('');
  const fullText = narrativeOverride || (activeArchetype ? ARCHETYPE_NARRATIVES[activeArchetype].overview : NARRATIVES.overview);
  const signals = activeArchetype ? ARCHETYPE_SIGNALS[activeArchetype] : AI_SIGNALS;
  const indexRef = useRef(0);

  useEffect(() => {
    if (!ready) { setPhase(0); setTypedText(''); indexRef.current = 0; return; }
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [ready]);

  // Re-trigger typing when archetype changes narrative
  const prevTextRef = useRef(fullText);
  useEffect(() => {
    if (prevTextRef.current !== fullText && phase >= 2) {
      prevTextRef.current = fullText;
      setPhase(2);
      indexRef.current = 0;
      setTypedText('');
    }
  }, [fullText, phase]);

  useEffect(() => {
    if (phase !== 2) return;
    indexRef.current = 0;
    setTypedText('');
    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= fullText.length) {
        clearInterval(interval);
        setTypedText(fullText);
        setTimeout(() => setPhase(3), 300);
        return;
      }
      setTypedText(fullText.slice(0, indexRef.current));
    }, 10);
    return () => clearInterval(interval);
  }, [phase, fullText]);

  const showSignals = phase >= 3;

  return (
    <div className="ai-briefing" style={{
      borderRadius: 16,
      border: `1px solid ${rgb(C.cyan, 0.15)}`,
      background: `linear-gradient(135deg, ${rgb(C.cyan, 0.03)}, ${C.sf} 40%, ${rgb(C.blue, 0.02)})`,
      padding: '20px 24px 22px',
      marginBottom: 20,
      opacity: phase >= 1 ? 1 : 0,
      transform: phase >= 1 ? 'none' : 'translateY(16px)',
      transition: 'opacity 500ms ease, transform 500ms ease, max-height 500ms ease, padding 500ms ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle glow line at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(to right, transparent, ${rgb(C.cyan, 0.3)}, ${rgb(C.blue, 0.2)}, transparent)`,
      }} />

      {/* Header: AI persona */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
      }}>
        {/* Animated orb */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: C.cyan,
          animation: phase >= 2 ? 'pulse-dot 2s ease-in-out infinite' : 'none',
          boxShadow: `0 0 8px ${rgb(C.cyan, 0.4)}`,
        }} />
        <span style={{
          fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: C.t1,
        }}>
          Enterprise Brain
        </span>
        <span style={{
          fontFamily: FONT_MONO, fontSize: 9, color: C.cyan,
          opacity: phase >= 2 && phase < 3 ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}>
          analyzing...
        </span>
        {phase >= 3 && (
          <span style={{
            fontFamily: FONT_MONO, fontSize: 9, color: C.green,
            animation: 'fadeIn 0.3s ease',
          }}>
            briefing ready
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span style={{
          fontFamily: FONT_MONO, fontSize: 8, color: C.t3,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {signals.length} signals detected
        </span>
      </div>

      {/* Narrative text — quoted style */}
      <div className="narrative-text" style={{
        fontFamily: FONT_SERIF,
        fontSize: 14,
        color: C.t2,
        lineHeight: 1.7,
        marginBottom: showSignals ? 20 : 0,
        paddingLeft: 0,
        minHeight: 48,
        transition: 'max-height 500ms ease, font-size 300ms ease, line-height 300ms ease',
      }}>
        <span style={{ color: rgb(C.cyan, 0.3), fontSize: 18, marginRight: 2 }}>"</span>
        {typedText}
        {phase === 2 && (
          <span style={{
            color: C.cyan,
            animation: 'blink 1s step-end infinite',
            marginLeft: 1,
          }}>│</span>
        )}
        {phase >= 3 && (
          <span style={{ color: rgb(C.cyan, 0.3), fontSize: 18, marginLeft: 2 }}>"</span>
        )}
      </div>

      {/* Signal cards */}
      {showSignals && (
        <div style={{
          animation: 'narrativeEnter 0.4s ease forwards',
        }}>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 8, color: C.t3,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 10,
          }}>
            Key Signals
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {signals.map((signal, i) => (
              <SignalCard key={i} signal={signal} onClick={() => onSignalClick(signal.storyId)} delay={i * 80} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal, onClick, delay }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <button
      className="signal-card"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        padding: '12px 14px',
        background: hovered ? rgb(signal.color, 0.06) : C.bgL,
        border: `1px solid ${hovered ? rgb(signal.color, 0.35) : C.bd}`,
        borderRadius: 10,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: FONT_SANS,
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? 'translateY(-2px)' : 'none') : 'translateY(8px)',
        transition: 'all 300ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div className="signal-label" style={{ fontFamily: FONT_SANS, fontSize: 10, fontWeight: 600, color: C.t2, marginBottom: 4 }}>
        {signal.label}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 800, color: signal.color, lineHeight: 1, marginBottom: 3 }}>
        {signal.value}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.t3 }}>
        {signal.sub}
      </div>
    </button>
  );
}

/* ─── B: Intelligence Layer Card (redesigned) ─── */
function IntelligenceCard({ zone, visible, onClick, onHover, activeArchetype }) {
  const [hovered, setHovered] = useState(false);
  const isAlert = zone.status === 'alert';
  const archMetrics = activeArchetype ? ZONE_ARCHETYPE_METRICS[zone.id]?.[activeArchetype] : null;
  const displayMetric = archMetrics?.metric ?? zone.metric;
  const displaySub = archMetrics?.sub ?? zone.sub;

  return (
    <button
      className="intelligence-card"
      data-status={zone.status}
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); onHover(); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? rgb(zone.accent, 0.04) : C.bgL,
        border: `1px solid ${hovered ? rgb(zone.accent, .4) : C.bd}`,
        borderRadius: 12,
        padding: '18px 20px',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: FONT_SANS,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? 'translateY(-2px)' : 'none') : 'translateY(12px)',
        transition: 'opacity 400ms ease, transform 300ms cubic-bezier(0.22,1,0.36,1), border-color .2s ease, background .2s ease',
        boxShadow: hovered ? `0 4px 20px ${rgb(zone.accent, 0.08)}` : 'none',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          {isAlert && (
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: C.red,
              animation: 'pulse-dot 1.5s ease-in-out infinite',
              flexShrink: 0,
            }} />
          )}
          <span className="card-title" style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{zone.storyTitle}</span>
        </div>

        {/* Metric — large */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="card-metric" style={{
            fontSize: 22, fontWeight: 800, color: isAlert ? zone.accent : C.t1,
            fontFamily: FONT_MONO, lineHeight: 1,
          }}>
            {displayMetric}
          </span>
          <span className="card-sub" style={{ fontSize: 9, color: C.t3, fontFamily: FONT_MONO }}>{displaySub}</span>
        </div>
      </div>

      {/* Mini preview */}
      <div className="card-preview" style={{
        flexShrink: 0,
        opacity: hovered ? 1 : 0.7,
        transition: 'opacity .2s ease, transform .2s ease',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
      }}>
        <CardPreview zone={zone} />
      </div>
    </button>
  );
}

/* ─── Status Pill for Command Bar ─── */
function StatusPill({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{
        fontFamily: FONT_MONO, fontSize: 9, fontWeight: 600,
        color: color || C.t2,
        padding: '1px 6px', borderRadius: 3,
        background: rgb(color || C.t2, 0.08),
      }}>
        {value}
      </span>
    </div>
  );
}

/* ─── Supplier Status Content ─── */
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
        display: 'flex', gap: 16, fontFamily: FONT_MONO, fontSize: 9, color: C.t3,
      }}>
        <span>Dispatched: {s.dispatched}</span>
        <span>Expected: {s.expected}</span>
        <span style={{ color: C.red }}>Revised: {s.revised}</span>
      </div>
    </div>
  );
}
