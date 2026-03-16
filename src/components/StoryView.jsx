import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../theme/tokens';
import { ZONES, STORIES } from '../data/tataSteel';
import { CARD_REGISTRY } from '../data/tataSteel';
import LensSelector from './LensSelector';
import { ICONS } from './lensIcons';
import CausalCanvas from '../canvas/CausalCanvas';
import AnomalyCanvas from '../canvas/AnomalyCanvas';
import AdaptiveCanvas from '../canvas/AdaptiveCanvas';
import ConfidenceCanvas from '../canvas/ConfidenceCanvas';
import JournalCanvas from '../canvas/JournalCanvas';
import IncidentArchCanvas from '../canvas/downtime/IncidentArchCanvas';
import PatternWeaveCanvas from '../canvas/downtime/PatternWeaveCanvas';
import CostRiverCanvas from '../canvas/downtime/CostRiverCanvas';
import ShiftReplayCanvas from '../canvas/prod_trend/ShiftReplayCanvas';
import PressureMapCanvas from '../canvas/prod_trend/PressureMapCanvas';
import GapAnatomyCanvas from '../canvas/prod_trend/GapAnatomyCanvas';
import BreathingFactoryCanvas from '../canvas/machine_util/BreathingFactoryCanvas';
import ShadowShiftCanvas from '../canvas/machine_util/ShadowShiftCanvas';
import DominoCascadeCanvas from '../canvas/machine_util/DominoCascadeCanvas';
import DefectDnaCanvas from '../canvas/defect_rate/DefectDnaCanvas';
import UpstreamTraceCanvas from '../canvas/defect_rate/UpstreamTraceCanvas';
import BatchFingerprintCanvas from '../canvas/defect_rate/BatchFingerprintCanvas';
import RippleForwardCanvas from '../canvas/supplier/RippleForwardCanvas';
import TrustErosionCanvas from '../canvas/supplier/TrustErosionCanvas';
import AlternativesMapCanvas from '../canvas/supplier/AlternativesMapCanvas';
import TheRaceCanvas from '../canvas/plant_perf/TheRaceCanvas';
import BalanceSheetCanvas from '../canvas/plant_perf/BalanceSheetCanvas';
import ConstellationCanvas from '../canvas/plant_perf/ConstellationCanvas';
import MaterialJourneyCanvas from '../canvas/factory_map/MaterialJourneyCanvas';
import BottleneckPulseCanvas from '../canvas/factory_map/BottleneckPulseCanvas';
import TimeMachineCanvas from '../canvas/factory_map/TimeMachineCanvas';
import RhythmStripCanvas from '../canvas/output_line/RhythmStripCanvas';
import CapacityGlacierCanvas from '../canvas/output_line/CapacityGlacierCanvas';
import HandoffChainCanvas from '../canvas/output_line/HandoffChainCanvas';
import FaultTreeCanvas from '../canvas/fault_count/FaultTreeCanvas';
import SeveritySpectrumCanvas from '../canvas/fault_count/SeveritySpectrumCanvas';
import RepeatOffendersCanvas from '../canvas/fault_count/RepeatOffendersCanvas';
import VulnerabilityScanCanvas from '../canvas/material_dep/VulnerabilityScanCanvas';
import CostCurrentCanvas from '../canvas/material_dep/CostCurrentCanvas';
import QualityInheritanceCanvas from '../canvas/material_dep/QualityInheritanceCanvas';
import HeatProfileCanvas from '../canvas/bf/HeatProfileCanvas';
import FeedVarianceCanvas from '../canvas/bf/FeedVarianceCanvas';
import SignalDecayCanvas from '../canvas/sms/SignalDecayCanvas';
import CorrelationWebCanvas from '../canvas/sms/CorrelationWebCanvas';
import ResponseMapCanvas from '../canvas/cc/ResponseMapCanvas';
import PriorityStackCanvas from '../canvas/cc/PriorityStackCanvas';
import DecisionGridCanvas from '../canvas/rm/DecisionGridCanvas';
import CalibrationArcCanvas from '../canvas/rm/CalibrationArcCanvas';
import OutcomeMapCanvas from '../canvas/ql/OutcomeMapCanvas';
import FrequencyDialCanvas from '../canvas/ql/FrequencyDialCanvas';

