import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_MONO, FONT_SANS, FONT_SERIF } from '../theme/tokens';

// ─── Card data with rich detail ───

const CARDS = [
  {
    tag: 'INCOMING',
    value: 'Si +0.12%',
    title: 'Supplier X — Iron Ore Variance',
    body: 'Silicon content 0.12% above spec in latest batch. Deviation entered BF-3 input stream at 06:42.',
    confidence: '92%',
    confLabel: 'Link confidence',
    color: C.amber,
    viz: 'silicon',
  },
  {
    tag: 'CAUSE',
    value: '22°C',
    title: 'BF-3 Superheat Dropping',
    body: 'Hot metal superheat fell from 34°C to 22°C. Silicon variance propagating through chemistry.',
    confidence: '87%',
    confLabel: 'Propagation',
    color: C.orange,
    viz: 'temperature',
  },
  {
    tag: 'EFFECT',
    value: '₹8.1 Cr',
    title: 'Revenue Exposure — Grade Risk',
    body: 'Automotive-grade spec probability at 59%. One shipment flagged. Recovery window: 18 hours.',
    confidence: '59%',
    confLabel: 'Compound chain',
    color: C.red,
    viz: 'risk',
  },
];

export default function CausalBar() {
  const story = useStore(s => s.story);
  const scanPhase = useStore(s => s.scanPhase);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const causalTourState = useStore(s => s.causalTourState);

  // Hide during onboarding/intel, story mode, or cinematic tour
  if (story || scanPhase !== 'complete') return null;
  if (causalTourState === 'active' || causalTourState === 'paused') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: 0,
      right: 0,
      zIndex: 199,
      padding: '0 24px',
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 800ms cubic-bezier(0.22, 1, 0.36, 1)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        width: '100%',
      }}>
        {CARDS.map((card, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'stretch',
            flex: 1,
            minWidth: 0,
          }}>
            <CausalCard card={card} index={i} />
            {i < CARDS.length - 1 && <ChainConnector from={card} to={CARDS[i + 1]} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chain connector between cards ───

function ChainConnector({ from, to }) {
  return (
    <div style={{
      width: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: `1px solid ${rgb(from.color, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: rgb(from.color, 0.05),
      }}>
        <span style={{
          fontFamily: FONT_MONO,
          fontSize: 9,
          color: from.color,
        }}>→</span>
      </div>
    </div>
  );
}

// ─── Individual causal card with mini viz ───

function CausalCard({ card, index }) {
  return (
    <div
      className="liquid-glass"
      style={{
        flex: 1,
        minWidth: 0,
        padding: '10px 14px 10px',
        borderRadius: 12,
        borderColor: rgb(card.color, 0.12),
        pointerEvents: 'auto',
        cursor: 'default',
        display: 'flex',
        gap: 12,
        animation: `fadeIn 500ms ease ${index * 150}ms both`,
      }}
    >
      {/* Left: text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Tag row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 5,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: card.color,
            boxShadow: `0 0 8px ${rgb(card.color, 0.6)}`,
            animation: 'pulse-dot 2.5s ease infinite',
          }} />
          <span style={{
            fontFamily: FONT_MONO, fontSize: 9, fontWeight: 700,
            color: card.color, letterSpacing: '0.14em',
          }}>{card.tag}</span>
          <div style={{ flex: 1 }} />
          <span style={{
            fontFamily: FONT_MONO, fontSize: 9,
            color: rgb(card.color, 0.6),
            letterSpacing: '0.05em',
          }}>{card.confLabel}</span>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700,
            color: card.color,
          }}>{card.confidence}</span>
        </div>

        {/* Value */}
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 22,
          fontWeight: 700,
          color: C.t1,
          lineHeight: 1,
          marginBottom: 4,
          textShadow: `0 0 24px ${rgb(card.color, 0.2)}`,
        }}>
          {card.value}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: FONT_SANS,
          fontSize: 11,
          color: C.t3,
        }}>
          {card.title}
        </div>
      </div>

      {/* Right: mini canvas visualization */}
      <div style={{
        width: 110,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
      }}>
        <MiniViz type={card.viz} color={card.color} />
      </div>
    </div>
  );
}

// ─── Mini canvas visualizations ───

function MiniViz({ type, color }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = 110;
    const H = 60;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      if (type === 'silicon') drawSiliconChart(ctx, W, H, color, frame);
      else if (type === 'temperature') drawTempGauge(ctx, W, H, color, frame);
      else if (type === 'risk') drawRiskBars(ctx, W, H, color, frame);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [type, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 110, height: 60, borderRadius: 6 }}
    />
  );
}

// ─── Silicon batch sparkline ───
function drawSiliconChart(ctx, W, H, color, frame) {
  const batches = [0.31, 0.29, 0.33, 0.30, 0.28, 0.32, 0.30, 0.29, 0.31, 0.30, 0.33, 0.42];
  const threshold = 0.32;
  const min = 0.25, max = 0.45;
  const padX = 8, padY = 10;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;

  const toX = (i) => padX + (i / (batches.length - 1)) * chartW;
  const toY = (v) => padY + (1 - (v - min) / (max - min)) * chartH;

  // Threshold line
  const thY = toY(threshold);
  ctx.strokeStyle = hexToRgba(color, 0.2);
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, thY);
  ctx.lineTo(W - padX, thY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Threshold label
  ctx.fillStyle = hexToRgba(color, 0.4);
  ctx.font = '8px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  ctx.fillText('SPEC', W - padX, thY - 3);

  // Area fill below line
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(batches[0]));
  batches.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
  ctx.lineTo(toX(batches.length - 1), H - padY);
  ctx.lineTo(toX(0), H - padY);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, 0.06);
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(batches[0]));
  batches.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
  ctx.strokeStyle = hexToRgba(color, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Spike dot (last point — the deviation)
  const lastI = batches.length - 1;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.06);
  ctx.beginPath();
  ctx.arc(toX(lastI), toY(batches[lastI]), 3 + pulse * 2, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.3 + pulse * 0.3);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(toX(lastI), toY(batches[lastI]), 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ─── Temperature drop gauge ───
function drawTempGauge(ctx, W, H, color, frame) {
  const cx = W / 2;
  const cy = H / 2 + 4;
  const r = 22;
  const startAngle = Math.PI * 0.8;
  const endAngle = Math.PI * 2.2;
  const range = endAngle - startAngle;

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = hexToRgba(color, 0.12);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Target zone (green area: 28-40°C)
  const targetStart = startAngle + (28 / 50) * range;
  const targetEnd = startAngle + (40 / 50) * range;
  ctx.beginPath();
  ctx.arc(cx, cy, r, targetStart, targetEnd);
  ctx.strokeStyle = hexToRgba(C.green, 0.2);
  ctx.lineWidth = 3;
  ctx.stroke();

  // Current value arc (22°C out of 50°C range)
  const valueAngle = startAngle + (22 / 50) * range;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.05);
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, valueAngle);
  ctx.strokeStyle = hexToRgba(color, 0.6 + pulse * 0.3);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Needle dot
  const nx = cx + Math.cos(valueAngle) * r;
  const ny = cy + Math.sin(valueAngle) * r;
  ctx.beginPath();
  ctx.arc(nx, ny, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(nx, ny, 5 + pulse * 3, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.15 + pulse * 0.15);
  ctx.fill();

  // Center text
  ctx.fillStyle = C.t1;
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('22°', cx, cy - 1);

  // Label
  ctx.fillStyle = hexToRgba(color, 0.5);
  ctx.font = '7px JetBrains Mono, monospace';
  ctx.fillText('SUPERHEAT', cx, cy + 10);
}

// ─── Risk exposure stacked bars ───
function drawRiskBars(ctx, W, H, color, frame) {
  const bars = [
    { label: 'Line 3', value: 4.2, color: C.red },
    { label: 'Supplier', value: 1.8, color: C.orange },
    { label: 'Grade', value: 2.1, color: C.amber },
  ];
  const total = 8.1;
  const padX = 4, padY = 10;
  const barH = 12;
  const gap = 5;
  const maxW = W - padX * 2;

  // Title
  ctx.fillStyle = hexToRgba(C.t4, 0.6);
  ctx.font = '8px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('EXPOSURE BREAKDOWN', padX, padY);

  bars.forEach((bar, i) => {
    const y = padY + 8 + i * (barH + gap);
    const w = (bar.value / total) * maxW;
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + i * 0.8);

    // Background
    ctx.fillStyle = hexToRgba(bar.color, 0.08);
    ctx.beginPath();
    ctx.roundRect(padX, y, maxW, barH, 3);
    ctx.fill();

    // Value bar
    ctx.fillStyle = hexToRgba(bar.color, 0.35 + pulse * 0.15);
    ctx.beginPath();
    ctx.roundRect(padX, y, w, barH, 3);
    ctx.fill();

    // Label
    ctx.fillStyle = C.t2;
    ctx.font = '9px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(bar.label, padX + 4, y + barH / 2);

    // Value
    ctx.fillStyle = bar.color;
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`₹${bar.value}Cr`, W - padX - 2, y + barH / 2);
  });
}

// ─── Utility ───
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
