import { useRef, useEffect } from 'react';

import { setupCanvas, CC, rgb, drawGlow } from '../../canvas/canvasUtils';
import { easeOutCubic } from '../../canvas/easing';
import type { NCEInsightPanelsProps } from './types';
import type { NCEBudgetInsight, NCEEWInsight } from '../../types';

const W = 460;
const PANEL_H_BUDGET = 126;
const PANEL_H_EW = 120;
const PANEL_GAP = 12;
const H = PANEL_H_BUDGET + PANEL_GAP + PANEL_H_EW;
const PANEL_R = 6;

const MONO = "'JetBrains Mono', monospace";
const SANS = "'DM Sans', sans-serif";

function drawBudgetPanel(ctx: CanvasRenderingContext2D, b: NCEBudgetInsight, x: number, y: number, w: number, h: number, progress: number, T: number) {
  ctx.fillStyle = rgb(CC.sf, 0.6 * progress);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, PANEL_R);
  ctx.fill();
  ctx.strokeStyle = rgb(CC.bd, 0.5 * progress);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, PANEL_R);
  ctx.stroke();
  ctx.fillStyle = rgb(CC.blue, 0.7 * progress);
  ctx.fillRect(x, y, w, 2);

  const pad = 16;
  const ix = x + pad;
  const iw = w - pad * 2;

  // Row 1: Title + budget
  ctx.font = `bold 8px ${MONO}`;
  ctx.fillStyle = rgb(CC.t3, progress);
  ctx.textAlign = 'left';
  ctx.fillText('BUDGET IMPACT', ix, y + 24);

  ctx.font = `bold 20px ${MONO}`;
  ctx.fillStyle = rgb(CC.blue, progress);
  ctx.textAlign = 'right';
  ctx.fillText(`£${b.overallBudget}M`, ix + iw, y + 24);

  // Row 2: Contractors
  ctx.font = `10px ${SANS}`;
  ctx.fillStyle = rgb(CC.t2, progress);
  ctx.textAlign = 'left';
  ctx.fillText(`${b.contractorsWithNCE} of ${b.totalContractors} contractors raised NCEs`, ix, y + 48);

  // Row 3: Split bar
  const barY = y + 58;
  const barH = 10;
  const implPct = b.implementedNCEs / b.totalNCEs;

  ctx.fillStyle = rgb(CC.t4, 0.15 * progress);
  ctx.beginPath();
  ctx.roundRect(ix, barY, iw, barH, 4);
  ctx.fill();

  const implW = iw * implPct * progress;
  ctx.fillStyle = rgb(CC.green, 0.65 * progress);
  ctx.beginPath();
  ctx.roundRect(ix, barY, implW, barH, [4, 0, 0, 4]);
  ctx.fill();
  ctx.fillStyle = rgb(CC.amber, 0.45 * progress);
  ctx.beginPath();
  ctx.roundRect(ix + implW, barY, (iw - implW) * progress, barH, [0, 4, 4, 0]);
  ctx.fill();

  // Row 4: Bar labels
  const labelY = barY + barH + 16;
  ctx.font = `bold 9px ${MONO}`;
  ctx.fillStyle = rgb(CC.green, 0.9 * progress);
  ctx.textAlign = 'left';
  ctx.fillText(`${b.implementedNCEs} accepted`, ix, labelY);
  ctx.fillStyle = rgb(CC.amber, 0.9 * progress);
  ctx.textAlign = 'right';
  ctx.fillText(`${b.pendingNCEs} pending`, ix + iw, labelY);

  // Row 5: Deviation
  const devY = labelY + 22;
  drawGlow(ctx, ix + 24, devY, 22, CC.red, 0.06 * progress + Math.sin(T * 0.04) * 0.02);
  ctx.font = `bold 16px ${MONO}`;
  ctx.fillStyle = rgb(CC.red, progress);
  ctx.textAlign = 'left';
  ctx.fillText(`£${b.valueDeviation}M`, ix, devY + 4);
  ctx.font = `10px ${SANS}`;
  ctx.fillStyle = rgb(CC.t3, progress);
  ctx.fillText('value deviation', ix + 86, devY + 4);
}

