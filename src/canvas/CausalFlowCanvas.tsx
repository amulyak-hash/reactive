import { useEffect, useRef, useMemo } from 'react';

import { CanvasTooltip } from './CanvasTooltip';
import { useCanvasInteraction, registerHitCircle } from './useCanvasInteraction';
import { dampedPulse, easeOutCubic } from './easing';
import { CC, rgb, lerpC, drawGlow, drawDust, drawScanline, setupCanvas } from './canvasUtils';
import type { SankeyNodeData, SankeyLinkData } from '../types';

/**
 * Organic x/y positions (0–1 fractions) for up to 8 nodes.
 * Mirrors the zigzag layout from enterprise-brain CausalCanvas.
 */
const DEFAULT_POSITIONS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0.13, y: 0.48 },
  { x: 0.37, y: 0.28 },
  { x: 0.63, y: 0.62 },
  { x: 0.87, y: 0.38 },
  { x: 0.25, y: 0.72 },
  { x: 0.50, y: 0.18 },
  { x: 0.75, y: 0.70 },
  { x: 0.92, y: 0.22 },
];

const NODE_COLORS = [CC.blue, CC.cyan, CC.orange, CC.red, CC.purple, CC.green, CC.amber, CC.t2];
const NODE_RADII = [26, 24, 24, 26, 22, 22, 22, 22];

interface BezierCurve {
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
}

interface Particle {
  edgeIdx: number;
  t: number;
  speed: number;
  off: number;
  sz: number;
}

interface InternalNode {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  r: number;
  color: string;
}

interface InternalEdge {
  fromIdx: number;
  toIdx: number;
  conf: number;
}

export interface CausalFlowCanvasProps {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
  width?: number;
  height?: number;
  selectedEntity?: string | null;
}

/** Point at parameter t along a cubic bezier */
function bPt(b: BezierCurve, t: number): { x: number; y: number } {
  const m = 1 - t;
  return {
    x: m * m * m * b.p0.x + 3 * m * m * t * b.p1.x + 3 * m * t * t * b.p2.x + t * t * t * b.p3.x,
    y: m * m * m * b.p0.y + 3 * m * m * t * b.p1.y + 3 * m * t * t * b.p2.y + t * t * t * b.p3.y,
  };
}

/** Unit normal at parameter t along a cubic bezier */
function bNm(b: BezierCurve, t: number): { x: number; y: number } {
  const m = 1 - t;
  const dx = 3 * m * m * (b.p1.x - b.p0.x) + 6 * m * t * (b.p2.x - b.p1.x) + 3 * t * t * (b.p3.x - b.p2.x);
  const dy = 3 * m * m * (b.p1.y - b.p0.y) + 6 * m * t * (b.p2.y - b.p1.y) + 3 * t * t * (b.p3.y - b.p2.y);
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: -dy / len, y: dx / len };
}

/** Build cubic bezier control points for an edge, with slight perpendicular offset */
function buildBezier(n0: InternalNode, n1: InternalNode): BezierCurve {
  const dx = n1.x - n0.x;
  const dy = n1.y - n0.y;
  return {
    p0: { x: n0.x, y: n0.y },
    p1: { x: n0.x + dx * 0.3 + dy * 0.15, y: n0.y + dy * 0.3 - dx * 0.15 },
    p2: { x: n1.x - dx * 0.3 + dy * 0.08, y: n1.y - dy * 0.3 - dx * 0.08 },
    p3: { x: n1.x, y: n1.y },
  };
}

/**
 * Canvas-based causal flow diagram.
 * Adapted from enterprise-brain/src/canvas/CausalCanvas.jsx.
 *
 * Renders circular nodes at organic scattered positions connected by
 * animated bezier curves with confidence badges and flowing particles.
 */
