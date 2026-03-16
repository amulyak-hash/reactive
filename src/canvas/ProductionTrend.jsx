import { useRef, useCallback } from 'react';
import { C, rgb, FONT_MONO } from '../theme/tokens';
import { PRODUCTION_HOURS, PRODUCTION_EXPECTED, PRODUCTION_ACTUAL } from '../data/tataSteel';
import { useCanvasLoop } from '../hooks/useCanvasLoop';
import { useCanvasInteraction, registerHitCircle } from '../hooks/useCanvasInteraction';
import { easeOutExpo, dampedPulse, tickHoverProgress } from './easing';
import { drawGlow, drawCrosshair } from './utils';
import CanvasTooltip from '../components/CanvasTooltip';

export default function ProductionTrend({ width, height, animate }) {
  const canvasRef = useRef(null);
  const hoverMap = useRef(new Map());

  const { mouseRef, hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width, height });

  const draw = useCallback((ctx, progress, frame) => {
    const pad = { top: 10, right: 10, bottom: 28, left: 44 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;

    const allVals = [...PRODUCTION_EXPECTED, ...PRODUCTION_ACTUAL];
    const minY = Math.min(...allVals) - 5;
    const maxY = Math.max(...allVals) + 5;

    const toX = (i) => pad.left + (i / (PRODUCTION_HOURS.length - 1)) * w;
    const toY = (v) => pad.top + (1 - (v - minY) / (maxY - minY)) * h;

    // Tick hover progress
    tickHoverProgress(hoverMap.current, hoveredRef.current);

    // Reset hit zones each frame
    hitZonesRef.current = [];

    // Grid lines
    ctx.strokeStyle = rgb(C.bd, 0.2);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const y = pad.top + (i / 4) * h;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + w, y);
      ctx.stroke();
    }

    // Y-axis labels
    ctx.font = `9px 'JetBrains Mono', monospace`;
    ctx.fillStyle = C.t4;
    ctx.textAlign = 'right';
    for (let i = 0; i < 5; i++) {
      const val = Math.round(minY + (1 - i / 4) * (maxY - minY));
      ctx.fillText(`${val}`, pad.left - 6, pad.top + (i / 4) * h + 3);
    }

    // X-axis labels
    ctx.fillStyle = C.t4;
    ctx.textAlign = 'center';
    PRODUCTION_HOURS.forEach((hr, i) => {
      if (hr % 2 === 0) {
        ctx.fillText(`${hr}:00`, toX(i), height - 6);
      }
    });

    const pointCount = PRODUCTION_HOURS.length;
    const visiblePoints = Math.floor(progress * pointCount);

    // Crosshair on hover
    if (mouseRef.current.over && hoveredRef.current) {
      const idx = parseInt(hoveredRef.current.split('-')[1]);
      if (!isNaN(idx)) {
        drawCrosshair(ctx, toX(idx), pad.top, pad.top + h);
      }
    }

    // Expected line (dashed)
    if (visiblePoints > 1) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = rgb(C.t3, 0.3);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < visiblePoints; i++) {
        const x = toX(i);
        const y = toY(PRODUCTION_EXPECTED[i]);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Actual line + gradient fill
    if (visiblePoints > 1) {
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + h);
      grad.addColorStop(0, rgb(C.blue, 0.12));
      grad.addColorStop(1, rgb(C.blue, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(toX(0), pad.top + h);
      for (let i = 0; i < visiblePoints; i++) {
        ctx.lineTo(toX(i), toY(PRODUCTION_ACTUAL[i]));
      }
      ctx.lineTo(toX(visiblePoints - 1), pad.top + h);
      ctx.closePath();
      ctx.fill();

      // Line
      ctx.strokeStyle = rgb(C.blue, 0.85);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < visiblePoints; i++) {
        const x = toX(i);
        const y = toY(PRODUCTION_ACTUAL[i]);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Data point dots + hit zones + hover glow
    for (let i = 0; i < visiblePoints; i++) {
      const x = toX(i);
      const ya = toY(PRODUCTION_ACTUAL[i]);
      const id = `pt-${i}`;
      const hp = hoverMap.current.get(id) || 0;

      // Register hit zone
      const gap = PRODUCTION_ACTUAL[i] - PRODUCTION_EXPECTED[i];
      const gapPct = ((gap / PRODUCTION_EXPECTED[i]) * 100).toFixed(1);
      registerHitCircle(hitZonesRef.current, id, x, ya, 10, {
        label: `${PRODUCTION_HOURS[i]}:00`,
        value: `Actual: ${PRODUCTION_ACTUAL[i]}t  Expected: ${PRODUCTION_EXPECTED[i]}t`,
        sublabel: `Gap: ${gap >= 0 ? '+' : ''}${gapPct}%`,
        color: gap < -3 ? C.red : C.blue,
      });

      // Hover glow
      if (hp > 0) {
        drawGlow(ctx, x, ya, 16 * hp, C.blue, 0.2 * hp);
      }

      // Dot (small normally, bigger on hover)
      const r = 2 + hp * 3;
      ctx.fillStyle = rgb(C.blue, 0.7 + hp * 0.3);
      ctx.beginPath();
      ctx.arc(x, ya, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Divergence point (index 5) — red dot + label
    if (visiblePoints > 5) {
      const dx = toX(5);
      const dy = toY(PRODUCTION_ACTUAL[5]);
      const pulse = dampedPulse(frame, 0.05, 0.0005);

      ctx.shadowColor = rgb(C.red, 0.5);
      ctx.shadowBlur = 8 + pulse * 4;
      ctx.fillStyle = C.red;
      ctx.beginPath();
      ctx.arc(dx, dy, 4 + pulse * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = `bold 9px 'JetBrains Mono', monospace`;
      ctx.fillStyle = C.red;
      ctx.textAlign = 'left';
      ctx.fillText('\u22128%', dx + 8, dy - 4);
    }

    // Legend labels (after animation completes)
    if (progress >= 1) {
      const legendAlpha = Math.min((frame - 48) / 20, 1);
      if (legendAlpha > 0) {
        ctx.globalAlpha = legendAlpha;
        ctx.font = `9px 'JetBrains Mono', monospace`;
        const lastX = toX(pointCount - 1) + 6;
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.textAlign = 'left';
        ctx.fillText('Expected', lastX - 52, toY(PRODUCTION_EXPECTED[pointCount - 1]) - 12);
        ctx.fillStyle = C.blue;
        ctx.fillText('Actual', lastX - 52, toY(PRODUCTION_ACTUAL[pointCount - 1]) - 12);
        ctx.globalAlpha = 1;
      }
    }
  }, [width, height]);

  useCanvasLoop(canvasRef, width, height, draw, animate, { easing: easeOutExpo });

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={canvasRef} style={{ width, height, display: 'block', borderRadius: 8 }} />
      <CanvasTooltip {...tooltip} parentW={width} parentH={height} />
    </div>
  );
}
