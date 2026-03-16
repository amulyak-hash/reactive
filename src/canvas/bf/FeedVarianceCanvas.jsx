import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitCircle, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function FeedVarianceCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const params = useMemo(() => [
    { name: 'Fe content', current: 62, spec: 63, unit: '%', color: C.blue, variance: -1 },
    { name: 'Si content', current: 0.34, spec: 0.22, unit: '%', color: C.red, variance: 0.12, outlier: true },
    { name: 'Moisture', current: 4.1, spec: 4.0, unit: '%', color: C.green, variance: 0.1 },
    { name: 'Particle size', current: 12.5, spec: 12.0, unit: 'mm', color: C.cyan, variance: 0.5 },
    { name: 'Basicity', current: 1.18, spec: 1.20, unit: '', color: C.amber, variance: -0.02 },
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
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 25);

      const barX = w * 0.25, barW = w * 0.45;
      const startY = h * 0.1, rowH = h * 0.14;

      params.forEach((p, i) => {
        const y = startY + i * rowH;
        const visible = i <= step || step >= 1;
        if (!visible) return;

        const dotId = `param-${i}`;

        // Spec range bar (background)
        ctx.fillStyle = rgb(C.bd, 0.15);
        ctx.beginPath();
        ctx.roundRect(barX, y + 12, barW, 10, 4);
        ctx.fill();

        // Spec center marker
        const specX = barX + barW * 0.5;
        ctx.beginPath();
        ctx.moveTo(specX, y + 10);
        ctx.lineTo(specX, y + 24);
        ctx.strokeStyle = rgb(C.t3, 0.3);
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Current value position (relative to spec)
        const maxDeviation = p.outlier ? 0.12 : 2;
        const normDeviation = Math.max(-1, Math.min(1, p.variance / maxDeviation));
        const currentX = specX + normDeviation * (barW * 0.4);
        const pulse = p.outlier && step >= 1 ? dampedPulse(T, 0.04, 0.0005) * 3 : 0;

        // Current value dot
        const hp = hoverMap.current.get(dotId) || 0;
        const dotR = (p.outlier ? 6 : 4) + hp * 3;
        const g = ctx.createRadialGradient(currentX + pulse, y + 17, 0, currentX + pulse, y + 17, dotR * 2.5);
        g.addColorStop(0, rgb(p.color, (p.outlier ? 0.15 : 0.05) + hp * 0.1));
        g.addColorStop(1, rgb(p.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(currentX + pulse, y + 17, dotR * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(currentX + pulse, y + 17, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgb(p.color, 0.8 + hp * 0.2);
        ctx.fill();

        // Hover glow
        if (hp > 0) {
          drawGlow(ctx, currentX + pulse, y + 17, dotR * 3 * hp, p.color, 0.2 * hp);
        }

        // Glow on outlier dot
        if (p.outlier && step >= 1) {
          drawGlow(ctx, currentX + pulse, y + 17, dotR * 3, C.red, 0.12);
        }

        // Register hit zone for the dot
        registerHitCircle(hitZonesRef.current, dotId, currentX + pulse, y + 17, dotR * 2.5, {
          label: p.name,
          value: `${p.current}${p.unit} (spec: ${p.spec}${p.unit})`,
          sublabel: `Variance: ${p.variance > 0 ? '+' : ''}${p.variance}${p.unit}`,
          color: p.color,
        });

        // Parameter name
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = p.outlier ? rgb(C.red, 0.8) : rgb(C.t2, 0.6);
        ctx.fillText(p.name, barX - 8, y + 17);

        // Value
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(p.color, 0.7);
        ctx.fillText(`${p.current}${p.unit}`, barX + barW + 8, y + 14);
        ctx.fillStyle = rgb(C.t4, 0.5);
        ctx.fillText(`spec: ${p.spec}${p.unit}`, barX + barW + 8, y + 24);

        // Outlier highlight (step 1+)
        if (p.outlier && step >= 1) {
          ctx.strokeStyle = rgb(C.red, 0.2 + dampedPulse(T, 0.03, 0.0005) * 0.05);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(barX - 2, y + 6, barW + 4, 22, 6);
          ctx.stroke();

          ctx.font = "7px 'JetBrains Mono',monospace";
          ctx.textAlign = 'center';
          ctx.fillStyle = rgb(C.red, 0.5);
          ctx.fillText('96th percentile', currentX, y + 34);
        }
      });

      // Step 2: Cascade arrow
      if (step >= 2) {
        const siY = startY + 1 * rowH + 17;
        const cascadeX = w * 0.82;

        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('Si → slag chemistry', cascadeX, siY - 8);
        ctx.fillText('→ heat transfer ↓', cascadeX, siY + 6);
        ctx.fillText('→ superheat ↓', cascadeX, siY + 20);

        ctx.beginPath();
        ctx.moveTo(cascadeX - 5, siY - 10);
        ctx.lineTo(cascadeX - 5, siY + 28);
        ctx.strokeStyle = rgb(C.red, 0.15);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Step 3: Feed-forward prediction
      if (step >= 3) {
        const predY = h * 0.82;
        ctx.fillStyle = rgb(C.sf, 0.5);
        ctx.beginPath();
        ctx.roundRect(w * 0.15, predY - 5, w * 0.7, 40, 6);
        ctx.fill();

        ctx.font = "bold 9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText('Feed-forward prediction vs actual', w * 0.5, predY + 6);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('Superheat: predicted 22°C, actual 22°C · Hot metal Si: predicted 0.42%, actual 0.44%', w * 0.5, predY + 22);
      }

      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, params]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
