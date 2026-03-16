import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerp, lerpC } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { DOWNTIME_EVENTS } from '../../data/tataSteel';
import { dampedPulse, easeOutCubic, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function CostRiverCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const particles = useRef([]);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const tributaries = useMemo(() => {
    const groups = {};
    DOWNTIME_EVENTS.forEach(ev => {
      if (!groups[ev.machine]) groups[ev.machine] = { machine: ev.machine, events: [], totalDur: 0 };
      groups[ev.machine].events.push(ev);
      groups[ev.machine].totalDur += ev.duration;
    });

    const sorted = Object.values(groups).sort((a, b) => b.totalDur - a.totalDur);
    return sorted.map((g, i) => ({
      ...g,
      color: g.machine === 'M21' ? C.red : g.machine === 'M18' ? C.amber : g.machine === 'M22' ? C.cyan : C.blue,
      originY: 0.15 + (i / (sorted.length - 1 || 1)) * 0.5,
      width: g.totalDur * 12,
      isMain: g.machine === 'M21',
    }));
  }, []);

  const totalMinutes = useMemo(() =>
    DOWNTIME_EVENTS.reduce((sum, e) => sum + e.duration * 60, 0), []
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    let raf;
    particles.current = [];

    const draw = () => {
      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);

      drawDust(ctx, w, h, T, 30, 'rgba(60,90,140,.04)');

      // Tick hover animations
      tickHoverProgress(hoverMap.current, hoveredRef.current);

      const riverMouthX = w * 0.85;
      const riverMouthY = h * 0.45;
      const tributaryStartX = w * 0.12;
      const confluenceX = w * 0.55;

      // Reset hit zones
      hitZonesRef.current = [];

      // Draw tributaries
      tributaries.forEach((trib, i) => {
        const revealed = step >= 0;
        if (!revealed) return;

        const startX = tributaryStartX;
        const startY = trib.originY * h;
        const endX = confluenceX;
        const endY = riverMouthY;
        const streamWidth = Math.max(1, trib.width * (w / 800));
        const hp = hoverMap.current.get(`trib-${i}`) || 0;
        const flowAlpha = (trib.isMain ? 0.45 : 0.25) + hp * 0.2;

        // Register hit zone for tributary source area
        registerHitRect(hitZonesRef.current, `trib-${i}`, startX - 50, startY - 15, 55, 30, {
          label: trib.machine,
          value: `${Math.round(trib.totalDur * 60)} min downtime`,
          sublabel: `${trib.events.length} events`,
          color: trib.color,
        });

        // Tributary curve
        const cp1x = startX + (endX - startX) * 0.3;
        const cp1y = startY;
        const cp2x = startX + (endX - startX) * 0.7;
        const cp2y = endY;

        // Draw stream with varying width
        const segments = 40;
        for (let s = 0; s < segments; s++) {
          const t1 = s / segments;
          const t2 = (s + 1) / segments;
          const m1 = 1 - t1, m2 = 1 - t2;

          const x1 = m1 * m1 * m1 * startX + 3 * m1 * m1 * t1 * cp1x + 3 * m1 * t1 * t1 * cp2x + t1 * t1 * t1 * endX;
          const y1 = m1 * m1 * m1 * startY + 3 * m1 * m1 * t1 * cp1y + 3 * m1 * t1 * t1 * cp2y + t1 * t1 * t1 * endY;
          const x2 = m2 * m2 * m2 * startX + 3 * m2 * m2 * t2 * cp1x + 3 * m2 * t2 * t2 * cp2x + t2 * t2 * t2 * endX;
          const y2 = m2 * m2 * m2 * startY + 3 * m2 * m2 * t2 * cp1y + 3 * m2 * t2 * t2 * cp2y + t2 * t2 * t2 * endY;

          const curW = (streamWidth + hp * 4) * (0.4 + t1 * 0.6);
          const wave = dampedPulse(T + t1 * 200 + i * 60, 0.03, 0.0003) * 1.5;

          ctx.beginPath();
          ctx.moveTo(x1, y1 - curW / 2 + wave);
          ctx.lineTo(x2, y2 - curW / 2 + wave);
          ctx.lineTo(x2, y2 + curW / 2 + wave);
          ctx.lineTo(x1, y1 + curW / 2 + wave);
          ctx.closePath();
          ctx.fillStyle = rgb(trib.color, flowAlpha * (0.5 + t1 * 0.5));
          ctx.fill();
        }

        // Glow at source on hover
        if (hp > 0) {
          drawGlow(ctx, startX, startY, 25, trib.color, hp * 0.2);
        }

        // Tributary source label
        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.textAlign = 'right';
        ctx.fillStyle = rgb(trib.color, 0.8 + hp * 0.2);
        ctx.fillText(trib.machine, startX - 8, startY + 1);

        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t3, 0.5 + hp * 0.3);
        ctx.fillText(`${Math.round(trib.totalDur * 60)}m`, startX - 8, startY + 13);

        // Emit flowing particles
        if (Math.random() < 0.15) {
          particles.current.push({
            trib: i,
            prog: 0,
            speed: 0.004 + Math.random() * 0.005,
            off: (Math.random() - 0.5) * streamWidth * 0.6,
            sz: trib.isMain ? 1.5 + Math.random() * 1.5 : 0.8 + Math.random() * 1,
            color: trib.color,
          });
        }
      });

      // Step 1+: The merged river from confluence to mouth
      if (step >= 1) {
        const totalWidth = tributaries.reduce((s, t) => s + t.width, 0) * (w / 800);
        const riverSegments = 30;

        for (let s = 0; s < riverSegments; s++) {
          const prog = s / riverSegments;
          const prog2 = (s + 1) / riverSegments;
          const x1 = lerp(confluenceX, riverMouthX, prog);
          const x2 = lerp(confluenceX, riverMouthX, prog2);
          const y = riverMouthY;
          const curW = totalWidth * (1 + prog * 0.5);
          const wave = dampedPulse(T + prog * 200, 0.025, 0.0003) * 2;

          ctx.beginPath();
          ctx.moveTo(x1, y - curW / 2 + wave);
          ctx.lineTo(x2, y - curW / 2 + wave);
          ctx.lineTo(x2, y + curW / 2 + wave);
          ctx.lineTo(x1, y + curW / 2 + wave);
          ctx.closePath();

          const riverColor = lerpC(C.red, C.orange, prog);
          ctx.fillStyle = rgb(riverColor, 0.35);
          ctx.fill();
        }

        // Glow at river mouth
        drawGlow(ctx, riverMouthX, riverMouthY, 30, C.orange, 0.12);

        // River mouth label
        ctx.font = "bold 11px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = C.t1;
        ctx.fillText(`${totalMinutes.toFixed(0)} min`, riverMouthX + 12, riverMouthY - 8);
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('total downtime', riverMouthX + 12, riverMouthY + 6);
      }

      // Step 2+: Downstream impact labels
      if (step >= 2) {
        const impactX = riverMouthX + 10;
        const impacts = [
          { y: riverMouthY + 35, text: 'CCM-3 queue delayed', color: C.cyan },
          { y: riverMouthY + 52, text: '2 rolling mill slots lost', color: C.blue },
          { y: riverMouthY + 69, text: '1 automotive shipment at risk', color: C.amber },
        ];

        impacts.forEach((imp, i) => {
          const alpha = easeOutCubic(Math.min(1, (T - 60 * i) * 0.01));
          if (alpha <= 0) return;

          ctx.beginPath();
          ctx.moveTo(riverMouthX + 5, riverMouthY + 5);
          ctx.lineTo(impactX + 4, imp.y - 3);
          ctx.strokeStyle = rgb(imp.color, 0.15 * alpha);
          ctx.lineWidth = 0.6;
          ctx.stroke();

          ctx.font = "9px 'DM Sans',sans-serif";
          ctx.textAlign = 'left';
          ctx.fillStyle = rgb(imp.color, 0.7 * alpha);
          ctx.fillText('→ ' + imp.text, impactX + 8, imp.y);
        });
      }

      // Step 3: Cost summary bar at bottom
      if (step >= 3) {
        const barY = h * 0.88;
        const barX = w * 0.12;
        const barW = w * 0.76;

        ctx.fillStyle = rgb(C.bd, 0.25);
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, 6, 3);
        ctx.fill();

        const m21Frac = (tributaries.find(t => t.isMain)?.totalDur || 0) /
          tributaries.reduce((s, t) => s + t.totalDur, 0);
        ctx.fillStyle = rgb(C.red, 0.55);
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * m21Frac, 6, 3);
        ctx.fill();

        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.8);
        ctx.fillText(`${Math.round(m21Frac * 100)}% from M21`, barX + barW * m21Frac / 2, barY - 8);

        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.textAlign = 'center';
        ctx.fillText('127 min downtime → 51 tonnes lost → ₹4.2 Cr impact', w * 0.5, barY + 22);
      }

      // Update & draw particles
      particles.current = particles.current.filter(p => {
        p.prog += p.speed;
        if (p.prog > 1.2) return false;

        const trib = tributaries[p.trib];
        if (!trib) return false;

        const startX = tributaryStartX;
        const startY = trib.originY * h;

        let px, py;
        if (p.prog <= 1) {
          const cp1x = startX + (confluenceX - startX) * 0.3;
          const cp1y = startY;
          const cp2x = startX + (confluenceX - startX) * 0.7;
          const cp2y = riverMouthY;
          const m = 1 - p.prog;
          px = m * m * m * startX + 3 * m * m * p.prog * cp1x + 3 * m * p.prog * p.prog * cp2x + p.prog * p.prog * p.prog * confluenceX;
          py = m * m * m * startY + 3 * m * m * p.prog * cp1y + 3 * m * p.prog * p.prog * cp2y + p.prog * p.prog * p.prog * riverMouthY;
        } else {
          const riverProg = (p.prog - 1) / 0.2;
          px = lerp(confluenceX, riverMouthX, riverProg);
          py = riverMouthY;
        }

        py += p.off + dampedPulse(T + p.prog * 150, 0.04, 0.0003) * 1.5;

        const al = Math.sin(p.prog * Math.PI) * 0.6;
        ctx.beginPath();
        ctx.arc(px, py, p.sz * 2, 0, Math.PI * 2);
        ctx.fillStyle = rgb(p.color, al * 0.1);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = rgb(p.color, al);
        ctx.fill();
        return true;
      });
      if (particles.current.length > 200) particles.current = particles.current.slice(-200);

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); particles.current = []; };
  }, [w, h, step, tributaries, totalMinutes]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
