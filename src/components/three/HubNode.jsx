import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard } from '@react-three/drei';
import { useStore } from '../../store';
import { C } from '../../theme/tokens';

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export default function HubNode({ entity, entryProgressRef }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const p = entryProgressRef.current;
    const hubP = easeOutBack(Math.min(p / 0.24, 1));
    const scale = Math.max(0.001, hubP);
    meshRef.current.scale.setScalar(scale);

    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.2;
      ringRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main sphere — emissive drives bloom, no separate glow mesh */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color="#0a1420"
          emissive={C.teal}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>

      {/* Severity ring — smaller, tighter */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.04, 8, 32, Math.PI * 0.5]} />
          <meshBasicMaterial color={C.red} transparent opacity={0.7} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, Math.PI * 0.55]}>
          <torusGeometry args={[1.5, 0.04, 8, 32, Math.PI * 0.3]} />
          <meshBasicMaterial color={C.amber} transparent opacity={0.6} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, Math.PI * 0.9]}>
          <torusGeometry args={[1.5, 0.04, 8, 32, Math.PI * 0.2]} />
          <meshBasicMaterial color={C.green} transparent opacity={0.5} toneMapped={false} />
        </mesh>
      </group>

      {/* Label above */}
      <Billboard position={[0, 2.8, 0]}>
        <Html center style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            textAlign: 'center',
            fontFamily: "'Satoshi', sans-serif",
            whiteSpace: 'nowrap',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 500, color: 'rgba(245,247,251,0.7)',
              letterSpacing: '0.1em',
            }}>
              PORT TALBOT
            </div>
            <div style={{
              fontSize: 9, color: 'rgba(41,207,214,0.5)',
              marginTop: 2,
            }}>
              EAF Programme
            </div>
            <div style={{
              fontSize: 15, fontWeight: 700, color: '#fff',
              textShadow: '0 0 12px rgba(41,207,214,0.4)',
              marginTop: 5,
            }}>
              £93.2M
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
              exposure
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}
