import { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import * as d3 from 'd3';
import { sankey as createSankey, sankeyLinkHorizontal } from 'd3-sankey';

const roots = [];
const palette = ['#6bbcff', '#5fe6dd', '#d7bc6d', '#95a9ff', '#7fb58a', '#ee8a8a'];

const flowGraph = {
  nodes: [
    { id: 'supplier-x', name: 'Supplier X', value: 'Si +0.12%' },
    { id: 'bf3-superheat', name: 'BF-3 Superheat', value: '22C vs 34C' },
    { id: 'ccm3-solidification', name: 'CCM-3 Solidification', value: 'Rate deviation' },
    { id: 'grade-risk', name: 'Grade Risk', value: 'Automotive 74%' }
  ],
  links: [
    { source: 'supplier-x', target: 'bf3-superheat', value: 78 },
    { source: 'bf3-superheat', target: 'ccm3-solidification', value: 80 },
    { source: 'ccm3-solidification', target: 'grade-risk', value: 74 }
  ]
};

function decodeConfig(encoded) {
  try {
    return JSON.parse(decodeURIComponent(encoded));
  } catch {
    return null;
  }
}

export function cleanupVisualizationMounts() {
  while (roots.length) {
    const root = roots.pop();
    root.unmount();
  }
}

export function hydrateVisualizationMounts() {
  cleanupVisualizationMounts();
  document.querySelectorAll('[data-d3-viz]').forEach(node => {
    const config = decodeConfig(node.dataset.d3Viz);
    if (!config) return;
    const root = createRoot(node);
    roots.push(root);
    root.render(<VisualizationRenderer config={config} />);
  });
}

function VisualizationRenderer({ config }) {
  if (config.type === 'line') return <SeriesChart rows={config.rows} variant="line" />;
  if (config.type === 'area') return <SeriesChart rows={config.rows} variant="area" />;
  if (config.type === 'bar') return <BarChart rows={config.rows} />;
  if (config.type === 'pie') return <PieChart rows={config.rows} variant="pie" />;
  if (config.type === 'donut') return <PieChart rows={config.rows} variant="donut" />;
  if (config.type === 'sankey') return <RankingSankey rows={config.rows} />;
  if (config.type === 'flow') return <ProcessSankey selectedEntity={config.selectedEntity} />;
  if (config.type === 'trend') return <TrendChart points={config.points} />;
  if (config.type === 'mini-bars') return <MiniBars rows={config.rows} />;
  return <div className="viz-empty">Visualization unavailable</div>;
}

function ChartFrame({ children, className = '' }) {
  return <div className={`d3-chart ${className}`.trim()}>{children}</div>;
}

function SeriesChart({ rows = [], variant }) {
  const width = 760;
  const height = 250;
  const margin = { top: 24, right: 24, bottom: 44, left: 24 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const values = rows.map(row => row.pricing || 0);
  const yMax = Math.max(100, d3.max(values) || 0);
  const x = d3.scalePoint().domain(rows.map(row => row.vendor)).range([margin.left, margin.left + plotWidth]);
  const y = d3.scaleLinear().domain([0, yMax]).nice().range([margin.top + plotHeight, margin.top]);
  const line = d3.line().x(row => x(row.vendor)).y(row => y(row.pricing || 0)).curve(d3.curveMonotoneX);
  const area = d3.area().x(row => x(row.vendor)).y0(y(0)).y1(row => y(row.pricing || 0)).curve(d3.curveMonotoneX);
  const path = line(rows) || '';
  const areaPath = area(rows) || '';

  return (
    <ChartFrame>
      <svg viewBox={`0 0 ${width} ${height}`} className="d3-svg" role="img" aria-label={`${variant} chart`}>
        <line x1={margin.left} y1={y(0)} x2={margin.left + plotWidth} y2={y(0)} className="d3-axis-line" />
        {variant === 'area' ? <path d={areaPath} className="d3-area-fill" /> : null}
        <path d={path} className="d3-line-path" />
        {rows.map((row, index) => (
          <g key={row.id || `${row.vendor}-${index}`}>
            <circle cx={x(row.vendor)} cy={y(row.pricing || 0)} r={variant === 'area' ? 6 : 7} className={`d3-point ${variant}`} />
            <text x={x(row.vendor)} y={height - 14} textAnchor="middle" className="d3-axis-label">
              {row.vendor}
            </text>
          </g>
        ))}
      </svg>
    </ChartFrame>
  );
}

function BarChart({ rows = [] }) {
  const width = 760;
  const height = 280;
  const margin = { top: 24, right: 24, bottom: 56, left: 24 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const x = d3.scaleBand().domain(rows.map(row => row.vendor)).range([margin.left, margin.left + plotWidth]).padding(0.24);
  const y = d3.scaleLinear().domain([0, Math.max(100, d3.max(rows, row => row.pricing || 0) || 0)]).nice().range([margin.top + plotHeight, margin.top]);

  return (
    <ChartFrame>
      <svg viewBox={`0 0 ${width} ${height}`} className="d3-svg" role="img" aria-label="bar chart">
        <line x1={margin.left} y1={y(0)} x2={margin.left + plotWidth} y2={y(0)} className="d3-axis-line" />
        {rows.map((row, index) => {
          const barHeight = y(0) - y(row.pricing || 0);
          return (
            <g key={row.id || `${row.vendor}-${index}`}>
              <rect
                x={x(row.vendor)}
                y={y(row.pricing || 0)}
                width={x.bandwidth()}
                height={barHeight}
                rx="16"
                className={`d3-bar tone-${index % palette.length}`}
              />
              <text x={(x(row.vendor) || 0) + x.bandwidth() / 2} y={y(row.pricing || 0) - 10} textAnchor="middle" className="d3-bar-value">
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

function PieChart({ rows = [], variant }) {
  const radius = 78;
  const arc = d3.arc().innerRadius(variant === 'donut' ? 42 : 0).outerRadius(radius);
  const pie = d3.pie().sort(null).value(row => row.pricing || 0);
  const slices = pie(rows);

  return (
    <ChartFrame className="d3-pie-frame">
      <svg viewBox="-96 -96 192 192" className="d3-pie-svg" role="img" aria-label={`${variant} chart`}>
        {slices.map((slice, index) => (
          <path key={rows[index]?.id || index} d={arc(slice) || ''} fill={palette[index % palette.length]} opacity="0.92" />
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

function RankingSankey({ rows = [] }) {
  const graph = useMemo(() => {
    const topRows = rows.slice(0, 5);
    const nodes = [{ id: 'score', name: 'Portfolio Score' }, ...topRows.map(row => ({ id: row.id || row.vendor, name: row.vendor }))];
    const links = topRows.map(row => ({
      source: row.id || row.vendor,
      target: 'score',
      value: Math.max(8, row.pricing || 0)
    }));

    return createSankeyGraph(nodes, links, 760, 280);
  }, [rows]);

  return <SankeySvg graph={graph} ariaLabel="sankey chart" />;
}

function ProcessSankey({ selectedEntity }) {
  const graph = useMemo(() => createSankeyGraph(flowGraph.nodes, flowGraph.links, 960, 280), []);
  return <SankeySvg graph={graph} ariaLabel="process flow chart" selectedEntity={selectedEntity} />;
}

function SankeySvg({ graph, ariaLabel, selectedEntity }) {
  return (
    <ChartFrame className="d3-sankey-frame">
      <svg viewBox={`0 0 ${graph.width} ${graph.height}`} className="d3-svg" role="img" aria-label={ariaLabel}>
        {graph.links.map((link, index) => (
          <path
            key={`link-${index}`}
            d={sankeyLinkHorizontal()(link)}
            className={`d3-sankey-link${selectedEntity && (link.source.id === selectedEntity || link.target.id === selectedEntity) ? ' active' : ''}`}
          />
        ))}
        {graph.nodes.map(node => (
          <g key={node.id}>
            <rect
              x={node.x0}
              y={node.y0}
              width={Math.max(14, node.x1 - node.x0)}
              height={Math.max(18, node.y1 - node.y0)}
              rx="16"
              className={`d3-sankey-node${selectedEntity === node.id ? ' active' : ''}`}
            />
            <text x={node.x0 + 12} y={node.y0 - 8} className="d3-sankey-label">
              {node.name}
            </text>
            {'value' in node && node.value ? (
              <text x={node.x0 + 12} y={node.y1 + 18} className="d3-sankey-value">
                {node.value}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </ChartFrame>
  );
}

function TrendChart({ points = [] }) {
  const parsed = points.map(([label, rawValue]) => {
    const match = String(rawValue).match(/-?\d+(\.\d+)?/);
    return { label, value: match ? Number(match[0]) : 0 };
  });
  const width = 280;
  const height = 96;
  const margin = { top: 16, right: 12, bottom: 20, left: 12 };
  const x = d3.scalePoint().domain(parsed.map(point => point.label)).range([margin.left, width - margin.right]);
  const domainMin = d3.min(parsed, point => point.value) || 0;
  const domainMax = d3.max(parsed, point => point.value) || 1;
  const y = d3.scaleLinear().domain([domainMin, domainMax]).nice().range([height - margin.bottom, margin.top]);
  const line = d3.line().x(point => x(point.label)).y(point => y(point.value)).curve(d3.curveMonotoneX);

  return (
    <ChartFrame className="d3-trend-frame">
      <svg viewBox={`0 0 ${width} ${height}`} className="d3-svg" role="img" aria-label="trend chart">
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="d3-axis-line subtle" />
        <path d={line(parsed) || ''} className="d3-line-path trend" />
        {parsed.map((point, index) => (
          <circle key={`${point.label}-${index}`} cx={x(point.label)} cy={y(point.value)} r={index === parsed.length - 1 ? 4.5 : 3.5} className="d3-trend-point" />
        ))}
      </svg>
      <div className="d3-trend-axis">
        {parsed.map(point => <span key={point.label}>{point.label.replace('Day ', 'D')}</span>)}
      </div>
    </ChartFrame>
  );
}

function MiniBars({ rows = [] }) {
  return (
    <div className="d3-mini-bars">
      {rows.map(([label, value, status], index) => (
        <div className="d3-mini-row" key={`${label}-${index}`}>
          <span>{label}</span>
          <div className="d3-mini-track">
            <svg viewBox="0 0 100 12" className="d3-mini-svg" aria-hidden="true">
              <rect x="0" y="0" width="100" height="12" rx="6" className="d3-mini-track-fill" />
              <rect x="0" y="0" width={Math.max(0, Math.min(100, value))} height="12" rx="6" className={`d3-mini-fill tone-${index % palette.length}`} />
            </svg>
          </div>
          <span>{status}</span>
        </div>
      ))}
    </div>
  );
}

function createSankeyGraph(nodes, links, width, height) {
  const generator = createSankey()
    .nodeId(node => node.id)
    .nodeWidth(22)
    .nodePadding(42)
    .extent([[24, 24], [width - 24, height - 24]]);

  return {
    ...generator({
      nodes: nodes.map(node => ({ ...node })),
      links: links.map(link => ({ ...link }))
    }),
    width,
    height
  };
}
