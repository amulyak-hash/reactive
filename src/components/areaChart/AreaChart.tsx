import { SeriesChart } from '../common/SeriesChart';
import type { AreaChartProps } from '../../types';

export function AreaChart({ rows = [], className, colors }: AreaChartProps) {
  return <SeriesChart rows={rows} variant="area" className={className} colors={colors} />;
}
