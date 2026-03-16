import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';
import { PLANTS } from '../../data/tataSteel';

export default function BalanceSheetCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const scales = useMemo(() => {
    const resources = [92, 93, 84, 86]; // resource utilization
    return PLANTS.map((p, i) => ({
      ...p,
      resource: resources[i],
      cx: w * (0.15 + i * 0.22),
      cy: h * 0.45,
      balanced: Math.abs(p.actual - resources[i]) < 5,
      tilt: (p.actual - resources[i]) / 100, // positive = output > resources (efficient)
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

      const visibleScales = step === 0 ? scales.length : scales.length;

      for (let i = 0; i < visibleScales; i++) {
        const s = scales[i];
        const isHighlight = (step === 1 && i === 2) || (step >= 2 && i === 1);
        const armLen = 35;
        const tilt = step >= 1 ? s.tilt : 0;
        const tiltAngle = tilt * 0.6;
        const sway = dampedPulse(T, 0.02, 0.0005) * 0.02;
        const angle = tiltAngle + sway;
        const scaleId = `scale-${i}`;
        const hp = hoverMap.current.get(scaleId) || 0;

        // Fulcrum (triangle)
        ctx.beginPath();
        ctx.moveTo(s.cx, s.cy + 8);
        ctx.lineTo(s.cx - 6, s.cy + 18);
        ctx.lineTo(s.cx + 6, s.cy + 18);
        ctx.closePath();
        ctx.fillStyle = rgb(C.bd, 0.4);
        ctx.fill();

        // Beam
        const leftX = s.cx - Math.cos(angle) * armLen;
        const leftY = s.cy - Math.sin(angle) * armLen;
        const rightX = s.cx + Math.cos(angle) * armLen;
        const rightY = s.cy + Math.sin(angle) * armLen;

        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.strokeStyle = rgb(C.t3, 0.4 + 0.2 * hp);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Left pan (output)
        const panW = 24;
        ctx.beginPath();
        ctx.moveTo(leftX - panW / 2, leftY + 4);
        ctx.quadraticCurveTo(leftX, leftY + 14, leftX + panW / 2, leftY + 4);
        ctx.strokeStyle = rgb(C.green, 0.5);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Output fill
        const outFill = s.actual / 100;
        ctx.beginPath();
        ctx.arc(leftX, leftY + 8, 6 * outFill, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.green, 0.4);
        ctx.fill();

        // Right pan (resources)
        ctx.beginPath();
        ctx.moveTo(rightX - panW / 2, rightY + 4);
        ctx.quadraticCurveTo(rightX, rightY + 14, rightX + panW / 2, rightY + 4);
        ctx.strokeStyle = rgb(C.amber, 0.5);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Resource fill
        const resFill = s.resource / 100;
        ctx.beginPath();
        ctx.arc(rightX, rightY + 8, 6 * resFill, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.amber, 0.4);
        ctx.fill();

        // Highlight glow
        if (isHighlight) drawGlow(ctx, s.cx, s.cy, 50, i === 1 ? C.red : C.green, 0.1);

        // Hover glow
        if (hp > 0) drawGlow(ctx, s.cx, s.cy, 16 * hp, i === 1 ? C.red : C.blue, 0.2 * hp);

        // Highlight ring
        if (isHighlight) {
          ctx.beginPath();
          ctx.arc(s.cx, s.cy, 45, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(i === 1 ? C.red : C.green, 0.15 + dampedPulse(T, 0.03, 0.0005) * 0.05);
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Plant name
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = i === 1 ? rgb(C.red, 0.8) : rgb(C.t2, 0.6);
        ctx.fillText(s.name.split('·')[0].trim(), s.cx, s.cy - 45);

        // Values
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.green, 0.6);
        ctx.fillText(`${s.actual}%`, leftX, leftY + 24);
        ctx.fillStyle = rgb(C.amber, 0.6);
        ctx.fillText(`${s.resource}%`, rightX, rightY + 24);

        registerHitCircle(hitZonesRef.current, scaleId, s.cx, s.cy, 45, {
          label: s.name.split('·')[0].trim(), value: `Output: ${s.actual}% / Resources: ${s.resource}%`, sublabel: s.balanced ? 'Balanced' : `Tilt: ${s.tilt > 0 ? '+' : ''}${Math.round(s.tilt * 100)}%`, color: i === 1 ? C.red : C.blue,
        });
      }

      // Legend
      ctx.font = "8px 'DM Sans',sans-serif";
      ctx.textAlign = 'left';
      ctx.fillStyle = rgb(C.green, 0.5);
      ctx.fillText('● Output', w * 0.05, h * 0.12);
      ctx.fillStyle = rgb(C.amber, 0.5);
      ctx.fillText('● Resources', w * 0.05, h * 0.16);

      // Step annotations
      if (step >= 1) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.green, 0.6);
        ctx.fillText('Plant C: best efficiency — 86% output from 84% resources', w * 0.5, h * 0.72);
      }
      if (step >= 2) {
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('Plant B: imbalanced — 78% output consuming 93% resources', w * 0.5, h * 0.78);
      }
      if (step >= 3) {
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t1, 0.7);
        ctx.fillText('15% efficiency gap — conversion problem, not capacity', w * 0.5, h * 0.86);
        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText('Same resources at Plant C ratio → 91% output', w * 0.5, h * 0.91);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, scales]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
