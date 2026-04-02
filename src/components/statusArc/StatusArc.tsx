import { useRef, useEffect } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from '../../canvas/useCanvasInteraction';
import { CC, rgb, drawGlow, drawDust, drawScanline, setupCanvas } from '../../canvas/canvasUtils';
import type { StatusArcProps } from './types';

const W = 460;
const H = 300;

const STATUS_COLORS: Record<string, string> = {
  Open: CC.red,
  Submitted: CC.amber,
  Closed: CC.green,
};

export function StatusArc({ segments, title, 'data-testid': testId }: StatusArcProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const hoverMap = useRef<Map<string, number>>(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;

    const cxCenter = W * 0.5;
    const cyCenter = H * 0.54;
    const nodeR = W * 0.22; // orbital radius
    const total = segments.reduce((s, seg) => s + seg.count, 0);
    const maxCount = Math.max(...segments.map(s => s.count), 1);

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

      // Draw edges from center to each satellite
      segments.forEach((seg, i) => {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const sx = cxCenter + Math.cos(angle) * nodeR;
        const sy = cyCenter + Math.sin(angle) * nodeR;
        const color = STATUS_COLORS[seg.status] ?? CC.blue;
        const edgeW = 2 + (seg.count / maxCount) * 8;

        // Thick semi-transparent glow tube
        ctx.beginPath();
        ctx.moveTo(cxCenter, cyCenter);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = rgb(color, 0.08);
        ctx.lineWidth = edgeW * 2;
        ctx.stroke();

        // Thin crisp line
        ctx.beginPath();
        ctx.moveTo(cxCenter, cyCenter);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = rgb(color, 0.25);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Flowing pulse particle along edge
        const prog = ((T * 0.005 + i * 0.33) % 1);
        const px = cxCenter + (sx - cxCenter) * prog;
        const py = cyCenter + (sy - cyCenter) * prog;
        drawGlow(ctx, px, py, 6, color, 0.4);
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = rgb(color, 0.8);
        ctx.fill();

        // Count label at midpoint
        const midX = (cxCenter + sx) / 2;
        const midY = (cyCenter + sy) / 2;
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(color, 0.85);
        ctx.fillText(String(seg.count), midX, midY);
      });

      // Draw satellite nodes
      segments.forEach((seg, i) => {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const sx = cxCenter + Math.cos(angle) * nodeR;
        const sy = cyCenter + Math.sin(angle) * nodeR;
        const color = STATUS_COLORS[seg.status] ?? CC.blue;
        const satR = 10 + (seg.count / maxCount) * 18;
        const hp = hoverMap.current.get(seg.status) ?? 0;

        // Glow
        drawGlow(ctx, sx, sy, satR * 2.5, color, 0.2 + hp * 0.15);

        // Radial gradient fill
        const grad = ctx.createRadialGradient(sx, sy - satR * 0.2, 0, sx, sy, satR);
        grad.addColorStop(0, rgb(color, 0.8 + hp * 0.2));
        grad.addColorStop(1, rgb(color, 0.4 + hp * 0.1));
        ctx.beginPath();
        ctx.arc(sx, sy, satR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Label inside
        ctx.font = `bold 9px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(CC.t1, 0.9);
        ctx.fillText(seg.status, sx, sy);

        registerHitCircle(
          hitZonesRef.current,
          seg.status,
          sx,
          sy,
          satR + 6,
          {
            label: seg.status,
            value: `${seg.count} Early Warnings`,
            sublabel: `${Math.round((seg.count / total) * 100)}%`,
            color,
          },
        );
      });

      // Central node
      const centerHp = hoverMap.current.get('center') ?? 0;
      drawGlow(ctx, cxCenter, cyCenter, 36, CC.t3, 0.2 + centerHp * 0.15);
      const centerGrad = ctx.createRadialGradient(cxCenter, cyCenter - 4, 0, cxCenter, cyCenter, 22);
      centerGrad.addColorStop(0, rgb(CC.t2, 0.9));
      centerGrad.addColorStop(1, rgb(CC.t3, 0.5));
      ctx.beginPath();
      ctx.arc(cxCenter, cyCenter, 22, 0, Math.PI * 2);
      ctx.fillStyle = centerGrad;
      ctx.fill();

      ctx.font = `bold 8px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgb(CC.t1, 0.9);
      ctx.fillText('EW Status', cxCenter, cyCenter - 4);
      ctx.font = `bold 10px 'JetBrains Mono', monospace`;
      ctx.fillStyle = CC.t1;
      ctx.fillText(String(total), cxCenter, cyCenter + 8);

      registerHitCircle(hitZonesRef.current, 'center', cxCenter, cyCenter, 28, {
        label: 'Total EW Status',
        value: `${total} Early Warnings`,
        color: CC.t3,
      });

      drawScanline(ctx, W, H, T, 0.015);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [segments, title]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={title ?? 'EW status arc visualization'}
        style={{ width: W, height: H, display: 'block', borderRadius: 8 }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
