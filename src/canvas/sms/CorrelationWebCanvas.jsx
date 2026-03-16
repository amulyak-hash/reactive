import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function CorrelationWebCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const web = useMemo(() => {
    const sensors = [
      { id: 'S27', name: 'CO₂ ratio', x: 0.42, y: 0.35, color: C.red, primary: true },
      { id: 'S12', name: 'Lance pos.', x: 0.22, y: 0.25, color: C.amber, corr: 89 },
      { id: 'S31', name: 'Bath temp', x: 0.62, y: 0.22, color: C.amber, corr: 82 },
      { id: 'S08', name: 'Vessel tilt', x: 0.15, y: 0.55, color: C.blue, corr: 74, order: 2 },
      { id: 'S19', name: 'Slag visc.', x: 0.68, y: 0.52, color: C.blue, corr: 68, order: 2 },
      { id: 'S04', name: 'O₂ flow', x: 0.35, y: 0.65, color: C.t3, corr: 45, order: 2 },
    ];

    const edges = [
      { from: 0, to: 1, corr: 89, order: 1 },
      { from: 0, to: 2, corr: 82, order: 1 },
      { from: 1, to: 3, corr: 74, order: 2 },
      { from: 2, to: 4, corr: 68, order: 2 },
      { from: 0, to: 5, corr: 45, order: 2 },
    ];

    return { sensors, edges };
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
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 25);

      const { sensors, edges } = web;

      // Draw edges
      edges.forEach(e => {
        if (e.order === 1 && step < 1) return;
        if (e.order === 2 && step < 2) return;

        const s0 = sensors[e.from], s1 = sensors[e.to];
        const x0 = s0.x * w, y0 = s0.y * h;
        const x1 = s1.x * w, y1 = s1.y * h;

        // Edge glow
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = rgb(s1.color, 0.06);
        ctx.lineWidth = 10;
        ctx.stroke();

        // Edge line
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        const pulseA = 0.2 + dampedPulse(T, 0.03, 0.0005) * 0.05;
        ctx.strokeStyle = rgb(s1.color, pulseA);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Correlation label at midpoint
        const midX = (x0 + x1) / 2, midY = (y0 + y1) / 2;
        ctx.font = "bold 8px 'JetBrains Mono',monospace";
        const tw = ctx.measureText(`${e.corr}%`).width + 8;
        ctx.fillStyle = 'rgba(10,16,24,.85)';
        ctx.beginPath();
        ctx.roundRect(midX - tw / 2, midY - 8, tw, 16, 4);
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(s1.color, 0.7);
        ctx.fillText(`${e.corr}%`, midX, midY);

        // Flowing pulse along edge
        const prog = (T * 0.005 + e.from * 0.3) % 1;
        const px = x0 + (x1 - x0) * prog;
        const py = y0 + (y1 - y0) * prog;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = rgb(s1.color, 0.5);
        ctx.fill();
      });

      // Draw sensor nodes
      sensors.forEach((s) => {
        if (s.order === 2 && step < 2) return;
        if (!s.primary && step < 1) return;

        const sx = s.x * w, sy = s.y * h;
        if (s.primary) drawGlow(ctx, sx, sy, 40, s.color, 0.12);
        const pulse = dampedPulse(T, 0.035, 0.0005) * 0.1 + 1;
        const r = (s.primary ? 22 : 16) * pulse;

        // Register hit zone for this sensor node
        registerHitCircle(hitZonesRef.current, s.id, sx, sy, r + 6, {
          label: s.id, value: s.name, sublabel: s.primary ? 'Primary sensor' : `Correlation: ${s.corr}%`, color: s.color,
        });
        const hp = hoverMap.current.get(s.id) || 0;

        // Glow
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.5);
        g.addColorStop(0, rgb(s.color, (s.primary ? 0.15 : 0.08) + hp * 0.1));
        g.addColorStop(1, rgb(s.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Hover glow
        if (hp > 0) drawGlow(ctx, sx, sy, 16 * hp, s.color, 0.2 * hp);

        // Node
        const ng = ctx.createRadialGradient(sx, sy - r * 0.2, 0, sx, sy, r);
        ng.addColorStop(0, rgb(s.color, 0.85 + hp * 0.1));
        ng.addColorStop(1, rgb(s.color, 0.45 + hp * 0.15));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(sx, sy, r + hp * 3, 0, Math.PI * 2);
        ctx.fill();

        // ID + name
        ctx.font = "bold 8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(s.id, sx, sy - 2);
        ctx.font = "7px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t2, 0.6 + hp * 0.3);
        ctx.fillText(s.name, sx, sy + 8);
      });

      // Step 3: Cluster vs coincidence annotation
      if (step >= 3) {
        const sy = h * 0.82;
        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText('3 correlated sensors = meaningful cluster', w * 0.5, sy);
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('Clustered correlation is evidence — not just coincidence', w * 0.5, sy + 16);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, web]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
