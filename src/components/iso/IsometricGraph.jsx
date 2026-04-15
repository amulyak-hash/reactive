import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { C } from '../../theme/tokens';
import IsometricCard from './IsometricCard';
import IsometricHub from './IsometricHub';
import ConnectionTube from './ConnectionTube';

// Manual scattered positions — organic, asymmetric, filling the viewport
// [X, Y, Z] — Y is height (all on ground plane with slight variation)
// Positions: [X, Y, Z]
// Isometric from (15,12,15): -X = screen bottom-left, +X = screen top-right
// -Z = screen top-left, +Z = screen bottom-right
// Keep Z in tight range [-3, 3] to avoid cards going too high/low
// Spread wide on X for horizontal distribution
// Isometric from (15,12,15): screenX ∝ (X-Z), screenY ∝ -(X+Z)
// Designed in screen space first, then converted to XZ:
//   X = (sX + sY) / -2,  Z = (sY - sX) / -2  (approx)
// Target screen positions spread across a 1440x900-ish viewport
const NODE_POSITIONS = [
  [12, 0, -4],     // 0: CRITICAL
  [11, 0, 7],      // 1: BLEED
  [1, 0, 9],       // 2: PATTERN
  [-9, 0, 9],      // 3: STALE
  [-11, 0, -1],    // 4: CASCADE
  [-7, 0, -11],    // 5: SAVE
  [1, 0, -9],      // 6: SILENT
  [8, 0, -10],     // 7: BRIEF
];

function getPosition(i) {
  return NODE_POSITIONS[i] || [0, 0, 0];
}

// Cross-connections
const CONNECTIONS = [
  [0, 4], [1, 3], [5, 2],
];

// Severity-staggered reveal (seconds)
const REVEAL = [
  { start: 1.0, dur: 1.5 },  // 0: red
  { start: 1.4, dur: 1.4 },  // 1: red
  { start: 3.5, dur: 1.5 },  // 2: amber
  { start: 3.0, dur: 1.5 },  // 3: orange
  { start: 5.0, dur: 1.5 },  // 4: purple
  { start: 5.5, dur: 1.5 },  // 5: cyan
  { start: 7.0, dur: 1.5 },  // 6: green
  { start: 6.0, dur: 1.5 },  // 7: blue
];

const CRITICAL = new Set([0, 1, 3, 4]);

export default function IsometricGraph({ useCases, onNodeClick }) {
  const startRef = useRef(performance.now());

  const nodes = useMemo(() =>
    useCases.slice(0, 8).map((uc, i) => ({
      uc, i,
      position: getPosition(i),
      reveal: REVEAL[i],
      isCritical: CRITICAL.has(i),
    })),
  [useCases]);

  const edgePairs = useMemo(() => {
    // Hub-to-node edges
    const hub = nodes.map(n => ({
      from: [0, 0, 0],
      to: n.position,
      color: n.uc.insightTagColor || n.uc.accent,
      revealStart: n.reveal.start,
    }));
    // Cross edges
    const cross = CONNECTIONS
      .filter(([a, b]) => a < nodes.length && b < nodes.length)
      .map(([a, b]) => ({
        from: nodes[a].position,
        to: nodes[b].position,
        color: nodes[a].uc.insightTagColor || nodes[a].uc.accent,
        revealStart: Math.max(nodes[a].reveal.start, nodes[b].reveal.start),
      }));
    return [...hub, ...cross];
  }, [nodes]);

  return (
    <group>
      {/* Hub */}
      <IsometricHub startRef={startRef} />

      {/* Connections */}
      {edgePairs.map((edge, i) => (
        <ConnectionTube key={`edge-${i}`} edge={edge} startRef={startRef} />
      ))}

      {/* Insight cards */}
      {nodes.map((n) => (
        <IsometricCard
          key={n.uc.id}
          uc={n.uc}
          index={n.i}
          position={n.position}
          reveal={n.reveal}
          isCritical={n.isCritical}
          startRef={startRef}
          onClick={() => onNodeClick?.(n.uc.id)}
        />
      ))}
    </group>
  );
}
