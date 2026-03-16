import { useEffect, useRef } from 'react';
import { C, rgb } from '../theme/tokens';
import { dampedPulse } from './easing';
import { drawGlow, drawScanline } from './utils';

export default function ConfidenceCanvas({ w, h, step }) {
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

    const terrain = Array.from({ length: 80 }, (_, i) => {
      const x = i / 79 * w;
      const y = h * .55 + Math.sin(i * .08) * h * .15 + Math.sin(i * .03 + 1) * h * .1 + Math.cos(i * .12) * h * .05;
      return { x, y };
    });

    const dots = Array.from({ length: 20 }, (_, i) => ({
      ti: Math.floor(Math.random() * 78) + 1,
      good: i < 17,
    }));

    const draw = () => {
      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);

      // Terrain fill
      ctx.beginPath();
      ctx.moveTo(0, h);
      terrain.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(w, h);
      ctx.closePath();
      const tg = ctx.createLinearGradient(0, h * .3, 0, h);
      tg.addColorStop(0, rgb(C.green, .06));
      tg.addColorStop(.5, rgb(C.amber, .04));
      tg.addColorStop(1, rgb(C.red, .02));
      ctx.fillStyle = tg;
      ctx.fill();

      // Terrain line
      ctx.beginPath();
      terrain.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.strokeStyle = rgb(C.green, .3);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fog in valleys
      if (step >= 2) {
        terrain.forEach(p => {
          if (p.y > h * .6) {
            const fog = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 30);
            fog.addColorStop(0, rgb(C.bg, .4));
            fog.addColorStop(1, 'transparent');
            ctx.fillStyle = fog;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 30, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // Threshold line
      if (step >= 3) {
        const ty = h * .48;
        ctx.beginPath();
        ctx.moveTo(0, ty);
        ctx.lineTo(w, ty);
        ctx.strokeStyle = rgb(C.amber, .25);
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.amber, .4);
        ctx.textAlign = 'right';
        ctx.fillText('DECISION THRESHOLD', w - 8, ty - 5);
      }

      // Dot plot with enhanced glow
      if (step >= 1) {
        dots.forEach((d) => {
          const tp = terrain[d.ti];
          if (!tp) return;
          const col = d.good ? C.blue : C.orange;
          const pulse = dampedPulse(T, 0.02, 0.0003);
          const r = 4 + pulse * .5;

          // Glow on dots above threshold
          if (step >= 3 && tp.y < h * .48) {
            drawGlow(ctx, tp.x, tp.y - 8, 12, col, 0.15);
          }

          ctx.beginPath();
          ctx.arc(tp.x, tp.y - 8, r, 0, Math.PI * 2);
          ctx.fillStyle = rgb(col, .5 + dampedPulse(T, 0.015, 0.0002) * .15);
          ctx.fill();

          if (step >= 3 && tp.y < h * .48) {
            ctx.beginPath();
            ctx.arc(tp.x, tp.y - 8, 6, 0, Math.PI * 2);
            ctx.strokeStyle = rgb(col, .2);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
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
