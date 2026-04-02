import { useRef, useEffect } from 'react';

import { setupCanvas } from '../../canvas/canvasUtils';
import { CC, rgb, drawGlow } from '../../canvas/canvasUtils';
import { easeOutBack, easeOutCubic } from '../../canvas/easing';
import type { CompensationGaugeProps } from './types';

const W = 480;
const H = 340;

export function CompensationGauge({ pct, confirmed, total, 'data-testid': testId }: CompensationGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 80;
    const NEEDLE_DURATION = 72;

    const cx = W / 2;
    const cy = 220; // vertically centres arc + labels in canvas (54px top and bottom margin)
    const R = 120;
    const innerR = 74;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const totalSpan = Math.PI; // semicircle

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);
      const needleP = easeOutBack(Math.min(T / NEEDLE_DURATION, 1));

      // Background gauge track (full arc)
      ctx.beginPath();
      ctx.arc(cx, cy, R, startAngle, endAngle);
      ctx.strokeStyle = rgb(CC.bd, 0.35);
      ctx.lineWidth = R - innerR;
      ctx.stroke();

      // Color zones in the background arc (low→mid→high)
      const zones = [
        { start: 0, end: 0.33, color: CC.red },
        { start: 0.33, end: 0.66, color: CC.amber },
        { start: 0.66, end: 1.0, color: CC.green },
      ];

      zones.forEach(zone => {
        const zStart = startAngle + zone.start * totalSpan;
        const zEnd = startAngle + zone.end * totalSpan;
        ctx.beginPath();
        ctx.arc(cx, cy, (R + innerR) / 2, zStart, zEnd);
        ctx.strokeStyle = rgb(zone.color, 0.12);
        ctx.lineWidth = R - innerR - 4;
        ctx.stroke();
      });

      // Zone labels — pushed well outside the arc so they don't overlap tick %s
      [
        { label: 'Low', angle: startAngle + 0.16 * totalSpan },
        { label: 'Mid', angle: startAngle + 0.5 * totalSpan },
        { label: 'High', angle: startAngle + 0.84 * totalSpan },
      ].forEach(({ label, angle }) => {
        const lx = cx + Math.cos(angle) * (R + 46);
        const ly = cy + Math.sin(angle) * (R + 46);
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.fillStyle = rgb(CC.t3, 0.55);
        ctx.textAlign = 'center';
        ctx.fillText(label, lx, ly + 3);
      });

      // Filled gauge arc up to pct
      const fillAngle = startAngle + (pct / 100) * totalSpan * progress;
      const gaugeColor = pct >= 66 ? CC.green : pct >= 33 ? CC.amber : CC.red;

      // Glow on the fill arc tip
      const tipX = cx + Math.cos(fillAngle) * (R + innerR) / 2;
      const tipY = cy + Math.sin(fillAngle) * (R + innerR) / 2;
      drawGlow(ctx, tipX, tipY, 18, gaugeColor, 0.35 * progress);

      ctx.beginPath();
      ctx.arc(cx, cy, (R + innerR) / 2, startAngle, fillAngle);
      ctx.strokeStyle = rgb(gaugeColor, 0.7 * progress);
      ctx.lineWidth = R - innerR - 8;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt';

      // Needle — longer, with tail stub for balance
      const needleAngle = startAngle + (pct / 100) * totalSpan * needleP;
      const needleLen = innerR + 8;
      const nx = cx + Math.cos(needleAngle) * needleLen;
      const ny = cy + Math.sin(needleAngle) * needleLen;
      // Short tail in opposite direction
      const tailLen = 14;
      const tx = cx - Math.cos(needleAngle) * tailLen;
      const ty = cy - Math.sin(needleAngle) * tailLen;

      // Needle shadow/glow line
      ctx.strokeStyle = rgb(gaugeColor, 0.18 * needleP);
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      // Needle main line
      ctx.strokeStyle = rgb(CC.t1, 0.92 * needleP);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      // Needle tip dot
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, Math.PI * 2);
      ctx.fillStyle = rgb(gaugeColor, 0.9 * needleP);
      ctx.fill();

      // Pivot collar — outer glow ring + filled center
      drawGlow(ctx, cx, cy, 20, gaugeColor, 0.25 * needleP);
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.strokeStyle = rgb(gaugeColor, 0.5 * needleP);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = CC.t1;
      ctx.fill();

      // Center text — percentage above needle
      if (progress > 0.5) {
        const fade = Math.min(1, (progress - 0.5) / 0.5);
        ctx.globalAlpha = fade;
        ctx.font = `bold 22px 'JetBrains Mono', monospace`;
        ctx.fillStyle = gaugeColor;
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(pct * needleP)}%`, cx, cy - 38);
        ctx.globalAlpha = 1;
      }

      // Stats below needle
      if (progress > 0.7) {
        const fade = Math.min(1, (progress - 0.7) / 0.3);
        ctx.globalAlpha = fade;
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.fillStyle = CC.t2;
        ctx.textAlign = 'center';
        ctx.fillText('NCEs confirmed', cx, cy + 32);
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.fillStyle = CC.t2;
        ctx.fillText(`${confirmed} of ${total} NCEs are confirmed compensation events`, cx, cy + 52);
        ctx.globalAlpha = 1;
      }

      // Arc tick marks
      for (let i = 0; i <= 10; i++) {
        const tickAngle = startAngle + (i / 10) * totalSpan;
        const tickOuter = R + 8;
        const tickInner = R + 2;
        ctx.strokeStyle = rgb(CC.bd, 0.5);
        ctx.lineWidth = i % 5 === 0 ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(tickAngle) * tickInner, cy + Math.sin(tickAngle) * tickInner);
        ctx.lineTo(cx + Math.cos(tickAngle) * tickOuter, cy + Math.sin(tickAngle) * tickOuter);
        ctx.stroke();

        // Major tick % labels — sit just outside the tick, well inside zone labels
        if (i % 5 === 0) {
          const lx = cx + Math.cos(tickAngle) * (R + 18);
          const ly = cy + Math.sin(tickAngle) * (R + 18);
          ctx.font = "11px 'JetBrains Mono', monospace";
          ctx.fillStyle = rgb(CC.t3, 0.45);
          ctx.textAlign = 'center';
          ctx.fillText(`${i * 10}%`, lx, ly + 3);
        }
      }

      endAngle;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [pct, confirmed, total]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Compensation event gauge — ${pct}% of NCEs confirmed as compensation events`}
        style={{ width: W, height: H, display: 'block' }}
      />
    </div>
  );
}
