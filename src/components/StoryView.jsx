import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../theme/tokens';
import { ZONES, STORIES, COG_STYLES, STORY_ADAPTIVE_CONFIG, STORY_ANNOTATIONS, COG_AUTOPLAY_CONFIG } from '../data/tataSteel';
import { CARD_REGISTRY } from '../data/tataSteel';
import { PRODUCTION_HOURS, PRODUCTION_EXPECTED, PRODUCTION_ACTUAL } from '../data/tataSteel';
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
const TOP_BAR_HEIGHT = 64;
const PROD_TREND_LEFT_WIDTH = 344;
const PROD_TREND_RIGHT_WIDTH = 380;
const PROD_TREND_TIMELINE_HEIGHT = 86;
const PROD_TREND_TIMELINE_LABELS = ['06:00', '11:00', '15:00', '18:00'];
const PROD_TREND_BREADCRUMB_HEIGHT = 30;
const ROOT_CAUSE_BREAKDOWN = [
  { label: 'Line 3 downtime', pct: 73, color: C.red },
  { label: 'Material delay', pct: 15, color: C.amber },
  { label: 'Quality holds', pct: 12, color: C.blue },
];

const PROD_TREND_PHASE_COLORS = [
  [C.green, C.amber, C.orange, C.red],
  [C.green, C.amber, C.red, C.red],
  [C.blue, C.amber, C.orange, C.red],
];

function getProdTrendLensStepFromZone(zoneId, renderedLens) {
  if (!zoneId) return null;

  if (renderedLens === 0) {
    const segIndex = Number(zoneId.replace('seg-', ''));
    const hour = PRODUCTION_HOURS[segIndex];
    if (Number.isNaN(hour)) return null;
    if (hour <= 10) return 0;
    if (hour === 11) return 1;
    if (hour <= 15) return 2;
    return 3;
  }

  if (renderedLens === 1) {
    const stageIndex = Number(zoneId.replace('stage-', ''));
    if (Number.isNaN(stageIndex)) return null;
    return Math.min(stageIndex, 3);
  }

  const fragmentIndex = Number(zoneId.replace('frag-', ''));
  if (Number.isNaN(fragmentIndex)) return null;
  return Math.min(fragmentIndex + 1, 3);
}

function getProdTrendSelectionDetail(selectedHitZone, renderedLens) {
  if (!selectedHitZone) return null;

  const { id, label, color } = selectedHitZone;

  if (renderedLens === 0 && id?.startsWith('seg-')) {
    const segIndex = Number(id.replace('seg-', ''));
    const hour = PRODUCTION_HOURS[segIndex];
    const expected = PRODUCTION_EXPECTED[segIndex];
    const actual = PRODUCTION_ACTUAL[segIndex];

    if (hour != null && expected != null && actual != null) {
      const delta = actual - expected;
      const deltaPct = (delta / expected) * 100;
      const isNegative = delta < 0;
      const varianceText = `${isNegative ? '' : '+'}${deltaPct.toFixed(1)}%`;
      const tonsText = `${actual.toFixed(1)} actual vs ${expected.toFixed(1)} target`;
      const severityLabel =
        hour <= 10
          ? 'Stable output'
          : hour === 11
            ? 'First deviation'
            : hour <= 15
              ? 'Widening shortfall'
              : 'Post-shift impact';
      const driverText =
        hour <= 10
          ? 'This hour is still holding within the expected operating band.'
          : hour === 11
            ? 'This is the earliest visible crack in the shift, where the shortfall first becomes measurable.'
            : hour <= 15
              ? 'This hour belongs to the widening gap window, where the deviation compounds and operational pressure rises.'
              : 'This hour sits in the exhausted end-state of the shift, where losses have already accumulated.';

      return {
        title: `${hour}:00 hit zone`,
        body: `${severityLabel}. ${tonsText}. Variance ${varianceText}. ${driverText}`,
        tone: color || C.blue,
        storyTitle: `${hour}:00 production focus`,
        storyBody: `${tonsText}. ${severityLabel} at ${hour}:00, with variance at ${varianceText}. This drill-in isolates the exact hour so the shift narrative can move from broad trend to hour-level explanation.`,
        chartLabel: `${hour}:00`,
        chartValue: `${actual.toFixed(1)} actual`,
        chartSublabel: `${varianceText} vs target`,
      };
    }
  }

  if (renderedLens === 0) {
    return {
      title: label,
      body: `This hour is now isolated so the shift story can focus on the exact deviation point rather than the full-ring summary.`,
      tone: color || C.blue,
      storyTitle: `${label} production focus`,
      storyBody: `This selected hour is isolated from the full-ring view so the production story can focus on the exact shift condition in context.`,
      chartLabel: label,
    };
  }

  if (renderedLens === 1) {
    return {
      title: label,
      body: `${selectedHitZone.value}. ${selectedHitZone.sublabel}. The pressure map is now centered on this stage so the flow bottleneck is easier to inspect in context.`,
      tone: color || C.blue,
      storyTitle: `${label} stage focus`,
      storyBody: `${selectedHitZone.value}. ${selectedHitZone.sublabel}. This drill-in keeps attention on one stage so the production system can be read as cause and effect rather than as a single snapshot.`,
      chartLabel: label,
      chartValue: selectedHitZone.value,
      chartSublabel: selectedHitZone.sublabel,
    };
  }

  return {
    title: label,
    body: `${selectedHitZone.value}. ${selectedHitZone.sublabel}. This fragment is now isolated so the gap anatomy can explain the contribution more clearly.`,
    tone: color || C.blue,
    storyTitle: `${label} contribution`,
    storyBody: `${selectedHitZone.value}. ${selectedHitZone.sublabel}. This selected fragment now anchors the narrative so the contribution to the total gap is easier to understand.`,
    chartLabel: label,
    chartValue: selectedHitZone.value,
    chartSublabel: selectedHitZone.sublabel,
  };
}

