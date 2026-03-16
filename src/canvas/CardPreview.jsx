import { useEffect, useRef } from 'react';
import { C, rgb, lerp } from '../theme/tokens';
import { dampedPulse } from './easing';
import { drawGlow } from './utils';

export default function CardPreview({ zone, size = 150 }) {
  const ref = useRef(null);
  const t = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    const h = 70;
    canvas.width = size * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    let raf;
    const col = zone.accent;

    const draw = () => {
      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, size, h);

      if (zone.id === 'bf') {
        // Causal chain mini
        const pts = [{ x: 12, y: 35 }, { x: 48, y: 22 }, { x: 95, y: 48 }, { x: 138, y: 30 }];
        pts.forEach((p, i) => {
          if (i > 0) {
            const prev = pts[i - 1];
            ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = rgb(col, .2); ctx.lineWidth = 1;
            ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
            const pt = ((T * .012 + i * .3) % 1);
            const px = lerp(prev.x, p.x, pt), py = lerp(prev.y, p.y, pt);
            drawGlow(ctx, px, py, 5, col, Math.sin(pt * Math.PI) * 0.15);
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = rgb(col, Math.sin(pt * Math.PI) * .7);
            ctx.fill();
          }
          const nodePulse = dampedPulse(T, 0.03, 0.0005);
          ctx.beginPath(); ctx.arc(p.x, p.y, 3.5 + nodePulse * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = rgb(col, .45); ctx.fill();
        });
      } else if (zone.id === 'sms') {
        // Sensor bars mini — smoother oscillation
        for (let i = 0; i < 18; i++) {
          const x = 6 + i * 8;
          const bh = 20 + dampedPulse(T + i * 40, 0.018, 0.0003) * 10 + Math.sin(T * .018 + i * .7) * 5;
          const isA = i === 12;
          if (isA) drawGlow(ctx, x, h - 4 - bh - 10, 8, C.red, 0.15);
          ctx.beginPath(); ctx.moveTo(x, h - 4);
          ctx.lineTo(x, h - 4 - bh - (isA ? 10 + dampedPulse(T, 0.06, 0.0005) * 5 : 0));
          ctx.strokeStyle = rgb(isA ? C.red : col, isA ? .7 : .25);
          ctx.lineWidth = 1.5; ctx.stroke();
        }
      } else if (zone.id === 'cc') {
        // Adaptive beams mini
        const cx = size / 2, cy = h / 2;
        drawGlow(ctx, cx, cy, 10, C.t1, 0.08);
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.t1, .5); ctx.fill();
        [{ dx: -1, dy: -.5, c: C.red }, { dx: 1, dy: -.5, c: C.amber },
         { dx: -1, dy: .5, c: C.cyan }, { dx: 1, dy: .5, c: C.purple }].forEach(b => {
          const ex = cx + b.dx * 50, ey = cy + b.dy * 24;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey);
          ctx.strokeStyle = rgb(b.c, .2); ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = rgb(b.c, .45); ctx.fill();
        });
      } else if (zone.id === 'rm') {
        // Terrain mini
        ctx.beginPath(); ctx.moveTo(0, h * .55);
        for (let x = 0; x <= size; x += 2) {
          const y = h * .48 + Math.sin(x * .035) * 12 + Math.sin(x * .02 + 1) * 8;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(size, h); ctx.lineTo(0, h); ctx.closePath();
        ctx.fillStyle = rgb(col, .06); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, h * .55);
        for (let x = 0; x <= size; x += 2) {
          const y = h * .48 + Math.sin(x * .035) * 12 + Math.sin(x * .02 + 1) * 8;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgb(col, .35); ctx.lineWidth = 1; ctx.stroke();
      } else {
        // Spiral mini (ql)
        const pts = [];
        for (let i = 0; i < 35; i++) {
          const a = i * .3, r = 6 + i * .65;
          pts.push({ x: size / 2 + Math.cos(a) * r, y: h / 2 + Math.sin(a) * r * .35 - i * .3 });
        }
        ctx.beginPath();
        pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.strokeStyle = rgb(col, .2); ctx.lineWidth = 1;
        ctx.setLineDash([1, 2]); ctx.stroke(); ctx.setLineDash([]);
        [5, 14, 23, 30].forEach((ni, i) => {
          if (ni < pts.length) {
            const p = pts[ni];
            if (i === 2) drawGlow(ctx, p.x, p.y, 6, C.orange, 0.12);
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = rgb(i === 2 ? C.orange : col, .45); ctx.fill();
          }
        });
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [zone, size]);

  return <canvas ref={ref} style={{ width: size, height: 70, display: 'block', borderRadius: 6 }} />;
}