// Map: storyId → [Lens0Component, Lens1Component, Lens2Component]
const StoryVizMap = {
  bf:          [CausalCanvas, HeatProfileCanvas, FeedVarianceCanvas],
  sms:         [AnomalyCanvas, SignalDecayCanvas, CorrelationWebCanvas],
  cc:          [AdaptiveCanvas, ResponseMapCanvas, PriorityStackCanvas],
  rm:          [ConfidenceCanvas, DecisionGridCanvas, CalibrationArcCanvas],
  ql:          [JournalCanvas, OutcomeMapCanvas, FrequencyDialCanvas],
  downtime:    [IncidentArchCanvas, PatternWeaveCanvas, CostRiverCanvas],
  prod_trend:  [ShiftReplayCanvas, PressureMapCanvas, GapAnatomyCanvas],
  machine_util:[BreathingFactoryCanvas, ShadowShiftCanvas, DominoCascadeCanvas],
  defect_rate: [DefectDnaCanvas, UpstreamTraceCanvas, BatchFingerprintCanvas],
  supplier:    [RippleForwardCanvas, TrustErosionCanvas, AlternativesMapCanvas],
  plant_perf:  [TheRaceCanvas, BalanceSheetCanvas, ConstellationCanvas],
  factory_map:  [MaterialJourneyCanvas, BottleneckPulseCanvas, TimeMachineCanvas],
  output_line:  [RhythmStripCanvas, CapacityGlacierCanvas, HandoffChainCanvas],
  fault_count:  [FaultTreeCanvas, SeveritySpectrumCanvas, RepeatOffendersCanvas],
  material_dep: [VulnerabilityScanCanvas, CostCurrentCanvas, QualityInheritanceCanvas],
};

const AUTOPLAY_INTERVAL = 5; // seconds per step
const IDLE_RESUME_DELAY = 3000; // ms before auto-resume after interaction

function PlaceholderCanvas({ w, h, lensName }) {
  return (
    <div style={{
      width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: C.bgL, borderRadius: 8,
    }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.t4 }}>
        {lensName || 'Coming soon'}
      </span>
    </div>
  );
}

