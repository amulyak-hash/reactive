import { useRef, useEffect, useState } from 'react';
import { C, rgb } from '../../theme/tokens';
import { setupCanvas, drawGlow } from '../utils';
import { easeOutCubic, stagger } from '../easing';
import Tooltip from './Tooltip';

// ─── Shared hover infra ───
function useHover(canvasRef, hitAreasRef, setTooltip) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      let found = null;
      for (const h of hitAreasRef.current) {
        if (h.type === 'rect' && mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) { found = h; break; }
        if (h.type === 'circle') { const dx = mx - h.cx, dy = my - h.cy; if (dx * dx + dy * dy <= h.r * h.r) { found = h; break; } }
      }
      setTooltip(found ? { x: found.tx ?? found.cx ?? (found.x + (found.w || 0) / 2), y: (found.ty ?? found.cy ?? found.y) - 8, text: found.label } : null);
    };
    const onLeave = () => setTooltip(null);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    return () => { canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseleave', onLeave); };
  }, [canvasRef, hitAreasRef, setTooltip]);
}

export default function CompanionViz({ type, data, accent, width, height, activeKey, dimOthers, onVizHover, onVizClick }) {
  const canvasRef = useRef(null);
  const startRef = useRef(null);
  const hitAreas = useRef([]);
  const activeKeyRef = useRef(activeKey);
  const dimRef = useRef(dimOthers);
  const [tooltip, setTooltip] = useState(null);

  activeKeyRef.current = activeKey;
  dimRef.current = dimOthers;

  // Enhanced hover that also emits to VizContext
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      let found = null;
      for (const h of hitAreas.current) {
        if (h.type === 'rect' && mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) { found = h; break; }
        if (h.type === 'circle') { const dx = mx - h.cx, dy = my - h.cy; if (dx * dx + dy * dy <= h.r * h.r) { found = h; break; } }
      }
      setTooltip(found ? { x: found.tx ?? found.cx ?? (found.x + (found.w || 0) / 2), y: (found.ty ?? found.cy ?? found.y) - 8, text: found.label } : null);
      // Don't propagate hover from treemap to VizContext — it would reset the contractor selection
      if (type !== 'nce-detail-breakdown' && onVizHover) onVizHover(found?.linkKey ?? null);
    };
    const onClick = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      let found = null;
      for (const h of hitAreas.current) {
        if (h.type === 'rect' && mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) { found = h; break; }
        if (h.type === 'circle') { const dx = mx - h.cx, dy = my - h.cy; if (dx * dx + dy * dy <= h.r * h.r) { found = h; break; } }
      }
      // For nce-detail-breakdown: clicking a clause box sets internal drill state
      if (type === 'nce-detail-breakdown') {
        if (found?.linkKey) {
          _selectedClause = _selectedClause === found.linkKey ? null : found.linkKey;
        } else {
          _selectedClause = null;
        }
        // Never propagate clicks from the treemap to VizContext — keep it internal
        return;
      }
      if (onVizClick) onVizClick(found?.linkKey ?? null);
    };
    const onLeave = () => { setTooltip(null); if (onVizHover) onVizHover(null); };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mouseleave', onLeave);
    return () => { canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('click', onClick); canvas.removeEventListener('mouseleave', onLeave); };
  }, [onVizHover, onVizClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || width < 10 || height < 10) return;
    startRef.current = performance.now();

    const drawFn = DRAW_MAP[type];
    if (!drawFn) return;

    let raf;
    const draw = () => {
      const T = performance.now();
      const elapsed = T - startRef.current;
      const p = Math.min(elapsed / 1200, 1);
      const ctx = setupCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      hitAreas.current = [];
      drawFn(ctx, width, height, data, accent, p, T, hitAreas.current, activeKeyRef.current, dimRef.current);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [type, data, accent, width, height]);

  if (!type || !data) return null;

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width, height, borderRadius: 8, cursor: 'crosshair' }} />
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} text={tooltip.text} />}
    </div>
  );
}

// ─── Squarified treemap layout ───
function squarify(items, totalVal, x, y, w, h, gap) {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const rects = [];
  layoutStrip(sorted, totalVal, x, y, w, h, gap, rects);
  return rects;
}

