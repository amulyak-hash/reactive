import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../theme/tokens';
import { useTyping } from '../hooks/useTyping';
import { useTourNarration } from '../hooks/useTourNarration';
import { playNarration } from '../audio/tourAudio';
import { TOUR_STEPS } from '../scene/tour/CinematicTourEngine';

// ─── Step → audio key mapping ───

const STEP_AUDIO_KEYS = {
  0: 'overview',
  1: 'trigger',
  2: 'propagation',
  3: 'cascade',
  4: 'impact',
};

// ─── Confidence chain data ───

const CONFIDENCE_CHAIN = [
  { label: 'Supplier', value: 92, color: C.amber },
  { label: 'BF-3', value: 87, color: C.orange },
  { label: 'CCM-3', value: 74, color: C.cyan },
  { label: 'Grade', value: 59, color: C.red },
];

// ─── Step canvas visualizations with hover ───

function StepCanvas({ step, width, height }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 }; };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;
      const m = mouseRef.current;

      if (step === -1) drawBriefingViz(ctx, width, height, frame, m);
      else if (step === 0) drawOverviewViz(ctx, width, height, frame, m);
      else if (step === 1) drawSiliconViz(ctx, width, height, frame, m);
      else if (step === 2) drawTempViz(ctx, width, height, frame, m);
      else if (step === 3) drawCascadeViz(ctx, width, height, frame, m);
      else if (step === 4) drawImpactViz(ctx, width, height, frame, m);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [step, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, borderRadius: 8, display: 'block', cursor: 'crosshair' }}
    />
  );
}

// ─── Helpers ───
function dist(x1, y1, x2, y2) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); }
function isHover(mx, my, x, y, r) { return mx > 0 && dist(mx, my, x, y) < r; }
function isHoverRect(mx, my, x, y, w, h) { return mx > 0 && mx >= x && mx <= x + w && my >= y && my <= y + h; }

