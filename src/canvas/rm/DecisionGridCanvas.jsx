import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

function seededRandom(seed) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }

export default function DecisionGridCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const grid = useMemo(() => {
    const padL = w * 0.12, padR = w * 0.08, padT = h * 0.12, padB = h * 0.18;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // 847 decisions as dots
    const dots = Array.from({ length: 80 }, (_, idx) => {
      const confidence = seededRandom(idx * 3.7);
      const goodOutcome = confidence > 0.5 ? seededRandom(idx * 5.3) > 0.06 : seededRandom(idx * 5.3) > 0.3;
      const zone = confidence > 0.5 && goodOutcome ? 'green' :
        confidence > 0.5 && !goodOutcome ? 'danger' :
        confidence <= 0.5 && goodOutcome ? 'honest' : 'miss';
      return {
        x: padL + confidence * plotW,
        y: padT + (goodOutcome ? seededRandom(idx * 7.1) * plotH * 0.45 : plotH * 0.55 + seededRandom(idx * 7.1) * plotH * 0.45),
        zone, confidence, goodOutcome, id: `dot-${idx}`,
      };
    });

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

      const { padL, padT, plotW, plotH, dots } = grid;

      // Grid lines
      ctx.strokeStyle = rgb(C.bd, 0.1);
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const x = padL + (i / 4) * plotW;
        ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
        const y = padT + (i / 4) * plotH;
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
      }

      // Quadrant labels (step 1+)
      if (step >= 1) {
        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.globalAlpha = 0.4;

        ctx.fillStyle = rgb(C.green, 1);
        ctx.textAlign = 'right'; ctx.textBaseline = 'top';
        ctx.fillText('GREEN ZONE (612)', padL + plotW - 4, padT + 4);

        if (step >= 2) {
          ctx.fillStyle = rgb(C.red, 1);
          ctx.textBaseline = 'bottom';
          ctx.fillText('DANGER ZONE (23)', padL + plotW - 4, padT + plotH - 4);
        }

        if (step >= 3) {
          ctx.fillStyle = rgb(C.blue, 1);
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText('HONEST ZONE (188)', padL + 4, padT + 4);
        }

        ctx.globalAlpha = 1;
      }

      // Dots
      dots.forEach(dot => {
        let color, alpha;
        if (dot.zone === 'green') { color = C.green; alpha = step >= 1 ? 0.5 : 0.15; }
        else if (dot.zone === 'danger') { color = C.red; alpha = step >= 2 ? 0.6 : 0.1; }
        else if (dot.zone === 'honest') { color = C.blue; alpha = step >= 3 ? 0.5 : 0.1; }
        else { color = C.t3; alpha = 0.1; }

        const pulse = (dot.zone === 'danger' && step >= 2) ? dampedPulse(T, 0.04, 0.0005) * 0.15 : 0;

        const zoneLabel = dot.zone === 'green' ? 'Green zone' : dot.zone === 'danger' ? 'Danger zone' : dot.zone === 'honest' ? 'Honest zone' : 'Miss';
        registerHitCircle(hitZonesRef.current, dot.id, dot.x, dot.y, 8, {
          label: zoneLabel,
          value: `Confidence: ${(dot.confidence * 100).toFixed(0)}%`,
          sublabel: dot.goodOutcome ? 'Good outcome' : 'Bad outcome',
          color,
        });
        const hp = hoverMap.current.get(dot.id) || 0;

        if (hp > 0) drawGlow(ctx, dot.x, dot.y, 16 * hp, color, 0.2 * hp);

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3 + pulse * 3 + hp * 3, 0, Math.PI * 2);
        ctx.fillStyle = rgb(color, alpha + hp * 0.3);
        ctx.fill();
      });

      // Midline (confidence = 50%)
      const midX = padL + plotW * 0.5;
      ctx.beginPath();
      ctx.moveTo(midX, padT);
      ctx.lineTo(midX, padT + plotH);
      ctx.strokeStyle = rgb(C.t3, 0.15);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outcome midline
      const midY = padT + plotH * 0.5;
      ctx.beginPath();
      ctx.moveTo(padL, midY);
      ctx.lineTo(padL + plotW, midY);
      ctx.strokeStyle = rgb(C.t3, 0.15);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Axis labels
      ctx.font = "8px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.t4, 0.5);
      ctx.fillText('Model confidence →', padL + plotW / 2, padT + plotH + 18);

      ctx.save();
      ctx.translate(padL - 16, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Good outcome ↑', 0, 0);
      ctx.restore();

      // Glow on danger zone dots cluster
      if (step >= 2) {
        drawGlow(ctx, padL + plotW * 0.75, padT + plotH * 0.75, 30, C.red, 0.12);
      }

      // Step 2: Danger zone stat
      if (step >= 2) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('23 expensive mistakes — confident but wrong', w * 0.5, h * 0.88);
      }

      // Step 3: Honest zone stat
      if (step >= 3) {
        ctx.fillStyle = rgb(C.blue, 0.6);
        ctx.fillText('188 cautious decisions saved 31 defective shipments', w * 0.5, h * 0.93);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, grid]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
