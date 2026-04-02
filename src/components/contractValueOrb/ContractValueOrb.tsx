import { useRef } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { easeOutQuart, stagger, tickHoverProgress } from '../../canvas/easing';
import { CC, rgb, drawGlow } from '../../canvas/canvasUtils';
import { useCanvasLoop } from '../../canvas/useCanvasLoop';
import type { ContractValueOrbProps } from './types';

const W = 680;
const H = 220;
const COLORS = [CC.blue, CC.cyan, CC.amber, CC.purple, CC.green];
const PAD    = { left: 8, right: 64, top: 16, bottom: 38 };
const NAME_W = 88;
const BAR_H  = 18;

export function ContractValueOrb({ data, 'data-testid': testId }: ContractValueOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap  = useRef<Map<string, number>>(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  const { contractors, totals } = data;
  const n             = contractors.length;
  const maxCommitment = Math.max(...contractors.map(c => c.totalCommitment), 1);
  const barArea       = W - PAD.left - NAME_W - PAD.right;
  const gap           = n > 1 ? (H - PAD.top - PAD.bottom - n * BAR_H) / (n - 1) : 0;

  useCanvasLoop(
    canvasRef,
    W,
    H,
    (ctx, progress) => {
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      contractors.forEach((con, i) => {
        const color  = COLORS[i % COLORS.length];
        const localP = stagger(progress, i, n, easeOutQuart);
        const y      = PAD.top + i * (BAR_H + gap);
        const x0     = PAD.left + NAME_W;
        const hp     = hoverMap.current.get(con.id) ?? 0;
        const baseW  = (con.base / maxCommitment) * barArea * localP;
        const totalW = (con.totalCommitment / maxCommitment) * barArea * localP;
        const varW   = totalW - baseW;

        // Contractor name
        ctx.font         = `${hp > 0 ? 'bold ' : ''}10px 'DM Sans', sans-serif`;
        ctx.fillStyle    = hp > 0 ? color : rgb(CC.t2, 0.8);
        ctx.textAlign    = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(con.shortName, x0 - 8, y + BAR_H / 2);

        // Background track
        ctx.fillStyle = rgb(CC.bd, 0.25);
        ctx.beginPath();
        ctx.roundRect(x0, y, barArea, BAR_H, 4);
        ctx.fill();

        // Base value segment (solid, brighter)
        if (baseW > 0) {
          if (hp > 0) drawGlow(ctx, x0 + baseW / 2, y + BAR_H / 2, baseW * 0.3, color, 0.1 * hp);
          ctx.fillStyle = rgb(color, 0.5 + hp * 0.15);
          ctx.beginPath();
          ctx.roundRect(x0, y, baseW, BAR_H, 4);
          ctx.fill();
        }

        // Variation segment (lighter fill, dashed divider)
        if (varW > 2) {
          ctx.fillStyle = rgb(color, 0.22 + hp * 0.08);
          ctx.beginPath();
          ctx.roundRect(x0 + baseW, y, varW, BAR_H, [0, 4, 4, 0]);
          ctx.fill();
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = rgb(color, 0.55);
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.moveTo(x0 + baseW, y + 3);
          ctx.lineTo(x0 + baseW, y + BAR_H - 3);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Hover border
        if (hp > 0 && totalW > 0) {
          ctx.strokeStyle = rgb(color, 0.5 * hp);
          ctx.lineWidth   = 1;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.roundRect(x0, y, totalW, BAR_H, 4);
          ctx.stroke();
        }

        // £ value label that appears after bar animates in
        if (localP > 0.35) {
          const fade = Math.min(1, (localP - 0.35) / 0.4);
          ctx.globalAlpha  = fade;
          ctx.font         = `bold 9px 'JetBrains Mono', monospace`;
          ctx.fillStyle    = hp > 0 ? color : CC.t2;
          ctx.textAlign    = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(`£${con.totalCommitment}M`, x0 + totalW + 6, y + BAR_H / 2);
          ctx.globalAlpha = 1;
        }

        registerHitRect(hitZonesRef.current, con.id, x0, y, Math.max(totalW, 1), BAR_H, {
          label   : con.name,
          value   : `£${con.totalCommitment}M total`,
          sublabel: `Base £${con.base}M + Var £${con.variations}M · ${con.commitmentPct}% committed`,
          color,
        });
      });

      // Legend row
      const ly = H - 14;
      ctx.textBaseline = 'middle';
      ctx.font         = `7px 'DM Sans', sans-serif`;
      ctx.textAlign    = 'left';

      // Base swatch
      ctx.fillStyle = rgb(CC.cyan, 0.5);
      ctx.beginPath();
      ctx.roundRect(PAD.left + NAME_W, ly - 3, 14, 6, 2);
      ctx.fill();
      ctx.fillStyle = rgb(CC.t3, 0.45);
      ctx.fillText('base value', PAD.left + NAME_W + 18, ly);

      // Variation swatch
      ctx.fillStyle = rgb(CC.cyan, 0.22);
      ctx.beginPath();
      ctx.roundRect(PAD.left + NAME_W + 94, ly - 3, 14, 6, 2);
      ctx.fill();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = rgb(CC.cyan, 0.5);
      ctx.lineWidth   = 0.5;
      ctx.beginPath();
      ctx.moveTo(PAD.left + NAME_W + 101, ly - 3);
      ctx.lineTo(PAD.left + NAME_W + 101, ly + 3);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = rgb(CC.t3, 0.45);
      ctx.fillText('approved variations', PAD.left + NAME_W + 112, ly);

      // Portfolio total right-aligned
      ctx.font      = `bold 8px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillStyle = rgb(CC.t2, 0.6);
      ctx.fillText(`Portfolio: £${totals.totalCommitment}M`, W - 8, ly);
    },
    true,
    { easing: easeOutQuart },
  );

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Total contract value per contractor — horizontal bar chart"
        style={{ width: W, height: H, display: 'block', borderRadius: 8 }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