function layoutStrip(items, totalVal, x, y, w, h, gap, rects) {
  if (items.length === 0) return;
  if (items.length === 1) {
    rects.push({ item: items[0], x: x + gap / 2, y: y + gap / 2, w: w - gap, h: h - gap });
    return;
  }

  const isWide = w >= h;
  let stripItems = [items[0]];
  let stripVal = items[0].value;
  let bestAspect = Infinity;

  for (let i = 1; i < items.length; i++) {
    const testVal = stripVal + items[i].value;
    const stripFrac = testVal / totalVal;
    const stripSize = isWide ? w * stripFrac : h * stripFrac;
    const worst = worstAspect(stripItems.concat(items[i]), testVal, stripSize, isWide ? h : w);
    const current = worstAspect(stripItems, stripVal, isWide ? w * (stripVal / totalVal) : h * (stripVal / totalVal), isWide ? h : w);

    if (worst <= current) {
      stripItems.push(items[i]);
      stripVal = testVal;
    } else {
      break;
    }
  }

  // Lay out the strip
  const stripFrac = stripVal / totalVal;
  const stripSize = isWide ? w * stripFrac : h * stripFrac;
  let offset = 0;

  stripItems.forEach(item => {
    const itemFrac = item.value / stripVal;
    const itemSize = (isWide ? h : w) * itemFrac;

    if (isWide) {
      rects.push({ item, x: x + gap / 2, y: y + offset + gap / 2, w: stripSize - gap, h: itemSize - gap });
    } else {
      rects.push({ item, x: x + offset + gap / 2, y: y + gap / 2, w: itemSize - gap, h: stripSize - gap });
    }
    offset += itemSize;
  });

  // Recurse with remaining items in the leftover space
  const remaining = items.slice(stripItems.length);
  const remainingVal = totalVal - stripVal;
  if (isWide) {
    layoutStrip(remaining, remainingVal, x + stripSize, y, w - stripSize, h, gap, rects);
  } else {
    layoutStrip(remaining, remainingVal, x, y + stripSize, w, h - stripSize, gap, rects);
  }
}

function worstAspect(items, totalVal, stripSize, otherDim) {
  if (stripSize <= 0 || otherDim <= 0) return Infinity;
  let worst = 0;
  items.forEach(item => {
    const frac = item.value / totalVal;
    const size = otherDim * frac;
    const aspect = Math.max(stripSize / size, size / stripSize);
    if (aspect > worst) worst = aspect;
  });
  return worst;
}

// ─── Drawing functions per type ───

const DRAW_MAP = {
  'nce-detail-breakdown': drawNCEDetailBreakdown,
  'overrun-trajectory': drawOverrunTrajectory,
  'clause-breakdown': drawClauseBreakdown,
  'cost-escalation': drawCostEscalation,
  'cost-decomposition': drawCostDecomposition,
  'evidence-balance': drawEvidenceBalance,
  'resource-histogram': drawResourceHistogram,
  'budget-gap-waterfall': drawBudgetGapWaterfall,
  'duration-multiplier': drawDurationMultiplier,
};

function drawOverrunTrajectory(ctx, w, h, data, accent, p, T, hits, activeKey, dimOthers) {
  const { packages, colors, months, planned, actuals } = data;
  const pad = { l: 44, r: 12, t: 12, b: 24 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const maxVal = Math.max(...actuals.flat(), ...planned) * 1.05;
  const xOf = (i) => pad.l + (i / (months.length - 1)) * cw;
  const yOf = (v) => pad.t + ch - (v / maxVal) * ch;

  // Planned line (dashed)
  ctx.globalAlpha = 0.3 * easeOutCubic(p); ctx.strokeStyle = C.t3; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
  ctx.beginPath(); planned.forEach((v, i) => i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v))); ctx.stroke(); ctx.setLineDash([]);

  // Actual lines per package
  actuals.forEach((series, pi) => {
    const s = stagger(p, pi, actuals.length);
    const n = Math.floor(s * series.length);
    const pkgName = packages[pi];
    const isLinked = activeKey === pkgName;
    const rowDim = dimOthers && !isLinked ? 0.3 : 1;
    ctx.globalAlpha = 0.8 * s * rowDim; ctx.strokeStyle = colors[pi]; ctx.lineWidth = isLinked ? 3.5 : 2.5;
    ctx.beginPath();
    for (let i = 0; i <= n && i < series.length; i++) { i === 0 ? ctx.moveTo(xOf(i), yOf(series[i])) : ctx.lineTo(xOf(i), yOf(series[i])); }
    ctx.stroke();

    // Endpoint dot
    if (n > 0 && n < series.length) {
      const ex = xOf(n), ey = yOf(series[n]);
      drawGlow(ctx, ex, ey, 8, colors[pi], 0.3);
      ctx.fillStyle = colors[pi]; ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();
    }

    // Label
    const lastI = Math.min(n, series.length - 1);
    ctx.globalAlpha = s * rowDim; ctx.font = `${isLinked ? 700 : 600} 9px "Satoshi", sans-serif`; ctx.fillStyle = isLinked ? '#fff' : colors[pi]; ctx.textAlign = 'left';
    ctx.fillText(pkgName, xOf(lastI) + 6, yOf(series[lastI]) + 3);

    // Hit area for the line endpoint
    if (n > 0 && n < series.length) {
      const ex = xOf(n), ey = yOf(series[n]);
      hits.push({ type: 'circle', cx: ex, cy: ey, r: 12, linkKey: pkgName, label: `${pkgName}: £${series[n]}K actual (month ${n + 1})` });
    }
  });

  // X labels
  ctx.globalAlpha = 0.5 * easeOutCubic(p); ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t3; ctx.textAlign = 'center';
  months.forEach((m, i) => ctx.fillText(m, xOf(i), h - 4));

  // "Planned" label
  ctx.textAlign = 'left'; ctx.fillText('Planned', pad.l + 4, yOf(planned[0]) - 6);
}

