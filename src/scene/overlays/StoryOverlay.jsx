import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { STORIES, ZONES } from '../../data/tataSteel';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../../theme/tokens';

/**
 * StoryOverlay — 2D narrative panels floating over the 3D scene.
 * Appears when a story is active in 3D mode.
 * Shows story steps as cards at the bottom of the screen.
 */
export default function StoryOverlay() {
  const story = useStore(s => s.story);
  const storyStep = useStore(s => s.storyStep);
  const nextStoryStep = useStore(s => s.nextStoryStep);
  const prevStoryStep = useStore(s => s.prevStoryStep);
  const exitStory = useStore(s => s.exitStory);

  if (!story) return null;

  const steps = STORIES[story];
  if (!steps) return null;

  const zone = ZONES.find(z => z.id === story);
  const accent = zone?.accent || C.cyan;
  const currentStep = steps[storyStep];
  const isFirst = storyStep === 0;
  const isLast = storyStep >= steps.length - 1;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      {/* Gradient fade */}
      <div style={{
        height: 80,
        background: `linear-gradient(transparent, ${rgb(C.bg, 0.85)})`,
      }} />

      {/* Story panel */}
      <div style={{
        background: rgb(C.bg, 0.92),
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${rgb(accent, 0.2)}`,
        padding: '20px 32px 28px',
        pointerEvents: 'auto',
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 8px ${accent}`,
            }} />
            <span style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: accent,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {zone?.code || story.toUpperCase()} — Story Mode
            </span>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i === storyStep ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === storyStep ? accent : rgb(accent, 0.2),
                transition: 'all 300ms ease',
              }} />
            ))}
          </div>

          <button
            onClick={exitStory}
            style={{
              background: rgb(C.sf, 0.8),
              border: `1px solid ${C.bd}`,
              borderRadius: 6,
              padding: '4px 12px',
              color: C.t3,
              fontFamily: FONT_MONO,
              fontSize: 10,
              cursor: 'pointer',
            }}
          >
            Exit Story
          </button>
        </div>

        {/* Content */}
        {currentStep && (
          <div style={{
            display: 'flex',
            gap: 24,
            alignItems: 'flex-start',
          }}>
            {/* Step title */}
            <div style={{ minWidth: 180 }}>
              <div style={{
                fontFamily: FONT_SANS,
                fontSize: 16,
                fontWeight: 700,
                color: C.t1,
                marginBottom: 4,
              }}>
                {currentStep.t}
              </div>
              <div style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: C.t4,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Step {storyStep + 1} of {steps.length}
              </div>
            </div>

            {/* Step narrative */}
            <div style={{
              flex: 1,
              fontFamily: FONT_SERIF,
              fontSize: 13,
              lineHeight: 1.7,
              color: C.t2,
              fontStyle: 'italic',
              maxWidth: 600,
            }}>
              {currentStep.c}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={prevStoryStep}
                disabled={isFirst}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: isFirst ? C.sf : rgb(accent, 0.1),
                  border: `1px solid ${isFirst ? C.bd : rgb(accent, 0.3)}`,
                  color: isFirst ? C.t4 : accent,
                  cursor: isFirst ? 'default' : 'pointer',
                  fontSize: 14,
                  fontFamily: FONT_SANS,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ←
              </button>
              <button
                onClick={isLast ? exitStory : nextStoryStep}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: rgb(accent, 0.1),
                  border: `1px solid ${rgb(accent, 0.3)}`,
                  color: accent,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontFamily: FONT_SANS,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isLast ? '✓' : '→'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
