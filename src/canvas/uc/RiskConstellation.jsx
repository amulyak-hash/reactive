import { useRef, useEffect, useState } from 'react';
import { C, rgb } from '../../theme/tokens';
import { setupCanvas, drawGlow } from '../utils';
import { easeOutCubic, easeOutBack } from '../easing';

const NODE_ANGLES = Array.from({ length: 8 }, (_, i) => (2 * Math.PI * i) / 8 - Math.PI / 2);

// Cross-connections: [from, to] — lines colored by the "from" node's accent
const CONNECTIONS = [
  [0, 4], [1, 3], [5, 2],
];

// Critical nodes get a subtle ambient shimmer
const CRITICAL_NODES = new Set([0, 1, 3, 4]);

// Staggered reveal — severity-based loading order (slow, cinematic)
// Wave 1 (red): 1-2.5s, Wave 2 (orange/amber): 3-4.5s,
// Wave 3 (purple/blue/cyan): 5-6.5s, Wave 4 (green): 7-8.5s
const REVEAL_ORDER = {
  0: { start: 1000, end: 2500, dim: 1.0 },   // Afcons £35.5M — red, critical
  1: { start: 1400, end: 2800, dim: 1.0 },   // Budget Bleed — red, critical
  3: { start: 3000, end: 4500, dim: 1.0 },   // EW Response — orange, critical
  2: { start: 3500, end: 5000, dim: 0.85 },  // Salami — amber
  4: { start: 5000, end: 6500, dim: 1.0 },   // Cascade — purple, critical
  5: { start: 5500, end: 7000, dim: 0.8 },   // NCE Validity — cyan
  7: { start: 6000, end: 7500, dim: 0.8 },   // Board Brief — blue
  6: { start: 7000, end: 8500, dim: 0.75 },  // Silence Alarm — green
};

// One-line labels below each mini viz
const VIZ_LABELS = [
  'Afcons 25% — 2x portfolio avg',        // 0: bar chart
  'Burn rate accelerating since Jan',      // 1: sparkline
  '7 claims under £50K threshold',         // 2: dots
  '15+ days = 4.5x cost of ≤5 days',      // 3: bands
  'Prelims + lost production = £24M',      // 4: cascade
  '£400K claim → £240K fair value',        // 5: comparison
  'Behind programme, no EWs raised',       // 6: dots
  '£90M gap recoverable in 30 days',      // 7: dots
];

function cardSize(exposure, maxExposure) {
  const t = exposure / maxExposure;
  return { w: 90 + t * 50, h: 52 + t * 18, br: 14 };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
}

// ─── Mini Viz Renderers ───
// Each draws into a rect: (ctx, x, y, w, h, uc, accent, {ar,ag,ab}, nodeP)

function drawMiniBarChart(ctx, vx, vy, vw, vh, data, accent, rgb, nodeP) {
  // data: array of { value, max, color? }
  const barW = Math.min(12, (vw - 8) / data.length - 2);
  const gap = 2;
  const totalW = data.length * (barW + gap) - gap;
  const startX = vx + (vw - totalW) / 2;

  data.forEach((d, i) => {
    const barH = (d.value / d.max) * (vh - 4);
    const bx = startX + i * (barW + gap);
    const by = vy + vh - barH;
    ctx.globalAlpha = nodeP * 0.7;
    ctx.fillStyle = d.color || accent;
    roundRect(ctx, bx, by, barW, barH, 2); ctx.fill();
  });
}

