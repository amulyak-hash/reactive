import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { C } from '../../theme/tokens';

// ─── Bid Bars: 5 vertical bars per contractor ───
function BidBars({ accent, pw }) {
  const groupRef = useRef();
  const bids = [
    { h: 0.95, color: C.purple },  // Tata Projects £2,100K
    { h: 0.55, color: C.red },     // Afcons £980K
    { h: 0.7, color: C.cyan },     // L&T £1,540K
    { h: 0.4, color: C.green },    // NCC £860K
    { h: 0.55, color: C.amber },   // KEC £1,200K
  ];

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((bar, i) => {
      const baseY = bar.userData.baseY || 0;
      bar.position.y = baseY + Math.sin(state.clock.elapsedTime * 1.5 + i * 0.5) * 0.02;
    });
  });

  const barW = 0.28;
  const gap = 0.12;
  const totalW = bids.length * (barW + gap) - gap;
  const startX = -totalW / 2;

  return (
    <group ref={groupRef}>
      {bids.map((b, i) => {
        const y = b.h / 2;
        return (
          <mesh key={i} position={[startX + i * (barW + gap) + barW / 2, y, 0]} userData={{ baseY: y }}>
            <boxGeometry args={[barW, b.h, barW]} />
            <meshStandardMaterial
              color={b.color}
              emissive={b.color}
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

// ─── Contract Cubes: stacked translucent cubes ───
function ContractCubes({ accent }) {
  const groupRef = useRef();
  const cubes = [
    { size: 0.7, y: 0.08, color: C.cyan, opacity: 0.6 },
    { size: 0.55, y: 0.28, color: C.cyan, opacity: 0.5 },
    { size: 0.4, y: 0.44, color: C.cyan, opacity: 0.4 },
    { size: 0.28, y: 0.56, color: C.cyan, opacity: 0.35 },
  ];

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {cubes.map((c, i) => (
        <mesh key={i} position={[0, c.y, 0]}>
          <boxGeometry args={[c.size, 0.14, c.size]} />
          <meshStandardMaterial
            color={c.color}
            emissive={c.color}
            emissiveIntensity={0.25}
            metalness={0.5}
            roughness={0.3}
            transparent
            opacity={c.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── EW Prisms: triangular warning shapes ───
function EWPrisms({ accent }) {
  const groupRef = useRef();
  const prisms = [
    { h: 0.6, x: -0.45, color: C.red, critical: true },    // 15+ days band
    { h: 0.4, x: 0, color: C.amber, critical: false },      // 6-14 days band
    { h: 0.25, x: 0.45, color: C.green, critical: false },   // ≤5 days band
  ];

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((prism, i) => {
      if (prisms[i]?.critical) {
        prism.children[0].material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {prisms.map((p, i) => (
        <group key={i} position={[p.x, p.h / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[0, 0.2, p.h, 3]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.color}
              emissiveIntensity={0.3}
              metalness={0.5}
              roughness={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── NCE Rising: stepped accumulation bars ───
function NCERising({ accent }) {
  const groupRef = useRef();
  const bars = [
    { h: 0.2, color: C.red },
    { h: 0.35, color: C.red },
    { h: 0.55, color: C.red },
    { h: 0.75, color: C.red },
    { h: 1.0, color: C.red },   // Afcons £35.5M — tallest, glows
  ];

  useFrame((state) => {
    if (!groupRef.current) return;
    const last = groupRef.current.children[bars.length - 1];
    if (last) {
      last.children[0].material.emissiveIntensity = 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  const barW = 0.22;
  const gap = 0.1;
  const totalW = bars.length * (barW + gap) - gap;
  const startX = -totalW / 2;

  return (
    <group ref={groupRef}>
      {bars.map((b, i) => (
        <group key={i} position={[startX + i * (barW + gap) + barW / 2, b.h / 2, 0]}>
          <mesh>
            <boxGeometry args={[barW, b.h, barW]} />
            <meshStandardMaterial
              color={b.color}
              emissive={b.color}
              emissiveIntensity={i === bars.length - 1 ? 0.5 : 0.3}
              metalness={0.6}
              roughness={0.3}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Network: connected spheres for claim patterns ───
function NetworkGraph({ accent }) {
  const groupRef = useRef();
  const nodes = [
    { pos: [-0.4, 0.2, -0.2], r: 0.12 },
    { pos: [0.1, 0.35, 0.1], r: 0.15 },
    { pos: [0.45, 0.2, -0.15], r: 0.1 },
    { pos: [0, 0.15, 0.35], r: 0.08 },
    { pos: [-0.3, 0.3, 0.2], r: 0.09 },
  ];
  const edges = [[0, 1], [1, 2], [0, 4], [1, 3], [3, 4]];

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[n.r, 12, 12]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.4}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
      {edges.map(([a, b], i) => {
        const pa = nodes[a].pos;
        const pb = nodes[b].pos;
        const mx = (pa[0] + pb[0]) / 2;
        const my = (pa[1] + pb[1]) / 2;
        const mz = (pa[2] + pb[2]) / 2;
        const dx = pb[0] - pa[0];
        const dy = pb[1] - pa[1];
        const dz = pb[2] - pa[2];
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return (
          <mesh key={`e${i}`} position={[mx, my, mz]}
            rotation={[0, 0, Math.atan2(dy, Math.sqrt(dx * dx + dz * dz))]}
          >
            <cylinderGeometry args={[0.015, 0.015, len, 4]} />
            <meshBasicMaterial color={accent} transparent opacity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Resolved: flat blocks with checkmark ───
function Resolved({ accent }) {
  return (
    <group>
      {/* Base block */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial
          color={accent} emissive={accent} emissiveIntensity={0.25}
          metalness={0.5} roughness={0.4} transparent opacity={0.7}
        />
      </mesh>
      {/* Checkmark: two angled thin bars */}
      <mesh position={[-0.05, 0.22, 0]} rotation={[0, 0, -0.7]}>
        <boxGeometry args={[0.25, 0.04, 0.04]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      <mesh position={[0.15, 0.3, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.35, 0.04, 0.04]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ─── Settled: solid absorbed cubes ───
function Settled({ accent }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[-0.2, 0.1, -0.1]}>
        <boxGeometry args={[0.35, 0.18, 0.35]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3}
          metalness={0.6} roughness={0.3} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.15, 0.1, 0.1]}>
        <boxGeometry args={[0.3, 0.18, 0.3]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25}
          metalness={0.6} roughness={0.3} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.25, 0.14, 0.25]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.2}
          metalness={0.6} roughness={0.3} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ─── X-Mark: two crossed thin boxes ───
function XMark({ accent }) {
  return (
    <group position={[0, 0.2, 0]}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.05, 0.05]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.05, 0.05]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ─── Route to viz by stage type ───
export default function StageViz3D({ vizType, accent, hovered, pw, pd }) {
  switch (vizType) {
    case 'bid-bars':       return <BidBars accent={accent} pw={pw} />;
    case 'contract-cubes': return <ContractCubes accent={accent} />;
    case 'ew-prisms':      return <EWPrisms accent={accent} />;
    case 'nce-rising':     return <NCERising accent={accent} />;
    case 'network':        return <NetworkGraph accent={accent} />;
    case 'resolved':       return <Resolved accent={accent} />;
    case 'settled':        return <Settled accent={accent} />;
    case 'x-mark':         return <XMark accent={accent} />;
    default:               return null;
  }
}
