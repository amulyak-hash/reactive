import { useRef, useEffect } from 'react';

import { ChartFrame } from '../chartFrame/ChartFrame';
import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import {
  useCanvasInteraction,
  registerHitCircle,
} from '../../canvas/useCanvasInteraction';
import { dampedPulse, tickHoverProgress, easeOutExpo } from '../../canvas/easing';
import { CC, rgb, drawGlow, drawCrosshair, setupCanvas } from '../../canvas/canvasUtils';
import type { VizRow, SeriesChartProps } from '../../types';

const W = 760;
const H = 250;

export function SeriesChart({ rows = [], variant, className, colors }: SeriesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);

  const { mouseRef, hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(
    canvasRef,
    { width: W, height: H },
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);

    frameRef.current = 0;
    const DURATION = 48;
    const lineColor = colors?.line ?? CC.blue;
    const pointColor = colors?.point ?? CC.blue;
    const axisColor = colors?.axisLine ?? CC.bd;
    const areaFill = colors?.areaFill ?? CC.blue;

    const pad = { top: 24, right: 24, bottom: 44, left: 24 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      if (rows.length < 2) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const values = rows.map((r: VizRow) => r.pricing ?? 0);
      const yMax = Math.max(100, ...values);
      const toX = (i: number) => pad.left + (i / (rows.length - 1)) * plotW;
      const toY = (v: number) => pad.top + (1 - v / yMax) * plotH;

      const rawProgress = Math.min(T / DURATION, 1);
      const progress = easeOutExpo(rawProgress);
      const visiblePoints = Math.max(2, Math.floor(progress * rows.length));

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      // Grid lines
      ctx.strokeStyle = rgb(CC.bd, 0.2);
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (i / 4) * plotH;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(pad.left + plotW, y);
        ctx.stroke();
      }

      // Axis baseline
      ctx.strokeStyle = rgb(axisColor, 0.4);
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pad.left, toY(0));
      ctx.lineTo(pad.left + plotW, toY(0));
      ctx.stroke();

      // Crosshair on hover
      if (mouseRef.current.over && hoveredRef.current) {
        const idx = parseInt(hoveredRef.current.split('-')[1]);
        if (!isNaN(idx)) drawCrosshair(ctx, toX(idx), pad.top, pad.top + plotH);
      }

      // Area fill (when variant = 'area')
      if (variant === 'area' && visiblePoints > 1) {
        const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
        grad.addColorStop(0, rgb(areaFill, 0.12));
        grad.addColorStop(1, rgb(areaFill, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(toX(0), pad.top + plotH);
        for (let i = 0; i < visiblePoints; i++) {
          ctx.lineTo(toX(i), toY(rows[i].pricing ?? 0));
        }
        ctx.lineTo(toX(visiblePoints - 1), pad.top + plotH);
        ctx.closePath();
        ctx.fill();
      }

      // Line
      if (visiblePoints > 1) {
        ctx.strokeStyle = rgb(lineColor, 0.85);
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        for (let i = 0; i < visiblePoints; i++) {
          const x = toX(i);
          const y = toY(rows[i].pricing ?? 0);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Data points + hit zones + hover glow
      for (let i = 0; i < visiblePoints; i++) {
        const x = toX(i);
        const y = toY(rows[i].pricing ?? 0);
        const id = `sc-${i}`;
        const hp = hoverMap.current.get(id) ?? 0;
        const isLast = i === rows.length - 1;

        registerHitCircle(hitZonesRef.current, id, x, y, 12, {
          label: rows[i].vendor,
          value: String(rows[i].pricing ?? 0),
          color: isLast ? CC.red : pointColor,
        });

        if (hp > 0) drawGlow(ctx, x, y, 16 * hp, pointColor, 0.2 * hp);

        // Dot
        const pulse = isLast ? dampedPulse(T, 0.05, 0.0005) : 0;
        const r = variant === 'area' ? 5 : 6;

        if (isLast) {
          ctx.shadowColor = rgb(CC.red, 0.5);
          ctx.shadowBlur = (8 + pulse * 4) * (1 + hp * 0.5);
          ctx.fillStyle = CC.red;
          ctx.beginPath();
          ctx.arc(x, y, (r + pulse * 1.5) * (1 + hp * 0.3), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = rgb(pointColor, 0.7 + hp * 0.3);
          ctx.beginPath();
          ctx.arc(x, y, r + hp * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Vendor label
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = rgb(CC.t3, 0.6 + hp * 0.3);
        ctx.textAlign = 'center';
        ctx.fillText(rows[i].vendor, x, H - 14);
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [rows, variant, colors]);

  return (
    <ChartFrame className={className}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`${variant} chart`}
          style={{ width: W, height: H, display: 'block', borderRadius: 8 }}
        />
        <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
      </div>
    </ChartFrame>
  );
}