function drawClauseBreakdown(ctx, w, h, data, accent, p, T, hits, activeKey, dimOthers) {
  const { clauses, bidComparison } = data;
  const totalNCE = clauses.reduce((s, c) => s + c.total, 0);

  // Left half: donut
  const cx = w * 0.28, cy = h * 0.45, r = Math.min(w * 0.22, h * 0.35);
  let startAngle = -Math.PI / 2;
  clauses.forEach((c, i) => {
    const s = stagger(p, i, clauses.length);
    const sweep = (c.total / totalNCE) * Math.PI * 2 * s;
    ctx.globalAlpha = 0.8 * s; ctx.fillStyle = c.color;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, startAngle, startAngle + sweep); ctx.closePath(); ctx.fill();

    // Label line
    const midAngle = startAngle + sweep / 2;
    const lx = cx + Math.cos(midAngle) * (r + 12), ly = cy + Math.sin(midAngle) * (r + 12);
    ctx.globalAlpha = s * 0.6; ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t2;
    ctx.textAlign = lx > cx ? 'left' : 'right';
    ctx.fillText(`${c.label.split(' (')[0]} (${c.count}x)`, lx, ly);

    hits.push({ type: 'circle', cx: cx + Math.cos(midAngle) * r * 0.6, cy: cy + Math.sin(midAngle) * r * 0.6, r: 20, label: `${c.label}: ${c.count} NCEs, £${c.total}K total` });
    startAngle += sweep;
  });

  // Center text
  ctx.globalAlpha = easeOutCubic(p); ctx.font = '700 14px "Satoshi", sans-serif'; ctx.fillStyle = C.t1; ctx.textAlign = 'center';
  ctx.fillText(`£${totalNCE}K`, cx, cy + 4);
  ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t3; ctx.fillText('7 NCEs', cx, cy + 16);

  // Right half: bid comparison bars
  const barX = w * 0.58, barW = w * 0.38, barH = 18;
  const items = [
    { label: 'RHI bid', value: bidComparison.rhi, color: C.green },
    { label: 'Next bidder', value: bidComparison.nextBidder, color: C.t3 },
    { label: 'Projected total', value: bidComparison.projected, color: C.red },
  ];
  const maxBid = Math.max(...items.map(i => i.value));

  items.forEach((item, i) => {
    const s = stagger(p, i + clauses.length, items.length + clauses.length);
    const y = h * 0.2 + i * 34;
    const bw = (item.value / maxBid) * barW * easeOutCubic(s);

    ctx.globalAlpha = s * 0.7; ctx.fillStyle = item.color;
    ctx.beginPath(); ctx.roundRect(barX, y, bw, barH, 4); ctx.fill();

    ctx.globalAlpha = s; ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t3; ctx.textAlign = 'right';
    ctx.fillText(item.label, barX - 6, y + 12);
    ctx.font = '700 9px "Satoshi", sans-serif'; ctx.fillStyle = item.color; ctx.textAlign = 'left';
    ctx.fillText(`£${(item.value / 1000).toFixed(1)}M`, barX + bw + 4, y + 12);

    hits.push({ type: 'rect', x: barX, y, w: bw, h: barH, tx: barX + bw / 2, ty: y, label: `${item.label}: £${(item.value / 1000).toFixed(2)}M` });
  });
}

