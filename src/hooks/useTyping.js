import { useState, useEffect, useRef } from 'react';

export function useTyping(text, speed = 12, active = false) {
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active || !text) {
      setDisplayText('');
      setIsDone(false);
      indexRef.current = 0;
      return;
    }

    indexRef.current = 0;
    setDisplayText('');
    setIsDone(false);

    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayText(text);
        setIsDone(true);
        clearInterval(interval);
      } else {
        setDisplayText(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, active]);

  return { displayText, isDone };
}
