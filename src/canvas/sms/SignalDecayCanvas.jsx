import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { easeOutCubic, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

function seededRandom(seed) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }

export default function SignalDecayCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const signal = useMemo(() => {
    const padL = w * 0.1, padR = w * 0.08;
    const padT = h * 0.12, padB = h * 0.2;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Generate signal waveform: baseline → slow drift → exponential decay
    const points = 120;
    const waveform = Array.from({ length: points }, (_, i) => {
      const minute = (i / points) * 20; // 20-minute heat
      let value = 14.2; // baseline CO2%
      if (minute > 8) value += (minute - 8) * 0.04; // linear drift
      if (minute > 14) value += Math.pow(minute - 14, 1.8) * 0.08; // exponential
      value += (seededRandom(i * 7.3) - 0.5) * 0.15; // noise
      return { minute, value, x: padL + (i / points) * plotW };
    });

    const toY = (v) => padT + plotH - ((v - 13.5) / 4) * plotH;

    // Key points for hover (every 10th point + critical points)
    const keyPoints = [];
    for (let i = 0; i < waveform.length; i += 10) {
      keyPoints.push({ ...waveform[i], idx: i });
    }

    return { padL, padT, plotW, plotH, waveform, toY, keyPoints };
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

      const { padL, padT, plotW, plotH, waveform, toY, keyPoints } = signal;

      // Threshold line (16%)
      const threshY = toY(16);
      ctx.beginPath();
      ctx.moveTo(padL, threshY);
      ctx.lineTo(padL + plotW, threshY);
      ctx.strokeStyle = rgb(C.red, 0.2);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "8px 'JetBrains Mono',monospace";
      ctx.textAlign = 'left';
      ctx.fillStyle = rgb(C.red, 0.5);
      ctx.fillText('16% threshold', padL + plotW + 4, threshY);

      // Baseline reference
      const baseY = toY(14.2);
      ctx.beginPath();
      ctx.moveTo(padL, baseY);
      ctx.lineTo(padL + plotW, baseY);
      ctx.strokeStyle = rgb(C.green, 0.1);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.fillStyle = rgb(C.green, 0.3);
      ctx.fillText('14.2% baseline', padL + plotW + 4, baseY);

      // Signal waveform (animated reveal based on step)
      const visiblePoints = Math.round(waveform.length * easeOutCubic(Math.min(1, (step + 1) * 0.3 + 0.1)));
      ctx.beginPath();
      for (let i = 0; i < visiblePoints; i++) {
        const p = waveform[i];
        const y = toY(p.value);
        i === 0 ? ctx.moveTo(p.x, y) : ctx.lineTo(p.x, y);
      }
      ctx.strokeStyle = rgb(C.cyan, 0.7);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Register hit zones for key points along the waveform
      keyPoints.forEach(kp => {
        if (kp.idx >= visiblePoints) return;
        const y = toY(kp.value);
        const phase = kp.minute <= 8 ? 'Baseline' : kp.minute <= 14 ? 'Linear drift' : 'Exponential decay';
        const color = kp.minute <= 8 ? C.green : kp.minute <= 14 ? C.amber : C.red;
        const pointId = `sig-${kp.idx}`;
        registerHitCircle(hitZonesRef.current, pointId, kp.x, y, 10, {
          label: `Min ${kp.minute.toFixed(1)}`, value: `CO₂ ${kp.value.toFixed(2)}%`, sublabel: phase, color,
        });
        const hp = hoverMap.current.get(pointId) || 0;
        if (hp > 0) {
          drawGlow(ctx, kp.x, y, 16 * hp, color, 0.2 * hp);
          ctx.beginPath();
          ctx.arc(kp.x, y, 4 * hp, 0, Math.PI * 2);
          ctx.fillStyle = rgb(color, 0.7 * hp);
          ctx.fill();
        }
      });

      // Colored segments for drift/decay phases
      if (step >= 1) {
        // Drift start marker (minute 8)
        const driftX = padL + (8 / 20) * plotW;
        ctx.beginPath();
        ctx.moveTo(driftX, padT);
        ctx.lineTo(driftX, padT + plotH);
        ctx.strokeStyle = rgb(C.amber, 0.15);
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.amber, 0.6);
        ctx.fillText('Drift begins', driftX, padT - 6);
        ctx.font = "7px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.4);
        ctx.fillText('min 8', driftX, padT + plotH + 12);
      }

      if (step >= 2) {
        // Acceleration marker (minute 14)
        const accelX = padL + (14 / 20) * plotW;
        ctx.beginPath();
        ctx.moveTo(accelX, padT);
        ctx.lineTo(accelX, padT + plotH);
        ctx.strokeStyle = rgb(C.red, 0.15);
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('Exponential', accelX, padT - 6);
        ctx.font = "7px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.4);
        ctx.fillText('min 14', accelX, padT + plotH + 12);
      }

      // Step 3: Early warning window
      if (step >= 3) {
        const earlyX = padL + (8 / 20) * plotW;
        const lateX = padL + (14 / 20) * plotW;
        drawGlow(ctx, (earlyX + lateX) / 2, padT + plotH * 0.5, 40, C.green, 0.08);

        // Window fill
        ctx.fillStyle = rgb(C.green, 0.04);
        ctx.fillRect(earlyX, padT, lateX - earlyX, plotH);

        // Window bracket
        ctx.strokeStyle = rgb(C.green, 0.25);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(earlyX, padT + plotH * 0.8);
        ctx.lineTo(earlyX, padT + plotH * 0.85);
        ctx.lineTo(lateX, padT + plotH * 0.85);
        ctx.lineTo(lateX, padT + plotH * 0.8);
        ctx.stroke();

        ctx.font = "bold 9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.green, 0.7);
        ctx.fillText('6 min early warning window', (earlyX + lateX) / 2, padT + plotH * 0.85 + 14);
      }

      // Y axis label
      ctx.save();
      ctx.translate(padL - 20, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = "8px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.t4, 0.4);
      ctx.fillText('CO₂ %', 0, 0);
      ctx.restore();

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, signal]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
