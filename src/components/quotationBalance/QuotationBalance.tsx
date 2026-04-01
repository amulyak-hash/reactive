import { useRef, useEffect } from 'react';

import { setupCanvas } from '../../canvas/canvasUtils';
import { CC, rgb, drawGlow } from '../../canvas/canvasUtils';
import { easeOutBack, easeOutCubic } from '../../canvas/easing';
import type { QuotationBalanceProps } from './types';

const W = 500;
const H = 320;

export function QuotationBalance({ accepted, submitted, 'data-testid': testId }: QuotationBalanceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 80;

    const cx = W / 2;
    const pivotY = 100;
    const maxVal = Math.max(accepted.value, submitted.value);
    const tilt = ((accepted.value - submitted.value) / maxVal) * 14; // degrees

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutCubic(rawP);
      const tiltP = easeOutBack(Math.min(T / DURATION, 1));

      const currentTilt = tilt * tiltP;
      const tiltRad = (currentTilt * Math.PI) / 180;

      // Pivot post
      ctx.strokeStyle = rgb(CC.bd, 0.5 * progress);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, pivotY);
      ctx.lineTo(cx, H - 80);
      ctx.stroke();

      // Pivot dot
      ctx.beginPath();
      ctx.arc(cx, pivotY, 5 * progress, 0, Math.PI * 2);
      ctx.fillStyle = CC.t2;
      ctx.fill();

      // Beam
      const beamLen = 160;
      const leftEnd = {
        x: cx - Math.cos(tiltRad) * beamLen,
        y: pivotY + Math.sin(-tiltRad) * beamLen,
      };
      const rightEnd = {
        x: cx + Math.cos(tiltRad) * beamLen,
        y: pivotY + Math.sin(tiltRad) * beamLen,
      };

      ctx.strokeStyle = rgb(CC.t2, 0.5 * progress);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftEnd.x, leftEnd.y);
      ctx.lineTo(rightEnd.x, rightEnd.y);
      ctx.stroke();

      // --- Left pan: Accepted ---
      const leftPanH = Math.max(20, (accepted.value / maxVal) * 100 * progress);
      const leftPanY = leftEnd.y + 18;
      const panW = 90;

      drawGlow(ctx, leftEnd.x, leftPanY + leftPanH / 2, panW * 0.5, CC.green, 0.18 * progress);

      // Pan fill
      ctx.fillStyle = rgb(CC.green, 0.5 * progress);
      ctx.beginPath();
      ctx.roundRect(leftEnd.x - panW / 2, leftPanY, panW, leftPanH, [0, 0, 6, 6]);
      ctx.fill();
      ctx.strokeStyle = rgb(CC.green, 0.7 * progress);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pan strings
      ctx.strokeStyle = rgb(CC.t3, 0.35 * progress);
      ctx.lineWidth = 1;
      [-panW / 3, panW / 3].forEach(dx => {
        ctx.beginPath();
        ctx.moveTo(leftEnd.x + dx, leftEnd.y + 4);
        ctx.lineTo(leftEnd.x + dx, leftPanY);
        ctx.stroke();
      });

      // Left labels
      if (progress > 0.5) {
        const fade = Math.min(1, (progress - 0.5) / 0.5);
        ctx.globalAlpha = fade;
        ctx.font = "bold 14px 'JetBrains Mono', monospace";
        ctx.fillStyle = CC.green;
        ctx.textAlign = 'center';
        ctx.fillText(accepted.label, leftEnd.x, leftPanY + leftPanH + 18);
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillStyle = CC.t2;
        ctx.fillText('Accepted', leftEnd.x, leftPanY + leftPanH + 32);
        ctx.fillText(`${accepted.count} quotations`, leftEnd.x, leftPanY + leftPanH + 44);
        ctx.globalAlpha = 1;
      }

      // --- Right pan: Submitted ---
      const rightPanH = Math.max(20, (submitted.value / maxVal) * 100 * progress);
      const rightPanY = rightEnd.y + 18;

      // Pan fill
      ctx.fillStyle = rgb(CC.amber, 0.3 * progress);
      ctx.strokeStyle = rgb(CC.amber, 0.5 * progress);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightEnd.x - panW / 2, rightPanY, panW, rightPanH, [0, 0, 6, 6]);
      ctx.fill();
      ctx.stroke();

      // Pan strings
      ctx.strokeStyle = rgb(CC.t3, 0.35 * progress);
      ctx.lineWidth = 1;
      [-panW / 3, panW / 3].forEach(dx => {
        ctx.beginPath();
        ctx.moveTo(rightEnd.x + dx, rightEnd.y + 4);
        ctx.lineTo(rightEnd.x + dx, rightPanY);
        ctx.stroke();
      });

      // Right labels
      if (progress > 0.5) {
        const fade = Math.min(1, (progress - 0.5) / 0.5);
        ctx.globalAlpha = fade;
        ctx.font = "bold 14px 'JetBrains Mono', monospace";
        ctx.fillStyle = CC.amber;
        ctx.textAlign = 'center';
        ctx.fillText(submitted.label, rightEnd.x, rightPanY + rightPanH + 18);
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillStyle = CC.t2;
        ctx.fillText('Submitted', rightEnd.x, rightPanY + rightPanH + 32);
        ctx.fillText(`${submitted.count} quotations`, rightEnd.x, rightPanY + rightPanH + 44);
        ctx.globalAlpha = 1;
      }

      // Tilt angle annotation
      if (progress > 0.85 && Math.abs(tilt) > 1) {
        const fade = Math.min(1, (progress - 0.85) / 0.15);
        ctx.globalAlpha = fade * 0.6;
        ctx.font = "8px 'JetBrains Mono', monospace";
        ctx.fillStyle = CC.t3;
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.abs(tilt).toFixed(1)}° tilt toward accepted`, cx, H - 12);
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [accepted, submitted]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Quotation balance — accepted vs submitted quotation value"
        style={{ width: W, height: H, display: 'block' }}
      />
    </div>
  );
}
