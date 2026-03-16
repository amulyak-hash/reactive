import { useRef, useCallback } from 'react';
import { C, rgb } from '../theme/tokens';
import { DEFECT_DATA } from '../data/tataSteel';
import { useCanvasLoop } from '../hooks/useCanvasLoop';
import { useCanvasInteraction, registerHitCircle } from '../hooks/useCanvasInteraction';
import { dampedPulse, tickHoverProgress } from './easing';
import { drawGlow, drawCrosshair } from './utils';
import CanvasTooltip from '../components/CanvasTooltip';

const avgRate = DEFECT_DATA.reduce((s, d) => s + d.rate, 0) / DEFECT_DATA.length;

export default function DefectTrend({ width, height, animate }) {
  const canvasRef = useRef(null);
  const hoverMap = useRef(new Map());

  const { mouseRef, hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width, height });

  const draw = useCallback((ctx, progress, frame) => {
    const pad = { left: 10, right: 10, top: 10, bottom: 24 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;
    const maxRate = 1.4;

    const toX = (i) => pad.left + (i / (DEFECT_DATA.length - 1)) * w;
    const toY = (v) => pad.top + (1 - v / maxRate) * h;

    const visiblePoints = Math.max(2, Math.floor(progress * DEFECT_DATA.length));

    tickHoverProgress(hoverMap.current, hoveredRef.current);
    hitZonesRef.current = [];

    // X-axis labels
    ctx.font = `9px 'JetBrains Mono', monospace`;
    ctx.fillStyle = C.t4;
    ctx.textAlign = 'center';
    DEFECT_DATA.forEach((d, i) => {
      ctx.fillText(d.day, toX(i), height - 6);
    });

    // Crosshair on hover
    if (mouseRef.current.over && hoveredRef.current) {
      const idx = parseInt(hoveredRef.current.split('-')[1]);
      if (!isNaN(idx)) {
        drawCrosshair(ctx, toX(idx), pad.top, pad.top + h);
      }
    }

    // Area fill
    if (visiblePoints > 1) {
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + h);
      grad.addColorStop(0, rgb(C.amber, 0.15));
      grad.addColorStop(1, rgb(C.amber, 0));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(toX(0), pad.top + h);
      for (let i = 0; i < visiblePoints; i++) {
        ctx.lineTo(toX(i), toY(DEFECT_DATA[i].rate));
      }
      ctx.lineTo(toX(visiblePoints - 1), pad.top + h);
      ctx.closePath();
      ctx.fill();

      // Line
      ctx.strokeStyle = rgb(C.amber, 0.7);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < visiblePoints; i++) {
        const x = toX(i);
        const y = toY(DEFECT_DATA[i].rate);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Data point dots + hit zones + hover glow
    for (let i = 0; i < visiblePoints; i++) {
      const x = toX(i);
      const y = toY(DEFECT_DATA[i].rate);
      const id = `df-${i}`;
      const hp = hoverMap.current.get(id) || 0;
      const isLast = i === DEFECT_DATA.length - 1;
      const delta = (DEFECT_DATA[i].rate - avgRate).toFixed(2);

      registerHitCircle(hitZonesRef.current, id, x, y, 10, {
        label: DEFECT_DATA[i].day,
        value: `${DEFECT_DATA[i].rate}% defect rate`,
        sublabel: `${parseFloat(delta) >= 0 ? '+' : ''}${delta} vs avg`,
        color: isLast ? C.red : C.amber,
      });

      if (hp > 0 && !isLast) {
        drawGlow(ctx, x, y, 14 * hp, C.amber, 0.2 * hp);
        ctx.fillStyle = rgb(C.amber, 0.8);
        ctx.beginPath();
        ctx.arc(x, y, 3 + hp * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Sunday red pulsing dot (last point)
    if (visiblePoints >= DEFECT_DATA.length) {
      const lastIdx = DEFECT_DATA.length - 1;
      const sx = toX(lastIdx);
      const sy = toY(DEFECT_DATA[lastIdx].rate);
      const hp = hoverMap.current.get(`df-${lastIdx}`) || 0;
      const pulse = dampedPulse(frame, 0.05, 0.0005);
      const hoverBoost = 1 + hp * 0.5;

      ctx.shadowColor = rgb(C.red, 0.5);
      ctx.shadowBlur = (8 + pulse * 4) * hoverBoost;
      ctx.fillStyle = C.red;
      ctx.beginPath();
      ctx.arc(sx, sy, (4 + pulse * 1.5) * hoverBoost, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [width, height]);

  useCanvasLoop(canvasRef, width, height, draw, animate);

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={canvasRef} style={{ width, height, display: 'block', borderRadius: 8 }} />
      <CanvasTooltip {...tooltip} parentW={width} parentH={height} />
    </div>
  );
}
