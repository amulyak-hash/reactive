import * as d3 from 'd3';

import { ChartFrame } from '../chartFrame/ChartFrame';
import { palette } from '../constants';
import type { BarChartProps } from '../../types';

export function BarChart({ rows = [], className, colors }: BarChartProps) {
  const width = 760;
  const height = 280;
  const margin = { top: 24, right: 24, bottom: 56, left: 24 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const x = d3.scaleBand().domain(rows.map((row) => row.vendor)).range([margin.left, margin.left + plotWidth]).padding(0.24);
  const y = d3.scaleLinear().domain([0, Math.max(100, d3.max(rows, (row) => row.pricing || 0) || 0)]).nice().range([margin.top + plotHeight, margin.top]);

  return (
    <ChartFrame className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="d3-svg" role="img" aria-label="bar chart">
        <line x1={margin.left} y1={y(0)} x2={margin.left + plotWidth} y2={y(0)} className="d3-axis-line" stroke={colors?.axisLine} />
        {rows.map((row, index) => {
          const barHeight = y(0) - y(row.pricing || 0);
          const barPalette = colors?.bars ?? palette;

          return (
            <g key={row.id || `${row.vendor}-${index}`}>
              <rect
                x={x(row.vendor)}
                y={y(row.pricing || 0)}
                width={x.bandwidth()}
                height={barHeight}
                rx="16"
                className={`d3-bar tone-${index % palette.length}`}
                fill={barPalette[index % barPalette.length]}
              />
              <text x={(x(row.vendor) || 0) + x.bandwidth() / 2} y={y(row.pricing || 0) - 10} textAnchor="middle" className="d3-bar-value" fill={colors?.valueLabel}>
                {row.pricing}
              </text>
              <text x={(x(row.vendor) || 0) + x.bandwidth() / 2} y={height - 18} textAnchor="middle" className="d3-axis-label">
                {row.vendor}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}
