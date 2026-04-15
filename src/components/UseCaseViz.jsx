import { useRef, useState, useEffect } from 'react';
import BudgetBleedHeatmap from '../canvas/uc/BudgetBleedHeatmap';
import SalamiSlicingBars from '../canvas/uc/SalamiSlicingBars';
import EWResponseScatter from '../canvas/uc/EWResponseScatter';
import CoupledRiskCascade from '../canvas/uc/CoupledRiskCascade';
import NCEValidityMap from '../canvas/uc/NCEValidityMap';
import SilenceAlarmGauge from '../canvas/uc/SilenceAlarmGauge';
import BoardRiskMatrix from '../canvas/uc/BoardRiskMatrix';
import CostOfDelayWaterfall from '../canvas/uc/CostOfDelayWaterfall';
import NCEStackedBars from '../canvas/uc/NCEStackedBars';
import IsometricConstellation from './iso/IsometricConstellation';
import { C, FONT_MONO } from '../theme/tokens';

const VIZ_COMPONENTS = {
  'nce-stacked-bars': NCEStackedBars,
  'heatmap': BudgetBleedHeatmap,
  'stacked-bars': SalamiSlicingBars,
  'scatter': EWResponseScatter,
  'cascade': CoupledRiskCascade,
  'site-map': NCEValidityMap,
  'gauges': SilenceAlarmGauge,
  'risk-matrix': BoardRiskMatrix,
  'waterfall': CostOfDelayWaterfall,
  'constellation': IsometricConstellation,
};

export default function UseCaseViz({ vizType, vizData, vizTitle, accent, activeKey, dimOthers, onVizHover, onVizClick }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 400, height: 260 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      if (width > 0) setSize({ width: Math.floor(width), height: 260 });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const VizComponent = VIZ_COMPONENTS[vizType];
  const vizHeight = vizType === 'constellation' ? 520 : size.height;

  // When used standalone (with vizTitle), wrap in a card container
  // When used inside ResponseCard (no vizTitle), render bare
  const bare = !vizTitle;

  const content = VizComponent ? (
    <VizComponent width={bare ? size.width : size.width - 32} height={vizHeight} data={vizData} accent={accent} activeKey={activeKey} dimOthers={dimOthers} onVizHover={onVizHover} onVizClick={onVizClick} />
  ) : (
    <div style={{
      width: size.width, height: size.height,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(255,255,255,0.02)', borderRadius: 14,
      color: C.t4, fontFamily: FONT_MONO, fontSize: 12,
    }}>
      {vizType}
    </div>
  );

  if (bare) {
    return <div ref={containerRef} style={{ width: '100%' }}>{content}</div>;
  }

  return (
    <div ref={containerRef} style={{
      width: '100%',
      borderRadius: 22,
      border: `1px solid ${C.line}`,
      background: 'linear-gradient(180deg, rgba(12, 20, 32, 0.96), rgba(17, 27, 40, 0.96))',
      padding: '16px 16px 12px',
      overflow: 'hidden',
    }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600,
        color: accent || C.t3, letterSpacing: '0.06em', textTransform: 'uppercase',
        marginBottom: 10,
      }}>
        {vizTitle}
      </div>
      {content}
    </div>
  );
}
