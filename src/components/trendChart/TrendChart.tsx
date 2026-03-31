import * as d3 from 'd3';

import { ChartFrame } from '../chartFrame/ChartFrame';
import type { TrendChartProps } from '../../types';

export function TrendChart({ points = [], className, colors }: TrendChartProps) {
  const parsed = points.map(([label, rawValue]) => {
    const match = String(rawValue).match(/-?\d+(\.\d+)?/);
    return { label, value: match ? Number(match[0]) : 0 };
  });
  const width = 280;
  const height = 96;
  const margin = { top: 16, right: 12, bottom: 20, left: 12 };
  const x = d3.scalePoint().domain(parsed.map((point) => point.label)).range([margin.left, width - margin.right]);
  const domainMin = d3.min(parsed, (point) => point.value) || 0;
  const domainMax = d3.max(parsed, (point) => point.value) || 1;
  const y = d3.scaleLinear().domain([domainMin, domainMax]).nice().range([height - margin.bottom, margin.top]);
  const line = d3.line<(typeof parsed)[number]>().x((point) => x(point.label) ?? 0).y((point) => y(point.value)).curve(d3.curveMonotoneX);

  return (
    <ChartFrame className={['d3-trend-frame', className].filter(Boolean).join(' ')}>
      <svg viewBox={`0 0 ${width} ${height}`} className="d3-svg" role="img" aria-label="trend chart">
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="d3-axis-line subtle" stroke={colors?.axisLine} />
        <path d={line(parsed) || ''} className="d3-line-path trend" stroke={colors?.line} />
        {parsed.map((point, index) => (
          <circle key={`${point.label}-${index}`} cx={x(point.label)} cy={y(point.value)} r={index === parsed.length - 1 ? 4.5 : 3.5} className="d3-trend-point" fill={colors?.point} />
        ))}
      </svg>
      <div className="d3-trend-axis">
        {parsed.map((point) => <span key={point.label}>{point.label.replace('Day ', 'D')}</span>)}
      </div>
    </ChartFrame>
  );
}
