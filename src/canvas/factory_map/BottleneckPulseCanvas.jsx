import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function BottleneckPulseCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const particles = useRef([]);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const zones = useMemo(() => [
    { label: 'Ore Yard', throughput: 1.12, x: 0.1, color: C.amber },
    { label: 'BF-3', throughput: 0.78, x: 0.3, color: C.red },
    { label: 'SMS', throughput: 0.64, x: 0.5, color: C.orange },
    { label: 'CCM-3', throughput: 0.58, x: 0.7, color: C.amber },
    { label: 'HSM-1', throughput: 0.72, x: 0.9, color: C.blue },
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

    const arteryY = h * 0.42;
    const arteryMaxH = 40;

    const draw = () => {
      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 25);

      // Tick hover animations
      tickHoverProgress(hoverMap.current, hoveredRef.current);

      // Reset hit zones
      hitZonesRef.current = [];

      // Draw artery segments
      for (let i = 0; i < zones.length - 1; i++) {
        const z0 = zones[i], z1 = zones[i + 1];
        const x0 = z0.x * w + 20, x1 = z1.x * w - 20;
        const flow0 = step >= 1 ? z0.throughput : 0.9;
        const flow1 = step >= 1 ? z1.throughput : 0.9;

        // Artery wall (pulsing with dampedPulse)
        const pulseMod = dampedPulse(T, 0.03 + i * 0.003, 0.0003) * 2;
        const segments = 30;

        for (let s = 0; s < segments; s++) {
          const prog = s / segments;
          const prog2 = (s + 1) / segments;
          const sx0 = x0 + (x1 - x0) * prog;
          const sx1 = x0 + (x1 - x0) * prog2;
          const flow = flow0 + (flow1 - flow0) * prog;
          const artH = arteryMaxH * flow + pulseMod;

          const color = flow > 0.9 ? C.blue : flow > 0.7 ? C.amber : C.red;
          ctx.beginPath();
          ctx.moveTo(sx0, arteryY - artH / 2);
          ctx.lineTo(sx1, arteryY - artH / 2);
          ctx.lineTo(sx1, arteryY + artH / 2);
          ctx.lineTo(sx0, arteryY + artH / 2);
          ctx.closePath();
          ctx.fillStyle = rgb(color, 0.08 + flow * 0.1);
          ctx.fill();
        }

        // Artery border
        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const prog = s / segments;
          const sx = x0 + (x1 - x0) * prog;
          const flow = flow0 + (flow1 - flow0) * prog;
          const artH = arteryMaxH * flow + pulseMod;
          s === 0 ? ctx.moveTo(sx, arteryY - artH / 2) : ctx.lineTo(sx, arteryY - artH / 2);
        }
        const color = flow1 > 0.7 ? C.blue : C.red;
        ctx.strokeStyle = rgb(color, 0.2);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const prog = s / segments;
          const sx = x0 + (x1 - x0) * prog;
          const flow = flow0 + (flow1 - flow0) * prog;
          const artH = arteryMaxH * flow + pulseMod;
          s === 0 ? ctx.moveTo(sx, arteryY + artH / 2) : ctx.lineTo(sx, arteryY + artH / 2);
        }
        ctx.stroke();
      }

      // Zone nodes
      zones.forEach((z, i) => {
        const zx = z.x * w;
        const flow = step >= 1 ? z.throughput : 0.9;
        const _pulse = dampedPulse(T, 0.035 + i * 0.003, 0.0003) * (flow < 0.8 ? 4 : 1) + 1;
        const r = 16;
        const zColor = flow > 0.9 ? C.blue : flow > 0.7 ? C.amber : C.red;
        const hp = hoverMap.current.get(`zone-${i}`) || 0;

        // Register hit zone for the node
        registerHitCircle(hitZonesRef.current, `zone-${i}`, zx, arteryY, r + 8, {
          label: z.label,
          value: `${Math.round(flow * 100)}% throughput`,
          sublabel: flow < 0.7 ? 'Bottleneck — constricted' : flow < 0.9 ? 'Below nominal' : 'Healthy flow',
          color: zColor,
        });

        // Glow (enhanced on hover)
        drawGlow(ctx, zx, arteryY, r * 2.5, zColor, 0.12 + hp * 0.15);

        // Node
        const ng = ctx.createRadialGradient(zx, arteryY - 3, 0, zx, arteryY, r + hp * 3);
        ng.addColorStop(0, rgb(zColor, 0.85 + hp * 0.15));
        ng.addColorStop(1, rgb(zColor, 0.45 + hp * 0.2));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(zx, arteryY, r + hp * 3, 0, Math.PI * 2);
        ctx.fill();

        // Throughput
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(`${Math.round(flow * 100)}%`, zx, arteryY);

        // Label
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgb(zColor, 0.6 + hp * 0.3);
        ctx.fillText(z.label, zx, arteryY - r - 14);
      });

      // Flow particles
      if (Math.random() < 0.25) {
        particles.current.push({
          x: zones[0].x * w,
          speed: 0.5 + Math.random() * 1.5,
          yOff: (Math.random() - 0.5) * 20,
          sz: 1 + Math.random() * 1.5,
        });
      }
      particles.current = particles.current.filter(p => {
        let localSpeed = p.speed;
        if (step >= 1) {
          zones.forEach(z => {
            if (Math.abs(p.x - z.x * w) < 30 && z.throughput < 0.8) {
              localSpeed *= 0.5 * z.throughput;
            }
          });
        }
        p.x += localSpeed;
        if (p.x > w) return false;

        ctx.beginPath();
        ctx.arc(p.x, arteryY + p.yOff, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.cyan, 0.4);
        ctx.fill();
        return true;
      });
      if (particles.current.length > 120) particles.current = particles.current.slice(-120);

      // Step 2: Pressure differential
      if (step >= 2) {
        const bfX = zones[1].x * w;
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('↓ constriction', bfX, arteryY + 35);
        ctx.fillText('Upstream pools, downstream starves', bfX, arteryY + 48);
      }

      // Step 3: Cardiovascular diagnosis
      if (step >= 3) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('BF-3 is the constricted artery — clear the constriction', w * 0.5, h * 0.85);
      }

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); particles.current = []; };
  }, [w, h, step, zones]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
