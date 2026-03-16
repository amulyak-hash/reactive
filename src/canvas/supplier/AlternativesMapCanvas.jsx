import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function AlternativesMapCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const suppliers = useMemo(() => [
    { name: 'Supplier X', reliability: 78, cost: 0, lead: '24h', x: 0.4, y: 0.45, color: C.red, r: 28, current: true },
    { name: 'Supplier Y', reliability: 94, cost: 8, lead: '48h', x: 0.72, y: 0.22, color: C.green, r: 22 },
    { name: 'Supplier Z', reliability: 87, cost: 3, lead: '72h', x: 0.72, y: 0.48, color: C.blue, r: 20 },
    { name: 'Supplier W', reliability: 82, cost: -2, lead: '96h', x: 0.72, y: 0.72, color: C.amber, r: 18 },
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
      drawDust(ctx, w, h, T, 25);

      const visibleSuppliers = step === 0 ? 1 : suppliers.length;

      // Connection lines from X to alternatives
      if (step >= 1) {
        for (let i = 1; i < suppliers.length; i++) {
          const s0 = suppliers[0], s1 = suppliers[i];
          const x0 = s0.x * w, y0 = s0.y * h;
          const x1 = s1.x * w, y1 = s1.y * h;

          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.strokeStyle = rgb(s1.color, 0.08);
          ctx.lineWidth = 10;
          ctx.stroke();
          ctx.strokeStyle = rgb(s1.color, 0.15);
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Draw supplier nodes
      for (let i = 0; i < visibleSuppliers; i++) {
        const s = suppliers[i];
        const sx = s.x * w, sy = s.y * h;
        if (i === 1 && step >= 1) drawGlow(ctx, sx, sy, 35, C.green, 0.12);
        const pulse = dampedPulse(T, 0.03, 0.0005) * 0.08 + 1;
        const r = s.r * pulse;

        // Register hit zone
        const nodeId = `supplier-${i}`;
        registerHitCircle(hitZonesRef.current, nodeId, sx, sy, r + 6, {
          label: s.name,
          value: `Reliability: ${s.reliability}%`,
          sublabel: `Lead: ${s.lead}` + (s.cost !== 0 ? ` · ${s.cost > 0 ? '+' : ''}${s.cost}% cost` : ' · Baseline cost'),
          color: s.color,
        });
        const hp = hoverMap.current.get(nodeId) || 0;

        // Glow
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.5);
        g.addColorStop(0, rgb(s.color, 0.1 + hp * 0.08));
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

        // Reliability inside node
        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(`${s.reliability}%`, sx, sy);

        // Name + details below
        ctx.font = "bold 9px 'DM Sans',sans-serif";
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgb(s.color, 0.8);
        ctx.fillText(s.name, sx, sy + r + 8);

        if (step >= 1 && i > 0) {
          ctx.font = "8px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(C.t3, 0.5);
          const costStr = s.cost > 0 ? `+${s.cost}% cost` : `${s.cost}% cost`;
          ctx.fillText(`${costStr} · ${s.lead}`, sx, sy + r + 22);
        }
      }

      // Step 0: Single source risk highlight
      if (step === 0) {
        const sx = suppliers[0].x * w, sy = suppliers[0].y * h;
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('68% dependency · single source', sx, sy + 50);
        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText('14h to shutdown if supply fails', sx, sy + 64);
      }

      // Step 2: Switching cost analysis
      if (step >= 2) {
        const bx = w * 0.1, by = h * 0.82;
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.amber, 0.6);
        ctx.fillText('Dual-source with Y: +₹2.1 Cr/year', bx, by);
        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText('Eliminates single-source risk', bx, by + 14);
      }

      // Step 3: Optimal split recommendation
      if (step >= 3) {
        const rx = w * 0.12, ry = h * 0.12;

        // Split bar
        const barW = w * 0.2, barH = 12;
        const splits = [
          { pct: 50, color: C.red, label: 'X: 50%' },
          { pct: 30, color: C.green, label: 'Y: 30%' },
          { pct: 20, color: C.blue, label: 'Z: 20%' },
        ];

        ctx.font = "bold 9px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = C.t1;
        ctx.fillText('Recommended split', rx, ry);

        let offset = 0;
        splits.forEach(s => {
          const segW = barW * (s.pct / 100);
          ctx.fillStyle = rgb(s.color, 0.5);
          ctx.beginPath();
          ctx.roundRect(rx + offset, ry + 14, segW - 1, barH, offset === 0 ? [4, 0, 0, 4] : s.pct === 20 ? [0, 4, 4, 0] : 0);
          ctx.fill();

          ctx.font = "7px 'JetBrains Mono',monospace";
          ctx.textAlign = 'center';
          ctx.fillStyle = C.t1;
          ctx.fillText(s.label, rx + offset + segW / 2, ry + 20);
          ctx.textAlign = 'left';
          offset += segW;
        });

        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.green, 0.6);
        ctx.fillText('Disruption risk: 22% → 3%', rx, ry + 36);
        ctx.fillStyle = rgb(C.amber, 0.5);
        ctx.fillText('+₹1.4 Cr/year', rx, ry + 49);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, suppliers]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
