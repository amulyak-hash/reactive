import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ENTITIES, EDGES, getEntitiesByType, getChildEntities, getEntityColor } from '../../data/entityGraph';
import { useStore } from '../../store';
import HubNode from './HubNode';
import ContractorNode from './ContractorNode';
import EventNode from './EventNode';
import ConnectionEdge from './ConnectionEdge';
import FlowParticles from './FlowParticles';
import NodeTooltip from './NodeTooltip';

// Compute 3D positions for all entities
function computePositions(entities) {
  const positions = {};
  // Hub at origin
  positions['hub'] = [0, 0, 0];

  // Contractors orbit hub
  const contractors = entities.filter(e => e.type === 'contractor');
  contractors.forEach(c => {
    const angle = Math.PI * c.orbit.angle;
    const r = c.orbit.radius;
    const y = Math.sin(angle * 0.3) * 1.5; // slight Y variation for depth
    positions[c.id] = [
      Math.cos(angle) * r,
      y,
      Math.sin(angle) * r,
    ];
  });

  // Events orbit their parent contractor
  const events = entities.filter(e =>
    e.type === 'early-warning' || e.type === 'nce' || e.type === 'package'
  );
  events.forEach(ev => {
    const parentPos = positions[ev.orbit.parent];
    if (!parentPos) return;
    const angle = Math.PI * ev.orbit.angle;
    const r = ev.orbit.radius;
    positions[ev.id] = [
      parentPos[0] + Math.cos(angle) * r,
      parentPos[1] + Math.sin(angle * 0.5) * 0.8,
      parentPos[2] + Math.sin(angle) * r,
    ];
  });

  return positions;
}

export default function ConstellationGraph() {
  const entryStart = useRef(performance.now());
  const entryProgressRef = useRef(0);

  const positions = useMemo(() => computePositions(ENTITIES), []);

  // Expose positions for CameraRig to read
  useEffect(() => {
    window.__nodePositions = positions;
    return () => { delete window.__nodePositions; };
  }, [positions]);

  const hub = useMemo(() => ENTITIES.find(e => e.type === 'hub'), []);
  const contractors = useMemo(() => getEntitiesByType('contractor'), []);
  const events = useMemo(() =>
    ENTITIES.filter(e => e.type === 'early-warning' || e.type === 'nce' || e.type === 'package'),
  []);

  // Compute bezier curves for all edges (used by ConnectionEdge and FlowParticles)
  const edgeCurves = useMemo(() => {
    return EDGES.map(edge => {
      const fromPos = positions[edge.from];
      const toPos = positions[edge.to];
      if (!fromPos || !toPos) return null;

      const from = new THREE.Vector3(...fromPos);
      const to = new THREE.Vector3(...toPos);
      const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
      // Pull control points slightly toward hub for curved arcs
      const hubPos = new THREE.Vector3(0, 0, 0);
      const cp1 = new THREE.Vector3().lerpVectors(from, hubPos, 0.15);
      cp1.y += 1.0; // slight upward arc
      const cp2 = new THREE.Vector3().lerpVectors(to, hubPos, 0.15);
      cp2.y += 1.0;

      const curve = new THREE.CubicBezierCurve3(from, cp1, cp2, to);
      return { ...edge, curve };
    }).filter(Boolean);
  }, [positions]);

  // Update entry animation progress
  useFrame(() => {
    const elapsed = performance.now() - entryStart.current;
    entryProgressRef.current = Math.min(elapsed / 2500, 1);
  });

  return (
    <group>
      {/* Ambient + point light for 3D shading */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 20, 10]} intensity={0.6} color="#29cfd6" />

      {/* Hub */}
      {hub && (
        <HubNode entity={hub} entryProgressRef={entryProgressRef} />
      )}

      {/* Contractors */}
      {contractors.map((c, i) => (
        <ContractorNode
          key={c.id}
          entity={c}
          position={positions[c.id]}
          index={i}
          entryProgressRef={entryProgressRef}
        />
      ))}

      {/* Events (EWs, NCEs, Packages) */}
      {events.map(ev => (
        <EventNode
          key={ev.id}
          entity={ev}
          position={positions[ev.id]}
          parentPosition={positions[ev.orbit.parent]}
          entryProgressRef={entryProgressRef}
        />
      ))}

      {/* Connections */}
      {edgeCurves.map((ec, i) => (
        <ConnectionEdge
          key={i}
          edge={ec}
          entryProgressRef={entryProgressRef}
        />
      ))}

      {/* Flow particles */}
      <FlowParticles edgeCurves={edgeCurves} entryProgressRef={entryProgressRef} />

      {/* Tooltip */}
      <NodeTooltip positions={positions} />
    </group>
  );
}
