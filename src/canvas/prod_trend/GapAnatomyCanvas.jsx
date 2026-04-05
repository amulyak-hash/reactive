import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerp } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';
import { PRODUCTION_HOURS, PRODUCTION_EXPECTED, PRODUCTION_ACTUAL } from '../../data/tataSteel';

export default function GapAnatomyCanvas({ w, h, step, paused = false, selectedZoneId = null, onZoneSelect, onZoneAction }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef, setTooltipHovered } = useCanvasInteraction(ref, { width: w, height: h, onClick: onZoneSelect });

  const data = useMemo(() => {
    const padL = w * 0.08, padR = w * 0.08;
    const padT = h * 0.12, padB = h * 0.25;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const minY = 50, maxY = Math.max(...PRODUCTION_EXPECTED) + 10;

    const toX = (i) => padL + (i / (PRODUCTION_HOURS.length - 1)) * plotW;
    const toY = (v) => padT + plotH - ((v - minY) / (maxY - minY)) * plotH;

    const expected = PRODUCTION_EXPECTED.map((v, i) => ({ x: toX(i), y: toY(v) }));
    const actual = PRODUCTION_ACTUAL.map((v, i) => ({ x: toX(i), y: toY(v) }));

    return { expected, actual, padL, padT, plotW, plotH };
  }, [w, h]);

  const fragments = useMemo(() => [
    { label: 'Equipment', sub: '93 min lost', pct: 73, color: C.red, x: 0.35, y: 0.55 },
    { label: 'Material', sub: 'Supplier X ripple', pct: 15, color: C.amber, x: 0.55, y: 0.48 },
    { label: 'Quality', sub: '3 coils held', pct: 12, color: C.blue, x: 0.65, y: 0.6 },
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
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      if (!paused) t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 30);
      const activeFragmentIndex = step === 0 ? -1 : step === 1 ? 0 : step === 2 ? 1 : 2;
      const selectedFragmentIndex = selectedZoneId?.startsWith('frag-') ? Number(selectedZoneId.replace('frag-', '')) : null;
      const selectedFragment = Number.isInteger(selectedFragmentIndex) ? fragments[selectedFragmentIndex] : null;

      const { expected, actual } = data;

      // Expected line
      ctx.beginPath();
      expected.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = rgb(C.green, 0.5);
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Actual line
      ctx.beginPath();
      actual.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = rgb(C.blue, 0.7);
      ctx.lineWidth = 2;
      ctx.stroke();

      // The gap fill
      ctx.beginPath();
      actual.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      for (let i = expected.length - 1; i >= 0; i--) ctx.lineTo(expected[i].x, expected[i].y);
      ctx.closePath();

      if (step === 0) {
        // Simple gap fill
        ctx.fillStyle = rgb(C.red, 0.06);
        ctx.fill();
      } else if (step >= 1) {
        // Jagged tear effect — the gap tears open
        const gapGrad = ctx.createLinearGradient(0, data.padT, 0, data.padT + data.plotH);
        gapGrad.addColorStop(0, rgb(C.red, 0.02));
        gapGrad.addColorStop(0.5, rgb(C.red, 0.12));
        gapGrad.addColorStop(1, rgb(C.red, 0.04));
        ctx.fillStyle = gapGrad;
        ctx.fill();

        // Jagged tear lines along the gap edges
        for (let i = 5; i < actual.length; i++) {
          const ex = expected[i], ac = actual[i];
          const gapH = ac.y - ex.y;
          if (gapH < 5) continue;

          const midY = (ex.y + ac.y) / 2;
          const jags = 4;
          ctx.beginPath();
          ctx.moveTo(ex.x, ex.y + 2);
          for (let j = 1; j <= jags; j++) {
            const jy = lerp(ex.y + 2, midY, j / jags);
            const jx = ex.x + (Math.sin(j * 3 + i + T * 0.01) * 4);
            ctx.lineTo(jx, jy);
          }
          ctx.strokeStyle = rgb(C.red, 0.2);
          ctx.lineWidth = 0.7;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(ac.x, ac.y - 2);
          for (let j = 1; j <= jags; j++) {
            const jy = lerp(ac.y - 2, midY, j / jags);
            const jx = ac.x + (Math.cos(j * 3 + i + T * 0.01) * 4);
            ctx.lineTo(jx, jy);
          }
          ctx.strokeStyle = rgb(C.red, 0.2);
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // Step 2+: Floating fragments inside the gap
      if (step >= 2) {
        drawGlow(ctx, fragments[0].x * w, fragments[0].y * h, 35, C.red, 0.1);
        fragments.forEach((frag, fi) => {
          const fx = frag.x * w;
          const fy = frag.y * h + Math.sin(T * 0.02 + fi * 2) * 5;
          const isActive = fi === activeFragmentIndex;
          const isSelected = selectedZoneId === `frag-${fi}`;
          const fr = 14 + frag.pct * 0.15;
          const pulse = dampedPulse(T, 0.03, 0.0005) * 0.1 + 1;
          const fragId = `frag-${fi}`;
          const hp = hoverMap.current.get(fragId) || 0;

          // Hover glow
          if (hp > 0) drawGlow(ctx, fx, fy, 16 * hp, frag.color, 0.2 * hp);

          // Fragment glow
          const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr * (isSelected ? 3.8 : isActive ? 3.2 : 2.5) * pulse);
          g.addColorStop(0, rgb(frag.color, (isSelected ? 0.28 : isActive ? 0.2 : 0.1) + 0.08 * hp));
          g.addColorStop(1, rgb(frag.color, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(fx, fy, fr * 2.5 * pulse, 0, Math.PI * 2);
          ctx.fill();

          // Fragment node
          const ng = ctx.createRadialGradient(fx, fy - fr * 0.2, 0, fx, fy, fr * pulse);
          ng.addColorStop(0, rgb(frag.color, (isSelected ? 1 : isActive ? 0.96 : 0.85) + 0.1 * hp));
          ng.addColorStop(1, rgb(frag.color, (isSelected ? 0.8 : isActive ? 0.68 : 0.45) + 0.1 * hp));
          ctx.fillStyle = ng;
          ctx.beginPath();
          ctx.arc(fx, fy, fr * pulse, 0, Math.PI * 2);
          ctx.fill();

          // Percentage
          ctx.font = "bold 10px 'JetBrains Mono',monospace";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = C.t1;
          ctx.fillText(`${frag.pct}%`, fx, fy);

          // Label below
          ctx.font = "9px 'DM Sans',sans-serif";
          ctx.textBaseline = 'top';
          ctx.fillStyle = rgb(frag.color, 0.7);
          ctx.fillText(frag.label, fx, fy + fr * pulse + 6);
          ctx.font = "8px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(C.t3, 0.5);
          ctx.fillText(frag.sub, fx, fy + fr * pulse + 19);

          registerHitCircle(hitZonesRef.current, fragId, fx, fy, fr * pulse + 6, {
            label: frag.label, value: `${frag.pct}% of gap`, sublabel: frag.sub, color: frag.color,
          });
        });
      }

      // Step 3: Connection lines between fragments (compound fracture)
      if (step >= 3) {
        for (let i = 0; i < fragments.length - 1; i++) {
          const a = fragments[i], b = fragments[i + 1];
          const ax = a.x * w, ay = a.y * h + Math.sin(T * 0.02 + i * 2) * 5;
          const bx = b.x * w, by = b.y * h + Math.sin(T * 0.02 + (i + 1) * 2) * 5;

          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = rgb(C.red, 0.2 + dampedPulse(T, 0.02, 0.0005) * 0.05);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Compound label
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('Compound fracture — not three separate breaks', w * 0.5, h * 0.78);
      }

      // Line labels
      ctx.font = "8px 'JetBrains Mono',monospace";
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgb(C.green, 0.5);
      ctx.fillText('Expected', expected[0].x - 5, expected[0].y - 10);
      ctx.fillStyle = rgb(C.blue, 0.5);
      ctx.fillText('Actual', actual[0].x - 5, actual[0].y + 12);

      if (selectedFragment) {
        ctx.font = "bold 14px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(selectedFragment.label, w * 0.5, h * 0.2);
        ctx.font = "10px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(selectedFragment.color, 0.82);
        ctx.fillText(`${selectedFragment.pct}% of gap · ${selectedFragment.sub}`, w * 0.5, h * 0.2 + 20);
      }

      drawScanline(ctx, w, h, T, 0.012);
      if (!paused) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, data, fragments, paused]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip
        {...tooltip}
        parentW={w}
        parentH={h}
        actions={onZoneAction ? [{ id: 'explain', label: 'Explain' }, { id: 'explore', label: 'Explore' }] : null}
        onAction={onZoneAction}
        onTooltipHover={setTooltipHovered}
      />
    </div>
  );
}