function drawCostEscalation(ctx, w, h, data, accent, p, T, hits, activeKey, dimOthers) {
  const { bands } = data;
  const pad = { l: 12, r: 12, t: 12, b: 28 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const barW = cw / bands.length - 8;
  const maxCost = Math.max(...bands.map(b => b.cost));

  bands.forEach((band, i) => {
    const s = stagger(p, i, bands.length);
    const x = pad.l + i * (cw / bands.length) + 4;
    const barH = (band.cost / maxCost) * ch * easeOutCubic(s);
    const y = pad.t + ch - barH;

    ctx.globalAlpha = s * 0.7; ctx.fillStyle = band.color;
    ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 6); ctx.fill();

    // Multiplier annotation
    if (i > 0) {
      const mult = (band.cost / bands[0].cost).toFixed(1);
      ctx.globalAlpha = s * 0.6; ctx.font = '700 10px "Satoshi", sans-serif'; ctx.fillStyle = band.color;
      ctx.textAlign = 'center'; ctx.fillText(`${mult}x`, x + barW / 2, y - 8);
    }

    // Value
    ctx.globalAlpha = s; ctx.font = '700 11px "Satoshi", sans-serif'; ctx.fillStyle = C.t1;
    ctx.textAlign = 'center'; ctx.fillText(`£${band.cost}K`, x + barW / 2, y + barH / 2 + 4);

    // Label
    ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t3;
    ctx.fillText(band.label, x + barW / 2, h - 6);

    // Count badge
    ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t4;
    ctx.fillText(`${band.count} EWs`, x + barW / 2, y + barH / 2 + 16);

    hits.push({ type: 'rect', x, y, w: barW, h: barH, tx: x + barW / 2, ty: y, label: `${band.label}: avg CE £${band.cost}K (${band.count} historical EWs)` });
  });
}

function drawCostDecomposition(ctx, w, h, data, accent, p, T, hits, activeKey, dimOthers) {
  const { segments, mitigations } = data;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const pad = { l: 12, r: 12, t: 12, b: 36 };
  const barW = 40, gap = 16;
  const maxVal = total;
  const ch = h - pad.t - pad.b;

  // Stacked segments (single column)
  let runY = pad.t + ch;
  const colX = w * 0.2;
  segments.forEach((seg, i) => {
    const s = stagger(p, i, segments.length + mitigations.length);
    const barH = (seg.value / maxVal) * ch * easeOutCubic(s);
    runY -= barH;
    ctx.globalAlpha = s * 0.75; ctx.fillStyle = seg.color;
    ctx.beginPath(); ctx.roundRect(colX, runY, barW, barH, 3); ctx.fill();

    // Label + value
    ctx.globalAlpha = s; ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t2; ctx.textAlign = 'left';
    ctx.fillText(`${seg.label}: £${(seg.value / 1000).toFixed(1)}M`, colX + barW + 10, runY + barH / 2 + 3);

    hits.push({ type: 'rect', x: colX, y: runY, w: barW, h: barH, tx: colX + barW / 2, ty: runY, label: `${seg.label}: £${(seg.value / 1000).toFixed(1)}M` });
  });

  // Total label
  ctx.globalAlpha = easeOutCubic(p); ctx.font = '700 12px "Satoshi", sans-serif'; ctx.fillStyle = C.red; ctx.textAlign = 'center';
  ctx.fillText(`£${(total / 1000).toFixed(1)}M total`, colX + barW / 2, h - 10);

  // Mitigation comparison bars
  const mitX = w * 0.6;
  mitigations.forEach((m, i) => {
    const s = stagger(p, i + segments.length, segments.length + mitigations.length);
    const y = pad.t + 20 + i * 50;
    const bw = (m.cost / total) * (w * 0.32);

    ctx.globalAlpha = s * 0.7; ctx.fillStyle = C.green;
    ctx.beginPath(); ctx.roundRect(mitX, y, bw * easeOutCubic(s), 20, 4); ctx.fill();

    ctx.globalAlpha = s; ctx.font = '600 10px "Satoshi", sans-serif'; ctx.fillStyle = C.t1; ctx.textAlign = 'left';
    ctx.fillText(m.label, mitX, y - 6);
    ctx.font = '700 9px "Satoshi", sans-serif'; ctx.fillStyle = C.green;
    ctx.fillText(`£${(m.cost / 1000).toFixed(1)}M → saves £${(m.saves / 1000).toFixed(1)}M`, mitX + bw * easeOutCubic(s) + 6, y + 13);

    hits.push({ type: 'rect', x: mitX, y, w: bw, h: 20, tx: mitX + bw / 2, ty: y, label: `${m.label}: £${(m.cost / 1000).toFixed(1)}M cost, saves £${(m.saves / 1000).toFixed(1)}M (${Math.round(m.saves / m.cost)}x ROI)` });
  });
}

