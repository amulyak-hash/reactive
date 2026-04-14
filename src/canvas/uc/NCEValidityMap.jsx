import { useRef, useEffect, useState } from 'react';
import { C, rgb } from '../../theme/tokens';
import { setupCanvas, drawDust, drawGlow } from '../utils';
import { easeOutCubic, stagger } from '../easing';
import Tooltip from './Tooltip';

export default function NCEValidityMap({ width, height, data, accent }) {
  const canvasRef = useRef(null);
  const startRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    startRef.current = performance.now();
    const hitAreas = [];

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      mouseRef.current = { x: mx, y: my };
      let found = null;
      for (const h of hitAreas) {
        if (h.type === 'circle') { const dx = mx - h.cx, dy = my - h.cy; if (dx * dx + dy * dy <= h.r * h.r) { found = h; break; } }
        else { if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) { found = h; break; } }
      }
      setTooltip(found ? { x: found.tx || found.cx || (found.x + found.w / 2), y: (found.ty || found.cy || found.y) - 10, text: found.label } : null);
    };
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 }; setTooltip(null); };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const draw = () => {
      const T = performance.now();
      const elapsed = T - startRef.current;
      const progress = Math.min(elapsed / 1400, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      hitAreas.length = 0;
      const pad = 20;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const toX = (r) => r * (width - pad * 2) + pad;
      const toY = (r) => r * (height - pad * 2) + pad;

      // Site boundary
      ctx.globalAlpha = 0.2 * easeOutCubic(progress); ctx.strokeStyle = C.t4; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]); ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2); ctx.setLineDash([]);
      ctx.globalAlpha = easeOutCubic(progress); ctx.font = '600 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t3; ctx.textAlign = 'left';
      ctx.fillText('PORT TALBOT EAF — SITE PLAN', pad + 4, pad - 6);

      // Zones
      const { zones, boreholes, earlyWarnings, nce } = data;
      zones.forEach((zone, i) => {
        const s = stagger(progress, i, zones.length);
        const x = toX(zone.x), y = toY(zone.y), w = zone.w * (width - pad * 2), h = zone.h * (height - pad * 2);
        const isH = mx >= x && mx <= x + w && my >= y && my <= y + h;

        if (zone.status === 'contaminated' || zone.status === 'claimed') {
          const gradColor = zone.status === 'claimed' ? C.red : C.amber;
          const grad = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) * 0.6);
          grad.addColorStop(0, rgb(gradColor, (isH ? 0.25 : 0.15) * s)); grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = s; ctx.fillStyle = grad; ctx.fillRect(x, y, w, h);
        }

        ctx.globalAlpha = s * (isH ? 0.7 : 0.4);
        ctx.strokeStyle = zone.status === 'claimed' ? C.red : zone.status === 'contaminated' ? C.amber : C.t4;
        ctx.lineWidth = isH ? 2.5 : (zone.status === 'claimed' ? 2 : 1);
        if (zone.status === 'claimed' && !isH) { ctx.globalAlpha = s * (0.5 + 0.5 * Math.sin(T * 0.005)); }
        ctx.strokeRect(x, y, w, h);

        ctx.globalAlpha = s * 0.8; ctx.font = '700 10px "Satoshi", sans-serif';
        ctx.fillStyle = zone.status === 'claimed' ? C.red : zone.status === 'contaminated' ? C.amber : C.t2;
        ctx.textAlign = 'center'; ctx.fillText(zone.label, x + w / 2, y + h / 2 + 4);

        hitAreas.push({ type: 'rect', x, y, w, h, tx: x + w / 2, ty: y, label: `${zone.label} — ${zone.status === 'claimed' ? 'NCE claim zone' : zone.status === 'contaminated' ? 'Known contamination' : 'Clear'}` });
      });

      // Boreholes
      boreholes.forEach((bh, i) => {
        const s = stagger(progress, i + zones.length, boreholes.length + zones.length);
        const x = toX(bh.x), y = toY(bh.y);
        const dx = mx - x, dy = my - y; const isH = dx * dx + dy * dy <= 100;

        ctx.globalAlpha = s * (isH ? 1 : 0.8); ctx.fillStyle = C.blue;
        ctx.beginPath(); ctx.arc(x, y, isH ? 6 : 4, 0, Math.PI * 2); ctx.fill();
        if (isH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5; ctx.stroke(); }
        ctx.globalAlpha = s * 0.7; ctx.font = '600 7px "Satoshi", sans-serif'; ctx.fillStyle = C.t3; ctx.textAlign = 'left';
        ctx.fillText(bh.id, x + 7, y + 3);
        hitAreas.push({ type: 'circle', cx: x, cy: y, r: 10, label: `${bh.id} · Depth: ${bh.depth}` });
      });

      // Early Warnings
      earlyWarnings.forEach((ew) => {
        const s = easeOutCubic(progress);
        const x = toX(ew.x), y = toY(ew.y);
        const dx = mx - x, dy = my - y; const isH = dx * dx + dy * dy <= 100;

        ctx.globalAlpha = s * (isH ? 1 : 0.8); ctx.fillStyle = C.amber;
        ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 5, y + 4); ctx.lineTo(x - 5, y + 4); ctx.closePath(); ctx.fill();
        if (isH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.font = '600 7px "Satoshi", sans-serif'; ctx.fillStyle = C.amber; ctx.textAlign = 'left';
        ctx.fillText(ew.id, x + 8, y + 2);
        hitAreas.push({ type: 'circle', cx: x, cy: y, r: 10, label: `${ew.id} · Zone ${ew.zone} · ${ew.date}` });
      });

      // NCE marker
      if (nce) {
        const s = easeOutCubic(progress);
        const x = toX(nce.x), y = toY(nce.y);
        const pulse = 0.6 + 0.4 * Math.sin(T * 0.005);
        const dx = mx - x, dy = my - y; const isH = dx * dx + dy * dy <= 144;

        drawGlow(ctx, x, y, isH ? 28 : 20, C.red, 0.15 * s * pulse);
        ctx.globalAlpha = s * (isH ? 1 : pulse); ctx.fillStyle = C.red;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
        ctx.fillRect(isH ? -7 : -6, isH ? -7 : -6, isH ? 14 : 12, isH ? 14 : 12); ctx.restore();
        if (isH) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(-7, -7, 14, 14); ctx.restore(); }
        ctx.globalAlpha = s; ctx.font = '700 8px "Satoshi", sans-serif'; ctx.fillStyle = C.red; ctx.textAlign = 'left';
        ctx.fillText(`${nce.id} — £${nce.value}K`, x + 10, y + 3);
        hitAreas.push({ type: 'circle', cx: x, cy: y, r: 12, label: `${nce.id} · £${nce.value}K claim · Zone ${nce.zone} · Unforeseen ground conditions` });
      }

      // Gap line
      const bh14 = boreholes.find(b => b.id === 'BH-14');
      if (bh14 && nce) {
        ctx.globalAlpha = 0.3 * easeOutCubic(progress); ctx.strokeStyle = C.red; ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]); ctx.beginPath();
        ctx.moveTo(toX(bh14.x), toY(bh14.y)); ctx.lineTo(toX(nce.x), toY(nce.y)); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = '600 7px "Satoshi", sans-serif'; ctx.fillStyle = C.red; ctx.textAlign = 'center';
        ctx.fillText('85m gap', (toX(bh14.x) + toX(nce.x)) / 2, (toY(bh14.y) + toY(nce.y)) / 2 - 6);
      }

      ctx.globalAlpha = 1; drawDust(ctx, width, height, T, 12);
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseleave', onLeave); };
  }, [width, height, data]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width, height, borderRadius: 8, cursor: 'crosshair' }} />
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} text={tooltip.text} />}
    </div>
  );
}
