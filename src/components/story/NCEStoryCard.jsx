import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { USE_CASE_MAP } from '../../data/useCases';
import useScrollReveal from '../../hooks/useScrollReveal';
import StorySequencer from './StorySequencer';
import Beat3Villain from './Beat3Villain';
import Beat4Twist from './Beat4Twist';
import Beat5Clarity from './Beat5Clarity';
import DataDrawer from './DataDrawer';
import StoryThread from './StoryThread';
import { C } from '../../theme/tokens';

export default function NCEStoryCard({ useCaseId, onStoryComplete }) {
  const uc = USE_CASE_MAP[useCaseId];
  const [currentBeat, setCurrentBeat] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visibleBeat, setVisibleBeat] = useState(1);

  // Refs for scroll-driven beats (3-5) to track visibility
  const beat3Ref = useRef(null);
  const beat4Ref = useRef(null);
  const beat5Ref = useRef(null);

  // Track which scroll beat is in view
  useEffect(() => {
    if (currentBeat !== null) return; // only track after sequence completes

    const refs = [
      { ref: beat3Ref, beat: 3 },
      { ref: beat4Ref, beat: 4 },
      { ref: beat5Ref, beat: 5 },
    ];

    const observers = refs.map(({ ref: r, beat }) => {
      if (!r.current) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setVisibleBeat(beat);
        },
        { threshold: 0.4, root: null },
      );
      observer.observe(r.current);
      return observer;
    });

    return () => observers.forEach(o => o?.disconnect());
  }, [currentBeat]);

  // Sync visibleBeat with sequencer beats
  useEffect(() => {
    if (currentBeat !== null) setVisibleBeat(currentBeat);
  }, [currentBeat]);

  const storyData = useMemo(() => {
    if (!uc) return null;
    const { contractors, totals } = uc.vizData;

    const sorted = [...contractors].sort(
      (a, b) => (a.nceVariation / a.originalValue) - (b.nceVariation / b.originalValue),
    );

    const afcons = contractors.find(c => c.name === 'Afcons Infra');
    const ncc = contractors.find(c => c.name === 'NCC Ltd');
    const lt = contractors.find(c => c.name === 'L&T Construction');

    const leakageRatio = Math.round((totals.totalNCE / totals.portfolioValue) * 100);
    const ltRate = lt.nceVariation / lt.originalValue;
    const potentialSaving = Math.round(afcons.nceVariation - (afcons.originalValue * ltRate));

    return { sortedContractors: sorted, contractors, totals, afcons, ncc, lt, leakageRatio, potentialSaving };
  }, [uc]);

  const handleAdvance = useCallback(() => {
    setCurrentBeat(prev => {
      if (prev === 1) return 2;
      if (prev === 2) return null;
      return prev;
    });
  }, []);

  const handleSequenceComplete = useCallback(() => {
    setCurrentBeat(null);
  }, []);

  if (!uc || !storyData) return null;

  const sequenceComplete = currentBeat === null;

  return (
    <div style={{
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      animation: 'fadeIn 300ms ease-out both',
    }}>
      {/* Story Thread navigation */}
      <StoryThread activeBeat={visibleBeat} />

      {/* Story Sequencer — beats 1-2, full screen */}
      <StorySequencer
        currentBeat={currentBeat}
        sortedContractors={storyData.sortedContractors}
        totals={storyData.totals}
        contractorCount={storyData.contractors.length}
        leakageRatio={storyData.leakageRatio}
        onAdvance={handleAdvance}
        onSequenceComplete={handleSequenceComplete}
      />

      {/* Scroll-driven beats 3-5 */}
      {sequenceComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div ref={beat3Ref} style={{ borderTop: `1px solid ${C.line}` }}>
            <Beat3Villain afcons={storyData.afcons} />
          </div>

          <div ref={beat4Ref} style={{ borderTop: `1px solid ${C.line}` }}>
            <Beat4Twist afcons={storyData.afcons} ncc={storyData.ncc} />
          </div>

          <div ref={beat5Ref} style={{ borderTop: `1px solid ${C.line}` }}>
            <Beat5Clarity
              afcons={storyData.afcons}
              lt={storyData.lt}
              potentialSaving={storyData.potentialSaving}
            />
          </div>
        </motion.div>
      )}

      {/* Data Drawer */}
      {sequenceComplete && (
        <div style={{ borderTop: `1px solid ${C.line}` }}>
          <DataDrawer
            useCase={uc}
            contractors={storyData.contractors}
            drawerOpen={drawerOpen}
            onToggle={() => setDrawerOpen(prev => !prev)}
          />
        </div>
      )}

      {/* Sentinel — fires onStoryComplete when user scrolls to the drawer */}
      {sequenceComplete && (
        <StorySentinel onReached={onStoryComplete} />
      )}
    </div>
  );
}

function StorySentinel({ onReached }) {
  const [ref, isRevealed] = useScrollReveal({ threshold: 0.1 });
  const firedRef = useRef(false);

  useEffect(() => {
    if (isRevealed && !firedRef.current && onReached) {
      firedRef.current = true;
      onReached();
    }
  }, [isRevealed, onReached]);

  return <div ref={ref} style={{ height: 1 }} />;
}
