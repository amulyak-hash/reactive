import { useEffect, useRef, useMemo } from 'react';
import { C, rgb } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, easeOutCubic, tickHoverProgress } from '../easing';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function TimeMachineCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const zones = useMemo(() => [
    { label: 'BF-3', x: 0.15, y: 0.4 },
    { label: 'SMS', x: 0.35, y: 0.35 },
    { label: 'CCM-3', x: 0.55, y: 0.45 },
    { label: 'HSM-1', x: 0.75, y: 0.35 },
    { label: 'QC', x: 0.9, y: 0.4 },
  ], []);

  // Status at different times of day
  const timeStates = useMemo(() => [
    { time: '06:00', label: 'Morning shift start', states: ['green', 'green', 'green', 'green', 'green'] },
    { time: '10:00', label: 'M21 first fault', states: ['amber', 'green', 'amber', 'green', 'green'] },
    { time: '14:00', label: 'Cascade peak', states: ['amber', 'amber', 'red', 'amber', 'green'] },
    { time: '18:00', label: 'End of shift', states: ['amber', 'green', 'red', 'amber', 'green'] },
  ], []);

  const stateColors = useMemo(() => ({ green: C.green, amber: C.amber, red: C.red }), []);

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

      const currentState = timeStates[Math.min(step, timeStates.length - 1)];

      // Time display
      ctx.font = "bold 24px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = C.t1;
      ctx.fillText(currentState.time, w * 0.5, h * 0.12);
      ctx.font = "10px 'DM Sans',sans-serif";
      ctx.fillStyle = rgb(C.t2, 0.6);
      ctx.fillText(currentState.label, w * 0.5, h * 0.17);

      // Flow connections
      for (let i = 0; i < zones.length - 1; i++) {
        const z0 = zones[i], z1 = zones[i + 1];
        const x0 = z0.x * w, y0 = z0.y * h;
        const x1 = z1.x * w, y1 = z1.y * h;
        const state0 = currentState.states[i];
        const flowColor = stateColors[state0];

        ctx.beginPath();
        ctx.moveTo(x0 + 20, y0);
        ctx.lineTo(x1 - 20, y1);
        ctx.strokeStyle = rgb(flowColor, 0.12);
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.strokeStyle = rgb(flowColor, 0.2);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Flow particles
        const speed = state0 === 'green' ? 0.8 : state0 === 'amber' ? 0.4 : 0.15;
        const prog = (T * speed * 0.005) % 1;
        const px = x0 + (x1 - x0) * prog;
        const py = y0 + (y1 - y0) * prog;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = rgb(flowColor, 0.5);
        ctx.fill();
      }

      // Zone nodes
      zones.forEach((z, i) => {
        const zx = z.x * w, zy = z.y * h;
        const state = currentState.states[i];
        const color = stateColors[state];
        const nodeId = `zone-${z.label}`;
        const hp = hoverMap.current.get(nodeId) || 0;
        const pulse = state === 'red' ? dampedPulse(T, 0.06, 0.0005) * 0.15 + 1 :
          state === 'amber' ? dampedPulse(T, 0.04, 0.0005) * 0.08 + 1 : 1;
        const r = (22 + hp * 4) * pulse;

        // Glow — enhanced for red zones
        if (state === 'red') {
          drawGlow(ctx, zx, zy, r * 3 + hp * 8, C.red, 0.15 + hp * 0.1);
        } else {
          const g = ctx.createRadialGradient(zx, zy, 0, zx, zy, r * 2.5);
          g.addColorStop(0, rgb(color, 0.15 + hp * 0.1));
          g.addColorStop(1, rgb(color, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(zx, zy, r * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hover glow
        if (hp > 0) {
          drawGlow(ctx, zx, zy, r * 2 * hp, color, 0.2 * hp);
        }

        // Node
        const ng = ctx.createRadialGradient(zx, zy - r * 0.2, 0, zx, zy, r);
        ng.addColorStop(0, rgb(color, 0.85 + hp * 0.15));
        ng.addColorStop(1, rgb(color, 0.45 + hp * 0.15));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(zx, zy, r, 0, Math.PI * 2);
        ctx.fill();

        // Alert ring for red zones
        if (state === 'red') {
          const alertR = r + (T * 0.3 % 30);
          const alertA = Math.max(0, 1 - alertR / (r + 30)) * 0.3;
          ctx.beginPath();
          ctx.arc(zx, zy, alertR, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(C.red, alertA);
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Label
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(z.label, zx, zy);

        // Status dot
        ctx.beginPath();
        ctx.arc(zx + r + 6, zy - r + 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = rgb(color, 0.8);
        ctx.fill();

        registerHitCircle(hitZonesRef.current, nodeId, zx, zy, r + 6, {
          label: z.label,
          value: `Status: ${state}`,
          sublabel: `${currentState.time} · ${currentState.label}`,
          color,
        });
      });

      // Timeline bar at bottom
      const tlY = h * 0.75;
      const tlX = w * 0.15, tlW = w * 0.7;
      ctx.fillStyle = rgb(C.bd, 0.2);
      ctx.beginPath();
      ctx.roundRect(tlX, tlY, tlW, 4, 2);
      ctx.fill();

      // Time markers
      timeStates.forEach((ts, i) => {
        const x = tlX + (i / (timeStates.length - 1)) * tlW;
        const isActive = i <= step;
        const markerId = `time-${ts.time}`;
        const markerHp = hoverMap.current.get(markerId) || 0;

        ctx.beginPath();
        ctx.arc(x, tlY + 2, (isActive ? 6 : 4) + markerHp * 2, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? rgb(C.blue, 0.6 + markerHp * 0.2) : rgb(C.bd, 0.3 + markerHp * 0.2);
        ctx.fill();

        if (markerHp > 0) {
          drawGlow(ctx, x, tlY + 2, 12 * markerHp, C.blue, 0.15 * markerHp);
        }

        ctx.font = "8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = isActive ? rgb(C.t1, 0.7) : rgb(C.t4, 0.5);
        ctx.fillText(ts.time, x, tlY + 18);

        registerHitCircle(hitZonesRef.current, markerId, x, tlY + 2, 10, {
          label: ts.time,
          value: ts.label,
          sublabel: ts.states.join(' · '),
          color: C.blue,
        });
      });

      // Progress fill — eased
      const prog = easeOutCubic(Math.min(step / (timeStates.length - 1), 1));
      ctx.fillStyle = rgb(C.blue, 0.3);
      ctx.beginPath();
      ctx.roundRect(tlX, tlY, tlW * prog, 4, 2);
      ctx.fill();

      // Glow on active timeline marker
      const activeX = tlX + (Math.min(step, timeStates.length - 1) / (timeStates.length - 1)) * tlW;
      drawGlow(ctx, activeX, tlY + 2, 14, C.blue, 0.2);

      // Step 3: Summary
      if (step >= 3) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.t2, 0.6);
        ctx.fillText('6h green · 2h amber · 4h red — started perfect, ended fractured', w * 0.5, h * 0.9);
      }

      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, zones, timeStates, stateColors]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
