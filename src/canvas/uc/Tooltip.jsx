export default function Tooltip({ x, y, text }) {
  if (!text) return null;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: 'translate(-50%, -100%)',
      padding: '6px 10px', borderRadius: 8,
      background: 'rgba(10, 16, 29, 0.95)',
      border: '1px solid rgba(109, 123, 156, 0.2)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      fontFamily: '"Satoshi", sans-serif', fontSize: 11, fontWeight: 600,
      color: '#f5f7fb', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
    }}>
      {text}
    </div>
  );
}

export function useCanvasHover(canvasRef, hitAreas, setTooltip) {
  const setup = (canvas) => {
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      let found = null;
      for (const h of hitAreas.current) {
        if (h.type === 'rect') {
          if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) { found = h; break; }
        } else if (h.type === 'circle') {
          const dx = mx - h.cx, dy = my - h.cy;
          if (dx * dx + dy * dy <= h.r * h.r) { found = h; break; }
        }
      }
      setTooltip(found ? { x: found.tx ?? found.cx ?? (h.x + h.w / 2), y: found.ty ?? found.cy ?? h.y, text: found.label } : null);
      return { x: mx, y: my, hit: found };
    };
    const onLeave = () => setTooltip(null);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    return () => { canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseleave', onLeave); };
  };
  return setup;
}
