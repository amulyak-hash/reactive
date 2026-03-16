import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, easeOutCubic, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';
import { PLANTS } from '../../data/tataSteel';

export default function TheRaceCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const tracks = useMemo(() => {
    const padL = w * 0.12, padR = w * 0.08;
    const padT = h * 0.12, trackH = h * 0.14;
    const trackW = w - padL - padR;

    return PLANTS.map((p, i) => ({
      ...p,
      y: padT + i * (trackH + 10),
      trackH,
      trackW,
      padL,
      // Simulate quarter progress: all start at expected, B falls behind
      progress: p.actual / p.expected,
    }));
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

      tracks.forEach((track, ti) => {
        const { y, trackH: th, trackW: tw, padL: pl } = track;
        const isPlantB = ti === 1;
        const trColor = isPlantB ? C.red : track.color;
        const trackId = `track-${ti}`;
        const hp = hoverMap.current.get(trackId) || 0;

        // Track lane
        ctx.fillStyle = rgb(C.sf, 0.5 + 0.1 * hp);
        ctx.beginPath();
        ctx.roundRect(pl, y, tw, th, 6);
        ctx.fill();
        ctx.strokeStyle = rgb(C.bd, 0.2 + 0.1 * hp);
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Lane markings (dashes)
        ctx.beginPath();
        ctx.setLineDash([8, 12]);
        ctx.moveTo(pl, y + th / 2);
        ctx.lineTo(pl + tw, y + th / 2);
        ctx.strokeStyle = rgb(C.bd, 0.08);
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Runner position (animated dot)
        const targetProg = step >= 1 ? track.progress : 0.92;
        const animProg = Math.min(targetProg, targetProg * easeOutCubic(Math.min(1, T * 0.005)));
        const runnerX = pl + tw * animProg;
        const runnerY = y + th / 2;
        const pulse = dampedPulse(T, 0.05, 0.0005) * 2;

        // Trail
        const trailGrad = ctx.createLinearGradient(pl, 0, runnerX, 0);
        trailGrad.addColorStop(0, rgb(trColor, 0));
        trailGrad.addColorStop(1, rgb(trColor, 0.15 + 0.05 * hp));
        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.roundRect(pl, y + th * 0.3, runnerX - pl, th * 0.4, 3);
        ctx.fill();

        // Runner dot
        if (isPlantB) drawGlow(ctx, runnerX, runnerY + pulse, 28, C.red, 0.15);
        if (hp > 0) drawGlow(ctx, runnerX, runnerY + pulse, 16 * hp, trColor, 0.2 * hp);

        const rGlow = ctx.createRadialGradient(runnerX, runnerY + pulse, 0, runnerX, runnerY + pulse, 16);
        rGlow.addColorStop(0, rgb(trColor, 0.2 + 0.1 * hp));
        rGlow.addColorStop(1, rgb(trColor, 0));
        ctx.fillStyle = rGlow;
        ctx.beginPath();
        ctx.arc(runnerX, runnerY + pulse, 16, 0, Math.PI * 2);
        ctx.fill();

        const rg = ctx.createRadialGradient(runnerX, runnerY + pulse - 2, 0, runnerX, runnerY + pulse, 8);
        rg.addColorStop(0, rgb(trColor, 0.9));
        rg.addColorStop(1, rgb(trColor, 0.5));
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(runnerX, runnerY + pulse, 8, 0, Math.PI * 2);
        ctx.fill();

        // Plant label
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isPlantB ? rgb(C.red, 0.8) : rgb(C.t2, 0.6);
        ctx.fillText(track.name.split('·')[0].trim(), pl - 6, y + th / 2);

        // Percentage at runner
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText(`${track.actual}%`, runnerX, runnerY + pulse);

        registerHitCircle(hitZonesRef.current, trackId, runnerX, runnerY, 16, {
          label: track.name.split('·')[0].trim(), value: `${track.actual}% actual`, sublabel: `Target: ${track.expected}% · Progress: ${Math.round(track.progress * 100)}%`, color: trColor,
        });
      });

      // Step 2+: Gap indicator between Plant A and B
      if (step >= 2) {
        const pA = tracks[0], pB = tracks[1];
        const axA = pA.padL + pA.trackW * (pA.actual / pA.expected);
        const axB = pB.padL + pB.trackW * (pB.actual / pB.expected);
        const _gap = axA - axB;

        ctx.beginPath();
        ctx.setLineDash([2, 3]);
        ctx.moveTo(axA, pA.y + pA.trackH);
        ctx.lineTo(axA, pB.y);
        ctx.moveTo(axB, pA.y + pA.trackH);
        ctx.lineTo(axB, pB.y);
        ctx.strokeStyle = rgb(C.red, 0.2);
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.setLineDash([]);

        // Gap label
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText(`−${pA.actual - pB.actual}%`, (axA + axB) / 2, (pA.y + pA.trackH + pB.y) / 2);
      }

      // Step 3: Revenue analysis
      if (step >= 3) {
        const sy = h * 0.82;
        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText('Plant B deficit: 1,530 tonnes below target', w * 0.5, sy);
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('At Plant A pace: revenue gap closes by ₹12.4 Cr', w * 0.5, sy + 16);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, tracks]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
