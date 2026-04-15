import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { C } from '../../theme/tokens';

// ─── Bar Chart: vertical bars rising from platform ───
function BarChart3D({ bars, pw, pd }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    // Gentle bob
    groupRef.current.children.forEach((bar, i) => {
      const baseY = bar.userData.baseY || 0;
      bar.position.y = baseY + Math.sin(state.clock.elapsedTime * 1.5 + i * 0.5) * 0.02;
    });
  });

  const barW = 0.28;
  const gap = 0.12;
  const totalW = bars.length * (barW + gap) - gap;
  const startX = -totalW / 2;

  return (
    <group ref={groupRef}>
      {bars.map((bar, i) => {
        const h = bar.value * 0.8;
        const y = h / 2;
        return (
          <mesh key={i} position={[startX + i * (barW + gap) + barW / 2, y, 0]} userData={{ baseY: y }}>
            <boxGeometry args={[barW, h, barW]} />
            <meshStandardMaterial
              color={bar.color}
              emissive={bar.color}
              emissiveIntensity={0.3}
              metalness={0.6}
              roughness={0.3}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Sparkline: ribbon mesh rising over time ───
function Sparkline3D({ points, accent, pw }) {
  const lineRef = useRef();
  const maxVal = Math.max(...points);
  const step = (pw - 0.6) / (points.length - 1);

  useFrame((state) => {
    if (!lineRef.current) return;
    lineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
  });

  return (
    <group ref={lineRef}>
      {points.map((p, i) => {
        if (i === 0) return null;
        const x0 = -pw / 2 + 0.3 + (i - 1) * step;
        const x1 = x0 + step;
        const y0 = (points[i - 1] / maxVal) * 0.8;
        const y1 = (p / maxVal) * 0.8;
        const midX = (x0 + x1) / 2;
        const midY = (y0 + y1) / 2;
        const len = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
        const angle = Math.atan2(y1 - y0, x1 - x0);
        return (
          <mesh key={i} position={[midX, midY, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[len, 0.06, 0.15]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.4}
              metalness={0.5}
              roughness={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
      {/* Dots at data points */}
      {points.map((p, i) => (
        <mesh key={`d${i}`} position={[-pw / 2 + 0.3 + i * step, (p / maxVal) * 0.8, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Dots: spheres sitting on the platform ───
function Dots3D({ count, accent }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((dot, i) => {
      dot.position.y = 0.1 + Math.sin(state.clock.elapsedTime * 2 + i * 1.2) * 0.05;
    });
  });

  const spacing = 0.4;
  const startX = -(count - 1) * spacing / 2;

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[startX + i * spacing, 0.1, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.5}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Cascade: stair-stepped blocks ───
function Cascade3D({ steps, accent }) {
  return (
    <group>
      {steps.map((s, i) => {
        const h = 0.15 + (s.value / steps[steps.length - 1].value) * 0.7;
        const x = -0.9 + i * 0.55;
        return (
          <mesh key={i} position={[x, h / 2, 0]}>
            <boxGeometry args={[0.4, h, 0.4]} />
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={0.35}
              metalness={0.6}
              roughness={0.3}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Bands: horizontal flat bars at different widths ───
function Bands3D({ bands }) {
  return (
    <group>
      {bands.map((b, i) => {
        const w = (b.value / bands[0].max) * 1.8;
        return (
          <mesh key={i} position={[0, 0.08, -0.35 + i * 0.35]}>
            <boxGeometry args={[w, 0.1, 0.22]} />
            <meshStandardMaterial
              color={b.color}
              emissive={b.color}
              emissiveIntensity={0.3}
              metalness={0.6}
              roughness={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Comparison: two bars side by side ───
function Comparison3D({ bars }) {
  return (
    <group>
      {bars.map((b, i) => {
        const h = (b.value / bars[0].max) * 0.9;
        return (
          <mesh key={i} position={[i * 0.7 - 0.35, h / 2, 0]}>
            <boxGeometry args={[0.5, h, 0.4]} />
            <meshStandardMaterial
              color={b.color}
              emissive={b.color}
              emissiveIntensity={0.35}
              metalness={0.6}
              roughness={0.3}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Route to the right viz per insight index ───
export default function MiniViz3D({ index, uc, accent, hovered, pw, pd }) {
  switch (index) {
    case 0: // Contractor variation — bar chart
      return <BarChart3D pw={pw} pd={pd} bars={[
        { value: 1.0, color: C.red },
        { value: 0.64, color: C.orange },
        { value: 0.53, color: C.amber },
        { value: 0.39, color: C.blue },
        { value: 0.24, color: C.green },
      ]} />;

    case 1: // Budget bleed — sparkline trending up
      return <Sparkline3D accent={accent} pw={pw}
        points={[1.02, 1.05, 1.12, 1.18, 1.24, 1.30, 1.34, 1.38]} />;

    case 2: // Salami — accumulating dots
      return <Dots3D count={7} accent={accent} />;

    case 3: // EW Response — 3 cost bands
      return <Bands3D bands={[
        { value: 310, max: 310, color: C.red },
        { value: 145, max: 310, color: C.amber },
        { value: 68, max: 310, color: C.green },
      ]} />;

    case 4: // Cascade — staircase
      return <Cascade3D accent={accent} steps={[
        { value: 340, color: C.amber },
        { value: 5040, color: C.orange },
        { value: 1820, color: C.red },
        { value: 16800, color: C.purple },
      ]} />;

    case 5: // NCE Validity — comparison bars
      return <Comparison3D bars={[
        { value: 400, max: 400, color: C.red },
        { value: 240, max: 400, color: C.cyan },
      ]} />;

    case 6: // Silence — 3 contractor dots
      return <Dots3D count={3} accent={accent} />;

    case 7: // Board brief — 5 risk dots
      return <Dots3D count={5} accent={accent} />;

    default:
      return null;
  }
}
