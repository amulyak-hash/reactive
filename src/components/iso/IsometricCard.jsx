import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import { C } from '../../theme/tokens';
import MiniViz3D from './MiniViz3D';

// Rotating facts per insight — cycles every 3s
const TICKER_LINES = [
  ['14 CEs across 5 contractors', 'Afcons at 25%, L&T at 6%', '£720.6M total portfolio'],
  ['3 packages, zero CEs raised', 'Electrical +34% over plan', '£1,200/day silent overrun'],
  ['7 claims under £50K each', 'RHI bid 12% below next bidder', '3 clauses used to spread claims'],
  ['12 EWs open, 19 days average', '≤5 days = £68K, 15+ = £310K', '3 on the critical path'],
  ['6 weeks delay → 14 weeks cascade', '£5M prelims + £16.8M production', 'Air-freight saves £23.2M'],
  ['£400K claimed, £240K fair value', 'No borehole data in Zone C', 'Clause 63.7 reduces assessment'],
  ['Keller 3 days past critical float', 'Severfield accelerating 2d/week', 'W. Hare undermanned 23 vs 31'],
  ['£90M gap recoverable in 30 days', 'Transformer = 30x ROI decision', '5 actions, board-ready pack'],
];

function easeOutBack(t) {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
}

// Dim factors for non-critical after reveal
const DIM = { critical: 1.0, normal: 0.8 };

export default function IsometricCard({ uc, index, position, reveal, isCritical, startRef, onClick }) {
  const groupRef = useRef();
  const platformRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const tickerLines = TICKER_LINES[index] || [];

  // Rotate ticker every 3 seconds
  useEffect(() => {
    if (!visible || tickerLines.length === 0) return;
    const interval = setInterval(() => {
      setTickerIdx(prev => (prev + 1) % tickerLines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [visible, tickerLines.length]);

  const accent = uc.insightTagColor || uc.accent;
  const { r: ar, g: ag, b: ab } = hexToRgb(accent);
  const valueText = uc.insightValue || uc.budgetImpact?.value || '';
  const tag = uc.insightTag || '';

  useFrame((state) => {
    if (!groupRef.current) return;
    const elapsed = (performance.now() - startRef.current) / 1000;

    // Severity-staggered entry
    const t = Math.min(Math.max((elapsed - reveal.start) / reveal.dur, 0), 1);
    const p = easeOutBack(t);

    // Rise from below + scale in
    const targetY = hovered ? 0.6 : 0;
    const currentY = groupRef.current.position.y;
    groupRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY + (1 - p) * -2, 0.08);
    groupRef.current.scale.setScalar(Math.max(0.001, p * (hovered ? 1.08 : 1)));

    // Show label once card is mostly revealed
    if (p > 0.7 && !visible) setVisible(true);

    // Dim non-critical after full reveal
    if (platformRef.current) {
      const dim = isCritical || hovered ? DIM.critical : DIM.normal;
      const targetOpacity = p >= 1 ? 0.8 * dim : 0.8;
      platformRef.current.material.opacity = THREE.MathUtils.lerp(
        platformRef.current.material.opacity, targetOpacity, 0.05
      );
    }
  });

  // Platform dimensions
  const pw = 2.6; // width (X) — wider for readability
  const pd = 1.4; // depth (Z)
  const ph = 0.12; // height (Y)

  return (
    <group ref={groupRef} position={position}>
      {/* Glass platform */}
      <RoundedBox
        ref={platformRef}
        args={[pw, ph, pd]}
        radius={0.1}
        smoothness={4}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <meshStandardMaterial
          color="#1a2535"
          emissive={accent}
          emissiveIntensity={hovered ? 0.5 : isCritical ? 0.3 : 0.2}
          metalness={0.5}
          roughness={0.4}
          transparent
          opacity={0.95}
        />
      </RoundedBox>

      {/* Top edge glow line */}
      <mesh position={[0, ph / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[pw - 0.2, pd - 0.2]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={hovered ? 0.08 : 0.03}
          toneMapped={false}
        />
      </mesh>

      {/* 3D Mini Viz sitting on the platform */}
      <group position={[0, ph / 2 + 0.01, 0]}>
        <MiniViz3D index={index} uc={uc} accent={accent} hovered={hovered} pw={pw} pd={pd} />
      </group>

      {/* Label — single pill, expands on hover to include headline */}
      {visible && (() => {
        const px = position[0];
        const pz = position[2];
        const absX = Math.abs(px);
        const absZ = Math.abs(pz);

        // Label direction: left/right/top/bottom based on card position
        // Y raised high (2.0) so it clears the 3D viz on the platform
        // Offsets large enough that expanded hover text doesn't cover viz
        let labelPos, align;
        if (absX > absZ) {
          // More horizontal — label goes left or right
          labelPos = px > 0
            ? [pw / 2 + 2.0, 2.0, 0]
            : [-pw / 2 - 2.0, 2.0, 0];
          align = px > 0 ? 'left' : 'right';
        } else {
          // More vertical — label goes top or bottom (Z axis)
          // In iso view, -Z = screen top-left, +Z = screen bottom-right
          // Raise Y extra high (2.5) for Z-direction labels to clear the platform
          labelPos = pz > 0
            ? [0, 2.0, pd / 2 + 2.0]    // bottom cards — label below
            : [0, 2.5, -pd / 2 - 2.0];  // top cards — label above, extra Y height
          align = 'center';
        }

        return (
          <Html
            center
            position={labelPos}
            zIndexRange={hovered ? [1000, 999] : [10, 0]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div style={{
              textAlign: align,
              fontFamily: "'Satoshi', sans-serif",
              whiteSpace: hovered ? 'normal' : 'nowrap',
              background: hovered ? 'rgba(10, 16, 29, 0.85)' : 'rgba(10, 16, 29, 0.65)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: `1px solid ${accent}${hovered ? '40' : '25'}`,
              borderRadius: 10,
              padding: hovered ? '10px 14px' : '5px 12px',
              animation: 'fadeIn 400ms ease both',
              maxWidth: hovered ? 200 : 'none',
              minWidth: hovered ? 160 : 'auto',
              transition: 'all 200ms ease',
              boxShadow: hovered ? `0 8px 24px rgba(0,0,0,0.5), 0 0 12px ${accent}15` : 'none',
            }}>
              <div style={{
                fontSize: hovered ? 16 : 14,
                fontWeight: 700,
                color: hovered ? '#fff' : accent,
                textShadow: `0 0 8px ${accent}40`,
              }}>
                {valueText}
              </div>
              <div style={{
                fontSize: hovered ? 9 : 8,
                fontWeight: 700,
                color: accent,
                opacity: 0.6,
                letterSpacing: '0.1em',
                marginTop: 2,
              }}>
                {tag}
              </div>
              {/* Rotating ticker */}
              {tickerLines.length > 0 && !hovered && (
                <div key={tickerIdx} style={{
                  fontSize: 8,
                  color: 'rgba(245,247,251,0.35)',
                  marginTop: 3,
                  animation: 'fadeIn 500ms ease both',
                  whiteSpace: 'nowrap',
                }}>
                  {tickerLines[tickerIdx]}
                </div>
              )}
              {hovered && (
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
              )}
            </div>
          </Html>
        );
      })()}

      {/* Critical shimmer — subtle pulsing platform edge */}
      {isCritical && !hovered && (
        <mesh position={[0, ph / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.min(pw, pd) * 0.45, Math.min(pw, pd) * 0.48, 4]} />
          <meshBasicMaterial color={accent} transparent opacity={0.15} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
