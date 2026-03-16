import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function UpstreamTraceCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const particles = useRef([]);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const zones = useMemo(() => [
    { label: 'QC Lab', code: 'QC', x: 0.88, y: 0.45, color: C.green, pct: 100 },
    { label: 'Rolling Mill', code: 'HSM-1', x: 0.66, y: 0.35, color: C.blue, pct: 42 },
    { label: 'Casting', code: 'CCM-3', x: 0.44, y: 0.55, color: C.cyan, pct: 31 },
    { label: 'Blast Furnace', code: 'BF-3', x: 0.22, y: 0.4, color: C.orange, pct: 27 },
  ], []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    let raf;
    particles.current = [];

    const draw = () => {
      t.current++;
      const T = t.current;
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 30);

      const visibleZones = Math.min(step + 1, zones.length);

      // Draw trace lines (flowing backward — right to left)
      for (let i = 0; i < visibleZones - 1; i++) {
        const z0 = zones[i], z1 = zones[i + 1];
        const x0 = z0.x * w, y0 = z0.y * h;
        const x1 = z1.x * w, y1 = z1.y * h;

        // Trace path
        const midX = (x0 + x1) / 2;
        const midY = (y0 + y1) / 2 - 20;

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(midX, midY, x1, y1);
        ctx.strokeStyle = rgb(z1.color, 0.08);
        ctx.lineWidth = 14;
        ctx.stroke();
        ctx.strokeStyle = rgb(z1.color, 0.15);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Backward-flowing particles
        if (Math.random() < 0.2) {
          particles.current.push({
            edge: i,
            prog: 0,
            speed: 0.005 + Math.random() * 0.005,
            off: (Math.random() - 0.5) * 10,
            sz: 1 + Math.random() * 1.5,
            color: z1.color,
          });
        }

        // Attribution percentage on the line
        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        const tw = ctx.measureText(`${z1.pct}%`).width + 12;
        ctx.fillStyle = 'rgba(10,16,24,.85)';
        ctx.beginPath();
        ctx.roundRect(midX - tw / 2, midY - 10, tw, 20, 5);
        ctx.fill();
        ctx.strokeStyle = rgb(z1.color, 0.25);
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.fillStyle = rgb(z1.color, 0.85);
        ctx.fillText(`${z1.pct}%`, midX, midY + 1);
      }

      // Update & draw particles (backward flow)
      particles.current = particles.current.filter(p => {
        p.prog += p.speed;
        if (p.prog > 1) return false;

        const z0 = zones[p.edge], z1 = zones[p.edge + 1];
        const x0 = z0.x * w, y0 = z0.y * h;
        const x1 = z1.x * w, y1 = z1.y * h;
        const midX = (x0 + x1) / 2, midY = (y0 + y1) / 2 - 20;

        const m = 1 - p.prog;
        const px = m * m * x0 + 2 * m * p.prog * midX + p.prog * p.prog * x1;
        const py = m * m * y0 + 2 * m * p.prog * midY + p.prog * p.prog * y1 + p.off;

        const al = Math.sin(p.prog * Math.PI) * 0.6;
        ctx.beginPath();
        ctx.arc(px, py, p.sz * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = rgb(p.color, al * 0.08);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = rgb(p.color, al);
        ctx.fill();
        return true;
      });
      if (particles.current.length > 200) particles.current = particles.current.slice(-200);

      // Draw zone nodes
      for (let i = 0; i < visibleZones; i++) {
        const z = zones[i];
        const zx = z.x * w, zy = z.y * h;
        const pulse = dampedPulse(T, 0.03, 0.0005) * 0.1 + 1;
        const nodeId = `zone-${z.code}`;
        const hp = hoverMap.current.get(nodeId) || 0;
        const r = (22 + hp * 4) * pulse;

        // Glow
        drawGlow(ctx, zx, zy, r * 2.5 + hp * 10, z.color, 0.1 + hp * 0.15);

        // Node
        const ng = ctx.createRadialGradient(zx, zy - r * 0.2, 0, zx, zy, r);
        ng.addColorStop(0, rgb(z.color, 0.85 + hp * 0.15));
        ng.addColorStop(1, rgb(z.color, 0.45 + hp * 0.15));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(zx, zy, r, 0, Math.PI * 2);
        ctx.fill();

        // Code label
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(z.code, zx, zy);

        // Name below
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgb(z.color, 0.6 + hp * 0.2);
        ctx.fillText(z.label, zx, zy + r + 8);

        registerHitCircle(hitZonesRef.current, nodeId, zx, zy, r * 1.5, {
          label: z.label,
          value: `${z.code} · ${z.pct}% attribution`,
          sublabel: 'Click to trace',
          color: z.color,
        });
      }

      // Direction arrow
      ctx.font = "9px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.t4, 0.4);
      ctx.fillText('← tracing backward from detection', w * 0.5, h * 0.82);

      // Step 3: Full lineage summary
      if (step >= 3) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.orange, 0.6);
        ctx.fillText('BF-3 chemistry → CCM-3 solidification → HSM-1 pressure → QC detection', w * 0.5, h * 0.88);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText('Born in the blast furnace, raised through three generations', w * 0.5, h * 0.93);
      }

      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); particles.current = []; };
  }, [w, h, step, zones]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
