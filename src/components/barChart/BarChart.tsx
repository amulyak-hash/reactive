import { useRef, useEffect } from 'react';

import { ChartFrame } from '../chartFrame/ChartFrame';
import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import {
  useCanvasInteraction,
  registerHitRect,
} from '../../canvas/useCanvasInteraction';
import { stagger, tickHoverProgress, easeOutQuart } from '../../canvas/easing';
import { CC, PALETTE, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import type { BarChartProps } from '../../types';

const W = 760;
const H = 280;

export function BarChart({ rows = [], className, colors }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(
    canvasRef,
    { width: W, height: H },
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);

    frameRef.current = 0;
    const DURATION = 48;
    const barPalette = colors?.bars ?? PALETTE;
    const axisColor = colors?.axisLine ?? CC.bd;
    const valueLabelColor = colors?.valueLabel ?? CC.t2;

    const pad = { top: 24, right: 24, bottom: 56, left: 24 };
    const barArea = H - pad.top - pad.bottom;
    const barW = (W - pad.left - pad.right) / Math.max(rows.length, 1);
    const maxVal = Math.max(100, ...rows.map(r => r.pricing ?? 0));
    const baseline = pad.top + barArea;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawProgress = Math.min(T / DURATION, 1);
      const progress = easeOutQuart(rawProgress);

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      // Axis baseline
      ctx.strokeStyle = rgb(axisColor, 0.4);
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pad.left, baseline);
      ctx.lineTo(W - pad.right, baseline);
      ctx.stroke();

      rows.forEach((row, i) => {
        const x = pad.left + i * barW;
        const localP = stagger(progress, i, rows.length, easeOutQuart);
        const fullH = maxVal > 0 ? ((row.pricing ?? 0) / maxVal) * barArea : 0;
        const barH = Math.max(fullH > 0 ? 4 : 0, fullH * localP);
        const color = barPalette[i % barPalette.length];
        const hp = hoverMap.current.get(row.id ?? `bar-${i}`) ?? 0;

        registerHitRect(
          hitZonesRef.current,
          row.id ?? `bar-${i}`,
          x + 4,
          baseline - barH,
          barW - 8,
          barH,
          {
            label: row.vendor,
            value: String(row.pricing ?? 0),
            color,
          },
        );

        if (barH > 0) {
          // Hover glow
          if (hp > 0) {
            drawGlow(ctx, x + barW / 2, baseline - barH / 2, barW * 0.8, color, 0.12 * hp);
          }

          ctx.shadowColor = rgb(color, 0.2 * (hp > 0 ? hp : 0));
          ctx.shadowBlur = hp > 0 ? 6 : 0;
          ctx.fillStyle = rgb(color, 0.5 + hp * 0.25);
          ctx.beginPath();
          ctx.roundRect(x + 4, baseline - barH, barW - 8, barH, [4, 4, 0, 0]);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Hover border
          if (hp > 0) {
            ctx.strokeStyle = rgb(color, 0.4 * hp);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x + 4, baseline - barH, barW - 8, barH, [4, 4, 0, 0]);
            ctx.stroke();
          }
        }

        // Value label above bar
        if (localP > 0.5 && barH > 0) {
          ctx.globalAlpha = Math.min(1, (localP - 0.5) * 2);
          ctx.font = `bold 10px 'JetBrains Mono', monospace`;
          ctx.fillStyle = hp > 0 ? color : rgb(valueLabelColor, 0.7);
          ctx.textAlign = 'center';
          ctx.fillText(String(row.pricing ?? ''), x + barW / 2, baseline - barH - 6);
          ctx.globalAlpha = 1;
        }

        // Vendor label below baseline
        ctx.font = `${hp > 0 ? 'bold ' : ''}9px 'JetBrains Mono', monospace`;
        ctx.fillStyle = hp > 0 ? color : rgb(CC.t3, 0.6);
        ctx.textAlign = 'center';
        ctx.fillText(row.vendor, x + barW / 2, H - 14);
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [rows, colors]);

  return (
    <ChartFrame className={className}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="bar chart"
          style={{ width: W, height: H, display: 'block', borderRadius: 8 }}
        />
        <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
      </div>
    </ChartFrame>
  );
}
