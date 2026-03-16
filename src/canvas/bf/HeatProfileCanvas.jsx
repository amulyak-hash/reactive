import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerpC } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

function seededRandom(seed) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }

export default function HeatProfileCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const heatmap = useMemo(() => {
    const cx = w * 0.42, cy = h * 0.45, R = Math.min(w, h) * 0.3;
    const gridSize = 12;
    const cells = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const dx = (c - gridSize / 2 + 0.5) / (gridSize / 2);
        const dy = (r - gridSize / 2 + 0.5) / (gridSize / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1.05) continue;
        // Zone 4 (east wall) is cold
        const isZone4 = dx > 0.3 && Math.abs(dy) < 0.5;
        const baseTemp = 1502 - dist * 30;
        const temp = isZone4 ? baseTemp - 31 : baseTemp + (seededRandom(r * 100 + c) - 0.5) * 8;
        cells.push({
          x: cx + dx * R, y: cy + dy * R,
          w: (R * 2) / gridSize - 1, h: (R * 2) / gridSize - 1,
          temp, isZone4, dist,
          id: `cell-${r}-${c}`,
        });
      }
    }
    return { cx, cy, R, cells };
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

      const { cx, cy, R, cells } = heatmap;

      // Furnace outline
      ctx.beginPath();
      ctx.arc(cx, cy, R + 5, 0, Math.PI * 2);
      ctx.strokeStyle = rgb(C.bd, 0.2);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Heatmap cells
      cells.forEach(cell => {
        const tempNorm = (cell.temp - 1440) / 80; // 1440-1520 range
        const color = lerpC(C.blue, C.orange, Math.max(0, Math.min(1, tempNorm)));
        const pulse = cell.isZone4 && step >= 1
          ? dampedPulse(T, 0.04, 0.0005) * 0.1 + Math.sin(cell.x * 0.01) * 0.02 : 0;

        const hp = hoverMap.current.get(cell.id) || 0;

        ctx.fillStyle = rgb(color, 0.35 + pulse + hp * 0.3);
        ctx.beginPath();
        ctx.roundRect(cell.x - cell.w / 2, cell.y - cell.h / 2, cell.w, cell.h, 2);
        ctx.fill();

        // Hover highlight
        if (hp > 0) {
          ctx.strokeStyle = rgb(color, 0.5 * hp);
          ctx.lineWidth = 1.5 * hp;
          ctx.stroke();
          drawGlow(ctx, cell.x, cell.y, cell.w * hp, color, 0.15 * hp);
        }

        // Cold zone highlight
        if (cell.isZone4 && step >= 1) {
          ctx.strokeStyle = rgb(C.blue, 0.2 + dampedPulse(T, 0.03, 0.0005) * 0.05);
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.roundRect(cell.x - cell.w / 2, cell.y - cell.h / 2, cell.w, cell.h, 2);
          ctx.stroke();
        }

        // Register hit zone
        registerHitRect(hitZonesRef.current, cell.id,
          cell.x - cell.w / 2, cell.y - cell.h / 2, cell.w, cell.h, {
            label: cell.isZone4 ? 'Zone 4 (cold spot)' : 'Furnace cell',
            value: `${Math.round(cell.temp)}°C`,
            sublabel: cell.isZone4 ? 'Below target' : `Dist: ${cell.dist.toFixed(2)}`,
            color: cell.isZone4 ? C.blue : C.orange,
          });
      });

      // Glow on the cold zone center
      if (step >= 1) {
        drawGlow(ctx, cx + R * 0.5, cy, R * 0.4, C.blue, 0.08);
      }

      // Zone labels
      ctx.font = "8px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.t3, 0.5);
      ctx.fillText('N', cx, cy - R - 10);
      ctx.fillText('S', cx, cy + R + 14);
      ctx.fillText('W', cx - R - 14, cy);
      ctx.fillText('E', cx + R + 14, cy);

      // Step 1: Cold spot annotation
      if (step >= 1) {
        const annotX = cx + R * 0.6, annotY = cy;
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.blue, 0.7);
        ctx.fillText('Zone 4: 1,471°C', annotX + 30, annotY - 8);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText('−31°C below target', annotX + 30, annotY + 6);

        // Arrow
        ctx.beginPath();
        ctx.moveTo(annotX + 28, annotY);
        ctx.lineTo(annotX + 8, annotY);
        ctx.strokeStyle = rgb(C.blue, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Step 2: Migration animation (rotating highlight)
      if (step >= 2) {
        const migAngle = T * 0.005;
        const migX = cx + Math.cos(migAngle) * R * 0.5;
        const migY = cy + Math.sin(migAngle) * R * 0.5;

        ctx.beginPath();
        ctx.arc(migX, migY, 12, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(C.blue, 0.15);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        drawGlow(ctx, migX, migY, 18, C.blue, 0.1);

        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.blue, 0.5);
        ctx.fillText('Cold zone migrating 15°/cycle', cx, cy + R + 30);
      }

      // Step 3: Diagnosis
      if (step >= 3) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.orange, 0.6);
        ctx.fillText('Compensating for bad feedstock — efficiency loss: 8%', cx, h * 0.88);
      }

      // Temperature scale on right
      const scaleX = w * 0.82, scaleY = h * 0.2, scaleH = h * 0.5;
      for (let i = 0; i <= 20; i++) {
        const prog = i / 20;
        const y = scaleY + prog * scaleH;
        const color = lerpC(C.orange, C.blue, prog);
        ctx.fillStyle = rgb(color, 0.4);
        ctx.fillRect(scaleX, y, 8, scaleH / 20);
      }
      ctx.font = "7px 'JetBrains Mono',monospace";
      ctx.textAlign = 'left';
      ctx.fillStyle = rgb(C.t3, 0.4);
      ctx.fillText('1520°C', scaleX + 12, scaleY + 4);
      ctx.fillText('1440°C', scaleX + 12, scaleY + scaleH + 4);

      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, heatmap]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
