import { SeriesChart } from '../common/SeriesChart';
import type { LineChartProps } from '../../types';

export function LineChart({ rows = [], className, colors }: LineChartProps) {
  return <SeriesChart rows={rows} variant="line" className={className} colors={colors} />;
}
