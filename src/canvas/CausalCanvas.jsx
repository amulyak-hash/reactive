import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerpC } from '../theme/tokens';
import { dampedPulse, easeOutCubic } from './easing';
import { drawGlow, drawScanline, drawDust } from './utils';

export default function CausalCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const parts = useRef([]);

  const nodes = useMemo(() => [
    { x: .13, y: .48, l: "Supplier X", s: "Si +0.12%", c: C.blue, r: 26 },
    { x: .37, y: .28, l: "BF-3 Superheat", s: "22\u00B0C (target 34)", c: C.cyan, r: 24 },
    { x: .63, y: .62, l: "CCM-3 Solidification", s: "Rate deviation", c: C.orange, r: 24 },
    { x: .87, y: .38, l: "Grade Risk", s: "Automotive 74%", c: C.red, r: 26 },
  ], []);

  const edges = useMemo(() => [
    { f: 0, t: 1, conf: .92 },
    { f: 1, t: 2, conf: .87 },
    { f: 2, t: 3, conf: .74 },
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
    parts.current = [];

    const bez = (ei) => {
      const e = edges[ei], n0 = nodes[e.f], n1 = nodes[e.t];
      const x0 = n0.x * w, y0 = n0.y * h, x1 = n1.x * w, y1 = n1.y * h;
      const dx = x1 - x0, dy = y1 - y0;
      return {
        p0: { x: x0, y: y0 },
        p1: { x: x0 + dx * .3 + dy * .15, y: y0 + dy * .3 - dx * .15 },
        p2: { x: x1 - dx * .3 + dy * .08, y: y1 - dy * .3 - dx * .08 },
        p3: { x: x1, y: y1 },
      };
    };

    const bPt = (b, t) => {
      const m = 1 - t;
      return {
        x: m * m * m * b.p0.x + 3 * m * m * t * b.p1.x + 3 * m * t * t * b.p2.x + t * t * t * b.p3.x,
        y: m * m * m * b.p0.y + 3 * m * m * t * b.p1.y + 3 * m * t * t * b.p2.y + t * t * t * b.p3.y,
      };
    };

    const bNm = (b, t) => {
      const m = 1 - t;
      const dx = 3 * m * m * (b.p1.x - b.p0.x) + 6 * m * t * (b.p2.x - b.p1.x) + 3 * t * t * (b.p3.x - b.p2.x);
      const dy = 3 * m * m * (b.p1.y - b.p0.y) + 6 * m * t * (b.p2.y - b.p1.y) + 3 * t * t * (b.p3.y - b.p2.y);
      const l = Math.sqrt(dx * dx + dy * dy) || 1;
      return { x: -dy / l, y: dx / l };
    };

    const draw = () => {
      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);

      // Dust
      drawDust(ctx, w, h, T, 50, 'rgba(80,120,160,.05)');

      // Edges + particles
      const ae = Math.min(step, edges.length);
      for (let ei = 0; ei < ae; ei++) {
        const b = bez(ei);
        ctx.beginPath();
        ctx.moveTo(b.p0.x, b.p0.y);
        ctx.bezierCurveTo(b.p1.x, b.p1.y, b.p2.x, b.p2.y, b.p3.x, b.p3.y);
        ctx.strokeStyle = rgb(lerpC(nodes[edges[ei].f].c, nodes[edges[ei].t].c, .5), .05);
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.strokeStyle = rgb(lerpC(nodes[edges[ei].f].c, nodes[edges[ei].t].c, .5), .1);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        for (let s = 0; s < edges[ei].conf * 2.5; s++) {
          if (Math.random() < .45) {
            parts.current.push({
              ei, t: 0,
              sp: .003 + Math.random() * .004,
              off: (Math.random() - .5) * 13,
              sz: .7 + Math.random() * 2,
            });
          }
        }

        const mid = bPt(b, .5);
        const lbl = `${Math.round(edges[ei].conf * 100)}%`;
        ctx.font = "bold 12px 'JetBrains Mono',monospace";
        const tw = ctx.measureText(lbl).width + 14;
        ctx.fillStyle = 'rgba(10,16,24,.88)';
        ctx.beginPath();
        ctx.roundRect(mid.x - tw / 2, mid.y - 11, tw, 22, 6);
        ctx.fill();
        ctx.strokeStyle = rgb(C.cyan, .25);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = rgb(C.cyan, .9);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, mid.x, mid.y);
      }

      parts.current = parts.current.filter(p => {
        p.t += p.sp;
        if (p.t > 1) return false;
        const b = bez(p.ei);
        const pos = bPt(b, p.t);
        const nm = bNm(b, p.t);
        const x = pos.x + nm.x * p.off, y = pos.y + nm.y * p.off;
        const al = Math.sin(p.t * Math.PI) * .7;
        const col = lerpC(nodes[edges[p.ei].f].c, nodes[edges[p.ei].t].c, p.t);
        // Particle glow (radial gradient instead of shadowBlur)
        drawGlow(ctx, x, y, p.sz * 3, col, al * 0.1);
        ctx.beginPath();
        ctx.arc(x, y, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = rgb(col, al);
        ctx.fill();
        return true;
      });
      if (parts.current.length > 350) parts.current = parts.current.slice(-350);

      // Nodes
      for (let i = 0; i <= Math.min(step, nodes.length - 1); i++) {
        const n = nodes[i], nx = n.x * w, ny = n.y * h;
        const pulse = dampedPulse(T, 0.03, 0.0003) * .1 + 1;
        const r = n.r * pulse;
        const isEnd = i === Math.min(step, nodes.length - 1) && i > 0;

        // Outer glow (enhanced)
        drawGlow(ctx, nx, ny, r * 3, n.c, 0.12);

        ctx.beginPath();
        ctx.arc(nx, ny, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(n.c, .1);
        ctx.lineWidth = .7;
        ctx.stroke();

        const cg = ctx.createRadialGradient(nx, ny - r * .2, 0, nx, ny, r);
        cg.addColorStop(0, rgb(n.c, .85));
        cg.addColorStop(1, rgb(n.c, .45));
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fill();

        if (isEnd) {
          const oR = r + 16, angle = T * .04;
          const ox = nx + Math.cos(angle) * oR, oy = ny + Math.sin(angle) * oR;
          drawGlow(ctx, ox, oy, 6, n.c, 0.3);
          ctx.beginPath();
          ctx.arc(ox, oy, 2, 0, Math.PI * 2);
          ctx.fillStyle = rgb(n.c, .75);
          ctx.fill();
        }

        ctx.font = "bold 12px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(n.c, .9);
        ctx.fillText(n.l, nx, ny + r + 18);
        ctx.font = "10px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t3, .65);
        ctx.fillText(n.s, nx, ny + r + 32);
      }

      // Compound bar
      if (step >= 4) {
        const by = h * .92, bx = w * .12, bw = w * .76;
        ctx.fillStyle = rgb(C.bd, .35);
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, 5, 3);
        ctx.fill();
        const cc = .92 * .87 * .74;
        const barProg = easeOutCubic(Math.min(T * 0.008, 1));
        ctx.fillStyle = rgb(C.orange, .6);
        ctx.beginPath();
        ctx.roundRect(bx, by, bw * cc * barProg, 5, 3);
        ctx.fill();
        ctx.font = "bold 12px 'JetBrains Mono',monospace";
        ctx.textAlign = 'left';
        ctx.fillStyle = rgb(C.orange, .85);
        ctx.fillText(`${Math.round(cc * 100)}% compound confidence`, bx + bw * cc + 10, by + 4);
        ctx.textAlign = 'right';
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t4, .6);
        ctx.fillText('0.92 \u00D7 0.87 \u00D7 0.74', bx - 6, by + 4);
      }

      // Scanline overlay
      drawScanline(ctx, w, h, T, 0.012);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); parts.current = []; };
  }, [w, h, step, nodes, edges]);

  return <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />;
}
