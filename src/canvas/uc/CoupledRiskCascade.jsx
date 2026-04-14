import { useRef, useEffect, useState } from 'react';
import { C } from '../../theme/tokens';
import { setupCanvas, drawDust, drawScanline, drawGlow } from '../utils';
import { easeOutCubic, stagger } from '../easing';
import Tooltip from './Tooltip';

export default function CoupledRiskCascade({ width, height, data, accent }) {
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
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      mouseRef.current = { x: mx, y: my };
      let found = null;
      for (const h of hitRects) {
        if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) { found = h; break; }
      }
      setTooltip(found ? { x: found.x + found.w / 2, y: found.y - 6, text: found.label } : null);
    };
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 }; setTooltip(null); };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const draw = () => {
      const T = performance.now();
      const elapsed = T - startRef.current;
      const progress = Math.min(elapsed / 1800, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      hitRects.length = 0;

      const { packages, dependencies, totalDelay, totalCost } = data;
      const leftPad = 120, rightPad = 30, topPad = 20, bottomPad = 40;
      const chartW = width - leftPad - rightPad, chartH = height - topPad - bottomPad;
      const maxWeek = totalDelay + 6;
      const rowH = chartH / packages.length;
      const xOf = (w) => leftPad + (w / maxWeek) * chartW;
      const yCenter = (i) => topPad + i * rowH + rowH / 2;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // Grid lines
      ctx.globalAlpha = 0.15; ctx.strokeStyle = C.t4; ctx.lineWidth = 0.5;
      for (let w = 0; w <= maxWeek; w += 2) { const x = xOf(w); ctx.beginPath(); ctx.moveTo(x, topPad); ctx.lineTo(x, topPad + chartH); ctx.stroke(); }
      ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t3; ctx.textAlign = 'center';
      for (let w = 0; w <= maxWeek; w += 4) ctx.fillText(`Wk ${w}`, xOf(w), height - 14);

      // Bars
      packages.forEach((pkg, i) => {
        const s = stagger(progress, i, packages.length);
        const y = yCenter(i), barH = rowH * 0.3;
        const cx1 = xOf(pkg.start), cx2 = xOf(pkg.cascadedEnd);
        const ox1 = xOf(pkg.start), ox2 = xOf(pkg.originalEnd);
        const isH = my >= y - barH && my <= y + barH && mx >= cx1 && mx <= cx2;

        // Ghost bar
        ctx.globalAlpha = s * 0.15; ctx.fillStyle = C.t3;
        ctx.beginPath(); ctx.roundRect(ox1, y - barH / 2, ox2 - ox1, barH, 3); ctx.fill();

        // Cascaded bar
        ctx.globalAlpha = s * (isH ? 0.95 : 0.7); ctx.fillStyle = pkg.color;
        const barW = (cx2 - cx1) * easeOutCubic(s);
        ctx.beginPath(); ctx.roundRect(cx1, y - barH / 2, barW, barH, 3); ctx.fill();
        if (isH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.6; ctx.stroke(); }

        // Label
        ctx.globalAlpha = s; ctx.textAlign = 'right'; ctx.font = '500 10px "Satoshi", sans-serif';
        ctx.fillStyle = isH ? C.t1 : C.t2; ctx.fillText(pkg.name, leftPad - 8, y + 4);

        // Cost
        if (pkg.cost > 0 && s > 0.5) {
          ctx.font = '700 8px "Satoshi", sans-serif'; ctx.fillStyle = C.red; ctx.textAlign = 'left';
          ctx.fillText(`£${(pkg.cost / 1000).toFixed(1)}M`, cx1 + barW + 4, y + 3);
        }

        hitRects.push({ x: cx1, y: y - barH, w: cx2 - cx1, h: barH * 2, label: `${pkg.name}: Wk ${pkg.start}→${pkg.cascadedEnd} (was ${pkg.originalEnd})${pkg.cost ? ' · £' + (pkg.cost / 1000).toFixed(1) + 'M cost' : ''}` });
      });

      // Dependency arrows
      dependencies.forEach(({ from, to }, di) => {
        const s = stagger(progress, di + packages.length, dependencies.length + packages.length);
        if (s < 0.1) return;
        const y1 = yCenter(from), y2 = yCenter(to);
        const x1 = xOf(packages[from].cascadedEnd), x2 = xOf(packages[to].start);
        ctx.globalAlpha = s * 0.5; ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x1, y1);
        const midX = (x1 + x2) / 2;
        ctx.bezierCurveTo(midX, y1, midX, y2, x2, y2); ctx.stroke();

        const particleT = ((T * 0.001 + di * 0.5) % 2) / 2;
        if (particleT < 1) {
          const px = x1 + (x2 - x1) * particleT, py = y1 + (y2 - y1) * particleT;
          ctx.globalAlpha = s * (1 - particleT) * 0.8;
          drawGlow(ctx, px, py, 6, C.amber, 0.5);
        }
      });

      // Total
      const costProgress = easeOutCubic(progress);
      ctx.globalAlpha = progress; ctx.font = '700 14px "Satoshi", sans-serif'; ctx.fillStyle = C.red;
      ctx.textAlign = 'center'; ctx.fillText(`Total Exposure: £${(totalCost / 1000 * costProgress).toFixed(1)}M`, width / 2, height - 2);

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