function drawEvidenceBalance(ctx, w, h, data, accent, p, T, hits, activeKey, dimOthers) {
  const { forClaim, againstClaim, claimValue, fairValue } = data;
  const midX = w / 2;

  // Title
  ctx.globalAlpha = easeOutCubic(p); ctx.font = '600 10px "Satoshi", sans-serif'; ctx.textAlign = 'center';
  ctx.fillStyle = C.t3; ctx.fillText('Evidence Balance', midX, 16);

  // FOR bars (left)
  ctx.fillStyle = C.green; ctx.textAlign = 'right';
  forClaim.forEach((item, i) => {
    const s = stagger(p, i, forClaim.length + againstClaim.length);
    const y = 32 + i * 32;
    const bw = item.weight * (midX - 20) * easeOutCubic(s);

    ctx.globalAlpha = s * 0.6; ctx.fillStyle = C.green;
    ctx.beginPath(); ctx.roundRect(midX - 6 - bw, y, bw, 18, 4); ctx.fill();
    ctx.globalAlpha = s; ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t2;
    ctx.fillText(item.label, midX - 6 - bw - 4, y + 12);

    hits.push({ type: 'rect', x: midX - 6 - bw, y, w: bw, h: 18, tx: midX - 6 - bw / 2, ty: y, label: `FOR: ${item.label} (${(item.weight * 100).toFixed(0)}% confidence)` });
  });

  // AGAINST bars (right)
  againstClaim.forEach((item, i) => {
    const s = stagger(p, i + forClaim.length, forClaim.length + againstClaim.length);
    const y = 32 + i * 32;
    const bw = item.weight * (midX - 20) * easeOutCubic(s);

    ctx.globalAlpha = s * 0.6; ctx.fillStyle = C.red;
    ctx.beginPath(); ctx.roundRect(midX + 6, y, bw, 18, 4); ctx.fill();
    ctx.globalAlpha = s; ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t2; ctx.textAlign = 'left';
    ctx.fillText(item.label, midX + 6 + bw + 4, y + 12);

    hits.push({ type: 'rect', x: midX + 6, y, w: bw, h: 18, tx: midX + 6 + bw / 2, ty: y, label: `AGAINST: ${item.label} (${(item.weight * 100).toFixed(0)}% confidence)` });
  });

  // Center divider
  ctx.globalAlpha = 0.3 * easeOutCubic(p); ctx.strokeStyle = C.t4; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(midX, 28); ctx.lineTo(midX, h - 30); ctx.stroke();

  // Labels
  ctx.globalAlpha = easeOutCubic(p); ctx.font = '700 9px "Satoshi", sans-serif'; ctx.textAlign = 'center';
  ctx.fillStyle = C.green; ctx.fillText('FOR', midX - 40, h - 14);
  ctx.fillStyle = C.red; ctx.fillText('AGAINST', midX + 40, h - 14);

  // Claim vs Fair value
  ctx.fillStyle = C.t1; ctx.font = '700 10px "Satoshi", sans-serif';
  ctx.fillText(`£${claimValue}K claimed → £${fairValue}K fair`, midX, h - 2);
}

