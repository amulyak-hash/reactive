import { useRef, useEffect, useState } from 'react';
import { C, rgb } from '../../theme/tokens';
import { setupCanvas, drawGlow, drawDust, drawScanline } from '../utils';
import { easeOutCubic, easeOutBack, stagger } from '../easing';
import Tooltip from './Tooltip';

export default function NCEStackedBars({ width, height, data, accent, activeKey, dimOthers, onVizHover, onVizClick }) {
  const canvasRef = useRef(null);
  const startRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const activeKeyRef = useRef(activeKey);
  const dimRef = useRef(dimOthers);
  const [tooltip, setTooltip] = useState(null);

  activeKeyRef.current = activeKey;
  dimRef.current = dimOthers;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    startRef.current = performance.now();
    const hitRects = [];

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      let found = null;
      for (const h of hitRects) {
        if (mouseRef.current.x >= h.x && mouseRef.current.x <= h.x + h.w && mouseRef.current.y >= h.y && mouseRef.current.y <= h.y + h.h) { found = h; break; }
      }
      setTooltip(found ? { x: found.x + found.w, y: found.y + found.h / 2, text: found.label } : null);
      if (onVizHover) onVizHover(found?.linkKey ?? null);
    };
    const onClick = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      let found = null;
      for (const h of hitRects) {
        if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) { found = h; break; }
      }
      if (onVizClick) onVizClick(found?.linkKey ?? null);
    };
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 }; setTooltip(null); if (onVizHover) onVizHover(null); };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const draw = () => {
      const T = performance.now();
      const elapsed = T - startRef.current;
      const progress = Math.min(elapsed / 1600, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      hitRects.length = 0;

      const { contractors, totals } = data;
      const leftPad = 110, rightPad = 80, topPad = 16, bottomPad = 16;
      const chartW = width - leftPad - rightPad;
      const barH = 28;
      const gap = 14;
      const totalH = contractors.length * (barH + gap) - gap;
      const startY = topPad + (height - topPad - bottomPad - totalH) / 2;
      const maxVal = Math.max(...contractors.map(c => c.originalValue + c.nceVariation));
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const ak = activeKeyRef.current;
      const dim = dimRef.current;

      // Bars
      contractors.forEach((c, i) => {
        const s = stagger(progress, i, contractors.length);
        const y = startY + i * (barH + gap);
        const isLinked = ak === c.name;
        const rowDim = dim && !isLinked ? 0.3 : 1;
        const isHovered = my >= y && my <= y + barH && mx >= leftPad && mx <= width - rightPad;

        // Original contract bar
        const origW = (c.originalValue / maxVal) * chartW * easeOutCubic(s);
        ctx.globalAlpha = s * rowDim * (isHovered || isLinked ? 0.7 : 0.4);
        ctx.fillStyle = c.color;
        ctx.beginPath(); ctx.roundRect(leftPad, y, origW, barH, 6); ctx.fill();

        // NCE variation segment (stacked)
        const nceW = (c.nceVariation / maxVal) * chartW * easeOutCubic(s);
        const nceX = leftPad + origW;
        const pct = ((c.nceVariation / c.originalValue) * 100).toFixed(1);
        const nceColor = parseFloat(pct) > 20 ? C.red : parseFloat(pct) > 12 ? C.orange : C.amber;

        ctx.globalAlpha = s * rowDim * (isHovered || isLinked ? 0.95 : 0.75);
        ctx.fillStyle = nceColor;
        ctx.beginPath(); ctx.roundRect(nceX, y, nceW, barH, [0, 6, 6, 0]); ctx.fill();

        // Glow for high-variation contractors
        if (parseFloat(pct) > 20) {
          const pulse = 0.3 + 0.2 * Math.sin(T * 0.004 + i);
          drawGlow(ctx, nceX + nceW / 2, y + barH / 2, nceW * 0.6, C.red, 0.08 * pulse * s * rowDim);
        }

        // Highlight border
        if (isHovered || isLinked) {
          ctx.strokeStyle = isLinked ? '#fff' : 'rgba(255,255,255,0.4)';
          ctx.lineWidth = isLinked ? 2 : 1.5;
          ctx.globalAlpha = s * 0.7;
          ctx.beginPath(); ctx.roundRect(leftPad, y, origW + nceW, barH, 6); ctx.stroke();
        }

        // Contractor name (left)
        ctx.globalAlpha = s * rowDim;
        ctx.font = `${isLinked ? 700 : 600} 11px "Satoshi", sans-serif`;
        ctx.fillStyle = isLinked ? '#fff' : C.t2;
        ctx.textAlign = 'right';
        ctx.fillText(c.name, leftPad - 8, y + barH / 2 + 4);

        // Values inside bars
        if (origW > 50 && s > 0.5) {
          ctx.globalAlpha = s * rowDim * 0.8;
          ctx.font = '700 10px "Satoshi", sans-serif';
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
          ctx.fillText(`£${c.originalValue.toFixed(1)}M`, leftPad + origW / 2, y + barH / 2 + 4);
        }

        if (nceW > 30 && s > 0.5) {
          ctx.globalAlpha = s * rowDim;
          ctx.font = '700 9px "Satoshi", sans-serif';
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
          ctx.fillText(`+£${c.nceVariation.toFixed(1)}M`, nceX + nceW / 2, y + barH / 2 + 4);
        }

        // Percentage label (right side)
        ctx.globalAlpha = s * rowDim;
        ctx.font = '700 11px "SFMono-Regular", monospace';
        ctx.fillStyle = nceColor;
        ctx.textAlign = 'left';
        ctx.fillText(`${pct}%`, leftPad + origW + nceW + 8, y + barH / 2 + 4);

        // NCE count badge
        ctx.font = '500 9px "Satoshi", sans-serif';
        ctx.fillStyle = C.t4;
        ctx.fillText(`${c.nceCount} NCEs`, leftPad + origW + nceW + 8, y + barH / 2 + 16);

        // Hit areas
        hitRects.push({
          x: leftPad, y, w: origW + nceW, h: barH,
          linkKey: c.name,
          label: `${c.name}: £${c.originalValue.toFixed(1)}M contract + £${c.nceVariation.toFixed(1)}M NCE (${pct}%) — ${c.nceCount} NCEs`,
        });
      });

      ctx.globalAlpha = 1;
      drawDust(ctx, width, height, T, 15, 'rgba(80,120,160,.03)');
      drawScanline(ctx, width, height, T, 0.008);
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('click', onClick); canvas.removeEventListener('mouseleave', onLeave); };
  }, [width, height, data]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width, height, borderRadius: 8, cursor: 'crosshair' }} />
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} text={tooltip.text} />}
    </div>
  );
}
