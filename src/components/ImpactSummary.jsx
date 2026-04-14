import { useRef, useEffect, useState } from 'react';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';
import { setupCanvas, drawGlow } from '../canvas/utils';
import { easeOutCubic } from '../canvas/easing';

export default function ImpactSummary({ useCase }) {
  const { budgetImpact, timelineImpact } = useCase;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Budget: before/after comparison bar */}
      <BudgetComparisonCard impact={budgetImpact} />
      {/* Timeline: sparkline risk chart */}
      <TimelineSparkCard impact={timelineImpact} />
    </div>
  );
}

function BudgetComparisonCard({ impact }) {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !impact.withoutAction) return;
    const start = performance.now();

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const w = r.width;
      if (mx < w * 0.5) setTooltip(`Without action: ${formatVal(impact.withoutAction, impact.unit)}`);
      else setTooltip(`With action: ${formatVal(impact.withAction, impact.unit)}`);
    };
    const onLeave = () => setTooltip(null);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const draw = () => {
      const elapsed = performance.now() - start;
      const T = performance.now();
      const p = easeOutCubic(Math.min(elapsed / 1200, 1));
      const w = canvas.parentElement.clientWidth - 32; // account for padding
      const h = 56;
      const ctx = setupCanvas(canvas, w, h);
      ctx.clearRect(0, 0, w, h);

      const maxVal = impact.withoutAction;
      const barY = 8, barH = 18, pad = 0;
      const fullW = w - pad * 2;

      // "Without action" bar (full width, dimmed)
      ctx.globalAlpha = 0.15 * p;
      ctx.fillStyle = C.red;
      ctx.beginPath(); ctx.roundRect(pad, barY, fullW * p, barH, 6); ctx.fill();

      // "With action" bar (proportional)
      const ratio = impact.withAction / maxVal;
      ctx.globalAlpha = 0.8 * p;
      ctx.fillStyle = C.green;
      ctx.beginPath(); ctx.roundRect(pad, barY, fullW * ratio * p, barH, 6); ctx.fill();

      // Savings gap annotation
      if (p > 0.5) {
        const gapStart = pad + fullW * ratio;
        const gapEnd = pad + fullW;
        const midX = (gapStart + gapEnd) / 2;

        // Dashed line showing savings
        ctx.globalAlpha = 0.4 * p;
        ctx.strokeStyle = C.red;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(gapStart * p, barY + barH / 2);
        ctx.lineTo(gapEnd * p, barY + barH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Savings label
        const saved = maxVal - impact.withAction;
        ctx.globalAlpha = p;
        ctx.font = '700 10px "Satoshi", sans-serif';
        ctx.fillStyle = C.red;
        ctx.textAlign = 'center';
        ctx.fillText(`−${formatVal(saved, impact.unit)} saved`, midX * p, barY + barH / 2 + 4);
      }

      // Labels
      ctx.globalAlpha = p * 0.7;
      ctx.font = '600 9px "Satoshi", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = C.green;
      ctx.fillText(`With action: ${formatVal(impact.withAction, impact.unit)}`, pad, barY + barH + 16);
      ctx.textAlign = 'right';
      ctx.fillStyle = C.t3;
      ctx.fillText(`Without: ${formatVal(impact.withoutAction, impact.unit)}`, w - pad, barY + barH + 16);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseleave', onLeave); };
  }, [impact]);

  return (
    <div style={{
      padding: '14px 16px', borderRadius: 18,
      border: `1px solid ${C.line}`,
      background: 'linear-gradient(180deg, rgba(12, 20, 32, 0.96), rgba(17, 27, 40, 0.96))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600,
          color: C.red, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          Budget Impact
        </div>
        <div style={{
          fontFamily: FONT_SANS, fontSize: 18, fontWeight: 700, color: C.red,
        }}>
          {impact.value}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 56, cursor: 'crosshair' }} />
        {tooltip && (
          <div style={{
            position: 'absolute', top: -4, left: '50%', transform: 'translate(-50%, -100%)',
            padding: '4px 8px', borderRadius: 6, background: 'rgba(10,16,29,0.95)',
            border: '1px solid rgba(109,123,156,0.2)', fontFamily: FONT_MONO,
            fontSize: 10, fontWeight: 600, color: '#f5f7fb', whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>{tooltip}</div>
        )}
      </div>
      {impact.savingsLabel && (
        <div style={{
          fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500,
          color: C.t3, marginTop: 6, lineHeight: 1.35,
        }}>
          {impact.savingsLabel}
        </div>
      )}
    </div>
  );
}

function TimelineSparkCard({ impact }) {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !impact.monthlyRisk) return;
    const start = performance.now();
    const { monthlyRisk, months } = impact;
    const maxVal = Math.max(...monthlyRisk);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const w = r.width;
      const idx = Math.floor((mx / w) * monthlyRisk.length);
      if (idx >= 0 && idx < monthlyRisk.length && months[idx]) {
        setTooltip({ idx, text: `${months[idx]}: ${formatVal(monthlyRisk[idx], '£K')}` });
      } else {
        setTooltip(null);
      }
    };
    const onLeave = () => setTooltip(null);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    let raf;
    const draw = () => {
      const elapsed = performance.now() - start;
      const T = performance.now();
      const p = easeOutCubic(Math.min(elapsed / 1400, 1));
      const w = canvas.parentElement.clientWidth - 32;
      const h = 64;
      const ctx = setupCanvas(canvas, w, h);
      ctx.clearRect(0, 0, w, h);

      const padT = 4, padB = 16;
      const chartH = h - padT - padB;
      const n = monthlyRisk.length;
      const stepW = w / n;

      // Area fill
      ctx.beginPath();
      ctx.moveTo(0, padT + chartH);
      monthlyRisk.forEach((val, i) => {
        const x = i * stepW + stepW / 2;
        const y = padT + chartH - (val / maxVal) * chartH * p;
        if (i === 0) ctx.lineTo(x, y);
        else {
          const prevX = (i - 1) * stepW + stepW / 2;
          const cpX = (prevX + x) / 2;
          const prevY = padT + chartH - (monthlyRisk[i - 1] / maxVal) * chartH * p;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.lineTo(w, padT + chartH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      grad.addColorStop(0, rgb(C.amber, 0.2 * p));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      monthlyRisk.forEach((val, i) => {
        const x = i * stepW + stepW / 2;
        const y = padT + chartH - (val / maxVal) * chartH * p;
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevX = (i - 1) * stepW + stepW / 2;
          const cpX = (prevX + x) / 2;
          const prevY = padT + chartH - (monthlyRisk[i - 1] / maxVal) * chartH * p;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8 * p;
      ctx.stroke();

      // Data points + hovered highlight
      monthlyRisk.forEach((val, i) => {
        const x = i * stepW + stepW / 2;
        const y = padT + chartH - (val / maxVal) * chartH * p;
        const isH = tooltip && tooltip.idx === i;

        if (isH) {
          drawGlow(ctx, x, y, 12, C.amber, 0.3);
          ctx.globalAlpha = 1;
          ctx.fillStyle = C.amber;
          ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();

          // Vertical guide line
          ctx.globalAlpha = 0.2;
          ctx.strokeStyle = C.amber; ctx.lineWidth = 0.5;
          ctx.setLineDash([2, 2]);
          ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x, padT + chartH); ctx.stroke();
          ctx.setLineDash([]);
        } else if (val > 0 && months[i]) {
          ctx.globalAlpha = 0.4 * p;
          ctx.fillStyle = C.amber;
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        }
      });

      // X-axis labels (sparse — only where months[i] is truthy)
      ctx.globalAlpha = 0.5 * p;
      ctx.font = '500 8px "Satoshi", sans-serif';
      ctx.fillStyle = C.t3;
      ctx.textAlign = 'center';
      months.forEach((m, i) => {
        if (m) ctx.fillText(m, i * stepW + stepW / 2, h - 2);
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseleave', onLeave); };
  }, [impact, tooltip]);

  return (
    <div style={{
      padding: '14px 16px', borderRadius: 18,
      border: `1px solid ${C.line}`,
      background: 'linear-gradient(180deg, rgba(12, 20, 32, 0.96), rgba(17, 27, 40, 0.96))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600,
          color: C.amber, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          Timeline Impact
        </div>
        <div style={{
          fontFamily: FONT_SANS, fontSize: 18, fontWeight: 700, color: C.amber,
        }}>
          {impact.value}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 64, cursor: 'crosshair' }} />
        {tooltip && (
          <div style={{
            position: 'absolute', top: -4, left: '50%', transform: 'translate(-50%, -100%)',
            padding: '4px 8px', borderRadius: 6, background: 'rgba(10,16,29,0.95)',
            border: '1px solid rgba(109,123,156,0.2)', fontFamily: FONT_MONO,
            fontSize: 10, fontWeight: 600, color: '#f5f7fb', whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>{tooltip.text}</div>
        )}
      </div>
      {impact.label && (
        <div style={{
          fontFamily: FONT_MONO, fontSize: 9, fontWeight: 500,
          color: C.t4, marginTop: 4, letterSpacing: '0.02em',
        }}>
          {impact.label}
        </div>
      )}
    </div>
  );
}

function formatVal(v, unit) {
  if (!unit) return `${v}`;
  if (unit === '£K' || unit === '£K/day') {
    if (v >= 1000) return `£${(v / 1000).toFixed(1)}M${unit === '£K/day' ? '/day' : ''}`;
    return `£${v}K${unit === '£K/day' ? '/day' : ''}`;
  }
  return `${v} ${unit}`;
}
