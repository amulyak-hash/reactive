import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';
import { PLANT_B_LINES } from '../../data/tataSteel';

export default function RhythmStripCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const strips = useMemo(() => {
    const padL = w * 0.1, padR = w * 0.05;
    const padT = h * 0.08, stripH = h * 0.14;
    const stripW = w - padL - padR;

    return PLANT_B_LINES.map((line, i) => {
      const isLine3 = i === 2;
      // Generate EKG-like waveform based on output
      const output = line.output / 100;
      const points = 80;
      const waveform = Array.from({ length: points }, (_, p) => {
        const x = p / points;
        if (isLine3) {
          // Arrhythmic: flatlines with occasional spikes
          const gap = Math.sin(x * 12) > 0.3;
          return gap ? 0.1 : 0.7 + Math.sin(x * 40) * 0.3;
        }
        // Healthy: regular heartbeat pattern
        const beat = Math.sin(x * Math.PI * 8);
        const spike = beat > 0.8 ? (beat - 0.8) * 5 : 0;
        return output * 0.5 + spike * 0.3 + Math.sin(x * 20) * 0.05;
      });

      return {
        ...line,
        y: padT + i * (stripH + 6),
        stripH, stripW, padL, waveform, isLine3,
        color: isLine3 ? C.red : C.blue,
      };
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
      drawDust(ctx, w, h, T, 25);

      strips.forEach((strip, si) => {
        const { y, stripH: sh, stripW: sw, padL: pl, waveform, isLine3, color } = strip;
        const visible = si <= step || step >= 2;
        const stripId = `strip-${si}`;
        const hp = hoverMap.current.get(stripId) || 0;

        // Strip background
        ctx.fillStyle = rgb(C.sf, 0.3 + 0.1 * hp);
        ctx.beginPath();
        ctx.roundRect(pl, y, sw, sh, 4);
        ctx.fill();

        // Hover highlight border
        if (hp > 0) {
          ctx.strokeStyle = rgb(color, 0.2 * hp);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(pl, y, sw, sh, 4);
          ctx.stroke();
        }

        // Label
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isLine3 ? rgb(C.red, 0.8) : rgb(C.t3, 0.5);
        ctx.fillText(strip.name, pl - 6, y + sh / 2);

        if (!visible && step < 2) return;

        // Draw EKG waveform with scrolling animation
        const scrollOffset = (T * 0.5) % sw;
        ctx.beginPath();
        waveform.forEach((val, pi) => {
          const x = pl + ((pi / waveform.length) * sw + scrollOffset) % sw;
          const wy = y + sh * (1 - val) * 0.8 + sh * 0.1;
          pi === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
        });
        ctx.strokeStyle = rgb(color, 0.6 + 0.2 * hp);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glow under waveform
        ctx.beginPath();
        waveform.forEach((val, pi) => {
          const x = pl + ((pi / waveform.length) * sw + scrollOffset) % sw;
          const wy = y + sh * (1 - val) * 0.8 + sh * 0.1;
          pi === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
        });
        ctx.lineTo(pl + sw, y + sh);
        ctx.lineTo(pl, y + sh);
        ctx.closePath();
        ctx.fillStyle = rgb(color, 0.04 + 0.02 * hp);
        ctx.fill();

        // Output label
        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(color, 0.7);
        ctx.fillText(`${strip.output}%`, pl + sw - 4, y + 12);

        // Step 1: Highlight arrhythmia on Line 3
        if (step >= 1 && isLine3) {
          drawGlow(ctx, pl + sw * 0.5, y + sh / 2, 50, C.red, 0.08);
          ctx.strokeStyle = rgb(C.red, 0.15 + dampedPulse(T, 0.04, 0.0005) * 0.05);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(pl - 1, y - 1, sw + 2, sh + 2, 5);
          ctx.stroke();
        }

        registerHitRect(hitZonesRef.current, stripId, pl, y, sw, sh, {
          label: strip.name, value: `${strip.output}% output`, sublabel: isLine3 ? 'Arrhythmic — irregular rhythm' : 'Healthy rhythm', color,
        });
      });

      // Step 3: Correlation annotation
      if (step >= 3) {
        const line3Y = strips[2].y + strips[2].stripH;
        const line4Y = strips[3].y;
        const midX = w * 0.6;

        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.moveTo(midX, line3Y + 2);
        ctx.lineTo(midX, line4Y - 2);
        ctx.strokeStyle = rgb(C.amber, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.amber, 0.6);
        ctx.fillText('compensatory spike', midX + 6, (line3Y + line4Y) / 2);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, strips]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
