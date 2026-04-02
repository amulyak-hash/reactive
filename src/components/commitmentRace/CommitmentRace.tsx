import { useRef, useEffect } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from '../../canvas/useCanvasInteraction';
import { easeOutCubic } from '../../canvas/easing';
import { CC, rgb, drawGlow, drawDust, drawScanline, setupCanvas } from '../../canvas/canvasUtils';
import type { CommitmentRaceProps } from './types';

const W = 680;
const H = 300;

const RACE_COLORS = [CC.green, CC.blue, CC.cyan, CC.amber, CC.red];

export function CommitmentRace({ contractors, 'data-testid': testId }: CommitmentRaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const hoverMap = useRef<Map<string, number>>(new Map());

  // Sort by commitmentPct descending
  const sorted = [...contractors].sort((a, b) => b.commitmentPct - a.commitmentPct);

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;

    const padL = W * 0.13;
    const padR = W * 0.08;
    const padT = H * 0.08;
    const trackH = H * 0.14;
    const trackW = W - padL - padR;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);
      hitZonesRef.current = [];

      // Tick hover map
      hoverMap.current.forEach((val, id) => {
        const target = id === hoveredRef.current ? 1 : 0;
        const next = val + (target - val) * 0.12;
        if (Math.abs(next - target) < 0.005) {
          if (target === 0) hoverMap.current.delete(id);
          else hoverMap.current.set(id, 1);
        } else {
          hoverMap.current.set(id, next);
        }
      });
      if (hoveredRef.current && !hoverMap.current.has(hoveredRef.current)) {
        hoverMap.current.set(hoveredRef.current, 0);
      }

      drawDust(ctx, W, H, T, 40, rgb(CC.blue, 0.04));

      sorted.forEach((contractor, i) => {
        const color = RACE_COLORS[i % RACE_COLORS.length];
        const hp = hoverMap.current.get(contractor.id) ?? 0;
        const trackY = padT + i * (trackH + 10);

        // Lane fill
        ctx.fillStyle = rgb(color, 0.04 + hp * 0.04);
        ctx.beginPath();
        ctx.roundRect(padL, trackY, trackW, trackH, 3);
        ctx.fill();

        // Dashed center line
        ctx.strokeStyle = rgb(color, 0.08);
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, trackY + trackH / 2);
        ctx.lineTo(padL + trackW, trackY + trackH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Runner animation
        const trackProgress = contractor.commitmentPct / 100;
        const animProg = Math.min(trackProgress, trackProgress * easeOutCubic(Math.min(1, T * 0.005)));
        const runnerX = padL + trackW * animProg;

        // Gradient trail
        if (runnerX > padL + 4) {
          const trailGrad = ctx.createLinearGradient(padL, 0, runnerX, 0);
          trailGrad.addColorStop(0, rgb(color, 0.02));
          trailGrad.addColorStop(1, rgb(color, 0.25 + hp * 0.15));
          ctx.fillStyle = trailGrad;
          ctx.beginPath();
          ctx.roundRect(padL, trackY + 2, runnerX - padL, trackH - 4, 2);
          ctx.fill();
        }

        // Runner dot glow
        drawGlow(ctx, runnerX, trackY + trackH / 2, 18 + hp * 8, color, (0.3 + hp * 0.2));
        ctx.beginPath();
        ctx.arc(runnerX, trackY + trackH / 2, 5 + hp * 2, 0, Math.PI * 2);
        ctx.fillStyle = rgb(color, 0.9);
        ctx.fill();

        // Register hit on runner dot
        registerHitCircle(
          hitZonesRef.current,
          contractor.id,
          runnerX,
          trackY + trackH / 2,
          14,
          {
            label: contractor.name,
            value: `${contractor.commitmentPct}% commitment`,
            sublabel: `Base: £${contractor.base}M · Variations: £${contractor.variations}M`,
            color,
          },
        );

        // Runner percentage label
        ctx.font = `bold 10px 'JetBrains Mono', monospace`;
        ctx.fillStyle = rgb(color, 0.9 + hp * 0.1);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${contractor.commitmentPct}%`, runnerX + 10, trackY + trackH / 2);

        // Left label: contractor shortName
        ctx.font = `${hp > 0 ? 'bold ' : ''}10px 'JetBrains Mono', monospace`;
        ctx.fillStyle = hp > 0 ? color : rgb(CC.t2, 0.8);
        ctx.textAlign = 'right';
        ctx.fillText(contractor.shortName, padL - 8, trackY + trackH / 2);
      });

      // Finish line
      ctx.strokeStyle = rgb(CC.t3, 0.3);
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(padL + trackW, padT);
      ctx.lineTo(padL + trackW, padT + (sorted.length - 1) * (trackH + 10) + trackH);
      ctx.stroke();

      drawScanline(ctx, W, H, T, 0.015);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [sorted]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Commitment race — contractors ranked by commitment percentage"
        style={{ width: W, height: H, display: 'block', borderRadius: 8 }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
