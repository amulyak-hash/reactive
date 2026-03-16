import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { HEATMAP_DATA } from '../../data/tataSteel';
import { useCanvasInteraction, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function ShadowShiftCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const grid = useMemo(() => {
    const rows = HEATMAP_DATA.length;
    const cols = HEATMAP_DATA[0].length;
    const padL = w * 0.1, padT = h * 0.1;
    const cellW = (w * 0.8) / cols;
    const cellH = (h * 0.6) / rows;

    // Planned utilization (uniform high)
    const planned = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 0.85 + Math.random() * 0.1)
    );

    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const actual = HEATMAP_DATA[r][c];
        const plan = planned[r][c];
        const divergence = Math.max(0, plan - actual);
        cells.push({
          r, c, actual, plan, divergence,
          x: padL + c * cellW,
          y: padT + r * cellH,
          w: cellW - 2,
          h: cellH - 2,
        });
      }
    }
    return { cells, rows, cols, padL, padT, cellW, cellH };
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

      const { cells, padL, padT, cellH } = grid;

      // Row labels
      ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'].forEach((name, r) => {
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = r === 2 ? rgb(C.red, 0.7) : rgb(C.t3, 0.5);
        ctx.fillText(name, padL - 8, padT + r * cellH + cellH / 2);
      });

      cells.forEach(cell => {
        const cellId = `shadow-${cell.r}-${cell.c}`;
        const hp = hoverMap.current.get(cellId) || 0;

        // Step 0: Show planned (ghost layer)
        if (step === 0) {
          ctx.fillStyle = rgb(C.blue, cell.plan * 0.25 + hp * 0.15);
          ctx.beginPath();
          ctx.roundRect(cell.x + 1, cell.y + 1, cell.w, cell.h, 3);
          ctx.fill();

          if (hp > 0) {
            ctx.strokeStyle = rgb(C.blue, 0.4 * hp);
            ctx.lineWidth = 1.5 * hp;
            ctx.stroke();
            drawGlow(ctx, cell.x + cell.w / 2, cell.y + cell.h / 2, cell.w * 0.5 * hp, C.blue, 0.12 * hp);
          }

          registerHitRect(hitZonesRef.current, cellId,
            cell.x + 1, cell.y + 1, cell.w, cell.h, {
              label: `Line ${cell.r + 1}, Hour ${cell.c + 1}`,
              value: `Planned: ${Math.round(cell.plan * 100)}%`,
              sublabel: 'Scheduled utilization',
              color: C.blue,
            });
          return;
        }

        // Step 1+: Overlay actual on planned
        // Ghost (planned) layer — faint
        ctx.fillStyle = rgb(C.blue, 0.06);
        ctx.beginPath();
        ctx.roundRect(cell.x + 1, cell.y + 1, cell.w, cell.h, 3);
        ctx.fill();

        // Actual layer
        const actualColor = cell.divergence > 0.3 ? C.red : cell.divergence > 0.1 ? C.amber : C.blue;
        ctx.fillStyle = rgb(actualColor, cell.actual * 0.35 + hp * 0.2);
        ctx.beginPath();
        ctx.roundRect(cell.x + 1, cell.y + 1, cell.w, cell.h, 3);
        ctx.fill();

        // Hover highlight
        if (hp > 0) {
          ctx.strokeStyle = rgb(actualColor, 0.5 * hp);
          ctx.lineWidth = 1.5 * hp;
          ctx.beginPath();
          ctx.roundRect(cell.x + 1, cell.y + 1, cell.w, cell.h, 3);
          ctx.stroke();
          drawGlow(ctx, cell.x + cell.w / 2, cell.y + cell.h / 2, cell.w * 0.5 * hp, actualColor, 0.12 * hp);
        }

        // Divergence bleed-through (shadow bleeding red)
        if (cell.divergence > 0.15 && step >= 1) {
          const bleedAlpha = cell.divergence * 0.5 * (0.8 + dampedPulse(T, 0.03, 0.0005) * 0.2 + Math.sin(cell.r + cell.c) * 0.1);
          ctx.fillStyle = rgb(C.red, bleedAlpha);
          ctx.beginPath();
          ctx.roundRect(cell.x + 1, cell.y + 1, cell.w, cell.h, 3);
          ctx.fill();

          // Border glow
          ctx.strokeStyle = rgb(C.red, bleedAlpha * 0.5);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(cell.x + 1, cell.y + 1, cell.w, cell.h, 3);
          ctx.stroke();
        }

        // Step 2: Zoom highlight on worst divergence (Line 3, hours 2-5)
        if (step >= 2 && cell.r === 2 && cell.c >= 1 && cell.c <= 4) {
          const zoomPulse = dampedPulse(T, 0.04, 0.0005) * 0.1 + 0.3;
          ctx.strokeStyle = rgb(C.red, zoomPulse);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(cell.x, cell.y, cell.w + 2, cell.h + 2, 4);
          ctx.stroke();

          // Divergence percentage label
          if (cell.c === 2) {
            ctx.font = "bold 9px 'JetBrains Mono',monospace";
            ctx.textAlign = 'center';
            ctx.fillStyle = rgb(C.red, 0.8);
            ctx.fillText(`−${Math.round(cell.divergence * 100)}%`, cell.x + cell.w / 2, cell.y + cell.h / 2 + 1);

            drawGlow(ctx, cell.x + cell.w / 2, cell.y + cell.h / 2, cell.w, C.red, 0.08);
          }
        }

        // Step 3: Ripple amber zones (neighboring affected cells)
        if (step >= 3 && cell.divergence > 0.05 && cell.divergence <= 0.15) {
          ctx.strokeStyle = rgb(C.amber, 0.2 + dampedPulse(T, 0.03, 0.0005) * 0.05 + Math.sin(cell.c) * 0.02);
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.roundRect(cell.x + 1, cell.y + 1, cell.w, cell.h, 3);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        registerHitRect(hitZonesRef.current, cellId,
          cell.x + 1, cell.y + 1, cell.w, cell.h, {
            label: `Line ${cell.r + 1}, Hour ${cell.c + 1}`,
            value: `Actual: ${Math.round(cell.actual * 100)}% · Plan: ${Math.round(cell.plan * 100)}%`,
            sublabel: cell.divergence > 0.15 ? `Divergence: −${Math.round(cell.divergence * 100)}%` : 'On track',
            color: actualColor,
          });
      });

      // Step 2: Annotation
      if (step >= 2) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('Line 3, hours 2-5: planned 92%, actual 28%', w * 0.5, h * 0.78);
      }

      // Step 3: Ripple summary
      if (step >= 3) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.amber, 0.6);
        ctx.fillText('Shadow spreads: Lines 2 & 4 show 8-12% deviation from plan', w * 0.5, h * 0.85);
      }

      // Legend
      ctx.font = "8px 'JetBrains Mono',monospace";
      ctx.textAlign = 'left';
      ctx.fillStyle = rgb(C.blue, 0.4);
      ctx.fillText('■ Planned', w * 0.1, h * 0.92);
      ctx.fillStyle = rgb(C.red, 0.4);
      ctx.fillText('■ Divergence', w * 0.25, h * 0.92);

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
