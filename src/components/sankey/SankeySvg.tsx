import { useRef, useEffect, useMemo } from 'react';

import { ChartFrame } from '../chartFrame/ChartFrame';
import { CanvasTooltip } from '../../canvas/CanvasTooltip';
import {
  useCanvasInteraction,
  registerHitRect,
  registerHitCircle,
} from '../../canvas/useCanvasInteraction';
import { dampedPulse, tickHoverProgress } from '../../canvas/easing';
import { CC, PALETTE, rgb, drawGlow, drawScanline, setupCanvas } from '../../canvas/canvasUtils';
import type { SankeyNodeData, SankeyLinkData, SankeySvgProps } from '../../types';

interface NodeLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** BFS depth assignment — source-only nodes start at depth 0 */
function computeLayout(
  nodes: SankeyNodeData[],
  links: SankeyLinkData[],
  width: number,
  height: number,
): Map<string, NodeLayout> {
  const sourceIds = new Set(links.map(l => l.source));
  const targetIds = new Set(links.map(l => l.target));

  const depths = new Map<string, number>();
  const queue: Array<{ id: string; depth: number }> = [];

  // Seed queue with root nodes (sources that are never a target)
  nodes.forEach(n => {
    if (sourceIds.has(n.id) && !targetIds.has(n.id)) {
      queue.push({ id: n.id, depth: 0 });
    }
  });

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { id, depth } = item;
    if (depths.has(id)) continue;
    depths.set(id, depth);
    links
      .filter(l => l.source === id)
      .forEach(l => {
        if (!depths.has(l.target as string)) {
          queue.push({ id: l.target as string, depth: depth + 1 });
        }
      });
  }

  // Ensure every node has a depth (handles isolated or pure-target nodes)
  const maxBFSDepth = depths.size > 0 ? Math.max(...Array.from(depths.values())) : 0;
  nodes.forEach(n => {
    if (!depths.has(n.id)) depths.set(n.id, maxBFSDepth + 1);
  });

  // Group nodes into columns by depth
  const columns = new Map<number, string[]>();
  nodes.forEach(n => {
    const d = depths.get(n.id) ?? 0;
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d)!.push(n.id);
  });

  const totalCols = Math.max(...Array.from(columns.keys())) + 1;
  const pad = { left: 100, right: 80, top: 40, bottom: 40 };
  const nodeW = 20;
  const colGap = 12;
  const layoutMap = new Map<string, NodeLayout>();

  columns.forEach((nodeIds, colIdx) => {
    const colX =
      pad.left + (colIdx / Math.max(totalCols - 1, 1)) * (width - pad.left - pad.right);
    const availH = height - pad.top - pad.bottom;
    const nodeH = Math.max(24, (availH - (nodeIds.length - 1) * colGap) / nodeIds.length);
    const totalH = nodeIds.length * nodeH + (nodeIds.length - 1) * colGap;
    const startY = pad.top + (availH - totalH) / 2;

    nodeIds.forEach((id, i) => {
      layoutMap.set(id, {
        x: colX - nodeW / 2,
        y: startY + i * (nodeH + colGap),
        w: nodeW,
        h: nodeH,
      });
    });
  });

  return layoutMap;
}

