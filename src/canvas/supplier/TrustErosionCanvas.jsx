import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerp, lerpC } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function TrustErosionCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const spiral = useMemo(() => {
    const cx = w * 0.4, cy = h * 0.48;
    const points = 60;
    const maxR = Math.min(w * 0.3, h * 0.35);

    // Trust score over 6 months: 91% → 78%
    const trustData = [];
    for (let i = 0; i <= points; i++) {
      const prog = i / points;
      const angle = prog * Math.PI * 3.5 - Math.PI / 2;
      const r = maxR * (0.2 + prog * 0.8);
      const trust = lerp(91, 78, prog);
      const isDelay = Math.sin(prog * 12) > 0.7; // delay events
      trustData.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        trust, prog, isDelay, angle, r,
      });
    }
    return { cx, cy, maxR, trustData };
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
      t.current++;
      const T = t.current;
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 25);

      const { trustData } = spiral;
      const visiblePoints = Math.round(trustData.length * Math.min(1, (step + 1) / 3));

      // Draw spiral path
      ctx.beginPath();
      for (let i = 0; i < visiblePoints; i++) {
        const p = trustData[i];
        const _color = lerpC(C.green, C.red, 1 - (p.trust - 70) / 25);
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.strokeStyle = rgb(C.t3, 0.2);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Colored overlay segments
      for (let i = 1; i < visiblePoints; i++) {
        const p0 = trustData[i - 1], p1 = trustData[i];
        const color = lerpC(C.green, C.red, 1 - (p1.trust - 70) / 25);

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = rgb(color, 0.5);
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Delay event markers (cracks)
      trustData.forEach((p, i) => {
        if (!p.isDelay || i >= visiblePoints) return;
        const crackPulse = dampedPulse(T, 0.04, 0.0005) * 0.15 + 0.85;
        const delayColor = lerpC(C.green, C.red, 1 - (p.trust - 70) / 25);

        // Register hit zone for delay events
        const delayId = `delay-${i}`;
        registerHitCircle(hitZonesRef.current, delayId, p.x, p.y, 10, {
          label: 'Delay event',
          value: `Trust: ${Math.round(p.trust)}%`,
          sublabel: `${Math.round(p.prog * 6)}mo into period`,
          color: C.red,
        });
        const hp = hoverMap.current.get(delayId) || 0;

        if (hp > 0) drawGlow(ctx, p.x, p.y, 16 * hp, C.red, 0.2 * hp);

        ctx.beginPath();
        ctx.arc(p.x, p.y, (4 + hp * 3) * crackPulse, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.red, 0.6 + hp * 0.2);
        ctx.fill();

        // Crack line
        ctx.beginPath();
        ctx.moveTo(p.x - 3, p.y - 3);
        ctx.lineTo(p.x + 3, p.y + 3);
        ctx.strokeStyle = rgb(C.red, 0.4);
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Current trust score at spiral head
      if (visiblePoints > 0) {
        const head = trustData[visiblePoints - 1];
        const headPulse = dampedPulse(T, 0.03, 0.0005) * 0.1 + 1;
        const hColor = lerpC(C.green, C.red, 1 - (head.trust - 70) / 25);
        drawGlow(ctx, head.x, head.y, 30, hColor, 0.15);

        // Register hit zone for head
        const headId = 'spiral-head';
        registerHitCircle(hitZonesRef.current, headId, head.x, head.y, 18, {
          label: 'Current trust score',
          value: `${Math.round(head.trust)}%`,
          sublabel: 'Declining trajectory',
          color: hColor,
        });
        const headHp = hoverMap.current.get(headId) || 0;

        if (headHp > 0) drawGlow(ctx, head.x, head.y, 16 * headHp, hColor, 0.2 * headHp);

        ctx.beginPath();
        ctx.arc(head.x, head.y, (14 + headHp * 4) * headPulse, 0, Math.PI * 2);
        const hg = ctx.createRadialGradient(head.x, head.y - 3, 0, head.x, head.y, 14);
        hg.addColorStop(0, rgb(hColor, 0.85 + headHp * 0.1));
        hg.addColorStop(1, rgb(hColor, 0.5 + headHp * 0.15));
        ctx.fillStyle = hg;
        ctx.fill();

        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(`${Math.round(head.trust)}%`, head.x, head.y);
      }

      // Start label
      ctx.font = "8px 'DM Sans',sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.green, 0.5);
      ctx.fillText('6 months ago: 91%', trustData[0].x, trustData[0].y - 16);

      // Step-specific annotations on right
      const annotX = w * 0.72;

      if (step >= 1) {
        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = C.t1;
        ctx.fillText('Erosion pattern', annotX, h * 0.2);
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('6mo ago: 1 delay/quarter', annotX, h * 0.25);
        ctx.fillText('Now: 2 delays/month', annotX, h * 0.29);
      }

      if (step >= 2) {
        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.amber, 0.7);
        ctx.fillText('Buffer cost doubling', annotX, h * 0.42);
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('At 91%: 8h buffer', annotX, h * 0.47);
        ctx.fillText('At 78%: 16h buffer needed', annotX, h * 0.51);
        ctx.fillText('2× carrying cost', annotX, h * 0.55);
      }

      if (step >= 3) {
        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.red, 0.7);
        ctx.fillText('Decision point', annotX, h * 0.68);
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('Trajectory: 70% by Q3', annotX, h * 0.73);
        ctx.fillText('Below 70% triggers', annotX, h * 0.77);
        ctx.fillText('dual-sourcing protocol', annotX, h * 0.81);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.red, 0.5);
        ctx.fillText('+12% raw material cost', annotX, h * 0.86);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, spiral]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
