import * as d3 from 'd3';

import { ChartFrame } from '../chartFrame/ChartFrame';
import type { VizRow, SeriesChartProps } from '../../types';

export function SeriesChart({ rows = [], variant, className, colors }: SeriesChartProps) {
  const width = 760;
  const height = 250;
  const margin = { top: 24, right: 24, bottom: 44, left: 24 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const values = rows.map((row) => row.pricing || 0);
  const yMax = Math.max(100, d3.max(values) || 0);
  const x = d3.scalePoint().domain(rows.map((row) => row.vendor)).range([margin.left, margin.left + plotWidth]);
  const y = d3.scaleLinear().domain([0, yMax]).nice().range([margin.top + plotHeight, margin.top]);
  const line = d3.line<VizRow>().x((row) => x(row.vendor) ?? 0).y((row) => y(row.pricing || 0)).curve(d3.curveMonotoneX);
  const area = d3.area<VizRow>().x((row) => x(row.vendor) ?? 0).y0(y(0)).y1((row) => y(row.pricing || 0)).curve(d3.curveMonotoneX);
  const path = line(rows) || '';
  const areaPath = area(rows) || '';

  return (
    <ChartFrame className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="d3-svg" role="img" aria-label={`${variant} chart`}>
        <line x1={margin.left} y1={y(0)} x2={margin.left + plotWidth} y2={y(0)} className="d3-axis-line" stroke={colors?.axisLine} />
        {variant === 'area' ? <path d={areaPath} className="d3-area-fill" fill={colors?.areaFill} /> : null}
        <path d={path} className="d3-line-path" stroke={colors?.line} />
        {rows.map((row, index) => (
          <g key={row.id || `${row.vendor}-${index}`}>
            <circle cx={x(row.vendor)} cy={y(row.pricing || 0)} r={variant === 'area' ? 6 : 7} className={`d3-point ${variant}`} fill={colors?.point} />
            <text x={x(row.vendor)} y={height - 14} textAnchor="middle" className="d3-axis-label">
              {row.vendor}
            </text>
          </g>
        ))}
      </svg>
    </ChartFrame>
  );
}
