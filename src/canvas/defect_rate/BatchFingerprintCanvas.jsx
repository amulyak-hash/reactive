import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function BatchFingerprintCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  // Radar/polar fingerprint data for batches
  const batches = useMemo(() => {
    const axes = ['Si %', 'Temp', 'Speed', 'Pressure', 'Carbon'];
    const good = [
      { name: 'B4465', values: [0.7, 0.85, 0.8, 0.75, 0.82], ok: true },
      { name: 'B4467', values: [0.72, 0.83, 0.78, 0.77, 0.8], ok: true },
      { name: 'B4469', values: [0.68, 0.87, 0.82, 0.73, 0.84], ok: true },
    ];
    const bad = [
      { name: 'B4471', values: [0.42, 0.55, 0.48, 0.6, 0.5], ok: false },
    ];
    return { axes, good, bad, all: [...good, ...bad] };
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

      const { axes, good, bad } = batches;
      const cx = w * 0.4, cy = h * 0.45;
      const R = Math.min(w * 0.25, h * 0.3);
      const angleStep = (Math.PI * 2) / axes.length;

      // Reset hit zones
      hitZonesRef.current = [];

      // Draw radar grid
      for (let ring = 1; ring <= 4; ring++) {
        const r = R * (ring / 4);
        ctx.beginPath();
        for (let i = 0; i <= axes.length; i++) {
          const a = -Math.PI / 2 + (i % axes.length) * angleStep;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgb(C.bd, 0.12);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Axis lines and labels
      axes.forEach((ax, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = rgb(C.bd, 0.1);
        ctx.lineWidth = 0.5;
        ctx.stroke();

        const lx = cx + Math.cos(a) * (R + 16);
        const ly = cy + Math.sin(a) * (R + 16);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText(ax, lx, ly);
      });

      // Draw fingerprints
      const drawFingerprint = (batch, color, alpha, batchIdx) => {
        const hp = hoverMap.current.get(`batch-${batchIdx}`) || 0;
        const effectiveAlpha = alpha + hp * 0.3;

        ctx.beginPath();
        batch.values.forEach((v, i) => {
          const a = -Math.PI / 2 + i * angleStep;
          const r = R * v;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = rgb(color, effectiveAlpha * 0.12);
        ctx.fill();
        ctx.strokeStyle = rgb(color, effectiveAlpha * 0.5 + hp * 0.3);
        ctx.lineWidth = 1.5 + hp * 1;
        ctx.stroke();

        // Vertices
        batch.values.forEach((v, i) => {
          const a = -Math.PI / 2 + i * angleStep;
          const r = R * v;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;

          // Glow vertex on hover
          if (hp > 0) {
            drawGlow(ctx, x, y, 10, color, hp * 0.15);
          }

          ctx.beginPath();
          ctx.arc(x, y, 2.5 + hp * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = rgb(color, effectiveAlpha * 0.8);
          ctx.fill();
        });

        // Register center hit zone for the batch
        const avgR = batch.values.reduce((s, v) => s + v, 0) / batch.values.length * R;
        registerHitCircle(hitZonesRef.current, `batch-${batchIdx}`, cx, cy, avgR, {
          label: batch.name,
          value: batch.ok ? 'Within spec' : 'Off-spec anomaly',
          sublabel: batch.ok ? 'Normal fingerprint' : 'All parameters off-center',
          color: batch.ok ? C.green : C.red,
        });
      };

      // Step 0: Show all fingerprints overlaid
      if (step >= 0) {
        good.forEach((b, i) => drawFingerprint(b, C.green, 0.5, i));
      }

      // Step 1: Good cluster label
      if (step >= 1) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.green, 0.6);
        ctx.fillText('Good batches: tight cluster', w * 0.68, h * 0.2);

        const stats = ['Si: 0.22±0.02%', 'Temp: 1502±5°C', 'Speed: 1.21±0.03'];
        stats.forEach((s, i) => {
          ctx.font = "8px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(C.t3, 0.5);
          ctx.fillText(s, w * 0.68, h * 0.24 + i * 13);
        });
      }

      // Step 2: Anomalous fingerprint
      if (step >= 2) {
        bad.forEach((b, i) => {
          const pulseAlpha = dampedPulse(T, 0.03, 0.0005) * 0.15 + 0.7;
          drawFingerprint(b, C.red, pulseAlpha, good.length + i);
        });

        // Anomaly glow at center
        drawGlow(ctx, cx, cy, R * 0.5, C.red, 0.08);

        // Anomaly label
        ctx.font = "bold 9px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.red, 0.7);
        ctx.fillText('B4471: smeared fingerprint', w * 0.68, h * 0.45);

        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText('Si: 0.34% · Temp: 1488°C', w * 0.68, h * 0.49);
        ctx.fillText('Every parameter off-center', w * 0.68, h * 0.53);
      }

      // Step 3: Pattern match
      if (step >= 3) {
        const matchY = h * 0.65;
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('Pattern matches 3 prior defective batches', w * 0.68, matchY);

        const matches = ['B4400 — Mar 2', 'B4412 — Mar 5', 'B4435 — Mar 9'];
        matches.forEach((m, i) => {
          ctx.font = "8px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(C.t3, 0.5);
          ctx.fillText(m, w * 0.68, matchY + 15 + i * 13);
        });

        ctx.font = "bold 9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.orange, 0.7);
        ctx.fillText('Common: Supplier X 4400-series', w * 0.68, matchY + 58);

        // Pulsing highlight ring around bad fingerprint
        const pulseR = R * 0.6 + (T * 0.2 % 25);
        const pulseA = Math.max(0, 1 - pulseR / (R * 0.85)) * 0.15;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(C.red, pulseA);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, batches]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
