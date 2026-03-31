import { useMemo } from 'react';

import { flowGraph } from '../constants';
import { SankeySvg } from './SankeySvg';
import { createSankeyGraph } from './sankeyUtils';
import type { ProcessSankeyProps } from '../../types';

export function ProcessSankey({ selectedEntity, className, colors }: ProcessSankeyProps) {
  const graph = useMemo(() => createSankeyGraph(flowGraph.nodes, flowGraph.links, 960, 280), []);

  return <SankeySvg graph={graph} ariaLabel="process flow chart" selectedEntity={selectedEntity} className={className} colors={colors} />;
}
