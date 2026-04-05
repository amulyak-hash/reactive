import { useState, useEffect, useRef, useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { C, rgb, FONT_MONO, FONT_SANS } from '../../theme/tokens';

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const NARRATIVE_CARDS = [
  {
    tag: 'INCOMING',
    zone: 'Raw Materials',
    headline: 'Si +0.12%',
    title: 'Supplier X — Iron Ore Variance',
    body: 'Latest batch silicon content 0.12% above spec. Deviation entered BF-3 input stream.',
    color: C.amber,
    threeColor: '#FBBF24',
    delay: 2.0,
    zonePos: [-12, 4, -3],
    cardOffset: [0, 8, 0],
    viz: 'trend-up',
    vizData: [0.02, 0.03, 0.04, 0.03, 0.05, 0.07, 0.09, 0.12],
  },
  {
    tag: 'CAUSE',
    zone: 'Blast Furnace',
    headline: '22°C',
    title: 'BF-3 Superheat Dropping',
    body: 'Superheat fell from 34°C to 22°C. 92% causal confidence.',
    color: C.orange,
    threeColor: '#F0813A',
    delay: 6.0,
    zonePos: [-5.43, 3.11, -12.11],
    cardOffset: [0, 9, 0],
    viz: 'gauge',
    vizValue: 22,
    vizMax: 50,
    vizThreshold: 28,
  },
  {
    tag: 'EFFECT',
    zone: 'Quality Lab',
    headline: '₹8.1 Cr',
    title: 'Automotive Grade at Risk',
    body: 'Compound confidence: 59%. One shipment flagged. Recovery window: 18 hours.',
    color: C.red,
    threeColor: '#F06060',
    delay: 10.0,
    zonePos: [-9.85, 3.19, 10.88],
    cardOffset: [0, 8.5, 0],
    viz: 'confidence',
    vizData: [92, 87, 74, 59],
    vizLabels: ['Supplier', 'BF-3', 'CCM-3', 'Grade'],
  },
];

export default function IntelCards3D() {
  const scanPhase = useStore(s => s.scanPhase);
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    if (scanPhase !== 'intel') return;
    const timers = NARRATIVE_CARDS.map((card, i) =>
      setTimeout(() => setVisibleCards(prev => [...prev, i]), card.delay * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [scanPhase]);

  // Don't render before intel phase starts
  if (scanPhase === 'idle') return null;

  return (
    <group>
      {NARRATIVE_CARDS.map((card, i) => {
        const isVisible = visibleCards.includes(i);
        const cardPos = [
          card.zonePos[0] + card.cardOffset[0],
          card.zonePos[1] + card.cardOffset[1],
          card.zonePos[2] + card.cardOffset[2],
        ];

        return (
          <group key={i}>
            {isVisible && (
              <ConnectorLine
                from={cardPos}
                to={card.zonePos}
                color={card.threeColor}
              />
            )}

            {isVisible && (
              <ZoneGlow
                position={card.zonePos}
                color={card.threeColor}
              />
            )}

            <Html
              position={cardPos}
              center
              distanceFactor={15}
              style={{ pointerEvents: 'none' }}
            >
              <div style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? 'translateY(0) scale(1)'
                  : 'translateY(16px) scale(0.95)',
                transition: 'all 1s cubic-bezier(0.22, 1, 0.36, 1)',
                width: 280,
              }}>
                <NarrativeCard card={card} visible={isVisible} />
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// ─── Connector line ───

function ConnectorLine({ from, to, color }) {
  const matRef = useRef();

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.dashOffset = -clock.getElapsedTime() * 0.5;
    }
  });

  const points = useMemo(() => [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to),
  ], [from, to]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      dashed
      dashSize={0.3}
      dashOffset={0}
      gapSize={0.2}
      transparent
      opacity={0.6}
    >
      <lineDashedMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.6}
        dashSize={0.3}
        gapSize={0.2}
        blending={THREE.AdditiveBlending}
      />
    </Line>
  );
}

// ─── Zone glow ───

function ZoneGlow({ position, color }) {
  const meshRef = useRef();
  const lightRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 0.6 + 0.3 * Math.sin(clock.getElapsedTime() * 2.5);
      meshRef.current.material.opacity = pulse * 0.25;
      meshRef.current.scale.setScalar(1 + 0.1 * Math.sin(clock.getElapsedTime() * 2.0));
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + 0.5 * Math.sin(clock.getElapsedTime() * 2.5);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={1.5}
        distance={10}
        decay={2}
      />
    </group>
  );
}

// ─── Narrative card with mini visualization ───

