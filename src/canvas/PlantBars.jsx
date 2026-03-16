import { useRef, useCallback } from 'react';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';
import { PLANTS } from '../data/tataSteel';
import { useCanvasLoop } from '../hooks/useCanvasLoop';
import { useCanvasInteraction, registerHitRect } from '../hooks/useCanvasInteraction';
import { easeOutQuart, stagger, tickHoverProgress } from './easing';
import { drawGlow } from './utils';
import CanvasTooltip from '../components/CanvasTooltip';

export default function PlantBars({ width, height, animate }) {
  const canvasRef = useRef(null);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width, height });

  const draw = useCallback((ctx, progress) => {
    const pad = { left: 8, right: 40, top: 8, bottom: 8 };
    const barH = 14;
    const gap = (height - pad.top - pad.bottom - PLANTS.length * barH) / (PLANTS.length - 1);
    const barArea = width - pad.left - 110 - pad.right;

    tickHoverProgress(hoverMap.current, hoveredRef.current);
    hitZonesRef.current = [];

    PLANTS.forEach((plant, i) => {
      const y = pad.top + i * (barH + gap);
      const localP = stagger(progress, i, PLANTS.length, easeOutQuart);
      const isPlantB = i === 1;
      const id = `plant-${i}`;
      const hp = hoverMap.current.get(id) || 0;

      // Label
      ctx.font = `${isPlantB ? 'bold ' : ''}10px 'DM Sans', sans-serif`;
      ctx.fillStyle = isPlantB ? C.red : (hp > 0 ? C.t1 : C.t2);
      ctx.textAlign = 'left';
      ctx.fillText(plant.name, pad.left, y + 11);

      const barX = pad.left + 110;

      // Register hit zone (full bar area)
      const gapPct = plant.actual - 91; // target is ~91%
      registerHitRect(hitZonesRef.current, id, barX, y, barArea, barH, {
        label: plant.name,
        value: `${plant.actual}% actual`,
        sublabel: `Target: 91% | Gap: ${gapPct >= 0 ? '+' : ''}${gapPct}%`,
        color: plant.color,
      });

      // Expected bar (background)
      ctx.fillStyle = rgb(C.bd, 0.3);
      ctx.beginPath();
      ctx.roundRect(barX, y, barArea, barH, 4);
      ctx.fill();

      // Actual bar
      const actualW = (plant.actual / 100) * barArea * localP;
      if (actualW > 0) {
        // Hover glow
        if (hp > 0) {
          drawGlow(ctx, barX + actualW / 2, y + barH / 2, actualW * 0.4, plant.color, 0.1 * hp);
        }

        if (isPlantB || hp > 0) {
          ctx.shadowColor = rgb(plant.color, 0.2 * (isPlantB ? 1 : hp));
          ctx.shadowBlur = 6;
        }
        ctx.fillStyle = rgb(plant.color, (isPlantB ? 0.6 : 0.4) + hp * 0.15);
        ctx.beginPath();
        ctx.roundRect(barX, y, actualW, barH, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hover border
        if (hp > 0) {
          ctx.strokeStyle = rgb(plant.color, 0.4 * hp);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(barX, y, actualW, barH, 4);
          ctx.stroke();
        }
      }

      // Percentage label (after stagger completes)
      if (localP >= 0.95) {
        const labelAlpha = Math.min((localP - 0.95) / 0.05, 1);
        ctx.globalAlpha = labelAlpha;
        ctx.font = `bold 9px 'JetBrains Mono', monospace`;
        ctx.fillStyle = plant.color;
        ctx.textAlign = 'left';
        ctx.fillText(`${plant.actual}%`, barX + actualW + 6, y + 11);
        ctx.globalAlpha = 1;
      }
    });
  }, [width, height]);

  useCanvasLoop(canvasRef, width, height, draw, animate, { easing: easeOutQuart });

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={canvasRef} style={{ width, height, display: 'block', borderRadius: 8 }} />
      <CanvasTooltip {...tooltip} parentW={width} parentH={height} />
    </div>
  );
}