export function CausalFlowCanvas({
  nodes,
  links,
  width = 960,
  height = 280,
  selectedEntity,
}: CausalFlowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const parts = useRef<Particle[]>([]);

  const { hoveredRef, tooltip, hitZonesRef } = useCanvasInteraction(canvasRef, {
    width,
    height,
  });

  // Build index map: node id → array index
  const nodeIndexMap = useMemo(() => {
    const m = new Map<string, number>();
    nodes.forEach((n, i) => m.set(n.id, i));
    return m;
  }, [nodes]);

  // Normalise link values to 0–1 confidence
  const maxValue = useMemo(
    () => (links.length > 0 ? Math.max(...links.map(l => l.value)) : 100),
    [links],
  );
  const normaliseConf = (v: number) => (maxValue > 1 ? v / 100 : v);

  // Internal node descriptors with canvas positions
  const iNodes = useMemo<InternalNode[]>(
    () =>
      nodes.map((n, i) => {
        const pos = DEFAULT_POSITIONS[i % DEFAULT_POSITIONS.length];
        return {
          id: n.id,
          label: n.name,
          sub: n.valueLabel ?? '',
          x: pos.x * width,
          y: pos.y * height,
          r: NODE_RADII[i % NODE_RADII.length],
          color: NODE_COLORS[i % NODE_COLORS.length],
        };
      }),
    [nodes, width, height],
  );

  // Internal edge descriptors
  const iEdges = useMemo<InternalEdge[]>(
    () =>
      links
        .map(l => ({
          fromIdx: nodeIndexMap.get(l.source as string) ?? -1,
          toIdx: nodeIndexMap.get(l.target as string) ?? -1,
          conf: normaliseConf(l.value),
        }))
        .filter(e => e.fromIdx >= 0 && e.toIdx >= 0),
    [links, nodeIndexMap],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, width, height);

    frameRef.current = 0;
    parts.current = [];

    let raf: number;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, width, height);
      hitZonesRef.current = [];

      drawDust(ctx, width, height, T, 50, rgb(CC.blue, 0.05));

      // --- Edges ---
      iEdges.forEach((edge, ei) => {
        const n0 = iNodes[edge.fromIdx];
        const n1 = iNodes[edge.toIdx];
        if (!n0 || !n1) return;

        const isActive =
          !!selectedEntity && (n0.id === selectedEntity || n1.id === selectedEntity);
        const midColor = lerpC(n0.color, n1.color, 0.5);
        const tubeAlpha = isActive ? 0.18 : 0.05;
        const lineAlpha = isActive ? 0.25 : 0.1;

        const b = buildBezier(n0, n1);

        // Glow tube
        ctx.beginPath();
        ctx.moveTo(b.p0.x, b.p0.y);
        ctx.bezierCurveTo(b.p1.x, b.p1.y, b.p2.x, b.p2.y, b.p3.x, b.p3.y);
        ctx.strokeStyle = rgb(midColor, tubeAlpha);
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Core line
        ctx.strokeStyle = rgb(midColor, lineAlpha);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Emit particles along this edge
        for (let s = 0; s < edge.conf * 2.5; s++) {
          if (Math.random() < 0.45) {
            parts.current.push({
              edgeIdx: ei,
              t: 0,
              speed: 0.003 + Math.random() * 0.004,
              off: (Math.random() - 0.5) * 13,
              sz: 0.7 + Math.random() * 2,
            });
          }
        }

        // Confidence badge at midpoint
        const mid = bPt(b, 0.5);
        const lbl = `${Math.round(edge.conf * 100)}%`;
        ctx.font = "bold 12px 'JetBrains Mono', monospace";
        ctx.textBaseline = 'middle';
        const tw = ctx.measureText(lbl).width + 14;
        ctx.fillStyle = 'rgba(10,16,24,0.88)';
        ctx.beginPath();
        ctx.roundRect(mid.x - tw / 2, mid.y - 11, tw, 22, 6);
        ctx.fill();
        ctx.strokeStyle = rgb(CC.cyan, 0.25);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = rgb(CC.cyan, 0.9);
        ctx.textAlign = 'center';
        ctx.fillText(lbl, mid.x, mid.y);
      });

      // --- Particles ---
      parts.current = parts.current.filter(p => {
        p.t += p.speed;
        if (p.t > 1) return false;
        const edge = iEdges[p.edgeIdx];
        if (!edge) return false;
        const n0 = iNodes[edge.fromIdx];
        const n1 = iNodes[edge.toIdx];
        if (!n0 || !n1) return false;

        const b = buildBezier(n0, n1);
        const pos = bPt(b, p.t);
        const nm = bNm(b, p.t);
        const px = pos.x + nm.x * p.off;
        const py = pos.y + nm.y * p.off;
        const al = Math.sin(p.t * Math.PI) * 0.7;
        const col = lerpC(n0.color, n1.color, p.t);

        drawGlow(ctx, px, py, p.sz * 3, col, al * 0.1);
        ctx.beginPath();
        ctx.arc(px, py, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = rgb(col, al);
        ctx.fill();
        return true;
      });
      if (parts.current.length > 350) parts.current = parts.current.slice(-350);

      // --- Nodes ---
      iNodes.forEach((n, i) => {
        const isSelected = selectedEntity === n.id;
        const isHovered = hoveredRef.current === `node-${i}`;
        const pulse = dampedPulse(T, 0.03, 0.0003) * 0.1 + 1;
        const r = n.r * pulse * (isSelected ? 1.15 : 1);

        // Outer ring hint
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(n.color, isSelected ? 0.3 : 0.1);
        ctx.lineWidth = isSelected ? 1.5 : 0.7;
        ctx.stroke();

        // Glow
        drawGlow(ctx, n.x, n.y, r * 3, n.color, isSelected ? 0.22 : 0.12);

        // Sphere gradient fill
        const cg = ctx.createRadialGradient(n.x, n.y - r * 0.2, 0, n.x, n.y, r);
        cg.addColorStop(0, rgb(n.color, isSelected ? 1 : 0.85));
        cg.addColorStop(1, rgb(n.color, isSelected ? 0.65 : 0.45));
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting dot on last/selected node
        if (isSelected || i === iNodes.length - 1) {
          const oR = r + 16;
          const angle = T * 0.04;
          const ox = n.x + Math.cos(angle) * oR;
          const oy = n.y + Math.sin(angle) * oR;
          drawGlow(ctx, ox, oy, 6, n.color, 0.3);
          ctx.beginPath();
          ctx.arc(ox, oy, 2, 0, Math.PI * 2);
          ctx.fillStyle = rgb(n.color, 0.75);
          ctx.fill();
        }

        // Hit zone
        registerHitCircle(hitZonesRef.current, `node-${i}`, n.x, n.y, r + 8, {
          label: n.label,
          value: n.sub || n.id,
          color: n.color,
        });

        // Node name label below circle
        ctx.font = `${isSelected || isHovered ? 'bold ' : ''}12px 'DM Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = rgb(n.color, isSelected ? 1 : 0.9);
        ctx.fillText(n.label, n.x, n.y + r + 18);

        // Subvalue line
        if (n.sub) {
          ctx.font = "10px 'JetBrains Mono', monospace";
          ctx.fillStyle = rgb(CC.t3, 0.65);
          ctx.fillText(n.sub, n.x, n.y + r + 32);
        }
      });

      // --- Compound confidence bar (shown once all edges are drawn) ---
      if (iEdges.length >= 2) {
        const compound = iEdges.reduce((acc, e) => acc * e.conf, 1);
        const barY = height * 0.92;
        const barX = width * 0.12;
        const barW = width * 0.76;
        const barProgress = easeOutCubic(Math.min(T * 0.008, 1));

        // Track
        ctx.fillStyle = rgb(CC.bd, 0.35);
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, 5, 3);
        ctx.fill();

        // Fill
        ctx.fillStyle = rgb(CC.orange, 0.6);
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * compound * barProgress, 5, 3);
        ctx.fill();

        // Right label
        ctx.font = "bold 12px 'JetBrains Mono', monospace";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgb(CC.orange, 0.85);
        ctx.fillText(
          `${Math.round(compound * 100)}% compound confidence`,
          barX + barW * compound * barProgress + 10,
          barY + 2,
        );

        // Left formula
        const formula = iEdges.map(e => e.conf.toFixed(2)).join(' × ');
        ctx.textAlign = 'right';
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillStyle = rgb(CC.t4, 0.6);
        ctx.fillText(formula, barX - 6, barY + 2);
      }

      drawScanline(ctx, width, height, T, 0.012);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      parts.current = [];
    };
  }, [iNodes, iEdges, width, height, selectedEntity]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas
        ref={canvasRef}
        style={{ width, height, display: 'block', borderRadius: 8 }}
        role="img"
        aria-label="causal flow diagram"
      />
      <CanvasTooltip {...tooltip} parentW={width} parentH={height} />
    </div>
  );
}
