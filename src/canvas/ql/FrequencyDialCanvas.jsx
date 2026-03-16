import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerpC } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function FrequencyDialCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const dial = useMemo(() => {
    const cx = w * 0.38, cy = h * 0.45;
    const R = Math.min(w * 0.28, h * 0.32);
    // Current reading: 7 out of 10
    const current = step >= 1 ? 7 : 5;
    const target = 9;
    const history = [5, 5.3, 5.8, 6.2, 6.5, 7]; // 6 months
    return { cx, cy, R, current, target, history };
  }, [w, h, step]);

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

      const { cx, cy, R, current, target, history } = dial;

      // Dial arc (0-10 scale, 180° arc)
      const startAngle = Math.PI * 0.8;
      const endAngle = Math.PI * 2.2;
      const angleRange = endAngle - startAngle;

      // Background arc
      ctx.beginPath();
      ctx.arc(cx, cy, R, startAngle, endAngle);
      ctx.strokeStyle = rgb(C.bd, 0.2);
      ctx.lineWidth = 16;
      ctx.lineCap = 'butt';
      ctx.stroke();

      // Colored arc segments (0-10)
      for (let i = 0; i < 10; i++) {
        const segStart = startAngle + (i / 10) * angleRange;
        const segEnd = startAngle + ((i + 1) / 10) * angleRange;
        const filled = i < current;
        const color = i < 5 ? lerpC(C.red, C.amber, i / 5) : lerpC(C.amber, C.green, (i - 5) / 5);

        // Hit zone at segment midpoint
        const segMidAngle = (segStart + segEnd) / 2;
        const hitX = cx + Math.cos(segMidAngle) * R;
        const hitY = cy + Math.sin(segMidAngle) * R;
        const segId = `seg-${i}`;
        registerHitCircle(hitZonesRef.current, segId, hitX, hitY, 12, {
          label: `Score ${i + 1}/10`, value: filled ? 'Achieved' : 'Not yet', sublabel: filled ? 'Pass' : 'Fail', color,
        });
        const hp = hoverMap.current.get(segId) || 0;

        ctx.beginPath();
        ctx.arc(cx, cy, R, segStart + 0.02, segEnd - 0.02);
        ctx.strokeStyle = rgb(color, (filled ? 0.6 : 0.08) + hp * 0.25);
        ctx.lineWidth = 14;
        ctx.stroke();

        if (hp > 0) drawGlow(ctx, hitX, hitY, 16 * hp, color, 0.2 * hp);

        // Tick mark
        const tickAngle = segStart;
        const tickInner = R - 12;
        const tickOuter = R + 12;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(tickAngle) * tickInner, cy + Math.sin(tickAngle) * tickInner);
        ctx.lineTo(cx + Math.cos(tickAngle) * tickOuter, cy + Math.sin(tickAngle) * tickOuter);
        ctx.strokeStyle = rgb(C.bd, 0.15);
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Number
        const numR = R + 22;
        const numAngle = (segStart + segEnd) / 2;
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(C.t3, (filled ? 0.6 : 0.25) + hp * 0.3);
        ctx.fillText(`${i + 1}`, cx + Math.cos(numAngle) * numR, cy + Math.sin(numAngle) * numR);
      }

      // Needle
      const needleAngle = startAngle + (current / 10) * angleRange;
      const needleLen = R * 0.75;
      const sway = dampedPulse(T, 0.02, 0.0005) * 0.01;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(needleAngle + sway) * needleLen,
        cy + Math.sin(needleAngle + sway) * needleLen
      );
      ctx.strokeStyle = rgb(C.t1, 0.6);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Needle hub
      drawGlow(ctx, cx, cy, 18, '#F1F5F9', 0.1);
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = rgb(C.t1, 0.4);
      ctx.fill();

      // Center reading
      ctx.font = "bold 28px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = C.t1;
      ctx.fillText(`${current}`, cx, cy + R * 0.35);
      ctx.font = "10px 'DM Sans',sans-serif";
      ctx.fillStyle = rgb(C.t2, 0.6);
      ctx.fillText('out of 10', cx, cy + R * 0.35 + 18);

      // Step 1: Natural frequency text
      if (step >= 1) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('7 pass, 3 fail — tangible, not abstract', cx, cy + R * 0.35 + 38);
      }

      // Step 2: History trend on right
      if (step >= 2) {
        const hx = w * 0.72, hy = h * 0.15;
        ctx.font = "bold 9px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = C.t1;
        ctx.fillText('Improvement trajectory', hx, hy);

        const trendW = w * 0.22, trendH = h * 0.25;
        history.forEach((val, i) => {
          const x = hx + (i / (history.length - 1)) * trendW;
          const y = hy + 14 + trendH - (val / 10) * trendH;
          const color = lerpC(C.amber, C.green, val / 10);

          const dotId = `trend-${i}`;
          registerHitCircle(hitZonesRef.current, dotId, x, y, 8, {
            label: `Month ${i + 1}`, value: `${val}/10`, sublabel: 'Quality score', color,
          });
          const hp = hoverMap.current.get(dotId) || 0;

          if (i > 0) {
            const px = hx + ((i - 1) / (history.length - 1)) * trendW;
            const py = hy + 14 + trendH - (history[i - 1] / 10) * trendH;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(x, y);
            ctx.strokeStyle = rgb(color, 0.4);
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          if (hp > 0) drawGlow(ctx, x, y, 16 * hp, color, 0.2 * hp);

          ctx.beginPath();
          ctx.arc(x, y, 3 + hp * 3, 0, Math.PI * 2);
          ctx.fillStyle = rgb(color, 0.6 + hp * 0.3);
          ctx.fill();
        });

        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.4);
        ctx.fillText('+0.3/month', hx, hy + trendH + 22);
      }

      // Step 3: Target dial
      if (step >= 3) {
        // Target marker on arc
        const targetAngle = startAngle + (target / 10) * angleRange;
        const tX = cx + Math.cos(targetAngle) * (R + 8);
        const tY = cy + Math.sin(targetAngle) * (R + 8);

        const targetId = 'target';
        registerHitCircle(hitZonesRef.current, targetId, tX, tY, 10, {
          label: 'Target', value: '9/10 by Q4', sublabel: 'Improvement goal', color: C.green,
        });
        const thp = hoverMap.current.get(targetId) || 0;

        ctx.beginPath();
        ctx.arc(tX, tY, 5 + thp * 3, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.green, 0.5 + dampedPulse(T, 0.04, 0.0005) * 0.15 + thp * 0.2);
        ctx.fill();
        if (thp > 0) drawGlow(ctx, tX, tY, 16 * thp, C.green, 0.2 * thp);

        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.green, 0.6);
        ctx.fillText('Target: 9/10 by Q4', tX + 10, tY - 4);
        ctx.font = "7px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.4);
        ctx.fillText('1/10 = cost of honest uncertainty', tX + 10, tY + 9);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, dial]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
