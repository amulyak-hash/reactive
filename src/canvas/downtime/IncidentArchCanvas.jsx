import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerpC } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { DOWNTIME_EVENTS } from '../../data/tataSteel';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function IncidentArchCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  // Sort events by time (oldest = deepest layer)
  const layers = useMemo(() => {
    const sorted = [...DOWNTIME_EVENTS].sort((a, b) => b.time - a.time);
    return sorted.map((ev, i) => ({
      ...ev,
      depth: i,
      isM21: ev.machine === 'M21',
      yBase: 0.15 + (i / sorted.length) * 0.65,
      color: ev.machine === 'M21' ? C.red : ev.machine === 'M18' ? C.amber : C.blue,
    }));
  }, []);

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

      drawDust(ctx, w, h, T, 40);

      const cx = w * 0.5;
      const layerH = h * 0.08;
      const baseY = h * 0.08;
      const visibleLayers = Math.min(step + 1, layers.length);

      // Draw geological strata
      for (let i = 0; i < layers.length; i++) {
        const ly = baseY + i * layerH;
        const revealed = i < visibleLayers;
        const alpha = revealed ? 0.85 : 0.08;

        // Stratum background — wavy geological layer
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const wave = Math.sin(x * 0.008 + i * 1.7) * 4 + Math.sin(x * 0.015 + i * 0.9) * 2;
          const y = ly + wave;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        for (let x = w; x >= 0; x -= 2) {
          const wave = Math.sin(x * 0.008 + i * 1.7) * 4 + Math.sin(x * 0.015 + i * 0.9) * 2;
          ctx.lineTo(x, ly + layerH + wave);
        }
        ctx.closePath();

        // Color strata by depth
        const strataColor = lerpC(C.sf, layers[i].color, revealed ? 0.2 : 0.04);
        ctx.fillStyle = rgb(strataColor, alpha);
        ctx.fill();

        // Stratum line
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const wave = Math.sin(x * 0.008 + i * 1.7) * 4 + Math.sin(x * 0.015 + i * 0.9) * 2;
          x === 0 ? ctx.moveTo(x, ly + wave) : ctx.lineTo(x, ly + wave);
        }
        ctx.strokeStyle = rgb(layers[i].color, revealed ? 0.25 : 0.05);
        ctx.lineWidth = 0.8;
        ctx.stroke();

        if (!revealed) continue;

        // Event marker within the layer
        const ev = layers[i];
        const evX = cx + (ev.time - 8) * (w * 0.04);
        const evY = ly + layerH * 0.5;
        const pulse = dampedPulse(T, 0.04, 0.0005) * 0.15 + 1;
        const nodeId = `event-${i}`;
        const hp = hoverMap.current.get(nodeId) || 0;

        // Event node
        const nodeR = (ev.duration * 18 + 6) * pulse + hp * 4;

        // Glow for active/M21 nodes
        if (ev.isM21 && step >= 1) {
          drawGlow(ctx, evX, evY, nodeR * 3, C.red, 0.15 + hp * 0.1);
        }
        // Hover glow for all nodes
        if (hp > 0) {
          drawGlow(ctx, evX, evY, nodeR * 2.5 * hp, ev.color, 0.2 * hp);
        }

        // Node circle
        const ng = ctx.createRadialGradient(evX, evY - nodeR * 0.2, 0, evX, evY, nodeR);
        ng.addColorStop(0, rgb(ev.color, 0.9 + hp * 0.1));
        ng.addColorStop(1, rgb(ev.color, 0.5 + hp * 0.15));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(evX, evY, nodeR, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.beginPath();
        ctx.arc(evX, evY, nodeR + 3, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(ev.color, 0.2 + hp * 0.2);
        ctx.lineWidth = 0.6 + hp;
        ctx.stroke();

        // Machine label
        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(C.t1, 0.9);
        ctx.fillText(ev.machine, evX, evY);

        // Time label
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t3, 0.6);
        const timeStr = `${Math.floor(ev.time)}:${String(Math.round((ev.time % 1) * 60)).padStart(2, '0')}`;
        ctx.fillText(timeStr, evX, evY + nodeR + 12);

        registerHitCircle(hitZonesRef.current, nodeId, evX, evY, nodeR + 6, {
          label: ev.machine,
          value: `${timeStr} · ${ev.duration}h duration`,
          sublabel: ev.isM21 ? 'Mechanical cluster' : 'Isolated event',
          color: ev.color,
        });

        // Step 2+: Draw connection lines between M21 events
        if (step >= 2 && ev.isM21) {
          const nextM21 = layers.find((l, j) => j > i && l.isM21 && j < visibleLayers);
          if (nextM21) {
            const nIdx = layers.indexOf(nextM21);
            const nX = cx + (nextM21.time - 8) * (w * 0.04);
            const nY = baseY + nIdx * layerH + layerH * 0.5;

            ctx.beginPath();
            ctx.setLineDash([3, 4]);
            ctx.moveTo(evX, evY + nodeR + 2);
            ctx.lineTo(nX, nY - (nextM21.duration * 18 + 6) - 2);
            ctx.strokeStyle = rgb(C.red, 0.25 + dampedPulse(T, 0.03, 0.0005) * 0.1);
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      // Step 3: The fossil — origin event highlight at bottom
      if (step >= 3) {
        const fossilY = baseY + layers.length * layerH + 20;
        const fossilPulse = dampedPulse(T, 0.025, 0.0005) * 0.1 + 1;
        const fossilId = 'fossil-origin';
        const fossilHp = hoverMap.current.get(fossilId) || 0;

        // Glow ring
        const glowR = 35 * fossilPulse + fossilHp * 10;
        drawGlow(ctx, cx, fossilY, glowR * 2.5, C.red, 0.12 + fossilHp * 0.15);

        // Fossil node
        ctx.beginPath();
        ctx.arc(cx, fossilY, 18 + fossilHp * 4, 0, Math.PI * 2);
        const fcg = ctx.createRadialGradient(cx, fossilY - 4, 0, cx, fossilY, 18 + fossilHp * 4);
        fcg.addColorStop(0, rgb(C.red, 0.95));
        fcg.addColorStop(1, rgb(C.orange, 0.6));
        ctx.fillStyle = fcg;
        ctx.fill();

        // Pulsing ring
        const ringR = 18 + (T * 0.3 % 40);
        const ringA = Math.max(0, 1 - ringR / 58) * 0.3;
        ctx.beginPath();
        ctx.arc(cx, fossilY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(C.red, ringA);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = "bold 11px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText('ORIGIN', cx, fossilY + 1);

        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t2, 0.7);
        ctx.fillText('Non-OEM bearing · 6 days ago', cx, fossilY + 32);

        registerHitCircle(hitZonesRef.current, fossilId, cx, fossilY, 30, {
          label: 'Origin Event',
          value: 'Non-OEM bearing installed 6 days ago',
          sublabel: 'Root cause of M21 cluster',
          color: C.red,
        });

        // Lines from fossil to deepest M21
        const deepestM21 = [...layers].reverse().find(l => l.isM21);
        if (deepestM21) {
          const dIdx = layers.indexOf(deepestM21);
          const dX = cx + (deepestM21.time - 8) * (w * 0.04);
          const dY = baseY + dIdx * layerH + layerH * 0.5;

          ctx.beginPath();
          ctx.setLineDash([2, 3]);
          ctx.moveTo(cx, fossilY - 20);
          ctx.lineTo(dX, dY + 12);
          ctx.strokeStyle = rgb(C.red, 0.2);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Depth label on left
      ctx.save();
      ctx.translate(16, h * 0.45);
      ctx.rotate(-Math.PI / 2);
      ctx.font = "9px 'JetBrains Mono',monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.t4, 0.5);
      ctx.fillText('← DEEPER    SURFACE →', 0, 0);
      ctx.restore();

      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, layers]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
