import { useMemo } from 'react';

import { SankeySvg } from './SankeySvg';
import { createSankeyGraph } from './sankeyUtils';
import type { RankingSankeyProps } from '../../types';

export function RankingSankey({ rows = [], className, colors }: RankingSankeyProps) {
  const graph = useMemo(() => {
    const topRows = rows.slice(0, 5);
    const nodes = [{ id: 'score', name: 'Portfolio Score' }, ...topRows.map((row) => ({ id: row.id || row.vendor, name: row.vendor }))];
    const links = topRows.map((row) => ({
      source: row.id || row.vendor,
      target: 'score',
      value: Math.max(8, row.pricing || 0)
    }));

    return createSankeyGraph(nodes, links, 760, 280);
  }, [rows]);

  return <SankeySvg graph={graph} ariaLabel="sankey chart" className={className} colors={colors} />;
}