export function SankeySvg({
  nodes,
  links,
  width = 960,
  height = 280,
  ariaLabel,
  selectedEntity,
  className,
  colors,
}: SankeySvgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverMap = useRef(new Map<string, number>());
  const frameRef = useRef(0);
  const particles = useRef<Array<{ linkIdx: number; prog: number; speed: number; off: number; sz: number }>>([]);

  const nodePalette = colors?.nodes ?? PALETTE;
  const linkColor = colors?.links ?? CC.bd;
  const activeLinkColor = colors?.activeLinks ?? CC.blue;
  const activeNodeColor = colors?.activeNodes ?? CC.blue;

  const layoutMap = useMemo(
    () => computeLayout(nodes, links, width, height),
    [nodes, links, width, height],
  );

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, {
    width,
    height,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, width, height);

    frameRef.current = 0;
    const DURATION = 56;
    particles.current = [];

    const maxLinkValue = links.length > 0 ? Math.max(...links.map((l: SankeyLinkData) => l.value)) : 1;

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, width, height);

      const rawProgress = Math.min(T / DURATION, 1);
      const progress = 1 - (1 - rawProgress) ** 3;

      tickHoverProgress(hoverMap.current, hoveredRef.current);
      hitZonesRef.current = [];

      // Draw links as bezier tributaries
      links.forEach((link: SankeyLinkData, li: number) => {
        const src = layoutMap.get(link.source as string);
        const tgt = layoutMap.get(link.target as string);
        if (!src || !tgt) return;

        const isActive =
          !!selectedEntity &&
          (link.source === selectedEntity || link.target === selectedEntity);
        const color = isActive ? activeLinkColor : linkColor;
        const baseAlpha = isActive ? 0.5 : 0.2;

        const linkW = Math.max(3, (link.value / maxLinkValue) * 36 * progress);
        const hw = linkW / 2;

        // Source right-edge midpoint → target left-edge midpoint
        const sx = src.x + src.w;
        const sy = src.y + src.h / 2;
        const tx = tgt.x;
        const ty = tgt.y + tgt.h / 2;
        const mx = (sx + tx) / 2;

        // Draw link as filled bezier band (40 segments for smooth curve)
        const segs = 30;
        for (let s = 0; s < segs; s++) {
          const t1 = s / segs;
          const t2 = (s + 1) / segs;
          const m1 = 1 - t1;
          const m2 = 1 - t2;

          const x1 = m1 * m1 * sx + 2 * m1 * t1 * mx + t1 * t1 * tx;
          const y1c = m1 * m1 * sy + 2 * m1 * t1 * sy + t1 * t1 * ty;
          const x2 = m2 * m2 * sx + 2 * m2 * t2 * mx + t2 * t2 * tx;
          const y2c = m2 * m2 * sy + 2 * m2 * t2 * sy + t2 * t2 * ty;

          const wave = dampedPulse(T + t1 * 120 + li * 40, 0.025, 0.0003) * 1.2;

          ctx.beginPath();
          ctx.moveTo(x1, y1c - hw + wave);
          ctx.lineTo(x2, y2c - hw + wave);
          ctx.lineTo(x2, y2c + hw + wave);
          ctx.lineTo(x1, y1c + hw + wave);
          ctx.closePath();
          ctx.fillStyle = rgb(color, baseAlpha * (0.5 + t1 * 0.5));
          ctx.fill();
        }

        // Hit zone along the link midpoint
        registerHitCircle(hitZonesRef.current, `link-${li}`, mx, (sy + ty) / 2, linkW + 6, {
          label: `${link.source as string} → ${link.target as string}`,
          value: String(link.value),
          color: isActive ? activeLinkColor : CC.blue,
        });

        // Emit flow particles
        if (Math.random() < 0.08) {
          particles.current.push({
            linkIdx: li,
            prog: 0,
            speed: 0.006 + Math.random() * 0.006,
            off: (Math.random() - 0.5) * linkW * 0.5,
            sz: 1 + Math.random(),
          });
        }
      });

      // Draw nodes
      nodes.forEach((node: SankeyNodeData, ni: number) => {
        const pos = layoutMap.get(node.id);
        if (!pos) return;

        const isSelected = selectedEntity === node.id;
        const isHovered = hoveredRef.current === `node-${ni}`;
        const hp = hoverMap.current.get(`node-${ni}`) ?? 0;
        const color = isSelected ? activeNodeColor : nodePalette[ni % nodePalette.length];

        registerHitRect(hitZonesRef.current, `node-${ni}`, pos.x, pos.y, pos.w, pos.h, {
          label: node.name,
          value: node.valueLabel ?? node.id,
          color,
        });

        // Hover / selected glow
        if (hp > 0 || isSelected) {
          drawGlow(ctx, pos.x + pos.w / 2, pos.y + pos.h / 2, pos.w * 2, color, 0.2 * Math.max(hp, isSelected ? 0.6 : 0));
        }

        const pulse = isSelected ? dampedPulse(T, 0.03, 0.0003) * 0.15 : 0;

        ctx.fillStyle = rgb(color, 0.6 + hp * 0.25 + pulse);
        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, pos.w, pos.h, 4);
        ctx.fill();

        if (isSelected || hp > 0) {
          ctx.strokeStyle = rgb(color, 0.5 * Math.max(hp, isSelected ? 1 : 0));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(pos.x, pos.y, pos.w, pos.h, 4);
          ctx.stroke();
        }

        // Node name — to the right of right-column nodes, left of left-column nodes
        const labelX = pos.x + pos.w + 8;
        ctx.font = `${isSelected || isHovered ? 'bold ' : ''}10px 'JetBrains Mono', monospace`;
        ctx.fillStyle = rgb(isSelected ? color : CC.t2, 0.7 + hp * 0.2);
        ctx.textAlign = 'left';
        ctx.fillText(node.name, labelX, pos.y + pos.h / 2 + 4);

        // Value label below name
        if (node.valueLabel) {
          ctx.font = `9px 'JetBrains Mono', monospace`;
          ctx.fillStyle = rgb(color, 0.5 + hp * 0.2);
          ctx.fillText(node.valueLabel, labelX, pos.y + pos.h / 2 + 17);
        }
      });

      // Update & draw flow particles
      particles.current = particles.current.filter(p => {
        p.prog += p.speed;
        if (p.prog > 1) return false;

        const link = links[p.linkIdx];
        if (!link) return false;
        const src = layoutMap.get(link.source as string);
        const tgt = layoutMap.get(link.target as string);
        if (!src || !tgt) return false;

        const sx = src.x + src.w;
        const sy = src.y + src.h / 2;
        const tx = tgt.x;
        const ty = tgt.y + tgt.h / 2;
        const mx = (sx + tx) / 2;
        const m = 1 - p.prog;
        const px = m * m * sx + 2 * m * p.prog * mx + p.prog * p.prog * tx;
        const py = m * m * sy + 2 * m * p.prog * sy + p.prog * p.prog * ty + p.off;

        const al = Math.sin(p.prog * Math.PI) * 0.5;
        const color = colors?.links ?? CC.cyan;
        ctx.beginPath();
        ctx.arc(px, py, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = rgb(color, al);
        ctx.fill();
        return true;
      });
      if (particles.current.length > 150) particles.current = particles.current.slice(-150);

      drawScanline(ctx, width, height, T, 0.01);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      particles.current = [];
    };
  }, [nodes, links, width, height, selectedEntity, colors, layoutMap]);

  return (
    <ChartFrame className={['canvas-sankey-frame', className].filter(Boolean).join(' ')}>
      <div
        role="img"
        aria-label={ariaLabel}
        style={{ position: 'relative', width, height }}
      >
        <canvas
          ref={canvasRef}
          style={{ width, height, display: 'block', borderRadius: 8 }}
        />
        <CanvasTooltip {...tooltip} parentW={width} parentH={height} />
      </div>
    </ChartFrame>
  );
}
