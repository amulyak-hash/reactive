import { useRef, useEffect } from 'react';

import { setupCanvas, CC, rgb, drawGlow } from '../../canvas/canvasUtils';
import { easeOutCubic } from '../../canvas/easing';
import type { NCETopContractorsProps } from './types';
import type { NCETopContractor } from '../../types';

const W = 1140;
const H = 230;
const CARD_GAP = 16;

const MONO = "'JetBrains Mono', monospace";
const SANS = "'DM Sans', sans-serif";

function drawContractorCard(
  ctx: CanvasRenderingContext2D,
  c: NCETopContractor,
  x: number, y: number, cardW: number, cardH: number,
  progress: number, _T: number, maxNCE: number, maxVar: number,
) {
  // Card bg
  ctx.fillStyle = rgb(CC.sf, 0.6 * progress);
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 7);
  ctx.fill();
  ctx.strokeStyle = rgb(CC.bd, 0.4 * progress);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 7);
  ctx.stroke();

  const pad = 14;
  const ix = x + pad;
  const iw = cardW - pad * 2;

  // ─── Header: Name + NCE badge + Budget variation ───
  ctx.font = `bold 12px ${SANS}`;
  ctx.fillStyle = rgb(CC.t1, progress);
  ctx.textAlign = 'left';
  ctx.fillText(c.name, ix, y + 20);

  // NCE badge
  const badgeText = `${c.nceCount} NCE`;
  ctx.font = `bold 9px ${MONO}`;
  const badgeTW = ctx.measureText(badgeText).width + 12;
  const badgeX = ix + iw - badgeTW;
  ctx.fillStyle = rgb(CC.red, 0.15 * progress);
  ctx.beginPath();
  ctx.roundRect(badgeX, y + 8, badgeTW, 17, 4);
  ctx.fill();
  ctx.fillStyle = rgb(CC.red, 0.9 * progress);
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, badgeX + badgeTW / 2, y + 20);

  // ─── Per-project breakdown ───
  const projStartY = y + 36;
  ctx.font = `bold 7px ${MONO}`;
  ctx.fillStyle = rgb(CC.t3, 0.7 * progress);
  ctx.textAlign = 'left';
  ctx.fillText('PER PROJECT', ix, projStartY);

  const projLabelW = 90;
  const projCountW = 24;
  const projBarArea = iw - projLabelW - projCountW - 8;
  const maxProjNCE = Math.max(...c.projects.map(p => p.nceCount), 1);
  const rowH = 18;

  c.projects.forEach((proj, pi) => {
    const py = projStartY + 10 + pi * rowH;
    const projP = Math.max(0, Math.min((progress - pi * 0.06) / 0.6, 1));
    if (projP < 0.01) return;

    ctx.globalAlpha = projP;

    // Project name
    ctx.font = `9px ${SANS}`;
    ctx.fillStyle = proj.nceCount > 0 ? rgb(CC.t2, projP) : rgb(CC.t4, projP);
    ctx.textAlign = 'left';
    ctx.fillText(proj.projectName, ix, py + 10);

    // Mini bar
    const barX = ix + projLabelW;
    const barH = 7;
    const barW = proj.nceCount > 0 ? projBarArea * (proj.nceCount / maxProjNCE) * projP : 0;
    const projColor = proj.nceCount >= 3 ? CC.red : proj.nceCount >= 2 ? CC.amber : proj.nceCount > 0 ? CC.cyan : CC.t4;

    // Track
    ctx.fillStyle = rgb(CC.t4, 0.08 * projP);
    ctx.beginPath();
    ctx.roundRect(barX, py + 3, projBarArea, barH, 2);
    ctx.fill();

    // Fill
    if (barW > 0) {
      ctx.fillStyle = rgb(projColor, 0.6 * projP);
      ctx.beginPath();
      ctx.roundRect(barX, py + 3, barW, barH, 2);
      ctx.fill();
    }

    // Count value
    ctx.font = `bold 9px ${MONO}`;
    ctx.fillStyle = rgb(proj.nceCount > 0 ? projColor : CC.t4, 0.9 * projP);
    ctx.textAlign = 'right';
    ctx.fillText(proj.nceCount > 0 ? String(proj.nceCount) : '-', ix + iw, py + 10);

    ctx.globalAlpha = 1;
  });

  // ─── Bottom: Contract value → Deviated → Variation with bar ───
  const deviatedValue = c.contractValue + c.budgetVariation;
  const varPct = Math.min(c.budgetVariation / maxVar, 1);
  const barColor = varPct > 0.6 ? CC.red : varPct > 0.3 ? CC.amber : CC.green;
  const contractPct = ((c.budgetVariation / c.contractValue) * 100).toFixed(0);

  const bottomTopY = y + cardH - 50;

  // Row: contract value → deviated value → variation
  // Contract value (left)
  ctx.font = `bold 10px ${MONO}`;
  ctx.fillStyle = rgb(CC.blue, progress);
  ctx.textAlign = 'left';
  ctx.fillText(`£${c.contractValue}M`, ix, bottomTopY);
  ctx.font = `7px ${SANS}`;
  ctx.fillStyle = rgb(CC.t4, progress);
  ctx.fillText('contract', ix, bottomTopY + 11);

  // Arrow
  const arrowX = ix + 72;
  ctx.font = `10px ${SANS}`;
  ctx.fillStyle = rgb(CC.t4, 0.6 * progress);
  ctx.textAlign = 'center';
  ctx.fillText('\u2192', arrowX, bottomTopY);

  // Deviated value (center)
  const devX = arrowX + 16;
  ctx.font = `bold 10px ${MONO}`;
  ctx.fillStyle = rgb(CC.t1, progress);
  ctx.textAlign = 'left';
  ctx.fillText(`£${deviatedValue.toFixed(1)}M`, devX, bottomTopY);
  ctx.font = `7px ${SANS}`;
  ctx.fillStyle = rgb(CC.t4, progress);
  ctx.fillText('after NCE', devX, bottomTopY + 11);

  // Variation (right-aligned, prominent)
  ctx.font = `bold 11px ${MONO}`;
  ctx.fillStyle = rgb(barColor, progress);
  ctx.textAlign = 'right';
  ctx.fillText(`+£${c.budgetVariation}M (${contractPct}%)`, ix + iw, bottomTopY);
  ctx.font = `7px ${SANS}`;
  ctx.fillStyle = rgb(CC.t4, progress);
  ctx.textAlign = 'right';
  ctx.fillText('variation', ix + iw, bottomTopY + 11);

  // Bar
  const bottomBarY = bottomTopY + 18;
  const bottomBarH = 6;
  ctx.fillStyle = rgb(CC.t4, 0.1 * progress);
  ctx.beginPath();
  ctx.roundRect(ix, bottomBarY, iw, bottomBarH, 3);
  ctx.fill();

  const filledW = iw * varPct * progress;
  ctx.fillStyle = rgb(barColor, 0.6 * progress);
  ctx.beginPath();
  ctx.roundRect(ix, bottomBarY, filledW, bottomBarH, 3);
  ctx.fill();
}

export function NCETopContractors({ topContractors, 'data-testid': testId }: NCETopContractorsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  const maxNCE = Math.max(...topContractors.map(c => c.nceCount));
  const maxVar = Math.max(...topContractors.map(c => c.budgetVariation));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 60;
    const n = topContractors.length;
    const cardW = (W - CARD_GAP * (n - 1)) / n;
    const cardH = H - 8;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);

      topContractors.forEach((c, i) => {
        const cardX = i * (cardW + CARD_GAP);
        const cardY = 4;
        const localP = Math.max(0, Math.min((progress - i * 0.1) / 0.7, 1));
        const easedP = easeOutCubic(localP);
        if (easedP < 0.01) return;

        drawContractorCard(ctx, c, cardX, cardY, cardW, cardH, easedP, T, maxNCE, maxVar);
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [topContractors, maxNCE, maxVar]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Top 3 contractors showing overall and per-project NCE breakdown with budget variation"
        style={{ width: W, height: H, display: 'block' }}
      />
    </div>
  );
}
