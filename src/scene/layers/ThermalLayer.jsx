import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ZONES } from '../../data/tataSteel';

/**
 * ThermalLayer — renders heat-indicating volumes at each zone position.
 * Uses layered transparent spheres with color ramps based on zone status.
 * Alert zones glow hot (red-orange), OK zones show cool (blue-green).
 */

const THERMAL_COLORS = {
  hot: new THREE.Color('#FF4422'),
  warm: new THREE.Color('#FF8844'),
  cool: new THREE.Color('#2288CC'),
  cold: new THREE.Color('#22DDEE'),
};

function ThermalVolume({ position, temperature, radius = 3 }) {
  const meshRef = useRef();
  const innerRef = useRef();
  const color = temperature > 0.6 ? THERMAL_COLORS.hot : temperature > 0.3 ? THERMAL_COLORS.warm : THERMAL_COLORS.cool;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.12 + 0.05 * Math.sin(t * 1.5 + temperature * 10);
      meshRef.current.scale.setScalar(1 + 0.03 * Math.sin(t * 2));
    }
    if (innerRef.current) {
      innerRef.current.material.opacity = 0.2 + 0.1 * Math.sin(t * 2.5 + temperature * 5);
    }
  });

  return (
    <group position={position}>
      {/* Outer haze */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 20, 20]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Inner core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[radius * 0.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function ThermalLayer({ zonePositions }) {
  // Map zones to temperature values (alert = hot, ok = cool)
  const thermalData = useMemo(() =>
    ZONES.map(zone => ({
      id: zone.id,
      position: zonePositions[zone.id],
      temperature: zone.status === 'alert' ? 0.85 : 0.2,
    })).filter(d => d.position),
  [zonePositions]);

  return (
    <group>
      {thermalData.map(d => (
        <ThermalVolume
          key={d.id}
          position={d.position}
          temperature={d.temperature}
          radius={3.5}
        />
      ))}
    </group>
  );
}
