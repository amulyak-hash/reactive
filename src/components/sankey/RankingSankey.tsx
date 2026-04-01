import { useMemo } from 'react';

import { SankeySvg } from './SankeySvg';
import type { RankingSankeyProps, SankeyNodeData, SankeyLinkData } from '../../types';

export function RankingSankey({ rows = [], className, colors }: RankingSankeyProps) {
  const { nodes, links } = useMemo(() => {
    const topRows = rows.slice(0, 5);
    const sankeyNodes: SankeyNodeData[] = [
      { id: 'score', name: 'Portfolio Score' },
      ...topRows.map(row => ({ id: row.id ?? row.vendor, name: row.vendor })),
    ];
    const sankeyLinks: SankeyLinkData[] = topRows.map(row => ({
      source: row.id ?? row.vendor,
      target: 'score',
      value: Math.max(8, row.pricing ?? 0),
    }));
    return { nodes: sankeyNodes, links: sankeyLinks };
  }, [rows]);

  return (
    <SankeySvg
      nodes={nodes}
      links={links}
      width={760}
      height={280}
      ariaLabel="sankey chart"
      className={className}
      colors={colors}
    />
  );
}
