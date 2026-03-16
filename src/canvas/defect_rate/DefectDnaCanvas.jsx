import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { DEFECT_DATA } from '../../data/tataSteel';
import { dampedPulse, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function DefectDnaCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const helix = useMemo(() => {
    const cx = w * 0.4, topY = h * 0.08, botY = h * 0.75;
    const helixW = w * 0.18;
    const types = [
      { name: 'Surface cracks', color: C.blue, ratio: [0.5, 0.5, 0.5, 0.5, 0.5, 0.2, 0.15] },
      { name: 'Thickness var.', color: C.amber, ratio: [0.3, 0.3, 0.3, 0.3, 0.3, 0.2, 0.25] },
      { name: 'Edge wave', color: C.red, ratio: [0.2, 0.2, 0.2, 0.2, 0.2, 0.6, 0.6] },
    ];

    const rungs = DEFECT_DATA.map((d, i) => ({
      day: d.day, rate: d.rate, idx: i,
      y: topY + (i / (DEFECT_DATA.length - 1)) * (botY - topY),
      strands: types.map(t => ({ ...t, val: t.ratio[i] * d.rate })),
    }));

    return { cx, helixW, topY, botY, rungs, types };
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
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 30);

      // Tick hover animations
      tickHoverProgress(hoverMap.current, hoveredRef.current);

      const { cx, helixW, rungs, types } = helix;

      // Reset hit zones
      hitZonesRef.current = [];

      // Draw helix backbone
      const backbonePoints = 80;
      for (let strand = 0; strand < 2; strand++) {
        ctx.beginPath();
        for (let i = 0; i <= backbonePoints; i++) {
          const prog = i / backbonePoints;
          const y = helix.topY + prog * (helix.botY - helix.topY);
          const phase = prog * Math.PI * 3 + T * 0.01 + strand * Math.PI;
          const x = cx + Math.sin(phase) * helixW;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgb(C.bd, 0.2);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw rungs
      rungs.forEach((rung, ri) => {
        const phase = (ri / rungs.length) * Math.PI * 3 + T * 0.01;
        const x1 = cx + Math.sin(phase) * helixW;
        const x2 = cx + Math.sin(phase + Math.PI) * helixW;
        const hp = hoverMap.current.get(`rung-${ri}`) || 0;

        // Register hit zone for the rung
        const rungLeft = Math.min(x1, x2) - 10;
        const rungRight = Math.max(x1, x2) + 10;
        registerHitRect(hitZonesRef.current, `rung-${ri}`, rungLeft, rung.y - 8, rungRight - rungLeft, 16, {
          label: rung.day,
          value: `${rung.rate.toFixed(1)}% defect rate`,
          sublabel: rung.strands.map(s => `${s.name}: ${(s.val / rung.rate * 100).toFixed(0)}%`).join(' · '),
          color: rung.rate > 0.7 ? C.red : C.blue,
        });

        // Rung connection (brighter on hover)
        ctx.beginPath();
        ctx.moveTo(x1, rung.y);
        ctx.lineTo(x2, rung.y);
        ctx.strokeStyle = rgb(C.bd, 0.15 + hp * 0.2);
        ctx.lineWidth = 0.5 + hp * 1;
        ctx.stroke();

        // Glow on hovered rung
        if (hp > 0) {
          drawGlow(ctx, cx, rung.y, helixW * 0.8, rung.rate > 0.7 ? C.red : C.blue, hp * 0.1);
        }

        // Day label
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(C.t3, 0.5 + hp * 0.3);
        ctx.fillText(rung.day, cx - helixW - 14, rung.y);

        // Rate label
        ctx.textAlign = 'left';
        ctx.fillStyle = rung.rate > 0.7 ? rgb(C.red, 0.7 + hp * 0.3) : rgb(C.t3, 0.5 + hp * 0.3);
        ctx.fillText(`${rung.rate.toFixed(1)}%`, cx + helixW + 14, rung.y);

        // Step 1+: Split strands as colored segments on the rung
        if (step >= 1) {
          const totalLen = Math.abs(x2 - x1);
          let offset = Math.min(x1, x2);

          rung.strands.forEach((strand, si) => {
            const segLen = totalLen * strand.val / rung.rate;
            const pulse = dampedPulse(T, 0.03 + ri * 0.002 + si * 0.004, 0.0005) * 0.1 + 0.9;

            ctx.beginPath();
            ctx.moveTo(offset, rung.y - 3);
            ctx.lineTo(offset + segLen, rung.y - 3);
            ctx.lineTo(offset + segLen, rung.y + 3);
            ctx.lineTo(offset, rung.y + 3);
            ctx.closePath();
            ctx.fillStyle = rgb(strand.color, (0.4 + hp * 0.25) * pulse);
            ctx.fill();

            offset += segLen;
          });
        }

        // Step 2: Highlight recurring gene (surface cracks every day)
        if (step >= 2) {
          const surfaceStrand = rung.strands[0];
          const segLen = Math.abs(x2 - x1) * surfaceStrand.val / rung.rate;
          const startX = Math.min(x1, x2);

          ctx.beginPath();
          ctx.roundRect(startX - 1, rung.y - 5, segLen + 2, 10, 2);
          ctx.strokeStyle = rgb(C.blue, 0.2 + dampedPulse(T, 0.03 + ri * 0.002, 0.0005) * 0.05);
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }

        // Step 3: Highlight Sunday mutation (edge wave spike)
        if (step >= 3 && ri === 6) {
          const edgeStrand = rung.strands[2];
          const totalLen2 = Math.abs(x2 - x1);
          const offset2 = Math.min(x1, x2) + totalLen2 * (rung.strands[0].val + rung.strands[1].val) / rung.rate;
          const segLen = totalLen2 * edgeStrand.val / rung.rate;

          // Pulsing highlight with drawGlow
          drawGlow(ctx, offset2 + segLen / 2, rung.y, 20, C.red, 0.15);

          const pulseR = 8 + (T * 0.2 % 20);
          const pulseA = Math.max(0, 1 - pulseR / 28) * 0.2;
          ctx.beginPath();
          ctx.arc(offset2 + segLen / 2, rung.y, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(C.red, pulseA);
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = "8px 'DM Sans',sans-serif";
          ctx.textAlign = 'center';
          ctx.fillStyle = rgb(C.red, 0.7);
          ctx.fillText('MUTATION: 60% edge wave', offset2 + segLen / 2, rung.y + 16);
        }
      });

      // Legend on right
      if (step >= 1) {
        const lx = w * 0.72, ly = h * 0.15;
        ctx.font = "bold 9px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = C.t1;
        ctx.fillText('Defect types', lx, ly);

        types.forEach((type, i) => {
          const ty = ly + 18 + i * 20;
          ctx.beginPath();
          ctx.arc(lx + 5, ty, 4, 0, Math.PI * 2);
          ctx.fillStyle = rgb(type.color, 0.6);
          ctx.fill();
          ctx.font = "9px 'DM Sans',sans-serif";
          ctx.fillStyle = rgb(C.t2, 0.7);
          ctx.fillText(type.name, lx + 14, ty + 1);
        });
      }

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, helix]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
