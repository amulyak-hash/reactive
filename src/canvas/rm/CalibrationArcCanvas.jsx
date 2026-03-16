import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function CalibrationArcCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const arc = useMemo(() => {
    const padL = w * 0.12, padR = w * 0.08, padT = h * 0.15, padB = h * 0.2;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Calibration data: 18 months
    const months = [
      { m: 1, predicted: 90, actual: 72, label: 'M1' },
      { m: 3, predicted: 88, actual: 76, label: 'M3' },
      { m: 6, predicted: 85, actual: 81, label: 'M6' },
      { m: 9, predicted: 82, actual: 78, label: 'M9' },
      { m: 12, predicted: 75, actual: 65, label: 'M12' },
      { m: 15, predicted: 78, actual: 76, label: 'M15' },
      { m: 18, predicted: 80, actual: 80, label: 'M18' },
    ];

    const toX = (m) => padL + (m / 18) * plotW;
    const toY = (v) => padT + plotH - ((v - 50) / 50) * plotH;

    return { padL, padT, plotW, plotH, months, toX, toY };
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

      const { padL, padT, plotW, plotH, months, toX, toY } = arc;

      // Perfect calibration line (y = x)
      ctx.beginPath();
      ctx.moveTo(padL, padT + plotH);
      ctx.lineTo(padL + plotW, padT);
      ctx.strokeStyle = rgb(C.green, 0.1);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "7px 'DM Sans',sans-serif";
      ctx.textAlign = 'right';
      ctx.fillStyle = rgb(C.green, 0.3);
      ctx.fillText('perfect calibration', padL + plotW - 4, padT + 8);

      // Visible months based on step
      const visibleMonths = Math.min(step === 0 ? 2 : step === 1 ? 4 : step === 2 ? 5 : months.length, months.length);

      // Predicted confidence line
      ctx.beginPath();
      for (let i = 0; i < visibleMonths; i++) {
        const m = months[i];
        const x = toX(m.m), y = toY(m.predicted);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgb(C.amber, 0.5);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Actual accuracy line
      ctx.beginPath();
      for (let i = 0; i < visibleMonths; i++) {
        const m = months[i];
        const x = toX(m.m), y = toY(m.actual);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgb(C.blue, 0.6);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gap fills between predicted and actual
      for (let i = 0; i < visibleMonths; i++) {
        const m = months[i];
        const x = toX(m.m);
        const yP = toY(m.predicted), yA = toY(m.actual);
        const gap = Math.abs(m.predicted - m.actual);
        const gapColor = gap > 10 ? C.red : gap > 5 ? C.amber : C.green;

        const pointId = `month-${m.m}`;
        registerHitCircle(hitZonesRef.current, pointId, x, yA, 10, {
          label: m.label, value: `Predicted ${m.predicted}% / Actual ${m.actual}%`, sublabel: `Gap: ${gap}%`, color: gapColor,
        });
        const hp = hoverMap.current.get(pointId) || 0;

        // Gap line
        ctx.beginPath();
        ctx.moveTo(x, yP);
        ctx.lineTo(x, yA);
        ctx.strokeStyle = rgb(gapColor, 0.3 + hp * 0.3);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Predicted data point
        ctx.beginPath();
        ctx.arc(x, yP, 3, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.amber, 0.6);
        ctx.fill();

        // Actual data point
        const pulse = i === visibleMonths - 1 ? dampedPulse(T, 0.04, 0.0005) * 0.1 + 1 : 1;
        if (hp > 0) drawGlow(ctx, x, yA, 16 * hp, C.blue, 0.2 * hp);
        ctx.beginPath();
        ctx.arc(x, yA, (4 + hp * 3) * pulse, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.blue, 0.7 + hp * 0.2);
        ctx.fill();

        // Month label
        ctx.font = "7px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.t4, 0.5 + hp * 0.3);
        ctx.fillText(m.label, x, padT + plotH + 12);

        // Gap label
        if (gap > 3) {
          ctx.fillStyle = rgb(gapColor, 0.5);
          ctx.fillText(`${gap}%`, x + 10, (yP + yA) / 2);
        }
      }

      // Step 2: Valley highlight (month 12)
      if (step >= 2) {
        const valleyX = toX(12);
        const valleyY = toY(65);
        ctx.beginPath();
        ctx.arc(valleyX, valleyY, 14, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(C.blue, 0.15 + dampedPulse(T, 0.03, 0.0005) * 0.05);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.blue, 0.6);
        ctx.fillText('The valley: new chemistry', valleyX + 18, valleyY - 4);
        ctx.fillText('Model knows it doesn\'t know', valleyX + 18, valleyY + 9);
      }

      // Step 3: Calibrated highlight (month 18)
      if (step >= 3) {
        const calX = toX(18);
        const calY = toY(80);
        drawGlow(ctx, calX, calY, 28, C.green, 0.15);
        ctx.beginPath();
        ctx.arc(calX, calY, 10, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.green, 0.08);
        ctx.fill();
        ctx.strokeStyle = rgb(C.green, 0.3);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = "bold 9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.green, 0.7);
        ctx.fillText('Calibrated: 80% means 80%', calX, calY + 22);
      }

      // Legend
      ctx.font = "8px 'JetBrains Mono',monospace";
      ctx.textAlign = 'left';
      ctx.fillStyle = rgb(C.amber, 0.5);
      ctx.fillText('● Predicted confidence', padL, padT - 8);
      ctx.fillStyle = rgb(C.blue, 0.5);
      ctx.fillText('● Actual accuracy', padL + w * 0.25, padT - 8);

      // Y axis
      ctx.save();
      ctx.translate(padL - 18, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = "7px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.t4, 0.4);
      ctx.fillText('Accuracy %', 0, 0);
      ctx.restore();

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, arc]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
