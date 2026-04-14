import { useRef, useEffect, useState } from 'react';
import { C } from '../../theme/tokens';
import { setupCanvas, drawDust, drawScanline, drawGlow } from '../utils';
import { easeOutCubic, stagger } from '../easing';
import Tooltip from './Tooltip';

export default function CostOfDelayWaterfall({ width, height, data, accent }) {
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
      const progress = Math.min(elapsed / 1400, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      hitRects.length = 0;

      const { segments, total, visibleOnly, comparison } = data;
      const leftPad = 16, rightPad = 16, topPad = 16, bottomPad = 60;
      const chartW = width - leftPad - rightPad, chartH = height - topPad - bottomPad;
      const barCount = segments.length + 2;
      const barW = Math.min(chartW / barCount - 8, 60);
      const gap = (chartW - barW * barCount) / (barCount + 1);
      const maxVal = total * 1.1;
      const barX = (i) => leftPad + gap + i * (barW + gap);
      const valH = (v) => (v / maxVal) * chartH;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      let runningY = topPad + chartH;
      segments.forEach((seg, i) => {
        const s = stagger(progress, i, segments.length + 2);
        const x = barX(i), h = valH(seg.value) * easeOutCubic(s);
        runningY -= h;
        const isH = mx >= x && mx <= x + barW && my >= runningY && my <= runningY + h;

        ctx.globalAlpha = s * (isH ? 0.95 : 0.75); ctx.fillStyle = seg.color;
        ctx.beginPath(); ctx.roundRect(x, runningY, barW, h, 3); ctx.fill();
        if (isH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.6; ctx.stroke(); }

        ctx.globalAlpha = s * 0.6; ctx.font = seg.category === 'hidden' ? '700 8px "Satoshi", sans-serif' : '500 8px "Satoshi", sans-serif';
        ctx.fillStyle = C.t3; ctx.textAlign = 'center';
        ctx.fillText(seg.category === 'hidden' ? 'HIDDEN' : 'VISIBLE', x + barW / 2, topPad + chartH + 12);
        ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t2;
        ctx.fillText(seg.label, x + barW / 2, topPad + chartH + 24);
        ctx.font = '700 10px "Satoshi", sans-serif'; ctx.fillStyle = seg.color;
        ctx.fillText(`£${seg.value}K`, x + barW / 2, runningY - 6);

        hitRects.push({ x, y: runningY, w: barW, h, label: `${seg.label}: £${seg.value}K/day (${seg.category})` });
      });

      // Total bar
      const totalIdx = segments.length;
      const totalS = stagger(progress, totalIdx, barCount);
      const totalX = barX(totalIdx), totalH = valH(total) * easeOutCubic(totalS);
      const totalY = topPad + chartH - totalH;
      const isTotalH = mx >= totalX && mx <= totalX + barW && my >= totalY && my <= totalY + totalH;

      ctx.globalAlpha = totalS * (isTotalH ? 1 : 0.9); ctx.fillStyle = C.red;
      ctx.beginPath(); ctx.roundRect(totalX, totalY, barW, totalH, 3); ctx.fill();
      if (isTotalH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.6; ctx.stroke(); }
      drawGlow(ctx, totalX + barW / 2, totalY, 20, C.red, 0.15 * totalS);
      ctx.globalAlpha = totalS; ctx.font = '700 12px "Satoshi", sans-serif'; ctx.fillStyle = C.red; ctx.textAlign = 'center';
      ctx.fillText(`£${total}K`, totalX + barW / 2, totalY - 8);
      ctx.font = '600 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t2;
      ctx.fillText('TOTAL', totalX + barW / 2, topPad + chartH + 12);
      ctx.fillText('/day', totalX + barW / 2, topPad + chartH + 24);
      hitRects.push({ x: totalX, y: totalY, w: barW, h: totalH, label: `Total true cost: £${total}K/day — ${(total / visibleOnly).toFixed(1)}x the visible cost` });

      // Comparison bar
      const compIdx = segments.length + 1;
      const compS = stagger(progress, compIdx, barCount);
      const compX = barX(compIdx), compH = valH(comparison.value) * easeOutCubic(compS);
      const compY = topPad + chartH - compH;
      const isCompH = mx >= compX && mx <= compX + barW && my >= compY && my <= compY + compH;

      ctx.globalAlpha = compS * (isCompH ? 0.85 : 0.6); ctx.fillStyle = C.green;
      ctx.beginPath(); ctx.roundRect(compX, compY, barW, compH, 3); ctx.fill();
      if (isCompH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.6; ctx.stroke(); }
      ctx.globalAlpha = compS; ctx.font = '700 10px "Satoshi", sans-serif'; ctx.fillStyle = C.green; ctx.textAlign = 'center';
      ctx.fillText(`£${comparison.value}K`, compX + barW / 2, compY - 6);
      ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t3;
      ctx.fillText(comparison.label, compX + barW / 2, topPad + chartH + 18);
      hitRects.push({ x: compX, y: compY, w: barW, h: compH, label: `${comparison.label}: £${comparison.value}K/day — 41x ROI vs total delay cost` });

      // Visible-only line
      const visLineY = topPad + chartH - valH(visibleOnly);
      ctx.globalAlpha = 0.3 * easeOutCubic(progress); ctx.strokeStyle = C.t3; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(leftPad, visLineY); ctx.lineTo(barX(totalIdx) - 4, visLineY); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t3; ctx.textAlign = 'left';
      ctx.fillText(`Visible: £${visibleOnly}K`, leftPad + 4, visLineY - 4);

      ctx.globalAlpha = easeOutCubic(progress); ctx.font = '600 10px "Satoshi", sans-serif'; ctx.fillStyle = C.t2; ctx.textAlign = 'center';
      ctx.fillText(`Visible cost undervalues delay by ${(total / visibleOnly).toFixed(1)}x`, width / 2, height - 10);

      ctx.globalAlpha = 1; drawDust(ctx, width, height, T, 12); drawScanline(ctx, width, height, T, 0.008);
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
