import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function ResponseMapCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const rings = useMemo(() => [
    { label: 'Reflex (<30s)', responders: ['Auto speed ctrl (0.5s)', 'Operator alert (3s)'], radius: 0.15, color: C.red },
    { label: 'Tactical (1-5 min)', responders: ['Shift supervisor (45s)', 'Process engineer (2m)', 'Flow coordinator (4m)'], radius: 0.35, color: C.amber },
    { label: 'Strategic (5-60 min)', responders: ['Scheduler (8m)', 'Model retrain (15m)', 'Director narrative (60m)'], radius: 0.55, color: C.blue },
  ], []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    let raf;

    const draw = () => {
      t.current++;
      const T = t.current;
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 25);

      const cx = w * 0.4, cy = h * 0.45;
      const maxR = Math.min(w * 0.35, h * 0.38);

      // Epicenter
      const epPulse = dampedPulse(T, 0.04, 0.0005) * 0.1 + 1;
      const epR = 18 * epPulse;
      const epId = 'epicenter';
      const epHp = hoverMap.current.get(epId) || 0;

      // Enhanced epicenter glow
      drawGlow(ctx, cx, cy, epR * 2.5 + epHp * 10, C.red, 0.15 + epHp * 0.15);

      const ng = ctx.createRadialGradient(cx, cy - 3, 0, cx, cy, epR + epHp * 4);
      ng.addColorStop(0, rgb(C.red, 0.9));
      ng.addColorStop(1, rgb(C.red, 0.5));
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(cx, cy, epR + epHp * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 9px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = C.t1;
      ctx.fillText('22°C', cx, cy);

      registerHitCircle(hitZonesRef.current, epId, cx, cy, epR * 2, {
        label: 'Epicenter',
        value: 'Superheat drop: 22°C',
        sublabel: 'CCM-3 Line 3',
        color: C.red,
      });

      // Response rings
      const visibleRings = Math.min(step + 1, rings.length);
      for (let ri = 0; ri < visibleRings; ri++) {
        const ring = rings[ri];
        const r = maxR * ring.radius;

        // Expanding ripple
        const rippleR = r + (T * 0.15 % (maxR * 0.15));
        const rippleA = Math.max(0, 1 - (rippleR - r) / (maxR * 0.15)) * 0.08;
        ctx.beginPath();
        ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(ring.color, rippleA);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ring circle
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(ring.color, 0.15);
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ring label
        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(ring.color, 0.6);
        ctx.fillText(ring.label, cx + r + 8, cy - r * 0.4);

        // Responder dots along the ring
        ring.responders.forEach((resp, rsi) => {
          const angle = -Math.PI / 2 + (rsi / ring.responders.length) * Math.PI * 1.2 + ri * 0.5;
          const rx = cx + Math.cos(angle) * r;
          const ry = cy + Math.sin(angle) * r;
          const dotPulse = dampedPulse(T, 0.04, 0.0005) * 0.1 + 1 + Math.sin(rsi + ri * 3) * 0.05;

          const dotId = `resp-${ri}-${rsi}`;
          const hp = hoverMap.current.get(dotId) || 0;

          ctx.beginPath();
          ctx.arc(rx, ry, (5 + hp * 3) * dotPulse, 0, Math.PI * 2);
          ctx.fillStyle = rgb(ring.color, 0.5 + hp * 0.3);
          ctx.fill();

          // Hover glow
          if (hp > 0) {
            drawGlow(ctx, rx, ry, 14 * hp, ring.color, 0.2 * hp);
          }

          // Responder name
          ctx.font = "7px 'JetBrains Mono',monospace";
          ctx.textAlign = angle > 0 ? 'left' : 'right';
          ctx.fillStyle = rgb(C.t2, 0.5 + hp * 0.3);
          ctx.fillText(resp, rx + (angle > 0 ? 8 : -8), ry + 2);

          registerHitCircle(hitZonesRef.current, dotId, rx, ry, 10, {
            label: ring.label,
            value: resp,
            sublabel: `Ring ${ri + 1} responder`,
            color: ring.color,
          });
        });
      }

      // Step 3: Annotation
      if (step >= 3) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('Response propagation: reflex → tactical → strategic', w * 0.5, h * 0.88);
      }

      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, rings]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
