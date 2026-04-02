import { useRef, useEffect } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from '../../canvas/useCanvasInteraction';
import { tickHoverProgress, easeOutCubic } from '../../canvas/easing';
import { CC, rgb, drawGlow, setupCanvas, drawCrosshair } from '../../canvas/canvasUtils';
import type { QuotationTrendProps } from './types';

const W = 680;
const H = 280;

export function QuotationTrend({ trend, 'data-testid': testId }: QuotationTrendProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 72;

    const padL = 54;
    const padR = 28;
    const padT = 30;
    const padB = 54;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const maxCount = Math.max(...trend.map(p => p.count));
    const n = trend.length;
    const stepX = chartW / (n - 1);

    const pts = trend.map((p, i) => ({
      x: padL + i * stepX,
      y: padT + chartH - (p.count / maxCount) * chartH,
      point: p,
    }));

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      // Grid lines
      [0.25, 0.5, 0.75, 1.0].forEach(frac => {
        const y = padT + chartH - frac * chartH;
        ctx.strokeStyle = rgb(CC.bd, 0.18);
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + chartW, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = rgb(CC.t4, 0.6);
        ctx.textAlign = 'right';
        ctx.fillText(String(Math.round(maxCount * frac)), padL - 6, y + 3);
      });

      // Y-axis label (rotated)
      ctx.save();
      ctx.translate(12, padT + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillStyle = rgb(CC.t3, 0.5);
      ctx.textAlign = 'center';
      ctx.fillText('Submissions', 0, 0);
      ctx.restore();

      // X-axis label
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillStyle = rgb(CC.t3, 0.5);
      ctx.textAlign = 'center';
      ctx.fillText('Week', padL + chartW / 2, H - 6);

      // X-axis baseline
      ctx.strokeStyle = rgb(CC.bd, 0.3);
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(padL, padT + chartH);
      ctx.lineTo(padL + chartW, padT + chartH);
      ctx.stroke();

      // Determine how many points to draw based on progress
      const drawUpTo = progress * (n - 1);
      const drawN = Math.floor(drawUpTo) + 1;

      // Area fill (clipped to progress)
      if (drawN >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, padT + chartH);
        ctx.lineTo(pts[0].x, pts[0].y);
        for (let i = 1; i < drawN; i++) {
          const t = drawUpTo - Math.floor(drawUpTo);
          const px = i < drawN - 1 ? pts[i].x : pts[i - 1].x + (pts[i].x - pts[i - 1].x) * (i === Math.ceil(drawUpTo) ? t : 1);
          const py = i < drawN - 1 ? pts[i].y : pts[i - 1].y + (pts[i].y - pts[i - 1].y) * (i === Math.ceil(drawUpTo) ? t : 1);
          ctx.lineTo(px, py);
        }
        const lastPt = pts[Math.min(drawN - 1, n - 1)];
        ctx.lineTo(lastPt.x, padT + chartH);
        ctx.closePath();

        const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
        areaGrad.addColorStop(0, rgb(CC.cyan, 0.22));
        areaGrad.addColorStop(1, rgb(CC.cyan, 0.02));
        ctx.fillStyle = areaGrad;
        ctx.fill();
      }

      // Line stroke
      ctx.beginPath();
      for (let i = 0; i < drawN; i++) {
        const t = drawUpTo - Math.floor(drawUpTo);
        const isInterp = i === drawN - 1 && i > 0 && i === Math.ceil(drawUpTo);
        const px = i === 0 || (i < drawN - 1) ? pts[i].x : pts[i - 1].x + (pts[i].x - pts[i - 1].x) * (isInterp ? t : 1);
        const py = i === 0 || (i < drawN - 1) ? pts[i].y : pts[i - 1].y + (pts[i].y - pts[i - 1].y) * (isInterp ? t : 1);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = rgb(CC.cyan, 0.85);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Data points and labels
      pts.forEach((pt, i) => {
        if (i >= drawN) return;
        const id = `pt-${i}`;
        const hp = hoverMap.current.get(id) ?? 0;

        registerHitCircle(hitZonesRef.current, id, pt.x, pt.y, 10, {
          label: pt.point.week,
          value: `${pt.point.count} quotations submitted`,
          sublabel: `£${pt.point.value}M value`,
          color: CC.cyan,
        });

        // Hover crosshair
        if (hp > 0) {
          drawCrosshair(ctx, pt.x, padT, padT + chartH, rgb(CC.cyan, 0.15 * hp));
        }

        // Glow on peaks or hovered
        const isPeak = pt.point.count === maxCount;
        if (hp > 0 || isPeak) {
          drawGlow(ctx, pt.x, pt.y, 14, CC.cyan, (isPeak ? 0.3 : 0) + hp * 0.25);
        }

        // Dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, hp > 0 ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = rgb(CC.cyan, hp > 0 ? 1 : 0.8);
        ctx.fill();

        // Count label above point
        if (hp > 0 || isPeak) {
          ctx.font = `bold 10px 'JetBrains Mono', monospace`;
          ctx.fillStyle = CC.cyan;
          ctx.textAlign = 'center';
          ctx.fillText(String(pt.point.count), pt.x, pt.y - 10);
        }

        // Week label below axis
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = hp > 0 ? CC.cyan : rgb(CC.t3, 0.6);
        ctx.textAlign = 'center';
        ctx.fillText(pt.point.week, pt.x, H - padB + 14);
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [trend]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Quotation submission trend — weekly count over 12 weeks"
        style={{ width: W, height: H, display: 'block' }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
