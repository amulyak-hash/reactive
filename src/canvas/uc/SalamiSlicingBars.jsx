import { useRef, useEffect, useState } from 'react';
import { C } from '../../theme/tokens';
import { setupCanvas, drawDust, drawScanline } from '../utils';
import { easeOutCubic, stagger } from '../easing';
import Tooltip from './Tooltip';

const SEGMENT_COLORS = [C.amber, C.orange, C.cyan, C.blue, C.purple];

export default function SalamiSlicingBars({ width, height, data, accent }) {
  const canvasRef = useRef(null);
  const startRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    startRef.current = performance.now();
    const hitRects = [];

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      let found = null;
      for (const h of hitRects) { if (mouseRef.current.x >= h.x && mouseRef.current.x <= h.x + h.w && mouseRef.current.y >= h.y && mouseRef.current.y <= h.y + h.h) { found = h; break; } }
      setTooltip(found ? { x: found.x + found.w / 2, y: found.y - 6, text: found.label } : null);
    };
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 }; setTooltip(null); };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const draw = () => {
      const T = performance.now();
      const elapsed = T - startRef.current;
      const progress = Math.min(elapsed / 1500, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      hitRects.length = 0;

      const { contractors, months, values, threshold } = data;
      const leftPad = 100, rightPad = 16, topPad = 20, bottomPad = 30;
      const chartW = width - leftPad - rightPad, chartH = height - topPad - bottomPad;
      const cumulatives = contractors.map((_, ci) => values[ci].reduce((s, v) => s + v, 0));
      const maxVal = Math.max(...cumulatives, threshold * 2) * 1.1;
      const barGroupW = chartW / months.length;
      const barW = barGroupW / (contractors.length + 1);
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      ctx.font = '600 9px "Satoshi", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = C.t3;
      months.forEach((m, j) => ctx.fillText(m, leftPad + j * barGroupW + barGroupW / 2, height - 8));

      contractors.forEach((c, ci) => {
        const s = stagger(progress, ci, contractors.length);
        let cumTotal = 0;

        months.forEach((_, mi) => {
          const val = values[ci][mi];
          if (val === 0) { cumTotal += val; return; }
          const x = leftPad + mi * barGroupW + ci * barW + 2;
          const barH = (val / maxVal) * chartH * easeOutCubic(s);
          const baseY = height - bottomPad - (cumTotal / maxVal) * chartH * easeOutCubic(s);
          const y = baseY - barH;
          const isH = mx >= x && mx <= x + barW - 4 && my >= y && my <= baseY;

          ctx.globalAlpha = (isH ? 0.95 : 0.8) * s;
          ctx.fillStyle = SEGMENT_COLORS[ci % SEGMENT_COLORS.length];
          ctx.beginPath(); ctx.roundRect(x, y, barW - 4, barH, 2); ctx.fill();
          if (isH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.6; ctx.stroke(); }

          hitRects.push({ x, y, w: barW - 4, h: barH, label: `${c.name} · ${months[mi]}: £${val}K${c.isFlagged ? ' (flagged)' : ''}` });
          cumTotal += val;
        });

        ctx.globalAlpha = s; ctx.textAlign = 'right';
        ctx.font = c.isFlagged ? '700 9px "Satoshi", sans-serif' : '500 9px "Satoshi", sans-serif';
        ctx.fillStyle = c.isFlagged ? accent : C.t3;
        ctx.fillText(c.name, leftPad - 6, topPad + ci * 20 + 12);
        ctx.textAlign = 'left'; ctx.font = '700 9px "Satoshi", sans-serif'; ctx.fillStyle = c.isFlagged ? C.red : C.t3;
        if (cumulatives[ci] > 0) ctx.fillText(`£${cumulatives[ci]}K`, leftPad - 6, topPad + ci * 20 + 22);
      });

      if (threshold) {
        const threshY = height - bottomPad - (threshold / maxVal) * chartH;
        ctx.globalAlpha = 0.4 * easeOutCubic(progress); ctx.strokeStyle = C.red; ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(leftPad, threshY); ctx.lineTo(width - rightPad, threshY); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = '600 8px "Satoshi", sans-serif'; ctx.fillStyle = C.red; ctx.textAlign = 'right';
        ctx.fillText(`£${threshold}K threshold`, width - rightPad, threshY - 4);
      }

      ctx.globalAlpha = 1; drawDust(ctx, width, height, T, 15); drawScanline(ctx, width, height, T, 0.01);
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseleave', onLeave); };
  }, [width, height, data]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width, height, borderRadius: 8, cursor: 'crosshair' }} />
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} text={tooltip.text} />}
    </div>
  );
}
