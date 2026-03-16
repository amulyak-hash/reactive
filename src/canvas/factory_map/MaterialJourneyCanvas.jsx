import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerpC } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function MaterialJourneyCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const stages = useMemo(() => [
    { label: 'Iron Ore', code: 'Gate', info: '62% Fe · Si 0.34%', x: 0.08, color: C.t3 },
    { label: 'Blast Furnace', code: 'BF-3', info: '1,502°C · Hot metal', x: 0.28, color: C.orange },
    { label: 'Steel Melting', code: 'BOF-2', info: '1,665°C · Liquid steel', x: 0.48, color: C.red },
    { label: 'Casting', code: 'CCM-3', info: '1.2 m/min · Slab', x: 0.68, color: C.cyan },
    { label: 'Quality Lab', code: 'QC', info: '94.2% · Coil', x: 0.88, color: C.green },
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

    const draw = () => {
      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 30);

      // Tick hover animations
      tickHoverProgress(hoverMap.current, hoveredRef.current);

      const pathY = h * 0.42;
      const activeStage = Math.min(step, stages.length - 1);

      // Reset hit zones
      hitZonesRef.current = [];

      // Journey path
      for (let i = 0; i < stages.length - 1; i++) {
        const s0 = stages[i], s1 = stages[i + 1];
        const x0 = s0.x * w, x1 = s1.x * w;
        const active = i <= activeStage;

        ctx.beginPath();
        ctx.moveTo(x0 + 20, pathY);
        ctx.lineTo(x1 - 20, pathY);
        ctx.strokeStyle = rgb(active ? s1.color : C.bd, active ? 0.2 : 0.08);
        ctx.lineWidth = active ? 3 : 1;
        ctx.stroke();

        // Arrow
        if (active) {
          ctx.beginPath();
          ctx.moveTo(x1 - 28, pathY - 4);
          ctx.lineTo(x1 - 22, pathY);
          ctx.lineTo(x1 - 28, pathY + 4);
          ctx.strokeStyle = rgb(s1.color, 0.3);
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Stage nodes
      stages.forEach((s, i) => {
        const sx = s.x * w;
        const active = i <= activeStage;
        const isCurrent = i === activeStage;
        const pulse = isCurrent ? dampedPulse(T, 0.04, 0.0005) * 0.12 + 1 : 1;
        const hp = hoverMap.current.get(`stage-${i}`) || 0;
        const r = 18 * pulse + hp * 3;

        // Register hit zone for stage node
        registerHitCircle(hitZonesRef.current, `stage-${i}`, sx, pathY, 22, {
          label: s.label,
          value: s.code,
          sublabel: s.info,
          color: s.color,
        });

        // Glow (enhanced on hover and active)
        if (active || hp > 0) {
          drawGlow(ctx, sx, pathY, r * 2.5, s.color, (isCurrent ? 0.15 : 0.06) + hp * 0.12);
        }

        // Node
        const ng = ctx.createRadialGradient(sx, pathY - r * 0.2, 0, sx, pathY, r);
        ng.addColorStop(0, rgb(s.color, (active ? 0.85 : 0.2) + hp * 0.15));
        ng.addColorStop(1, rgb(s.color, (active ? 0.45 : 0.08) + hp * 0.15));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(sx, pathY, r, 0, Math.PI * 2);
        ctx.fill();

        // Code
        ctx.font = "bold 8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = active ? C.t1 : rgb(C.t4, 0.5);
        ctx.fillText(s.code, sx, pathY);

        // Label
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textBaseline = 'top';
        ctx.fillStyle = active ? rgb(s.color, 0.7 + hp * 0.3) : rgb(C.t4, 0.3);
        ctx.fillText(s.label, sx, pathY + r + 8);

        // Info (active stages or hovered)
        if (active || hp > 0.3) {
          ctx.font = "8px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(C.t3, 0.5 + hp * 0.3);
          ctx.fillText(s.info, sx, pathY - r - 12);
        }
      });

      // Traveling batch dot
      if (activeStage > 0) {
        const batchProg = (T * 0.003) % 1;
        const fromStage = Math.min(activeStage - 1, stages.length - 2);
        const toStage = fromStage + 1;
        const bx0 = stages[fromStage].x * w;
        const bx1 = stages[toStage].x * w;
        const batchX = bx0 + (bx1 - bx0) * batchProg;

        const batchColor = lerpC(stages[fromStage].color, stages[toStage].color, batchProg);

        // Batch glow
        drawGlow(ctx, batchX, pathY, 12, batchColor, 0.2);
        ctx.beginPath();
        ctx.arc(batchX, pathY, 8, 0, Math.PI * 2);
        ctx.fillStyle = rgb(batchColor, 0.15);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(batchX, pathY, 4, 0, Math.PI * 2);
        ctx.fillStyle = rgb(batchColor, 0.7);
        ctx.fill();
      }

      // Probability annotation (step 2+)
      if (step >= 2) {
        const sx = stages[3].x * w;
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.amber, 0.6);
        ctx.fillText('Automotive grade: 74% probability', sx, pathY + 48);
      }

      // Step 3: Complete biography summary
      if (step >= 3) {
        const sy = h * 0.82;
        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText('Batch 4471: ore to coil in 18 hours', w * 0.5, sy);
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t2, 0.5);
        ctx.fillText('5 transformations · 847 sensor readings · 23 decision points', w * 0.5, sy + 16);
      }

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, stages]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
