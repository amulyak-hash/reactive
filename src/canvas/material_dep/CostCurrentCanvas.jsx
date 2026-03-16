import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function CostCurrentCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const particles = useRef([]);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const stages = useMemo(() => [
    { label: 'Iron Ore', cost: '₹8,400/t', x: 0.08, color: C.t3 },
    { label: 'Coke', cost: '₹12,200/t', x: 0.22, color: C.amber },
    { label: 'BF-3', cost: '₹31,400/t', x: 0.42, color: C.orange, valueAdd: '₹7,700' },
    { label: 'Bottleneck', cost: '+₹2,160/t', x: 0.62, color: C.red, spike: true },
    { label: 'Total Impact', cost: '₹3.55 Cr', x: 0.82, color: C.red },
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

    const flowY = h * 0.42;

    const draw = () => {
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 25);

      const visibleStages = Math.min(step + 2, stages.length);

      // Flow pipe between stages
      for (let i = 0; i < visibleStages - 1; i++) {
        const s0 = stages[i], s1 = stages[i + 1];
        const x0 = s0.x * w + 18, x1 = s1.x * w - 18;
        const isSpike = s1.spike && step >= 2;
        const pipeH = isSpike ? 8 : 14;

        ctx.beginPath();
        ctx.moveTo(x0, flowY - pipeH / 2);
        ctx.lineTo(x1, flowY - pipeH / 2);
        ctx.lineTo(x1, flowY + pipeH / 2);
        ctx.lineTo(x0, flowY + pipeH / 2);
        ctx.closePath();
        ctx.fillStyle = rgb(s1.color, 0.08);
        ctx.fill();
        ctx.strokeStyle = rgb(s1.color, 0.15);
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // Cost flow particles
        if (Math.random() < 0.15) {
          particles.current.push({
            x: x0, targetX: x1,
            speed: 0.8 + Math.random(),
            yOff: (Math.random() - 0.5) * pipeH * 0.5,
            color: s1.color,
          });
        }
      }

      // Particles
      particles.current = particles.current.filter(p => {
        p.x += p.speed;
        if (p.x > p.targetX) return false;
        ctx.beginPath();
        ctx.arc(p.x, flowY + p.yOff, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = rgb(p.color, 0.4);
        ctx.fill();
        return true;
      });
      if (particles.current.length > 80) particles.current = particles.current.slice(-80);

      // Stage nodes
      for (let i = 0; i < visibleStages; i++) {
        const s = stages[i];
        const sx = s.x * w;
        const pulse = dampedPulse(T, 0.03, 0.0005) * 0.08 + 1;
        const r = 16 * pulse;
        const isSpike = s.spike && step >= 2;
        const nodeId = `stage-${i}`;
        const hp = hoverMap.current.get(nodeId) || 0;

        // Spike glow
        if (isSpike) {
          drawGlow(ctx, sx, flowY, 35, C.red, 0.15);
          const spikeR = r + (T * 0.3 % 20);
          const spikeA = Math.max(0, 1 - spikeR / (r + 20)) * 0.2;
          ctx.beginPath();
          ctx.arc(sx, flowY, spikeR, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(C.red, spikeA);
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Hover glow
        if (hp > 0) drawGlow(ctx, sx, flowY, 16 * hp, s.color, 0.2 * hp);

        // Glow
        const g = ctx.createRadialGradient(sx, flowY, 0, sx, flowY, r * 2.5);
        g.addColorStop(0, rgb(s.color, 0.1 + 0.08 * hp));
        g.addColorStop(1, rgb(s.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, flowY, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node
        const ng = ctx.createRadialGradient(sx, flowY - r * 0.2, 0, sx, flowY, r);
        ng.addColorStop(0, rgb(s.color, 0.85 + 0.1 * hp));
        ng.addColorStop(1, rgb(s.color, 0.45 + 0.1 * hp));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(sx, flowY, r, 0, Math.PI * 2);
        ctx.fill();

        // Cost label inside
        ctx.font = "bold 7px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(s.cost, sx, flowY);

        // Stage name
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgb(s.color, 0.6);
        ctx.fillText(s.label, sx, flowY + r + 6);

        // Value add annotation (step 1+)
        if (step >= 1 && s.valueAdd) {
          ctx.font = "8px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(C.green, 0.6);
          ctx.fillText(`+${s.valueAdd}`, sx, flowY - r - 12);
          ctx.font = "7px 'DM Sans',sans-serif";
          ctx.fillStyle = rgb(C.t3, 0.4);
          ctx.fillText('value added', sx, flowY - r - 2);
        }

        registerHitCircle(hitZonesRef.current, nodeId, sx, flowY, r + 4, {
          label: s.label, value: s.cost, sublabel: s.valueAdd ? `Value add: ${s.valueAdd}` : (s.spike ? 'Bottleneck stage' : 'Cost stage'), color: s.color,
        });
      }

      // Step 3: Total impact summary
      if (step >= 3) {
        const sy = h * 0.78;
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('Direct: ₹2,160/t premium · Indirect: ₹4,800/t lost throughput', w * 0.5, sy);
        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.red, 0.7);
        ctx.fillText('51 tonnes × ₹6,960/t = ₹3.55 Cr total impact', w * 0.5, sy + 18);
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
