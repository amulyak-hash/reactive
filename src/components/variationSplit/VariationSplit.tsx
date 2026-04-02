import { useRef, useEffect } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { stagger, tickHoverProgress, easeOutQuart } from '../../canvas/easing';
import { CC, PALETTE, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import type { VariationSplitProps } from './types';

const W = 680;
const H = 320;

export function VariationSplit({ contractors, 'data-testid': testId }: VariationSplitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 60;

    const padL = 60;
    const padR = 28;
    const padT = 16;
    const padB = 32;
    const barH = 26;
    const gap = 14;
    const trackW = W - padL - padR;
    const maxTotal = Math.max(...contractors.map(c => c.implemented + c.unimplemented));
    const totalH = contractors.length * (barH + gap) - gap;
    const startY = padT + (H - padT - padB - totalH) / 2;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutQuart(rawP);

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      contractors.forEach((c, i) => {
        const accentColor = PALETTE[i % PALETTE.length];
        const localP = stagger(progress, i, contractors.length, easeOutQuart);
        const y = startY + i * (barH + gap);
        const total = c.implemented + c.unimplemented;
        const implW = (c.implemented / maxTotal) * trackW * localP;
        const unimplW = (c.unimplemented / maxTotal) * trackW * localP;
        const implId = `${c.id}-impl`;
        const unimplId = `${c.id}-un`;
        const hpImpl = hoverMap.current.get(implId) ?? 0;
        const hpUn = hoverMap.current.get(unimplId) ?? 0;

        registerHitRect(hitZonesRef.current, implId, padL, y, implW || 1, barH, {
          label: `${c.name} — Implemented`,
          value: `${c.implemented} variations`,
          sublabel: `${Math.round((c.implemented / total) * 100)}% complete`,
          color: CC.green,
        });
        registerHitRect(hitZonesRef.current, unimplId, padL + implW, y, unimplW || 1, barH, {
          label: `${c.name} — Unimplemented`,
          value: `${c.unimplemented} variations`,
          sublabel: `${Math.round((c.unimplemented / total) * 100)}% pending`,
          color: CC.amber,
        });

        // Contractor name
        ctx.font = `9px 'JetBrains Mono', monospace`;
        ctx.fillStyle = rgb(accentColor, 0.85);
        ctx.textAlign = 'right';
        ctx.fillText(c.shortName, padL - 8, y + barH / 2 + 4);

        // Track
        ctx.fillStyle = rgb(CC.bd, 0.15);
        ctx.beginPath();
        ctx.roundRect(padL, y, (total / maxTotal) * trackW, barH, 4);
        ctx.fill();

        // Implemented (green) segment
        if (implW > 0) {
          if (hpImpl > 0) drawGlow(ctx, padL + implW / 2, y + barH / 2, implW * 0.3, CC.green, 0.12 * hpImpl);
          ctx.fillStyle = rgb(CC.green, 0.6 + hpImpl * 0.2);
          ctx.beginPath();
          ctx.roundRect(padL, y, implW, barH, [4, 0, 0, 4]);
          ctx.fill();

          // Implemented count
          if (implW > 28 && localP > 0.5) {
            ctx.font = `bold 10px 'JetBrains Mono', monospace`;
            ctx.fillStyle = hpImpl > 0 ? CC.green : rgb(CC.t1, 0.8);
            ctx.textAlign = 'center';
            ctx.fillText(String(c.implemented), padL + implW / 2, y + barH / 2 + 4);
          }
        }

        // Unimplemented (grey/amber) segment
        if (unimplW > 0) {
          if (hpUn > 0) drawGlow(ctx, padL + implW + unimplW / 2, y + barH / 2, unimplW * 0.3, CC.amber, 0.12 * hpUn);
          ctx.fillStyle = rgb(CC.amber, 0.18 + hpUn * 0.18);
          ctx.strokeStyle = rgb(CC.amber, 0.3 + hpUn * 0.3);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(padL + implW, y, unimplW, barH, [0, 4, 4, 0]);
          ctx.fill();
          ctx.stroke();

          // Unimplemented count
          if (unimplW > 28 && localP > 0.5) {
            ctx.font = `${hpUn > 0 ? 'bold ' : ''}10px 'JetBrains Mono', monospace`;
            ctx.fillStyle = hpUn > 0 ? CC.amber : rgb(CC.t3, 0.8);
            ctx.textAlign = 'center';
            ctx.fillText(String(c.unimplemented), padL + implW + unimplW / 2, y + barH / 2 + 4);
          }
        }

        // Split divider
        if (implW > 0 && unimplW > 0) {
          ctx.strokeStyle = rgb(CC.bg, 0.7);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(padL + implW, y);
          ctx.lineTo(padL + implW, y + barH);
          ctx.stroke();
        }
      });

      // Legend below bars — centered over track
      const legendY = startY + totalH + 24;
      const trackCX = padL + trackW / 2;
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = 'right';
      ctx.fillStyle = CC.green;
      ctx.fillText('■ Implemented', trackCX - 10, legendY);
      ctx.textAlign = 'left';
      ctx.fillStyle = rgb(CC.t3, 0.7);
      ctx.fillText('■ Unimplemented', trackCX + 10, legendY);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [contractors]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Implemented vs unimplemented variations per contractor — split bar"
        style={{ width: W, height: H, display: 'block' }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
