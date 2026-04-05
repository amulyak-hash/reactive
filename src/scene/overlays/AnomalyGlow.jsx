import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AnomalyGlow — renders a pulsing emissive sphere at a zone position
 * to indicate an active anomaly. Color = zone accent, intensity oscillates.
 */
export default function AnomalyGlow({ position, color, intensity = 1.5, radius = 2 }) {
  const meshRef = useRef();
  const glowColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // Pulsing: oscillate between 0.3 and 1.0 intensity
    const pulse = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2.5));
    meshRef.current.material.opacity = pulse * 0.35;
    meshRef.current.scale.setScalar(1 + 0.08 * Math.sin(t * 3));
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshBasicMaterial
        color={glowColor}
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
