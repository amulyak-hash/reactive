import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EDGE_STYLES, getEntityById, getEntityColor } from '../../data/entityGraph';
import { useStore } from '../../store';

export default function ConnectionEdge({ edge, entryProgressRef }) {
  const meshRef = useRef();
  const focusedEntity = useStore(s => s.focusedEntity);

  const style = EDGE_STYLES[edge.type];

  // Determine color: risk edges use source entity severity color
  const edgeColor = useMemo(() => {
    if (style.color) return style.color;
    const sourceEntity = getEntityById(edge.from);
    if (sourceEntity) return getEntityColor(sourceEntity);
    return '#29cfd6';
  }, [edge.from, style.color]);

  // Create tube geometry from the curve
  const tubeGeometry = useMemo(() => {
    if (!edge.curve) return null;
    const points = edge.curve.getPoints(50);
    const tubeGeo = new THREE.TubeGeometry(edge.curve, 50, 0.015, 4, false);
    return tubeGeo;
  }, [edge.curve]);

  // Entry animation timing
  // Hub→contractor connections: 0.16-0.48
  // Contractor→event connections: 0.48-0.80
  const isHubConnection = edge.from === 'hub';
  const entryStart = isHubConnection ? 0.16 : 0.48;
  const entryEnd = isHubConnection ? 0.48 : 0.80;

  useFrame(() => {
    if (!meshRef.current || !tubeGeometry) return;
    const p = entryProgressRef.current;
    const entryP = Math.min(Math.max((p - entryStart) / (entryEnd - entryStart), 0), 1);

    // Animate draw range for entry
    const totalVertices = tubeGeometry.index
      ? tubeGeometry.index.count
      : tubeGeometry.attributes.position.count;
    const drawCount = Math.floor(entryP * totalVertices);

    if (tubeGeometry.index) {
      meshRef.current.geometry.setDrawRange(0, drawCount);
    }

    // Dim connections not related to focused entity
    if (focusedEntity) {
      const isFocusRelated = edge.from === focusedEntity || edge.to === focusedEntity;
      meshRef.current.material.opacity = isFocusRelated ? style.opacity : style.opacity * 0.15;
    } else {
      meshRef.current.material.opacity = style.opacity * entryP;
    }
  });

  if (!tubeGeometry) return null;

  return (
    <mesh ref={meshRef} geometry={tubeGeometry}>
      <meshBasicMaterial
        color={edgeColor}
        transparent
        opacity={style.opacity}
        depthWrite={false}
      />
    </mesh>
  );
}
