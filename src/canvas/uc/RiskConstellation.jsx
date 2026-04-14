import { useRef, useEffect, useState } from 'react';
import { C, rgb } from '../../theme/tokens';
import { setupCanvas, drawGlow } from '../utils';
import { easeOutCubic, easeOutBack } from '../easing';

const NODE_ANGLES = [-0.4, -0.15, 0.1, 0.35, 0.6, 0.85, 1.1, 1.35];

const CONNECTIONS = [
  [0, 2], [2, 3], [3, 7], [1, 4], [5, 2], [0, 5], [6, 3], [6, 7],
];

export default function RiskConstellation({ width, height, useCases, onNodeClick }) {
  const canvasRef = useRef(null);
  const startRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const hoveredRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !useCases?.length || width < 10 || height < 10) return;
    startRef.current = performance.now();

    const cx = width / 2, cy = height / 2;
    const orbitR = Math.min(width, height) * 0.32;
    const maxExposure = Math.max(...useCases.map(uc => uc.budgetImpact.withoutAction || 1000));

    const nodes = useCases.map((uc, i) => {
      const angle = i < NODE_ANGLES.length
        ? Math.PI * NODE_ANGLES[i]
        : (2 * Math.PI * i) / useCases.length;
      const exposure = uc.budgetImpact.withoutAction || 1000;
      const r = 20 + (exposure / maxExposure) * 28;
      return {
        x: cx + Math.cos(angle) * orbitR,
        y: cy + Math.sin(angle) * orbitR,
        r, angle, uc, exposure, idx: i,
      };
    });

    const particles = CONNECTIONS
      .filter(([from, to]) => from < nodes.length && to < nodes.length)
      .map(([from, to]) => ({
        from, to,
        particles: Array.from({ length: 4 }, (_, i) => ({ t: i * 0.25, speed: 0.0005 + Math.random() * 0.0004 })),
      }));

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      let found = null;
      for (const n of nodes) {
        const dx = mouseRef.current.x - n.x, dy = mouseRef.current.y - n.y;
        if (dx * dx + dy * dy <= (n.r + 12) * (n.r + 12)) { found = n.idx; break; }
      }
      hoveredRef.current = found;
      setHovered(found);
      canvas.style.cursor = found !== null ? 'pointer' : 'default';
    };
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      for (const n of nodes) {
        const dx = mx - n.x, dy = my - n.y;
        if (dx * dx + dy * dy <= (n.r + 12) * (n.r + 12)) { onNodeClick?.(n.uc.id); break; }
      }
    };
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 }; hoveredRef.current = null; setHovered(null); canvas.style.cursor = 'default'; };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const draw = () => {
      const T = performance.now();
      const elapsed = T - startRef.current;
      const entryP = Math.min(elapsed / 2000, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);

      // Background radial glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbitR * 1.6);
      bgGrad.addColorStop(0, 'rgba(41, 207, 214, 0.06)');
      bgGrad.addColorStop(0.4, 'rgba(92, 131, 255, 0.03)');
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, width, height);

      // Orbit ring
      ctx.globalAlpha = 0.1 * easeOutCubic(entryP);
      ctx.strokeStyle = C.teal; ctx.lineWidth = 1;
      ctx.setLineDash([6, 10]);
      ctx.beginPath(); ctx.arc(cx, cy, orbitR, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      // Connections + particles
      const connP = easeOutCubic(Math.min(Math.max((entryP - 0.3) / 0.7, 0), 1));
      particles.forEach(conn => {
        const fn = nodes[conn.from], tn = nodes[conn.to];
        const midX = cx + (fn.x + tn.x - cx * 2) * 0.15;
        const midY = cy + (fn.y + tn.y - cy * 2) * 0.15;

        // Line
        ctx.globalAlpha = 0.12 * connP;
        ctx.strokeStyle = C.teal; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(fn.x, fn.y);
        ctx.quadraticCurveTo(midX, midY, tn.x, tn.y); ctx.stroke();

        // Particles
        if (connP > 0.3) {
          conn.particles.forEach(p => {
            p.t = (p.t + p.speed * 16) % 1;
            const t = p.t;
            const px = (1 - t) * (1 - t) * fn.x + 2 * (1 - t) * t * midX + t * t * tn.x;
            const py = (1 - t) * (1 - t) * fn.y + 2 * (1 - t) * t * midY + t * t * tn.y;
            const alpha = Math.sin(t * Math.PI) * 0.8;
            ctx.globalAlpha = alpha * connP;
            ctx.fillStyle = C.teal;
            ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
            drawGlow(ctx, px, py, 8, C.teal, 0.25 * alpha);
          });
        }
      });

      // Center hub
      const hubP = easeOutBack(Math.min(entryP / 0.5, 1));
      const hubR = Math.max(1, 34 * hubP);
      const hubPulse = 0.85 + 0.15 * Math.sin(T * 0.002);

      drawGlow(ctx, cx, cy, hubR * 3, C.teal, 0.12 * hubPulse);

      // Hub filled circle
      ctx.globalAlpha = 0.2 * hubP;
      ctx.fillStyle = C.teal;
      ctx.beginPath(); ctx.arc(cx, cy, hubR, 0, Math.PI * 2); ctx.fill();
      // Hub border
      ctx.globalAlpha = 0.7 * hubP;
      ctx.strokeStyle = C.teal; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, hubR, 0, Math.PI * 2); ctx.stroke();

      // Hub label
      ctx.globalAlpha = hubP;
      ctx.font = '700 13px "Satoshi", sans-serif';
      ctx.fillStyle = C.teal; ctx.textAlign = 'center';
      ctx.fillText('PORT TALBOT', cx, cy - 3);
      ctx.font = '500 10px "Satoshi", sans-serif';
      ctx.fillStyle = 'rgba(245,247,251,0.6)';
      ctx.fillText('EAF Programme', cx, cy + 12);

      // Nodes
      nodes.forEach((node, i) => {
        const nodeDelay = 0.08 + i * 0.07;
        const nodeP = easeOutBack(Math.min(Math.max((entryP - nodeDelay) / 0.5, 0), 1));
        if (nodeP <= 0) return;

        const isH = hoveredRef.current === i;
        const pulse = 0.75 + 0.25 * Math.sin(T * 0.003 + i * 0.8);
        const r = Math.max(1, node.r * nodeP * (isH ? 1.2 : 1));
        const accent = node.uc.accent;

        // Line to center
        ctx.globalAlpha = 0.1 * nodeP;
        ctx.strokeStyle = accent; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(node.x, node.y); ctx.stroke();

        // Outer glow
        drawGlow(ctx, node.x, node.y, r * (isH ? 4 : 3), accent, (isH ? 0.25 : 0.15) * pulse * nodeP);

        // Filled node
        ctx.globalAlpha = nodeP * (isH ? 0.45 : 0.3);
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2); ctx.fill();

        // Node border
        ctx.globalAlpha = nodeP * (isH ? 1 : 0.8);
        ctx.strokeStyle = isH ? '#ffffff' : accent;
        ctx.lineWidth = isH ? 2.5 : 2;
        ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2); ctx.stroke();

        // Exposure ring inside
        if (r > 8) {
          const exposureRatio = node.exposure / maxExposure;
          ctx.globalAlpha = nodeP * 0.7;
          ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(node.x, node.y, r - 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * exposureRatio * nodeP);
          ctx.stroke();
        }

        // Value inside
        ctx.globalAlpha = nodeP;
        ctx.font = `700 ${isH ? 13 : 12}px "Satoshi", sans-serif`;
        ctx.fillStyle = isH ? '#ffffff' : accent;
        ctx.textAlign = 'center';
        ctx.fillText(node.uc.budgetImpact.value, node.x, node.y + 4);

        // Label below
        ctx.font = `${isH ? 700 : 600} ${isH ? 12 : 11}px "Satoshi", sans-serif`;
        ctx.fillStyle = isH ? '#f5f7fb' : 'rgba(245,247,251,0.7)';
        ctx.fillText(node.uc.shortTitle, node.x, node.y + r + 16);

        // Stage
        ctx.font = '500 9px "Satoshi", sans-serif';
        ctx.fillStyle = 'rgba(245,247,251,0.35)';
        ctx.fillText(node.uc.stage, node.x, node.y + r + 29);
      });

      // Ambient dust
      ctx.globalAlpha = 1;
      for (let i = 0; i < 40; i++) {
        const dx = (Math.sin(T * 0.0004 + i * 23) * 0.5 + 0.5) * width;
        const dy = (Math.cos(T * 0.0003 + i * 37) * 0.5 + 0.5) * height;
        ctx.fillStyle = 'rgba(41, 207, 214, 0.06)';
        ctx.beginPath(); ctx.arc(dx, dy, 0.8, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [width, height, useCases]);

  const hoveredUC = hovered !== null ? useCases[hovered] : null;

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={canvasRef} style={{ width, height, borderRadius: 16 }} />
      {hoveredUC && (
        <div style={{
          position: 'absolute',
          bottom: 16, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 18px', borderRadius: 14,
          background: 'rgba(10, 16, 29, 0.96)',
          border: `1px solid ${rgb(hoveredUC.accent, 0.35)}`,
          boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 24px ${rgb(hoveredUC.accent, 0.12)}`,
          fontFamily: '"Satoshi", sans-serif',
          display: 'flex', alignItems: 'center', gap: 16,
          pointerEvents: 'none', zIndex: 10,
          animation: 'fadeIn 150ms ease both',
          maxWidth: '85%',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f5f7fb', marginBottom: 3 }}>
              {hoveredUC.title}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(245,247,251,0.55)', lineHeight: 1.4 }}>
              {hoveredUC.budgetImpact.detail}
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: hoveredUC.accent,
            fontFamily: '"SFMono-Regular", monospace',
            whiteSpace: 'nowrap', borderLeft: `1px solid ${rgb(hoveredUC.accent, 0.25)}`,
            paddingLeft: 16, textAlign: 'right',
          }}>
            <div style={{ fontSize: 16 }}>{hoveredUC.budgetImpact.value}</div>
            <div style={{ color: 'rgba(245,247,251,0.35)', fontWeight: 500, marginTop: 3, fontSize: 10 }}>
              Click to explore →
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
