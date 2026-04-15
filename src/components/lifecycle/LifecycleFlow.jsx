import { useRef, useMemo } from 'react';
import SafeConnectionTube from './SafeConnectionTube';
import { STAGES, FLOW_EDGES } from './lifecycleData';
import LifecycleStage from './LifecycleStage';

export default function LifecycleFlow({ onNodeClick }) {
  const startRef = useRef(performance.now());

  const edges = useMemo(() =>
    FLOW_EDGES.map(({ from, to }) => ({
      from: STAGES[from].position,
      to: STAGES[to].position,
      color: STAGES[from].accent,
      revealStart: Math.max(STAGES[from].revealStart, STAGES[to].revealStart),
    })),
  []);

  return (
    <group>
      {/* Flow connections */}
      {edges.map((edge, i) => (
        <SafeConnectionTube key={`edge-${i}`} edge={edge} startRef={startRef} />
      ))}

      {/* Stage platforms */}
      {STAGES.map((stage) => (
        <LifecycleStage
          key={stage.id}
          stage={stage}
          startRef={startRef}
          onClick={(ucId) => onNodeClick?.(ucId)}
        />
      ))}
    </group>
  );
}
