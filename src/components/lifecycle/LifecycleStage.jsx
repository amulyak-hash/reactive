import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import StageViz3D from './StageViz3D';
import SplitRing from './SplitRing';
import { USE_CASE_MAP } from '../../data/useCases';

function easeOutBack(t) {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

export default function LifecycleStage({ stage, startRef, onClick }) {
  const groupRef = useRef();
  const platformRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  const uc = USE_CASE_MAP[stage.ucId];
  const accent = stage.accent;

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = (performance.now() - startRef.current) / 1000;

    // Staggered reveal
    const t = Math.min(Math.max((elapsed - stage.revealStart) / stage.revealDur, 0), 1);
    const p = easeOutBack(t);

    // Rise from below + scale
    const targetY = hovered ? 0.6 : 0;
    const currentY = groupRef.current.position.y;
    groupRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY + (1 - p) * -2, 0.08);
    groupRef.current.scale.setScalar(Math.max(0.001, p * (hovered ? 1.08 : 1)));

    // Show label once mostly revealed
    if (p > 0.7 && !visible) setVisible(true);

    // Platform emissive
    if (platformRef.current) {
      const targetOpacity = p >= 1 ? 0.85 : 0.85;
      platformRef.current.material.opacity = THREE.MathUtils.lerp(
        platformRef.current.material.opacity, targetOpacity, 0.05
      );
    }
  });

  const pw = 2.6;
  const pd = 1.4;
  const ph = 0.12;

  return (
    <group ref={groupRef} position={stage.position}>
      {/* Glass platform */}
      <RoundedBox
        ref={platformRef}
        args={[pw, ph, pd]}
        radius={0.1}
        smoothness={4}
        onClick={(e) => { e.stopPropagation(); onClick?.(stage.ucId); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <meshStandardMaterial
          color="#1a2535"
          emissive={accent}
          emissiveIntensity={hovered ? 0.5 : stage.isSplitPoint ? 0.3 : 0.2}
          metalness={0.5}
          roughness={0.4}
          transparent
          opacity={0.95}
        />
      </RoundedBox>

      {/* Top edge glow */}
      <mesh position={[0, ph / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[pw - 0.2, pd - 0.2]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={hovered ? 0.08 : 0.03}
        />
      </mesh>

      {/* 3D visualization — scaled up for visibility */}
      <group position={[0, ph / 2 + 0.01, 0]} scale={stage.vizScale || 1.4}>
        <StageViz3D vizType={stage.vizType} accent={accent} hovered={hovered} pw={pw} pd={pd} />
      </group>

      {/* Split ring indicator */}
      {stage.isSplitPoint && (
        <SplitRing accent={accent} startRef={startRef} revealStart={stage.revealStart} />
      )}

      {/* Isometric 3D text label — lies flat on ground plane */}
      {visible && (
        <group position={[0, 0.08, pd / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text
            fontSize={0.32}
            color={accent}
            anchorX="center"
            anchorY="top"
            letterSpacing={0.08}
          >
            {stage.label}
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.2}
            color="#8899aa"
            anchorX="center"
            anchorY="top"
          >
            {stage.subtitle}
          </Text>
        </group>
      )}

      {/* Hover tooltip — screen-space Html, only on hover */}
      {hovered && uc?.insightHeadline && (
        <Html
          center
          position={[0, 2.5, 0]}
          zIndexRange={[1000, 999]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            textAlign: 'center',
            fontFamily: "'Satoshi', sans-serif",
            background: 'rgba(10, 16, 29, 0.88)',
            backdropFilter: 'blur(14px)',
            border: `1px solid ${accent}40`,
            borderRadius: 10,
            padding: '10px 14px',
            maxWidth: 200,
            minWidth: 160,
            boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 12px ${accent}15`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: accent }}>
              {stage.label}
            </div>
            <div style={{
              fontSize: 11,
              color: 'rgba(245,247,251,0.6)',
              lineHeight: 1.4,
              marginTop: 6,
              borderTop: `1px solid ${accent}20`,
              paddingTop: 6,
            }}>
              {uc.insightHeadline}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
