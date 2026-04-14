import { useRef, useEffect, useState } from 'react';
import { C } from '../../theme/tokens';
import { setupCanvas, drawDust, drawScanline, drawGlow } from '../utils';
import { easeOutCubic, stagger } from '../easing';

const TYPE_COLORS = { budget: C.red, timeline: C.amber, both: C.purple };

export default function BoardRiskMatrix({ width, height, data, accent }) {
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
      const progress = Math.min(elapsed / 1400, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      hitCircles.length = 0;

      const { risks, summary } = data;
      const leftPad = 40, rightPad = 16, topPad = 16, bottomPad = 50;
      const chartW = width - leftPad - rightPad;
      const chartH = height - topPad - bottomPad;
      const xOf = (p) => leftPad + p * chartW;
      const yOf = (imp) => topPad + chartH - imp * chartH;
      const midX = leftPad + chartW / 2, midY = topPad + chartH / 2;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // Quadrant backgrounds
      ctx.globalAlpha = 0.03 * easeOutCubic(progress);
      ctx.fillStyle = C.red; ctx.fillRect(midX, topPad, chartW / 2, chartH / 2);
      ctx.fillStyle = C.amber; ctx.fillRect(leftPad, topPad, chartW / 2, chartH / 2);
      ctx.fillStyle = C.amber; ctx.fillRect(midX, midY, chartW / 2, chartH / 2);
      ctx.fillStyle = C.green; ctx.fillRect(leftPad, midY, chartW / 2, chartH / 2);

      // Axes
      ctx.globalAlpha = 0.2; ctx.strokeStyle = C.t4; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(leftPad, topPad); ctx.lineTo(leftPad, topPad + chartH); ctx.lineTo(leftPad + chartW, topPad + chartH); ctx.stroke();

      ctx.globalAlpha = 0.5; ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t3;
      ctx.textAlign = 'center'; ctx.fillText('Probability →', leftPad + chartW / 2, topPad + chartH + 16);
      ctx.save(); ctx.translate(12, topPad + chartH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('Impact →', 0, 0); ctx.restore();

      // Risk bubbles
      risks.forEach((risk, i) => {
        const s = stagger(progress, i, risks.length);
        const x = xOf(risk.probability), y = yOf(risk.impact);
        const color = TYPE_COLORS[risk.type] || C.t3;
        const radius = 8 + Math.log10(Math.max(risk.cost, 1)) * 5;
        const animR = radius * easeOutCubic(s);

        const dx = mx - x, dy = my - y;
        const isHovered = dx * dx + dy * dy <= (animR + 4) * (animR + 4);

        drawGlow(ctx, x, y, animR * (isHovered ? 2.5 : 2), color, (isHovered ? 0.2 : 0.1) * s);

        ctx.globalAlpha = s * (isHovered ? 0.85 : 0.6);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, animR * (isHovered ? 1.1 : 1), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = s * (isHovered ? 1 : 0.8);
        ctx.strokeStyle = isHovered ? '#fff' : color; ctx.lineWidth = isHovered ? 2 : 1.5; ctx.stroke();

        if (s > 0.5) {
          ctx.globalAlpha = s; ctx.font = '600 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t1;
          ctx.textAlign = 'center'; ctx.fillText(risk.label, x, y - animR - 6);
          ctx.font = '700 8px "Satoshi", sans-serif'; ctx.fillStyle = color;
          const costStr = risk.cost >= 1000 ? `£${(risk.cost / 1000).toFixed(0)}M` : `£${risk.cost}K`;
          ctx.fillText(costStr, x, y + 3);
        }

        hitCircles.push({ cx: x, cy: y, r: animR + 4, label: `${risk.label}: £${risk.cost >= 1000 ? (risk.cost / 1000).toFixed(0) + 'M' : risk.cost + 'K'} · P=${(risk.probability * 100).toFixed(0)}% · ${risk.type}` });
      });

      // Summary
      ctx.globalAlpha = easeOutCubic(progress);
      const sumY = height - 20;
      ctx.font = '600 10px "Satoshi", sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = C.t3; ctx.fillText('Budget:', width * 0.15, sumY);
      ctx.fillStyle = C.red; ctx.fillText(`£${summary.budgetTarget}M → £${summary.budgetProjected}M`, width * 0.35, sumY);
      ctx.fillStyle = C.t3; ctx.fillText('Timeline:', width * 0.6, sumY);
      ctx.fillStyle = C.amber; ctx.fillText(`${summary.timelineTarget} → ${summary.timelineProjected}`, width * 0.82, sumY);

      ctx.globalAlpha = 1;
      drawDust(ctx, width, height, T, 12);
      drawScanline(ctx, width, height, T, 0.008);
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
