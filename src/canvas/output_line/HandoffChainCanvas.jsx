import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';
import { PLANT_B_LINES } from '../../data/tataSteel';

export default function HandoffChainCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const particles = useRef([]);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const chain = useMemo(() => {
    return PLANT_B_LINES.map((line, i) => ({
      ...line,
      x: w * (0.1 + i * 0.18),
      y: h * 0.42,
      isLine3: i === 2,
      color: i === 2 ? C.red : C.blue,
      flow: line.output / 100,
    }));
  }, [w, h]);

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

    const draw = () => {
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 25);

      // Draw chain links
      for (let i = 0; i < chain.length - 1; i++) {
        const c0 = chain[i], c1 = chain[i + 1];
        const healthy = c0.flow > 0.7 && c1.flow > 0.7;
        const broken = c0.isLine3 || c1.isLine3;
        const linkColor = broken ? C.red : healthy ? C.blue : C.amber;
        const visible = step >= 0;
        if (!visible) continue;

        // Link pipe
        const pipeH = healthy ? 14 : broken ? 6 : 10;
        const wave = dampedPulse(T, 0.03, 0.0005) * 1;

        ctx.beginPath();
        ctx.moveTo(c0.x + 20, c0.y - pipeH / 2 + wave);
        ctx.lineTo(c1.x - 20, c1.y - pipeH / 2 + wave);
        ctx.lineTo(c1.x - 20, c1.y + pipeH / 2 + wave);
        ctx.lineTo(c0.x + 20, c0.y + pipeH / 2 + wave);
        ctx.closePath();
        ctx.fillStyle = rgb(linkColor, 0.08);
        ctx.fill();
        ctx.strokeStyle = rgb(linkColor, 0.2);
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // Step 1+: Healthy handoff label
        if (step >= 1 && i === 0 && healthy) {
          ctx.font = "8px 'DM Sans',sans-serif";
          ctx.textAlign = 'center';
          ctx.fillStyle = rgb(C.green, 0.5);
          ctx.fillText('clean handoff', (c0.x + c1.x) / 2, c0.y - 20);
        }

        // Step 2+: Broken link highlight
        if (step >= 2 && broken) {
          const midX = (c0.x + c1.x) / 2;
          // Break marker
          ctx.beginPath();
          ctx.moveTo(midX - 5, c0.y - 10);
          ctx.lineTo(midX + 2, c0.y + 8);
          ctx.moveTo(midX + 5, c0.y - 8);
          ctx.lineTo(midX - 2, c0.y + 10);
          ctx.strokeStyle = rgb(C.red, 0.3 + dampedPulse(T, 0.04, 0.0005) * 0.1);
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = "8px 'DM Sans',sans-serif";
          ctx.textAlign = 'center';
          ctx.fillStyle = rgb(C.red, 0.6);
          ctx.fillText('broken handoff', midX, c0.y + 22);
        }

        // Flow particles
        if (Math.random() < (healthy ? 0.2 : 0.08)) {
          particles.current.push({
            edge: i,
            prog: 0,
            speed: (healthy ? 0.008 : 0.003) + Math.random() * 0.005,
            yOff: (Math.random() - 0.5) * pipeH * 0.5,
            sz: 1 + Math.random(),
            color: linkColor,
          });
        }
      }

      // Draw particles
      particles.current = particles.current.filter(p => {
        p.prog += p.speed;
        if (p.prog > 1) return false;
        const c0 = chain[p.edge], c1 = chain[p.edge + 1];
        const px = c0.x + 20 + (c1.x - 20 - c0.x - 20) * p.prog;
        const py = c0.y + p.yOff + Math.sin(T * 0.04 + p.prog * 5) * 1;

        ctx.beginPath();
        ctx.arc(px, py, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = rgb(p.color, 0.5);
        ctx.fill();
        return true;
      });
      if (particles.current.length > 100) particles.current = particles.current.slice(-100);

      // Draw chain nodes
      chain.forEach((c, i) => {
        const pulse = dampedPulse(T, 0.03, 0.0005) * 0.08 + 1;
        if (c.isLine3) drawGlow(ctx, c.x, c.y, 35, C.red, 0.12);
        const r = 18 * pulse;
        const nodeId = `chain-${i}`;
        const hp = hoverMap.current.get(nodeId) || 0;

        // Hover glow
        if (hp > 0) drawGlow(ctx, c.x, c.y, 16 * hp, c.color, 0.2 * hp);

        // Glow
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 2.5);
        g.addColorStop(0, rgb(c.color, 0.1 + 0.08 * hp));
        g.addColorStop(1, rgb(c.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node
        const ng = ctx.createRadialGradient(c.x, c.y - r * 0.2, 0, c.x, c.y, r);
        ng.addColorStop(0, rgb(c.color, 0.85 + 0.1 * hp));
        ng.addColorStop(1, rgb(c.color, 0.45 + 0.1 * hp));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Output inside
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(`${c.output}%`, c.x, c.y);

        // Name below
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgb(c.color, 0.6);
        ctx.fillText(c.name, c.x, c.y + r + 6);

        registerHitCircle(hitZonesRef.current, nodeId, c.x, c.y, r + 4, {
          label: c.name, value: `${c.output}% output`, sublabel: c.isLine3 ? 'Broken handoff' : `Flow: ${Math.round(c.flow * 100)}%`, color: c.color,
        });
      });

      // Step 3: Tension summary
      if (step >= 3) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.t1, 0.7);
        ctx.fillText('Two chain segments under tension — fix Line 3, both segments relax', w * 0.5, h * 0.85);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); particles.current = []; };
  }, [w, h, step, chain]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
