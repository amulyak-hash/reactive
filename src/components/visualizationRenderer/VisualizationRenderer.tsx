import { AreaChart } from '../areaChart/AreaChart';
import { BarChart } from '../barChart/BarChart';
import { CommitmentRace } from '../commitmentRace';
import { CompensationGauge } from '../compensationGauge';
import { ContractBars } from '../contractBars';
import { ContractValueOrb } from '../contractValueOrb';
import { ContractorRank } from '../contractorRank';
import { EWCategory } from '../ewCategory';
import { LineChart } from '../lineChart/LineChart';
import { MiniBars } from '../miniBars/MiniBars';
import { NCETree } from '../nceTree';
import { PieChart } from '../pieChart/PieChart';
import { ProcessSankey, RankingSankey } from '../sankey';
import { QuotationBalance } from '../quotationBalance';
import { QuotationTrend } from '../quotationTrend';
import { SeverityBands } from '../severityBands';
import { StatusArc } from '../statusArc';
import { TrendChart } from '../trendChart/TrendChart';
import { VariationSplit } from '../variationSplit';
import { WeeklyFlow } from '../weeklyFlow';
import type { VisualizationRendererProps } from '../../types';

export function VisualizationRenderer({ config, className }: VisualizationRendererProps) {
  if (config.type === 'line') return <LineChart rows={config.rows} className={className} />;
  if (config.type === 'area') return <AreaChart rows={config.rows} className={className} />;
  if (config.type === 'bar') return <BarChart rows={config.rows} className={className} />;
  if (config.type === 'pie') return <PieChart rows={config.rows} variant="pie" className={className} />;
  if (config.type === 'donut') return <PieChart rows={config.rows} variant="donut" className={className} />;
  if (config.type === 'sankey') return <RankingSankey rows={config.rows} className={className} />;
  if (config.type === 'flow') return <ProcessSankey selectedEntity={config.selectedEntity} className={className} />;
  if (config.type === 'trend') return <TrendChart points={config.points} className={className} />;
  if (config.type === 'mini-bars') return <MiniBars rows={config.rows} className={className} />;

  if (config.type === 'contract-value-orb') return <ContractValueOrb data={config.data} />;
  if (config.type === 'contract-bars') return <ContractBars contractors={config.contractors} />;
  if (config.type === 'commitment-race') return <CommitmentRace contractors={config.contractors} />;
  if (config.type === 'status-arc') return <StatusArc segments={config.segments} title={config.title} />;
  if (config.type === 'ew-category') return <EWCategory categories={config.categories} />;
  if (config.type === 'contractor-rank') return <ContractorRank contractors={config.contractors} />;
  if (config.type === 'severity-bands') return <SeverityBands severities={config.severities} />;
  if (config.type === 'nce-tree') return <NCETree total={config.total} byContractor={config.byContractor} />;
  if (config.type === 'compensation-gauge') return <CompensationGauge pct={config.pct} confirmed={config.confirmed} total={config.total} />;
  if (config.type === 'variation-split') return <VariationSplit contractors={config.contractors} />;
  if (config.type === 'quotation-balance') return <QuotationBalance accepted={config.accepted} submitted={config.submitted} />;
  if (config.type === 'quotation-trend') return <QuotationTrend trend={config.trend} />;
  if (config.type === 'weekly-flow') return <WeeklyFlow contractors={config.contractors} />;

  return <div className="viz-empty">Visualization unavailable</div>;
}
