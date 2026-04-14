import { useRef, useEffect, useState } from 'react';
import { C } from '../../theme/tokens';
import { setupCanvas, drawDust, drawScanline } from '../utils';
import { easeOutCubic, stagger } from '../easing';

export default function BudgetBleedHeatmap({ width, height, data, accent, activeKey, dimOthers, onVizHover, onVizClick }) {
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
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      let found = null;
      for (const h of hitRects) {
        if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) { found = h; break; }
      }
      setTooltip(found ? { x: found.x + found.w / 2, y: found.y - 6, text: found.label } : null);
      // Emit hover with package name as linking key
      if (onVizHover) onVizHover(found ? found.pkg : null);
    };
    const onClick = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      for (const h of hitRects) {
        if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) {
          if (onVizClick) onVizClick(h.pkg);
          return;
        }
      }
      if (onVizClick) onVizClick(null); // click empty = deselect
    };
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 }; setTooltip(null); if (onVizHover) onVizHover(null); };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const draw = () => {
      const T = performance.now();
      const elapsed = T - startRef.current;
      const progress = Math.min(elapsed / 1200, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      hitRects.length = 0;

      const { packages, months, rates } = data;
      const leftPad = 120, topPad = 28;
      const cellW = (width - leftPad - 16) / months.length;
      const cellH = (height - topPad - 20) / packages.length;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const ak = activeKeyRef.current;
      const dim = dimRef.current;

      ctx.font = '600 9px "Satoshi", sans-serif';
      ctx.textAlign = 'center';
      months.forEach((m, j) => {
        const s = stagger(progress, j, months.length);
        ctx.globalAlpha = s;
        ctx.fillStyle = C.t3;
        ctx.fillText(m, leftPad + j * cellW + cellW / 2, topPad - 8);
      });

      packages.forEach((pkg, i) => {
        const s = stagger(progress, i, packages.length);
        const pkgName = pkg.name;
        const isLinked = ak === pkgName;
        const rowDim = dim && !isLinked ? 0.3 : 1;

        ctx.globalAlpha = s * rowDim;
        ctx.textAlign = 'right';
        ctx.font = '500 10px "Satoshi", sans-serif';
        ctx.fillStyle = (pkg.nces === 0 || isLinked) ? C.t1 : C.t3;
        ctx.fillText(pkg.name, leftPad - 8, topPad + i * cellH + cellH / 2 + 3);

        rates[i].forEach((rate, j) => {
          const x = leftPad + j * cellW;
          const y = topPad + i * cellH;
          const cw = cellW - 2, ch = cellH - 2;

          let color;
          if (rate < 1.1) color = C.green;
          else if (rate < 1.15) color = C.amber;
          else if (rate < 1.25) color = C.orange;
          else color = C.red;

          const intensity = Math.min((rate - 0.95) / 0.45, 1);
          const isHovered = mx >= x && mx <= x + cw + 2 && my >= y && my <= y + ch + 2;

          ctx.globalAlpha = s * rowDim * (isHovered || isLinked ? 0.9 : (0.15 + intensity * 0.55));
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.roundRect(x + 1, y + 1, cw, ch, 3); ctx.fill();

          if (isHovered || isLinked) {
            ctx.strokeStyle = isLinked ? accent : '#fff';
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = isLinked ? 0.8 : 0.6;
            ctx.stroke();
          } else if (pkg.nces === 0 && rate > 1.15) {
            const pulse = 0.4 + 0.3 * Math.sin(T * 0.004 + i);
            ctx.globalAlpha = s * rowDim * pulse;
            ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; ctx.stroke();
          }

          if (s > 0.5) {
            ctx.globalAlpha = s * rowDim * (isHovered || isLinked ? 1 : 0.7);
            ctx.fillStyle = rate > 1.2 ? C.t1 : C.t3;
            ctx.font = '600 8px "Satoshi", sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(rate.toFixed(2), x + 1 + cw / 2, y + 1 + ch / 2 + 3);
          }

          hitRects.push({ x: x + 1, y: y + 1, w: cw, h: ch, pkg: pkgName, label: `${pkgName} · ${months[j]}: ${rate.toFixed(2)}x${pkg.nces === 0 ? ' (0 NCEs)' : ''}` });
        });
      });

      ctx.globalAlpha = 1;
      drawDust(ctx, width, height, T, 20, 'rgba(80,120,160,.03)');
      drawScanline(ctx, width, height, T, 0.01);
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('click', onClick); canvas.removeEventListener('mouseleave', onLeave); };
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