function buildProdTrendDetailMetrics(selectedHitZone, selectedInsight, renderedLens) {
  if (!selectedHitZone) return [];

  const metrics = [];
  if (selectedInsight?.chartValue) {
    metrics.push({ label: renderedLens === 0 ? 'Observed output' : 'Observed value', value: selectedInsight.chartValue, tone: selectedInsight.tone || selectedHitZone.color || C.blue });
  }
  if (selectedInsight?.chartSublabel) {
    metrics.push({ label: 'Context', value: selectedInsight.chartSublabel, tone: C.t2 });
  }
  if (selectedHitZone?.sublabel && selectedHitZone.sublabel !== selectedInsight?.chartSublabel) {
    metrics.push({ label: 'Reading', value: selectedHitZone.sublabel, tone: C.t3 });
  }
  metrics.push({ label: 'Lens', value: renderedLens === 0 ? 'Shift Replay' : renderedLens === 1 ? 'Pressure Map' : 'Gap Anatomy', tone: C.t4 });
  return metrics;
}

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
  const aiOpen = useStore(s => s.aiOpen);
  const toggleAI = useStore(s => s.toggleAI);
  const enterStoryDetail = useStore(s => s.enterStoryDetail);
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
  const [selectedHitZone, setSelectedHitZone] = useState(null);

  // Narrative transition key for animations
  const [narrativeKey, setNarrativeKey] = useState(0);

  const buildProdTrendHitZoneContext = useCallback((zone) => ({
    type: 'prod-trend-zone',
    id: `prod-trend:${renderedLens}:${zone.id}`,
    parentId: 'prod_trend',
    layer: 'story',
    label: `Production Trend > ${zone.label}`,
    code: CARD_REGISTRY.prod_trend?.code || 'PROD',
    accent: zone.color || C.blue,
    preview: {
      label: zone.label,
      value: zone.value || '',
      sublabel: zone.sublabel || '',
    },
  }), [renderedLens]);

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

  useEffect(() => {
    setSelectedHitZone(null);
  }, [story, renderedLens]);

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
  useEffect(() => {
    displayStepsLenRef.current = displaySteps.length;
  }, [displaySteps.length]);

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
  }, [handleExit, handleNavPause, setStoryStep]);

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
  const isProdTrendStory = story === 'prod_trend';
  const showProdTrendRightRail = isProdTrendStory && renderedLens === 0 && storyStep >= displaySteps.length - 1;
  const showProdTrendSidePanel = isProdTrendStory && aiOpen;
  const showProdTrendNarrativePanel = isProdTrendStory && !aiOpen;
  const timelineLabels = isProdTrendStory ? PROD_TREND_TIMELINE_LABELS : displaySteps.map((_, i) => `Step ${i + 1}`);
  const phasePalette = PROD_TREND_PHASE_COLORS[renderedLens] || PROD_TREND_PHASE_COLORS[0];
  const currentPhaseColor = phasePalette[Math.min(storyStep, phasePalette.length - 1)] || accent;
  const currentStepData = displaySteps[storyStep] || displaySteps[displaySteps.length - 1] || null;
  const storyFrameTitle = displaySteps[displaySteps.length - 1]?.t;
  const storyFrameBody = displaySteps[displaySteps.length - 1]?.c;

  const handleProdTrendZoneAction = useCallback((actionId, zoneData) => {
    if (!zoneData?.id) return;
    const zone = {
      id: zoneData.id,
      label: zoneData.label || zoneData.value || 'Overview',
      value: zoneData.value || '',
      sublabel: zoneData.sublabel || '',
      color: zoneData.color || currentPhaseColor,
    };
    const selectedStep = getProdTrendLensStepFromZone(zone.id, renderedLens);
    if (selectedStep != null) setStoryStep(selectedStep);

    if (actionId === 'explain') {
      setSelectedHitZone(null);
      setAIContext(buildProdTrendHitZoneContext(zone));
      if (!aiOpen) toggleAI();
      return;
    }

    if (aiOpen) toggleAI();
    enterStoryDetail({
      ...zone,
      storyId: 'prod_trend',
      lens: renderedLens,
      step: selectedStep ?? storyStep,
    });
  }, [aiOpen, buildProdTrendHitZoneContext, currentPhaseColor, enterStoryDetail, renderedLens, setAIContext, setStoryStep, storyStep, toggleAI]);

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
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: `radial-gradient(circle at 18% 0%, ${rgb(C.blue, 0.08)} 0%, transparent 24%), radial-gradient(circle at 88% 8%, ${rgb(C.green, 0.06)} 0%, transparent 20%), ${C.bg}`,
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `linear-gradient(180deg, ${rgb(C.t1, 0.012)} 0%, transparent 18%, transparent 100%)`,
      }} />
      <div style={{
        position: 'absolute',
        top: 112,
        left: '38%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${rgb(C.green, 0.09)} 0%, transparent 70%)`,
        filter: 'blur(22px)',
        animation: 'ambientFloat 8s ease-in-out infinite',
        pointerEvents: 'none',
        opacity: 0.7,
      }} />
      {/* ─── Minimal Top Bar ─── */}
      <div style={{
        height: TOP_BAR_HEIGHT,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        borderBottom: `1px solid ${rgb(C.bd, 0.4)}`,
        background: `linear-gradient(to bottom, ${rgb(C.bgL, 0.82)}, ${rgb(C.bg, 0.9)})`,
        backdropFilter: 'blur(16px)',
        boxShadow: `0 16px 34px ${rgb('#000000', 0.14)}`,
        zIndex: 3,
      }}>
        <button onClick={handleExit} style={{
          padding: '8px 12px',
          background: rgb(C.sf, 0.42),
          border: `1px solid ${rgb(C.bd, 0.5)}`,
          borderRadius: 10,
          color: C.t3,
          fontSize: 11,
          cursor: 'pointer',
          fontFamily: FONT_SANS,
          fontWeight: 500,
          transition: 'all .18s ease',
          boxShadow: `0 10px 20px ${rgb('#000000', 0.12)}`,
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

        {isProdTrendStory && (
          <button
            onClick={toggleAI}
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: 10,
              border: `1px solid ${aiOpen ? rgb(C.cyan, 0.55) : rgb(C.cyan, 0.3)}`,
              background: aiOpen ? rgb(C.cyan, 0.16) : rgb(C.cyan, 0.08),
              color: aiOpen ? C.t1 : rgb(C.cyan, 0.95),
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: FONT_SANS,
              fontWeight: 600,
              letterSpacing: '0.01em',
              transition: 'all .15s ease',
              boxShadow: aiOpen ? `0 0 18px ${rgb(C.cyan, 0.18)}` : `0 0 14px ${rgb(C.cyan, 0.1)}`,
            }}
          >
            Ask AI about Production Trend
          </button>
        )}

      </div>

      {isProdTrendStory && (
        <div style={{
          height: PROD_TREND_BREADCRUMB_HEIGHT,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: `1px solid ${rgb(C.bd, 0.22)}`,
          background: rgb(C.bg, 0.22),
          backdropFilter: 'blur(14px)',
          zIndex: 2,
        }}>
          <button
            onClick={() => {
              setSelectedHitZone(null);
              setStoryStep(displaySteps.length - 1);
            }}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: C.t1,
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            Production Trend
          </button>
        </div>
      )}

      {isProdTrendStory ? (
        <>
          <div style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: showProdTrendNarrativePanel
              ? `${PROD_TREND_LEFT_WIDTH}px minmax(0, 1fr) ${aiOpen ? `${PROD_TREND_RIGHT_WIDTH}px` : '0px'}`
              : `minmax(0, 1fr) ${aiOpen ? `${PROD_TREND_RIGHT_WIDTH}px` : '0px'}`,
            gap: aiOpen ? 24 : 32,
            padding: `20px 24px ${PROD_TREND_TIMELINE_HEIGHT + 24}px`,
            alignItems: 'stretch',
            overflow: 'hidden',
          }}>
            {showProdTrendNarrativePanel && (
              <aside style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                padding: 0,
                borderRadius: 24,
                border: `1px solid ${rgb(C.bd, 0.55)}`,
                background: `linear-gradient(180deg, ${rgb(C.bgL, 0.92)} 0%, ${rgb(C.bg, 0.98)} 100%)`,
                boxShadow: `0 28px 70px ${rgb('#000000', 0.2)}`,
                minHeight: 0,
                overflow: 'hidden',
                backdropFilter: 'blur(18px)',
                animation: 'surfaceRise 0.45s cubic-bezier(.22,1,.36,1) both',
              }}>
                <div style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: rgb(accent, 0.82),
                  }}>
                    Story frame
                  </div>
                  <div style={{
                    fontFamily: FONT_SERIF,
                    fontSize: 30,
                    lineHeight: 1.02,
                    color: C.t1,
                    letterSpacing: '-0.03em',
                  }}>
                    {storyFrameTitle}
                  </div>
                  <div style={{
                    fontFamily: FONT_SANS,
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: rgb(C.t2, 0.96),
                  }}>
                    {storyFrameBody}
                  </div>
                </div>

                <div
                  key={narrativeKey}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: '20px 20px 22px',
                    borderRadius: 22,
                    background: `linear-gradient(180deg, ${rgb(currentPhaseColor, 0.14)} 0%, ${rgb(C.sf, 0.82)} 18%, ${rgb(C.sf, 0.62)} 100%)`,
                    border: `1px solid ${rgb(currentPhaseColor, 0.22)}`,
                    boxShadow: `inset 0 1px 0 ${rgb(C.t1, 0.03)}, 0 8px 18px ${rgb(currentPhaseColor, 0.05)}`,
                    animation: autoConfig?.showFullText ? 'none' : 'narrativeEnter 0.35s ease forwards',
                    transition: 'background .24s ease, border-color .24s ease, box-shadow .24s ease',
                  }}
                >
                  <div style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: rgb(currentPhaseColor, 0.92),
                  }}>
                    Current insight
                  </div>
                  <div style={{
                    fontSize: 22,
                    fontWeight: 400,
                    color: C.t1,
                    fontFamily: FONT_SERIF,
                    lineHeight: 1.15,
                  }}>
                    {currentStepData?.t}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: C.t2,
                    lineHeight: 1.7,
                    fontFamily: FONT_SANS,
                  }}>
                    {currentStepData?.c}
                  </div>
                  {adaptiveConfig?.annotationMode && STORY_ANNOTATIONS[story]?.[adaptiveConfig.annotationMode] && (
                    <div className="story-annotation">
                      {adaptiveConfig.annotationMode === 'evidence' ? '⊕ ' : adaptiveConfig.annotationMode === 'context' ? '⇄ ' : '👥 '}
                      {STORY_ANNOTATIONS[story][adaptiveConfig.annotationMode]}
                    </div>
                  )}
                </div>

                <div style={{
                  marginTop: 'auto',
                  minHeight: 104,
                  padding: '16px 18px',
                  borderRadius: 16,
                  border: `1px dashed ${rgb(C.bd, 0.32)}`,
                  background: rgb(C.bg, 0.22),
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 6,
                }}>
                  <div style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: C.t4,
                  }}>
                    Future AI space
                  </div>
                  <div style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: C.t3,
                  }}>
                    Reserved story support area.
                  </div>
                </div>
                </div>
              </aside>
            )}

            <section style={{
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              gap: 18,
            }}>
              <div
                ref={canvasWrapRef}
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: 'hidden',
                  opacity: 1,
                  transition: 'opacity 150ms ease',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 8px 20px',
                  animation: 'surfaceRise 0.55s cubic-bezier(.22,1,.36,1) both',
                }}
              >
                <div style={{
                  position: 'absolute',
                  width: '66%',
                  height: '66%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${rgb(accent, 0.06)} 0%, transparent 72%)`,
                  filter: 'blur(28px)',
                  pointerEvents: 'none',
                }} />
                {StoryViz
                  ? <StoryViz
                      w={Math.max(sz.w - (showProdTrendNarrativePanel ? PROD_TREND_LEFT_WIDTH : 0) - (showProdTrendSidePanel ? PROD_TREND_RIGHT_WIDTH : 0) - 88, 420)}
                      h={Math.max(sz.h - TOP_BAR_HEIGHT - PROD_TREND_BREADCRUMB_HEIGHT - PROD_TREND_TIMELINE_HEIGHT - 56, 320)}
                      step={toSourceIndex(storyStep)}
                      cogCluster={cluster}
                      focusedLayout={renderedLens === 0}
                      showBreakdown={false}
                      paused={!autoPlaying}
                      onZoneAction={handleProdTrendZoneAction}
                    />
                  : <PlaceholderCanvas w={Math.max(sz.w - (showProdTrendNarrativePanel ? PROD_TREND_LEFT_WIDTH : 0) - 88, 420)} h={Math.max(sz.h - TOP_BAR_HEIGHT - PROD_TREND_BREADCRUMB_HEIGHT - PROD_TREND_TIMELINE_HEIGHT - 64, 320)} lensName={lenses[renderedLens]?.name} />
                }

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
                      Story complete - explore another lens
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
                              width: 220,
                              minHeight: 170,
                              padding: '14px',
                              background: `linear-gradient(180deg, ${rgb(C.sf, 0.98)} 0%, ${rgb(C.bgL, 0.96)} 100%)`,
                              border: `1px solid ${rgb(C.bd, 0.6)}`,
                              borderRadius: 18, cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                              animation: `lensInvite 2s ease-in-out ${i * 0.15}s infinite`,
                              boxShadow: `0 20px 40px ${rgb('#000000', 0.22)}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 12,
                            }}
                          >
                            <div style={{
                              height: 92,
                              borderRadius: 14,
                              background: `linear-gradient(135deg, ${rgb(accent, 0.22)} 0%, ${rgb(C.bgL, 0.88)} 48%, ${rgb(C.bg, 0.98)} 100%)`,
                              border: `1px solid ${rgb(accent, 0.18)}`,
                              position: 'relative',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: `radial-gradient(circle at 20% 20%, ${rgb(accent, 0.24)} 0%, transparent 38%)`,
                              }} />
                              <div style={{
                                position: 'absolute',
                                right: 14,
                                top: 12,
                                fontSize: 22,
                                color: accent,
                              }}>
                                {ICONS[lens.icon] || '●'}
                              </div>
                              <div style={{
                                position: 'absolute',
                                left: 14,
                                bottom: 12,
                                fontFamily: FONT_MONO,
                                fontSize: 10,
                                color: rgb(C.t1, 0.72),
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                              }}>
                                Lens Preview
                              </div>
                            </div>
                            <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.t1 }}>
                              {lens.name}
                            </div>
                            <div style={{ fontFamily: FONT_SANS, fontSize: 12, lineHeight: 1.55, color: C.t2 }}>
                              {lens.stories?.[0]?.t}
                            </div>
                            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.t3 }}>
                              {lens.stories.length} story steps
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {showProdTrendRightRail && !aiOpen && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: '0 8px 0',
                  animation: 'surfaceRise 0.45s cubic-bezier(.22,1,.36,1) both',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: rgb(C.red, 0.78),
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: C.red,
                      boxShadow: `0 0 0 6px ${rgb(C.red, 0.1)}`,
                    }} />
                    Root Cause Breakdown
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 12,
                  }}>
                    {ROOT_CAUSE_BREAKDOWN.map((cause) => (
                      <div key={cause.label} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 16,
                        border: `1px solid ${rgb(cause.color, 0.16)}`,
                        background: `linear-gradient(180deg, ${rgb(cause.color, 0.08)} 0%, ${rgb(C.sf, 0.42)} 100%)`,
                        boxShadow: `0 12px 28px ${rgb(cause.color, 0.06)}`,
                      }}>
                        <span style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: cause.color,
                          flexShrink: 0,
                          boxShadow: `0 0 0 6px ${rgb(cause.color, 0.1)}`,
                        }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                          <span style={{
                            fontFamily: FONT_SANS,
                            fontSize: 13,
                            color: C.t2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {cause.label}
                          </span>
                          <span style={{
                            fontFamily: FONT_MONO,
                            fontSize: 12,
                            color: cause.color,
                          }}>
                            {cause.pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <aside style={{
              opacity: aiOpen ? 1 : 0,
              pointerEvents: aiOpen ? 'auto' : 'none',
              transform: aiOpen ? 'translateX(0)' : 'translateX(18px)',
              transition: 'opacity 220ms ease, transform 220ms ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'stretch',
              minHeight: 0,
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                padding: 20,
                borderRadius: 22,
                border: `1px solid ${rgb(C.bd, 0.5)}`,
                background: `linear-gradient(180deg, ${rgb(C.bgL, 0.9)} 0%, ${rgb(C.bg, 0.98)} 100%)`,
                boxShadow: `0 24px 60px ${rgb('#000000', 0.2)}`,
                backdropFilter: 'blur(18px)',
                animation: 'surfaceRise 0.65s cubic-bezier(.22,1,.36,1) both',
              }}>
                <div style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: C.cyan,
                }}>
                  AI analysis
                </div>
                <div style={{
                  fontFamily: FONT_SANS,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: C.t3,
                }}>
                  The chat opens in this rail so the conversation stays attached to the story context.
                </div>
              </div>
            </aside>
          </div>

          <div style={{
            position: 'fixed',
            left: 24,
            right: aiOpen ? PROD_TREND_RIGHT_WIDTH + 24 : 24,
            bottom: 16,
            height: PROD_TREND_TIMELINE_HEIGHT,
            zIndex: 12,
          }}>
            <div style={{
              height: '100%',
              borderRadius: 22,
              border: `1px solid ${rgb(C.bd, 0.48)}`,
              background: `linear-gradient(180deg, ${rgb(C.bgL, 0.82)} 0%, ${rgb(C.bg, 0.98)} 100%)`,
              padding: '8px 20px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              boxShadow: `0 18px 48px ${rgb('#000000', 0.22)}`,
              boxSizing: 'border-box',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              animation: 'surfaceRise 0.75s cubic-bezier(.22,1,.36,1) both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => {
                    if (autoPlaying) {
                      clearTimeout(idleTimerRef.current);
                      setAutoPlaying(false);
                    } else if (storyStep >= displaySteps.length - 1) {
                      setStoryStep(0);
                      setShowEndOverlay(false);
                      setAutoPlaying(true);
                    } else {
                      setShowEndOverlay(false);
                      setAutoPlaying(true);
                    }
                  }}
                  aria-label={autoPlaying ? 'Pause timeline' : 'Play timeline'}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    border: `1px solid ${rgb(accent, 0.32)}`,
                    background: rgb(accent, 0.12),
                    color: C.t1,
                    fontFamily: FONT_SANS,
                    fontSize: 13,
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: `0 10px 24px ${rgb(accent, 0.12)}`,
                    transition: 'transform .18s ease, background .18s ease, box-shadow .18s ease',
                  }}
                >
                  {autoPlaying ? '❚❚' : '▶'}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: C.t4,
                  }}>
                    Timeline controller
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      color: C.t1,
                      whiteSpace: 'nowrap',
                    }}>
                      {timelineLabels[Math.min(storyStep, timelineLabels.length - 1)]}
                    </span>
                    <span style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      color: C.t3,
                      whiteSpace: 'nowrap',
                    }}>
                      active
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: 6 }}>
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${displaySteps.length}, minmax(0, 1fr))`,
                gap: 6,
                minWidth: 0,
                alignItems: 'stretch',
                paddingBottom: 2,
              }}>
                {displaySteps.map((stepData, i) => {
                  const isActive = i === storyStep;
                  const isPassed = i < storyStep;
                  const stepColor = phasePalette[Math.min(i, phasePalette.length - 1)] || currentPhaseColor;
                  return (
                    <button
                      key={`${stepData?.t}-${i}`}
                      onClick={() => {
                        handleNavPause();
                        setStoryStep(i);
                        setShowEndOverlay(false);
                      }}
                      style={{
                        minWidth: 0,
                        minHeight: 0,
                        height: 26,
                        padding: '5px 8px',
                        borderRadius: 10,
                        border: `1px solid ${isActive ? rgb(stepColor, 0.42) : isPassed ? rgb(stepColor, 0.18) : rgb(C.bd, 0.42)}`,
                        background: isActive
                          ? `linear-gradient(180deg, ${rgb(stepColor, 0.18)} 0%, ${rgb(C.bgL, 0.88)} 100%)`
                          : isPassed
                            ? rgb(stepColor, 0.1)
                            : rgb(C.bg, 0.58),
                        color: C.t1,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        textAlign: 'left',
                        transition: 'border-color 160ms ease, background 160ms ease, transform 160ms ease, box-shadow 160ms ease',
                        boxShadow: isActive ? `0 12px 24px ${rgb(stepColor, 0.1)}` : 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {isPassed && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: rgb(stepColor, 0.12),
                          pointerEvents: 'none',
                        }} />
                      )}
                      {isActive && autoPlaying && storyStep < displaySteps.length - 1 && (
                        <div
                          key={`card-progress-${renderedLens}-${storyStep}-${autoPlaying}`}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            pointerEvents: 'none',
                            overflow: 'hidden',
                          }}
                        >
                          <div style={{
                            height: '100%',
                            width: '100%',
                            background: `linear-gradient(90deg, ${rgb(stepColor, 0.08)} 0%, ${rgb(stepColor, 0.26)} 100%)`,
                            animation: `trackFill ${autoplayInterval}s linear forwards`,
                            animationFillMode: 'forwards',
                          }}
                          onAnimationEnd={handleAutoAdvance}
                          />
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{
                          fontFamily: FONT_MONO,
                          fontSize: 9,
                          color: isActive || isPassed ? stepColor : C.t4,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>
                          {timelineLabels[i] || `Step ${i + 1}`}
                        </span>
                        <span style={{
                          fontFamily: FONT_SANS,
                          fontSize: 11,
                          color: isActive ? C.t1 : C.t2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                        }}>
                          {stepData?.t}
                        </span>
                      </div>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: isActive ? stepColor : isPassed ? rgb(stepColor, 0.75) : rgb(C.bd, 0.8),
                        boxShadow: isActive ? `0 0 0 4px ${rgb(stepColor, 0.12)}` : 'none',
                      }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
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

          <div style={{
            flexShrink: 0,
            borderTop: `1px solid ${rgb(C.bd, 0.4)}`,
            background: `linear-gradient(to top, ${C.bg}, ${rgb(C.bgL, 0.6)})`,
          }}>
            <div style={{
              padding: '12px 24px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
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
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%',
                  width: displaySteps.length > 1 ? `${(storyStep / (displaySteps.length - 1)) * 100}%` : '0%',
                  background: accent,
                  borderRadius: 2,
                  transition: 'width 0.3s ease',
                }} />
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

            <div style={{
              padding: '14px 24px 12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              minHeight: 80,
            }}>
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
                {adaptiveConfig?.annotationMode && STORY_ANNOTATIONS[story]?.[adaptiveConfig.annotationMode] && (
                  <div className="story-annotation">
                    {adaptiveConfig.annotationMode === 'evidence' ? '⊕ ' : adaptiveConfig.annotationMode === 'context' ? '⇄ ' : '👥 '}
                    {STORY_ANNOTATIONS[story][adaptiveConfig.annotationMode]}
                  </div>
                )}
              </div>

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
        </>
      )}
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
