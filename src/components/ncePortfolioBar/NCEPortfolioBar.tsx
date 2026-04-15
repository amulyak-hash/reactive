import { useRef, useEffect } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { stagger, tickHoverProgress, easeOutCubic } from '../../canvas/easing';
import { CC, rgb, setupCanvas, drawGlow } from '../../canvas/canvasUtils';
import type { NCEPortfolioBarProps } from './types';

const W = 660;
const H = 258;
const BAR_H = 28;
const GAP = 14;
const LABEL_W = 52;
const VALUE_W = 80;
const LEFT = LABEL_W + 12;
const RIGHT = W - VALUE_W - 8;
const BAR_AREA = RIGHT - LEFT;

const MONO = "'JetBrains Mono', monospace";
const SANS = "'DM Sans', sans-serif";

export function NCEPortfolioBarChart({ snapshot, 'data-testid': testId }: NCEPortfolioBarProps) {
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

    const maxVal = Math.max(...snapshot.map(s => s.contractValue + s.nceVariation));
    const topY = 26;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      // Legend
      if (progress > 0.15) {
        const legendFade = Math.min(1, (progress - 0.15) / 0.3);
        ctx.globalAlpha = legendFade;
        const legends = [
          { label: 'Contract Value', color: CC.blue },
          { label: 'NCE Variation', color: CC.amber },
        ];
        let lx = LEFT;
        legends.forEach(leg => {
          ctx.fillStyle = rgb(leg.color, 0.9);
          ctx.beginPath();
          ctx.arc(lx + 4, 10, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = CC.t2;
          ctx.font = `10px ${SANS}`;
          ctx.textAlign = 'left';
          ctx.fillText(leg.label, lx + 11, 13);
          lx += ctx.measureText(leg.label).width + 28;
        });
        ctx.globalAlpha = 1;
      }

      // Bars
      snapshot.forEach((item, i) => {
        const localP = stagger(progress, i, snapshot.length, easeOutCubic);
        if (localP < 0.01) return;

        const y = topY + i * (BAR_H + GAP);
        const hp = hoverMap.current.get(item.id) ?? 0;

        ctx.globalAlpha = localP;

        // Label
        ctx.font = `bold 10px ${MONO}`;
        ctx.fillStyle = hp > 0 ? CC.t1 : CC.t2;
        ctx.textAlign = 'right';
        ctx.fillText(item.shortName, LABEL_W, y + BAR_H / 2 + 4);

        const scale = (BAR_AREA / maxVal) * localP;
        const contractW = item.contractValue * scale;
        const variationW = item.nceVariation * scale;

        // Track
        ctx.fillStyle = rgb(CC.t4, 0.1);
        ctx.beginPath();
        ctx.roundRect(LEFT, y, BAR_AREA * localP, BAR_H, 4);
        ctx.fill();

        // Contract
        if (contractW > 0) {
          if (hp > 0) drawGlow(ctx, LEFT + contractW / 2, y + BAR_H / 2, BAR_H * 1.5, CC.blue, 0.1);
          ctx.fillStyle = rgb(CC.blue, (0.6 + hp * 0.2) * localP);
          ctx.beginPath();
          ctx.roundRect(LEFT, y, contractW, BAR_H, [4, 0, 0, 4]);
          ctx.fill();
        }

        // Variation
        const varX = LEFT + contractW;
        if (variationW > 0) {
          ctx.fillStyle = rgb(CC.amber, (0.7 + hp * 0.15) * localP);
          ctx.beginPath();
          ctx.roundRect(varX, y, variationW, BAR_H, [0, 4, 4, 0]);
          ctx.fill();
        }

        // Value labels
        const total = item.contractValue + item.nceVariation;
        const varPct = ((item.nceVariation / item.contractValue) * 100).toFixed(0);
        ctx.font = `bold 10px ${MONO}`;
        ctx.fillStyle = CC.t1;
        ctx.textAlign = 'left';
        ctx.fillText(`£${total.toFixed(0)}M`, LEFT + contractW + variationW + 8, y + BAR_H / 2 + 1);
        ctx.font = `9px ${SANS}`;
        ctx.fillStyle = CC.amber;
        ctx.fillText(`+${varPct}%`, LEFT + contractW + variationW + 8, y + BAR_H / 2 + 13);
        ctx.globalAlpha = 1;

        registerHitRect(hitZonesRef.current, item.id, LEFT, y, BAR_AREA, BAR_H, {
          label: item.name,
          value: `Contract: £${item.contractValue}M | NCE Variation: £${item.nceVariation}M`,
          sublabel: `${varPct}% value shift from NCEs`,
          color: CC.amber,
        });
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [snapshot]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="NCE exposure snapshot — contract value vs NCE variation per contractor"
        style={{ width: W, height: H, display: 'block' }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
