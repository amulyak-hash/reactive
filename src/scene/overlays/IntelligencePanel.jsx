import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { ZONES, CARD_REGISTRY, STORIES } from '../../data/tataSteel';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../../theme/tokens';

// All canvas imports — reusing the exact same components from StoryView
import CausalCanvas from '../../canvas/CausalCanvas';
import AnomalyCanvas from '../../canvas/AnomalyCanvas';
import AdaptiveCanvas from '../../canvas/AdaptiveCanvas';
import ConfidenceCanvas from '../../canvas/ConfidenceCanvas';
import JournalCanvas from '../../canvas/JournalCanvas';
import IncidentArchCanvas from '../../canvas/downtime/IncidentArchCanvas';
import PatternWeaveCanvas from '../../canvas/downtime/PatternWeaveCanvas';
import CostRiverCanvas from '../../canvas/downtime/CostRiverCanvas';
import ShiftReplayCanvas from '../../canvas/prod_trend/ShiftReplayCanvas';
import PressureMapCanvas from '../../canvas/prod_trend/PressureMapCanvas';
import GapAnatomyCanvas from '../../canvas/prod_trend/GapAnatomyCanvas';
import BreathingFactoryCanvas from '../../canvas/machine_util/BreathingFactoryCanvas';
import ShadowShiftCanvas from '../../canvas/machine_util/ShadowShiftCanvas';
import DominoCascadeCanvas from '../../canvas/machine_util/DominoCascadeCanvas';
import DefectDnaCanvas from '../../canvas/defect_rate/DefectDnaCanvas';
import UpstreamTraceCanvas from '../../canvas/defect_rate/UpstreamTraceCanvas';
import BatchFingerprintCanvas from '../../canvas/defect_rate/BatchFingerprintCanvas';
import RippleForwardCanvas from '../../canvas/supplier/RippleForwardCanvas';
import TrustErosionCanvas from '../../canvas/supplier/TrustErosionCanvas';
import AlternativesMapCanvas from '../../canvas/supplier/AlternativesMapCanvas';
import TheRaceCanvas from '../../canvas/plant_perf/TheRaceCanvas';
import BalanceSheetCanvas from '../../canvas/plant_perf/BalanceSheetCanvas';
import ConstellationCanvas from '../../canvas/plant_perf/ConstellationCanvas';
import MaterialJourneyCanvas from '../../canvas/factory_map/MaterialJourneyCanvas';
import BottleneckPulseCanvas from '../../canvas/factory_map/BottleneckPulseCanvas';
import TimeMachineCanvas from '../../canvas/factory_map/TimeMachineCanvas';
import RhythmStripCanvas from '../../canvas/output_line/RhythmStripCanvas';
import CapacityGlacierCanvas from '../../canvas/output_line/CapacityGlacierCanvas';
import HandoffChainCanvas from '../../canvas/output_line/HandoffChainCanvas';
import FaultTreeCanvas from '../../canvas/fault_count/FaultTreeCanvas';
import SeveritySpectrumCanvas from '../../canvas/fault_count/SeveritySpectrumCanvas';
import RepeatOffendersCanvas from '../../canvas/fault_count/RepeatOffendersCanvas';
import VulnerabilityScanCanvas from '../../canvas/material_dep/VulnerabilityScanCanvas';
import CostCurrentCanvas from '../../canvas/material_dep/CostCurrentCanvas';
import QualityInheritanceCanvas from '../../canvas/material_dep/QualityInheritanceCanvas';
import HeatProfileCanvas from '../../canvas/bf/HeatProfileCanvas';
import FeedVarianceCanvas from '../../canvas/bf/FeedVarianceCanvas';
import SignalDecayCanvas from '../../canvas/sms/SignalDecayCanvas';
import CorrelationWebCanvas from '../../canvas/sms/CorrelationWebCanvas';
import ResponseMapCanvas from '../../canvas/cc/ResponseMapCanvas';
import PriorityStackCanvas from '../../canvas/cc/PriorityStackCanvas';
import DecisionGridCanvas from '../../canvas/rm/DecisionGridCanvas';
import CalibrationArcCanvas from '../../canvas/rm/CalibrationArcCanvas';
import OutcomeMapCanvas from '../../canvas/ql/OutcomeMapCanvas';
import FrequencyDialCanvas from '../../canvas/ql/FrequencyDialCanvas';

