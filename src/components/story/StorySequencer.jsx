import { useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Beat1Hook from './Beat1Hook';
import Beat2Fracture from './Beat2Fracture';

export default function StorySequencer({
  currentBeat, sortedContractors, totals, contractorCount,
  leakageRatio, onAdvance, onSequenceComplete,
}) {
  const lastAdvanceRef = useRef(0);
  const sequenceComplete = currentBeat === null;

  const handleAdvance = useCallback(() => {
    const now = Date.now();
    if (now - lastAdvanceRef.current < 300) return; // debounce
    lastAdvanceRef.current = now;
    onAdvance();
  }, [onAdvance]);

  // Click to advance
  const handleClick = useCallback(() => {
    if (sequenceComplete) return;
    handleAdvance();
  }, [sequenceComplete, handleAdvance]);

  // Wheel to advance
  useEffect(() => {
    if (sequenceComplete) return;
    const handler = (e) => {
      if (e.deltaY > 0) {
        e.preventDefault();
        handleAdvance();
      }
    };
    // Use capture to intercept before the page scrolls
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, [sequenceComplete, handleAdvance]);

  return (
    <motion.div
      onClick={handleClick}
      animate={{
        minHeight: sequenceComplete ? 0 : 'calc(100vh - 340px)',
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        cursor: sequenceComplete ? 'default' : 'pointer',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence mode="wait">
        {currentBeat === 1 && (
          <motion.div
            key="beat1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Beat1Hook
              leakageRatio={leakageRatio}
              contractorCount={contractorCount}
            />
          </motion.div>
        )}

        {currentBeat === 2 && (
          <motion.div
            key="beat2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Beat2Fracture
              sortedContractors={sortedContractors}
              onComplete={onSequenceComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient fade — signals scrollable content below */}
      {sequenceComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            height: 40,
            background: 'linear-gradient(180deg, transparent, rgba(7, 11, 18, 0.6))',
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  );
}