function NarrativeCard({ card, visible }) {
  return (
    <div style={{
      padding: '16px 20px',
      background: rgb(C.bg, 0.8),
      border: `1px solid ${rgb(card.color, 0.3)}`,
      borderRadius: 12,
      backdropFilter: 'blur(16px)',
      boxShadow: `0 0 30px ${rgb(card.color, 0.15)}, inset 0 0 16px ${rgb(card.color, 0.05)}`,
    }}>
      {/* Tag + zone label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: card.color,
            boxShadow: `0 0 10px ${rgb(card.color, 0.6)}`,
            animation: 'pulse-dot 2s ease infinite',
          }} />
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700,
            color: card.color, letterSpacing: '0.15em',
          }}>
            {card.tag}
          </div>
        </div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 9,
          color: C.t4, letterSpacing: '0.08em',
        }}>
          {card.zone.toUpperCase()}
        </div>
      </div>

      {/* Headline + mini viz side by side */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 14, marginBottom: 10,
      }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700,
          color: C.t1, lineHeight: 1, flexShrink: 0,
          textShadow: `0 0 24px ${rgb(card.color, 0.35)}`,
        }}>
          {card.headline}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {visible && card.viz === 'trend-up' && <MiniTrend data={card.vizData} color={card.color} />}
          {visible && card.viz === 'gauge' && <MiniGauge value={card.vizValue} max={card.vizMax} threshold={card.vizThreshold} color={card.color} />}
          {visible && card.viz === 'confidence' && <MiniConfidence data={card.vizData} labels={card.vizLabels} color={card.color} />}
        </div>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600,
        color: C.t2, marginBottom: 4,
      }}>
        {card.title}
      </div>

      {/* Body */}
      <div style={{
        fontFamily: FONT_SANS, fontSize: 11,
        color: C.t3, lineHeight: 1.6,
      }}>
        {card.body}
      </div>
    </div>
  );
}

// ─── Mini visualizations ───

function MiniTrend({ data, color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 100;
    const h = canvas.height = 40;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    let progress = 0;

    const draw = () => {
      progress = Math.min(progress + 0.02, 1);
      ctx.clearRect(0, 0, w, h);

      const pointsToShow = Math.floor(data.length * progress);
      if (pointsToShow < 2) { animRef.current = requestAnimationFrame(draw); return; }

      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < pointsToShow; i++) {
        const x = (i / (data.length - 1)) * w;
        const y = h - 4 - ((data[i] - min) / range) * (h - 8);
        ctx.lineTo(x, y);
      }
      const lastX = ((pointsToShow - 1) / (data.length - 1)) * w;
      ctx.lineTo(lastX, h);
      ctx.closePath();
      ctx.fillStyle = hexToRgba(color, 0.1);
      ctx.fill();

      ctx.beginPath();
      for (let i = 0; i < pointsToShow; i++) {
        const x = (i / (data.length - 1)) * w;
        const y = h - 4 - ((data[i] - min) / range) * (h - 8);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      const lastI = pointsToShow - 1;
      const lx = (lastI / (data.length - 1)) * w;
      const ly = h - 4 - ((data[lastI] - min) / range) * (h - 8);
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (progress < 1) animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [data, color]);

  return <canvas ref={canvasRef} style={{ width: 100, height: 40, display: 'block' }} />;
}

function MiniGauge({ value, max, threshold, color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 80;
    const h = canvas.height = 44;
    const cx = w / 2;
    const cy = h - 2;
    const r = 30;
    let progress = 0;

    const draw = () => {
      progress = Math.min(progress + 0.015, 1);
      ctx.clearRect(0, 0, w, h);

      const startAngle = Math.PI;

      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, 0);
      ctx.strokeStyle = hexToRgba(color, 0.1);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      const threshAngle = startAngle + (threshold / max) * Math.PI;
      const tx = cx + r * Math.cos(threshAngle);
      const ty = cy + r * Math.sin(threshAngle);
      ctx.beginPath();
      ctx.arc(tx, ty, 2, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba('#334155', 0.5);
      ctx.fill();

      const valAngle = startAngle + ((value / max) * progress) * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, valAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      const vx = cx + r * Math.cos(valAngle);
      const vy = cy + r * Math.sin(valAngle);
      ctx.beginPath();
      ctx.arc(vx, vy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(vx, vy, 6, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, 0.2);
      ctx.fill();

      if (progress < 1) animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [value, max, threshold, color]);

  return <canvas ref={canvasRef} style={{ width: 80, height: 44, display: 'block', margin: '0 auto' }} />;
}

function MiniConfidence({ data, color }) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    let p = 0;
    const tick = () => {
      p = Math.min(p + 0.02, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
      {data.map((val, i) => {
        const h = (val / 100) * 34 * progress;
        const isLow = val < 70;
        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2, flex: 1,
          }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 8,
              color: isLow ? C.amber : C.t4,
            }}>
              {Math.round(val * progress)}
            </div>
            <div style={{
              width: '100%', maxWidth: 14,
              height: h,
              borderRadius: 2,
              background: isLow
                ? `linear-gradient(to top, ${rgb(C.amber, 0.6)}, ${rgb(color, 0.3)})`
                : `linear-gradient(to top, ${rgb(color, 0.4)}, ${rgb(color, 0.15)})`,
            }} />
          </div>
        );
      })}
    </div>
  );
}
