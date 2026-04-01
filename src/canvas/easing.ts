/**
 * Easing functions and animation utilities for canvas visualizations.
 * Ported from enterprise-brain/src/canvas/easing.js
 */

export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

export const easeOutQuart = (t: number): number => 1 - (1 - t) ** 4;

export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - 2 ** (-10 * t);

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

export const easeOutBack = (t: number): number => {
  const c = 1.70158;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};

/** Damped sine pulse — decays toward zero over time */
export const dampedPulse = (T: number, freq = 0.04, decay = 0.001): number =>
  Math.sin(T * freq) * Math.exp(-Math.min(T * decay, 4));

/** Smooth looping pulse (no decay) */
export const smoothPulse = (T: number, freq = 0.04, amplitude = 1): number => {
  const s = Math.sin(T * freq);
  return s * s * Math.sign(s) * amplitude;
};

/**
 * Returns eased progress for item `i` of `n` total, given global progress 0–1.
 * Items start with a staggered delay from each other.
 */
export const stagger = (
  progress: number,
  i: number,
  n: number,
  ease: (t: number) => number = easeOutCubic,
): number => {
  const staggerDelay = Math.min(0.06, 0.5 / n);
  const itemStart = i * staggerDelay;
  const itemDuration = 1 - (n - 1) * staggerDelay;
  const localT = Math.max(0, Math.min((progress - itemStart) / itemDuration, 1));
  return ease(localT);
};

/**
 * Smoothly animates hover progress values toward their targets (0 or 1).
 * Call once per frame inside the draw loop.
 */
export function tickHoverProgress(
  hoverMap: Map<string, number>,
  hoveredId: string | null,
  speed = 0.12,
): void {
  hoverMap.forEach((val, id) => {
    const target = id === hoveredId ? 1 : 0;
    const next = val + (target - val) * speed;
    if (Math.abs(next - target) < 0.005) {
      if (target === 0) hoverMap.delete(id);
      else hoverMap.set(id, 1);
    } else {
      hoverMap.set(id, next);
    }
  });
  if (hoveredId && !hoverMap.has(hoveredId)) {
    hoverMap.set(hoveredId, 0);
  }
}
