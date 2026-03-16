import { useState, useEffect, useRef } from 'react';

export function useStagger(count, baseDelay, staggerMs, active = false) {
  const [visible, setVisible] = useState(() => new Array(count).fill(false));
  const timersRef = useRef([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!active) {
      setVisible(new Array(count).fill(false));
      return;
    }

    const timers = [];
    for (let i = 0; i < count; i++) {
      const t = setTimeout(() => {
        setVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, baseDelay + i * staggerMs);
      timers.push(t);
    }
    timersRef.current = timers;

    return () => timers.forEach(clearTimeout);
  }, [count, baseDelay, staggerMs, active]);

  return visible;
}
