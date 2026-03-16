import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';
import { PLANT_B_LINES } from '../../data/tataSteel';

export default function CapacityGlacierCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const glaciers = useMemo(() => {
    const padL = w * 0.12, gap = 12;
    const colW = (w * 0.8 - gap * (PLANT_B_LINES.length - 1)) / PLANT_B_LINES.length;
    const maxH = h * 0.6;
    const baseY = h * 0.78;

    return PLANT_B_LINES.map((line, i) => ({
      ...line,
      x: padL + i * (colW + gap),
      w: colW,
      fullH: maxH,
      actualH: maxH * (line.output / 100),
      meltedH: maxH * (1 - line.output / 100),
      baseY,
      isLine3: i === 2,
      color: i === 2 ? C.red : C.blue,
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

    const draw = () => {
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 25);

      glaciers.forEach((gl, gi) => {
        const revealed = gi <= step || step >= 1;
        if (!revealed) return;

        const topY = gl.baseY - gl.fullH;
        const iceTopY = gl.baseY - gl.actualH;
        const colId = `glacier-${gi}`;
        const hp = hoverMap.current.get(colId) || 0;

        // Full capacity outline (ghost)
        ctx.beginPath();
        ctx.roundRect(gl.x, topY, gl.w, gl.fullH, [6, 6, 0, 0]);
        ctx.strokeStyle = rgb(C.bd, 0.15);
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Melted zone (exposed rock)
        if (step >= 2) {
          const rockGrad = ctx.createLinearGradient(0, topY, 0, iceTopY);
          rockGrad.addColorStop(0, rgb(C.bd, 0.05));
          rockGrad.addColorStop(1, rgb(gl.color, 0.06));
          ctx.fillStyle = rockGrad;
          ctx.beginPath();
          ctx.roundRect(gl.x, topY, gl.w, gl.meltedH, [6, 6, 0, 0]);
          ctx.fill();

          // Cross-hatching for exposed rock
          for (let y = topY + 6; y < iceTopY; y += 8) {
            ctx.beginPath();
            ctx.moveTo(gl.x + 3, y);
            ctx.lineTo(gl.x + gl.w - 3, y + 3);
            ctx.strokeStyle = rgb(C.bd, 0.06);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Hover glow
        if (hp > 0) drawGlow(ctx, gl.x + gl.w / 2, iceTopY, 20 * hp, gl.color, 0.15 * hp);

        // Ice column (actual output)
        const iceGrad = ctx.createLinearGradient(0, iceTopY, 0, gl.baseY);
        const iceColor = gl.isLine3 ? C.red : C.cyan;
        iceGrad.addColorStop(0, rgb(iceColor, 0.5 + 0.15 * hp));
        iceGrad.addColorStop(0.5, rgb(iceColor, 0.35 + 0.1 * hp));
        iceGrad.addColorStop(1, rgb(iceColor, 0.2 + 0.05 * hp));
        ctx.fillStyle = iceGrad;
        ctx.beginPath();
        ctx.roundRect(gl.x, iceTopY, gl.w, gl.actualH, [4, 4, 0, 0]);
        ctx.fill();

        // Ice shimmer
        const shimmerY = iceTopY + dampedPulse(T, 0.02, 0.0005) * 3;
        ctx.beginPath();
        ctx.moveTo(gl.x + 3, shimmerY + 5);
        ctx.lineTo(gl.x + gl.w * 0.6, shimmerY);
        ctx.strokeStyle = rgb(C.t1, 0.08);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Drip effect for melting (Line 3)
        if (gl.isLine3 && step >= 2) {
          drawGlow(ctx, gl.x + gl.w / 2, iceTopY, 30, C.red, 0.1);
          const dripX = gl.x + gl.w * 0.5 + dampedPulse(T, 0.03, 0.0005) * 5;
          const dripY = iceTopY - (T * 0.5 % 15);
          const dripA = Math.max(0, 1 - (iceTopY - dripY) / 15) * 0.4;
          ctx.beginPath();
          ctx.arc(dripX, dripY, 2, 0, Math.PI * 2);
          ctx.fillStyle = rgb(C.cyan, dripA);
          ctx.fill();
        }

        // Line name
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = gl.isLine3 ? rgb(C.red, 0.8) : rgb(C.t2, 0.6);
        ctx.fillText(gl.name, gl.x + gl.w / 2, gl.baseY + 14);

        // Output percentage
        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(gl.color, 0.7);
        ctx.fillText(`${gl.output}%`, gl.x + gl.w / 2, iceTopY - 8);

        // Step 2: Melted percentage
        if (step >= 2 && gl.meltedH > gl.fullH * 0.15) {
          ctx.font = "8px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(C.t3, 0.5);
          ctx.fillText(`${100 - gl.output}% melted`, gl.x + gl.w / 2, topY + gl.meltedH / 2);
        }

        registerHitRect(hitZonesRef.current, colId, gl.x, iceTopY, gl.w, gl.actualH, {
          label: gl.name, value: `${gl.output}% output`, sublabel: `${100 - gl.output}% capacity lost`, color: gl.color,
        });
      });

      // Step 3: Headroom analysis
      if (step >= 3) {
        const sy = h * 0.92;
        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText('68 tonnes/shift untapped capacity — 73% sits in Line 3', w * 0.5, sy);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, glaciers]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
