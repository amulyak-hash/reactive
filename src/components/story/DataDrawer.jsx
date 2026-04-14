import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkedPrimaryViz, LinkedCompanionViz } from '../LinkedViz';
import { VizProvider } from '../VizContext';
import ContractorDrilldown from '../ContractorDrilldown';
import ImpactSummary from '../ImpactSummary';
import { C, FONT_SANS, FONT_MONO, rgb } from '../../theme/tokens';
import { CONTRACTOR_LOGOS } from './contractorLogos';

export default function DataDrawer({ useCase, contractors, drawerOpen, onToggle }) {
  const vizContainerRef = useRef(null);
  const [vizWidth, setVizWidth] = useState(400);

  useEffect(() => {
    if (!vizContainerRef.current || !drawerOpen) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 0) setVizWidth(Math.floor(w));
    });
    ro.observe(vizContainerRef.current);
    return () => ro.disconnect();
  }, [drawerOpen]);

  return (
    <div>
      {/* Toggle — centered, narrow */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 40px' }}>
        <div
          onClick={onToggle}
          onMouseEnter={e => {
            e.currentTarget.querySelector('[data-btn]').style.background = rgb(C.blue, 0.12);
            e.currentTarget.querySelector('[data-btn]').style.borderColor = rgb(C.blue, 0.3);
          }}
          onMouseLeave={e => {
            e.currentTarget.querySelector('[data-btn]').style.background = rgb(C.blue, 0.06);
            e.currentTarget.querySelector('[data-btn]').style.borderColor = rgb(C.blue, 0.15);
          }}
          style={{
            textAlign: 'center', padding: '24px 0', cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div data-btn style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 28px', borderRadius: 12,
            background: rgb(C.blue, 0.06),
            border: `1px solid ${rgb(C.blue, 0.15)}`,
            transition: 'background 200ms ease, border-color 200ms ease',
          }}>
            <span style={{
              fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600,
              color: C.blue, letterSpacing: '0.04em',
            }}>
              {drawerOpen ? '↑  Hide detailed analysis' : '↓  View detailed analysis'}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable content — full width for visualizations */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              maxWidth: 1100, margin: '0 auto', padding: '0 clamp(24px, 3vw, 48px)',
            }}>

              {/* Contractor logo strip */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 32, padding: '24px 0 20px',
                borderBottom: `1px solid ${C.line}`,
              }}>
                {contractors.map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    {CONTRACTOR_LOGOS[c.name] && (
                      <img
                        src={CONTRACTOR_LOGOS[c.name]}
                        alt=""
                        style={{
                          height: 20, width: 'auto', objectFit: 'contain',
                          filter: 'brightness(0.9)',
                          opacity: 0.7,
                        }}
                      />
                    )}
                    <span style={{
                      fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500,
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      {c.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* KPI boxes */}
              <div style={{
                padding: '20px 0',
                borderBottom: `1px solid ${C.line}`,
                display: 'flex', gap: 12,
              }}>
                {[
                  { label: 'Total Portfolio', value: `£${useCase.vizData.totals.portfolioValue.toFixed(1)}M`, color: C.t1 },
                  { label: 'NCE Deviation', value: `+£${useCase.vizData.totals.totalNCE.toFixed(1)}M`, color: C.red },
                  { label: 'Avg Variation', value: `${useCase.vizData.totals.avgPct}%`, color: C.amber },
                  { label: 'Contractors', value: `${useCase.vizData.contractors.length}`, color: C.blue },
                  { label: 'Highest Risk', value: 'Afcons 25%', color: C.red },
                ].map((kpi, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    style={{
                      flex: 1,
                      padding: '16px 18px',
                      borderRadius: 16,
                      border: `1px solid ${C.line}`,
                      background: 'linear-gradient(180deg, rgba(12, 20, 32, 0.96), rgba(17, 27, 40, 0.96))',
                    }}
                  >
                    <div style={{
                      fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600,
                      color: C.t3, letterSpacing: '0.04em', textTransform: 'uppercase',
                      marginBottom: 6,
                    }}>{kpi.label}</div>
                    <div style={{
                      fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700,
                      color: kpi.color, letterSpacing: '-0.02em',
                    }}>{kpi.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Primary + Companion Visualizations */}
              <VizProvider>
                <div ref={vizContainerRef} style={{
                  padding: '20px 0',
                  borderBottom: `1px solid ${C.line}`,
                }}>
                  <div style={{
                    fontFamily: FONT_MONO, fontSize: 9, fontWeight: 600,
                    color: useCase.accent, letterSpacing: '0.06em', textTransform: 'uppercase',
                    marginBottom: 12,
                  }}>
                    {useCase.vizTitle}
                  </div>
                  <LinkedPrimaryViz
                    vizType={useCase.vizType}
                    vizData={useCase.vizData}
                    accent={useCase.accent}
                  />
                </div>

                {useCase.companionVizType && useCase.companionVizData && (
                  <div style={{
                    padding: '20px 0',
                    borderBottom: `1px solid ${C.line}`,
                  }}>
                    <LinkedCompanionViz
                      type={useCase.companionVizType}
                      data={useCase.companionVizData === 'use-primary' ? useCase.vizData : useCase.companionVizData}
                      accent={useCase.accent}
                      width={vizWidth}
                      height={340}
                    />
                  </div>
                )}
              </VizProvider>

              {/* Contractor drilldown table */}
              <div style={{ padding: '20px 0', borderBottom: `1px solid ${C.line}` }}>
                <ContractorDrilldown />
              </div>

              {/* Impact summary */}
              <div style={{ padding: '20px 0' }}>
                <ImpactSummary useCase={useCase} />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
