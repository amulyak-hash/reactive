import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { HEATMAP_DATA } from '../../data/tataSteel';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function BreathingFactoryCanvas({ w, h, step }) {
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

    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = HEATMAP_DATA[r][c];
        const isLine3 = r === 2;
        cells.push({
          r, c, val,
          cx: padL + c * cellW + cellW / 2,
          cy: padT + r * cellH + cellH / 2,
          maxR: Math.min(cellW, cellH) * 0.35,
          isLine3,
          isLow: val < 0.5,
          color: isLine3 && val < 0.5 ? C.red : val > 0.8 ? C.green : C.amber,
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

      const { cells, rows: _rows, padL, padT, cellH } = grid;

      // Row labels
      const lineNames = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'];
      lineNames.forEach((name, r) => {
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = r === 2 ? rgb(C.red, 0.7) : rgb(C.t3, 0.5);
        ctx.fillText(name, padL - 8, padT + r * cellH + cellH / 2);
      });

      // Draw each cell as a heartbeat circle
      cells.forEach((cell) => {
        const cellId = `cell-${cell.r}-${cell.c}`;
        const hp = hoverMap.current.get(cellId) || 0;

        // Heartbeat rhythm
        let beatPhase;
        if (cell.isLow) {
          beatPhase = dampedPulse(T, 0.06, 0.0005) * 0.5 +
            Math.sin(T * 0.11 + cell.c * 0.8) * 0.3 +
            Math.sin(cell.c * 2.1 + cell.r * 7) * 0.2;
          if (Math.sin(T * 0.02 + cell.c) > 0.5) beatPhase *= 0.2;
        } else {
          beatPhase = dampedPulse(T, 0.04, 0.0005) + Math.sin(cell.c * 0.6 + cell.r * 1.2) * 0.3;
        }

        const beatScale = 0.6 + (beatPhase * 0.5 + 0.5) * 0.4;
        const r = cell.maxR * beatScale * cell.val + hp * 3;

        // Glow
        const g = ctx.createRadialGradient(cell.cx, cell.cy, 0, cell.cx, cell.cy, r * 2);
        g.addColorStop(0, rgb(cell.color, 0.08 + hp * 0.1));
        g.addColorStop(1, rgb(cell.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cell.cx, cell.cy, r * 2, 0, Math.PI * 2);
        ctx.fill();

        // Circle
        ctx.beginPath();
        ctx.arc(cell.cx, cell.cy, Math.max(2, r), 0, Math.PI * 2);
        ctx.fillStyle = rgb(cell.color, 0.3 + beatScale * 0.3 + hp * 0.2);
        ctx.fill();

        // Hover glow
        if (hp > 0) {
          drawGlow(ctx, cell.cx, cell.cy, r * 2 * hp, cell.color, 0.2 * hp);
          ctx.beginPath();
          ctx.arc(cell.cx, cell.cy, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(cell.color, 0.4 * hp);
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Step 1+: Highlight arrhythmic cells
        if (step >= 1 && cell.isLow && cell.isLine3) {
          ctx.beginPath();
          ctx.arc(cell.cx, cell.cy, cell.maxR + 4, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(C.red, 0.15 + dampedPulse(T, 0.03, 0.0005) * 0.05);
          ctx.lineWidth = 1;
          ctx.stroke();

          drawGlow(ctx, cell.cx, cell.cy, cell.maxR * 1.5, C.red, 0.08);
        }

        registerHitCircle(hitZonesRef.current, cellId, cell.cx, cell.cy, cell.maxR + 4, {
          label: `Line ${cell.r + 1}, Hour ${cell.c + 1}`,
          value: `${Math.round(cell.val * 100)}% utilization`,
          sublabel: cell.isLow && cell.isLine3 ? 'Arrhythmic — critical' : cell.isLow ? 'Below threshold' : 'Nominal',
          color: cell.color,
        });
      });

      // Step 2: Compensation arrows (Line 4 absorbing Line 3)
      if (step >= 2) {
        const line3Y = padT + 2 * grid.cellH + grid.cellH / 2;
        const line4Y = padT + 3 * grid.cellH + grid.cellH / 2;
        const arrowX = w * 0.5;

        ctx.beginPath();
        ctx.moveTo(arrowX, line3Y + 15);
        ctx.lineTo(arrowX, line4Y - 15);
        ctx.strokeStyle = rgb(C.amber, 0.3);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(arrowX - 4, line4Y - 19);
        ctx.lineTo(arrowX, line4Y - 15);
        ctx.lineTo(arrowX + 4, line4Y - 19);
        ctx.strokeStyle = rgb(C.amber, 0.4);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.amber, 0.6);
        ctx.fillText('compensating → 94%', arrowX + 8, (line3Y + line4Y) / 2);
      }

      // Step 3: Vital signs summary
      if (step >= 3) {
        const sy = h * 0.82;
        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText('Factory vital signs', w * 0.5, sy);

        const stats = [
          { label: '4/5 nominal', color: C.green },
          { label: '1 critical', color: C.red },
          { label: 'Aggregate 82% masks bimodal reality', color: C.t3 },
        ];
        stats.forEach((s, i) => {
          ctx.font = "9px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(s.color, 0.7);
          ctx.fillText(s.label, w * 0.5, sy + 16 + i * 15);
        });
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
