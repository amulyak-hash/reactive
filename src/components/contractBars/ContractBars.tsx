import { useRef, useMemo } from 'react';

import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from '../../canvas/useCanvasInteraction';
import { dampedPulse, tickHoverProgress } from '../../canvas/easing';
import { CC, rgb, drawGlow, drawDust, drawScanline } from '../../canvas/canvasUtils';
import { useCanvasLoop } from '../../canvas/useCanvasLoop';
import type { ContractBarsProps } from './types';

const W         = 780;
const H         = 234;  // trimmed — content ends at ~220, 14px margin
const FIXED_CY  = 130;  // explicit center Y, decoupled from H
const FIXED_MAXR = 52;  // explicit max radius, decoupled from H
const COLORS    = [CC.blue, CC.cyan, CC.amber, CC.purple, CC.green];
const KPI_NAMES = ['Base Value', 'Variations', 'Commitment'];
const KPI_SHORT = ['Base',       'Var',        'Commit'   ];

export function ContractBars({ contractors, 'data-testid': testId }: ContractBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap  = useRef<Map<string, number>>(new Map());
  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, { width: W, height: H });

  const constellations = useMemo(() => {
    const maxBase = Math.max(...contractors.map(c => c.base));
    const maxVar  = Math.max(...contractors.map(c => c.variations));

    return contractors.map((con, pi) => {
      // Symmetric horizontal layout — equal margins on both sides
      const cx    = W * (0.12 + pi * 0.19);
      const cy    = FIXED_CY;
      const baseR = Math.min(W * 0.075, FIXED_MAXR);
      const color = COLORS[pi % COLORS.length];

      const kpiVals   = [
        (con.base       / maxBase) * 100,
        (con.variations / maxVar)  * 100,
        con.commitmentPct,
      ];
      const kpiLabels = [
        `£${con.base}M`,
        `£${con.variations}M`,
        `${con.commitmentPct}%`,
      ];

      const stars = kpiVals.map((val, ki) => {
        const angle = -Math.PI / 2 + (ki / KPI_NAMES.length) * Math.PI * 2;
        const norm  = val / 100;
        const r     = baseR * Math.max(0.08, norm);
        return {
          name  : KPI_NAMES[ki],
          short : KPI_SHORT[ki],
          label : kpiLabels[ki],
          val   : Math.round(val),
          x     : cx + Math.cos(angle) * r,
          y     : cy + Math.sin(angle) * r,
          angle,
          norm,
        };
      });

      const avgX    = stars.reduce((s, st) => s + st.x, 0) / stars.length;
      const avgY    = stars.reduce((s, st) => s + st.y, 0) / stars.length;
      const scatter = Math.sqrt(
        stars.reduce((s, st) => s + (st.x - avgX) ** 2 + (st.y - avgY) ** 2, 0) / stars.length,
      );

      return { ...con, cx, cy, baseR, stars, scatter, color };
    });
  }, [contractors]);

  useCanvasLoop(
    canvasRef,
    W,
    H,
    (ctx, _progress, T) => {
      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      drawDust(ctx, W, H, T, 30);

      constellations.forEach((con, ci) => {
        const trColor = con.color;
        const conId   = `constellation-${ci}`;
        const hp      = hoverMap.current.get(conId) ?? 0;

        // Faint boundary circle
        ctx.beginPath();
        ctx.arc(con.cx, con.cy, con.baseR + 5, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(CC.bd, 0.08 + 0.08 * hp);
        ctx.lineWidth   = 0.5;
        ctx.stroke();

        // Polygon connecting the three stars
        ctx.beginPath();
        con.stars.forEach((star, si) => {
          si === 0 ? ctx.moveTo(star.x, star.y) : ctx.lineTo(star.x, star.y);
        });
        ctx.closePath();
        ctx.fillStyle   = rgb(trColor, 0.04 + 0.03 * hp);
        ctx.fill();
        ctx.strokeStyle = rgb(trColor, 0.15 + 0.1 * hp);
        ctx.lineWidth   = 0.8;
        ctx.stroke();

        // Stars + KPI labels
        con.stars.forEach((star, si) => {
          const twinkle = dampedPulse(T, 0.05, 0.0005) * 0.3 + 0.7;
          const starR   = 3.5 * twinkle;
          const starId  = `star-${ci}-${si}`;
          const shp     = hoverMap.current.get(starId) ?? 0;

          // Star glow
          const sg = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, starR * 4);
          sg.addColorStop(0, rgb(trColor, (0.2 + 0.1 * shp) * twinkle));
          sg.addColorStop(1, rgb(trColor, 0));
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(star.x, star.y, starR * 4, 0, Math.PI * 2);
          ctx.fill();

          // Star point
          ctx.beginPath();
          ctx.arc(star.x, star.y, starR + shp * 2, 0, Math.PI * 2);
          ctx.fillStyle = rgb(trColor, (0.8 + 0.2 * shp) * twinkle);
          ctx.fill();

          // KPI labels drawn vertically (above top star, below bottom stars).
          // This prevents any horizontal bleed into adjacent constellations.
          const isTop = Math.sin(star.angle) < -0.3;
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';

          if (isTop) {
            // Name sits just above the value, both above the star
            ctx.font      = `8px 'DM Sans', sans-serif`;
            ctx.fillStyle = rgb(trColor, 0.5 + 0.15 * shp);
            ctx.fillText(star.short, star.x, star.y - 24);

            ctx.font      = `bold 11px 'JetBrains Mono', monospace`;
            ctx.fillStyle = rgb(trColor, 0.8 + 0.15 * shp);
            ctx.fillText(star.label, star.x, star.y - 11);
          } else {
            // Name sits just below the star, value below the name
            ctx.font      = `8px 'DM Sans', sans-serif`;
            ctx.fillStyle = rgb(trColor, 0.5 + 0.15 * shp);
            ctx.fillText(star.short, star.x, star.y + 11);

            ctx.font      = `bold 11px 'JetBrains Mono', monospace`;
            ctx.fillStyle = rgb(trColor, 0.8 + 0.15 * shp);
            ctx.fillText(star.label, star.x, star.y + 24);
          }

          registerHitCircle(hitZonesRef.current, starId, star.x, star.y, starR * 4 + 2, {
            label   : star.name,
            value   : star.label,
            sublabel: con.shortName,
            color   : trColor,
          });
        });

        // Hover glow on center
        if (hp > 0) drawGlow(ctx, con.cx, con.cy, 16 * hp, trColor, 0.15 * hp);

        // Pulsing highlight ring
        ctx.beginPath();
        ctx.arc(con.cx, con.cy, con.baseR + 12, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(trColor, 0.1 + dampedPulse(T, 0.03, 0.0005) * 0.05);
        ctx.lineWidth   = 1;
        ctx.stroke();

        // Contractor name below circle
        ctx.font         = `bold 11px 'DM Sans', sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle    = rgb(CC.t2, 0.65 + hp * 0.25);
        ctx.fillText(con.shortName, con.cx, con.cy + con.baseR + 26);

        registerHitCircle(hitZonesRef.current, conId, con.cx, con.cy, con.baseR + 5, {
          label   : con.name,
          value   : `£${con.totalCommitment}M total`,
          sublabel: `${con.commitmentPct}% committed · scatter ${con.scatter.toFixed(1)}`,
          color   : trColor,
        });
      });

      // Footer caption
      ctx.font         = `11px 'DM Sans', sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle    = rgb(CC.t4, 0.55);
      ctx.fillText(
        '▲ top = Base value  ·  ▼▸ lower-right = Variations  ·  ◂▼ lower-left = Commitment %  ·  hover stars for details',
        W / 2,
        H - 14,
      );

      drawScanline(ctx, W, H, T, 0.012);
    },
    true,
  );

  return (
    <div data-testid={testId} style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Contract value breakdown per contractor — multi-KPI constellation chart"
        style={{ width: W, height: H, display: 'block' }}
      />
      <CanvasTooltip {...tooltip} parentW={W} parentH={H} />
    </div>
  );
}
