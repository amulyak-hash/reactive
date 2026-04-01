import { useRef, useEffect } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from '../../canvas/useCanvasInteraction';
import { dampedPulse } from '../../canvas/easing';
import { CC, rgb, drawGlow, drawDust, drawScanline, setupCanvas } from '../../canvas/canvasUtils';
import type { EWCategoryProps } from './types';

const W = 680;
const H = 260;

export function EWCategory({ categories, 'data-testid': testId }: EWCategoryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const hoverMap = useRef<Map<string, number>>(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;

    const cols = categories.length;
    const maxCount = Math.max(...categories.map(c => c.count), 1);
    const rows = maxCount;
    const padL = W * 0.05;
    const padT = H * 0.1;
    const cellW = (W * 0.9) / cols;
    const cellH = (H * 0.7) / rows;
    const totalCount = categories.reduce((s, c) => s + c.count, 0);

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);
      hitZonesRef.current = [];

      // Tick hover map
      hoverMap.current.forEach((val, id) => {
        const target = id === hoveredRef.current ? 1 : 0;
        const next = val + (target - val) * 0.12;
        if (Math.abs(next - target) < 0.005) {
          if (target === 0) hoverMap.current.delete(id);
          else hoverMap.current.set(id, 1);
        } else {
          hoverMap.current.set(id, next);
        }
      });
      if (hoveredRef.current && !hoverMap.current.has(hoveredRef.current)) {
        hoverMap.current.set(hoveredRef.current, 0);
      }

      drawDust(ctx, W, H, T, 40, rgb(CC.blue, 0.04));

      categories.forEach((cat, c) => {
        const isHighlight = cat.count === maxCount;
        const color = isHighlight ? CC.cyan : CC.blue;
        const hp = hoverMap.current.get(`${cat.category}-col`) ?? 0;

        // Draw dot grid for each row
        for (let r = 0; r < rows; r++) {
          const dotX = padL + c * cellW + cellW / 2;
          const dotY = padT + r * cellH + cellH / 2;
          const maxR = Math.min(cellW, cellH) * 0.38;

          // Dot is active if r >= (maxCount - cat.count) => bottom-up fill
          const isActive = r >= maxCount - cat.count;

          if (isActive) {
            const beatPhase = dampedPulse(T, 0.04, 0.0005) + Math.sin(c * 0.6 + r * 1.2) * 0.3;
            const dotR = maxR * (1 + beatPhase * 0.12);

            // Glow on highlight column
            if (isHighlight || hp > 0.01) {
              drawGlow(ctx, dotX, dotY, dotR * 3, color, (isHighlight ? 0.2 : 0.1) + hp * 0.1);
            }

            ctx.beginPath();
            ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
            ctx.fillStyle = rgb(color, isHighlight ? 0.8 : 0.5 + hp * 0.2);
            ctx.fill();

            // Register hit on active dots
            const dotKey = `${cat.category}-${r}`;
            registerHitCircle(
              hitZonesRef.current,
              dotKey,
              dotX,
              dotY,
              maxR + 4,
              {
                label: cat.fullName,
                value: `${cat.count} Early Warnings`,
                sublabel: `${Math.round((cat.count / totalCount) * 100)}% of total`,
                color,
              },
            );

            // Also register column-level hover for highlight tracking
            hoverMap.current.get(`${cat.category}-col`);
          } else {
            // Inactive position: tiny dim dot
            ctx.beginPath();
            ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
            ctx.fillStyle = rgb(color, 0.08);
            ctx.fill();
          }
        }

        // Column label below grid
        const labelY = padT + rows * cellH + 16;
        ctx.font = `${isHighlight ? 'bold ' : ''}9px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = isHighlight ? CC.cyan : rgb(CC.t2, 0.65);
        ctx.fillText(cat.category, padL + c * cellW + cellW / 2, labelY);
      });

      drawScanline(ctx, W, H, T, 0.015);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [categories]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Early Warning count by category — breathing dot grid"
        style={{ width: W, height: H, display: 'block', borderRadius: 8 }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
