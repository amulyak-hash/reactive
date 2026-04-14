import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store';
import { getEntityColor } from '../../data/entityGraph';

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Normalize contractor value to sphere radius (0.6 - 1.1)
function valueToRadius(value) {
  const min = 11100, max = 35500;
  const t = (value - min) / (max - min);
  return 0.6 + t * 0.5;
}

export default function ContractorNode({ entity, position, index, entryProgressRef }) {
  const meshRef = useRef();
  const arcRef = useRef();
  const focusEntity = useStore(s => s.focusEntity);
  const hoverEntity = useStore(s => s.hoverEntity);
  const hoveredEntity = useStore(s => s.hoveredEntity);
  const expandedEntity = useStore(s => s.expandedEntity);

  const color = useMemo(() => getEntityColor(entity), [entity]);
  const radius = useMemo(() => valueToRadius(entity.value), [entity.value]);
  const isHovered = hoveredEntity === entity.id;
  const isExpanded = expandedEntity === entity.id;

  const arcAngle = (entity.metrics.variationPct / 100) * Math.PI * 2;

  useFrame((state) => {
    if (!meshRef.current) return;
    const p = entryProgressRef.current;
    const entryDelay = 0.32 + index * 0.05;
    const nodeP = easeOutBack(Math.min(Math.max((p - entryDelay) / 0.2, 0), 1));

    const targetScale = isExpanded ? 1.4 : isHovered ? 1.1 : 1;
    const currentScale = meshRef.current.scale.x;
    const lerpedScale = THREE.MathUtils.lerp(currentScale, nodeP * targetScale, 0.1);
    meshRef.current.scale.setScalar(Math.max(0.001, lerpedScale));

    if (arcRef.current) {
      arcRef.current.scale.setScalar(Math.max(0.001, lerpedScale));
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    focusEntity(entity.id);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    hoverEntity(entity.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    hoverEntity(null);
    document.body.style.cursor = 'default';
  };

  if (!position) return null;

  return (
    <group position={position}>
      {/* Main sphere — emissive drives bloom glow, no separate glow mesh */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color="#0a1018"
          emissive={color}
          emissiveIntensity={isHovered ? 0.6 : 0.35}
          metalness={0.8}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>

      {/* Severity arc ring */}
      <group ref={arcRef} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh>
          <torusGeometry args={[radius * 1.2, 0.035, 8, 32, arcAngle]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </group>

      {/* Floating label — hidden when hovered (tooltip takes over) */}
      {!isHovered && (
        <Billboard position={[0, radius + 1.2, 0]}>
          <Html center style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{
              textAlign: 'center',
              fontFamily: "'Satoshi', sans-serif",
              whiteSpace: 'nowrap',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: color,
                textShadow: `0 0 8px ${color}40`,
              }}>
                {entity.shortLabel}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#fff',
                textShadow: `0 0 6px ${color}30`,
                marginTop: 2,
              }}>
                £{(entity.value / 1000).toFixed(1)}M
              </div>
            </div>
          </Html>
        </Billboard>
      )}

      {/* Expanded detail */}
      {isExpanded && (
        <Billboard position={[0, -(radius + 1), 0]}>
          <Html center style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{
              textAlign: 'center',
              fontFamily: "'Satoshi', sans-serif",
              whiteSpace: 'nowrap',
              background: 'rgba(7,11,18,0.85)',
              padding: '4px 10px',
              borderRadius: 8,
              border: `1px solid ${color}30`,
            }}>
              <div style={{ fontSize: 9, color: color, fontWeight: 600 }}>
                {entity.metrics.nceCount} NCEs · {entity.metrics.ewCount} EWs
              </div>
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}
