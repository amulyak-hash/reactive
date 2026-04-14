import { useRef, useEffect, useState } from 'react';
import { C } from '../../theme/tokens';
import { setupCanvas, drawDust, drawScanline, drawGlow } from '../utils';
import { easeOutCubic, stagger } from '../easing';
import Tooltip from './Tooltip';

const SEVERITY_COLORS = { critical: C.red, warning: C.orange, watch: C.amber, ok: C.green };

export default function SilenceAlarmGauge({ width, height, data, accent }) {
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
      for (const h of hitCircles) { const dx = mx - h.cx, dy = my - h.cy; if (dx * dx + dy * dy <= h.r * h.r) { found = h; break; } }
      setTooltip(found ? { x: found.cx, y: found.cy - found.r - 8, text: found.label } : null);
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
      hitCircles.length = 0;

      const { contractors } = data;
      const cols = Math.min(contractors.length, 3);
      const rows = Math.ceil(contractors.length / cols);
      const cellW = width / cols, cellH = height / rows;
      const gaugeR = Math.min(cellW, cellH) * 0.28;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      contractors.forEach((c, i) => {
        const s = stagger(progress, i, contractors.length);
        const col = i % cols, row = Math.floor(i / cols);
        const cx = col * cellW + cellW / 2, cy = row * cellH + cellH * 0.38;
        const severityColor = SEVERITY_COLORS[c.severity] || C.t3;
        const fillRatio = Math.min(c.floatUsed / c.floatTotal, 1.3);
        const dx = mx - cx, dy = my - cy; const isH = dx * dx + dy * dy <= gaugeR * gaugeR * 2;

        // Background arc
        ctx.globalAlpha = s * (isH ? 0.25 : 0.15); ctx.strokeStyle = C.t4; ctx.lineWidth = isH ? 7 : 6;
        ctx.beginPath(); ctx.arc(cx, cy, gaugeR, Math.PI * 0.8, Math.PI * 2.2); ctx.stroke();

        // Fill arc
        const fillAngle = Math.PI * 0.8 + fillRatio * Math.PI * 1.4 * easeOutCubic(s);
        ctx.globalAlpha = s * (isH ? 1 : 0.8); ctx.strokeStyle = severityColor; ctx.lineWidth = isH ? 7 : 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, gaugeR, Math.PI * 0.8, Math.min(fillAngle, Math.PI * 2.2)); ctx.stroke();
        if (isH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(cx, cy, gaugeR + 5, Math.PI * 0.8, Math.PI * 2.2); ctx.stroke(); }

        if (c.severity === 'critical') { const pulse = 0.5 + 0.5 * Math.sin(T * 0.005); drawGlow(ctx, cx, cy, gaugeR * 1.5, C.red, 0.08 * pulse * s); }

        ctx.globalAlpha = s; ctx.font = '700 14px "Satoshi", sans-serif'; ctx.fillStyle = severityColor; ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(c.floatUsed * easeOutCubic(s))}d`, cx, cy + 4);
        ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t3;
        ctx.fillText(`of ${c.floatTotal}d float`, cx, cy + 16);
        ctx.font = '600 10px "Satoshi", sans-serif'; ctx.fillStyle = isH ? C.t1 : C.t2;
        ctx.fillText(c.name, cx, cy + gaugeR + 18);
        ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t3;
        ctx.fillText(c.role, cx, cy + gaugeR + 30);

        if (!c.ewRaised) {
          const blinkAlpha = 0.5 + 0.5 * Math.sin(T * 0.006 + i);
          ctx.globalAlpha = s * blinkAlpha; ctx.font = '700 8px "Satoshi", sans-serif'; ctx.fillStyle = C.red;
          ctx.fillText('NO EW RAISED', cx, cy + gaugeR + 42);
        }

        // Sparkline
        if (c.trend && c.trend.length > 1 && s > 0.5) {
          const sparkW = cellW * 0.5, sparkH = 16;
          const sparkX = cx - sparkW / 2, sparkY = cy - gaugeR - 14;
          const maxTrend = Math.max(...c.trend, 1);
          ctx.globalAlpha = s * (isH ? 0.8 : 0.5); ctx.strokeStyle = severityColor; ctx.lineWidth = isH ? 1.8 : 1.2;
          ctx.beginPath();
          c.trend.forEach((v, ti) => {
            const px = sparkX + (ti / (c.trend.length - 1)) * sparkW;
            const py = sparkY + sparkH - (v / maxTrend) * sparkH;
            ti === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          });
          ctx.stroke();
        }

        const daysToCreit = c.floatTotal - c.floatUsed;
        hitCircles.push({ cx, cy, r: gaugeR * 1.4, label: `${c.name} (${c.role}): ${c.floatUsed}d used of ${c.floatTotal}d · ${daysToCreit > 0 ? daysToCreit + 'd to critical' : 'ON CRITICAL PATH'}${!c.ewRaised ? ' · No EW raised' : ''}` });
      });

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