function drawEWPanel(ctx: CanvasRenderingContext2D, ew: NCEEWInsight, x: number, y: number, w: number, h: number, progress: number, T: number) {
  ctx.fillStyle = rgb(CC.sf, 0.6 * progress);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, PANEL_R);
  ctx.fill();
  ctx.strokeStyle = rgb(CC.bd, 0.5 * progress);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, PANEL_R);
  ctx.stroke();
  ctx.fillStyle = rgb(CC.purple, 0.7 * progress);
  ctx.fillRect(x, y, w, 2);

  const pad = 16;
  const ix = x + pad;
  const iw = w - pad * 2;

  // Row 1: Title + conversion
  ctx.font = `bold 8px ${MONO}`;
  ctx.fillStyle = rgb(CC.t3, progress);
  ctx.textAlign = 'left';
  ctx.fillText('EW \u2192 NCE PIPELINE', ix, y + 20);

  const convRate = ((ew.ewConvertedToNCE / ew.totalEWs) * 100).toFixed(0);
  ctx.font = `bold 11px ${MONO}`;
  ctx.fillStyle = rgb(CC.amber, progress);
  ctx.textAlign = 'right';
  ctx.fillText(`${convRate}% conversion`, ix + iw, y + 20);

  // Funnel — three nodes horizontally centered
  const funnelY = y + 68;
  const nodeR = 22;
  const stepW = iw / 3;

  const nodes = [
    { value: String(ew.totalEWs), label: 'EWs identified', color: CC.purple, cx: ix + stepW * 0.5 },
    { value: String(ew.ewConvertedToNCE), label: 'became NCEs', color: CC.amber, cx: ix + stepW * 1.5 },
    { value: `£${ew.budgetVariation}M`, label: 'budget impact', color: CC.red, cx: ix + stepW * 2.5 },
  ];

  // Arrows
  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i];
    const to = nodes[i + 1];
    ctx.beginPath();
    ctx.moveTo(from.cx + nodeR + 4, funnelY);
    ctx.lineTo(to.cx - nodeR - 8, funnelY);
    ctx.strokeStyle = rgb(CC.t4, 0.35 * progress);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const ax = to.cx - nodeR - 8;
    ctx.beginPath();
    ctx.moveTo(ax, funnelY - 4);
    ctx.lineTo(ax + 6, funnelY);
    ctx.lineTo(ax, funnelY + 4);
    ctx.fillStyle = rgb(CC.t4, 0.4 * progress);
    ctx.fill();
  }

  // Nodes
  nodes.forEach((node, i) => {
    drawGlow(ctx, node.cx, funnelY, nodeR * 2.2, node.color, (0.07 + (i === 2 ? Math.sin(T * 0.04) * 0.03 : 0)) * progress);
    ctx.beginPath();
    ctx.arc(node.cx, funnelY, nodeR * progress, 0, Math.PI * 2);
    ctx.fillStyle = rgb(node.color, 0.12 * progress);
    ctx.fill();
    ctx.strokeStyle = rgb(node.color, 0.5 * progress);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `bold ${i === 2 ? 10 : 14}px ${MONO}`;
    ctx.fillStyle = rgb(node.color, progress);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, node.cx, funnelY);
    ctx.textBaseline = 'alphabetic';

    ctx.font = `8px ${SANS}`;
    ctx.fillStyle = rgb(CC.t3, progress);
    ctx.fillText(node.label, node.cx, funnelY + nodeR + 14);
  });
}

export function NCEInsightPanels({ budget, ew, 'data-testid': testId }: NCEInsightPanelsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 60;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);

      const budgetP = easeOutCubic(Math.max(0, Math.min(progress / 0.7, 1)));
      const ewP = easeOutCubic(Math.max(0, Math.min((progress - 0.15) / 0.7, 1)));

      drawBudgetPanel(ctx, budget, 0, 0, W, PANEL_H_BUDGET, budgetP, T);
      drawEWPanel(ctx, ew, 0, PANEL_H_BUDGET + PANEL_GAP, W, PANEL_H_EW, ewP, T);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [budget, ew]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Budget impact and Early Warning to NCE pipeline insight panels"
        style={{ width: W, height: H, display: 'block' }}
      />
    </div>
  );
}