function drawResourceHistogram(ctx, w, h, data, accent, p, T, hits, activeKey, dimOthers) {
  const { contractors } = data;
  const pad = { l: 60, r: 12, t: 12, b: 28 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const barH = ch / contractors.length - 6;
  const maxVal = Math.max(...contractors.map(c => Math.max(c.planned, c.actual)));

  contractors.forEach((c, i) => {
    const s = stagger(p, i, contractors.length);
    const y = pad.t + i * (ch / contractors.length);

    // Planned bar (ghost)
    const pw = (c.planned / maxVal) * cw;
    ctx.globalAlpha = s * 0.15; ctx.fillStyle = C.t3;
    ctx.beginPath(); ctx.roundRect(pad.l, y, pw * easeOutCubic(s), barH * 0.45, 3); ctx.fill();

    // Actual bar
    const aw = (c.actual / maxVal) * cw;
    ctx.globalAlpha = s * 0.7; ctx.fillStyle = c.color;
    ctx.beginPath(); ctx.roundRect(pad.l, y + barH * 0.5, aw * easeOutCubic(s), barH * 0.45, 3); ctx.fill();

    // Gap indicator
    if (c.actual < c.planned) {
      const gapPct = ((c.planned - c.actual) / c.planned * 100).toFixed(0);
      ctx.globalAlpha = s * 0.8; ctx.font = '700 9px "Satoshi", sans-serif'; ctx.fillStyle = c.color; ctx.textAlign = 'left';
      ctx.fillText(`-${gapPct}%`, pad.l + aw * easeOutCubic(s) + 4, y + barH * 0.75);
    }

    // Name
    ctx.globalAlpha = s; ctx.font = '500 10px "Satoshi", sans-serif'; ctx.fillStyle = C.t2; ctx.textAlign = 'right';
    ctx.fillText(c.name, pad.l - 6, y + barH / 2 + 3);

    hits.push({ type: 'rect', x: pad.l, y, w: Math.max(pw, aw), h: barH, tx: pad.l + cw / 2, ty: y, label: `${c.name}: ${c.actual}/${c.planned} staff (${c.actual < c.planned ? 'UNDERMANNED' : 'OK'})` });
  });

  // Legend
  ctx.globalAlpha = 0.5 * easeOutCubic(p); ctx.font = '500 8px "Satoshi", sans-serif'; ctx.textAlign = 'right';
  ctx.fillStyle = C.t3; ctx.fillText('Planned /', w - pad.r - 30, h - 6);
  ctx.fillStyle = C.teal; ctx.fillText('Actual', w - pad.r, h - 6);
}

function drawBudgetGapWaterfall(ctx, w, h, data, accent, p, T, hits, activeKey, dimOthers) {
  const { target, projected, risks } = data;
  const pad = { l: 12, r: 12, t: 20, b: 28 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const barW = cw / (risks.length + 1) - 8;
  const gap = (cw - barW * (risks.length + 1)) / (risks.length + 2);
  const maxVal = Math.max(...risks.map(r => r.value)) * 1.2;

  // Title
  ctx.globalAlpha = easeOutCubic(p); ctx.font = '600 10px "Satoshi", sans-serif'; ctx.fillStyle = C.t3; ctx.textAlign = 'center';
  ctx.fillText(`£${projected - target}M Budget Gap Decomposition`, w / 2, 14);

  risks.forEach((risk, i) => {
    const s = stagger(p, i, risks.length);
    const x = pad.l + gap + i * (barW + gap);
    const barH = (risk.value / maxVal) * ch * easeOutCubic(s);
    const y = pad.t + ch - barH;

    ctx.globalAlpha = s * 0.7; ctx.fillStyle = risk.color;
    ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 4); ctx.fill();

    ctx.globalAlpha = s; ctx.font = '700 10px "Satoshi", sans-serif'; ctx.fillStyle = risk.color; ctx.textAlign = 'center';
    ctx.fillText(`£${risk.value}M`, x + barW / 2, y - 6);
    ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t3;
    ctx.fillText(risk.label, x + barW / 2, h - 6);

    hits.push({ type: 'rect', x, y, w: barW, h: barH, tx: x + barW / 2, ty: y, label: `${risk.label}: £${risk.value}M exposure` });
  });
}

function drawDurationMultiplier(ctx, w, h, data, accent, p, T, hits, activeKey, dimOthers) {
  const { durations, dailyRate, visibleRate } = data;
  const pad = { l: 12, r: 12, t: 16, b: 28 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const maxVal = Math.max(...durations.map(d => d.cost));
  const barW = cw / durations.length - 16;

  durations.forEach((dur, i) => {
    const s = stagger(p, i, durations.length);
    const x = pad.l + i * (cw / durations.length) + 8;
    const barH = (dur.cost / maxVal) * ch * easeOutCubic(s);
    const y = pad.t + ch - barH;

    // Visible portion
    const visPortion = (visibleRate * dur.days / dur.cost);
    const visH = barH * visPortion;

    ctx.globalAlpha = s * 0.35; ctx.fillStyle = dur.color;
    ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 6); ctx.fill();

    // Hidden portion (darker)
    ctx.globalAlpha = s * 0.7; ctx.fillStyle = dur.color;
    ctx.beginPath(); ctx.roundRect(x, y, barW, barH - visH, 6); ctx.fill();

    // Value
    ctx.globalAlpha = s; ctx.font = '700 13px "Satoshi", sans-serif'; ctx.fillStyle = C.t1; ctx.textAlign = 'center';
    ctx.fillText(`£${(dur.cost / 1000).toFixed(1)}M`, x + barW / 2, y + barH / 2);

    // Label
    ctx.font = '600 10px "Satoshi", sans-serif'; ctx.fillStyle = dur.color;
    ctx.fillText(dur.label, x + barW / 2, h - 6);

    // Days
    ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t4;
    ctx.fillText(`${dur.days} days`, x + barW / 2, y - 8);

    hits.push({ type: 'rect', x, y, w: barW, h: barH, tx: x + barW / 2, ty: y, label: `${dur.label} delay: £${(dur.cost / 1000).toFixed(1)}M total (${dur.days} days × £${dailyRate}K/day)` });
  });
}

// Internal state for clause-level drill
let _selectedClause = null;
let _prevContractor = null;

function drawNCEDetailBreakdown(ctx, w, h, data, accent, p, T, hits, activeKey, dimOthers) {
  if (!data || !data.contractors) return;

  const clauseColors = [C.red, C.orange, C.amber, C.blue, C.purple, C.green];
  const pad = 14;
  const months = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'];

  // Check if activeKey is a contractor name (from the stacked bars above)
  const contractorNames = data.contractors.map(c => c.name);
  const activeContractor = activeKey && contractorNames.includes(activeKey) ? activeKey : null;

  // Reset clause selection only when the CONTRACTOR changes, not when a clause is clicked
  if (activeContractor !== _prevContractor) { _selectedClause = null; _prevContractor = activeContractor; }

  // Build clause data: aggregate all contractors, or filter to selected one
  const selected = activeContractor ? data.contractors.find(c => c.name === activeContractor) : null;
  let clauses;
  let headerText;

  if (selected) {
    clauses = selected.ncesByClause || [];
    const pct = ((selected.nceVariation / (selected.originalValue || 1)) * 100).toFixed(1);
    headerText = `${selected.name} — £${(selected.nceVariation ?? 0).toFixed(1)}M (${pct}%)`;
  } else {
    // Aggregate: merge all contractors' clauses by clause name
    const clauseMap = {};
    data.contractors.forEach(c => {
      (c.ncesByClause || []).forEach(cl => {
        if (!clauseMap[cl.clause]) clauseMap[cl.clause] = { clause: cl.clause, count: 0, value: 0, trend: cl.trend ? cl.trend.map(() => 0) : null };
        clauseMap[cl.clause].count += cl.count;
        clauseMap[cl.clause].value += cl.value;
        if (cl.trend && clauseMap[cl.clause].trend) {
          cl.trend.forEach((v, i) => { clauseMap[cl.clause].trend[i] += v; });
        }
      });
    });
    clauses = Object.values(clauseMap).sort((a, b) => b.value - a.value);
    headerText = `All Contractors — £${(data.totals?.totalNCE ?? 0).toFixed(1)}M total NCE variation`;
  }

  const totalVal = clauses.reduce((s, c) => s + c.value, 0);

  // ─── Header ───
  ctx.globalAlpha = easeOutCubic(p);
  ctx.font = '700 12px "Satoshi", sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
  ctx.fillText(headerText, pad, 18);

  if (!selected) {
    ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t4;
    ctx.fillText('Click a contractor above to filter', pad, 32);
  }

  // Layout: left half = boxes, right half = trend (if clause selected)
  const boxZoneX = pad;
  const boxZoneW = _selectedClause ? w * 0.48 - pad : w - pad * 2;
  const boxY = 42, boxH = h - boxY - 12;

  // ─── Treemap: squarified layout ───
  const boxGap = 4;
  const rects = squarify(
    clauses.map((c, i) => ({ ...c, color: clauseColors[i % clauseColors.length], idx: i })),
    totalVal, boxZoneX, boxY, boxZoneW, boxH, boxGap
  );

  // Vivid treemap colors — fully saturated for visibility on dark bg
  const treemapColors = ['#e05555', '#d4893a', '#c9a832', '#5c83ff', '#a67bdb', '#3bb88a'];

  rects.forEach((r) => {
    const { clause, value, count, idx } = r.item;
    const s = stagger(p, idx, clauses.length);
    const ratio = value / totalVal;
    const isSelected = _selectedClause === clause;
    const isDimmed = _selectedClause && !isSelected;
    const bx = r.x, by = r.y, bw = r.w, bh = r.h;
    const boxColor = treemapColors[idx % treemapColors.length];

    if (bw < 2 || bh < 2) return;

    // Box fill — strong opacity for visibility
    ctx.globalAlpha = s * (isDimmed ? 0.15 : (isSelected ? 1 : 0.85));
    ctx.fillStyle = boxColor;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill();

    // Border
    ctx.globalAlpha = s * (isDimmed ? 0.1 : 0.3);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = isSelected ? 2.5 : 1;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.stroke();

    // Labels — white text, adapt to box size
    ctx.globalAlpha = s * (isDimmed ? 0.2 : 0.95);
    ctx.textAlign = 'left';

    if (bh > 60 && bw > 90) {
      // Large box: full labels
      ctx.font = '700 13px "Satoshi", sans-serif'; ctx.fillStyle = '#fff';
      ctx.fillText(clause, bx + 14, by + 24);
      ctx.font = '700 24px "SFMono-Regular", monospace'; ctx.fillStyle = '#fff';
      ctx.fillText(`£${value.toFixed(1)}M`, bx + 14, by + 54);
      ctx.font = '500 11px "Satoshi", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(`${count} NCEs · ${(ratio * 100).toFixed(0)}%`, bx + 14, by + 72);
    } else if (bh > 35 && bw > 70) {
      // Medium box
      ctx.font = '600 11px "Satoshi", sans-serif'; ctx.fillStyle = '#fff';
      ctx.fillText(clause, bx + 10, by + 18);
      ctx.font = '700 16px "SFMono-Regular", monospace'; ctx.fillStyle = '#fff';
      ctx.fillText(`£${value.toFixed(1)}M`, bx + 10, by + 38);
    } else if (bw > 44 && bh > 18) {
      // Small box
      ctx.font = '700 11px "SFMono-Regular", monospace'; ctx.fillStyle = '#fff';
      ctx.fillText(`£${value.toFixed(1)}M`, bx + 8, by + bh / 2 + 4);
    }

    hits.push({
      type: 'rect', x: bx, y: by, w: bw, h: bh,
      linkKey: clause,
      label: `${clause}: £${value.toFixed(1)}M (${count} NCEs, ${(ratio * 100).toFixed(0)}%)`,
    });
  });

  // ─── Trend line (right half, when clause selected) ───
  if (_selectedClause) {
    const clauseData = clauses.find(c => c.clause === _selectedClause);
    if (clauseData && clauseData.trend) {
      const trendX = w * 0.52;
      const trendW = w - trendX - pad;
      const trendY = boxY;
      const trendH = boxH - 20;
      const maxTrend = Math.max(...clauseData.trend, 0.1);
      const treeColors = ['#e05555', '#d4893a', '#c9a832', '#5c83ff', '#a67bdb', '#3bb88a'];
      const color = treeColors[clauses.indexOf(clauseData) % treeColors.length];

      // Label
      ctx.globalAlpha = 0.6 * easeOutCubic(p);
      ctx.font = '600 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t3; ctx.textAlign = 'left';
      ctx.fillText(`NCE ACCUMULATION — ${_selectedClause.toUpperCase()}`, trendX, trendY - 4);

      // Area fill
      ctx.beginPath(); ctx.moveTo(trendX, trendY + trendH);
      clauseData.trend.forEach((v, i) => {
        const x = trendX + (i / (clauseData.trend.length - 1)) * trendW;
        const y = trendY + trendH - (v / maxTrend) * trendH * easeOutCubic(p);
        ctx.lineTo(x, y);
      });
      ctx.lineTo(trendX + trendW, trendY + trendH); ctx.closePath();
      const grad = ctx.createLinearGradient(0, trendY, 0, trendY + trendH);
      grad.addColorStop(0, rgb(color, 0.25 * easeOutCubic(p)));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.globalAlpha = 0.8; ctx.fill();

      // Line
      ctx.beginPath();
      clauseData.trend.forEach((v, i) => {
        const x = trendX + (i / (clauseData.trend.length - 1)) * trendW;
        const y = trendY + trendH - (v / maxTrend) * trendH * easeOutCubic(p);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.9 * easeOutCubic(p); ctx.stroke();

      // Data points
      clauseData.trend.forEach((v, i) => {
        if (v <= 0) return;
        const x = trendX + (i / (clauseData.trend.length - 1)) * trendW;
        const y = trendY + trendH - (v / maxTrend) * trendH * easeOutCubic(p);
        ctx.globalAlpha = 0.7 * easeOutCubic(p); ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();

        // Value labels on points
        if (i === clauseData.trend.length - 1 || i === Math.floor(clauseData.trend.length / 2)) {
          ctx.globalAlpha = easeOutCubic(p); ctx.font = '700 10px "SFMono-Regular", monospace'; ctx.fillStyle = color;
          ctx.textAlign = 'center'; ctx.fillText(`£${v.toFixed(1)}M`, x, y - 10);
        }
      });

      // Endpoint glow
      const lastV = clauseData.trend[clauseData.trend.length - 1];
      const endX = trendX + trendW;
      const endY = trendY + trendH - (lastV / maxTrend) * trendH * easeOutCubic(p);
      const pulse = 0.6 + 0.4 * Math.sin(T * 0.004);
      drawGlow(ctx, endX, endY, 14, color, 0.35 * pulse);
      ctx.globalAlpha = easeOutCubic(p); ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(endX, endY, 5, 0, Math.PI * 2); ctx.fill();

      // Month labels
      ctx.globalAlpha = 0.4 * easeOutCubic(p); ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t4; ctx.textAlign = 'center';
      months.forEach((m, i) => {
        ctx.fillText(m, trendX + (i / (months.length - 1)) * trendW, trendY + trendH + 16);
      });

      // Hint
      ctx.globalAlpha = 0.3 * easeOutCubic(p); ctx.font = '500 8px "Satoshi", sans-serif'; ctx.fillStyle = C.t4; ctx.textAlign = 'right';
      ctx.fillText('Click box again to deselect', w - pad, h - 4);
    }
  } else {
    // Hint when no clause selected
    ctx.globalAlpha = 0.3 * easeOutCubic(p); ctx.font = '500 9px "Satoshi", sans-serif'; ctx.fillStyle = C.t4; ctx.textAlign = 'right';
    ctx.fillText('Click a box to see trend →', w - pad, h - 4);
  }
}
