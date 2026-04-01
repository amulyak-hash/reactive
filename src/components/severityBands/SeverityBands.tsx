import { useRef, useEffect } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { tickHoverProgress, easeOutQuart } from '../../canvas/easing';
import { CC, rgb, drawGlow, setupCanvas } from '../../canvas/canvasUtils';
import type { SeverityBandsProps } from './types';

const W = 680;
const H = 240;

const SEVERITY_COLORS: Record<string, string> = {
  Critical: CC.red,
  High:     CC.orange,
  Medium:   CC.amber,
  Low:      CC.green,
};

export function SeverityBands({ severities, 'data-testid': testId }: SeverityBandsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;
    const DURATION = 60;

    const total = severities.reduce((s, s2) => s + s2.count, 0);
    const padL = 28;
    const padR = 28;
    const padT = 50;
    const padB = 52;
    const trackW = W - padL - padR;
    const bandH = H - padT - padB;

    // Prism: narrower at top, wider at bottom per severity band
    const segWidths = severities.map(s => (s.count / total) * trackW);
    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      const rawP = Math.min(T / DURATION, 1);
      const progress = easeOutQuart(rawP);

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      // Background prism outline
      ctx.strokeStyle = rgb(CC.bd, 0.2);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(padL, padT, trackW, bandH);
      ctx.stroke();

      // Prism centerline
      ctx.strokeStyle = rgb(CC.t4, 0.15);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W / 2, padT);
      ctx.lineTo(W / 2, padT + bandH);
      ctx.stroke();
      ctx.setLineDash([]);

      let runX = padL;

      severities.forEach((sev, i) => {
        const color = SEVERITY_COLORS[sev.severity] ?? CC.blue;
        const fullW = segWidths[i];
        const drawW = fullW * progress;
        const hp = hoverMap.current.get(sev.severity) ?? 0;

        // Prism-style trapezoid — each band narrows toward top-center
        const taper = 0.15; // how much narrower at top
        const midX = runX + fullW / 2;
        const topW = fullW * (1 - taper);
        const topX = midX - topW / 2;

        // Drawn width (animated)
        const drawnFullW = fullW * progress;
        const drawnTopW = topW * progress;
        const drawnTopX = midX - drawnTopW / 2;

        if (drawnFullW > 0) {
          if (hp > 0) drawGlow(ctx, runX + drawnFullW / 2, padT + bandH / 2, drawnFullW * 0.4, color, 0.15 * hp);

          ctx.beginPath();
          ctx.moveTo(drawnTopX, padT);
          ctx.lineTo(drawnTopX + drawnTopW, padT);
          ctx.lineTo(runX + drawnFullW, padT + bandH);
          ctx.lineTo(runX, padT + bandH);
          ctx.closePath();
          ctx.fillStyle = rgb(color, 0.45 + hp * 0.25);
          ctx.fill();

          // Top edge highlight
          ctx.strokeStyle = rgb(color, (0.5 + hp * 0.3) * progress);
          ctx.lineWidth = hp > 0 ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(drawnTopX, padT);
          ctx.lineTo(drawnTopX + drawnTopW, padT);
          ctx.stroke();

          // Bottom edge
          ctx.strokeStyle = rgb(color, (0.3 + hp * 0.3) * progress);
          ctx.lineWidth = hp > 0 ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(runX, padT + bandH);
          ctx.lineTo(runX + drawnFullW, padT + bandH);
          ctx.stroke();
        }

        registerHitRect(hitZonesRef.current, sev.severity, runX, padT, fullW, bandH, {
          label: sev.severity,
          value: `${sev.count} Early Warnings`,
          sublabel: `${Math.round((sev.count / total) * 100)}% of all EWs`,
          color,
        });

        // Center labels
        if (progress > 0.5) {
          const fade = Math.min(1, (progress - 0.5) / 0.5);
          const cx = runX + fullW / 2;
          ctx.globalAlpha = fade;

          // Severity name — top above band
          ctx.font = `bold 10px 'JetBrains Mono', monospace`;
          ctx.fillStyle = hp > 0 ? color : rgb(color, 0.9);
          ctx.textAlign = 'center';
          ctx.fillText(sev.severity, cx, padT - 12);

          // Count — inside band
          ctx.font = `bold ${fullW > 80 ? '18' : '13'}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = hp > 0 ? CC.t1 : rgb(CC.t1, 0.85);
          ctx.fillText(String(sev.count), cx, padT + bandH / 2 + 6);

          // Pct below band
          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.fillStyle = hp > 0 ? color : rgb(CC.t3, 0.7);
          ctx.fillText(`${Math.round((sev.count / total) * 100)}%`, cx, padT + bandH + 18);
          ctx.globalAlpha = 1;
        }

        runX += fullW;
      });

      // Spectrum gradient overlay (very subtle)
      const specGrad = ctx.createLinearGradient(padL, 0, padL + trackW, 0);
      specGrad.addColorStop(0, rgb(CC.red, 0.03));
      specGrad.addColorStop(0.33, rgb(CC.orange, 0.03));
      specGrad.addColorStop(0.66, rgb(CC.amber, 0.03));
      specGrad.addColorStop(1, rgb(CC.green, 0.03));
      ctx.fillStyle = specGrad;
      ctx.fillRect(padL, padT, trackW * progress, bandH);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [severities]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Early Warning severity distribution — prism spectrum bands"
        style={{ width: W, height: H, display: 'block' }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