export default function StoryView() {
  const story = useStore(s => s.story);
  const storyStep = useStore(s => s.storyStep);
  const setStoryStep = useStore(s => s.setStoryStep);
  const exitStory = useStore(s => s.exitStory);
  const activeLens = useStore(s => s.activeLens);
  const setLens = useStore(s => s.setLens);
  const setAIContext = useStore(s => s.setAIContext);

  const [sz, setSz] = useState({ w: 900, h: 650 });
  const containerRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const renderedLensRef = useRef(activeLens);
  const dissolveTimer = useRef(null);
  const [renderedLens, setRenderedLens] = useState(activeLens);

  // Autoplay state — keyed off story so entering a new story resets
  const [autoPlaying, setAutoPlaying] = useState(true);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [prevStory, setPrevStory] = useState(story);
  const [graceEpoch, setGraceEpoch] = useState(0);
  const idleTimerRef = useRef(null);
  const graceTimerRef = useRef(null);
  const inGraceRef = useRef(true);

  // Reset autoplay when story changes (state-derived, no effect needed)
  if (prevStory !== story) {
    setPrevStory(story);
    setAutoPlaying(true);
    setShowEndOverlay(false);
    setGraceEpoch(e => e + 1);
  }

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setSz({ w: r.width, h: r.height });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      clearTimeout(idleTimerRef.current);
      clearTimeout(graceTimerRef.current);
    };
  }, []);

  // Grace period: ignore hover-pause for 800ms after mount/story change
  useEffect(() => {
    inGraceRef.current = true;
    clearTimeout(graceTimerRef.current);
    graceTimerRef.current = setTimeout(() => { inGraceRef.current = false; }, 800);
  }, [graceEpoch]);

  // Set AI context when story or lens changes
  useEffect(() => {
    if (!story) return;
    const c = CARD_REGISTRY[story];
    const z = ZONES.find(zn => zn.id === story);
    setAIContext({
      type: 'story',
      id: story,
      layer: 'story',
      label: c?.label || z?.storyTitle || story,
      accent: c?.accent || z?.accent || C.blue,
    });
  }, [story, activeLens, setAIContext]);

  // Pause autoplay on canvas hover (respects mount grace period)
  const handleInteraction = useCallback(() => {
    if (inGraceRef.current) return; // skip during grace period after mount/story change
    setAutoPlaying(false);
    setShowEndOverlay(false);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  // Pause autoplay from nav buttons (no grace period, 3s idle resume)
  const handleNavPause = useCallback(() => {
    setAutoPlaying(false);
    setShowEndOverlay(false);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      const { storyStep: step, activeLens: lens, story: s } = useStore.getState();
      const c = s ? CARD_REGISTRY[s] : null;
      const z = ZONES.find(z => z.id === s);
      let stepsLen = 0;
      if (c?.lenses?.[lens]?.stories) stepsLen = c.lenses[lens].stories.length;
      else if (z) stepsLen = (STORIES[s] || []).length;
      if (step < stepsLen - 1) setAutoPlaying(true);
    }, IDLE_RESUME_DELAY);
  }, []);

  // Resume autoplay when mouse leaves canvas area (skip if nav-pause timer is pending)
  const handleCanvasLeave = useCallback(() => {
    if (idleTimerRef.current) return; // nav button set a timer — don't override
    const { storyStep: step, activeLens: lens, story: s } = useStore.getState();
    const c = s ? CARD_REGISTRY[s] : null;
    const z = ZONES.find(zn => zn.id === s);
    let stepsLen = 0;
    if (c?.lenses?.[lens]?.stories) stepsLen = c.lenses[lens].stories.length;
    else if (z) stepsLen = (STORIES[s] || []).length;
    if (step < stepsLen - 1) setAutoPlaying(true);
  }, []);

  // Handle lens dissolve via DOM manipulation (avoids setState-in-effect lint)
  const handleLensSwitch = (newLens) => {
    setLens(newLens);
    setAutoPlaying(true);
    setShowEndOverlay(false);
    if (canvasWrapRef.current) canvasWrapRef.current.style.opacity = '0';
    clearTimeout(dissolveTimer.current);
    dissolveTimer.current = setTimeout(() => {
      setRenderedLens(newLens);
      renderedLensRef.current = newLens;
      if (canvasWrapRef.current) canvasWrapRef.current.style.opacity = '1';
    }, 150);
  };

  // Auto-advance when dot fill animation ends
  const handleAutoAdvance = useCallback(() => {
    const { storyStep: step, story: s, activeLens: lens } = useStore.getState();
    const c = s ? CARD_REGISTRY[s] : null;
    const z = ZONES.find(z => z.id === s);
    let stepsLen = 0;
    if (c?.lenses?.[lens]?.stories) stepsLen = c.lenses[lens].stories.length;
    else if (z) stepsLen = (STORIES[s] || []).length;

    if (step < stepsLen - 1) {
      setStoryStep(step + 1);
    } else {
      setAutoPlaying(false);
      setShowEndOverlay(true);
    }
  }, [setStoryStep]);

  // Clean exit
  const handleExit = () => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(dissolveTimer.current);
    setAutoPlaying(false);
    exitStory();
  };

  // Resolve card data from CARD_REGISTRY or fallback to ZONES/STORIES
  const card = story ? CARD_REGISTRY[story] : null;
  const zone = ZONES.find(z => z.id === story);

  // Unified data resolution
  const label = card?.label || zone?.storyTitle || '';
  const code = card?.code || zone?.code || '';
  const accent = card?.accent || zone?.accent || C.blue;
  const lenses = card?.lenses || [];

  // Get steps from active lens
  let steps;
  if (card?.lenses?.[renderedLens]?.stories) {
    steps = card.lenses[renderedLens].stories;
  } else if (zone) {
    steps = STORIES[story] || [];
  } else {
    steps = [];
  }

  // Resolve canvas component
  const vizArray = StoryVizMap[story];
  const StoryViz = vizArray?.[renderedLens] || null;

  if (!story || (!card && !zone)) return null;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      {/* Header */}
      <div style={{
        padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0, borderBottom: `1px solid ${C.bd}`, background: C.bgL,
      }}>
        <button onClick={handleExit} style={{
          padding: '5px 12px', background: C.sf, border: `1px solid ${C.bd}`,
          borderRadius: 5, color: C.t2, fontSize: 10, cursor: 'pointer',
          fontFamily: FONT_SANS, fontWeight: 600,
        }}>
          ← Back
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONT_SANS, color: C.t1 }}>
          {label}
        </span>
        <span style={{
          fontSize: 9, padding: '2px 6px', borderRadius: 3,
          background: rgb(accent, .1), color: accent,
          fontWeight: 600, fontFamily: FONT_MONO,
        }}>
          {code}
        </span>

        {/* Lens selector */}
        {lenses.length > 1 && (
          <LensSelector
            lenses={lenses}
            activeLens={activeLens}
            onSelect={handleLensSwitch}
            accent={accent}
          />
        )}

        <div style={{ flex: 1 }} />
        {/* Step dots with animated fill */}
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {steps.map((_, i) => {
            const isActive = i === storyStep;
            const isPast = i < storyStep;
            return (
              <div key={i} style={{
                width: isActive ? 18 : 5, height: 5, borderRadius: 3,
                background: isPast ? accent : C.bd,
                transition: 'width .3s ease, background .3s ease',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {isActive && (
                  <div
                    key={`fill-${renderedLens}-${storyStep}-${autoPlaying}`}
                    onAnimationEnd={handleAutoAdvance}
                    style={{
                      position: 'absolute', left: 0, top: 0,
                      height: '100%',
                      background: accent,
                      borderRadius: 3,
                      animation: autoPlaying
                        ? `dotFill ${AUTOPLAY_INTERVAL}s linear forwards`
                        : 'none',
                      width: autoPlaying ? undefined : '0%',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas visualization */}
      <div
        ref={canvasWrapRef}
        onMouseEnter={handleInteraction}
        onMouseLeave={handleCanvasLeave}
        style={{
          flex: 1, overflow: 'hidden',
          opacity: 1,
          transition: 'opacity 150ms ease',
        }}
      >
        {StoryViz
          ? <StoryViz w={sz.w} h={sz.h - 110} step={storyStep} />
          : <PlaceholderCanvas w={sz.w} h={sz.h - 110} lensName={lenses[renderedLens]?.name} />
        }
      </div>

      {/* End-of-story overlay */}
      {showEndOverlay && lenses.length > 1 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 44, bottom: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24,
          background: 'rgba(7,11,18,0.75)',
          zIndex: 10,
          animation: 'fadeIn 0.4s ease',
        }}>
          {lenses.map((lens, i) => {
            if (i === activeLens) return null;
            return (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLensSwitch(i);
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = rgb(accent, 0.5);
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = C.bd;
                }}
                style={{
                  width: 200, padding: '24px 20px',
                  background: C.sf, border: `1px solid ${C.bd}`,
                  borderRadius: 12, cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {ICONS[lens.icon] || '●'}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.t1 }}>
                  {lens.name}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 10, color: C.t3, marginTop: 4 }}>
                  {lens.stories.length} steps
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom narrative bar */}
      <div style={{
        padding: '10px 20px',
        background: `linear-gradient(to top, ${C.bg}, ${C.bgL})`,
        borderTop: `1px solid ${C.bd}`,
        display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
      }}>
        {/* Accent stripe */}
        <div style={{
          width: 3, height: 28, background: accent,
          borderRadius: 2, flexShrink: 0,
        }} />

        {/* Step text */}
        <div style={{ flex: 1 }} key={`${story}-${renderedLens}-${storyStep}`}>
          <div style={{
            fontSize: 14, fontWeight: 300, color: C.t1,
            fontFamily: FONT_SERIF,
          }}>
            {steps[storyStep]?.t}
          </div>
          <div style={{
            fontSize: 11, color: C.t2, marginTop: 2, lineHeight: 1.55,
            fontFamily: FONT_SANS,
          }}>
            {steps[storyStep]?.c}
          </div>
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => { handleNavPause(); setStoryStep(Math.max(0, storyStep - 1)); }}
            disabled={storyStep === 0}
            style={{
              padding: '7px 16px', background: C.sf,
              border: `1px solid ${C.bd}`, borderRadius: 5,
              color: storyStep === 0 ? C.t4 : C.t2,
              fontSize: 11, cursor: storyStep === 0 ? 'default' : 'pointer',
              fontFamily: FONT_SANS, fontWeight: 600,
            }}
          >
            ← Prev
          </button>
          <button
            onClick={() => { handleNavPause(); setStoryStep(Math.min(steps.length - 1, storyStep + 1)); }}
            disabled={storyStep >= steps.length - 1}
            style={{
              padding: '7px 16px',
              background: storyStep < steps.length - 1 ? rgb(accent, .12) : C.sf,
              border: `1px solid ${storyStep < steps.length - 1 ? rgb(accent, .35) : C.bd}`,
              borderRadius: 5,
              color: storyStep < steps.length - 1 ? C.t1 : C.t4,
              fontSize: 11, cursor: storyStep >= steps.length - 1 ? 'default' : 'pointer',
              fontFamily: FONT_SANS, fontWeight: 600,
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
