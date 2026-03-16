import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, easeOutCubic, tickHoverProgress } from '../easing';
import { HEATMAP_DATA } from '../../data/tataSteel';
import { useCanvasInteraction, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function DominoCascadeCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const grid = useMemo(() => {
    const rows = 5, cols = 12;
    const padL = w * 0.1, padT = h * 0.1;
    const cellW = (w * 0.8) / cols;
    const cellH = (h * 0.55) / rows;

    // Origin: Line 3, hour 2
    const originR = 2, originC = 1;

    const dominoes = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dist = Math.abs(r - originR) + Math.abs(c - originC);
        dominoes.push({
          r, c,
          cx: padL + c * cellW + cellW / 2,
          cy: padT + r * cellH + cellH / 2,
          w: cellW * 0.6,
          h: cellH * 0.75,
          val: HEATMAP_DATA[r]?.[c] || 0.8,
          dist,
          isOrigin: r === originR && c === originC,
        });
      }
    }
    return { dominoes, padL, padT, cellW, cellH };
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

      const { dominoes, padL, padT, cellH } = grid;

      // Row labels
      ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'].forEach((name, r) => {
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = r === 2 ? rgb(C.red, 0.7) : rgb(C.t3, 0.5);
        ctx.fillText(name, padL - 8, padT + r * cellH + cellH / 2);
      });

      // Ripple wave radius based on step
      const rippleMaxDist = step === 0 ? 0 : step === 1 ? 3 : step === 2 ? 6 : 12;
      const rippleAnimDist = rippleMaxDist + dampedPulse(T, 0.02, 0.0005) * 0.5;

      dominoes.forEach(dom => {
        const inRipple = dom.dist <= rippleAnimDist && step >= 1;
        const isFalling = inRipple && dom.val < 0.5;
        const domId = `dom-${dom.r}-${dom.c}`;
        const hp = hoverMap.current.get(domId) || 0;

        // Tilt angle for falling dominoes — eased growth
        let tilt = 0;
        if (dom.isOrigin && step >= 0) {
          tilt = easeOutCubic(Math.min(T * 0.002, 1)) * 0.4;
        } else if (isFalling) {
          const delay = dom.dist * 15;
          tilt = easeOutCubic(Math.min(Math.max(0, (T - delay) * 0.003), 1)) * 0.35;
        } else if (inRipple) {
          const delay = dom.dist * 15;
          tilt = easeOutCubic(Math.min(Math.max(0, (T - delay) * 0.001), 1)) * 0.15;
        }

        ctx.save();
        ctx.translate(dom.cx, dom.cy);
        ctx.rotate(tilt);

        // Domino body
        const color = dom.isOrigin ? C.red :
          isFalling ? C.orange :
          inRipple ? C.amber :
          dom.val > 0.7 ? C.blue : C.t4;

        ctx.beginPath();
        ctx.roundRect(-dom.w / 2, -dom.h / 2, dom.w, dom.h, 3);
        ctx.fillStyle = rgb(color, (inRipple ? 0.25 : 0.1) + hp * 0.2);
        ctx.fill();
        ctx.strokeStyle = rgb(color, (inRipple ? 0.4 : 0.15) + hp * 0.3);
        ctx.lineWidth = 1 + hp;
        ctx.stroke();

        // Domino dots
        const dots = Math.round(dom.val * 4);
        const dotPositions = [
          [[0, 0]],
          [[-0.25, -0.25], [0.25, 0.25]],
          [[-0.25, -0.25], [0, 0], [0.25, 0.25]],
          [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]],
        ];
        const positions = dotPositions[Math.min(dots, 3)] || dotPositions[0];
        positions.forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.arc(dx * dom.w * 0.3, dy * dom.h * 0.3, 2, 0, Math.PI * 2);
          ctx.fillStyle = rgb(color, (inRipple ? 0.6 : 0.25) + hp * 0.2);
          ctx.fill();
        });

        ctx.restore();

        // Hover glow (drawn after restore so it's not rotated)
        if (hp > 0) {
          drawGlow(ctx, dom.cx, dom.cy, dom.w * hp, color, 0.15 * hp);
        }

        // Origin marker
        if (dom.isOrigin && step >= 0) {
          const pulseR = 20 + (T * 0.3 % 30);
          const pulseA = Math.max(0, 1 - pulseR / 50) * 0.2;
          ctx.beginPath();
          ctx.arc(dom.cx, dom.cy, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(C.red, pulseA);
          ctx.lineWidth = 1.5;
          ctx.stroke();

          drawGlow(ctx, dom.cx, dom.cy, 30, C.red, 0.1);
        }

        // Ripple ring at wave front
        if (step >= 1 && Math.abs(dom.dist - Math.floor(rippleAnimDist)) < 0.5) {
          ctx.beginPath();
          ctx.arc(dom.cx, dom.cy, dom.w * 0.8, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(C.amber, 0.1);
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        registerHitRect(hitZonesRef.current, domId,
          dom.cx - dom.w / 2, dom.cy - dom.h / 2, dom.w, dom.h, {
            label: `Line ${dom.r + 1}, Hour ${dom.c + 1}`,
            value: `${Math.round(dom.val * 100)}% util`,
            sublabel: dom.isOrigin ? 'Origin — first domino' : isFalling ? 'Falling' : inRipple ? 'In ripple zone' : 'Stable',
            color,
          });
      });

      // Step labels
      const labelY = h * 0.78;
      ctx.font = "bold 10px 'DM Sans',sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = C.t1;

      if (step === 0) {
        ctx.fillText('Hour 2, Line 3: first domino tilts', w * 0.5, labelY);
      } else if (step === 1) {
        ctx.fillText('Local wave: CCM-3 starves', w * 0.5, labelY);
      } else if (step === 2) {
        ctx.fillText('Cross-line: Line 4 absorbs overflow at 97%', w * 0.5, labelY);
      } else {
        ctx.fillText('5 hours: 3 lines affected, 2 schedule changes, 1 quality hold', w * 0.5, labelY);
      }

      // Cascade stats (step 3)
      if (step >= 3) {
        const affected = dominoes.filter(d => d.dist <= rippleMaxDist).length;
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t2, 0.5);
        ctx.fillText(`${affected} cells in cascade zone`, w * 0.5, labelY + 18);
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
