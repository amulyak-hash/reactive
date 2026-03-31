import { sankey as createSankey, type SankeyGraph, type SankeyNode } from 'd3-sankey';

import type { SankeyLinkData, SankeyNodeData } from '../../types';

export type SizedSankeyGraph = SankeyGraph<SankeyNodeData, SankeyLinkData> & {
  width: number;
  height: number;
};

export function createSankeyGraph(nodes: SankeyNodeData[], links: SankeyLinkData[], width: number, height: number): SizedSankeyGraph {
  const generator = createSankey<SankeyNodeData, SankeyLinkData>()
    .nodeId((node: SankeyNode<SankeyNodeData, SankeyLinkData>) => node.id)
    .nodeWidth(22)
    .nodePadding(42)
    .extent([[24, 24], [width - 24, height - 24]]);

  return {
    ...generator({
      nodes: nodes.map((node) => ({ ...node })),
      links: links.map((link) => ({ ...link }))
    }),
    width,
    height
  };
}
