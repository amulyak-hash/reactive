import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../theme/tokens';
import { ZONES, STORIES, COG_STYLES, STORY_ADAPTIVE_CONFIG, STORY_ANNOTATIONS, COG_AUTOPLAY_CONFIG } from '../data/tataSteel';
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
const IDLE_RESUME_DELAY = 3000;
const BOTTOM_PANEL_HEIGHT = 180; // px reserved for narrative + lens tabs
const TOP_BAR_HEIGHT = 44;

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
  const activeArchetype = useStore(s => s.activeArchetype);
  const activeCogStyle = useStore(s => s.activeCogStyle);
  const cluster = activeCogStyle ? COG_STYLES[activeCogStyle].cluster : null;
  const autoConfig = activeCogStyle ? COG_AUTOPLAY_CONFIG[activeCogStyle] : null;
  const adaptiveConfig = cluster ? STORY_ADAPTIVE_CONFIG[cluster] : null;
  const shouldAutoplay = autoConfig?.autoplay ?? true;

  const [sz, setSz] = useState({ w: 900, h: 650 });
  const containerRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const renderedLensRef = useRef(activeLens);
  const dissolveTimer = useRef(null);
  const [renderedLens, setRenderedLens] = useState(activeLens);

  // Autoplay state — initial value from cogStyle config
  const initialAutoplay = activeCogStyle ? (COG_AUTOPLAY_CONFIG[activeCogStyle]?.autoplay ?? true) : true;
  const [autoPlaying, setAutoPlaying] = useState(initialAutoplay);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [prevStory, setPrevStory] = useState(story);
  const idleTimerRef = useRef(null);

  // Narrative transition key for animations
  const [narrativeKey, setNarrativeKey] = useState(0);

  // Reset autoplay when story changes
  if (prevStory !== story) {
    setPrevStory(story);
    setRenderedLens(activeLens); // sync with combo-aware default lens (#4)
    renderedLensRef.current = activeLens;
    setAutoPlaying(shouldAutoplay); // #10 autoplay config
    setShowEndOverlay(false);
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
    };
  }, []);

  // AI context
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

  // Bump narrative animation key when step changes
  useEffect(() => {
    setNarrativeKey(k => k + 1);
  }, [storyStep, renderedLens]);

  // Keyboard navigation
  // Keyboard navigation — skip when user is in an input field or the AI panel
  useEffect(() => {
    const handleKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        const { storyStep: step } = useStore.getState();
        if (step < displayStepsLenRef.current - 1) {
          handleNavPause();
          setStoryStep(step + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const { storyStep: step } = useStore.getState();
        if (step > 0) {
          handleNavPause();
          setStoryStep(step - 1);
        }
      } else if (e.key === 'Escape') {
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Pause from nav buttons with idle resume (only explicit clicks pause autoplay)
  // #2 fix: Don't re-enable autoplay for manual styles
  const shouldAutoplayRef = useRef(shouldAutoplay);
  shouldAutoplayRef.current = shouldAutoplay;
  const handleNavPause = useCallback(() => {
    setAutoPlaying(false);
    setShowEndOverlay(false);
    clearTimeout(idleTimerRef.current);
    if (!shouldAutoplayRef.current) return; // manual style — stay paused
    idleTimerRef.current = setTimeout(() => {
      const { storyStep: step } = useStore.getState();
      if (step < displayStepsLenRef.current - 1) setAutoPlaying(true);
    }, IDLE_RESUME_DELAY);
  }, []);

  // Lens dissolve
  const handleLensSwitch = (newLens) => {
    setLens(newLens);
    setAutoPlaying(shouldAutoplay); // #2 fix: respect cogStyle autoplay setting
    setShowEndOverlay(false);
    if (canvasWrapRef.current) canvasWrapRef.current.style.opacity = '0';
    clearTimeout(dissolveTimer.current);
    dissolveTimer.current = setTimeout(() => {
      setRenderedLens(newLens);
      renderedLensRef.current = newLens;
      if (canvasWrapRef.current) canvasWrapRef.current.style.opacity = '1';
    }, 150);
  };

  const handleExit = () => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(dissolveTimer.current);
    setAutoPlaying(false);
    exitStory();
  };

  // Resolve data
  const card = story ? CARD_REGISTRY[story] : null;
  const zone = ZONES.find(z => z.id === story);

  const label = card?.label || zone?.storyTitle || '';
  const code = card?.code || zone?.code || '';
  const accent = card?.accent || zone?.accent || C.blue;
  const lenses = card?.lenses || [];

  let steps;
  if (card?.lenses?.[renderedLens]?.stories) {
    steps = card.lenses[renderedLens].stories;
  } else if (zone) {
    steps = STORIES[story] || [];
  } else {
    steps = [];
  }

  // #9: Adaptive step mapping — source indices for compressed display
  const sourceIndices = adaptiveConfig?.compressSteps ? adaptiveConfig.sourceIndices : null;
  const displaySteps = sourceIndices ? sourceIndices.map(i => steps[i]) : steps;
  const toSourceIndex = (displayIdx) => sourceIndices ? (sourceIndices[displayIdx] ?? displayIdx) : displayIdx;

  // #10: Autoplay interval from cogStyle config (interval: 0 means no autoplay, so use fallback only for positive values)
  const autoplayInterval = (autoConfig?.interval && autoConfig.interval > 0) ? autoConfig.interval / 1000 : AUTOPLAY_INTERVAL;

  // Auto-advance — uses displaySteps length for compressed step support
  const displayStepsLenRef = useRef(displaySteps.length);
  displayStepsLenRef.current = displaySteps.length;
  const handleAutoAdvance = useCallback(() => {
    const { storyStep: step } = useStore.getState();
    if (step < displayStepsLenRef.current - 1) {
      setStoryStep(step + 1);
    } else {
      setAutoPlaying(false);
      setShowEndOverlay(true);
    }
  }, [setStoryStep]);

  const vizArray = StoryVizMap[story];
  const StoryViz = vizArray?.[renderedLens] || null;
  const canvasH = sz.h - TOP_BAR_HEIGHT - BOTTOM_PANEL_HEIGHT;

  if (!story || (!card && !zone)) return null;

  const accentRGB = {
    r: parseInt(accent.replace('#', '').substring(0, 2), 16),
    g: parseInt(accent.replace('#', '').substring(2, 4), 16),
    b: parseInt(accent.replace('#', '').substring(4, 6), 16),
  };

  return (
    <div
      ref={containerRef}
      data-archetype={activeArchetype || undefined}
      data-cogstyle={activeCogStyle || undefined}
      data-cogcluster={cluster || undefined}
      style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: C.bg }}
    >
      {/* ─── Minimal Top Bar ─── */}
      <div style={{
        height: TOP_BAR_HEIGHT,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        borderBottom: `1px solid ${rgb(C.bd, 0.4)}`,
        background: `linear-gradient(to bottom, ${rgb(C.bgL, 0.8)}, ${rgb(C.bg, 0.9)})`,
      }}>
        <button onClick={handleExit} style={{
          padding: '5px 10px',
          background: 'transparent',
          border: `1px solid ${rgb(C.bd, 0.6)}`,
          borderRadius: 6,
          color: C.t3,
          fontSize: 11,
          cursor: 'pointer',
          fontFamily: FONT_SANS,
          fontWeight: 500,
          transition: 'all .15s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = C.t1; e.currentTarget.style.borderColor = C.t3; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = rgb(C.bd, 0.6); }}
        >
          ← Back
        </button>

        <div style={{ width: 1, height: 16, background: rgb(C.bd, 0.4) }} />

        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT_SANS, color: C.t1, letterSpacing: '-0.01em' }}>
          {label}
        </span>
        <span style={{
          fontSize: 9, padding: '2px 7px', borderRadius: 4,
          background: rgb(accent, .08), color: accent,
          fontWeight: 600, fontFamily: FONT_MONO,
          border: `1px solid ${rgb(accent, .15)}`,
        }}>
          {code}
        </span>

        <div style={{ flex: 1 }} />

        {/* Keyboard hint */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <kbd style={kbdStyle}>←</kbd>
          <kbd style={kbdStyle}>→</kbd>
          <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: C.t4, marginLeft: 2 }}>navigate</span>
        </div>
      </div>

      {/* ─── Canvas Visualization ─── */}
      <div
        ref={canvasWrapRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          opacity: 1,
          transition: 'opacity 150ms ease',
          position: 'relative',
        }}
      >
        {StoryViz
          ? <StoryViz w={sz.w} h={Math.max(canvasH, 200)} step={toSourceIndex(storyStep)} cogCluster={cluster} />
          : <PlaceholderCanvas w={sz.w} h={Math.max(canvasH, 200)} lensName={lenses[renderedLens]?.name} />
        }

        {/* End-of-story overlay */}
        {showEndOverlay && lenses.length > 1 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
            background: 'rgba(7,11,18,0.7)',
            backdropFilter: 'blur(8px)',
            animation: 'endFadeIn 0.4s ease forwards',
            zIndex: 10,
          }}>
            <div style={{
              fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600,
              color: C.t3, textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              Story complete — explore another lens
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {lenses.map((lens, i) => {
                if (i === activeLens) return null;
                return (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); handleLensSwitch(i); }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = rgb(accent, 0.5);
                      e.currentTarget.style.background = rgb(accent, 0.08);
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = rgb(C.bd, 0.6);
                      e.currentTarget.style.background = rgb(C.sf, 0.9);
                    }}
                    style={{
                      width: 160, padding: '20px 16px',
                      background: rgb(C.sf, 0.9),
                      border: `1px solid ${rgb(C.bd, 0.6)}`,
                      borderRadius: 12, cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                      animation: `lensInvite 2s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8, color: accent }}>
                      {ICONS[lens.icon] || '●'}
                    </div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: C.t1 }}>
                      {lens.name}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.t3, marginTop: 4 }}>
                      {lens.stories.length} steps
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom Panel: Progress + Narrative + Lens Tabs ─── */}
      <div style={{
        flexShrink: 0,
        borderTop: `1px solid ${rgb(C.bd, 0.4)}`,
        background: `linear-gradient(to top, ${C.bg}, ${rgb(C.bgL, 0.6)})`,
      }}>

        {/* Progress Track */}
        <div style={{
          padding: '12px 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Track — #6: scrubberScale adjusts height */}
          <div
            style={{
              flex: 1,
              height: 4 * (autoConfig?.scrubberScale || 1),
              background: rgb(C.bd, 0.4),
              borderRadius: 2,
              position: 'relative',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              const idx = Math.round(pct * (displaySteps.length - 1));
              handleNavPause();
              setStoryStep(Math.max(0, Math.min(displaySteps.length - 1, idx)));
            }}
          >
            {/* Filled portion */}
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              width: displaySteps.length > 1 ? `${(storyStep / (displaySteps.length - 1)) * 100}%` : '0%',
              background: accent,
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }} />

            {/* Autoplay fill animation on current segment */}
            {autoPlaying && storyStep < displaySteps.length - 1 && (
              <div
                key={`fill-${renderedLens}-${storyStep}-${autoPlaying}`}
                onAnimationEnd={handleAutoAdvance}
                style={{
                  position: 'absolute',
                  left: displaySteps.length > 1 ? `${(storyStep / (displaySteps.length - 1)) * 100}%` : '0%',
                  top: 0,
                  height: '100%',
                  width: displaySteps.length > 1 ? `${(1 / (displaySteps.length - 1)) * 100}%` : '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  height: '100%',
                  background: rgb(accent, 0.5),
                  borderRadius: 2,
                  animation: `trackFill ${autoplayInterval}s linear forwards`,
                }} />
              </div>
            )}

            {/* Marker dot */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: displaySteps.length > 1 ? `${(storyStep / (displaySteps.length - 1)) * 100}%` : '0%',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: accent,
              border: `2px solid ${C.bg}`,
              transform: 'translate(-50%, -50%)',
              transition: 'left 0.3s ease',
              boxShadow: `0 0 8px ${rgb(accent, 0.4)}`,
              '--accent-r': accentRGB.r,
              '--accent-g': accentRGB.g,
              '--accent-b': accentRGB.b,
              animation: showEndOverlay ? 'progressPulse 1.5s ease-in-out infinite' : 'none',
              zIndex: 2,
            }} />

            {/* Step tick marks */}
            {displaySteps.map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: displaySteps.length > 1 ? `${(i / (displaySteps.length - 1)) * 100}%` : '0%',
                  top: '50%',
                  width: 2,
                  height: 8,
                  background: i <= storyStep ? accent : rgb(C.bd, 0.6),
                  borderRadius: 1,
                  transform: 'translate(-50%, -50%)',
                  transition: 'background 0.3s ease',
                  zIndex: 1,
                }}
              />
            ))}
          </div>

          {/* Step counter */}
          <span style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: C.t3,
            minWidth: 42,
            textAlign: 'right',
          }}>
            {storyStep + 1} / {displaySteps.length}
          </span>
        </div>

        {/* Narrative Content */}
        <div style={{
          padding: '14px 24px 12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          minHeight: 80,
        }}>
          {/* Left: Accent bar + text */}
          <div style={{
            width: 3, minHeight: 44, background: accent,
            borderRadius: 2, flexShrink: 0, marginTop: 2,
          }} />

          <div
            key={narrativeKey}
            style={{
              flex: 1,
              animation: autoConfig?.showFullText ? 'none' : 'narrativeEnter 0.35s ease forwards',
            }}
          >
            <div style={{
              fontSize: 16,
              fontWeight: 400,
              color: C.t1,
              fontFamily: FONT_SERIF,
              lineHeight: 1.3,
              marginBottom: 4,
            }}>
              {displaySteps[storyStep]?.t}
            </div>
            <div style={{
              fontSize: 12,
              color: C.t2,
              lineHeight: 1.6,
              fontFamily: FONT_SANS,
            }}>
              {displaySteps[storyStep]?.c}
            </div>
            {/* #9: Story annotation */}
            {adaptiveConfig?.annotationMode && STORY_ANNOTATIONS[story]?.[adaptiveConfig.annotationMode] && (
              <div className="story-annotation">
                {adaptiveConfig.annotationMode === 'evidence' ? '⊕ ' : adaptiveConfig.annotationMode === 'context' ? '⇄ ' : '👥 '}
                {STORY_ANNOTATIONS[story][adaptiveConfig.annotationMode]}
              </div>
            )}
          </div>

          {/* Right: Nav arrows */}
          <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginTop: 2 }}>
            <NavButton
              label="←"
              ariaLabel="Previous step"
              disabled={storyStep === 0}
              accent={accent}
              onClick={() => { handleNavPause(); setStoryStep(Math.max(0, storyStep - 1)); }}
            />
            <NavButton
              label="→"
              ariaLabel="Next step"
              disabled={storyStep >= displaySteps.length - 1}
              accent={accent}
              primary={storyStep < displaySteps.length - 1}
              onClick={() => { handleNavPause(); setStoryStep(Math.min(displaySteps.length - 1, storyStep + 1)); }}
            />
          </div>
        </div>

        {/* Lens Tabs */}
        {lenses.length > 1 && (
          <div style={{
            padding: '0 24px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              fontFamily: FONT_MONO,
              fontSize: 8,
              color: C.t4,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Lens
            </span>
            <LensSelector
              lenses={lenses}
              activeLens={activeLens}
              onSelect={handleLensSwitch}
              accent={accent}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Helper Components ─── */

function NavButton({ label, ariaLabel, disabled, accent, primary, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: `1px solid ${disabled ? rgb(C.bd, 0.3) : primary && hov ? rgb(accent, 0.5) : rgb(C.bd, 0.6)}`,
        background: disabled ? 'transparent' : primary && hov ? rgb(accent, 0.1) : hov ? rgb(C.sf, 0.8) : 'transparent',
        color: disabled ? C.t4 : primary ? C.t1 : C.t2,
        fontSize: 14,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: FONT_SANS,
        fontWeight: 600,
        transition: 'all .15s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      {label}
    </button>
  );
}

/* ─── Helpers ─── */

const kbdStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 18,
  borderRadius: 3,
  border: `1px solid ${C.bd}`,
  background: C.sf,
  fontFamily: FONT_MONO,
  fontSize: 9,
  color: C.t3,
};
