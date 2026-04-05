import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerpC } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';
import { PRODUCTION_HOURS, PRODUCTION_EXPECTED, PRODUCTION_ACTUAL } from '../../data/tataSteel';

export default function ShiftReplayCanvas({ w, h, step, focusedLayout = false, showBreakdown = true, paused = false, selectedZoneId = null, onZoneSelect, onZoneAction }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef, setTooltipHovered } = useCanvasInteraction(ref, { width: w, height: h, onClick: onZoneSelect });

  const data = useMemo(() => {
    const cx = w * (focusedLayout ? 0.5 : 0.42);
    const cy = h * (focusedLayout ? 0.5 : 0.48);
    const R = Math.min(w, h) * (focusedLayout ? 0.37 : 0.32);
    const hours = PRODUCTION_HOURS;
    const segments = hours.map((hr, i) => {
      const ratio = PRODUCTION_ACTUAL[i] / PRODUCTION_EXPECTED[i];
      const angle0 = -Math.PI / 2 + (i / hours.length) * Math.PI * 1.7;
      const angle1 = -Math.PI / 2 + ((i + 1) / hours.length) * Math.PI * 1.7;
      const isCracked = ratio < 0.95;
      const severity = Math.max(0, 1 - ratio);
      return { hr, ratio, angle0, angle1, isCracked, severity, idx: i };
    });
    return { cx, cy, R, segments, hours };
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
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 35);

      const { cx, cy, R, segments } = data;
      const activeRange = step === 0 ? [0, 4] : step === 1 ? [5, 5] : step === 2 ? [6, 9] : [0, segments.length - 1];
      const selectedSegIndex = selectedZoneId?.startsWith('seg-') ? Number(selectedZoneId.replace('seg-', '')) : null;
      const selectedSeg = Number.isInteger(selectedSegIndex) ? segments[selectedSegIndex] : null;

      // Track circle (background)
      ctx.beginPath();
      ctx.arc(cx, cy, R + 8, segments[0].angle0, segments[segments.length - 1].angle1);
      ctx.strokeStyle = rgb(C.bd, 0.15);
      ctx.lineWidth = 22;
      ctx.lineCap = 'butt';
      ctx.stroke();

      // Draw segments
      const visibleSegs = step === 0 ? 5 : step === 1 ? 7 : segments.length;
      for (let i = 0; i < visibleSegs && i < segments.length; i++) {
        const seg = segments[i];
        const isActive = i >= activeRange[0] && i <= activeRange[1];
        const pulse = seg.isCracked && step >= 1 ? dampedPulse(T, 0.04, 0.0005) * 0.08 : 0;

        // Segment color based on ratio
        let color;
        if (seg.ratio >= 0.98) color = C.green;
        else if (seg.ratio >= 0.95) color = lerpC(C.green, C.amber, (0.98 - seg.ratio) / 0.03);
        else if (seg.ratio >= 0.85) color = lerpC(C.amber, C.orange, (0.95 - seg.ratio) / 0.1);
        else color = lerpC(C.orange, C.red, Math.min(1, (0.85 - seg.ratio) / 0.15));

        const segR = R * (1 + pulse);

        // Hit zone for segment (at midpoint of arc)
        const midAngle = (seg.angle0 + seg.angle1) / 2;
        const hitX = cx + Math.cos(midAngle) * segR;
        const hitY = cy + Math.sin(midAngle) * segR;
        const segId = `seg-${i}`;
        const isSelected = selectedZoneId === segId;
        registerHitCircle(hitZonesRef.current, segId, hitX, hitY, 14, {
          label: `${seg.hr}:00`, value: `${(seg.ratio * 100).toFixed(1)}% of target`, sublabel: seg.isCracked ? 'Below threshold' : 'On track', color,
        });

        const hp = hoverMap.current.get(segId) || 0;
        const emphasis = isSelected ? 1.2 : isActive ? 1 : 0.3;

        // Glow for cracked segments
        if ((seg.isCracked && step >= 1) || isActive || isSelected) {
          ctx.beginPath();
          ctx.arc(cx, cy, segR + 14, seg.angle0 + 0.01, seg.angle1 - 0.01);
          ctx.strokeStyle = rgb(color, isSelected ? 0.24 : isActive ? 0.16 : 0.08);
          ctx.lineWidth = isSelected ? 38 : isActive ? 34 : 30;
          ctx.stroke();
        }

        // Hover glow
        if (hp > 0) drawGlow(ctx, hitX, hitY, 16 * hp, color, 0.2 * hp);

        // Main segment arc
        ctx.beginPath();
        ctx.arc(cx, cy, segR, seg.angle0 + 0.01, seg.angle1 - 0.01);
        ctx.strokeStyle = rgb(color, (0.28 + emphasis * 0.52) + pulse + hp * 0.2);
        ctx.lineWidth = isSelected ? 24 : isActive ? 21 : 16;
        ctx.lineCap = 'butt';
        ctx.stroke();

        // Crack lines for fractured segments (step 2+)
        if (seg.isCracked && step >= 2) {
          const crackLen = seg.severity * 12;
          for (let c = 0; c < 3; c++) {
            const ca = midAngle + (c - 1) * 0.03;
            const x0 = cx + Math.cos(ca) * (segR - 9);
            const y0 = cy + Math.sin(ca) * (segR - 9);
            const x1 = cx + Math.cos(ca + 0.02) * (segR - 9 - crackLen);
            const y1 = cy + Math.sin(ca + 0.02) * (segR - 9 - crackLen);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = rgb(C.red, 0.3 + dampedPulse(T, 0.05, 0.0005) * 0.1);
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Hour label
        const labelAngle = (seg.angle0 + seg.angle1) / 2;
        const lx = cx + Math.cos(labelAngle) * (R + 28);
        const ly = cy + Math.sin(labelAngle) * (R + 28);
        ctx.font = "12px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(C.t3, 0.32 + emphasis * 0.4 + hp * 0.2);
        ctx.fillText(`${seg.hr}:00`, lx, ly);
      }

      // Glow at center
      drawGlow(ctx, cx, cy, R * 0.5, C.t1, 0.06);

      // Center text
      ctx.font = "bold 14px 'DM Sans',sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = C.t1;
      if (selectedSeg) {
        const expected = PRODUCTION_EXPECTED[selectedSeg.idx];
        const actual = PRODUCTION_ACTUAL[selectedSeg.idx];
        const deltaPct = (((actual - expected) / expected) * 100).toFixed(1);
        ctx.fillText(`${selectedSeg.hr}:00`, cx, cy - 8);
        ctx.font = "10px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(selectedSeg.ratio < 0.95 ? C.red : selectedSeg.ratio < 0.98 ? C.amber : C.green, 0.78);
        ctx.fillText(`${actual.toFixed(1)} actual · ${deltaPct}% vs target`, cx, cy + 10);
      } else if (step === 0) {
        ctx.fillText('06:00–11:00', cx, cy - 8);
        ctx.font = "10px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.green, 0.7);
        ctx.fillText('Tracking ±2%', cx, cy + 10);
      } else if (step === 1) {
        ctx.fillText('11:00', cx, cy - 8);
        ctx.font = "10px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.amber, 0.7);
        ctx.fillText('First deviation −3.5%', cx, cy + 10);
      } else if (step === 2) {
        ctx.fillText('12:00–15:00', cx, cy - 8);
        ctx.font = "10px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.red, 0.7);
        ctx.fillText('Gap widening −18%', cx, cy + 10);
      } else {
        ctx.fillText('−8% total', cx, cy - 8);
        ctx.font = "10px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t2, 0.7);
        ctx.fillText('Shift shortfall', cx, cy + 10);
      }

      // Step 3: Post-mortem breakdown on the right
      if (showBreakdown && step >= 3) {
        const bx = w * 0.72, by = h * 0.25;
        const causes = [
          { label: 'Line 3 downtime', pct: 73, color: C.red },
          { label: 'Material delay', pct: 15, color: C.amber },
          { label: 'Quality holds', pct: 12, color: C.blue },
        ];

        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = C.t1;
        ctx.fillText('Root cause breakdown', bx, by);

        causes.forEach((c, i) => {
          const cy2 = by + 22 + i * 32;
          const barW = w * 0.22;
          const barId = `cause-${i}`;
          registerHitRect(hitZonesRef.current, barId, bx, cy2, barW, 8, {
            label: c.label, value: `${c.pct}%`, sublabel: 'Contribution to shortfall', color: c.color,
          });
          const bhp = hoverMap.current.get(barId) || 0;

          // Bar background
          ctx.fillStyle = rgb(C.bd, 0.2);
          ctx.beginPath();
          ctx.roundRect(bx, cy2, barW, 8, 4);
          ctx.fill();
          // Bar fill
          ctx.fillStyle = rgb(c.color, 0.6 + bhp * 0.2);
          ctx.beginPath();
          ctx.roundRect(bx, cy2, barW * (c.pct / 100), 8, 4);
          ctx.fill();
          if (bhp > 0) drawGlow(ctx, bx + barW * (c.pct / 100) / 2, cy2 + 4, 16 * bhp, c.color, 0.15 * bhp);
          // Label
          ctx.font = "9px 'DM Sans',sans-serif";
          ctx.fillStyle = rgb(C.t2, 0.7);
          ctx.fillText(c.label, bx, cy2 + 20);
          ctx.font = "bold 9px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(c.color, 0.8);
          ctx.textAlign = 'right';
          ctx.fillText(`${c.pct}%`, bx + barW, cy2 + 20);
          ctx.textAlign = 'left';
        });
      }

      drawScanline(ctx, w, h, T, 0.012);
      if (!paused) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, data, showBreakdown, paused]);

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
