import { useState, useEffect, useRef } from 'react';
import { easeOutCubic } from '../canvas/easing';

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Returns { displayValue: string, rawValue: number, isComplete: boolean }.
 *
 * @param {number} target - Final value
 * @param {number} duration - Animation duration in ms
 * @param {boolean} active - Starts animation when true
 * @param {object} opts - { decimals, prefix, suffix, easing }
 */
export default function useAnimatedCounter(target, duration = 600, active = false, opts = {}) {
  const { decimals = 0, prefix = '', suffix = '', easing = easeOutCubic } = opts;
  const [rawValue, setRawValue] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    // Respect reduced motion — jump to final value
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRawValue(target);
      setIsComplete(true);
      return;
    }

    startRef.current = null;
    setIsComplete(false);

    const tick = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = easing(t);
      setRawValue(eased * target);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setRawValue(target);
        setIsComplete(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, target, duration, easing]);

  const displayValue = `${prefix}${rawValue.toFixed(decimals)}${suffix}`;

  return { displayValue, rawValue, isComplete };
}
