/**
 * Easing functions and animation utilities for canvas visualizations.
 */

// --- Core easing curves ---

export const easeOutCubic = t => 1 - (1 - t) ** 3;

export const easeOutQuart = t => 1 - (1 - t) ** 4;

export const easeOutExpo = t => t === 1 ? 1 : 1 - 2 ** (-10 * t);

export const easeInOutCubic = t =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

export const easeOutBack = t => {
  const c = 1.70158;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};

// --- Pulse / oscillation ---

/** Damped sine pulse — smoother than raw Math.sin, decays over time */
export const dampedPulse = (T, freq = 0.04, decay = 0.001) =>
  Math.sin(T * freq) * Math.exp(-Math.min(T * decay, 4));

/** Smooth looping pulse (no decay) — better-shaped than raw sine */
export const smoothPulse = (T, freq = 0.04, amplitude = 1) => {
  const s = Math.sin(T * freq);
  return s * s * Math.sign(s) * amplitude;
};

// --- Stagger helper ---

/**
 * Returns eased progress for item `i` of `n` total, given global progress 0-1.
 * Items start with a slight delay from each other.
 */
export const stagger = (progress, i, n, ease = easeOutCubic) => {
  const staggerDelay = Math.min(0.06, 0.5 / n);
  const itemStart = i * staggerDelay;
  const itemDuration = 1 - (n - 1) * staggerDelay;
  const localT = Math.max(0, Math.min((progress - itemStart) / itemDuration, 1));
  return ease(localT);
};

// --- Hover progress utility ---

/**
 * Smoothly animate hover progress values toward their targets.
 * Call this each frame inside the draw loop.
 * @param {Map<string, number>} hoverMap - Map of id → current progress (0-1)
 * @param {string|null} hoveredId - Currently hovered element id
 * @param {number} speed - Lerp speed per frame (0.12 = ~200ms at 60fps)
 */
export function tickHoverProgress(hoverMap, hoveredId, speed = 0.12) {
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
