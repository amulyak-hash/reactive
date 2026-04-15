import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import { C } from '../../theme/tokens';

function easeOutBack(t) {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

export default function IsometricHub({ startRef }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = (performance.now() - startRef.current) / 1000;
    const p = easeOutBack(Math.min(elapsed / 1.0, 1));
    groupRef.current.scale.setScalar(Math.max(0.001, p));
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Platform */}
      <RoundedBox args={[1.2, 0.08, 0.8]} radius={0.06} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#1a2a3a"
          emissive={C.teal}
          emissiveIntensity={0.2}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </RoundedBox>

      {/* Subtle edge highlight on platform top */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.64, 32]} />
        <meshBasicMaterial color={C.teal} transparent opacity={0.1} toneMapped={false} />
      </mesh>

      {/* Label */}
      <Html center position={[0, 0.8, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          textAlign: 'center',
          fontFamily: "'Satoshi', sans-serif",
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: 9, color: 'rgba(245,247,251,0.5)', letterSpacing: '0.1em' }}>
            PORT TALBOT
          </div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: C.teal,
            textShadow: `0 0 12px ${C.teal}40`,
            marginTop: 2,
          }}>
            £93.2M
          </div>
        </div>
      </Html>
    </group>
  );
}
