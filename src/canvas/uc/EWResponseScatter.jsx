import { useRef, useEffect, useState } from 'react';
import { C } from '../../theme/tokens';
import { setupCanvas, drawDust, drawScanline, drawGlow } from '../utils';
import { easeOutCubic, stagger } from '../easing';

export default function EWResponseScatter({ width, height, data, accent }) {
  const canvasRef = useRef(null);
  const startRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    startRef.current = performance.now();
    const hitCircles = [];

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      mouseRef.current = { x: mx, y: my };
      let found = null;
      for (const h of hitCircles) {
        const dx = mx - h.cx, dy = my - h.cy;
        if (dx * dx + dy * dy <= h.r * h.r) { found = h; break; }
      }
      setTooltip(found ? { x: found.cx, y: found.cy - found.r - 8, text: found.label } : null);
    };
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 }; setTooltip(null); };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const draw = () => {
      const T = performance.now();
      const elapsed = T - startRef.current;
      const progress = Math.min(elapsed / 1200, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      hitCircles.length = 0;

      const { historical, current, trendLine } = data;
      const leftPad = 50, rightPad = 16, topPad = 16, bottomPad = 30;
      const chartW = width - leftPad - rightPad, chartH = height - topPad - bottomPad;
      const maxDays = 28, maxCost = 420;
      const xOf = (d) => leftPad + (d / maxDays) * chartW;
      const yOf = (c) => topPad + chartH - (c / maxCost) * chartH;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // Axes
      ctx.globalAlpha = 0.3; ctx.strokeStyle = C.t4; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(leftPad, topPad); ctx.lineTo(leftPad, topPad + chartH); ctx.lineTo(leftPad + chartW, topPad + chartH); ctx.stroke();

      ctx.globalAlpha = 0.5; ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t3; ctx.textAlign = 'center';
      ctx.fillText('Response Days', leftPad + chartW / 2, height - 4);
      ctx.textAlign = 'right';
      for (let d = 5; d <= 25; d += 5) ctx.fillText(`${d}d`, xOf(d), topPad + chartH + 14);
      ctx.save(); ctx.translate(12, topPad + chartH / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('CE Cost (£K)', 0, 0); ctx.restore();

      // Trend line
      ctx.globalAlpha = 0.25 * easeOutCubic(progress); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]); ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(trendLine.intercept));
      ctx.lineTo(xOf(maxDays), yOf(trendLine.slope * maxDays + trendLine.intercept));
      ctx.stroke(); ctx.setLineDash([]);

      // Historical
      historical.forEach(([days, cost, becameCE], i) => {
        const s = stagger(progress, i, historical.length);
        const x = xOf(days), y = becameCE ? yOf(cost) : yOf(0) - 8;
        const r = becameCE ? 4 : 3;
        const dx = mx - x, dy = my - y;
        const isH = dx * dx + dy * dy <= 64;

        ctx.globalAlpha = s * (isH ? 0.95 : 0.6);
        ctx.fillStyle = becameCE ? C.red : C.green;
        ctx.beginPath(); ctx.arc(x, y, r * s * (isH ? 1.4 : 1), 0, Math.PI * 2); ctx.fill();
        if (isH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5; ctx.stroke(); }

        hitCircles.push({ cx: x, cy: y, r: 8, label: becameCE ? `${days}d → £${cost}K CE` : `${days}d → resolved (no CE)` });
      });

      // Current open EWs
      current.forEach(([days, cost, id], i) => {
        const s = stagger(progress, i, current.length);
        const x = xOf(days), y = yOf(cost);
        const pulse = 0.7 + 0.3 * Math.sin(T * 0.004 + i * 1.5);
        const dx = mx - x, dy = my - y;
        const isH = dx * dx + dy * dy <= 100;

        ctx.globalAlpha = s * 0.2 * pulse;
        drawGlow(ctx, x, y, isH ? 20 : 14, C.amber, 0.3);

        ctx.globalAlpha = s * (isH ? 1 : pulse);
        ctx.fillStyle = C.amber;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
        ctx.fillRect(isH ? -5 : -4, isH ? -5 : -4, isH ? 10 : 8, isH ? 10 : 8);
        ctx.restore();
        if (isH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.strokeRect(-5, -5, 10, 10); ctx.restore(); }

        if (s > 0.8) {
          ctx.globalAlpha = s * 0.6; ctx.font = '600 7px "Satoshi", sans-serif'; ctx.fillStyle = C.t2; ctx.textAlign = 'left';
          ctx.fillText(id, x + 8, y + 3);
        }
        hitCircles.push({ cx: x, cy: y, r: 10, label: `${id}: ${days} days open · projected £${cost}K` });
      });

      ctx.globalAlpha = 1; drawDust(ctx, width, height, T, 15); drawScanline(ctx, width, height, T, 0.008);
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseleave', onLeave); };
  }, [width, height, data]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width, height, borderRadius: 8, cursor: 'crosshair' }} />
      {tooltip && <Tip x={tooltip.x} y={tooltip.y} text={tooltip.text} />}
    </div>
  );
}

function Tip({ x, y, text }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)',
      padding: '6px 10px', borderRadius: 8, background: 'rgba(10, 16, 29, 0.95)',
      border: '1px solid rgba(109, 123, 156, 0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      fontFamily: '"Satoshi", sans-serif', fontSize: 11, fontWeight: 600,
      color: '#f5f7fb', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
    }}>{text}</div>
  );
}
