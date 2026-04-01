import { useRef, useEffect } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitRect } from '../../canvas/useCanvasInteraction';
import { dampedPulse } from '../../canvas/easing';
import { CC, rgb, drawGlow, drawScanline, setupCanvas } from '../../canvas/canvasUtils';
import type { ContractorRankProps } from './types';

const W = 780;
const H = 240;
const CARD_PAD = 12;
const CARD_GAP = 10;
const RISK_LABELS = [
  'Highest exposure',
  'Elevated risk',
  'Moderate exposure',
  'Moderate exposure',
  'Low exposure',
];

export function ContractorRank({ contractors, 'data-testid': testId }: ContractorRankProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef(0);
  const hoverMap  = useRef<Map<string, number>>(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  const sorted = [...contractors].sort((a, b) => b.openCount - a.openCount).slice(0, 5);
  const total  = sorted.reduce((s, c) => s + c.openCount, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    frameRef.current = 0;

    const cols  = Math.min(5, sorted.length);
    // Fill full width: equal card widths separated by CARD_GAP, padded on both sides by CARD_PAD
    const cardW = (W - 2 * CARD_PAD - (cols - 1) * CARD_GAP) / cols;
    const cardH = H * 0.84;
    const cardY = H * 0.08;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, W, H);
      hitZonesRef.current = [];

      // Tick hover map
      hoverMap.current.forEach((val, id) => {
        const target = id === hoveredRef.current ? 1 : 0;
        const next   = val + (target - val) * 0.12;
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

      sorted.forEach((contractor, i) => {
        const isTop  = i === 0;
        const color  = isTop ? CC.red : i === 1 ? CC.amber : CC.blue;
        const baseX  = CARD_PAD + i * (cardW + CARD_GAP);
        const hp     = hoverMap.current.get(contractor.id) ?? 0;

        // Symmetric hover expansion — expand by up to 8px (4px each side)
        const expand = hp * 8;
        const x      = baseX - expand / 2;
        const w      = cardW + expand;

        // Ambient pulsing glow intensity for top card (NOT width — width is hover-driven only)
        const pulse = isTop ? dampedPulse(T, 0.04, 0.0003) * 0.06 + 0.06 : 0;

        // Card background
        ctx.fillStyle = rgb(color, 0.08 + hp * 0.07);
        ctx.beginPath();
        ctx.roundRect(x, cardY, w, cardH, 6);
        ctx.fill();

        // Card border
        ctx.strokeStyle = rgb(color, 0.2 + hp * 0.4 + pulse);
        ctx.lineWidth   = isTop ? 1.5 : 1;
        ctx.stroke();

        // Glow — all cards on hover, top card has ambient glow
        if (hp > 0.01 || isTop) {
          drawGlow(ctx, x + w / 2, cardY + cardH / 2, w * 0.55, color, pulse + hp * 0.14);
        }

        // Rank badge top-left
        ctx.font         = `bold 8px 'JetBrains Mono', monospace`;
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle    = rgb(color, 0.5 + hp * 0.35);
        ctx.fillText(`#${i + 1}`, x + 7, cardY + 6);

        // Circular avatar
        const photoR = cardW * 0.28;
        const photoX = x + w / 2;
        const photoY = cardY + cardH * 0.38;

        const photoGrad = ctx.createRadialGradient(photoX, photoY - photoR * 0.2, 0, photoX, photoY, photoR);
        photoGrad.addColorStop(0, rgb(color, 0.5 + hp * 0.2));
        photoGrad.addColorStop(1, rgb(color, 0.2 + hp * 0.1));
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoR, 0, Math.PI * 2);
        ctx.fillStyle = photoGrad;
        ctx.fill();
        ctx.strokeStyle = rgb(color, 0.4 + hp * 0.3);
        ctx.lineWidth   = 1;
        ctx.stroke();

        // ShortName inside circle
        ctx.font         = `bold ${Math.min(10, cardW * 0.11)}px 'JetBrains Mono', monospace`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle    = rgb(CC.t1, 0.9);
        ctx.fillText(contractor.shortName, photoX, photoY);

        // Open count — large
        ctx.font         = `bold ${Math.min(18, cardW * 0.18)}px 'JetBrains Mono', monospace`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle    = rgb(color, 0.9 + hp * 0.1);
        ctx.fillText(String(contractor.openCount), photoX, cardY + cardH * 0.76);

        // "open EWs" label
        ctx.font      = `8px 'JetBrains Mono', monospace`;
        ctx.fillStyle = rgb(CC.t2, 0.6);
        ctx.fillText('open EWs', photoX, cardY + cardH * 0.88);

        // Tooltip with rank, %, risk level
        const pct       = Math.round((contractor.openCount / total) * 100);
        const riskLabel = RISK_LABELS[i] ?? 'Low exposure';

        registerHitRect(
          hitZonesRef.current,
          contractor.id,
          baseX,
          cardY,
          cardW,
          cardH,
          {
            label   : contractor.name,
            value   : `${contractor.openCount} open EWs · ${pct}% of total`,
            sublabel: `Rank #${i + 1} · ${riskLabel}`,
            color,
          },
        );
      });

      drawScanline(ctx, W, H, T, 0.015);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [sorted, total]);

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Contractor rank — open EW count per contractor"
        style={{ width: W, height: H, display: 'block', borderRadius: 8 }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
