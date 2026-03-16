import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { MACHINE_FAULTS } from '../../data/tataSteel';
import { dampedPulse, easeOutCubic, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function FaultTreeCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const tree = useMemo(() => {
    const sorted = [...MACHINE_FAULTS].filter(m => m.faults > 0).sort((a, b) => b.faults - a.faults);
    const rootX = w * 0.5, rootY = h * 0.82;
    const branches = sorted.map((m, i) => {
      const angle = -Math.PI / 2 + (i - (sorted.length - 1) / 2) * 0.35;
      const branchLen = h * 0.25 + m.faults * 8;
      return {
        ...m,
        isMain: m.id === 'M21',
        angle,
        endX: rootX + Math.cos(angle) * branchLen * 0.8,
        endY: rootY + Math.sin(angle) * branchLen,
        branchLen,
        color: m.id === 'M21' ? C.red : m.id === 'M18' ? C.amber : C.blue,
      };
    });
    return { rootX, rootY, branches };
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
      drawDust(ctx, w, h, T, 25);

      // Tick hover animations
      tickHoverProgress(hoverMap.current, hoveredRef.current);

      const { rootX, rootY, branches } = tree;

      // Reset hit zones each frame
      hitZonesRef.current = [];

      // Trunk
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.lineTo(rootX, rootY + 20);
      ctx.strokeStyle = rgb(C.t3, 0.3);
      ctx.lineWidth = 4;
      ctx.stroke();

      // Root label
      ctx.font = "8px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.t3, 0.5);
      ctx.fillText('ROOT', rootX, rootY + 34);

      // Draw branches
      branches.forEach((br, bi) => {
        const visible = step === 0 ? true : step === 1 ? br.isMain : true;
        if (!visible) return;
        const growFactor = easeOutCubic(Math.min(1, T * 0.005));

        // Branch line
        const ex = rootX + (br.endX - rootX) * growFactor;
        const ey = rootY + (br.endY - rootY) * growFactor;

        // Hover progress for this branch
        const hp = hoverMap.current.get(`node-${bi}`) || 0;

        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.quadraticCurveTo(
          rootX + (ex - rootX) * 0.3, rootY + (ey - rootY) * 0.6,
          ex, ey
        );
        ctx.strokeStyle = rgb(br.color, (br.isMain ? 0.5 : 0.25) + hp * 0.2);
        ctx.lineWidth = (br.isMain ? 3 : 1.5) + hp * 1;
        ctx.stroke();

        // Fruit nodes (fault count)
        const fruitR = 4 + br.faults * 1.5;
        const pulse = dampedPulse(T, 0.04 + bi * 0.002, 0.0005) * 0.1 + 1;

        // Register hit zone for fruit node
        registerHitCircle(hitZonesRef.current, `node-${bi}`, ex, ey, fruitR * 2, {
          label: br.id,
          value: `${br.faults} faults`,
          sublabel: br.isMain ? '58% of all faults' : `${Math.round(br.faults / 12 * 100)}% of total`,
          color: br.color,
        });

        // Glow on hover or main
        if (br.isMain || hp > 0) {
          const glowAlpha = br.isMain ? 0.12 + hp * 0.1 : hp * 0.15;
          drawGlow(ctx, ex, ey, fruitR * 3 * pulse, br.color, glowAlpha);
        }

        // Fruit
        const fg = ctx.createRadialGradient(ex, ey - fruitR * 0.2, 0, ex, ey, fruitR * pulse);
        fg.addColorStop(0, rgb(br.color, 0.85 + hp * 0.15));
        fg.addColorStop(1, rgb(br.color, 0.45 + hp * 0.2));
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(ex, ey, fruitR * pulse + hp * 2, 0, Math.PI * 2);
        ctx.fill();

        // Machine ID
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(br.id, ex, ey);

        // Fault count
        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgb(br.color, 0.6 + hp * 0.3);
        ctx.fillText(`${br.faults} faults`, ex, ey + fruitR * pulse + 6);
      });

      // Step 1: M21 branch stats
      if (step >= 1) {
        const m21 = branches.find(b => b.isMain);
        if (m21) {
          ctx.font = "9px 'DM Sans',sans-serif";
          ctx.textAlign = 'center';
          ctx.fillStyle = rgb(C.red, 0.6);
          ctx.fillText('58% of all faults — dominant branch', m21.endX, m21.endY + 30);
        }
      }

      // Step 3: Root exposure
      if (step >= 3) {
        const rcY = rootY + 50;
        const rcPulse = dampedPulse(T, 0.03, 0.0005) * 0.1 + 1;

        // Root cause glow
        drawGlow(ctx, rootX, rcY, 28, C.red, 0.15);

        ctx.beginPath();
        ctx.arc(rootX, rcY, 14 * rcPulse, 0, Math.PI * 2);
        const rg = ctx.createRadialGradient(rootX, rcY - 3, 0, rootX, rcY, 14);
        rg.addColorStop(0, rgb(C.red, 0.9));
        rg.addColorStop(1, rgb(C.orange, 0.5));
        ctx.fillStyle = rg;
        ctx.fill();

        ctx.font = "bold 8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText('ROOT', rootX, rcY);

        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('Non-OEM bearing · 6 days ago', rootX, rcY + 18);

        // Connection to trunk
        ctx.beginPath();
        ctx.setLineDash([2, 3]);
        ctx.moveTo(rootX, rootY + 20);
        ctx.lineTo(rootX, rcY - 16);
        ctx.strokeStyle = rgb(C.red, 0.2);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, tree]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
