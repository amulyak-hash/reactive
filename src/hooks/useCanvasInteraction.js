import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Canvas interaction hook — mouse tracking, hit-testing, tooltip, click.
 * Uses refs (not state) for mouse position to avoid 60 re-renders/sec.
 *
 * Usage:
 *   const { mouseRef, hoveredRef, tooltip, hitZonesRef } =
 *     useCanvasInteraction(canvasRef, { width, height, onClick });
 *
 *   // In draw function:
 *   hitZonesRef.current = [];
 *   registerHitCircle(hitZonesRef.current, 'point-0', cx, cy, 8, { label: '...' });
 */
export function useCanvasInteraction(canvasRef, { width, height, onClick, enabled = true }) {
  const mouseRef = useRef({ x: -1, y: -1, over: false });
  const hoveredRef = useRef(null);
  const hitZonesRef = useRef([]);
  const debounceRef = useRef(null);

  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });

  const showTooltip = useCallback((x, y, content) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setTooltip({ visible: true, x, y, content });
    }, 30);
  }, []);

  const hideTooltip = useCallback(() => {
    clearTimeout(debounceRef.current);
    setTooltip(prev => prev.visible ? { visible: false, x: prev.x, y: prev.y, content: prev.content } : prev);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      mouseRef.current.x = (e.clientX - rect.left) * scaleX;
      mouseRef.current.y = (e.clientY - rect.top) * scaleY;
      mouseRef.current.over = true;

      // Hit test
      let found = null;
      const zones = hitZonesRef.current;
      for (let i = zones.length - 1; i >= 0; i--) {
        const z = zones[i];
        if (z.test(mouseRef.current.x, mouseRef.current.y)) {
          found = z;
          break;
        }
      }

      const prevId = hoveredRef.current;
      hoveredRef.current = found ? found.id : null;
      canvas.style.cursor = found ? 'pointer' : 'default';

      if (found) {
        showTooltip(
          (e.clientX - rect.left) * (width / rect.width),
          (e.clientY - rect.top) * (height / rect.height),
          found.data
        );
      } else if (prevId) {
        hideTooltip();
      }
    };

    const handleLeave = () => {
      mouseRef.current.x = -1;
      mouseRef.current.y = -1;
      mouseRef.current.over = false;
      if (hoveredRef.current) {
        hoveredRef.current = null;
        canvas.style.cursor = 'default';
        hideTooltip();
      }
    };

    const handleClick = () => {
      if (hoveredRef.current && onClick) {
        const zone = hitZonesRef.current.find(z => z.id === hoveredRef.current);
        if (zone) onClick(zone.id, zone.data);
      }
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
      canvas.removeEventListener('click', handleClick);
      clearTimeout(debounceRef.current);
    };
  }, [canvasRef, width, height, enabled, onClick, showTooltip, hideTooltip]);

  return { mouseRef, hoveredRef, tooltip, showTooltip, hideTooltip, hitZonesRef };
}

// --- Hit zone registration helpers ---

export function registerHitCircle(zones, id, cx, cy, radius, data) {
  zones.push({
    id,
    data,
    test: (mx, my) => (mx - cx) ** 2 + (my - cy) ** 2 <= radius * radius,
  });
}

export function registerHitRect(zones, id, x, y, w, h, data) {
  zones.push({
    id,
    data,
    test: (mx, my) => mx >= x && mx <= x + w && my >= y && my <= y + h,
  });
}
