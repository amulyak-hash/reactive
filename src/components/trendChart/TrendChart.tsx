import { useRef, useEffect, useMemo } from 'react';

import { ChartFrame } from '../chartFrame/ChartFrame';
import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import {
  useCanvasInteraction,
  registerHitCircle,
} from '../../canvas/useCanvasInteraction';
import { dampedPulse, tickHoverProgress } from '../../canvas/easing';
import { CC, rgb, drawGlow, drawCrosshair, setupCanvas } from '../../canvas/canvasUtils';
import type { TrendChartProps } from '../../types';

const W = 280;
const H = 96;

export function TrendChart({ points = [], className, colors }: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);

  const parsed = useMemo(
    () =>
      points.map(([label, rawValue]) => {
        const match = String(rawValue).match(/-?\d+(\.\d+)?/);
        return { label, value: match ? Number(match[0]) : 0 };
      }),
    [points],
  );

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

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      if (parsed.length < 2) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const pad = { left: 12, right: 12, top: 16, bottom: 20 };
      const plotW = W - pad.left - pad.right;
      const plotH = H - pad.top - pad.bottom;
      const values = parsed.map(p => p.value);
      const minV = Math.min(...values);
      const maxV = Math.max(...values);
      const range = maxV - minV || 1;

      const toX = (i: number) => pad.left + (i / (parsed.length - 1)) * plotW;
      const toY = (v: number) => pad.top + (1 - (v - minV) / range) * plotH;

      const rawProgress = Math.min(T / DURATION, 1);
      const progress = 1 - (1 - rawProgress) ** 3; // easeOutCubic
      const visiblePoints = Math.max(2, Math.floor(progress * parsed.length));

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      // Axis line
      ctx.strokeStyle = rgb(axisColor, 0.3);
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pad.left, H - pad.bottom);
      ctx.lineTo(W - pad.right, H - pad.bottom);
      ctx.stroke();

      // X-axis labels
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = rgb(CC.t4, 0.9);
      ctx.textAlign = 'center';
      parsed.forEach((p, i) => {
        ctx.fillText(p.label.replace('Day ', 'D'), toX(i), H - 4);
      });

      // Crosshair on hover
      if (mouseRef.current.over && hoveredRef.current) {
        const idx = parseInt(hoveredRef.current.split('-')[1]);
        if (!isNaN(idx)) drawCrosshair(ctx, toX(idx), pad.top, pad.top + plotH);
      }

      // Area fill
      if (visiblePoints > 1) {
        const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
        grad.addColorStop(0, rgb(lineColor, 0.15));
        grad.addColorStop(1, rgb(lineColor, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(toX(0), pad.top + plotH);
        for (let i = 0; i < visiblePoints; i++) {
          ctx.lineTo(toX(i), toY(parsed[i].value));
        }
        ctx.lineTo(toX(visiblePoints - 1), pad.top + plotH);
        ctx.closePath();
        ctx.fill();

        // Line
        ctx.strokeStyle = rgb(lineColor, 0.8);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        for (let i = 0; i < visiblePoints; i++) {
          const x = toX(i);
          const y = toY(parsed[i].value);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Data point dots + hit zones + hover glow
      for (let i = 0; i < visiblePoints; i++) {
        const x = toX(i);
        const y = toY(parsed[i].value);
        const id = `tp-${i}`;
        const hp = hoverMap.current.get(id) ?? 0;
        const isLast = i === parsed.length - 1;

        registerHitCircle(hitZonesRef.current, id, x, y, 10, {
          label: parsed[i].label,
          value: String(parsed[i].value),
          color: isLast ? CC.red : pointColor,
        });

        if (hp > 0 && !isLast) {
          drawGlow(ctx, x, y, 12 * hp, pointColor, 0.2 * hp);
          ctx.fillStyle = rgb(pointColor, 0.8);
          ctx.beginPath();
          ctx.arc(x, y, 3 + hp * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Last point — pulsing red dot
      if (visiblePoints >= parsed.length) {
        const lastIdx = parsed.length - 1;
        const sx = toX(lastIdx);
        const sy = toY(parsed[lastIdx].value);
        const hp = hoverMap.current.get(`tp-${lastIdx}`) ?? 0;
        const pulse = dampedPulse(T, 0.05, 0.0005);
        const boost = 1 + hp * 0.5;

        ctx.shadowColor = rgb(CC.red, 0.5);
        ctx.shadowBlur = (8 + pulse * 4) * boost;
        ctx.fillStyle = CC.red;
        ctx.beginPath();
        ctx.arc(sx, sy, (3.5 + pulse * 1.5) * boost, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [parsed, colors]);

  return (
    <ChartFrame className={['canvas-trend-frame', className].filter(Boolean).join(' ')}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="trend chart"
          style={{ width: W, height: H, display: 'block', borderRadius: 8 }}
        />
        <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
      </div>
    </ChartFrame>
  );
}
