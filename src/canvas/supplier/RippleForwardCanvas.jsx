import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function RippleForwardCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const nodes = useMemo(() => [
    { label: 'Supplier X', code: '12h delay', x: 0.12, y: 0.45, color: C.red, r: 24 },
    { label: 'BF-3', code: 'Buffer: 2h', x: 0.35, y: 0.35, color: C.orange, r: 20 },
    { label: 'SMS/BOF-2', code: 'Starved h16', x: 0.58, y: 0.55, color: C.amber, r: 20 },
    { label: 'CCM-3', code: '2 slabs deferred', x: 0.81, y: 0.4, color: C.cyan, r: 20 },
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

    const draw = () => {
      t.current++;
      const T = t.current;
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 30);

      const visibleNodes = Math.min(step + 1, nodes.length);

      // Ripple rings emanating from Supplier X
      const origin = nodes[0];
      const ox = origin.x * w, oy = origin.y * h;
      const maxRippleR = step * w * 0.25 + (T * 0.15 % (w * 0.3));

      for (let ring = 0; ring < 4; ring++) {
        const ringR = (T * 0.3 + ring * 60) % (w * 0.8);
        const ringA = Math.max(0, 1 - ringR / (w * 0.8)) * 0.12;
        if (ringR < maxRippleR) {
          ctx.beginPath();
          ctx.arc(ox, oy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(C.red, ringA);
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Connection lines
      for (let i = 0; i < visibleNodes - 1; i++) {
        const n0 = nodes[i], n1 = nodes[i + 1];
        const x0 = n0.x * w, y0 = n0.y * h;
        const x1 = n1.x * w, y1 = n1.y * h;

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = rgb(n1.color, 0.12);
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.strokeStyle = rgb(n1.color, 0.2);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Impact arrow
        const midX = (x0 + x1) / 2, midY = (y0 + y1) / 2;
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(n1.color, 0.5);
        ctx.fillText('→', midX, midY - 8);
      }

      // Draw nodes
      for (let i = 0; i < visibleNodes; i++) {
        const n = nodes[i];
        const nx = n.x * w, ny = n.y * h;
        if (i === 0) drawGlow(ctx, nx, ny, 45, C.red, 0.12);
        const pulse = dampedPulse(T, 0.03, 0.0005) * 0.1 + 1;
        const r = n.r * pulse;

        // Register hit zone
        const nodeId = `node-${i}`;
        registerHitCircle(hitZonesRef.current, nodeId, nx, ny, r + 6, {
          label: n.label, value: n.code, sublabel: i === 0 ? 'Origin of disruption' : `Stage ${i} impact`, color: n.color,
        });
        const hp = hoverMap.current.get(nodeId) || 0;

        // Glow
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 2.5);
        g.addColorStop(0, rgb(n.color, 0.12 + hp * 0.08));
        g.addColorStop(1, rgb(n.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(nx, ny, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Hover glow
        if (hp > 0) drawGlow(ctx, nx, ny, 16 * hp, n.color, 0.2 * hp);

        // Node
        const ng = ctx.createRadialGradient(nx, ny - r * 0.2, 0, nx, ny, r);
        ng.addColorStop(0, rgb(n.color, 0.85 + hp * 0.1));
        ng.addColorStop(1, rgb(n.color, 0.45 + hp * 0.15));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(nx, ny, r + hp * 3, 0, Math.PI * 2);
        ctx.fill();

        // Labels
        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText(n.label, nx, ny + r + 16);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(n.color, 0.7 + hp * 0.2);
        ctx.fillText(n.code, nx, ny + r + 29);
      }

      // Step 3: Full impact summary
      if (step >= 3) {
        const sy = h * 0.82;
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('12h delay → feed reduction → throughput drop → schedule slip', w * 0.5, sy);
        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.red, 0.7);
        ctx.fillText('₹1.8 Cr exposure · 2 automotive shipments at risk', w * 0.5, sy + 18);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, nodes]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
