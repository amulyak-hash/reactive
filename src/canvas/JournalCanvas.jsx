import { useEffect, useRef } from 'react';
import { C, rgb } from '../theme/tokens';
import { dampedPulse, easeOutCubic } from './easing';
import { drawGlow, drawScanline } from './utils';

export default function JournalCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    let raf;
    const cx = w / 2, cy = h / 2;

    const spiralPts = Array.from({ length: 70 }, (_, i) => {
      const a = i * .26, r = 18 + i * 1.1;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * .4 - i * .6 };
    });

    const decisions = [5, 12, 19, 27, 34, 41, 48, 55, 62].map((ni, i) => ({
      ni, good: ![2, 5, 7].includes(i), impact: 3 + Math.random() * 3,
    }));

    const draw = () => {
      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);

      // Spiral path — eased draw-in
      const rawLen = step === 0 ? Math.min(T * .8, spiralPts.length) : spiralPts.length;
      const drawLen = step === 0 ? easeOutCubic(Math.min(rawLen / spiralPts.length, 1)) * spiralPts.length : rawLen;
      ctx.beginPath();
      for (let i = 0; i < drawLen; i++) {
        const p = spiralPts[i];
        i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
      }
      ctx.strokeStyle = rgb(C.t4, .2);
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Decision nodes with glow
      if (step >= 1) {
        decisions.forEach((d) => {
          if (d.ni >= spiralPts.length) return;
          const p = spiralPts[d.ni];
          const col = d.good ? C.green : C.orange;
          const r = d.impact;
          const pulse = dampedPulse(T, 0.02, 0.0003);

          // Glow on bad decisions
          if (!d.good) {
            drawGlow(ctx, p.x, p.y, r * 3, col, 0.12);
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, r + pulse * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = rgb(col, .5 + dampedPulse(T, 0.02, 0.0002) * .1);
          ctx.fill();

          // Prediction vs actual lines
          if (step >= 2) {
            const lineH = d.good ? r + 4 : r + 12 + dampedPulse(T, 0.03, 0.0003) * 3;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - r);
            ctx.lineTo(p.x, p.y - r - lineH);
            ctx.strokeStyle = rgb(col, .3);
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(p.x, p.y - r - lineH, 2, 0, Math.PI * 2);
            ctx.fillStyle = rgb(col, .6);
            ctx.fill();
          }
        });
      }

      // Progress bar — eased fill
      if (step >= 3) {
        const by = h * .88, bx = w * .15, bw = w * .7;
        ctx.fillStyle = rgb(C.bd, .3);
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, 4, 2);
        ctx.fill();

        const prog = easeOutCubic(Math.min(T * .003, 1));
        const pg = ctx.createLinearGradient(bx, by, bx + bw * prog, by);
        pg.addColorStop(0, rgb(C.orange, .5));
        pg.addColorStop(1, rgb(C.green, .6));
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw * prog, 4, 2);
        ctx.fill();

        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.t3, .5);
        ctx.fillText('Detection time improved 23% over 18 months', w / 2, by + 16);
      }

      // Scanline
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step]);

  return <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />;
}
