import { PieChart } from '../pieChart/PieChart';
import type { DonutChartProps } from '../../types';

export function DonutChart({ rows = [], className, colors }: DonutChartProps) {
  return <PieChart rows={rows} variant="donut" className={className} colors={colors} />;
}
