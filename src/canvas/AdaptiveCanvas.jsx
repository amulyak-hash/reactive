import { useEffect, useRef } from 'react';
import { C, rgb, lerp } from '../theme/tokens';
import { dampedPulse } from './easing';
import { drawGlow, drawScanline, drawDust } from './utils';

export default function AdaptiveCanvas({ w, h, step }) {
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

    const beams = [
      { dx: -1, dy: -.55, c: C.red, label: "22\u00B0C \u2193", role: "RTR \u00B7 Operator" },
      { dx: 1, dy: -.55, c: C.amber, label: "3 items queued", role: "OO \u00B7 Supervisor" },
      { dx: -1, dy: .55, c: C.cyan, label: "\u25C7\u2500\u25C7\u2500\u25C7 87%", role: "AP \u00B7 Engineer" },
      { dx: 1, dy: .55, c: C.purple, label: "Evidence suggests\u2026", role: "SDM \u00B7 Director" },
    ];

    const draw = () => {
      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);

      // Dust
      drawDust(ctx, w, h, T, 30, 'rgba(80,120,160,.04)');

      // Central orb with enhanced glow
      const orbPulse = 1 + dampedPulse(T, 0.025, 0.0003) * .05;
      const orbR = 16 * orbPulse;

      drawGlow(ctx, cx, cy, orbR * 3.5, C.t1, 0.1);

      ctx.beginPath();
      ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
      ctx.fillStyle = rgb(C.t1, .8);
      ctx.fill();

      ctx.font = "bold 9px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.bg, .7);
      ctx.fillText('22\u00B0C', cx, cy + 3);

      // Beams
      const showCount = step === 0 ? 0 : step === 1 ? 1 : 4;
      beams.slice(0, showCount).forEach((b, i) => {
        const dist = Math.min(w, h) * .32;
        const ex = cx + b.dx * dist, ey = cy + b.dy * dist * .8;

        const grad = ctx.createLinearGradient(cx, cy, ex, ey);
        grad.addColorStop(0, rgb(C.t1, .15));
        grad.addColorStop(1, rgb(b.c, .2));
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Flow particles with glow
        for (let p = 0; p < 3; p++) {
          const pt = ((T * .01 + i * .25 + p * .33) % 1);
          const px = lerp(cx, ex, pt), py = lerp(cy, ey, pt);
          const pAlpha = Math.sin(pt * Math.PI) * .7;
          drawGlow(ctx, px, py, 6, b.c, pAlpha * 0.15);
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = rgb(b.c, pAlpha);
          ctx.fill();
        }

        // Endpoint with glow
        drawGlow(ctx, ex, ey, 18, b.c, 0.1);
        ctx.beginPath();
        ctx.arc(ex, ey, 10, 0, Math.PI * 2);
        ctx.fillStyle = rgb(b.c, .15);
        ctx.fill();
        ctx.strokeStyle = rgb(b.c, .4);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(b.c, .8);
        ctx.textAlign = 'center';
        ctx.fillText(b.label, ex, ey + 24);

        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t3, .5);
        ctx.fillText(b.role, ex, ey + 36);

        // Flash on step 4 — smoother
        if (step >= 3 && T % 120 > 100) {
          const flash = dampedPulse(T % 120 - 100, 0.15, 0.03) * .3;
          if (flash > 0) {
            ctx.beginPath();
            ctx.arc(ex, ey, 14, 0, Math.PI * 2);
            ctx.fillStyle = rgb(b.c, Math.abs(flash));
            ctx.fill();
          }
        }
      });

      // Scanline
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step]);

  return <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />;
}
