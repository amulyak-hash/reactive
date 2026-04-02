import { useLayoutEffect, useRef } from 'react';
import type { TooltipContent, TooltipState } from './useCanvasInteraction';
import { CC } from './canvasUtils';

interface CanvasTooltipProps extends TooltipState {
  parentW?: number;
  parentH?: number;
}


/**
 * DOM-based tooltip overlay for canvas visualizations.
 * Render as a sibling inside a position:relative wrapper around the canvas.
 * Dynamic position is applied imperatively via useLayoutEffect to avoid
 * inline style props while still updating each frame.
 */
export function CanvasTooltip({ visible, x, y, content, parentW }: CanvasTooltipProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const elW = el.offsetWidth;
    let tx = x - elW / 2;
    let ty = y - 58;
    if (tx < 4) tx = 4;
    if (tx + elW > (parentW ?? 400) - 4) tx = (parentW ?? 400) - elW - 4;
    if (ty < 4) ty = y + 16;

    el.style.transform = `translate(${tx}px, ${ty}px)`;
    el.style.opacity = visible ? '1' : '0';

    const accent =
      content && typeof content === 'object' && (content as TooltipContent).color
        ? (content as TooltipContent).color
        : CC.blue;
    el.style.setProperty('--tooltip-accent', accent ?? CC.blue);
  }, [visible, x, y, parentW, content]);

  if (!content) return null;

  const isObj = typeof content === 'object';
  const label = isObj ? (content as TooltipContent).label : null;
  const value = isObj ? (content as TooltipContent).value : (content as string);
  const sublabel = isObj ? (content as TooltipContent).sublabel : null;

  return (
    <div
      ref={rootRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        minWidth: 80,
        pointerEvents: 'none',
        background: CC.sf,
        border: `1px solid ${CC.bd}`,
        borderLeft: '2px solid var(--tooltip-accent)',
        borderRadius: 6,
        padding: '6px 10px',
        opacity: 0,
        transition: 'opacity 0.15s ease',
        zIndex: 20,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {label && (
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
            color: CC.t3,
            marginBottom: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          fontSize: 11,
          color: CC.t1,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div
          style={{
            fontSize: 9,
            color: 'var(--tooltip-accent)',
            marginTop: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}
