import { useRef, useEffect } from 'react';

import { ChartFrame } from '../chartFrame/ChartFrame';
import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import {
  useCanvasInteraction,
  registerHitCircle,
} from '../../canvas/useCanvasInteraction';
import { dampedPulse, tickHoverProgress } from '../../canvas/easing';
import { CC, PALETTE, lerpC, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import type { PieChartProps } from '../../types';

const SIZE = 192;
const W = SIZE;
const H = SIZE + 80; // canvas height includes legend space

export function PieChart({ rows = [], variant, className, colors }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);
  const slicePalette = colors?.slices ?? PALETTE;

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
    const cx = W / 2;
    const cy = SIZE / 2;
    const outerR = SIZE * 0.4;
    const innerR = variant === 'donut' ? SIZE * 0.21 : 0;
    const total = rows.reduce((s, r) => s + (r.pricing ?? 0), 0) || 1;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawProgress = Math.min(T / DURATION, 1);
      const progress = 1 - (1 - rawProgress) ** 3; // easeOutCubic

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      // Compute cumulative angles
      let startAngle = -Math.PI / 2;

      rows.forEach((row, i) => {
        const fraction = (row.pricing ?? 0) / total;
        const sweep = fraction * Math.PI * 2 * progress;
        const endAngle = startAngle + sweep;
        const color = slicePalette[i % slicePalette.length];
        const hp = hoverMap.current.get(row.id ?? `sl-${i}`) ?? 0;

        // Hit zone — midpoint of the arc at midRadius
        const midAngle = startAngle + sweep / 2;
        const midR = (outerR + innerR) / 2;
        const hx = cx + Math.cos(midAngle) * midR;
        const hy = cy + Math.sin(midAngle) * midR;
        const hitR = (outerR - innerR) / 2 + 8;

        registerHitCircle(
          hitZonesRef.current,
          row.id ?? `sl-${i}`,
          hx,
          hy,
          hitR,
          {
            label: row.vendor,
            value: `${row.pricing ?? 0} (${Math.round(fraction * 100)}%)`,
            color,
          },
        );

        // Glow on hover
        if (hp > 0) drawGlow(ctx, hx, hy, hitR * 2 * hp, color, 0.2 * hp);

        // Slice arc
        const pulse = dampedPulse(T, 0.03, 0.0003);
        const expandR = outerR + hp * 6 + (hp > 0 ? pulse * 2 : 0);

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(startAngle) * innerR, cy + Math.sin(startAngle) * innerR);
        ctx.arc(cx, cy, expandR, startAngle, endAngle);
        if (innerR > 0) {
          ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
        } else {
          ctx.lineTo(cx, cy);
        }
        ctx.closePath();

        ctx.fillStyle = rgb(color, 0.7 + hp * 0.2);
        ctx.fill();

        // Slice border
        ctx.strokeStyle = rgb(CC.bg, 0.8);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        startAngle = endAngle;
      });

      // Center glow for donut
      if (variant === 'donut' && rows.length > 0) {
        drawGlow(ctx, cx, cy, innerR * 0.8, CC.blue, 0.06);
      }

      // Legend rows below the arc
      const legendStartY = SIZE + 12;
      const legendItemH = 18;
      const dotR = 4;

      rows.forEach((row, i) => {
        const color = slicePalette[i % slicePalette.length];
        const fraction = (row.pricing ?? 0) / total;
        const hp = hoverMap.current.get(row.id ?? `sl-${i}`) ?? 0;
        const y = legendStartY + i * legendItemH;

        // Color dot
        ctx.beginPath();
        ctx.arc(dotR + 4, y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgb(color, 0.8 + hp * 0.2);
        ctx.fill();

        // Vendor name
        ctx.font = `9px 'JetBrains Mono', monospace`;
        ctx.fillStyle = rgb(CC.t2, 0.7 + hp * 0.2);
        ctx.textAlign = 'left';
        ctx.fillText(row.vendor, dotR * 2 + 10, y + 3.5);

        // Value
        ctx.font = `bold 9px 'JetBrains Mono', monospace`;
        const blend = lerpC(CC.t3, color, hp);
        ctx.fillStyle = blend;
        ctx.textAlign = 'right';
        ctx.fillText(
          `${row.pricing ?? 0} (${Math.round(fraction * 100)}%)`,
          W - 4,
          y + 3.5,
        );
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [rows, variant, colors, slicePalette]);

  return (
    <ChartFrame className={['canvas-pie-frame', className].filter(Boolean).join(' ')}>
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
