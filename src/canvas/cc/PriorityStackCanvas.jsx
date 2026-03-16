import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function PriorityStackCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const items = useMemo(() => {
    // Step 0-1: urgency order. Step 2: impact order. Step 3: adaptive reorder
    const urgencyOrder = [
      { label: 'Casting speed reduction', role: 'Operator', urgency: 1, impact: 3, color: C.red, cost: '₹0.1 Cr' },
      { label: 'Mold level adjustment', role: 'Operator', urgency: 2, impact: 4, color: C.amber, cost: '₹0.3 Cr' },
      { label: 'Downstream notification', role: 'Supervisor', urgency: 3, impact: 5, color: C.blue, cost: '₹0.05 Cr' },
      { label: 'Grade risk assessment', role: 'Engineer', urgency: 4, impact: 1, color: C.red, cost: '₹2.1 Cr' },
      { label: 'Schedule recalculation', role: 'Scheduler', urgency: 5, impact: 2, color: C.cyan, cost: '₹1.4 Cr' },
    ];
    return urgencyOrder;
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    let raf;

    const draw = () => {
      t.current++;
      const T = t.current;
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 25);

      const stackX = w * 0.1, stackW = w * 0.8;
      const startY = h * 0.1, cardH = h * 0.12, gap = 6;

      // Determine sort order based on step
      let sorted;
      if (step <= 1) {
        sorted = [...items].sort((a, b) => a.urgency - b.urgency);
      } else if (step === 2) {
        sorted = [...items].sort((a, b) => a.impact - b.impact);
      } else {
        // Adaptive: some items demoted after recovery
        sorted = [...items].sort((a, b) => a.impact - b.impact);
        // Mark first two as demoted
        sorted[sorted.length - 1].demoted = true;
        sorted[sorted.length - 2].demoted = true;
      }

      // Header
      ctx.font = "bold 10px 'DM Sans',sans-serif";
      ctx.textAlign = 'left';
      ctx.fillStyle = C.t1;
      const headerText = step <= 1 ? 'Sorted by urgency (time sensitivity)' :
        step === 2 ? 'Re-sorted by impact (₹ consequence)' :
        'Adaptive: reshuffled after 28°C recovery';
      ctx.fillText(headerText, stackX, startY - 8);

      // Stack cards
      sorted.forEach((item, i) => {
        const y = startY + 10 + i * (cardH + gap);
        const isDemoted = step >= 3 && item.demoted;
        const alpha = isDemoted ? 0.3 : 0.8;
        const cardId = `card-${item.label}`;
        const hp = hoverMap.current.get(cardId) || 0;

        // Card background
        ctx.fillStyle = rgb(C.sf, (0.5 + hp * 0.3) * alpha);
        ctx.beginPath();
        ctx.roundRect(stackX, y, stackW, cardH, 8);
        ctx.fill();
        ctx.strokeStyle = rgb(item.color, (0.2 + hp * 0.3) * alpha);
        ctx.lineWidth = 1 + hp;
        ctx.stroke();

        // Hover glow
        if (hp > 0) {
          drawGlow(ctx, stackX + stackW / 2, y + cardH / 2, stackW * 0.3 * hp, item.color, 0.08 * hp);
        }

        // Register hit zone for the card
        registerHitRect(hitZonesRef.current, cardId, stackX, y, stackW, cardH, {
          label: item.label,
          value: `${item.role} · ${item.cost}`,
          sublabel: `Urgency: ${item.urgency} · Impact: ${item.impact}`,
          color: item.color,
        });

        // Priority number
        const numR = 12;
        if (i === 0) drawGlow(ctx, stackX + 20, y + cardH / 2, 24, item.color, 0.15);
        ctx.beginPath();
        ctx.arc(stackX + 20, y + cardH / 2, numR, 0, Math.PI * 2);
        ctx.fillStyle = rgb(item.color, 0.2 * alpha);
        ctx.fill();
        ctx.font = "bold 12px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(item.color, 0.8 * alpha);
        ctx.fillText(`${i + 1}`, stackX + 20, y + cardH / 2);

        // Label
        ctx.font = "10px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.t1, alpha);
        ctx.fillText(item.label, stackX + 42, y + cardH / 2 - 6);

        // Role + cost
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.5 * alpha);
        ctx.fillText(`${item.role} · ${item.cost}`, stackX + 42, y + cardH / 2 + 8);

        // Cost bar (impact sort)
        if (step >= 2) {
          const barX = stackX + stackW - w * 0.2 - 8;
          const barW = w * 0.2;
          const costNorm = parseFloat(item.cost.replace(/[₹, Cr]/g, '')) / 2.1;

          ctx.fillStyle = rgb(C.bd, 0.15 * alpha);
          ctx.beginPath();
          ctx.roundRect(barX, y + cardH / 2 - 3, barW, 6, 3);
          ctx.fill();
          ctx.fillStyle = rgb(item.color, (0.4 + hp * 0.2) * alpha);
          ctx.beginPath();
          ctx.roundRect(barX, y + cardH / 2 - 3, barW * costNorm, 6, 3);
          ctx.fill();
        }

        // Demoted strikethrough
        if (isDemoted) {
          ctx.beginPath();
          ctx.moveTo(stackX + 40, y + cardH / 2);
          ctx.lineTo(stackX + 200, y + cardH / 2);
          ctx.strokeStyle = rgb(C.t3, 0.2);
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.font = "7px 'JetBrains Mono',monospace";
          ctx.textAlign = 'right';
          ctx.fillStyle = rgb(C.green, 0.5);
          ctx.fillText('DEMOTED', stackX + stackW - 8, y + cardH / 2);
        }
      });

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, items]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
