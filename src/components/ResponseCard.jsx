import { useRef, useState, useEffect } from 'react';
import { USE_CASE_MAP } from '../data/useCases';
import UseCaseAnswer from './UseCaseAnswer';
import { LinkedPrimaryViz, LinkedCompanionViz } from './LinkedViz';
import ImpactSummary from './ImpactSummary';
import { VizProvider, useVizContext } from './VizContext';
import ContractorDrilldown from './ContractorDrilldown';
import NCEStoryCard from './story/NCEStoryCard';
import SalamiSlicingCard from './story/SalamiSlicingCard';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';

export default function ResponseCard({ useCaseId, onStoryComplete }) {
  const uc = USE_CASE_MAP[useCaseId];
  const vizContainerRef = useRef(null);
  const [vizWidth, setVizWidth] = useState(400);

  useEffect(() => {
    if (!vizContainerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 0) setVizWidth(Math.floor(w));
    });
    ro.observe(vizContainerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!uc) return null;

  // Story card replacements
  if (uc.id === 'uc-00') return <NCEStoryCard useCaseId={useCaseId} onStoryComplete={onStoryComplete} />;
  if (uc.id === 'uc-02') return <SalamiSlicingCard useCaseId={useCaseId} onStoryComplete={onStoryComplete} />;

  const halfWidth = Math.floor((vizWidth - 14) / 2);

  return (
    <div style={{
      borderRadius: 24,
      border: `1px solid ${C.line}`,
      background: 'linear-gradient(180deg, rgba(12, 20, 32, 0.96), rgba(17, 27, 40, 0.96))',
      boxShadow: '0 22px 54px rgba(0, 0, 0, 0.30)',
      overflow: 'hidden',
      animation: 'card-enter 300ms ease-out both',
    }}>
      {/* Card header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.t1,
        }}>
          {uc.title}
        </span>
        <span style={{
          fontFamily: FONT_MONO, fontSize: 10,
          color: C.t3, letterSpacing: '0.04em', marginLeft: 'auto',
        }}>
          {uc.stage}
        </span>
      </div>

      {/* Visualizations — stacked vertically, full width, linked via VizContext */}
      <VizProvider>

      {/* KPI boxes for UC-00 */}
      {uc.id === 'uc-00' && uc.vizData?.totals && (
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${C.line}`,
          display: 'flex', gap: 12,
        }}>
          {[
            { label: 'Total Portfolio', value: `£${uc.vizData.totals.portfolioValue.toFixed(1)}M`, color: C.t1 },
            { label: 'NCE Deviation', value: `+£${uc.vizData.totals.totalNCE.toFixed(1)}M`, color: '#F06060' },
            { label: 'Avg Variation', value: `${uc.vizData.totals.avgPct}%`, color: '#FBBF24' },
            { label: 'Contractors', value: `${uc.vizData.contractors.length}`, color: '#5c83ff' },
            { label: 'Highest Risk', value: 'Afcons 25%', color: '#F06060' },
          ].map((kpi, i) => (
            <div key={i} style={{
              flex: 1,
              padding: '16px 18px',
              borderRadius: 16,
              border: `1px solid ${C.line}`,
              background: 'linear-gradient(180deg, rgba(12, 20, 32, 0.96), rgba(17, 27, 40, 0.96))',
            }}>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600,
                color: C.t3, letterSpacing: '0.04em', textTransform: 'uppercase',
                marginBottom: 6,
              }}>{kpi.label}</div>
              <div style={{
                fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700,
                color: kpi.color, letterSpacing: '-0.02em',
              }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      <div ref={vizContainerRef} style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${C.line}`,
      }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 9, fontWeight: 600,
          color: uc.accent, letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          {uc.vizTitle}
        </div>
        <LinkedPrimaryViz
          vizType={uc.vizType}
          vizData={uc.vizData}
          accent={uc.accent}
        />
      </div>

      {uc.companionVizType && uc.companionVizData && (
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${C.line}`,
        }}>
          <LinkedCompanionViz
            type={uc.companionVizType}
            data={uc.companionVizData === 'use-primary' ? uc.vizData : uc.companionVizData}
            accent={uc.accent}
            width={vizWidth}
            height={300}
          />
        </div>
      )}
      </VizProvider>

      {/* Contractor drill-down table (UC-00 only) */}
      {uc.id === 'uc-00' && (
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.line}` }}>
          <ContractorDrilldown />
        </div>
      )}

      {/* Impact */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.line}` }}>
        <ImpactSummary useCase={uc} />
      </div>

      {/* Answer body — below visualizations and impact */}
      <div style={{ padding: '16px 20px' }}>
        <UseCaseAnswer answer={uc.answer} accent={uc.accent} active={true} />
      </div>
    </div>
  );
}

function getCompanionTitle(type) {
  const titles = {
    'nce-detail-breakdown': 'NCE Detail Breakdown',
    'overrun-trajectory': 'Cumulative Overrun Trajectory',
    'clause-breakdown': 'NCE Clause Distribution & Bid Comparison',
    'cost-escalation': 'CE Cost by Response Band',
    'cost-decomposition': 'Cost Breakdown & Mitigation Options',
    'evidence-balance': 'Claim Evidence Balance',
    'resource-histogram': 'Planned vs Actual Resource',
    'budget-gap-waterfall': 'Budget Gap Decomposition',
    'duration-multiplier': 'Delay Duration Impact',
  };
  return titles[type] || 'Analysis';
}
