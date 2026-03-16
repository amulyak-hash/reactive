import { useEffect, useRef } from 'react';
import { easeOutCubic } from '../canvas/easing';

/**
 * Canvas animation loop hook with DPR scaling and eased progress.
 *
 * @param {React.RefObject} canvasRef
 * @param {number} width   - logical width
 * @param {number} height  - logical height
 * @param {Function} drawFn - (ctx, progress, frameNumber) => void
 * @param {boolean} animate - whether to run entrance animation
 * @param {object} opts     - { easing, durationFrames }
 */
export function useCanvasLoop(canvasRef, width, height, drawFn, animate = true, opts = {}) {
  const frameRef = useRef(0);
  const {
    easing = easeOutCubic,
    durationFrames = 48, // ~800ms at 60fps — snappy but readable
  } = opts;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;

    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let raf;
    frameRef.current = 0;

    const draw = () => {
      frameRef.current++;
      const T = frameRef.current;
      ctx.clearRect(0, 0, width, height);
      const rawProgress = animate ? Math.min(T / durationFrames, 1) : 1;
      const progress = easing(rawProgress);

      drawFn(ctx, progress, T);

      if (rawProgress < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        const drawStatic = () => {
          frameRef.current++;
          ctx.clearRect(0, 0, width, height);
          drawFn(ctx, 1, frameRef.current);
          raf = requestAnimationFrame(drawStatic);
        };
        raf = requestAnimationFrame(drawStatic);
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [width, height, animate]);
}
