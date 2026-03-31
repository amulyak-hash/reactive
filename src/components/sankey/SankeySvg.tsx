import { sankeyLinkHorizontal, type SankeyLink, type SankeyNode } from 'd3-sankey';

import { ChartFrame } from '../chartFrame/ChartFrame';
import type { SankeyLinkData, SankeyNodeData, SankeySvgProps } from '../../types';

function isResolvedSankeyLink(link: SankeyLink<SankeyNodeData, SankeyLinkData>): link is SankeyLink<SankeyNodeData, SankeyLinkData> & {
  source: SankeyNode<SankeyNodeData, SankeyLinkData>;
  target: SankeyNode<SankeyNodeData, SankeyLinkData>;
} {
  return typeof link.source !== 'string' && typeof link.source !== 'number' && typeof link.target !== 'string' && typeof link.target !== 'number';
}

export function SankeySvg({ graph, ariaLabel, selectedEntity, className, colors }: SankeySvgProps) {
  const nodePalette = colors?.nodes ?? [];

  return (
    <ChartFrame className={['d3-sankey-frame', className].filter(Boolean).join(' ')}>
      <svg viewBox={`0 0 ${graph.width} ${graph.height}`} className="d3-svg" role="img" aria-label={ariaLabel}>
        {graph.links.map((link, index) => (
          <path
            key={`link-${index}`}
            d={sankeyLinkHorizontal<SankeyNodeData, SankeyLinkData>()(link) ?? undefined}
            className={`d3-sankey-link${selectedEntity && isResolvedSankeyLink(link) && (link.source.id === selectedEntity || link.target.id === selectedEntity) ? ' active' : ''}`}
            stroke={selectedEntity && isResolvedSankeyLink(link) && (link.source.id === selectedEntity || link.target.id === selectedEntity) ? colors?.activeLinks : colors?.links}
          />
        ))}
        {graph.nodes.map((node, index) => (
          <g key={node.id}>
            <rect
              x={node.x0 ?? 0}
              y={node.y0 ?? 0}
              width={Math.max(14, (node.x1 ?? 0) - (node.x0 ?? 0))}
              height={Math.max(18, (node.y1 ?? 0) - (node.y0 ?? 0))}
              rx="16"
              className={`d3-sankey-node${selectedEntity === node.id ? ' active' : ''}`}
              fill={selectedEntity === node.id ? colors?.activeNodes : nodePalette[index % nodePalette.length]}
            />
            <text x={(node.x0 ?? 0) + 12} y={(node.y0 ?? 0) - 8} className="d3-sankey-label">
              {node.name}
            </text>
            {node.valueLabel ? (
              <text x={(node.x0 ?? 0) + 12} y={(node.y1 ?? 0) + 18} className="d3-sankey-value">
                {node.valueLabel}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </ChartFrame>
  );
}
