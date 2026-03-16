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
export default function CanvasTooltip({ visible, x, y, content, parentW }) {
  if (!visible || !content) return null;

  const isObj = typeof content === 'object';
  const label = isObj ? content.label : null;
  const value = isObj ? content.value : content;
  const sublabel = isObj ? content.sublabel : null;
  const accentColor = isObj && content.color ? content.color : C.blue;

  // Edge clamping
  const tooltipW = 160;
  const tooltipH = 48;
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
      pointerEvents: 'none',
      background: C.sf,
      border: `1px solid ${rgb(C.bd, 0.6)}`,
      borderRadius: 6,
      padding: '6px 10px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.15s ease',
      zIndex: 20,
      borderLeft: `2px solid ${rgb(accentColor, 0.7)}`,
    }}>
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
    </div>
  );
}
