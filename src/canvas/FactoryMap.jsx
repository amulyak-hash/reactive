import { useEffect, useRef, useMemo, useCallback } from 'react';
import { C, rgb, lerp } from '../theme/tokens';
import { ZONES } from '../data/tataSteel';
import { drawGlow, drawScanline } from './utils';
import { tickHoverProgress, dampedPulse } from './easing';

export default function FactoryMap({ w, h, hov, onHov, onClick, cogCluster }) {
  const ref = useRef(null);
  const t = useRef(0);
  const pulses = useRef([]);
  const hoverMap = useRef(new Map());
  const cogClusterRef = useRef(cogCluster);
  cogClusterRef.current = cogCluster;

  const zonePos = useMemo(() => {
    const pad = .08, usable = 1 - pad * 2;
    const spacing = usable / 4;
    return ZONES.map((z, i) => ({ ...z, px: pad + i * spacing, py: .48 + Math.sin(i * 1.1) * .12 }));
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

    const isoBox = (cx, cy, bw, bh, bd, col, hp) => {
      const s = Math.min(w, h) * .28;
      const iso = (x, y, z) => [cx + (x - y) * s, cy + (x + y) * .5 * s - z * s];
      const hw = bw / 2, hd = bd / 2;

      const top = [iso(-hw, -hd, bh), iso(hw, -hd, bh), iso(hw, hd, bh), iso(-hw, hd, bh)];
      const bot = [iso(-hw, -hd, 0), iso(hw, -hd, 0), iso(hw, hd, 0), iso(-hw, hd, 0)];

      const faces = [
        [top[0], top[1], bot[1], bot[0]],
        [top[1], top[2], bot[2], bot[1]],
        [top[0], top[1], top[2], top[3]],
      ];

      // Glow behind box on hover
      if (hp > 0) {
        drawGlow(ctx, cx, cy, s * 0.4 * hp, col, 0.08 * hp);
      }

      faces.forEach(f => {
        ctx.beginPath();
        f.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        ctx.closePath();
        ctx.fillStyle = rgb(col, lerp(0.02, 0.08, hp));
        ctx.fill();
      });

      const edges = [[0, 1], [1, 2], [2, 3], [3, 0]];
      [top, bot].forEach(face => edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(face[a][0], face[a][1]);
        ctx.lineTo(face[b][0], face[b][1]);
        ctx.strokeStyle = rgb(col, lerp(0.3, 0.8, hp));
        ctx.lineWidth = lerp(1, 1.5, hp);
        ctx.stroke();
      }));
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(top[i][0], top[i][1]);
        ctx.lineTo(bot[i][0], bot[i][1]);
        ctx.strokeStyle = rgb(col, lerp(0.25, 0.7, hp));
        ctx.lineWidth = lerp(1, 1.5, hp);
        ctx.stroke();
      }
      return { top, bot, labelY: top[0][1] - 10 };
    };

    const draw = () => {
      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);

      // Tick hover transitions
      tickHoverProgress(hoverMap.current, hov);

      // Grid
      const s = Math.min(w, h) * .28;
      for (let i = -8; i <= 8; i++) {
        const x1 = w / 2 + (i * .15 - 1.5) * s, y1 = h / 2 + (i * .15 + 1.5) * .5 * s;
        const x2 = w / 2 + (i * .15 + 1.5) * s, y2 = h / 2 + (i * .15 - 1.5) * .5 * s;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = rgb(C.bd, .1); ctx.lineWidth = .5; ctx.stroke();
        const x3 = w / 2 + (-1.5 + i * .15) * s, y3 = h / 2 + (-1.5 + i * .15) * .5 * s;
        const x4 = w / 2 + (1.5 + i * .15) * s, y4 = h / 2 + (1.5 + i * .15) * .5 * s;
        ctx.beginPath(); ctx.moveTo(x3, y3); ctx.lineTo(x4, y4);
        ctx.strokeStyle = rgb(C.bd, .1); ctx.lineWidth = .5; ctx.stroke();
      }

      // Flow arrows between zones — #6: adjust by cogCluster
      const cc = cogClusterRef.current;
      const flowLineWidth = cc === 'systems' ? 2 : 1;
      const flowAlpha = cc === 'systems' ? .35 : .2;
      for (let i = 0; i < zonePos.length - 1; i++) {
        const a = zonePos[i], b = zonePos[i + 1];
        const ax = a.px * w, ay = a.py * h, bx = b.px * w, by = b.py * h;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = rgb(C.bd, flowAlpha); ctx.lineWidth = flowLineWidth;
        ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const angle = Math.atan2(by - ay, bx - ax);
        ctx.beginPath();
        ctx.moveTo(mx + Math.cos(angle) * 6, my + Math.sin(angle) * 6);
        ctx.lineTo(mx + Math.cos(angle + 2.6) * 5, my + Math.sin(angle + 2.6) * 5);
        ctx.lineTo(mx + Math.cos(angle - 2.6) * 5, my + Math.sin(angle - 2.6) * 5);
        ctx.closePath();
        ctx.fillStyle = rgb(C.bd, .3); ctx.fill();
      }

      // Data pulses — #9: systems=brighter, speed=fewer
      const pulseSpawnRate = cc === 'speed' ? 100 : 70;
      const pulseAlphaBoost = cc === 'systems' ? 1.3 : 1;
      if (T % pulseSpawnRate === 0 && pulses.current.length < 5) {
        const i = Math.floor(Math.random() * (zonePos.length - 1));
        pulses.current.push({ from: i, to: i + 1, t: 0, sp: .008 + Math.random() * .006 });
      }
      pulses.current = pulses.current.filter(p => {
        p.t += p.sp;
        if (p.t > 1) return false;
        const a = zonePos[p.from], b = zonePos[p.to];
        const px = lerp(a.px * w, b.px * w, p.t), py = lerp(a.py * h, b.py * h, p.t);
        const al = Math.sin(p.t * Math.PI) * .8 * pulseAlphaBoost;
        // Outer glow
        drawGlow(ctx, px, py, cc === 'systems' ? 12 : 8, a.accent, al * 0.15);
        ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = rgb(a.accent, al); ctx.fill();
        return true;
      });

      // Zone boxes
      const sizes = [[.13, .18, .1], [.11, .14, .09], [.12, .16, .1], [.14, .13, .1], [.1, .12, .08]];
      zonePos.forEach((z, i) => {
        const hp = hoverMap.current.get(z.id) || 0;
        const pulse = dampedPulse(T, 0.02, 0.0002) * .008;
        const hoverScale = 1 + hp * 0.05;
        const [bw, bh, bd] = sizes[i].map(v => (v + pulse) * hoverScale);
        const info = isoBox(z.px * w, z.py * h, bw, bh, bd, z.accent, hp);

        // Zone label
        ctx.font = `${hp > 0.5 ? 'bold ' : ''}11px 'DM Sans',sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.t1, lerp(0.65, 0.95, hp));
        ctx.fillText(z.label, z.px * w, info.labelY - 12);
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(z.accent, lerp(0.45, 0.85, hp));
        ctx.fillText(z.code + ' \u00B7 ' + z.metric.split(':')[0], z.px * w, info.labelY);
      });

      // Flow label
      ctx.font = "italic 10px 'Newsreader',Georgia,serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = rgb(C.t4, .4);
      ctx.fillText('Iron Making  \u2192  Steel Making  \u2192  Casting  \u2192  Rolling  \u2192  Quality', w / 2, h * .94);

      // Ambient particles with depth
      for (let i = 0; i < 30; i++) {
        const depth = (i % 3) * 0.3 + 0.4; // 0.4, 0.7, 1.0
        const px = (Math.sin(T * .002 * depth + i * 19) * .5 + .5) * w;
        const py = (Math.cos(T * .0015 * depth + i * 29) * .5 + .5) * h;
        const r = 0.4 + depth * 0.4;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = rgb(C.blue, .03 + depth * .04); ctx.fill();
      }

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.01);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [w, h, hov, zonePos]);

  const handleMove = useCallback(e => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    let found = null;
    zonePos.forEach(z => {
      if (Math.abs(mx - z.px) < .07 && Math.abs(my - z.py) < .1) found = z.id;
    });
    onHov(found);
  }, [zonePos, onHov]);

  return (
    <canvas
      ref={ref}
      onMouseMove={handleMove}
      onClick={() => { if (hov) onClick(hov); }}
      style={{ width: w, height: h, display: 'block', cursor: hov ? 'pointer' : 'default' }}
    />
  );
}
