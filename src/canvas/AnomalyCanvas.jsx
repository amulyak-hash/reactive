import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../theme/tokens';
import { dampedPulse } from './easing';
import { drawGlow, drawScanline } from './utils';

export default function AnomalyCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);

  const sigs = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      x: w * .04 + i * (w * .92 / 39),
      ph: Math.random() * Math.PI * 2,
      base: .3 + Math.random() * .3,
      sp: .012 + Math.random() * .008,
    })),
  [w]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    let raf;
    const ai = 27;

    const draw = () => {
      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);

      // Threshold line
      if (step >= 1) {
        const ty = h * .18;
        ctx.beginPath();
        ctx.moveTo(0, ty);
        ctx.lineTo(w, ty);
        ctx.strokeStyle = rgb(C.red, .2);
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.red, .35);
        ctx.textAlign = 'right';
        ctx.fillText('1,700\u00B0C THRESHOLD', w - 8, ty - 5);
      }

      // Sensor bars
      sigs.forEach((s, i) => {
        const isA = i === ai && step >= 2;
        const isN = Math.abs(i - ai) <= 2 && i !== ai && step >= 3;
        let amp = .1, col = C.cyan, al = .3;

        if (isA) {
          amp = .1 + Math.min(T * .0002, .22);
          col = T > 80 ? C.red : C.amber;
          al = .75;
        }
        if (isN) { amp = .13; col = C.amber; al = .4; }

        const sh = s.base + Math.sin(T * s.sp + s.ph) * amp;
        const top = h * (1 - sh);

        ctx.beginPath();
        ctx.moveTo(s.x, h * .9);
        ctx.lineTo(s.x, top);
        ctx.strokeStyle = rgb(col, al);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tip dot with glow
        if (isA) {
          drawGlow(ctx, s.x, top, 10, col, 0.2);
        }
        ctx.beginPath();
        ctx.arc(s.x, top, isA ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fillStyle = rgb(col, al + .15);
        ctx.fill();

        // Alert ring expansion — smoother with dampedPulse
        if (isA && step >= 2) {
          const ringBase = 6 + dampedPulse(T, 0.05, 0.0008) * 3;
          const rr = ringBase + (T * .04);
          const ra = Math.max(0, .35 - rr * .002);
          if (ra > 0) {
            ctx.beginPath();
            ctx.arc(s.x, top, rr, 0, Math.PI * 2);
            ctx.strokeStyle = rgb(C.red, ra);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Neighbor correlation lines
        if (isN && step >= 3) {
          ctx.beginPath();
          ctx.moveTo(sigs[ai].x, h * (1 - sigs[ai].base));
          ctx.lineTo(s.x, top);
          ctx.strokeStyle = rgb(C.amber, .12);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, sigs]);

  return <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />;
}
