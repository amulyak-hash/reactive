import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { MACHINE_FAULTS } from '../../data/tataSteel';
import { dampedPulse, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitRect } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function RepeatOffendersCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const suspects = useMemo(() => {
    const machines = MACHINE_FAULTS.filter(m => m.faults > 0).sort((a, b) => b.faults - a.faults);
    const cols = Math.min(machines.length, 4);
    const padL = w * 0.1;
    const cardW = (w * 0.8) / cols - 10;

    return machines.map((m, i) => ({
      ...m,
      x: padL + (i % cols) * (cardW + 10),
      y: h * 0.12,
      w: cardW,
      h: h * 0.35,
      isSerial: m.id === 'M21',
      isAssociate: m.id === 'M18',
      color: m.id === 'M21' ? C.red : m.id === 'M18' ? C.amber : C.blue,
      weekFaults: m.id === 'M21' ? 12 : m.id === 'M18' ? 4 : m.faults,
      monthFaults: m.id === 'M21' ? 23 : m.id === 'M18' ? 8 : m.faults * 2,
    }));
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

      // Reset hit zones
      hitZonesRef.current = [];

      // Draw mugshot cards
      suspects.forEach((sus, si) => {
        const visible = step === 0 || (step === 1 && sus.isSerial) || step >= 2;
        if (!visible) return;

        const hp = hoverMap.current.get(`card-${si}`) || 0;

        // Register hit zone for the card
        registerHitRect(hitZonesRef.current, `card-${si}`, sus.x, sus.y, sus.w, sus.h, {
          label: sus.id,
          value: `${sus.faults} faults today`,
          sublabel: sus.isSerial ? 'Serial offender — escalating' : sus.isAssociate ? '73% correlated with M21' : `Week: ${sus.weekFaults}`,
          color: sus.color,
        });

        // Card background
        ctx.fillStyle = rgb(C.sf, 0.6 + hp * 0.15);
        ctx.beginPath();
        ctx.roundRect(sus.x, sus.y, sus.w, sus.h, 8);
        ctx.fill();
        ctx.strokeStyle = rgb(sus.color, (sus.isSerial ? 0.3 : 0.1) + hp * 0.25);
        ctx.lineWidth = 1 + hp * 0.5;
        ctx.stroke();

        // Glow on hover
        if (hp > 0) {
          drawGlow(ctx, sus.x + sus.w / 2, sus.y + sus.h / 2, sus.w * 0.6, sus.color, hp * 0.08);
        }

        // "Photo" area — machine icon circle
        const photoR = 18;
        const photoCx = sus.x + sus.w / 2;
        const photoCy = sus.y + 30;
        const pulse = sus.isSerial ? dampedPulse(T, 0.04, 0.0005) * 0.1 + 1 : 1;

        const pg = ctx.createRadialGradient(photoCx, photoCy - 3, 0, photoCx, photoCy, photoR * pulse);
        pg.addColorStop(0, rgb(sus.color, 0.8 + hp * 0.2));
        pg.addColorStop(1, rgb(sus.color, 0.4 + hp * 0.15));
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(photoCx, photoCy, photoR * pulse + hp * 2, 0, Math.PI * 2);
        ctx.fill();

        // Machine ID
        ctx.font = "bold 11px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(sus.id, photoCx, photoCy);

        // Fault count
        ctx.font = "bold 14px 'JetBrains Mono',monospace";
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgb(sus.color, 0.8 + hp * 0.2);
        ctx.fillText(`${sus.faults}`, photoCx, photoCy + photoR + 8);
        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText('today', photoCx, photoCy + photoR + 26);

        // Step 1: Serial offender history
        if (step >= 1 && sus.isSerial) {
          const histY = photoCy + photoR + 42;
          ctx.font = "8px 'JetBrains Mono',monospace";
          ctx.fillStyle = rgb(C.t2, 0.6);
          ctx.fillText(`Week: ${sus.weekFaults}`, photoCx, histY);
          ctx.fillText(`Month: ${sus.monthFaults}`, photoCx, histY + 13);
          ctx.fillStyle = rgb(C.red, 0.5);
          ctx.fillText('ESCALATING', photoCx, histY + 28);
        }
      });

      // Step 2: Red string connections (M21 <-> M18)
      if (step >= 2) {
        const m21 = suspects.find(s => s.isSerial);
        const m18 = suspects.find(s => s.isAssociate);
        if (m21 && m18) {
          const x1 = m21.x + m21.w / 2, y1 = m21.y + m21.h;
          const x2 = m18.x + m18.w / 2, y2 = m18.y + m18.h;

          // Red string
          const midY = Math.max(y1, y2) + 25;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo((x1 + x2) / 2, midY + dampedPulse(T, 0.02, 0.0003) * 5, x2, y2);
          ctx.strokeStyle = rgb(C.red, 0.25);
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Correlation label
          ctx.font = "8px 'DM Sans',sans-serif";
          ctx.textAlign = 'center';
          ctx.fillStyle = rgb(C.red, 0.5);
          ctx.fillText('73% correlation — shared feed line', (x1 + x2) / 2, midY + 12);
        }
      }

      // Step 3: Case file summary
      if (step >= 3) {
        const sy = h * 0.75;
        const caseX = w * 0.1;

        ctx.fillStyle = rgb(C.sf, 0.5);
        ctx.beginPath();
        ctx.roundRect(caseX, sy, w * 0.8, h * 0.2, 8);
        ctx.fill();
        ctx.strokeStyle = rgb(C.red, 0.15);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glow on case file
        drawGlow(ctx, caseX + w * 0.4, sy + h * 0.1, 60, C.red, 0.06);

        ctx.font = "bold 10px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillStyle = C.t1;
        ctx.fillText('M21 Case File', caseX + 12, sy + 16);

        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('Stable 18 months → bearing swap 6 days ago → 4× fault rate', caseX + 12, sy + 34);
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('Clear inflection point. Clear suspect. Clear fix.', caseX + 12, sy + 50);
      }

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, suspects]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
