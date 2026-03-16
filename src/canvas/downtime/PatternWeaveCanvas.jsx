import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerp } from '../../theme/tokens';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { dampedPulse, tickHoverProgress } from '../easing';
import { DOWNTIME_EVENTS } from '../../data/tataSteel';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function PatternWeaveCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const hoverMap = useRef(new Map());

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const threads = useMemo(() => {
    return DOWNTIME_EVENTS.map((ev, i) => ({
      ...ev,
      idx: i,
      color: ev.machine === 'M21' ? C.red : ev.machine === 'M18' ? C.amber : ev.machine === 'M22' ? C.cyan : C.blue,
      isM21: ev.machine === 'M21',
      isM18: ev.machine === 'M18',
      // Thread position on the loom
      x: 0.1 + (ev.time / 16) * 0.8,
      y: 0.15 + (i / (DOWNTIME_EVENTS.length - 1)) * 0.55,
    }));
  }, []);

  // Connection pairs (shared root causes)
  const connections = useMemo(() => {
    const pairs = [];
    // M21 cluster connections (step 1+)
    const m21s = threads.filter(t => t.isM21);
    for (let i = 0; i < m21s.length - 1; i++) {
      pairs.push({ a: m21s[i].idx, b: m21s[i + 1].idx, type: 'vibration', step: 1 });
    }
    // M21-M18 connection (step 2+)
    const m18s = threads.filter(t => t.isM18);
    if (m21s.length && m18s.length) {
      pairs.push({ a: m21s[0].idx, b: m18s[0].idx, type: 'material', step: 2 });
    }
    return pairs;
  }, [threads]);

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

      drawDust(ctx, w, h, T, 35, 'rgba(80,100,140,.04)');

      // Draw the loom frame
      const loomL = w * 0.06;
      const loomR = w * 0.94;
      const loomT = h * 0.08;
      const loomB = h * 0.82;

      // Vertical warp lines (the loom's frame)
      const warpCount = 24;
      for (let i = 0; i <= warpCount; i++) {
        const x = lerp(loomL, loomR, i / warpCount);
        ctx.beginPath();
        ctx.moveTo(x, loomT);
        ctx.lineTo(x, loomB);
        ctx.strokeStyle = rgb(C.bd, 0.12);
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // Horizontal frame lines
      ctx.strokeStyle = rgb(C.bd, 0.2);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(loomL, loomT);
      ctx.lineTo(loomR, loomT);
      ctx.moveTo(loomL, loomB);
      ctx.lineTo(loomR, loomB);
      ctx.stroke();

      // Draw threads (weft)
      threads.forEach((th, i) => {
        const tx = th.x * w;
        const ty = th.y * h;
        const revealed = step >= 0;
        if (!revealed) return;

        const wave = dampedPulse(T, 0.02, 0.0005) * 3 + Math.sin(i * 3) * 2;
        const nodeId = `thread-${i}`;
        const hp = hoverMap.current.get(nodeId) || 0;

        // Thread path — a wavy horizontal line through the loom
        ctx.beginPath();
        const threadY = ty + wave;
        for (let x = loomL; x <= loomR; x += 3) {
          const localWave = Math.sin(x * 0.02 + T * 0.01 + i * 2) * 2;
          const _Fade = 1 - Math.abs((x - tx) / (w * 0.4));
          if (x === loomL) {
            ctx.moveTo(x, threadY + localWave);
          } else {
            ctx.lineTo(x, threadY + localWave);
          }
        }
        ctx.strokeStyle = rgb(th.color, 0.3 + hp * 0.2);
        ctx.lineWidth = 1.5 + hp;
        ctx.stroke();

        // Thread node
        const pulse = dampedPulse(T, 0.035, 0.0005) * 0.12 + 1;
        const nodeR = (th.duration * 12 + 5) * pulse + hp * 3;

        // Glow on M21 nodes
        if (th.isM21) {
          drawGlow(ctx, tx, threadY, nodeR * 2.5, C.red, 0.12 + hp * 0.1);
        } else {
          // Standard glow
          const glow = ctx.createRadialGradient(tx, threadY, 0, tx, threadY, nodeR * 2.5);
          glow.addColorStop(0, rgb(th.color, 0.12 + hp * 0.1));
          glow.addColorStop(1, rgb(th.color, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(tx, threadY, nodeR * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hover glow
        if (hp > 0) {
          drawGlow(ctx, tx, threadY, nodeR * 2 * hp, th.color, 0.2 * hp);
        }

        // Node
        const ng = ctx.createRadialGradient(tx, threadY - nodeR * 0.2, 0, tx, threadY, nodeR);
        ng.addColorStop(0, rgb(th.color, 0.9 + hp * 0.1));
        ng.addColorStop(1, rgb(th.color, 0.5 + hp * 0.15));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(tx, threadY, nodeR, 0, Math.PI * 2);
        ctx.fill();

        // Machine label
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(th.machine, tx, threadY);

        const timeStr = `${Math.floor(th.time)}:${String(Math.round((th.time % 1) * 60)).padStart(2, '0')}`;
        registerHitCircle(hitZonesRef.current, nodeId, tx, threadY, nodeR + 6, {
          label: th.machine,
          value: `${timeStr} · ${th.duration}h`,
          sublabel: th.isM21 ? 'Vibration cluster' : th.isM18 ? 'Material link' : 'Isolated',
          color: th.color,
        });
      });

      // Draw connections between related events
      if (step >= 1) {
        connections.forEach(conn => {
          if (step < conn.step) return;
          const a = threads[conn.a];
          const b = threads[conn.b];
          const ax = a.x * w, ay = a.y * h + dampedPulse(T, 0.02, 0.0005) * 3 + Math.sin(conn.a * 3) * 2;
          const bx = b.x * w, by = b.y * h + dampedPulse(T, 0.02, 0.0005) * 3 + Math.sin(conn.b * 3) * 2;

          // Connection thread — a woven link
          const midX = (ax + bx) / 2;
          const midY = (ay + by) / 2;
          const bulge = dampedPulse(T, 0.015, 0.0005) * 15;

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.quadraticCurveTo(midX + bulge, midY - 20, bx, by);
          const connColor = conn.type === 'vibration' ? C.red : C.amber;
          ctx.strokeStyle = rgb(connColor, 0.25 + dampedPulse(T, 0.03, 0.0005) * 0.08);
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Flowing particle along connection
          const prog = (T * 0.008 + conn.a * 0.3) % 1;
          const pm = 1 - prog;
          const px = pm * pm * ax + 2 * pm * prog * (midX + bulge) + prog * prog * bx;
          const py = pm * pm * ay + 2 * pm * prog * (midY - 20) + prog * prog * by;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = rgb(connColor, 0.7);
          ctx.fill();
          drawGlow(ctx, px, py, 8, connColor, 0.15);
        });
      }

      // Step 2+: Pattern clusters with labels
      if (step >= 2) {
        // M21 cluster outline
        const m21Threads = threads.filter(th => th.isM21);
        if (m21Threads.length > 1) {
          const minX = Math.min(...m21Threads.map(t => t.x * w)) - 25;
          const maxX = Math.max(...m21Threads.map(t => t.x * w)) + 25;
          const minY = Math.min(...m21Threads.map(t => t.y * h)) - 20;
          const maxY = Math.max(...m21Threads.map(t => t.y * h)) + 20;

          ctx.beginPath();
          ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 12);
          ctx.strokeStyle = rgb(C.red, 0.15 + dampedPulse(T, 0.02, 0.0005) * 0.05);
          ctx.lineWidth = 1;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = "9px 'DM Sans',sans-serif";
          ctx.textAlign = 'left';
          ctx.fillStyle = rgb(C.red, 0.6);
          ctx.fillText('Mechanical cluster · 73%', minX + 4, minY - 6);
        }
      }

      // Step 3: Summary fabric stats at bottom
      if (step >= 3) {
        const statY = h * 0.88;
        ctx.font = "bold 11px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = C.t1;
        ctx.fillText('Two distinct patterns identified', w * 0.5, statY);

        ctx.font = "10px 'JetBrains Mono',monospace";
        // M21 cluster
        ctx.fillStyle = rgb(C.red, 0.75);
        ctx.fillText('M21 cluster: mechanical · 73% of downtime', w * 0.5, statY + 18);
        // Scatter
        ctx.fillStyle = rgb(C.blue, 0.75);
        ctx.fillText('M15/M08 scatter: electrical · 14%', w * 0.5, statY + 34);
      }

      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, step, threads, connections]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
