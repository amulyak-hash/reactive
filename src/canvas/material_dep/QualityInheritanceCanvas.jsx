import { useEffect, useRef, useMemo } from 'react';
import { C, rgb, lerpC } from '../../theme/tokens';
import { dampedPulse, tickHoverProgress } from '../easing';
import { drawDust, drawGlow, drawScanline } from '../utils';
import { useCanvasInteraction, registerHitCircle } from '../../hooks/useCanvasInteraction';
import CanvasTooltip from '../../components/CanvasTooltip';

export default function QualityInheritanceCanvas({ w, h, step }) {
  const ref = useRef(null);
  const t = useRef(0);
  const particles = useRef([]);
  const hoverMap = useRef(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(ref, { width: w, height: h });

  const generations = useMemo(() => [
    { label: 'Supplier X', code: 'Si +0.12%', x: 0.08, y: 0.45, color: C.orange, severity: 0.3 },
    { label: 'BF-3', code: '−12°C superheat', x: 0.28, y: 0.35, color: C.red, severity: 0.5 },
    { label: 'CCM-3', code: '−8% rate', x: 0.48, y: 0.55, color: C.amber, severity: 0.65 },
    { label: 'HSM-1', code: 'Thickness var.', x: 0.68, y: 0.38, color: C.cyan, severity: 0.75 },
    { label: 'QC', code: 'Defect detected', x: 0.88, y: 0.48, color: C.red, severity: 0.85 },
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
    particles.current = [];

    const draw = () => {
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      t.current++;
      const T = t.current;
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, w, h, T, 25);

      const visibleGens = Math.min(step + 2, generations.length);

      // Gene flow edges
      for (let i = 0; i < visibleGens - 1; i++) {
        const g0 = generations[i], g1 = generations[i + 1];
        const x0 = g0.x * w, y0 = g0.y * h;
        const x1 = g1.x * w, y1 = g1.y * h;

        // DNA-style double helix between nodes
        const segments = 20;
        for (let s = 0; s < segments; s++) {
          const prog = s / segments;
          const px = x0 + (x1 - x0) * prog;
          const py = y0 + (y1 - y0) * prog;
          const helixOff = Math.sin(prog * Math.PI * 3 + T * 0.02) * 8;

          // Upper strand
          ctx.beginPath();
          ctx.arc(px, py + helixOff, 1.5, 0, Math.PI * 2);
          const strandColor = lerpC(g0.color, g1.color, prog);
          ctx.fillStyle = rgb(strandColor, 0.3);
          ctx.fill();

          // Lower strand
          ctx.beginPath();
          ctx.arc(px, py - helixOff, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = rgb(strandColor, 0.2);
          ctx.fill();
        }

        // Connection line
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = rgb(g1.color, 0.08);
        ctx.lineWidth = 12;
        ctx.stroke();

        // Amplification arrow
        if (step >= 2) {
          const midX = (x0 + x1) / 2, midY = (y0 + y1) / 2;
          ctx.font = "bold 10px 'DM Sans',sans-serif";
          ctx.textAlign = 'center';
          ctx.fillStyle = rgb(C.red, 0.3);
          ctx.fillText('⟩', midX, midY - 12);
        }

        // Mutation particles
        if (Math.random() < 0.1) {
          particles.current.push({
            edge: i, prog: 0,
            speed: 0.005 + Math.random() * 0.005,
            off: (Math.random() - 0.5) * 12,
            sz: 1 + Math.random(),
          });
        }
      }

      // Draw particles
      particles.current = particles.current.filter(p => {
        p.prog += p.speed;
        if (p.prog > 1) return false;
        const g0 = generations[p.edge], g1 = generations[p.edge + 1];
        const px = g0.x * w + (g1.x * w - g0.x * w) * p.prog;
        const py = g0.y * h + (g1.y * h - g0.y * h) * p.prog + p.off;
        const col = lerpC(g0.color, g1.color, p.prog);
        const al = Math.sin(p.prog * Math.PI) * 0.5;

        ctx.beginPath();
        ctx.arc(px, py, p.sz * 2, 0, Math.PI * 2);
        ctx.fillStyle = rgb(col, al * 0.1);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = rgb(col, al);
        ctx.fill();
        return true;
      });
      if (particles.current.length > 100) particles.current = particles.current.slice(-100);

      // Generation nodes
      for (let i = 0; i < visibleGens; i++) {
        const gen = generations[i];
        const gx = gen.x * w, gy = gen.y * h;
        if (i === visibleGens - 1) drawGlow(ctx, gx, gy, 35, gen.color, 0.12);
        const pulse = dampedPulse(T, 0.03, 0.0005) * 0.1 + 1;
        const r = 18 * pulse;
        const nodeId = `gen-${i}`;
        const hp = hoverMap.current.get(nodeId) || 0;

        // Severity ring (grows with generation)
        if (step >= 2) {
          ctx.beginPath();
          ctx.arc(gx, gy, r + 4 + gen.severity * 8, 0, Math.PI * 2);
          ctx.strokeStyle = rgb(gen.color, gen.severity * 0.15);
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Hover glow
        if (hp > 0) drawGlow(ctx, gx, gy, 16 * hp, gen.color, 0.2 * hp);

        // Glow
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r * 2.5);
        g.addColorStop(0, rgb(gen.color, 0.12 + 0.08 * hp));
        g.addColorStop(1, rgb(gen.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(gx, gy, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node
        const ng = ctx.createRadialGradient(gx, gy - r * 0.2, 0, gx, gy, r);
        ng.addColorStop(0, rgb(gen.color, 0.85 + 0.1 * hp));
        ng.addColorStop(1, rgb(gen.color, 0.45 + 0.1 * hp));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(gx, gy, r, 0, Math.PI * 2);
        ctx.fill();

        // Labels
        ctx.font = "bold 8px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = C.t1;
        ctx.fillText(gen.label, gx, gy - 2);
        ctx.font = "7px 'JetBrains Mono',monospace";
        ctx.fillStyle = rgb(C.t2, 0.7);
        ctx.fillText(gen.code, gx, gy + 8);

        registerHitCircle(hitZonesRef.current, nodeId, gx, gy, r + 4, {
          label: gen.label, value: gen.code, sublabel: `Severity: ${Math.round(gen.severity * 100)}%`, color: gen.color,
        });
      }

      // Step 2: Amplification label
      if (step >= 2) {
        ctx.font = "9px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.red, 0.6);
        ctx.fillText('Mutations amplify — small input variance grows through generations', w * 0.5, h * 0.78);
      }

      // Step 3: Full genealogy
      if (step >= 3) {
        ctx.font = "bold 9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = rgb(C.t1, 0.7);
        ctx.fillText('Si variance → superheat drop → rate reduction → thickness variance → defect', w * 0.5, h * 0.85);
        ctx.font = "8px 'DM Sans',sans-serif";
        ctx.fillStyle = rgb(C.t3, 0.5);
        ctx.fillText('5 generations, one ancestor', w * 0.5, h * 0.9);
      }

      drawScanline(ctx, w, h, T, 0.012);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); particles.current = []; };
  }, [w, h, step, generations]);

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} />
      <CanvasTooltip {...tooltip} parentW={w} parentH={h} />
    </div>
  );
}
