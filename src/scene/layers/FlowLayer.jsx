import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * FlowLayer — animated particles flowing between zone positions
 * along the production pipeline: BF → SMS → CC → RM → QL.
 * Particles slow and bunch at alert zones (bottleneck visualization).
 */

const PARTICLE_COUNT = 200;
const PIPELINE_ORDER = ['bf', 'sms', 'cc', 'rm', 'ql'];

// Alert zones slow particles down
const ZONE_SPEEDS = {
  bf: 0.3,   // alert — slow
  sms: 1.0,
  cc: 0.3,   // alert — slow
  rm: 1.0,
  ql: 1.0,
};

function createCurve(zonePositions) {
  const points = PIPELINE_ORDER
    .map(id => zonePositions[id])
    .filter(Boolean)
    .map(p => new THREE.Vector3(p[0], p[1] + 0.5, p[2]));

  if (points.length < 2) return null;
  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
}

export default function FlowLayer({ zonePositions }) {
  const meshRef = useRef();
  const curve = useMemo(() => createCurve(zonePositions), [zonePositions]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize particle offsets (spread evenly along curve)
  const offsets = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i] = Math.random();
    }
    return arr;
  }, []);

  // Per-particle speed variation
  const speeds = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i] = 0.6 + Math.random() * 0.8;
    }
    return arr;
  }, []);

  // Color: cyan normally, amber at bottlenecks
  const colorNormal = useMemo(() => new THREE.Color('#22D3EE'), []);
  const colorBottleneck = useMemo(() => new THREE.Color('#FBBF24'), []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !curve) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Advance particle along curve
      offsets[i] = (offsets[i] + 0.0008 * speeds[i]) % 1;

      const u = offsets[i];
      const point = curve.getPointAt(u);
      dummy.position.copy(point);

      // Scale particles smaller at normal speed, larger at bottlenecks
      // Determine which segment we're in (0-1 maps to 5 zones)
      const segIdx = Math.min(Math.floor(u * PIPELINE_ORDER.length), PIPELINE_ORDER.length - 1);
      const zoneId = PIPELINE_ORDER[segIdx];
      const zoneSpeed = ZONE_SPEEDS[zoneId] || 1.0;

      const scale = zoneSpeed < 0.5 ? 0.12 : 0.06;
      dummy.scale.setScalar(scale + 0.015 * Math.sin(t * 4 + i));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!curve) return null;

  // Also render the path as a thin line
  const curvePoints = curve.getPoints(80);

  return (
    <group>
      {/* Flow path line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(curvePoints.flatMap(p => [p.x, p.y, p.z]))}
            count={curvePoints.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#22D3EE" transparent opacity={0.15} />
      </line>

      {/* Instanced particles */}
      <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color={colorNormal}
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}
