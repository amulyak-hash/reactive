import { useRef, useEffect } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { stagger, tickHoverProgress, easeOutCubic } from '../../canvas/easing';
import { CC, PALETTE, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import type { WeeklyFlowProps } from './types';

const W = 800;
const H = 360;

export function WeeklyFlow({ contractors, 'data-testid': testId }: WeeklyFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 80;

    // ── Layout constants ─────────────────────────────────────────────────────
    const col1X  = 100;
    const col2X  = 420;
    const col3X  = 720;
    const nodeW  = 110;
    const padT   = 20;
    const padB   = 26;
    const nodeGap = 6; // gap between contractor nodes

    const totalBase  = contractors.reduce((s, c) => s + c.base, 0);
    const totalVar   = contractors.reduce((s, c) => s + c.variations, 0);
    const grandTotal = contractors.reduce((s, c) => s + c.totalCommitment, 0);

    // ── Contractor nodes — proportional heights (Sankey) ─────────────────────
    const availH      = H - padT - padB;
    const totalGaps   = nodeGap * (contractors.length - 1);
    const flowableH   = availH - totalGaps;

    let cumNodeY = padT;
    const contNodes = contractors.map((c, i) => {
      const nh   = Math.max(24, (c.totalCommitment / grandTotal) * flowableH);
      const node = {
        x    : col1X - nodeW / 2,
        y    : cumNodeY,
        h    : nh,
        cy   : cumNodeY + nh / 2,
        c,
        color: PALETTE[i % PALETTE.length],
      };
      cumNodeY += nh + nodeGap;
      return node;
    });

    // ── Mid nodes — proportional to base/var share of grand total ────────────
    const gapMid      = 14;
    const midFlowH    = flowableH - gapMid;
    const baseH       = Math.max(28, (totalBase / grandTotal) * midFlowH);
    const varH        = Math.max(18, (totalVar  / grandTotal) * midFlowH);
    const totalMidH   = baseH + varH + gapMid;
    const midStartY   = padT + (availH - totalMidH) / 2;
    const baseNode    = { x: col2X - nodeW / 2, y: midStartY,                h: baseH, cy: midStartY + baseH / 2 };
    const varNode     = { x: col2X - nodeW / 2, y: midStartY + baseH + gapMid, h: varH,  cy: midStartY + baseH + gapMid + varH / 2 };

    // ── Total node — spans full available height ──────────────────────────────
    const totalNode = { x: col3X - nodeW / 2, y: padT, h: availH, cy: padT + availH / 2 };

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP     = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      // ── Contractor → mid node flows ──────────────────────────────────────
      contractors.forEach((c, i) => {
        const cn     = contNodes[i];
        const localP = stagger(progress, i, contractors.length, easeOutCubic);
        const hp     = hoverMap.current.get(c.id) ?? 0;
        if (localP < 0.01) return;

        // Proportional bands within the contractor node
        const baseFrac    = c.base       / c.totalCommitment;
        const varFrac     = c.variations / c.totalCommitment;
        const baseBandH   = cn.h * baseFrac;
        const varBandH    = cn.h * varFrac;

        // Source Y: center of each band within the contractor node
        const baseSourceY = cn.y + baseBandH / 2;
        const varSourceY  = cn.y + baseBandH + varBandH / 2;

        // Destination Y: proportional slice within mid nodes
        const baseFlowH    = Math.max(2, (c.base       / totalBase) * baseH);
        const varFlowH     = Math.max(2, (c.variations / totalVar)  * varH);
        const bActualEndY  = baseNode.y + contractors.slice(0, i).reduce((s, cc) => s + (cc.base       / totalBase) * baseH, 0) + baseFlowH / 2;
        const vActualEndY  = varNode.y  + contractors.slice(0, i).reduce((s, cc) => s + (cc.variations / totalVar)  * varH,  0) + varFlowH  / 2;

        const alpha = hp * 0.2 + 0.18;
        drawBezierFlow(ctx, cn.x + nodeW, baseSourceY, col2X - nodeW / 2, bActualEndY, baseFlowH * localP, cn.color, alpha);
        drawBezierFlow(ctx, cn.x + nodeW, varSourceY,  col2X - nodeW / 2, vActualEndY, varFlowH  * localP, cn.color, alpha * 0.75);
      });

      // ── Mid → Total flows ────────────────────────────────────────────────
      if (progress > 0.3) {
        const fp       = Math.min(1, (progress - 0.3) / 0.7);
        const baseDstY = totalNode.y + (totalBase / grandTotal) * availH / 2;
        const varDstY  = totalNode.y + availH - (totalVar / grandTotal) * availH / 2;
        drawBezierFlow(ctx, col2X + nodeW / 2, baseNode.cy, col3X - nodeW / 2, baseDstY, baseH * fp, CC.blue,  0.25 * fp);
        drawBezierFlow(ctx, col2X + nodeW / 2, varNode.cy,  col3X - nodeW / 2, varDstY,  varH  * fp, CC.amber, 0.22 * fp);
      }

      // ── Column labels ────────────────────────────────────────────────────
      ['Contractors', 'Components', 'Total'].forEach((label, ci) => {
        const x = [col1X, col2X, col3X][ci];
        ctx.font      = "9px 'JetBrains Mono', monospace";
        ctx.fillStyle = rgb(CC.t3, 0.5);
        ctx.textAlign = 'center';
        ctx.fillText(label, x, H - 8);
      });

      // ── Contractor nodes ─────────────────────────────────────────────────
      contractors.forEach((c, i) => {
        const cn     = contNodes[i];
        const localP = stagger(progress, i, contractors.length, easeOutCubic);
        const hp     = hoverMap.current.get(c.id) ?? 0;

        registerHitRect(hitZonesRef.current, c.id, cn.x, cn.y, nodeW, cn.h, {
          label   : c.name,
          value   : `£${c.totalCommitment}M total commitment`,
          sublabel: `Base £${c.base}M  +  Variations £${c.variations}M`,
          color   : cn.color,
        });

        if (hp > 0) drawGlow(ctx, cn.x + nodeW / 2, cn.cy, nodeW * 0.6, cn.color, 0.12 * hp);

        ctx.fillStyle   = rgb(cn.color, (0.3 + hp * 0.15) * localP);
        ctx.strokeStyle = rgb(cn.color, (0.55 + hp * 0.25) * localP);
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.roundRect(cn.x, cn.y, nodeW * localP, cn.h, 4);
        ctx.fill();
        ctx.stroke();

        if (localP > 0.6 && cn.h >= 24) {
          const fade = Math.min(1, (localP - 0.6) / 0.4);
          ctx.globalAlpha  = fade;
          ctx.font         = `${hp > 0 ? 'bold ' : ''}9px 'JetBrains Mono', monospace`;
          ctx.fillStyle    = hp > 0 ? cn.color : rgb(CC.t2, 0.9);
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(c.shortName, cn.x + nodeW / 2, cn.h >= 36 ? cn.cy - 5 : cn.cy);
          if (cn.h >= 36) {
            ctx.font      = "8px 'JetBrains Mono', monospace";
            ctx.fillStyle = rgb(CC.t3, 0.8);
            ctx.fillText(`£${c.totalCommitment}M`, cn.x + nodeW / 2, cn.cy + 7);
          }
          ctx.globalAlpha  = 1;
          ctx.textBaseline = 'alphabetic';
        }
      });

      // ── Mid nodes ────────────────────────────────────────────────────────
      if (progress > 0.2) {
        const fp = Math.min(1, (progress - 0.2) / 0.4);

        drawGlow(ctx, col2X, baseNode.cy, 30, CC.blue, 0.1 * fp);
        ctx.fillStyle   = rgb(CC.blue, 0.3 * fp);
        ctx.strokeStyle = rgb(CC.blue, 0.5 * fp);
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.roundRect(baseNode.x, baseNode.y, nodeW, baseNode.h * fp, 4);
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha  = fp;
        ctx.textBaseline = 'middle';
        ctx.font         = "bold 9px 'JetBrains Mono', monospace";
        ctx.fillStyle    = CC.blue;
        ctx.textAlign    = 'center';
        ctx.fillText('Base Value', col2X, baseNode.cy - 6);
        ctx.font         = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle    = CC.t1;
        ctx.fillText(`£${totalBase}M`, col2X, baseNode.cy + 8);
        ctx.globalAlpha  = 1;
        ctx.textBaseline = 'alphabetic';

        drawGlow(ctx, col2X, varNode.cy, 24, CC.amber, 0.1 * fp);
        ctx.fillStyle   = rgb(CC.amber, 0.22 * fp);
        ctx.strokeStyle = rgb(CC.amber, 0.4  * fp);
        ctx.beginPath();
        ctx.roundRect(varNode.x, varNode.y, nodeW, varNode.h * fp, 4);
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha  = fp;
        ctx.textBaseline = 'middle';
        ctx.font         = "bold 9px 'JetBrains Mono', monospace";
        ctx.fillStyle    = CC.amber;
        ctx.textAlign    = 'center';
        ctx.fillText('Variations', col2X, varNode.cy - 4);
        ctx.font         = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle    = CC.t1;
        ctx.fillText(`£${totalVar}M`, col2X, varNode.cy + 8);
        ctx.globalAlpha  = 1;
        ctx.textBaseline = 'alphabetic';
      }

      // ── Total node ───────────────────────────────────────────────────────
      if (progress > 0.5) {
        const fp = Math.min(1, (progress - 0.5) / 0.5);
        drawGlow(ctx, col3X, totalNode.cy, 44, CC.cyan, 0.2 * fp);
        ctx.fillStyle   = rgb(CC.cyan, 0.25 * fp);
        ctx.strokeStyle = rgb(CC.cyan, 0.6  * fp);
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.roundRect(totalNode.x, totalNode.y, nodeW, totalNode.h * fp, 6);
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha  = fp;
        ctx.textBaseline = 'middle';
        ctx.font         = "9px 'JetBrains Mono', monospace";
        ctx.fillStyle    = CC.t2;
        ctx.textAlign    = 'center';
        ctx.fillText('Total Commitment', col3X, totalNode.cy - 12);
        ctx.font         = "bold 16px 'JetBrains Mono', monospace";
        ctx.fillStyle    = CC.cyan;
        ctx.fillText(`£${grandTotal}M`, col3X, totalNode.cy + 6);
        ctx.globalAlpha  = 1;
        ctx.textBaseline = 'alphabetic';
      }

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
        aria-label="Weekly report flow — base value and variations per contractor flowing to total commitment"
        style={{ width: W, height: H, display: 'block' }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}

function drawBezierFlow(
  ctx      : CanvasRenderingContext2D,
  x1       : number, y1: number,
  x2       : number, y2: number,
  thickness: number,
  color    : string,
  alpha    : number,
): void {
  const cpX = (x1 + x2) / 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1 - thickness / 2);
  ctx.bezierCurveTo(cpX, y1 - thickness / 2, cpX, y2 - thickness / 2, x2, y2 - thickness / 2);
  ctx.lineTo(x2, y2 + thickness / 2);
  ctx.bezierCurveTo(cpX, y2 + thickness / 2, cpX, y1 + thickness / 2, x1, y1 + thickness / 2);
  ctx.closePath();
  ctx.fillStyle = rgb(color, alpha);
  ctx.fill();
}
