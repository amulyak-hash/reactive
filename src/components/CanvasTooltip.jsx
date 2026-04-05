import { C, rgb, FONT_MONO, FONT_SANS } from '../theme/tokens';

/**
 * DOM-based tooltip overlay for canvas visualizations.
 * Renders as a sibling inside a position:relative wrapper around the canvas.
 *
 * Props:
 *   visible  - boolean
 *   x, y     - position in CSS pixels relative to canvas wrapper
 *   content  - string OR { label, value, sublabel?, color? }
 *   parentW  - canvas wrapper width (for edge clamping)
 *   parentH  - canvas wrapper height
 */
export default function CanvasTooltip({ visible, x, y, content, parentW, actions = null, onAction = null, onTooltipHover = null }) {
  if (!visible || !content) return null;

  const isObj = typeof content === 'object';
  const label = isObj ? content.label : null;
  const value = isObj ? content.value : content;
  const sublabel = isObj ? content.sublabel : null;
  const accentColor = isObj && content.color ? content.color : C.blue;

  // Edge clamping
  const hasActions = Array.isArray(actions) && actions.length > 0 && typeof onAction === 'function';
  const tooltipW = hasActions ? 244 : 160;
  const tooltipH = hasActions ? 84 : 48;
  let tx = x - tooltipW / 2;
  let ty = y - tooltipH - 10;
  if (tx < 4) tx = 4;
  if (tx + tooltipW > parentW - 4) tx = parentW - tooltipW - 4;
  if (ty < 4) ty = y + 16; // flip below if no room above

  return (
    <div style={{
      position: 'absolute',
      left: tx,
      top: ty,
      minWidth: 80,
      maxWidth: tooltipW,
      pointerEvents: hasActions ? 'auto' : 'none',
      background: C.sf,
      border: `1px solid ${rgb(C.bd, 0.6)}`,
      borderRadius: 6,
      padding: '6px 10px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.15s ease',
      zIndex: 20,
      borderLeft: `2px solid ${rgb(accentColor, 0.7)}`,
    }}
      data-canvas-tooltip="true"
      onMouseEnter={() => onTooltipHover?.(true)}
      onMouseLeave={() => onTooltipHover?.(false)}
    >
      {label && (
        <div style={{
          fontFamily: FONT_SANS,
          fontSize: 10,
          color: C.t3,
          marginBottom: 2,
          whiteSpace: 'nowrap',
        }}>
          {label}
        </div>
      )}
      <div style={{
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: C.t1,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        {value}
      </div>
      {sublabel && (
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 9,
          color: rgb(accentColor, 0.7),
          marginTop: 2,
          whiteSpace: 'nowrap',
        }}>
          {sublabel}
        </div>
      )}
      {hasActions && (
        <div style={{
          display: 'flex',
          gap: 14,
          marginTop: 8,
        }}>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={(e) => {
                e.stopPropagation();
                onAction(action.id, content);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 600,
                color: action.color || accentColor,
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