const VizMap = {
  bf:           [CausalCanvas, HeatProfileCanvas, FeedVarianceCanvas],
  sms:          [AnomalyCanvas, SignalDecayCanvas, CorrelationWebCanvas],
  cc:           [AdaptiveCanvas, ResponseMapCanvas, PriorityStackCanvas],
  rm:           [ConfidenceCanvas, DecisionGridCanvas, CalibrationArcCanvas],
  ql:           [JournalCanvas, OutcomeMapCanvas, FrequencyDialCanvas],
  downtime:     [IncidentArchCanvas, PatternWeaveCanvas, CostRiverCanvas],
  prod_trend:   [ShiftReplayCanvas, PressureMapCanvas, GapAnatomyCanvas],
  machine_util: [BreathingFactoryCanvas, ShadowShiftCanvas, DominoCascadeCanvas],
  defect_rate:  [DefectDnaCanvas, UpstreamTraceCanvas, BatchFingerprintCanvas],
  supplier:     [RippleForwardCanvas, TrustErosionCanvas, AlternativesMapCanvas],
  plant_perf:   [TheRaceCanvas, BalanceSheetCanvas, ConstellationCanvas],
  factory_map:  [MaterialJourneyCanvas, BottleneckPulseCanvas, TimeMachineCanvas],
  output_line:  [RhythmStripCanvas, CapacityGlacierCanvas, HandoffChainCanvas],
  fault_count:  [FaultTreeCanvas, SeveritySpectrumCanvas, RepeatOffendersCanvas],
  material_dep: [VulnerabilityScanCanvas, CostCurrentCanvas, QualityInheritanceCanvas],
};

// Canvas fits 40% panel minus padding
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 260;

function CanvasCard({ Component, lensName, stories, step, accent }) {
  const currentStory = stories?.[step] || stories?.[0];

  return (
    <div style={{
      background: C.sf,
      border: `1px solid ${rgb(accent, 0.15)}`,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      {/* Lens name header */}
      <div style={{
        padding: '8px 14px',
        borderBottom: `1px solid ${rgb(accent, 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: accent,
        }} />
        <span style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          fontWeight: 600,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {lensName}
        </span>
      </div>

      {/* Canvas — position:relative needed for tooltip overlays */}
      <div style={{ padding: '8px 8px 4px', position: 'relative', overflow: 'hidden' }}>
        <Component w={CANVAS_WIDTH} h={CANVAS_HEIGHT} step={step} />
      </div>

      {/* Narrative text */}
      {currentStory && (
        <div style={{ padding: '6px 14px 12px' }}>
          <div style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            fontWeight: 600,
            color: C.t1,
            marginBottom: 3,
          }}>
            {currentStory.t}
          </div>
          <div style={{
            fontFamily: FONT_SERIF,
            fontSize: 11,
            lineHeight: 1.6,
            color: C.t3,
            fontStyle: 'italic',
          }}>
            {currentStory.c}
          </div>
        </div>
      )}
    </div>
  );
}

const AUTOPLAY_MS = 1500;

export default function IntelligencePanel() {
  const story = useStore(s => s.story);
  const storyStep = useStore(s => s.storyStep);
  const exitStory = useStore(s => s.exitStory);
  const nextStoryStep = useStore(s => s.nextStoryStep);
  const setStoryStep = useStore(s => s.setStoryStep);
  const scrollRef = useRef(null);

  const card = story ? CARD_REGISTRY[story] : null;
  const zone = story ? ZONES.find(z => z.id === story) : null;
  const vizArray = story ? VizMap[story] : null;
  const accent = card?.accent || zone?.accent || C.cyan;
  const label = card?.label || zone?.label || story || '';
  const code = card?.code || zone?.code || '';
  const lenses = card?.lenses || [];
  const totalSteps = lenses[0]?.stories?.length || (story && STORIES[story]?.length) || 4;

  // Autoplay: advance step every 1.5s, loop back to 0
  useEffect(() => {
    if (!story) return;
    const timer = setInterval(() => {
      const current = useStore.getState().storyStep;
      const max = totalSteps - 1;
      if (current >= max) {
        setStoryStep(0);
      } else {
        nextStoryStep();
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [story, totalSteps, nextStoryStep, setStoryStep]);

  if (!story || !vizArray) return null;

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="liquid-glass-strong"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '40%',
        height: '100vh',
        borderRadius: 0,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 400ms ease both',
      }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: `1px solid ${C.bd}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 8px ${accent}`,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: FONT_SANS,
            fontSize: 14,
            fontWeight: 700,
            color: C.t1,
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: FONT_MONO,
            fontSize: 9,
            color: C.t3,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {code} — Intelligence Views
          </div>
        </div>

        {/* Autoplay step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} style={{
              width: i === storyStep ? 16 : 6,
              height: 6,
              borderRadius: 3,
              background: i === storyStep ? accent : rgb(accent, 0.2),
              transition: 'all 300ms ease',
            }} />
          ))}
          <span style={{
            fontFamily: FONT_MONO,
            fontSize: 9,
            color: C.t4,
            marginLeft: 4,
          }}>
            auto
          </span>
        </div>

        <button onClick={exitStory} style={{
          padding: '5px 12px', borderRadius: 6,
          background: C.sf, border: `1px solid ${C.bd}`,
          color: C.t3, fontFamily: FONT_MONO, fontSize: 10,
          cursor: 'pointer',
        }}>
          Close
        </button>
      </div>

      {/* Scrollable canvas stack */}
      <div ref={scrollRef} style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 16px 80px',
      }}>
        {vizArray.map((Component, i) => {
          const lens = lenses[i];
          const lensName = lens?.name || `View ${i + 1}`;
          const stories = lens?.stories || STORIES[story];

          return (
            <CanvasCard
              key={i}
              Component={Component}
              lensName={lensName}
              stories={stories}
              step={storyStep}
              accent={accent}
            />
          );
        })}
      </div>
    </div>
  );
}
