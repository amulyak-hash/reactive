import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store';
import { getEntityColor } from '../../data/entityGraph';
import { C } from '../../theme/tokens';

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Normalize event value to size (0.3 - 0.7)
function valueToSize(value, type) {
  if (type === 'early-warning') {
    const min = 190, max = 350;
    const t = Math.min(Math.max((value - min) / (max - min), 0), 1);
    return 0.35 + t * 0.3;
  }
  if (type === 'nce') {
    const min = 80, max = 400;
    const t = Math.min(Math.max((value - min) / (max - min), 0), 1);
    return 0.3 + t * 0.35;
  }
  // package
  const min = 100, max = 5000;
  const t = Math.min(Math.max((value - min) / (max - min), 0), 1);
  return 0.3 + t * 0.4;
}

function formatValue(value) {
  if (value >= 1000) return `£${(value / 1000).toFixed(1)}M`;
  return `£${value}K`;
}

export default function EventNode({ entity, position, parentPosition, entryProgressRef }) {
  const meshRef = useRef();
  const pulseRef = useRef();
  const hoverEntity = useStore(s => s.hoverEntity);
  const hoveredEntity = useStore(s => s.hoveredEntity);
  const expandedEntity = useStore(s => s.expandedEntity);

  const color = useMemo(() => getEntityColor(entity), [entity]);
  const size = useMemo(() => valueToSize(entity.value, entity.type), [entity.value, entity.type]);
  const isHovered = hoveredEntity === entity.id;
  const parentExpanded = expandedEntity === entity.orbit?.parent;

  // Is this EW stale?
  const isStale = entity.type === 'early-warning' && entity.metrics?.daysOpen > 14;

  useFrame((state) => {
    if (!meshRef.current) return;
    const p = entryProgressRef.current;
    // Events enter at 0.64 - 1.0
    const entryP = easeOutBack(Math.min(Math.max((p - 0.64) / 0.36, 0), 1));

    // When parent is expanded, spread out; when collapsed, cluster tight
    const spreadScale = parentExpanded ? 1.0 : 0.6;
    const targetScale = entryP * spreadScale * (isHovered ? 1.2 : 1);
    const current = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(current, Math.max(0.001, targetScale), 0.1));

    // Pulsing ring for stale EWs
    if (pulseRef.current && isStale) {
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 3);
      pulseRef.current.material.opacity = 0.3 * pulse;
      pulseRef.current.scale.setScalar(1 + pulse * 0.15);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    hoverEntity(entity.id);
    document.body.style.cursor = parentExpanded ? 'pointer' : 'default';
  };

  const handlePointerOut = () => {
    hoverEntity(null);
    document.body.style.cursor = 'default';
  };

  if (!position) return null;

  return (
    <group position={position}>
      <group
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* EW: Filled sphere */}
        {entity.type === 'early-warning' && (
          <>
            <mesh>
              <sphereGeometry args={[size, 24, 24]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.6}
                transparent
                opacity={0.85}
              />
            </mesh>
            {/* Stale pulse ring */}
            {isStale && (
              <mesh ref={pulseRef}>
                <torusGeometry args={[size * 1.4, 0.03, 8, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
              </mesh>
            )}
          </>
        )}

        {/* NCE: Rounded box */}
        {entity.type === 'nce' && (
          <RoundedBox args={[size * 1.6, size * 1.6, size * 0.6]} radius={size * 0.2} smoothness={4}>
            <meshStandardMaterial
              color="#0d1520"
              emissive={color}
              emissiveIntensity={entity.flagged ? 0.5 : 0.3}
              metalness={0.6}
              roughness={0.4}
            />
          </RoundedBox>
        )}

        {/* Package: Hexagon (cylinder with 6 segments) */}
        {entity.type === 'package' && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size, size, size * 0.4, 6]} />
            <meshStandardMaterial
              color="#0d1520"
              emissive={color}
              emissiveIntensity={0.3}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
        )}
      </group>

      {/* Floating label — only when parent expanded AND not hovered (tooltip takes over on hover) */}
      {parentExpanded && !isHovered && (
        <Billboard position={[0, size + 0.8, 0]}>
          <Html center style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{
              textAlign: 'center',
              fontFamily: "'Satoshi', sans-serif",
              whiteSpace: 'nowrap',
            }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: color }}>
                {entity.shortLabel}
              </div>
              <div style={{ fontSize: 8, fontWeight: 600, color: '#fff', marginTop: 2 }}>
                {formatValue(entity.value)}
              </div>
              {entity.type === 'early-warning' && (
                <div style={{ fontSize: 7, color: isStale ? C.red : 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                  {entity.metrics.daysOpen}d {isStale ? 'stale' : 'open'}
                </div>
              )}
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}
