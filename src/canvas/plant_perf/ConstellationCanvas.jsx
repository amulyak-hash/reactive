import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';
import { PLANTS } from '../../data/tataSteel';

export default function ConstellationCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const constellations = useMemo(() => {
    const kpis = ['Output', 'Quality', 'Efficiency', 'Uptime', 'Safety'];
    const kpiData = [
      [89, 97, 88, 91, 99.2], // Plant A
      [78, 96, 73, 72, 98.8], // Plant B
      [86, 95, 90, 88, 99.0], // Plant C
      [83, 94, 87, 85, 99.1], // Plant D
    ];

    return PLANTS.map((p, pi) => {
      const cx = w * (0.18 + pi * 0.2);
      const cy = h * 0.42;
      const baseR = Math.min(w * 0.08, h * 0.15);

      const stars = kpiData[pi].map((val, ki) => {
        const angle = -Math.PI / 2 + (ki / kpis.length) * Math.PI * 2;
        const norm = (val - 60) / 40; // normalize to 0-1 range
        const r = baseR * norm;
        return {
          name: kpis[ki],
          val,
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
          angle, norm,
        };
      });

      // Scatter metric: average distance from centroid
      const avgX = stars.reduce((s, st) => s + st.x, 0) / stars.length;
      const avgY = stars.reduce((s, st) => s + st.y, 0) / stars.length;
      const scatter = Math.sqrt(stars.reduce((s, st) =>
        s + (st.x - avgX) ** 2 + (st.y - avgY) ** 2, 0) / stars.length);

      return { ...p, cx, cy, baseR, stars, scatter, isPlantB: pi === 1 };
    });
  }, [w, h]);

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
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 30);

      constellations.forEach((con, ci) => {
        const isHighlight = (step === 1 && ci === 0) || (step >= 2 && ci === 1);
        const trColor = con.isPlantB ? C.red : con.color;
        const conId = `constellation-${ci}`;
        const hp = hoverMap.current.get(conId) || 0;

        // Constellation boundary circle (faint)
        ctx.beginPath();
        ctx.arc(con.cx, con.cy, con.baseR + 5, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(C.bd, 0.08 + 0.08 * hp);
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Connection lines between stars (constellation shape)
        ctx.beginPath();
        con.stars.forEach((star, si) => {
          si === 0 ? ctx.moveTo(star.x, star.y) : ctx.lineTo(star.x, star.y);
        });
        ctx.closePath();
        ctx.fillStyle = rgb(trColor, 0.04 + 0.03 * hp);
        ctx.fill();
        ctx.strokeStyle = rgb(trColor, 0.15 + 0.1 * hp);
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // Stars
        con.stars.forEach((star, si) => {
          const twinkle = dampedPulse(T, 0.05, 0.0005) * 0.3 + 0.7;
          const starR = 3 * twinkle;
          const starId = `star-${ci}-${si}`;
          const shp = hoverMap.current.get(starId) || 0;

          // Star glow
          const sg = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, starR * 4);
          sg.addColorStop(0, rgb(trColor, (0.15 + 0.1 * shp) * twinkle));
          sg.addColorStop(1, rgb(trColor, 0));
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(star.x, star.y, starR * 4, 0, Math.PI * 2);
          ctx.fill();

          // Star point
          ctx.beginPath();
          ctx.arc(star.x, star.y, starR + shp * 2, 0, Math.PI * 2);
          ctx.fillStyle = rgb(trColor, (0.7 + 0.2 * shp) * twinkle);
          ctx.fill();

          registerHitCircle(hitZonesRef.current, starId, star.x, star.y, starR * 4 + 2, {
            label: star.name, value: `${star.val}%`, sublabel: con.name.split('·')[0].trim(), color: trColor,
          });
        });

        // Hover glow for constellation center
        if (hp > 0) drawGlow(ctx, con.cx, con.cy, 16 * hp, trColor, 0.15 * hp);

        if (isHighlight) drawGlow(ctx, con.cx, con.cy, con.baseR + 15, trColor, 0.1);

        // Highlight ring
        if (isHighlight) {
          ctx.beginPath();
          ctx.arc(con.cx, con.cy, con.baseR + 12, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(trColor, 0.15 + dampedPulse(T, 0.03, 0.0005) * 0.05);
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Plant label
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = con.isPlantB ? rgb(C.red, 0.8) : rgb(C.t2, 0.6);
        ctx.fillText(con.name.split('·')[0].trim(), con.cx, con.cy + con.baseR + 20);

        registerHitCircle(hitZonesRef.current, conId, con.cx, con.cy, con.baseR + 5, {
          label: con.name.split('·')[0].trim(), value: `Scatter: ${con.scatter.toFixed(1)}`, sublabel: con.isPlantB ? 'Constellation breaking apart' : 'KPIs aligned', color: trColor,
        });
      });

      // Step annotations
      const annotY = h * 0.75;
      ctx.font = "9px 'DM Sans',sans-serif";
      ctx.textAlign = 'center';

      if (step >= 1) {
        ctx.fillStyle = rgb(C.blue, 0.6);
        ctx.fillText('Plant A: tight constellation — all 5 KPIs aligned within 10%', w * 0.5, annotY);
      }
      if (step >= 2) {
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('Plant B: output & uptime stars drift — constellation breaking apart', w * 0.5, annotY + 16);
      }
      if (step >= 3) {
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t1, 0.7);
        ctx.fillText('Archetype: "equipment-limited" — quality holds but throughput suffers', w * 0.5, annotY + 36);
        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText('Fix uptime star → constellation tightens', w * 0.5, annotY + 50);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, constellations]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
