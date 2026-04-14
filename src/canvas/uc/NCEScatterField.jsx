import { useRef, useEffect } from 'react';
import { drawGlow, drawDust } from '../utils';
import { C, FONT_MONO, FONT_SANS } from '../../theme/tokens';

const PADDING = { top: 24, right: 28, bottom: 40, left: 56 };
const MAX_VALUE = 200; // £K — y-axis ceiling
const THRESHOLD = 50;  // £K — the detection threshold

// Clause zone centers (normalized 0-1 within plot area)
const CLAUSE_POSITIONS = [0.18, 0.5, 0.82];
const CLAUSE_LABELS = ['Access 60.1(2)', 'Design 60.1(1)', 'Physical 60.1(12)'];

// Value → Y position (higher value = higher up)
function valueToY(value, plotTop, plotHeight) {
  return plotTop + plotHeight * (1 - value / MAX_VALUE);
}

// Add jitter so dots don't perfectly overlap
function jitter(seed) {
  return (Math.sin(seed * 127.1 + 311.7) * 0.5) * 18;
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function NCEScatterField({ width, height, scrubRef, scrubValue, dotData, hasStartedDragging }) {
  const canvasRef = useRef(null);
  const dotScales = useRef(new Map()); // dotId → current scale (0-1)
  const frameRef = useRef(0);

  const { rhiNCEs, otherNCEs, threshold, months } = dotData;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;

    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const plotLeft = PADDING.left;
    const plotRight = width - PADDING.right;
    const plotTop = PADDING.top;
    const plotBottom = height - PADDING.bottom;
    const plotWidth = plotRight - plotLeft;
    const plotHeight = plotBottom - plotTop;

    let raf;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      const scrub = scrubRef.current;
      const monthCount = months.length;

      ctx.clearRect(0, 0, width, height);

      // Ambient dust
      drawDust(ctx, width, height, T, 30, 'rgba(80,120,160,.03)');

      // Subtle grid lines for clause zones
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < CLAUSE_POSITIONS.length; i++) {
        const x = plotLeft + CLAUSE_POSITIONS[i] * plotWidth;
        ctx.beginPath();
        ctx.moveTo(x, plotTop);
        ctx.lineTo(x, plotBottom);
        ctx.stroke();
      }

      // Y-axis labels
      ctx.font = `9px ${FONT_MONO}`;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const yLabels = [0, 50, 120, 180];
      for (const v of yLabels) {
        const y = valueToY(v, plotTop, plotHeight);
        ctx.fillText(`£${v}K`, plotLeft - 8, y);
        // Faint horizontal guide
        if (v > 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.04)';
          ctx.beginPath();
          ctx.moveTo(plotLeft, y);
          ctx.lineTo(plotRight, y);
          ctx.stroke();
        }
      }

      // X-axis clause labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = `9px ${FONT_MONO}`;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let i = 0; i < CLAUSE_LABELS.length; i++) {
        const x = plotLeft + CLAUSE_POSITIONS[i] * plotWidth;
        ctx.fillText(CLAUSE_LABELS[i], x, plotBottom + 10);
      }

      // Threshold line
      const threshY = valueToY(THRESHOLD, plotTop, plotHeight);
      ctx.strokeStyle = 'rgba(240,96,96,0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(plotLeft, threshY);
      ctx.lineTo(plotRight, threshY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Threshold label
      ctx.font = `9px ${FONT_MONO}`;
      ctx.fillStyle = 'rgba(240,96,96,0.7)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('£50K threshold', plotRight, threshY - 5);

      // Draw other contractor dots
      for (let i = 0; i < otherNCEs.length; i++) {
        const dot = otherNCEs[i];
        const dotMonth = dot.month / (monthCount - 1);
        const dotId = `other-${i}`;

        // Target scale: 1 if scrub past this dot's month, 0 otherwise
        const targetScale = scrub >= dotMonth ? 1 : 0;
        const curr = dotScales.current.get(dotId) || 0;
        const next = curr + (targetScale - curr) * 0.15;
        dotScales.current.set(dotId, Math.abs(next) < 0.005 ? targetScale : next);

        const scale = dotScales.current.get(dotId);
        if (scale < 0.01) continue;

        const cx = plotLeft + CLAUSE_POSITIONS[dot.clause] * plotWidth + jitter(i * 3);
        const cy = valueToY(dot.value, plotTop, plotHeight) + jitter(i * 7);
        const radius = Math.max(6, (dot.value / MAX_VALUE) * 18) * scale;

        // Outer glow for other contractor dots
        drawGlow(ctx, cx, cy, radius * 2.5, dot.color, 0.15 * scale);

        ctx.globalAlpha = 0.7 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(dot.color, 0.75);
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(dot.color, 0.95);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw RHI dots
      let visibleRhiCount = 0;
      for (let i = 0; i < rhiNCEs.length; i++) {
        const dot = rhiNCEs[i];
        const dotMonth = dot.month / (monthCount - 1);
        const dotId = `rhi-${i}`;

        const targetScale = scrub >= dotMonth ? 1 : 0;
        const curr = dotScales.current.get(dotId) || 0;
        const next = curr + (targetScale - curr) * 0.15;
        dotScales.current.set(dotId, Math.abs(next) < 0.005 ? targetScale : next);

        const scale = dotScales.current.get(dotId);
        if (scale < 0.01) continue;

        visibleRhiCount++;

        const cx = plotLeft + CLAUSE_POSITIONS[dot.clause] * plotWidth + jitter(i * 11 + 50);
        const cy = valueToY(dot.value, plotTop, plotHeight) + jitter(i * 13 + 80);
        const radius = Math.max(5, (dot.value / MAX_VALUE) * 14) * scale;

        // Glow intensifies with more visible dots — larger and brighter
        const glowIntensity = 0.25 + (visibleRhiCount / rhiNCEs.length) * 0.35;
        drawGlow(ctx, cx, cy, radius * 4, C.amber, glowIntensity * scale);

        // Main dot — high opacity
        ctx.globalAlpha = (0.85 + visibleRhiCount * 0.02) * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(C.amber, 0.9);
        ctx.fill();

        // Hot core
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,245,200,0.95)';
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // RHI label — fades in after month 3 (scrub > 0.75)
      if (scrub > 0.75) {
        const labelAlpha = Math.min((scrub - 0.75) / 0.1, 1);
        ctx.globalAlpha = labelAlpha;

        // Background pill behind label for readability
        const labelText = 'RHI Magnesita — 7 NCEs, all under £50K';
        ctx.font = `bold 11px ${FONT_MONO}`;
        const metrics = ctx.measureText(labelText);
        const labelX = plotLeft + plotWidth * 0.5;
        const labelY = plotBottom - 12;
        const padX = 10, padY = 5;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.roundRect(
          labelX - metrics.width / 2 - padX,
          labelY - padY,
          metrics.width + padX * 2,
          16 + padY,
          4,
        );
        ctx.fill();

        ctx.fillStyle = hexToRgba(C.amber, 1);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(labelText, labelX, labelY);
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width, height, display: 'block' }}
      />

      {/* Instruction cue — visible until user starts dragging */}
      {!hasStartedDragging && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          transition: 'opacity 300ms ease-out',
          opacity: hasStartedDragging ? 0 : 1,
        }}>
          <div style={{
            fontFamily: FONT_SANS,
            fontSize: 14,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            lineHeight: 1.6,
            fontWeight: 500,
          }}>
            Drag the timeline to see NCE submissions appear
            <div style={{
              marginTop: 6,
              fontSize: 20,
              opacity: 0.6,
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              →
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
