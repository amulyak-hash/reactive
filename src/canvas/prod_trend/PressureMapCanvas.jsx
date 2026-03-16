import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerp } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function PressureMapCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const particles = useRef([]);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const stages = useMemo(() => [
    { label: 'Ore Yard', flow: 1.0, x: 0.08 },
    { label: 'BF-3', flow: 0.78, x: 0.28 },
    { label: 'SMS', flow: 0.64, x: 0.48 },
    { label: 'CCM-3', flow: 0.58, x: 0.68 },
    { label: 'HSM-1', flow: 0.72, x: 0.88 },
  ], []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    let raf;
    particles.current = [];

    const pipeY = h * 0.45;
    const pipeH = 28;

    const draw = () => {
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 30);

      // Draw pipe sections
      for (let i = 0; i < stages.length - 1; i++) {
        const s0 = stages[i], s1 = stages[i + 1];
        const x0 = s0.x * w, x1 = s1.x * w;
        const flow = step >= 1 ? lerp(s0.flow, s1.flow, 0.5) : 0.94;
        const constriction = step >= 1 ? (1 - flow) : 0;

        // Pipe body
        const pipeTop = pipeY - pipeH / 2 * (1 - constriction * 0.5);
        const pipeBot = pipeY + pipeH / 2 * (1 - constriction * 0.5);
        const midX = (x0 + x1) / 2;

        ctx.beginPath();
        ctx.moveTo(x0 + 20, pipeY - pipeH / 2);
        ctx.quadraticCurveTo(midX, pipeTop, x1 - 20, pipeY - pipeH / 2);
        ctx.lineTo(x1 - 20, pipeY + pipeH / 2);
        ctx.quadraticCurveTo(midX, pipeBot, x0 + 20, pipeY + pipeH / 2);
        ctx.closePath();

        const pipeColor = flow > 0.9 ? C.blue : flow > 0.7 ? C.amber : C.red;
        const pg = ctx.createLinearGradient(x0, pipeY - pipeH, x0, pipeY + pipeH);
        pg.addColorStop(0, rgb(pipeColor, 0.1));
        pg.addColorStop(0.5, rgb(pipeColor, 0.2));
        pg.addColorStop(1, rgb(pipeColor, 0.1));
        ctx.fillStyle = pg;
        ctx.fill();

        ctx.strokeStyle = rgb(pipeColor, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Constriction highlight (step 1+)
        if (step >= 1 && constriction > 0.15) {
          const pulse = dampedPulse(T, 0.04, 0.0005) * 3;
          ctx.beginPath();
          ctx.arc(midX, pipeY, 6 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = rgb(C.red, 0.08);
          ctx.fill();
        }
      }

      // Stage nodes
      stages.forEach((s, i) => {
        const sx = s.x * w;
        const flow = step >= 1 ? s.flow : 0.94;
        const nodeColor = flow > 0.9 ? C.blue : flow > 0.7 ? C.amber : C.red;
        if (flow < 0.7) drawGlow(ctx, sx, pipeY, 35, C.red, 0.12);
        const pulse = dampedPulse(T, 0.03, 0.0005) * 0.08 + 1;
        const r = 16 * pulse;
        const nodeId = `stage-${i}`;
        const hp = hoverMap.current.get(nodeId) || 0;

        // Hover glow
        if (hp > 0) drawGlow(ctx, sx, pipeY, 16 * hp, nodeColor, 0.2 * hp);

        // Glow
        const g = ctx.createRadialGradient(sx, pipeY, 0, sx, pipeY, r * 2.5);
        g.addColorStop(0, rgb(nodeColor, 0.12 + 0.08 * hp));
        g.addColorStop(1, rgb(nodeColor, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, pipeY, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node
        const ng = ctx.createRadialGradient(sx, pipeY - r * 0.2, 0, sx, pipeY, r);
        ng.addColorStop(0, rgb(nodeColor, 0.85 + 0.1 * hp));
        ng.addColorStop(1, rgb(nodeColor, 0.5 + 0.1 * hp));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(sx, pipeY, r, 0, Math.PI * 2);
        ctx.fill();

        // Flow rate label
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText(step >= 1 ? `${Math.round(flow * 100)}%` : '94%', sx, pipeY + 1);

        // Stage name
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText(s.label, sx, pipeY - r - 10);

        registerHitCircle(hitZonesRef.current, nodeId, sx, pipeY, r + 4, {
          label: s.label, value: `Flow: ${Math.round(flow * 100)}%`, sublabel: flow < 0.7 ? 'Critical constriction' : flow < 0.9 ? 'Under pressure' : 'Normal flow', color: nodeColor,
        });
      });

      // Flow particles
      if (Math.random() < 0.3) {
        particles.current.push({
          x: stages[0].x * w,
          speed: 0.8 + Math.random() * 1.2,
          yOff: (Math.random() - 0.5) * pipeH * 0.6,
          sz: 1 + Math.random() * 1.5,
        });
      }

      particles.current = particles.current.filter(p => {
        p.x += p.speed;
        if (p.x > w) return false;

        // Slow down at constrictions
        if (step >= 1) {
          for (let i = 0; i < stages.length; i++) {
            const sx = stages[i].x * w;
            if (Math.abs(p.x - sx) < 30 && stages[i].flow < 0.8) {
              p.speed *= 0.97;
            }
          }
        }

        const al = 0.4;
        ctx.beginPath();
        ctx.arc(p.x, pipeY + p.yOff, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.cyan, al);
        ctx.fill();
        return true;
      });
      if (particles.current.length > 150) particles.current = particles.current.slice(-150);

      // Step 2: Backpressure indicators
      if (step >= 2) {
        const bpX = stages[0].x * w;
        const bpLabel = '+22 min hold time';
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.amber, 0.7);
        ctx.fillText('↑ Backpressure', bpX, pipeY + pipeH + 20);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText(bpLabel, bpX, pipeY + pipeH + 33);

        // Arrow indicating backup
        ctx.beginPath();
        ctx.moveTo(bpX + 25, pipeY + pipeH / 2 + 4);
        ctx.lineTo(bpX - 15, pipeY + pipeH / 2 + 4);
        ctx.strokeStyle = rgb(C.amber, 0.3);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Step 3: System-wide impact labels
      if (step >= 3) {
        const impacts = [
          { x: 0.08, label: 'Temp loss', sub: '−8°C', color: C.amber },
          { x: 0.68, label: 'Idle time', sub: '+18 min', color: C.red },
          { x: 0.88, label: 'Overflow absorb', sub: 'Line 4', color: C.cyan },
        ];
        impacts.forEach(imp => {
          const ix = imp.x * w;
          const iy = pipeY + pipeH + 50;
          ctx.font = "9px 'DM Sans',sans-serif";
          ctx.textAlign = 'center';
          ctx.fillStyle = rgb(imp.color, 0.7);
          ctx.fillText(imp.label, ix, iy);
          ctx.font = "bold 9px 'JetBrains Mono',monospace";
          ctx.fillText(imp.sub, ix, iy + 14);

          // Connection line
          ctx.beginPath();
          ctx.moveTo(ix, pipeY + pipeH / 2 + 6);
          ctx.lineTo(ix, iy - 10);
          ctx.strokeStyle = rgb(imp.color, 0.15);
          ctx.lineWidth = 0.7;
          ctx.stroke();
        });
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); particles.current = []; };
  }, [w, h, step, stages]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
