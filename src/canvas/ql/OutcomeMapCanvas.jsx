import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

function seededRandom(seed) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }

export default function OutcomeMapCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const field = useMemo(() => {
    const padL = w * 0.1, padR = w * 0.08, padT = h * 0.12, padB = h * 0.18;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Scatter dots: green clusters (correct), orange scatter (incorrect)
    const dots = [];
    // Green cluster — standard decisions (73%)
    for (let i = 0; i < 55; i++) {
      dots.push({
        x: padL + (0.3 + seededRandom(i * 3.7) * 0.4) * plotW,
        y: padT + (0.2 + seededRandom(i * 5.3) * 0.35) * plotH,
        correct: true,
        id: `dot-g-${i}`,
      });
    }
    // Orange scatter — edge cases (27%)
    for (let i = 0; i < 20; i++) {
      dots.push({
        x: padL + seededRandom(i * 11.3) * plotW,
        y: padT + (0.1 + seededRandom(i * 13.7) * 0.8) * plotH,
        correct: false,
        edge: true,
        id: `dot-o-${i}`,
      });
    }

    return { padL, padT, plotW, plotH, dots };
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

      const { padL, padT, plotW, plotH, dots } = field;

      // Background grid
      ctx.strokeStyle = rgb(C.bd, 0.06);
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 8; i++) {
        const x = padL + (i / 8) * plotW;
        ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
        const y = padT + (i / 8) * plotH;
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
      }

      // Draw dots
      dots.forEach((dot) => {
        const color = dot.correct ? C.green : C.orange;
        const alpha = dot.correct ? (step >= 1 ? 0.45 : 0.15) : (step >= 2 ? 0.55 : 0.1);
        const pulse = !dot.correct && step >= 2 ? dampedPulse(T, 0.04, 0.0005) * 0.08 : 0;

        registerHitCircle(hitZonesRef.current, dot.id, dot.x, dot.y, 8, {
          label: dot.correct ? 'Correct decision' : 'Edge case',
          value: dot.correct ? 'Standard zone' : 'Boundary zone',
          sublabel: dot.correct ? '73% cluster' : '27% scatter',
          color,
        });
        const hp = hoverMap.current.get(dot.id) || 0;

        if (hp > 0) drawGlow(ctx, dot.x, dot.y, 16 * hp, color, 0.2 * hp);

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3 + pulse * 3 + hp * 3, 0, Math.PI * 2);
        ctx.fillStyle = rgb(color, alpha + hp * 0.3);
        ctx.fill();
      });

      // Glow on the green cluster center
      if (step >= 1) drawGlow(ctx, padL + plotW * 0.5, padT + plotH * 0.35, 35, C.green, 0.1);

      // Step 1: Green cluster label
      if (step >= 1) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'right';
        ctx.fillStyle = rgb(C.green, 0.6);
        ctx.fillText('Correct decisions cluster', padL + plotW * 0.75, padT + plotH * 0.15);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.4);
        ctx.fillText('73% of total — standard zones', padL + plotW * 0.75, padT + plotH * 0.19);
      }

      // Step 2: Orange scatter label
      if (step >= 2) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.orange, 0.6);
        ctx.fillText('Incorrect at boundaries', padL + plotW * 0.05, padT + plotH * 0.85);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.4);
        ctx.fillText('Grade transitions, unusual chemistry', padL + plotW * 0.05, padT + plotH * 0.89);
      }

      // Step 3: Decision boundary curve
      if (step >= 3) {
        ctx.beginPath();
        for (let x = 0; x <= 1; x += 0.02) {
          const px = padL + x * plotW;
          // Curved boundary
          const boundaryY = padT + plotH * (0.55 + Math.sin(x * Math.PI * 1.5) * 0.12);
          x === 0 ? ctx.moveTo(px, boundaryY) : ctx.lineTo(px, boundaryY);
        }
        ctx.strokeStyle = rgb(C.amber, 0.3 + dampedPulse(T, 0.02, 0.0005) * 0.05);
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.amber, 0.6);
        ctx.fillText('Decision boundary — above: ship, below: re-inspect', padL + plotW / 2, padT + plotH + 14);
        ctx.fillText('Curves around difficult zones', padL + plotW / 2, padT + plotH + 28);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, field]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
