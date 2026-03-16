import { useRef, useCallback } from 'react';
import { C, rgb } from '../theme/tokens';
import { HEATMAP_DATA } from '../data/tataSteel';
import { useCanvasLoop } from '../hooks/useCanvasLoop';
import { useCanvasInteraction, registerHitRect } from '../hooks/useCanvasInteraction';
import { easeOutCubic, stagger, tickHoverProgress } from './easing';
import CanvasTooltip from '../components/CanvasTooltip';

const ROWS = 5;
const COLS = 12;

function cellColor(val) {
  if (val > 0.7) return C.green;
  if (val >= 0.4) return C.amber;
  return C.red;
}

function oeeLabel(val) {
  if (val > 0.7) return 'Healthy';
  if (val >= 0.4) return 'Caution';
  return 'Critical';
}

export default function Heatmap({ width, height, animate }) {
  const canvasRef = useRef(null);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width, height });

  const draw = useCallback((ctx, progress) => {
    const pad = { left: 42, right: 6, top: 6, bottom: 24 };
    const gridW = width - pad.left - pad.right;
    const gridH = height - pad.top - pad.bottom;
    const cellW = gridW / COLS;
    const cellH = gridH / ROWS;
    const gap = 2;

    tickHoverProgress(hoverMap.current, hoveredRef.current);
    hitZonesRef.current = [];

    const hoveredCell = hoveredRef.current;

    // Row labels
    ctx.font = `9px 'JetBrains Mono', monospace`;
    ctx.fillStyle = C.t4;
    ctx.textAlign = 'right';
    for (let r = 0; r < ROWS; r++) {
      ctx.fillText(`Line ${r + 1}`, pad.left - 6, pad.top + r * cellH + cellH / 2 + 3);
    }

    // Column labels (every other)
    ctx.textAlign = 'center';
    for (let c = 0; c < COLS; c += 2) {
      const hr = c * 2;
      ctx.fillText(`${hr}:00`, pad.left + c * cellW + cellW / 2, height - 6);
    }

    // Cells
    for (let c = 0; c < COLS; c++) {
      const colP = stagger(progress, c, COLS, easeOutCubic);
      if (colP <= 0) continue;

      for (let r = 0; r < ROWS; r++) {
        const val = HEATMAP_DATA[r][c];
        const color = cellColor(val);
        const id = `cell-${r}-${c}`;
        const hp = hoverMap.current.get(id) || 0;
        const isHovered = hoveredCell === id;

        const x = pad.left + c * cellW + gap / 2;
        const y = pad.top + r * cellH + gap / 2;
        const w = cellW - gap;
        const h = cellH - gap;

        // Register hit zone
        const hr = c * 2;
        registerHitRect(hitZonesRef.current, id, x, y, w, h, {
          label: `Line ${r + 1}, ${hr}:00`,
          value: `OEE: ${(val * 100).toFixed(0)}%`,
          sublabel: oeeLabel(val),
          color,
        });

        // Dim non-hovered cells when something is hovered
        const dimFactor = hoveredCell && !isHovered ? 0.5 : 1;

        // Cell fill with scale entrance
        const scale = colP;
        ctx.fillStyle = rgb(color, val * 0.6 * dimFactor * scale + hp * 0.2);
        ctx.beginPath();
        ctx.roundRect(x, y, w * scale, h, 3);
        ctx.fill();

        // Hover border
        if (hp > 0) {
          ctx.strokeStyle = rgb(color, 0.6 * hp);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 3);
          ctx.stroke();
        }
      }
    }
  }, [width, height]);

  useCanvasLoop(canvasRef, width, height, draw, animate);

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={canvasRef} style={{ width, height, display: 'block', borderRadius: 8 }} />
      <CanvasTooltip {...tooltip} parentW={width} parentH={height} />
    </div>
  );
}
