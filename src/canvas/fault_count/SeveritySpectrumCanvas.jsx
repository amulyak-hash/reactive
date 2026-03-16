import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { MACHINE_FAULTS } from '../../data/tataSteel';
import { dampedPulse, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitCircle, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function SeveritySpectrumCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const spectrum = useMemo(() => {
    const machines = MACHINE_FAULTS.filter(m => m.faults > 0).map(m => {
      const severity = m.id === 'M21' ? 'critical' : m.faults >= 2 ? 'moderate' : 'minor';
      const downtime = m.id === 'M21' ? 96 : m.faults * 8;
      return { ...m, severity, downtime };
    });

    const bands = [
      { name: 'Critical', color: C.red, machines: machines.filter(m => m.severity === 'critical'), minutes: 96 },
      { name: 'Moderate', color: C.amber, machines: machines.filter(m => m.severity === 'moderate'), minutes: 31 },
      { name: 'Minor', color: C.blue, machines: machines.filter(m => m.severity === 'minor'), minutes: 11 },
    ];

    return { bands, machines };
  }, []);

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
      drawDust(ctx, w, h, T, 25);

      // Tick hover animations
      tickHoverProgress(hoverMap.current, hoveredRef.current);

      const { bands } = spectrum;

      // Reset hit zones
      hitZonesRef.current = [];

      // Prism (step 0)
      const prismX = w * 0.15, prismY = h * 0.4;
      const prismW = 40, prismH = 60;

      ctx.beginPath();
      ctx.moveTo(prismX, prismY - prismH / 2);
      ctx.lineTo(prismX + prismW, prismY + prismH / 2);
      ctx.lineTo(prismX - prismW * 0.3, prismY + prismH / 2);
      ctx.closePath();
      ctx.fillStyle = rgb(C.t3, 0.06);
      ctx.fill();
      ctx.strokeStyle = rgb(C.t3, 0.2);
      ctx.lineWidth = 1;
      ctx.stroke();

      // White light entering
      ctx.beginPath();
      ctx.moveTo(w * 0.02, prismY);
      ctx.lineTo(prismX - prismW * 0.2, prismY);
      ctx.strokeStyle = rgb(C.t1, 0.3);
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = "8px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.t3, 0.5);
      ctx.fillText('12 faults', w * 0.08, prismY - 12);

      // Spectrum bands emerging from prism
      if (step >= 1) {
        const bandStartX = prismX + prismW + 20;
        const bandEndX = w * 0.88;

        bands.forEach((band, bi) => {
          const bandY = prismY + (bi - 1) * 50;
          const spread = band.name === 'Minor' ? 1.5 : band.name === 'Moderate' ? 1 : 0.5;
          const hpBand = hoverMap.current.get(`band-${bi}`) || 0;

          // Register hit zone for the band label area
          registerHitRect(hitZonesRef.current, `band-${bi}`, bandEndX - w * 0.32, bandY - 22, w * 0.3, 50, {
            label: band.name,
            value: `${band.machines.length} faults · ${band.minutes} min`,
            sublabel: band.name === 'Critical' ? '69% of total downtime' : band.name === 'Moderate' ? '22% of downtime' : '9% of downtime',
            color: band.color,
          });

          // Band beam
          ctx.beginPath();
          ctx.moveTo(prismX + prismW * 0.7, prismY + bi * 8 - 8);
          ctx.lineTo(bandEndX, bandY - 8 * spread);
          ctx.lineTo(bandEndX, bandY + 8 * spread);
          ctx.lineTo(prismX + prismW * 0.7, prismY + bi * 8 - 4);
          ctx.closePath();

          const beamGrad = ctx.createLinearGradient(bandStartX, 0, bandEndX, 0);
          beamGrad.addColorStop(0, rgb(band.color, 0.15 + hpBand * 0.1));
          beamGrad.addColorStop(1, rgb(band.color, 0.04 + hpBand * 0.08));
          ctx.fillStyle = beamGrad;
          ctx.fill();

          // Glow at band end on hover
          if (hpBand > 0) {
            drawGlow(ctx, bandEndX - w * 0.15, bandY, 40, band.color, hpBand * 0.12);
          }

          // Band border
          ctx.beginPath();
          ctx.moveTo(prismX + prismW * 0.7, prismY + bi * 8 - 6);
          ctx.lineTo(bandEndX, bandY);
          ctx.strokeStyle = rgb(band.color, 0.3 + hpBand * 0.2);
          ctx.lineWidth = 1 + hpBand * 0.5;
          ctx.stroke();

          // Band label
          ctx.font = "bold 10px 'DM Sans',sans-serif";
          ctx.textAlign = 'left';
          ctx.fillStyle = rgb(band.color, 0.8 + hpBand * 0.2);
          ctx.fillText(band.name, bandEndX - w * 0.3, bandY - 16);

          // Stats
          ctx.font = "9px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(C.t2, 0.6 + hpBand * 0.2);
          ctx.fillText(`${band.machines.length} faults · ${band.minutes} min`, bandEndX - w * 0.3, bandY);

          // Machine dots along the beam
          band.machines.forEach((m, mi) => {
            const mx = bandEndX - w * 0.3 + mi * 28 + 5;
            const my = bandY + 16;
            const pulse = dampedPulse(T, 0.04 + mi * 0.003 + bi * 0.005, 0.0005) * 0.1 + 1;
            const hpDot = hoverMap.current.get(`dot-${bi}-${mi}`) || 0;

            // Register hit zone for machine dot
            registerHitCircle(hitZonesRef.current, `dot-${bi}-${mi}`, mx, my, 12, {
              label: m.id,
              value: `${m.faults} faults · ${m.downtime} min`,
              sublabel: `Severity: ${m.severity}`,
              color: band.color,
            });

            // Glow on hover
            if (hpDot > 0) {
              drawGlow(ctx, mx, my, 16, band.color, hpDot * 0.2);
            }

            ctx.beginPath();
            ctx.arc(mx, my, (8 + hpDot * 3) * pulse, 0, Math.PI * 2);
            ctx.fillStyle = rgb(band.color, 0.35 + hpDot * 0.3);
            ctx.fill();
            ctx.font = "bold 7px 'JetBrains Mono',monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = C.t1;
            ctx.fillText(m.id, mx, my);
          });
        });
      }

      // Step 2: Focus beam highlight on critical
      if (step >= 2) {
        const critY = prismY - 50;
        ctx.beginPath();
        ctx.roundRect(w * 0.55, critY - 20, w * 0.38, 28, 6);
        ctx.strokeStyle = rgb(C.red, 0.15 + dampedPulse(T, 0.03, 0.0005) * 0.05);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('17% of faults → 69% of downtime', w * 0.74, critY - 6);
      }

      // Step 3: Priority recommendation
      if (step >= 3) {
        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText('Fix by severity: 1 machine. Fix by count: 7 machines.', w * 0.55, h * 0.85);
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('Ignore green scatter, fix the red beam', w * 0.55, h * 0.9);
      }

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, spectrum]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
