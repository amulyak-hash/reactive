import { useRef, useCallback } from 'react';
import { C, rgb } from '../theme/tokens';
import { DOWNTIME_EVENTS } from '../data/tataSteel';
import { useCanvasLoop } from '../hooks/useCanvasLoop';
import { useCanvasInteraction, registerHitRect } from '../hooks/useCanvasInteraction';
import { easeOutQuart, stagger, tickHoverProgress } from './easing';
import { drawGlow } from './utils';
import CanvasTooltip from '../components/CanvasTooltip';

export default function DowntimeTimeline({ width, height, animate }) {
  const canvasRef = useRef(null);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width, height });

  const draw = useCallback((ctx, progress) => {
    const pad = { left: 30, right: 10, top: 28, bottom: 22 };
    const lineW = width - pad.left - pad.right;
    const centerY = pad.top + (height - pad.top - pad.bottom) / 2;
    const maxH = 24;

    const toX = (time) => pad.left + (time / maxH) * lineW;

    tickHoverProgress(hoverMap.current, hoveredRef.current);
    hitZonesRef.current = [];

    // Axis labels
    ctx.font = `8px 'JetBrains Mono', monospace`;
    ctx.fillStyle = C.t4;
    ctx.textAlign = 'center';
    for (let h = 0; h <= 24; h += 4) {
      ctx.fillText(`${h}:00`, toX(h), height - 6);
    }

    // Center line
    ctx.strokeStyle = rgb(C.bd, 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, centerY);
    ctx.lineTo(pad.left + lineW, centerY);
    ctx.stroke();

    // Morning shift cluster label
    if (progress > 0.15) {
      ctx.font = `bold 9px 'JetBrains Mono', monospace`;
      ctx.fillStyle = C.red;
      ctx.textAlign = 'center';
      const clusterX = (toX(2) + toX(6)) / 2;
      ctx.fillText('Morning shift cluster', clusterX, pad.top - 6);
    }

    // Events
    DOWNTIME_EVENTS.forEach((evt, i) => {
      const localP = stagger(progress, i, DOWNTIME_EVENTS.length, easeOutQuart);
      if (localP <= 0) return;

      const x = toX(evt.time);
      const w = Math.max(evt.duration / maxH * lineW, 8);
      const h = 12;
      const color = evt.time < 6 ? C.red : C.amber;
      const id = `evt-${i}`;
      const hp = hoverMap.current.get(id) || 0;

      // Scale entrance
      const scale = localP;
      const sw = w * scale;
      const sh = h * scale;

      // Register hit zone
      const hrs = Math.floor(evt.time);
      const mins = Math.round((evt.time - hrs) * 60);
      registerHitRect(hitZonesRef.current, id, x - sw / 2, centerY - sh / 2, sw, sh, {
        label: `${evt.machine} \u2014 ${hrs}:${String(mins).padStart(2, '0')}`,
        value: `${evt.duration} min downtime`,
        sublabel: evt.reason || (evt.time < 6 ? 'Morning shift' : 'Day shift'),
        color,
      });

      // Hover glow
      if (hp > 0) {
        drawGlow(ctx, x, centerY, 20 * hp, color, 0.15 * hp);
      }

      // Event rectangle
      ctx.fillStyle = rgb(color, (0.6 + hp * 0.2) * scale);
      ctx.beginPath();
      ctx.roundRect(x - sw / 2, centerY - sh / 2, sw, sh, 4);
      ctx.fill();

      // Hover border
      if (hp > 0) {
        ctx.strokeStyle = rgb(color, 0.5 * hp);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x - sw / 2, centerY - sh / 2, sw, sh, 4);
        ctx.stroke();
      }

      // Machine label
      ctx.font = `7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = hp > 0 ? C.t1 : C.t2;
      ctx.textAlign = 'center';
      ctx.globalAlpha = scale;
      ctx.fillText(evt.machine, x, centerY - sh / 2 - 4);
      ctx.globalAlpha = 1;
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
