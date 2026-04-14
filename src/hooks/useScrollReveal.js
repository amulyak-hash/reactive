import { useRef, useState, useEffect } from 'react';

/**
 * Scroll-triggered reveal hook using IntersectionObserver.
 * Returns [ref, isRevealed]. Once revealed, stays revealed (one-shot).
 */
export default function useScrollReveal({ threshold = 0.3, rootMargin = '0px' } = {}) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Respect reduced motion — reveal immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin, root: null },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isRevealed];
}