// ─── Briefing: anomaly radar with live sweep + hover blips ───
function drawBriefingViz(ctx, W, H, frame, m) {
  const cx = W / 2, cy = H / 2;
  const maxR = Math.min(W, H) * 0.42;
  const sweep = (frame * 0.018) % (Math.PI * 2);

  // Grid rings
  for (let i = 1; i <= 4; i++) {
    const r = (i / 4) * maxR;
    const breathe = 1 + 0.008 * Math.sin(frame * 0.03 + i);
    ctx.beginPath();
    ctx.arc(cx, cy, r * breathe, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(C.cyan, 0.05 + (i === 4 ? 0.04 : 0));
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Cross lines with subtle drift
  const drift = Math.sin(frame * 0.01) * 2;
  ctx.strokeStyle = hexToRgba(C.cyan, 0.04);
  ctx.beginPath();
  ctx.moveTo(cx - maxR, cy + drift); ctx.lineTo(cx + maxR, cy + drift);
  ctx.moveTo(cx + drift, cy - maxR); ctx.lineTo(cx + drift, cy + maxR);
  ctx.stroke();

  // Sweep trail (fading arc)
  for (let j = 0; j < 8; j++) {
    const a = sweep - j * 0.06;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxR, a - 0.03, a);
    ctx.closePath();
    ctx.fillStyle = hexToRgba(C.cyan, 0.06 * (1 - j / 8));
    ctx.fill();
  }

  // Sweep line
  const sx = cx + Math.cos(sweep) * maxR, sy = cy + Math.sin(sweep) * maxR;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy);
  ctx.strokeStyle = hexToRgba(C.cyan, 0.35); ctx.lineWidth = 1; ctx.stroke();

  // Blips
  const blips = [
    { angle: -0.8, dist: 0.55, label: 'BF-3', color: C.orange, val: '22°C', desc: 'Superheat drop' },
    { angle: 0.6, dist: 0.7, label: 'CCM-3', color: C.cyan, val: '1.2 m/min', desc: 'Speed reduced' },
  ];
  blips.forEach(b => {
    const bx = cx + Math.cos(b.angle) * maxR * b.dist;
    const by = cy + Math.sin(b.angle) * maxR * b.dist;
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.06 + b.angle * 3);
    const hovered = isHover(m.x, m.y, bx, by, 24);
    const scale = hovered ? 1.4 : 1;

    // Ripple rings
    for (let r = 0; r < 3; r++) {
      const rr = (8 + r * 8 + (frame * 0.4 + r * 20) % 24) * scale;
      ctx.beginPath(); ctx.arc(bx, by, rr, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba(b.color, 0.12 * (1 - rr / (40 * scale)));
      ctx.lineWidth = 1; ctx.stroke();
    }

    // Core
    ctx.beginPath(); ctx.arc(bx, by, 5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(b.color, 0.8 + pulse * 0.2); ctx.fill();

    // Labels
    const lx = bx + 16 * scale;
    ctx.fillStyle = C.t1; ctx.font = `bold ${hovered ? 11 : 10}px JetBrains Mono, monospace`; ctx.textAlign = 'left';
    ctx.fillText(b.label, lx, by - 4);
    ctx.fillStyle = b.color; ctx.font = `${hovered ? 10 : 9}px JetBrains Mono, monospace`;
    ctx.fillText(b.val, lx, by + 8);
    if (hovered) {
      ctx.fillStyle = C.t3; ctx.font = '8px DM Sans, sans-serif';
      ctx.fillText(b.desc, lx, by + 20);
    }
  });

  // Center
  ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();

  // HUD labels
  ctx.fillStyle = hexToRgba(C.cyan, 0.5); ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'right'; ctx.fillText('2 ANOMALIES ACTIVE', W - 16, 14);
  ctx.fillStyle = hexToRgba(C.red, 0.6); ctx.font = 'bold 9px JetBrains Mono, monospace';
  ctx.textAlign = 'left'; ctx.fillText('59% COMPOUND', 16, 14);
}

// ─── Overview: causal chain with travelling energy pulse + hover tooltips ───
function drawOverviewViz(ctx, W, H, frame, m) {
  const nodes = [
    { x: 0.12, label: 'RM', color: C.amber, conf: '92%', desc: 'Si +0.12%' },
    { x: 0.34, label: 'BF-3', color: C.orange, conf: '87%', desc: '22°C superheat' },
    { x: 0.58, label: 'CCM-3', color: C.cyan, conf: '74%', desc: '1.2 m/min' },
    { x: 0.82, label: 'QL', color: C.red, conf: '59%', desc: '₹8.1 Cr risk' },
  ];
  const cy = H * 0.45;

  // Connection paths + multi-particle flow
  for (let i = 0; i < nodes.length - 1; i++) {
    const x1 = nodes[i].x * W + 16, x2 = nodes[i + 1].x * W - 16;

    // Gradient line
    const grd = ctx.createLinearGradient(x1, 0, x2, 0);
    grd.addColorStop(0, hexToRgba(nodes[i].color, 0.2));
    grd.addColorStop(1, hexToRgba(nodes[i + 1].color, 0.2));
    ctx.strokeStyle = grd; ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]); ctx.lineDashOffset = -frame * 0.5;
    ctx.beginPath(); ctx.moveTo(x1, cy); ctx.lineTo(x2, cy); ctx.stroke();
    ctx.setLineDash([]); ctx.lineDashOffset = 0;

    // 3 travelling particles per segment
    for (let p = 0; p < 3; p++) {
      const t = ((frame * 0.012 + i * 0.25 + p * 0.33) % 1);
      const px = x1 + (x2 - x1) * t;
      const sz = 2 + Math.sin(frame * 0.08 + p) * 1.5;
      ctx.beginPath(); ctx.arc(px, cy, sz, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(nodes[i].color, 0.3 + t * 0.4);
      ctx.fill();
    }
  }

  // Nodes
  nodes.forEach((n, idx) => {
    const x = n.x * W;
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + idx);
    const hovered = isHover(m.x, m.y, x, cy, 20);
    const r = hovered ? 15 : 12;

    // Outer glow
    ctx.beginPath(); ctx.arc(x, cy, r + 8 + pulse * 4, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(n.color, hovered ? 0.1 : 0.04 + pulse * 0.03); ctx.fill();

    // Circle
    ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(n.color, hovered ? 0.25 : 0.12);
    ctx.strokeStyle = hexToRgba(n.color, hovered ? 0.8 : 0.5);
    ctx.lineWidth = hovered ? 2 : 1.5; ctx.fill(); ctx.stroke();

    // Label + conf
    ctx.fillStyle = C.t1; ctx.font = `bold ${hovered ? 11 : 10}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n.label, x, cy);
    ctx.fillStyle = n.color; ctx.font = `bold 10px JetBrains Mono, monospace`;
    ctx.fillText(n.conf, x, cy + (hovered ? 28 : 24));

    // Hover tooltip
    if (hovered) {
      ctx.fillStyle = C.t2; ctx.font = '9px DM Sans, sans-serif';
      ctx.fillText(n.desc, x, cy + 40);
    }
  });
  ctx.textBaseline = 'alphabetic';
}

// ─── Silicon: live-drawing sparkline with hover crosshair ───
function drawSiliconViz(ctx, W, H, frame, m) {
  const batches = [0.31, 0.29, 0.33, 0.30, 0.28, 0.32, 0.30, 0.29, 0.31, 0.30, 0.33, 0.42];
  const threshold = 0.32, min = 0.25, max = 0.45;
  const padX = 24, padY = 20, chartW = W - padX * 2, chartH = H - padY * 2;
  const toX = i => padX + (i / (batches.length - 1)) * chartW;
  const toY = v => padY + (1 - (v - min) / (max - min)) * chartH;

  // Animate line drawing — reveals progressively
  const drawProgress = Math.min(frame / 90, 1); // fully drawn over ~1.5s
  const visibleCount = Math.floor(drawProgress * batches.length);

  // Title
  ctx.fillStyle = hexToRgba(C.amber, 0.6); ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'left'; ctx.fillText('SILICON CONTENT BY BATCH', padX, 13);

  // Threshold
  const thY = toY(threshold);
  ctx.strokeStyle = hexToRgba(C.amber, 0.15); ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padX, thY); ctx.lineTo(W - padX, thY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = hexToRgba(C.amber, 0.3); ctx.font = '8px JetBrains Mono, monospace';
  ctx.textAlign = 'right'; ctx.fillText('SPEC LIMIT', W - padX, thY - 4);

  // Area fill (animated)
  ctx.beginPath(); ctx.moveTo(toX(0), toY(batches[0]));
  for (let i = 1; i <= visibleCount && i < batches.length; i++) ctx.lineTo(toX(i), toY(batches[i]));
  const lastVis = Math.min(visibleCount, batches.length - 1);
  ctx.lineTo(toX(lastVis), H - padY); ctx.lineTo(toX(0), H - padY); ctx.closePath();
  ctx.fillStyle = hexToRgba(C.amber, 0.04); ctx.fill();

  // Line (animated)
  ctx.beginPath(); ctx.moveTo(toX(0), toY(batches[0]));
  for (let i = 1; i <= visibleCount && i < batches.length; i++) ctx.lineTo(toX(i), toY(batches[i]));
  ctx.strokeStyle = hexToRgba(C.amber, 0.6); ctx.lineWidth = 2; ctx.stroke();

  // Data points with hover
  for (let i = 0; i <= visibleCount && i < batches.length; i++) {
    const px = toX(i), py = toY(batches[i]);
    const hovered = isHover(m.x, m.y, px, py, 12);
    const isSpike = i === batches.length - 1;
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.06 + i);

    // Dot
    const dotR = hovered ? 5 : isSpike ? 3 + pulse * 2 : 2;
    if (isSpike || hovered) {
      ctx.beginPath(); ctx.arc(px, py, dotR + 4, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(C.amber, 0.1 + pulse * 0.1); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(px, py, dotR, 0, Math.PI * 2);
    ctx.fillStyle = hovered || isSpike ? C.amber : hexToRgba(C.amber, 0.4); ctx.fill();

    // Hover crosshair + tooltip
    if (hovered) {
      ctx.strokeStyle = hexToRgba(C.amber, 0.2); ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(px, padY); ctx.lineTo(px, H - padY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padX, py); ctx.lineTo(W - padX, py); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = C.t1; ctx.font = 'bold 11px JetBrains Mono, monospace'; ctx.textAlign = 'left';
      ctx.fillText(`${batches[i].toFixed(2)}%`, px + 8, py - 8);
      ctx.fillStyle = C.t3; ctx.font = '8px DM Sans, sans-serif';
      ctx.fillText(`Batch ${i + 1}`, px + 8, py + 6);
    }
  }

  // Spike label (always visible when drawn)
  if (visibleCount >= batches.length - 1) {
    const lx = toX(batches.length - 1), ly = toY(batches[batches.length - 1]);
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.06);
    if (!isHover(m.x, m.y, lx, ly, 12)) {
      ctx.fillStyle = C.t1; ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'left'; ctx.fillText('+0.12%', lx + 10, ly - 2);
    }
  }
}

// ─── Temperature: animated drop gauge with hover readout ───
function drawTempViz(ctx, W, H, frame, m) {
  const cx = W * 0.35, cy = H / 2 + 6, r = 38;
  const startAngle = Math.PI * 0.75, endAngle = Math.PI * 2.25, range = endAngle - startAngle;

  // Animated temp drop: starts at 34, drops to 22 over 2s
  const dropProgress = Math.min(frame / 120, 1);
  const currentTemp = 34 - dropProgress * 12;
  const valueAngle = startAngle + (currentTemp / 50) * range;

  ctx.fillStyle = hexToRgba(C.orange, 0.6); ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'center'; ctx.fillText('BF-3 SUPERHEAT', cx, 14);

  // BG arc
  ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = hexToRgba(C.orange, 0.08); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();

  // Safe zone
  const safeS = startAngle + (28 / 50) * range, safeE = startAngle + (40 / 50) * range;
  ctx.beginPath(); ctx.arc(cx, cy, r, safeS, safeE);
  ctx.strokeStyle = hexToRgba(C.green, 0.12); ctx.lineWidth = 7; ctx.stroke();

  // Value arc
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.05);
  ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, valueAngle);
  ctx.strokeStyle = hexToRgba(C.orange, 0.5 + pulse * 0.4); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();

  // Needle
  const nx = cx + Math.cos(valueAngle) * r, ny = cy + Math.sin(valueAngle) * r;
  const needleHover = isHover(m.x, m.y, nx, ny, 14);
  ctx.beginPath(); ctx.arc(nx, ny, needleHover ? 7 : 5, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(C.orange, 0.3); ctx.fill();
  ctx.beginPath(); ctx.arc(nx, ny, needleHover ? 5 : 3.5, 0, Math.PI * 2);
  ctx.fillStyle = C.orange; ctx.fill();

  // Center value
  ctx.fillStyle = C.t1; ctx.font = 'bold 22px JetBrains Mono, monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(currentTemp)}°C`, cx, cy - 2);
  ctx.fillStyle = hexToRgba(dropProgress < 1 ? C.orange : C.red, 0.5);
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillText('TARGET: 34°C', cx, cy + 16);
  ctx.textBaseline = 'alphabetic';

  // Right side: timeline showing drop
  const tx = W * 0.65, tw = W * 0.28, th = H - 40, ty = 24;
  ctx.fillStyle = hexToRgba(C.orange, 0.4); ctx.font = '8px JetBrains Mono, monospace';
  ctx.textAlign = 'left'; ctx.fillText('TIMELINE', tx, 14);

  const points = [
    { t: 0, v: 34 }, { t: 0.2, v: 33 }, { t: 0.4, v: 30 },
    { t: 0.6, v: 26 }, { t: 0.8, v: 23 }, { t: 1, v: 22 },
  ];
  const px = t => tx + t * tw, py = v => ty + (1 - (v - 18) / 20) * th;

  // Area
  ctx.beginPath(); ctx.moveTo(px(0), py(points[0].v));
  points.forEach(p => ctx.lineTo(px(p.t), py(p.v)));
  ctx.lineTo(px(1), ty + th); ctx.lineTo(px(0), ty + th); ctx.closePath();
  ctx.fillStyle = hexToRgba(C.orange, 0.04); ctx.fill();

  // Line
  ctx.beginPath(); ctx.moveTo(px(0), py(points[0].v));
  points.forEach(p => ctx.lineTo(px(p.t), py(p.v)));
  ctx.strokeStyle = hexToRgba(C.orange, 0.5); ctx.lineWidth = 2; ctx.stroke();

  // Animated playhead
  const playT = (frame * 0.005) % 1;
  const playIdx = points.findIndex(p => p.t >= playT) || points.length - 1;
  const pPrev = points[Math.max(0, playIdx - 1)], pNext = points[playIdx] || points[points.length - 1];
  const localT = pPrev.t === pNext.t ? 0 : (playT - pPrev.t) / (pNext.t - pPrev.t);
  const phx = px(playT), phy = py(pPrev.v + (pNext.v - pPrev.v) * localT);
  ctx.beginPath(); ctx.arc(phx, phy, 4, 0, Math.PI * 2);
  ctx.fillStyle = C.orange; ctx.fill();

  // Hover on timeline points
  points.forEach(p => {
    const ppx = px(p.t), ppy = py(p.v);
    if (isHover(m.x, m.y, ppx, ppy, 10)) {
      ctx.beginPath(); ctx.arc(ppx, ppy, 6, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(C.orange, 0.2); ctx.fill();
      ctx.fillStyle = C.t1; ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center'; ctx.fillText(`${p.v}°C`, ppx, ppy - 10);
    }
  });
}

// ─── Cascade: animated speed reduction bars with hover detail ───
function drawCascadeViz(ctx, W, H, frame, m) {
  const padX = 24, padY = 24;
  ctx.fillStyle = hexToRgba(C.cyan, 0.6); ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'left'; ctx.fillText('CCM-3 CASTING SPEED', padX, 14);

  const segments = [
    { label: '06:00', value: 1.8, target: true, event: 'Shift start' },
    { label: '09:20', value: 1.8, target: true, event: 'Normal ops' },
    { label: '10:00', value: 1.6, target: false, event: 'BF-3 signal' },
    { label: '11:00', value: 1.4, target: false, event: 'Speed cut 1' },
    { label: '12:30', value: 1.2, target: false, event: 'Speed cut 2' },
    { label: '13:30', value: 1.2, target: false, event: 'Holding' },
  ];
  const maxVal = 2.0, chartW = W - padX * 2, chartH = H - padY - 30;
  const barW = chartW / segments.length - 6;

  // Animated bar growth
  const growProgress = Math.min(frame / 60, 1);

  // Target line
  const targetY = padY + (1 - 1.8 / maxVal) * chartH;
  ctx.strokeStyle = hexToRgba(C.green, 0.15); ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padX, targetY); ctx.lineTo(W - padX, targetY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = hexToRgba(C.green, 0.3); ctx.font = '7px JetBrains Mono, monospace';
  ctx.textAlign = 'right'; ctx.fillText('TARGET 1.8', W - padX, targetY - 3);

  // Connecting trend line
  ctx.beginPath();
  segments.forEach((seg, i) => {
    const x = padX + i * (barW + 6) + barW / 2;
    const barH = (seg.value / maxVal) * chartH * growProgress;
    const y = padY + chartH - barH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = hexToRgba(C.cyan, 0.15); ctx.lineWidth = 1; ctx.stroke();

  segments.forEach((seg, i) => {
    const x = padX + i * (barW + 6);
    const animatedH = (seg.value / maxVal) * chartH * growProgress;
    const y = padY + chartH - animatedH;
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + i * 0.5);
    const color = seg.target ? C.green : C.cyan;
    const hovered = isHoverRect(m.x, m.y, x, y, barW, animatedH);

    // Bar
    ctx.fillStyle = hexToRgba(color, hovered ? 0.45 : seg.target ? 0.15 : (0.25 + pulse * 0.15));
    ctx.beginPath(); ctx.roundRect(x, y, barW, animatedH, 3); ctx.fill();

    // Border on alert bars
    if (!seg.target) {
      ctx.strokeStyle = hexToRgba(C.cyan, hovered ? 0.7 : 0.3 + pulse * 0.2);
      ctx.lineWidth = hovered ? 1.5 : 1; ctx.stroke();
    }

    // Value
    ctx.fillStyle = hovered ? C.t1 : seg.target ? C.t3 : C.t2;
    ctx.font = `bold ${hovered ? 11 : 10}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center'; ctx.fillText(`${seg.value}`, x + barW / 2, y - 6);

    // Time
    ctx.fillStyle = hovered ? C.t2 : C.t4; ctx.font = '8px JetBrains Mono, monospace';
    ctx.fillText(seg.label, x + barW / 2, padY + chartH + 14);

    // Hover tooltip
    if (hovered) {
      ctx.fillStyle = color; ctx.font = '8px DM Sans, sans-serif';
      ctx.fillText(seg.event, x + barW / 2, padY + chartH + 26);
    }
  });

  ctx.fillStyle = C.t4; ctx.font = '8px JetBrains Mono, monospace';
  ctx.textAlign = 'right'; ctx.fillText('m/min', W - padX, padY + 8);
}

// ─── Impact: animated counters + hover breakdown ───
function drawImpactViz(ctx, W, H, frame, m) {
  const padX = 24, padY = 16;
  const countProgress = Math.min(frame / 90, 1); // count-up over 1.5s

  ctx.fillStyle = hexToRgba(C.red, 0.6); ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'left'; ctx.fillText('REVENUE EXPOSURE', padX, 13);

  // Animated big number
  const currentVal = (8.1 * countProgress).toFixed(1);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.03);
  ctx.fillStyle = C.t1; ctx.font = 'bold 26px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`₹${currentVal} Cr`, W / 2, padY + 28);
  ctx.fillStyle = hexToRgba(C.red, 0.5 + pulse * 0.2); ctx.font = '10px DM Sans, sans-serif';
  ctx.fillText('at risk across automotive grade', W / 2, padY + 44);

  // Confidence bars with animated fill
  const bars = CONFIDENCE_CHAIN;
  const barY = padY + 56, totalW = W - padX * 2, barH = 16;

  bars.forEach((bar, i) => {
    const targetW = (bar.value / 100) * totalW;
    const animW = targetW * Math.min(countProgress * 1.5 - i * 0.2, 1);
    const y = barY + i * (barH + 6);
    const p = 0.5 + 0.5 * Math.sin(frame * 0.04 + i * 0.6);
    const hovered = isHoverRect(m.x, m.y, padX, y, totalW, barH);

    // BG
    ctx.fillStyle = hexToRgba(bar.color, hovered ? 0.1 : 0.04);
    ctx.beginPath(); ctx.roundRect(padX, y, totalW, barH, 4); ctx.fill();

    // Value bar
    ctx.fillStyle = hexToRgba(bar.color, hovered ? 0.45 : 0.2 + p * 0.12);
    ctx.beginPath(); ctx.roundRect(padX, y, Math.max(0, animW), barH, 4); ctx.fill();

    // Shimmer on active bar
    if (animW > 10) {
      const shimmerX = padX + ((frame * 2 + i * 40) % (animW + 40)) - 20;
      ctx.fillStyle = hexToRgba(bar.color, 0.08);
      ctx.beginPath(); ctx.roundRect(Math.max(padX, shimmerX), y, 20, barH, 4); ctx.fill();
    }

    // Label + value
    ctx.fillStyle = hovered ? C.t1 : C.t2; ctx.font = `${hovered ? 'bold ' : ''}10px DM Sans, sans-serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(bar.label, padX + 6, y + barH / 2);
    ctx.fillStyle = bar.color; ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right'; ctx.fillText(`${bar.value}%`, W - padX - 6, y + barH / 2);

    // Hover: show rupee breakdown
    if (hovered) {
      const amounts = ['₹3.8 Cr', '₹2.2 Cr', '₹1.3 Cr', '₹0.8 Cr'];
      ctx.fillStyle = C.t3; ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'center'; ctx.fillText(amounts[i], padX + totalW / 2, y + barH / 2);
    }
  });
  ctx.textBaseline = 'alphabetic';
}

// ─── Utility ───
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Confidence Chain Strip ───

function ConfidenceStrip({ activeStep }) {
  // Map tour steps to confidence segments: step 1→0, step 2→1, step 3→2, step 4→3
  const activeSegment = activeStep > 0 ? activeStep - 1 : -1;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      padding: '0 4px',
    }}>
      {CONFIDENCE_CHAIN.map((seg, i) => {
        const isActive = i <= activeSegment;
        const isCurrent = i === activeSegment;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              opacity: isActive ? 1 : 0.35,
              transition: 'opacity 600ms ease',
            }}>
              <span style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                fontWeight: 700,
                color: seg.color,
                textShadow: isCurrent ? `0 0 12px ${hexToRgba(seg.color, 0.6)}` : 'none',
                transition: 'all 600ms ease',
              }}>
                {seg.value}%
              </span>
              <span style={{
                fontFamily: FONT_MONO,
                fontSize: 7,
                color: C.t4,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {seg.label}
              </span>
            </div>
            {i < CONFIDENCE_CHAIN.length - 1 && (
              <div style={{
                width: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: isActive ? seg.color : C.t4,
                  opacity: isActive ? 0.7 : 0.2,
                  transition: 'all 600ms ease',
                }}>
                  →
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Panel ───

export default function CausalBriefingPanel() {
  const causalTourState = useStore(s => s.causalTourState);
  const causalTourStep = useStore(s => s.causalTourStep);
  const causalTransitioning = useStore(s => s.causalTransitioning);
  const startCausalTour = useStore(s => s.startCausalTour);
  const advanceCausalTour = useStore(s => s.advanceCausalTour);
  const prevCausalTour = useStore(s => s.prevCausalTour);
  const pauseCausalTour = useStore(s => s.pauseCausalTour);
  const resumeCausalTour = useStore(s => s.resumeCausalTour);
  const endCausalTour = useStore(s => s.endCausalTour);
  const showCausalBriefing = useStore(s => s.showCausalBriefing);
  const scanPhase = useStore(s => s.scanPhase);
  const holoMode = useStore(s => s.holoMode);
  const toggleHoloMode = useStore(s => s.toggleHoloMode);

  const [visible, setVisible] = useState(false);
  const hasShownRef = useRef(false);

  // Voice narration synced to tour state — returns true when audio is playing
  const isNarrating = useTourNarration();

  // Show briefing once when photogrammetry model finishes loading
  useEffect(() => {
    if (scanPhase === 'complete' && causalTourState === 'idle' && !hasShownRef.current) {
      hasShownRef.current = true;
      showCausalBriefing();
      setVisible(true);
    }
  }, [scanPhase, causalTourState, showCausalBriefing]);

  // Show on state change
  useEffect(() => {
    if (causalTourState !== 'idle') setVisible(true);
  }, [causalTourState]);

  const isActive = causalTourState === 'active' || causalTourState === 'paused';
  const isBriefing = causalTourState === 'briefing';
  const isComplete = causalTourState === 'complete';
  const currentStep = isActive ? TOUR_STEPS[causalTourStep] : null;

  // Narration text
  const narrationText = isComplete
    ? 'Causal chain fully traced. Two anomaly sources, three affected zones, 59% compound confidence. Explore layers or click zones to investigate.'
    : isBriefing
    ? 'Two anomalies detected this shift. BF-3 and CCM-3 are linked in an active causal chain with 59% compound confidence. Shall I walk you through it?'
    : currentStep?.narration || '';

  const { displayText, isDone } = useTyping(narrationText, 14, visible && !causalTransitioning);

  if (causalTourState === 'idle') return null;

  const stepAccent = currentStep?.accent || C.cyan;
  const stepTag = currentStep?.tag || (isBriefing ? 'BRIEFING' : 'COMPLETE');

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => endCausalTour(), 400);
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        bottom: 90,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
        zIndex: 200,
        width: 620,
        opacity: visible ? 1 : 0,
        transition: 'all 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: `1px solid ${hexToRgba(stepAccent, isNarrating ? 0.35 : 0.18)}`,
          boxShadow: isNarrating
            ? `0 0 20px ${hexToRgba(stepAccent, 0.12)}, 0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(255, 255, 255, 0.03)`
            : `0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(255, 255, 255, 0.03)`,
          transition: 'border-color 600ms ease, box-shadow 600ms ease',
          animation: isNarrating ? 'narratePulse 2.5s ease-in-out infinite' : 'none',
        }}
      >
        {/* ─── Header ─── */}
        <div style={{
          padding: '12px 18px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: stepAccent,
            boxShadow: isNarrating
              ? `0 0 12px ${hexToRgba(stepAccent, 0.8)}, 0 0 24px ${hexToRgba(stepAccent, 0.3)}`
              : `0 0 10px ${hexToRgba(stepAccent, 0.6)}`,
            animation: isNarrating ? 'pulse-dot 1s ease-in-out infinite' : 'pulse-dot 2s ease-in-out infinite',
            transition: 'box-shadow 300ms ease',
          }} />
          <span style={{
            fontFamily: FONT_MONO,
            fontSize: 9,
            fontWeight: 700,
            color: stepAccent,
            letterSpacing: '0.14em',
          }}>
            {stepTag}
          </span>

          {isActive && (
            <span style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              color: C.t4,
              letterSpacing: '0.08em',
            }}>
              STEP {causalTourStep + 1} / {TOUR_STEPS.length}
            </span>
          )}

          <div style={{ flex: 1 }} />

          {/* Step dots */}
          {isActive && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {TOUR_STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === causalTourStep ? 14 : 5,
                  height: 5,
                  borderRadius: 3,
                  background: i === causalTourStep
                    ? TOUR_STEPS[i].accent
                    : i < causalTourStep
                    ? hexToRgba(TOUR_STEPS[i].accent, 0.5)
                    : hexToRgba(C.t4, 0.3),
                  transition: 'all 400ms ease',
                }} />
              ))}
            </div>
          )}

          {/* View toggle */}
          <button
            onClick={toggleHoloMode}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              background: holoMode ? hexToRgba(C.cyan, 0.12) : 'rgba(255,255,255,0.04)',
              border: `1px solid ${holoMode ? hexToRgba(C.cyan, 0.3) : 'rgba(255,255,255,0.08)'}`,
              color: holoMode ? C.cyan : C.t3,
              fontFamily: FONT_MONO,
              fontSize: 8,
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            {holoMode ? 'HOLO' : 'PHOTO'}
          </button>

          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: C.t4,
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: FONT_SANS,
              padding: '0 2px',
            }}
          >
            ×
          </button>
        </div>

        {/* ─── Canvas Visualization ─── */}
        {(isActive || isBriefing) && (
          <div style={{
            padding: '10px 14px 6px',
            display: 'flex',
            justifyContent: 'center',
            opacity: causalTransitioning ? 0.3 : 1,
            transition: 'opacity 400ms ease',
            position: 'relative',
          }}>
            <div style={{
              width: '100%',
              borderRadius: 12,
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: 4,
              position: 'relative',
            }}>
              <StepCanvas step={isBriefing ? -1 : causalTourStep} width={572} height={140} />

              {/* Play narration button — only on briefing (needs user gesture to unlock audio) */}
              {isBriefing && (
                <button
                  onClick={() => playNarration('briefing')}
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isNarrating
                      ? hexToRgba(stepAccent, 0.2)
                      : 'rgba(255, 255, 255, 0.08)',
                    border: `1px solid ${isNarrating
                      ? hexToRgba(stepAccent, 0.4)
                      : 'rgba(255, 255, 255, 0.12)'}`,
                    color: isNarrating ? stepAccent : C.t2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 200ms ease',
                    animation: isNarrating ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                  }}
                >
                  {isNarrating ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="1" y="1" width="4" height="10" rx="1" fill="currentColor" />
                      <rect x="7" y="1" width="4" height="10" rx="1" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 1L10 6L2 11V1Z" fill="currentColor" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── Narration ─── */}
        <div style={{
          padding: isActive ? '4px 20px 10px' : '14px 20px',
          minHeight: 40,
        }}>
          <div style={{
            fontFamily: FONT_SANS,
            fontSize: 13,
            lineHeight: 1.7,
            color: C.t1,
            fontWeight: 500,
          }}>
            {displayText}
            {!isDone && (
              <span style={{
                color: stepAccent,
                animation: 'blink 1s step-end infinite',
              }}>│</span>
            )}
          </div>
        </div>

        {/* ─── Confidence Chain ─── */}
        {isActive && (
          <div style={{
            padding: '0 14px 10px',
          }}>
            <ConfidenceStrip activeStep={causalTourStep} />
          </div>
        )}

        {/* ─── Controls ─── */}
        <div style={{
          padding: '8px 18px 14px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {isBriefing && (
            <>
              <button
                onClick={startCausalTour}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  borderRadius: 12,
                  border: `1px solid ${hexToRgba(C.cyan, 0.3)}`,
                  color: C.cyan,
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  textAlign: 'center',
                  background: hexToRgba(C.cyan, 0.08),
                }}
              >
                Walk me through it
              </button>
              <button
                onClick={handleDismiss}
                style={{
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: C.t3,
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
            </>
          )}

          {isActive && (
            <>
              <button
                onClick={prevCausalTour}
                disabled={causalTourStep <= 0}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  background: causalTourStep > 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: `1px solid ${causalTourStep > 0 ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                  color: causalTourStep > 0 ? C.t2 : C.t4,
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  cursor: causalTourStep > 0 ? 'pointer' : 'default',
                }}
              >
                ← Prev
              </button>

              {causalTourState === 'paused' ? (
                <button
                  onClick={resumeCausalTour}
                  style={{
                    flex: 1,
                    padding: '7px 16px',
                    borderRadius: 8,
                    background: hexToRgba(C.cyan, 0.08),
                    border: `1px solid ${hexToRgba(C.cyan, 0.25)}`,
                    color: C.cyan,
                    fontFamily: FONT_SANS,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Resume
                </button>
              ) : (
                <div style={{ flex: 1 }} />
              )}

              <button
                onClick={() => {
                  if (causalTourStep >= TOUR_STEPS.length - 1) {
                    const store = useStore.getState();
                    store.advanceCausalTour();
                  } else {
                    advanceCausalTour();
                  }
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: `1px solid ${hexToRgba(stepAccent, 0.3)}`,
                  color: stepAccent,
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: hexToRgba(stepAccent, 0.08),
                }}
              >
                {causalTourStep >= TOUR_STEPS.length - 1 ? 'Finish' : 'Next →'}
              </button>
            </>
          )}

          {isComplete && (
            <>
              <button
                onClick={() => {
                  const store = useStore.getState();
                  store.startCausalTour();
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: C.t2,
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Replay
              </button>
              <div style={{ flex: 1 }} />
              <button
                onClick={handleDismiss}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${hexToRgba(C.cyan, 0.3)}`,
                  color: C.cyan,
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: hexToRgba(C.cyan, 0.08),
                }}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
