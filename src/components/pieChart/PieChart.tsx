import * as d3 from 'd3';

import { ChartFrame } from '../chartFrame/ChartFrame';
import { palette } from '../constants';
import type { VizRow, PieChartProps } from '../../types';

export function PieChart({ rows = [], variant, className, colors }: PieChartProps) {
  const radius = 78;
  const arc = d3.arc<d3.PieArcDatum<VizRow>>().innerRadius(variant === 'donut' ? 42 : 0).outerRadius(radius);
  const pie = d3.pie<VizRow>().sort(null).value((row) => row.pricing || 0);
  const slices = pie(rows);
  const slicePalette = colors?.slices ?? palette;

  return (
    <ChartFrame className={['d3-pie-frame', className].filter(Boolean).join(' ')}>
      <svg viewBox="-96 -96 192 192" className="d3-pie-svg" role="img" aria-label={`${variant} chart`}>
        {slices.map((slice, index) => (
          <path key={rows[index]?.id || index} d={arc(slice) || ''} fill={slicePalette[index % slicePalette.length]} opacity="0.92" />
        ))}
      </svg>
      <div className="d3-legend">
        {rows.map((row, index) => (
          <div className="d3-legend-row" key={row.id || `${row.vendor}-${index}`}>
            <span className={`d3-legend-dot tone-${index % palette.length}`} />
            <span>{row.vendor}</span>
            <strong>{row.pricing}</strong>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}
