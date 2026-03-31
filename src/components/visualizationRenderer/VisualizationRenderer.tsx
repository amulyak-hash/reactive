import { AreaChart } from '../areaChart/AreaChart';
import { BarChart } from '../barChart/BarChart';
import { LineChart } from '../lineChart/LineChart';
import { MiniBars } from '../miniBars/MiniBars';
import { PieChart } from '../pieChart/PieChart';
import { ProcessSankey, RankingSankey } from '../sankey';
import { TrendChart } from '../trendChart/TrendChart';
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

  return <div className="viz-empty">Visualization unavailable</div>;
}
