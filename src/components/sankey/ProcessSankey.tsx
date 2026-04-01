import { CausalFlowCanvas } from '../../canvas/CausalFlowCanvas';
import { flowGraph } from '../constants';
import type { ProcessSankeyProps } from '../../types';

export function ProcessSankey({ selectedEntity, colors: _colors }: ProcessSankeyProps) {
  return (
    <CausalFlowCanvas
      nodes={flowGraph.nodes}
      links={flowGraph.links}
      width={960}
      height={280}
      selectedEntity={selectedEntity}
    />
  );
}
