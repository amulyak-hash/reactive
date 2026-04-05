import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ZONES } from '../../data/tataSteel';

/**
 * SafetyLayer — semi-transparent exclusion zone cylinders around equipment.
 * Alert zones get pulsing red cylinders. OK zones get faint green outlines.
 */

function ExclusionZone({ position, isAlert, radius = 4, height = 8 }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const color = isAlert ? new THREE.Color('#F06060') : new THREE.Color('#34D399');

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    if (isAlert) {
      // Pulse opacity and scale for alert zones
      meshRef.current.material.opacity = 0.06 + 0.04 * Math.sin(t * 2);
      meshRef.current.scale.y = 1 + 0.05 * Math.sin(t * 1.5);
    }

    // Rotate ring slowly
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group position={[position[0], position[1] - 1, position[2]]}>
      {/* Exclusion cylinder */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[radius, radius, height, 24, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isAlert ? 0.08 : 0.03}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Ground ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2 + 0.1, 0]}>
        <ringGeometry args={[radius - 0.1, radius, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isAlert ? 0.4 : 0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Top ring (for alert zones) */}
      {isAlert && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height / 2, 0]}>
          <ringGeometry args={[radius - 0.1, radius, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Vertical warning lines for alert zones */}
      {isAlert && [0, 1, 2, 3].map(i => {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([x, -height / 2, z, x, height / 2, z])}
                count={2}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} transparent opacity={0.25} />
          </line>
        );
      })}
    </group>
  );
}

export default function SafetyLayer({ zonePositions }) {
  return (
    <group>
      {ZONES.map(zone => {
        const pos = zonePositions[zone.id];
        if (!pos) return null;

        return (
          <ExclusionZone
            key={zone.id}
            position={pos}
            isAlert={zone.status === 'alert'}
          />
        );
      })}
    </group>
  );
}
