import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

export default function SplitRing({ accent, startRef, revealStart }) {
  const ringRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (!ringRef.current) return;
    const elapsed = (performance.now() - startRef.current) / 1000;
    const revealP = easeOutCubic(Math.min(Math.max((elapsed - revealStart) / 1.2, 0), 1));

    // Pulse opacity
    const pulse = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    ringRef.current.material.opacity = pulse * revealP;
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.05 * revealP;
    }

    // Slow rotation
    ringRef.current.rotation.y += 0.003;
  });

  return (
    <group position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Inner ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.7, 0.8, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>
      {/* Outer glow halo */}
      <mesh ref={glowRef}>
        <ringGeometry args={[0.8, 1.1, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
