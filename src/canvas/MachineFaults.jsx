import { useRef, useCallback } from 'react';
import { C, rgb } from '../theme/tokens';
import { MACHINE_FAULTS } from '../data/tataSteel';
import { useCanvasLoop } from '../hooks/useCanvasLoop';
import { useCanvasInteraction, registerHitRect } from '../hooks/useCanvasInteraction';
import { easeOutQuart, stagger, tickHoverProgress } from './easing';
import { drawGlow } from './utils';
import CanvasTooltip from '../components/CanvasTooltip';

const totalFaults = MACHINE_FAULTS.reduce((s, m) => s + m.faults, 0);

export default function MachineFaults({ width, height, animate }) {
  const canvasRef = useRef(null);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width, height });

  const draw = useCallback((ctx, progress) => {
    const pad = { left: 6, right: 6, top: 10, bottom: 22 };
    const barArea = height - pad.top - pad.bottom;
    const barW = (width - pad.left - pad.right) / MACHINE_FAULTS.length;
    const maxFaults = Math.max(...MACHINE_FAULTS.map(m => m.faults));
    const baseline = pad.top + barArea;

    tickHoverProgress(hoverMap.current, hoveredRef.current);
    hitZonesRef.current = [];

    MACHINE_FAULTS.forEach((m, i) => {
      const x = pad.left + i * barW;
      const localP = stagger(progress, i, MACHINE_FAULTS.length, easeOutQuart);
      const barH = m.faults > 0 ? Math.max((m.faults / maxFaults) * barArea * localP, 4) : 0;
      const isM21 = m.id === 'M21';
      const hp = hoverMap.current.get(m.id) || 0;
      const baseAlpha = isM21 ? 0.6 : 0.25;
      const color = isM21 ? C.red : C.blue;

      // Register hit zone
      const pct = totalFaults > 0 ? ((m.faults / totalFaults) * 100).toFixed(0) : '0';
      registerHitRect(hitZonesRef.current, m.id, x + 4, baseline - barH, barW - 8, barH, {
        label: m.id,
        value: `${m.faults} fault${m.faults !== 1 ? 's' : ''}`,
        sublabel: `${pct}% of total`,
        color,
      });

      if (barH > 0) {
        // Hover glow behind bar
        if (hp > 0) {
          drawGlow(ctx, x + barW / 2, baseline - barH / 2, barW * 0.8, color, 0.12 * hp);
        }

        // Shadow on M21 or hovered
        if (isM21 || hp > 0) {
          ctx.shadowColor = rgb(color, 0.25 * (isM21 ? 1 : hp));
          ctx.shadowBlur = 6;
        }

        ctx.fillStyle = rgb(color, baseAlpha + hp * 0.25);
        ctx.beginPath();
        ctx.roundRect(x + 4, baseline - barH, barW - 8, barH, [4, 4, 0, 0]);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hover border highlight
        if (hp > 0) {
          ctx.strokeStyle = rgb(color, 0.4 * hp);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(x + 4, baseline - barH, barW - 8, barH, [4, 4, 0, 0]);
          ctx.stroke();
        }
      }

      // Count label on hover
      if (hp > 0.3 && m.faults > 0) {
        ctx.globalAlpha = hp;
        ctx.font = `bold 9px 'JetBrains Mono', monospace`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(m.faults, x + barW / 2, baseline - barH - 5);
        ctx.globalAlpha = 1;
      }

      // Label
      ctx.font = `${isM21 ? 'bold ' : ''}8px 'JetBrains Mono', monospace`;
      ctx.fillStyle = isM21 ? C.red : (hp > 0 ? C.t2 : C.t4);
      ctx.textAlign = 'center';
      ctx.fillText(m.id, x + barW / 2, height - 6);
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