function drawMiniSparkline(ctx, vx, vy, vw, vh, points, accent, rgb, nodeP) {
  if (!points?.length) return;
  const max = Math.max(...points);
  const step = vw / (points.length - 1);
  ctx.globalAlpha = nodeP * 0.6;
  ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => {
    const px = vx + i * step;
    const py = vy + vh - (p / max) * (vh - 4);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.stroke();
  // Fill under
  const lastX = vx + (points.length - 1) * step;
  ctx.lineTo(lastX, vy + vh); ctx.lineTo(vx, vy + vh); ctx.closePath();
  ctx.globalAlpha = nodeP * 0.1;
  ctx.fillStyle = accent; ctx.fill();
}

function drawMiniDots(ctx, vx, vy, vw, vh, count, accent, rgb, nodeP) {
  const r = Math.min(4, (vw / count - 2) / 2);
  const totalW = count * (r * 2 + 3) - 3;
  const sx = vx + (vw - totalW) / 2;
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = nodeP * (0.4 + (i / count) * 0.5);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(sx + i * (r * 2 + 3) + r, vy + vh / 2, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMiniBands(ctx, vx, vy, vw, vh, bands, nodeP) {
  const barH = Math.min(10, (vh - 4) / bands.length - 2);
  bands.forEach((b, i) => {
    const bw = (b.value / bands[0].max) * (vw - 8);
    const by = vy + i * (barH + 3);
    ctx.globalAlpha = nodeP * 0.65;
    ctx.fillStyle = b.color;
    roundRect(ctx, vx + 4, by, bw, barH, 3); ctx.fill();
  });
}

function drawMiniCascade(ctx, vx, vy, vw, vh, steps, accent, rgb, nodeP) {
  const stepW = (vw - 8) / steps.length;
  steps.forEach((s, i) => {
    const sh = (s.value / steps[steps.length - 1].value) * (vh - 6);
    const sx = vx + 4 + i * stepW;
    const sy = vy + vh - sh;
    ctx.globalAlpha = nodeP * 0.6;
    ctx.fillStyle = s.color || accent;
    roundRect(ctx, sx + 1, sy, stepW - 2, sh, 2); ctx.fill();
  });
}

// Map use case index to its mini viz renderer
function drawMiniViz(ctx, vx, vy, vw, vh, uc, i, accent, rgb, nodeP) {
  switch (i) {
    case 0: // Afcons — bar chart of 5 contractors by variation %
      drawMiniBarChart(ctx, vx, vy, vw, vh, [
        { value: 25, max: 25, color: C.red },
        { value: 16, max: 25, color: C.orange },
        { value: 13.3, max: 25, color: C.amber },
        { value: 9.8, max: 25, color: C.blue },
        { value: 6, max: 25, color: C.green },
      ], accent, rgb, nodeP);
      break;
    case 1: // Budget Bleed — sparkline trending up
      drawMiniSparkline(ctx, vx, vy, vw, vh,
        [1.02, 1.05, 1.12, 1.18, 1.24, 1.30, 1.34, 1.38],
        accent, rgb, nodeP);
      break;
    case 2: // Salami — accumulating dots (7 NCEs)
      drawMiniDots(ctx, vx, vy, vw, vh, 7, accent, rgb, nodeP);
      break;
    case 3: // EW Response — 3 cost bands
      drawMiniBands(ctx, vx, vy, vw, vh, [
        { value: 310, max: 310, color: C.red },
        { value: 145, max: 310, color: C.amber },
        { value: 68, max: 310, color: C.green },
      ], nodeP);
      break;
    case 4: // Cascade — waterfall steps
      drawMiniCascade(ctx, vx, vy, vw, vh, [
        { value: 340, color: C.amber },
        { value: 5040, color: C.orange },
        { value: 1820, color: C.red },
        { value: 16800, color: C.purple },
      ], accent, rgb, nodeP);
      break;
    case 5: // NCE Validity — comparison bars (claim vs fair)
      drawMiniBarChart(ctx, vx, vy, vw, vh, [
        { value: 400, max: 400, color: C.red },
        { value: 240, max: 400, color: C.cyan },
      ], accent, rgb, nodeP);
      break;
    case 6: // Silence — 3 dots for 3 contractors
      drawMiniDots(ctx, vx, vy, vw, vh, 3, accent, rgb, nodeP);
      break;
    case 7: // Board Brief — 5 risk dots
      drawMiniDots(ctx, vx, vy, vw, vh, 5, accent, rgb, nodeP);
      break;
  }
}

export default function RiskConstellation({ width, height, useCases, onNodeClick }) {
  const canvasRef = useRef(null);
  const startRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const hoveredRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !useCases?.length || width < 10 || height < 10) return;
    startRef.current = performance.now();

    const cx = width / 2;
    const cy = height * 0.45;
    const orbitRx = width * 0.38;
    const orbitRy = height * 0.30;
    const maxExposure = Math.max(...useCases.map(uc => uc.budgetImpact.withoutAction || 1000));

    const nodes = useCases.slice(0, 8).map((uc, i) => {
      const angle = NODE_ANGLES[i];
      const exposure = uc.budgetImpact.withoutAction || 1000;
      const card = cardSize(exposure, maxExposure);
      return {
        x: cx + Math.cos(angle) * orbitRx,
        y: cy + Math.sin(angle) * orbitRy,
        ...card, angle, uc, exposure, idx: i,
      };
    });

    // Hub-to-node connections — colored by destination node accent
    const hubEdges = nodes.map(n => ({
      from: -1, to: n.idx, fx: cx, fy: cy, tx: n.x, ty: n.y,
      color: n.uc.insightTagColor || n.uc.accent,
    }));

    // Cross-connections — colored by source node accent
    const crossEdges = CONNECTIONS
      .filter(([from, to]) => from < nodes.length && to < nodes.length)
      .map(([from, to]) => ({
        from, to,
        color: nodes[from].uc.insightTagColor || nodes[from].uc.accent,
      }));

    // Build particles for all edges
    const allEdges = [
      ...hubEdges.map(e => ({ ...e, particles: Array.from({ length: 2 }, (_, j) => ({ t: j * 0.5, speed: 0.0004 + Math.random() * 0.0003 })) })),
      ...crossEdges.map(e => ({ ...e, particles: Array.from({ length: 3 }, (_, j) => ({ t: j * 0.33, speed: 0.0005 + Math.random() * 0.0003 })) })),
    ];

    // Hit test — uses expanded bounds for hovered card
    const hitTest = (mx, my) => {
      for (const n of nodes) {
        const pad = 8;
        const left = n.x - n.w / 2 - pad;
        const top = n.y - n.h / 2 - pad;
        if (mx >= left && mx <= left + n.w + pad * 2 && my >= top && my <= top + n.h + pad * 2) {
          return n.idx;
        }
      }
      return null;
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const found = hitTest(mouseRef.current.x, mouseRef.current.y);
      hoveredRef.current = found;
      setHovered(found);
      canvas.style.cursor = found !== null ? 'pointer' : 'default';
    };
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const found = hitTest(e.clientX - rect.left, e.clientY - rect.top);
      if (found !== null) onNodeClick?.(nodes[found].uc.id);
    };
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 }; hoveredRef.current = null; setHovered(null); canvas.style.cursor = 'default'; };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const draw = () => {
      const T = performance.now();
      const elapsed = T - startRef.current;
      const entryP = Math.min(elapsed / 2000, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(orbitRx, orbitRy) * 1.4);
      bgGrad.addColorStop(0, 'rgba(41, 207, 214, 0.05)');
      bgGrad.addColorStop(0.4, 'rgba(92, 131, 255, 0.02)');
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, width, height);

      // Orbit ellipse
      ctx.globalAlpha = 0.05 * easeOutCubic(Math.min(elapsed / 2000, 1));
      ctx.strokeStyle = C.teal; ctx.lineWidth = 1;
      ctx.setLineDash([6, 12]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, orbitRx, orbitRy, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // ─── Connections + particles (colored by card accent, timed to node reveal) ───
      allEdges.forEach(edge => {
        const isHub = edge.from === -1;
        // Connection appears when its target node appears
        const targetIdx = isHub ? edge.to : edge.to;
        const targetReveal = REVEAL_ORDER[targetIdx] || { start: 2000, end: 2800, dim: 0.8 };
        const connP = easeOutCubic(Math.min(Math.max((elapsed - targetReveal.start) / (targetReveal.end - targetReveal.start), 0), 1));
        if (connP <= 0.01) return;

        const fx = isHub ? edge.fx : nodes[edge.from].x;
        const fy = isHub ? edge.fy : nodes[edge.from].y;
        const tx = isHub ? edge.tx : nodes[edge.to].x;
        const ty = isHub ? edge.ty : nodes[edge.to].y;
        const color = edge.color;

        const midX = (fx + tx) / 2 + (cx - (fx + tx) / 2) * 0.15;
        const midY = (fy + ty) / 2 + (cy - (fy + ty) / 2) * 0.15;

        // Connection line — accent colored
        ctx.globalAlpha = (isHub ? 0.06 : 0.1) * connP;
        ctx.strokeStyle = color; ctx.lineWidth = isHub ? 0.6 : 0.8;
        ctx.beginPath(); ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(midX, midY, tx, ty); ctx.stroke();

        // Particles — accent colored
        if (connP > 0.5) {
          edge.particles.forEach(p => {
            p.t = (p.t + p.speed * 16) % 1;
            const t = p.t;
            const px = (1 - t) * (1 - t) * fx + 2 * (1 - t) * t * midX + t * t * tx;
            const py = (1 - t) * (1 - t) * fy + 2 * (1 - t) * t * midY + t * t * ty;
            const alpha = Math.sin(t * Math.PI) * 0.6;
            ctx.globalAlpha = alpha * connP;
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
            drawGlow(ctx, px, py, 5, color, 0.15 * alpha);
          });
        }
      });

      // ─── Hub ───
      const hubP = easeOutBack(Math.min(elapsed / 1000, 1));
      const hubW = 110 * hubP, hubH = 60 * hubP;
      const hubX = cx - hubW / 2, hubY = cy - hubH / 2;

      if (hubP > 0.01) {
        drawGlow(ctx, cx, cy, 70, C.teal, 0.06 * (0.85 + 0.15 * Math.sin(T * 0.002)));

        ctx.globalAlpha = 0.1 * hubP;
        roundRect(ctx, hubX, hubY, hubW, hubH, 16);
        ctx.fillStyle = C.teal; ctx.fill();

        const hubSheen = ctx.createLinearGradient(hubX, hubY, hubX, hubY + hubH);
        hubSheen.addColorStop(0, 'rgba(255,255,255,0.08)');
        hubSheen.addColorStop(0.5, 'rgba(255,255,255,0.02)');
        hubSheen.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = hubP;
        roundRect(ctx, hubX, hubY, hubW, hubH, 16);
        ctx.fillStyle = hubSheen; ctx.fill();

        ctx.globalAlpha = 0.35 * hubP;
        roundRect(ctx, hubX, hubY, hubW, hubH, 16);
        ctx.strokeStyle = C.teal; ctx.lineWidth = 1; ctx.stroke();

        ctx.globalAlpha = 0.5 * hubP;
        ctx.font = '500 9px "Satoshi", sans-serif';
        ctx.fillStyle = '#f5f7fb'; ctx.textAlign = 'center';
        ctx.fillText('PORT TALBOT', cx, cy - 8);
        ctx.globalAlpha = hubP;
        ctx.font = '700 16px "Satoshi", sans-serif';
        ctx.fillStyle = C.teal;
        ctx.fillText('£93.2M', cx, cy + 10);
      }

      // ─── Insight cards (severity-staggered reveal) ───
      nodes.forEach((node, i) => {
        const reveal = REVEAL_ORDER[i] || { start: 2000, end: 2800, dim: 0.8 };
        const nodeP = easeOutBack(Math.min(Math.max((elapsed - reveal.start) / (reveal.end - reveal.start), 0), 1));
        if (nodeP <= 0.01) return;

        const isH = hoveredRef.current === i;
        const isCritical = CRITICAL_NODES.has(i);
        // After full reveal, non-critical cards dim slightly
        const dimFactor = isH ? 1.0 : (nodeP >= 1 ? reveal.dim : 1.0);
        const accent = node.uc.insightTagColor || node.uc.accent;
        const { r: ar, g: ag, b: ab } = hexToRgb(accent);

        // ── Card dimensions — expand on hover to show mini viz ──
        const baseW = node.w * nodeP;
        const baseH = node.h * nodeP;
        const expandedW = Math.min(baseW * 2, 220);
        const expandedH = baseH * 2.4;
        const w = isH ? expandedW : baseW;
        const h = isH ? expandedH : baseH;
        const x = node.x - w / 2;
        const y = node.y - h / 2;

        // ── Critical shimmer (default, not hover) ──
        if (isCritical && !isH) {
          const shimmer = 0.5 + 0.5 * Math.sin(T * 0.002 + i * 1.5);
          drawGlow(ctx, node.x, node.y, Math.max(baseW, baseH) * 1.1, accent, 0.08 * shimmer * nodeP);
        }

        // Glow behind card — dimmed for non-critical
        const pulse = 0.7 + 0.3 * Math.sin(T * 0.003 + i * 0.8);
        drawGlow(ctx, node.x, node.y, Math.max(w, h) * (isH ? 0.8 : 0.7), accent, (isH ? 0.15 : 0.08) * pulse * nodeP * dimFactor);

        // ── Glass fill ──
        ctx.globalAlpha = (isH ? 0.3 : 0.18) * nodeP * dimFactor;
        roundRect(ctx, x, y, w, h, node.br);
        ctx.fillStyle = `rgba(${ar},${ag},${ab},1)`; ctx.fill();

        // Sheen
        const sheen = ctx.createLinearGradient(x, y, x, y + h);
        sheen.addColorStop(0, 'rgba(255,255,255,0.1)');
        sheen.addColorStop(0.3, 'rgba(255,255,255,0.03)');
        sheen.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = nodeP * dimFactor;
        roundRect(ctx, x, y, w, h, node.br); ctx.fillStyle = sheen; ctx.fill();

        // Bottom tint
        const innerGlow = ctx.createLinearGradient(x, y, x, y + h);
        innerGlow.addColorStop(0, 'rgba(0,0,0,0)');
        innerGlow.addColorStop(1, `rgba(${ar},${ag},${ab},0.05)`);
        roundRect(ctx, x, y, w, h, node.br); ctx.fillStyle = innerGlow; ctx.fill();

        // Border
        ctx.globalAlpha = (isH ? 0.5 : isCritical ? 0.4 : 0.3) * nodeP * dimFactor;
        roundRect(ctx, x, y, w, h, node.br);
        ctx.strokeStyle = accent;
        ctx.lineWidth = isCritical ? 1.2 : 0.8;
        ctx.stroke();

        // ── Card content ──
        const valueText = node.uc.insightValue || node.uc.budgetImpact.value;
        const tag = node.uc.insightTag;

        if (isH) {
          // ── EXPANDED: value + tag + mini viz + supporting text ──

          // Value at top
          ctx.globalAlpha = nodeP;
          ctx.font = '700 14px "Satoshi", sans-serif';
          ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
          ctx.fillText(valueText, node.x, y + 18);

          // Tag
          ctx.globalAlpha = nodeP * 0.6;
          ctx.font = '700 8px "Satoshi", sans-serif';
          ctx.fillStyle = accent;
          ctx.fillText(tag, node.x, y + 30);

          // Mini viz area
          const vizPad = 10;
          const vizY = y + 36;
          const vizH = h - 68;
          if (vizH > 10) {
            drawMiniViz(ctx, x + vizPad, vizY, w - vizPad * 2, vizH, node.uc, i, accent, { ar, ag, ab }, nodeP);
          }

          // Supporting text — one line below viz
          const vizLabel = VIZ_LABELS[i];
          if (vizLabel) {
            ctx.globalAlpha = 0.5 * nodeP;
            ctx.font = '500 8px "Satoshi", sans-serif';
            ctx.fillStyle = '#f5f7fb';
            ctx.textAlign = 'center';
            ctx.fillText(vizLabel, node.x, y + h - 18);
          }

          // Click hint
          ctx.globalAlpha = 0.25 * nodeP;
          ctx.font = '500 7px "Satoshi", sans-serif';
          ctx.fillStyle = '#f5f7fb';
          ctx.fillText('click to explore', node.x, y + h - 6);
        } else {
          // ── RESTING: value + tag (dimmed for non-critical) ──
          const valueFontSize = Math.min(Math.round(baseH * 0.32), 15);
          ctx.globalAlpha = nodeP * dimFactor;
          ctx.font = `700 ${valueFontSize}px "Satoshi", sans-serif`;
          ctx.fillStyle = accent; ctx.textAlign = 'center';
          ctx.fillText(valueText, node.x, node.y - 2);

          if (tag) {
            ctx.globalAlpha = nodeP * 0.65 * dimFactor;
            ctx.font = '600 8px "Satoshi", sans-serif';
            ctx.fillStyle = `rgba(${ar},${ag},${ab},0.8)`;
            ctx.fillText(tag, node.x, node.y + valueFontSize * 0.6 + 6);
          }
        }
      });

      // Ambient dust
      ctx.globalAlpha = 1;
      for (let i = 0; i < 25; i++) {
        const dx = (Math.sin(T * 0.0004 + i * 23) * 0.5 + 0.5) * width;
        const dy = (Math.cos(T * 0.0003 + i * 37) * 0.5 + 0.5) * height;
        ctx.fillStyle = 'rgba(41, 207, 214, 0.04)';
        ctx.beginPath(); ctx.arc(dx, dy, 0.6, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [width, height, useCases]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={canvasRef} style={{ width, height, borderRadius: 16 }} />
    </div>
  );
}
