import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../theme/tokens';
import { AI_AGENT_DATA, CARD_REGISTRY, ZONES } from '../data/tataSteel';
import { useTyping } from '../hooks/useTyping';

const ARCHETYPE_SUFFIXES = {
  rtr: (id) => ({ bf: ' → Action: reduce casting speed', cc: ' → Action: acknowledge mold alert', downtime: ' → Action: inspect M21 bearing', default: ' → Immediate attention required' }[id] || ''),
  oo:  (id) => ({ machine_util: ' → Queue impact: Line 4 compensating at 94%', supplier: ' → Buffer: 2h remaining', default: ' → Monitor throughput recovery' }[id] || ''),
  ap:  (id) => ({ bf: ' → Confidence chain: 92% → 87% → 74% → 59%', defect_rate: ' → Lineage: 5 generations from Supplier X', default: '' }[id] || ''),
  sdm: (id) => ({ prod_trend: ' → Financial exposure: ₹4.2 Cr', supplier: ' → Supply risk: ₹1.8 Cr', default: ' → Total exposure: ₹8.1 Cr' }[id] || ''),
  ss:  (id) => ({ bf: ' → Safety: 12°C below thermal threshold', fault_count: ' → Risk: cascading mechanical failure', default: ' → Safety margin critical' }[id] || ''),
};

function getExplanation(ctx, layer, archetype) {
  // Tour narration takes priority
  if (ctx?.narration) return ctx.narration;

  // 3D zone context — show zone description
  if (ctx?.type === 'zone-3d') {
    const zone = ZONES.find(z => z.id === ctx.id);
    if (zone) return `${zone.label} (${zone.code}): ${zone.description}. ${zone.storyDesc}`;
  }

  // 3D overview
  if (ctx?.type === 'overview-3d') {
    return 'You\'re viewing the full factory. Two anomaly zones are active — BF-3 and CCM-3 are part of a causal chain. Zoom in or click a zone label to investigate.';
  }

  let base;
  if (ctx?.id && AI_AGENT_DATA.explanations[ctx.id]) {
    base = AI_AGENT_DATA.explanations[ctx.id];
  } else if (layer && AI_AGENT_DATA.explanations[layer]) {
    base = AI_AGENT_DATA.explanations[layer];
  } else {
    base = AI_AGENT_DATA.explanations.dashboard;
  }
  if (archetype && ARCHETYPE_SUFFIXES[archetype]) {
    const id = ctx?.id || layer;
    const suffixFn = ARCHETYPE_SUFFIXES[archetype];
    const suffix = suffixFn(id) || suffixFn('default');
    return base + suffix;
  }
  return base;
}

function getContextLabel(ctx, layer) {
  if (!ctx) {
    if (layer === 'plantB') return { label: 'PLANT B', code: 'PLT-B', accent: C.red };
    if (layer === 'zones') return { label: 'LINE 3 ZONES', code: 'L3', accent: C.cyan };
    if (layer === 'story') return { label: 'STORY MODE', code: '', accent: C.blue };
    return { label: 'ENTERPRISE OVERVIEW', code: 'CMD', accent: C.blue };
  }
  const card = CARD_REGISTRY[ctx.id];
  const zone = ZONES.find(z => z.id === ctx.id);
  return {
    label: card?.label || zone?.label || ctx.label || 'CONTEXT',
    code: ctx.code || card?.code || zone?.code || '',
    accent: ctx.accent || card?.accent || zone?.accent || C.blue,
  };
}

function getSuggestions(ctx, layer) {
  if (ctx?.id && AI_AGENT_DATA.suggestions[ctx.id]) {
    return AI_AGENT_DATA.suggestions[ctx.id];
  }
  if (layer && AI_AGENT_DATA.suggestions[layer]) {
    return AI_AGENT_DATA.suggestions[layer];
  }
  return AI_AGENT_DATA.suggestions.dashboard || [];
}

function matchCannedResponse(input) {
  const lower = input.toLowerCase();
  const words = lower.split(/\s+/);
  let bestScore = 0;
  let bestResponse = AI_AGENT_DATA.cannedResponses[AI_AGENT_DATA.cannedResponses.length - 1].response;

  for (const entry of AI_AGENT_DATA.cannedResponses) {
    if (entry.keywords.length === 0) continue;
    const score = entry.keywords.reduce((s, kw) =>
      s + (words.some(w => w.includes(kw.toLowerCase())) ? 1 : 0), 0
    );
    if (score > bestScore) {
      bestScore = score;
      bestResponse = entry.response;
    }
  }
  return bestResponse;
}

const PROD_TREND_SUMMARY = [
  { label: 'Shift shortfall', value: '-8%', tone: C.red },
  { label: 'Primary driver', value: 'Line 3 downtime', tone: C.amber },
  { label: 'Largest concentration', value: '73%', tone: C.blue },
];

const PROD_TREND_RECOMMENDATIONS = [
  { title: 'Prioritize Line 3 recovery', body: 'Focus attention on the downtime cluster first because it accounts for the majority of the shortfall.' },
  { title: 'Protect upstream flow', body: 'Watch material timing closely so minor delay does not amplify pressure on the rest of the shift.' },
  { title: 'Review quality holds earlier', body: 'Surface quality exceptions sooner to avoid small holds compounding into visible end-of-shift loss.' },
];

export default function AIAgent({ visibleLayer }) {
  const aiOpen = useStore(s => s.aiOpen);
  const toggleAI = useStore(s => s.toggleAI);
  const aiContext = useStore(s => s.aiContext);
  const aiMessages = useStore(s => s.aiMessages);
  const pushAIMessage = useStore(s => s.pushAIMessage);
  const storeLayer = useStore(s => s.layer);
  const layer = visibleLayer ?? storeLayer;
  const enterStory = useStore(s => s.enterStory);
  const goToPlantB = useStore(s => s.goToPlantB);
  const goToZones = useStore(s => s.goToZones);
  const setLens = useStore(s => s.setLens);
  const activeArchetype = useStore(s => s.activeArchetype);
  const story = useStore(s => s.story);
  const storyStep = useStore(s => s.storyStep);
  const activeLens = useStore(s => s.activeLens);

  // Tour state
  const mode = useStore(s => s.mode);
  const tourState = useStore(s => s.tourState);
  const startTour = useStore(s => s.startTour);
  const resumeTour = useStore(s => s.resumeTour);
  const endTour = useStore(s => s.endTour);

  const [orbHovered, setOrbHovered] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [typingResponse, setTypingResponse] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const explanation = getExplanation(aiContext, layer, activeArchetype);
  const contextMeta = getContextLabel(aiContext, layer);
  const suggestions = getSuggestions(aiContext, layer);
  const isProdTrendContext = aiContext?.id === 'prod_trend' || story === 'prod_trend';
  const isProdTrendHitzoneContext = aiContext?.type === 'prod-trend-zone';
  const contextPreview = aiContext?.preview || null;

  // Typing animation for the main explanation
  const { displayText, isDone } = useTyping(explanation, 10, aiOpen);

  // Typing animation for canned chat responses
  const { displayText: chatTypingText, isDone: chatTypingDone } = useTyping(
    typingResponse, 12, !!typingResponse
  );

  // When chat typing finishes, commit the message
  useEffect(() => {
    if (chatTypingDone && typingResponse) {
      pushAIMessage({ role: 'agent', text: typingResponse });
      setTypingResponse(null);
    }
  }, [chatTypingDone, typingResponse, pushAIMessage]);

  // Auto-scroll messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, chatTypingText]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const q = inputVal.trim();
    if (!q) return;
    pushAIMessage({ role: 'user', text: q });
    setInputVal('');
    const response = matchCannedResponse(q);
    // Small delay before "typing"
    setTimeout(() => setTypingResponse(response), 400);
  }, [inputVal, pushAIMessage]);

  const handleSuggestion = useCallback((suggestion) => {
    if (suggestion.action === 'goToPlantB') {
      goToPlantB();
    } else if (suggestion.action === 'goToZones') {
      goToZones();
    } else if (suggestion.action === 'enterStory') {
      enterStory(suggestion.arg);
    } else if (suggestion.action === 'enterStoryLens') {
      enterStory(suggestion.arg);
      // Set lens after a tick so the story is mounted first
      setTimeout(() => setLens(suggestion.lens || 0), 50);
    }
  }, [enterStory, goToPlantB, goToZones, setLens]);

  const is3D = mode === '3d';
  const isTourOffered = is3D && tourState === 'offered';
  const isTourPaused = is3D && tourState === 'paused';
  const isTourActive = is3D && tourState === 'active';

  const isStory = layer === 'story';
  const dockToStoryRail = isStory && story === 'prod_trend';
  const hideFloatingOrb = dockToStoryRail;
  const orbBottom = isStory ? 200 : 24;
  const panelBottom = isStory ? 256 : 80;
  const orbStyle = {
    position: 'fixed',
    bottom: orbBottom,
    right: 24,
  };
  const panelStyle = dockToStoryRail
    ? {
        position: 'fixed',
        top: 64,
        right: 0,
        bottom: 0,
        width: 380,
        height: 'calc(100vh - 64px)',
        maxHeight: 'none',
        borderRadius: '20px 0 0 0',
      }
    : {
        position: 'fixed',
        bottom: panelBottom,
        right: 24,
        width: 360,
        maxHeight: '65vh',
        borderRadius: 14,
      };

  return (
    <>
      {/* Floating Orb */}
      {!hideFloatingOrb && (
        <button
          onClick={toggleAI}
          onMouseEnter={() => setOrbHovered(true)}
          onMouseLeave={() => setOrbHovered(false)}
          style={{
            ...orbStyle,
            zIndex: 9999,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: aiOpen
              ? `radial-gradient(circle at 35% 30%, ${rgb(C.cyan, 0.22)}, ${rgb(C.blue, 0.18)} 48%, ${C.sf})`
              : `radial-gradient(circle at 35% 30%, ${rgb(C.cyan, 0.18)}, ${rgb(C.blue, 0.12)} 46%, ${C.sf})`,
            border: `1px solid ${orbHovered || aiOpen ? rgb(C.cyan, 0.4) : C.bd}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 200ms ease, background 200ms ease, bottom 300ms ease, transform 200ms ease, box-shadow 200ms ease',
            animation: !aiOpen ? 'orbGlow 3s ease-in-out infinite' : 'none',
            padding: 0,
            boxShadow: orbHovered || aiOpen
              ? `0 0 0 6px ${rgb(C.cyan, 0.08)}, 0 12px 30px rgba(0,0,0,0.34)`
              : '0 10px 26px rgba(0,0,0,0.28)',
            transform: orbHovered ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
          }}
          aria-label="Toggle AI chatbot"
          title="Open AI chatbot"
        >
          <div style={{
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BotGlyph accent={C.cyan} />
          </div>
        </button>
      )}

      {/* Panel */}
      <div style={{
        ...panelStyle,
        background: C.bg,
        border: `1px solid ${C.bd}`,
        opacity: aiOpen ? 1 : 0,
        transform: aiOpen ? 'translateY(0)' : dockToStoryRail ? 'translateX(12px)' : 'translateY(12px)',
        transition: 'opacity 300ms cubic-bezier(0.22,1,0.36,1), transform 300ms cubic-bezier(0.22,1,0.36,1), bottom 300ms ease, top 300ms ease, right 300ms ease',
        pointerEvents: aiOpen ? 'auto' : 'none',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px 10px',
          borderBottom: `1px solid ${C.bd}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: C.cyan,
            animation: 'pulse-dot 1.5s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, color: C.t1,
          }}>
            AI Agent
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={toggleAI}
            style={{
              background: 'none', border: 'none', color: C.t4,
              cursor: 'pointer', fontSize: 14, padding: '0 4px',
              fontFamily: FONT_SANS,
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 16px 0',
        }}>
          {/* Context label */}
          <div style={{
            fontFamily: FONT_MONO, fontSize: 8, fontWeight: 600,
            color: contextMeta.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span>CONTEXT</span>
            <span style={{ color: C.t4 }}>·</span>
            <span>{contextMeta.label}</span>
            {contextMeta.code && (
              <span style={{
                fontSize: 7,
                padding: '1px 4px',
                borderRadius: 2,
                background: rgb(contextMeta.accent, 0.1),
              }}>
                {contextMeta.code}
              </span>
            )}
          </div>

          {isProdTrendContext && (
            <div style={{
              marginBottom: 16,
              padding: '0 0 2px',
            }}>
              <div style={{
                fontFamily: FONT_SERIF,
                fontSize: 13,
                lineHeight: 1.7,
                color: C.t2,
                fontStyle: 'italic',
              }}>
                Production tracking 8% below target today. The gap opened at 11:00 and widened through the afternoon. 73% attributable to Line 3 downtime.
              </div>
            </div>
          )}

          {contextPreview && (
            <div style={{
              marginBottom: 16,
              padding: '12px 14px',
              borderRadius: 14,
              background: `linear-gradient(180deg, ${rgb(contextMeta.accent, 0.1)} 0%, ${rgb(C.sf, 0.92)} 100%)`,
              border: `1px solid ${rgb(contextMeta.accent, 0.18)}`,
              boxShadow: `0 12px 24px ${rgb(contextMeta.accent, 0.06)}`,
            }}>
              <div style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: rgb(contextMeta.accent, 0.9),
                marginBottom: 8,
              }}>
                Selected Hitzone details
              </div>
              <div style={{
                fontFamily: FONT_SANS,
                fontSize: 13,
                fontWeight: 600,
                color: C.t1,
                marginBottom: contextPreview.value || contextPreview.sublabel ? 4 : 0,
              }}>
                {contextPreview.label}
              </div>
              {contextPreview.value && (
                <div style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: C.t2,
                  marginBottom: contextPreview.sublabel ? 3 : 0,
                }}>
                  {contextPreview.value}
                </div>
              )}
              {contextPreview.sublabel && (
                <div style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: rgb(contextMeta.accent, 0.82),
                }}>
                  {contextPreview.sublabel}
                </div>
              )}
            </div>
          )}

          {isProdTrendContext && !isProdTrendHitzoneContext && (
            <div style={{
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{
                padding: '14px 14px 12px',
                borderRadius: 14,
                background: `linear-gradient(180deg, ${rgb(C.cyan, 0.08)} 0%, ${rgb(C.sf, 0.92)} 100%)`,
                border: `1px solid ${rgb(C.cyan, 0.14)}`,
              }}>
                <div style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: C.cyan,
                  marginBottom: 10,
                }}>
                  Production snapshot
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 10,
                }}>
                  {PROD_TREND_SUMMARY.map((item) => (
                    <div key={item.label} style={{
                      padding: '10px 10px 12px',
                      borderRadius: 12,
                      background: rgb(item.tone, 0.08),
                      border: `1px solid ${rgb(item.tone, 0.14)}`,
                    }}>
                      <div style={{
                        fontFamily: FONT_MONO,
                        fontSize: 8,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: C.t4,
                        marginBottom: 6,
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontFamily: FONT_SANS,
                        fontSize: 14,
                        lineHeight: 1.3,
                        fontWeight: 700,
                        color: item.tone,
                      }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: C.t4,
                }}>
                  Recommended focus
                </div>
                {PROD_TREND_RECOMMENDATIONS.map((item, i) => (
                  <button
                    key={item.title}
                    onClick={() => setInputVal(`Explain ${item.title.toLowerCase()}`)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 12px 14px',
                      borderRadius: 14,
                      background: rgb(C.sf, 0.9),
                      border: `1px solid ${rgb(C.bd, 0.5)}`,
                      cursor: 'pointer',
                      transition: 'border-color 200ms ease, transform 200ms ease, background 200ms ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = rgb(C.cyan, 0.28);
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.background = rgb(C.cyan, 0.05);
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = rgb(C.bd, 0.5);
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = rgb(C.sf, 0.9);
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
                    }}>
                      <span style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: rgb(C.cyan, 0.12),
                        color: C.cyan,
                        fontFamily: FONT_MONO,
                        fontSize: 9,
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{
                        fontFamily: FONT_SANS,
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.t1,
                      }}>
                        {item.title}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: C.t3,
                    }}>
                      {item.body}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tour offer / controls */}
          {isTourOffered && (
            <div style={{
              marginBottom: 16,
              padding: '14px',
              borderRadius: 12,
              background: `linear-gradient(135deg, ${rgb(C.cyan, 0.08)}, ${rgb(C.blue, 0.06)})`,
              border: `1px solid ${rgb(C.cyan, 0.2)}`,
            }}>
              <div style={{
                fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.t1, marginBottom: 6,
              }}>
                2 anomalies detected this shift
              </div>
              <div style={{
                fontFamily: FONT_SERIF, fontSize: 12, color: C.t2, fontStyle: 'italic', lineHeight: 1.6, marginBottom: 12,
              }}>
                BF-3 and CCM-3 are part of an active causal chain. Want me to walk you through it?
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={startTour} style={{
                  padding: '6px 16px', borderRadius: 8, background: rgb(C.cyan, 0.15),
                  border: `1px solid ${rgb(C.cyan, 0.3)}`, color: C.cyan,
                  fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>
                  Start tour
                </button>
                <button onClick={endTour} style={{
                  padding: '6px 16px', borderRadius: 8, background: C.sf,
                  border: `1px solid ${C.bd}`, color: C.t3,
                  fontFamily: FONT_SANS, fontSize: 11, cursor: 'pointer',
                }}>
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {isTourPaused && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 10,
              background: rgb(C.amber, 0.06),
              border: `1px solid ${rgb(C.amber, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.t2, flex: 1 }}>
                Tour paused
              </span>
              <button onClick={resumeTour} style={{
                padding: '4px 12px', borderRadius: 6, background: rgb(C.cyan, 0.12),
                border: `1px solid ${rgb(C.cyan, 0.25)}`, color: C.cyan,
                fontFamily: FONT_SANS, fontSize: 10, fontWeight: 600, cursor: 'pointer',
              }}>
                Resume
              </button>
              <button onClick={endTour} style={{
                padding: '4px 12px', borderRadius: 6, background: C.sf,
                border: `1px solid ${C.bd}`, color: C.t4,
                fontFamily: FONT_SANS, fontSize: 10, cursor: 'pointer',
              }}>
                End
              </button>
            </div>
          )}

          {isTourActive && (
            <div style={{
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: C.cyan,
                animation: 'pulse-dot 1.5s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: FONT_MONO, fontSize: 9, color: C.cyan,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                Tour in progress
              </span>
            </div>
          )}

          {/* Typed explanation */}
          {!isProdTrendContext && (
            <div style={{
              fontFamily: FONT_SERIF,
              fontSize: 12,
              lineHeight: 1.6,
              color: C.t2,
              marginBottom: 16,
              fontStyle: 'italic',
              minHeight: 48,
            }}>
              {displayText}
              {!isDone && (
                <span style={{
                  color: contextMeta.accent,
                  animation: 'blink 1s step-end infinite',
                  fontStyle: 'normal',
                }}>│</span>
              )}
            </div>
          )}

          {/* Suggestion chips */}
          {!isProdTrendContext && isDone && suggestions.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 8, color: C.t4,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 8,
              }}>
                Explore Related
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {suggestions.map((s, i) => (
                  <SuggestionChip
                    key={i}
                    suggestion={s}
                    accent={contextMeta.accent}
                    onClick={() => handleSuggestion(s)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {aiMessages.length > 0 && (
            <div style={{
              borderTop: `1px solid ${rgb(C.bd, 0.5)}`,
              paddingTop: 12,
              marginBottom: 8,
            }}>
              {aiMessages.map((msg, i) => (
                <div key={i} style={{
                  marginBottom: 8,
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}>
                  <div style={{
                    display: 'inline-block',
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                    background: msg.role === 'user' ? rgb(C.blue, 0.1) : rgb(C.sf, 1),
                    border: `1px solid ${msg.role === 'user' ? rgb(C.blue, 0.15) : C.bd}`,
                  }}>
                    <span style={{
                      fontFamily: msg.role === 'user' ? FONT_SANS : FONT_SERIF,
                      fontSize: 11,
                      color: C.t2,
                      fontStyle: msg.role === 'agent' ? 'italic' : 'normal',
                      lineHeight: 1.5,
                    }}>
                      {msg.text}
                    </span>
                  </div>
                </div>
              ))}
              {/* Currently typing response */}
              {typingResponse && !chatTypingDone && (
                <div style={{ marginBottom: 8, textAlign: 'left' }}>
                  <div style={{
                    display: 'inline-block',
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: '10px 10px 10px 2px',
                    background: C.sf,
                    border: `1px solid ${C.bd}`,
                  }}>
                    <span style={{
                      fontFamily: FONT_SERIF, fontSize: 11,
                      color: C.t2, fontStyle: 'italic', lineHeight: 1.5,
                    }}>
                      {chatTypingText}
                      <span style={{
                        color: contextMeta.accent,
                        animation: 'blink 1s step-end infinite',
                        fontStyle: 'normal',
                      }}>│</span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} style={{
          padding: '10px 16px 14px',
          borderTop: `1px solid ${rgb(C.bd, 0.5)}`,
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Ask about this view..."
              style={{
                flex: 1,
                background: C.bgL,
                border: `1px solid ${C.bd}`,
                borderRadius: 8,
                padding: '8px 12px',
                color: C.t1,
                fontSize: 11,
                fontFamily: FONT_SANS,
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = rgb(C.cyan, 0.3); }}
              onBlur={e => { e.target.style.borderColor = C.bd; }}
            />
            <button
              type="submit"
              style={{
                width: 32, height: 32,
                borderRadius: 8,
                background: inputVal.trim() ? rgb(C.cyan, 0.12) : C.sf,
                border: `1px solid ${inputVal.trim() ? rgb(C.cyan, 0.3) : C.bd}`,
                color: inputVal.trim() ? C.cyan : C.t4,
                cursor: inputVal.trim() ? 'pointer' : 'default',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_SANS,
                transition: 'all 200ms ease',
                padding: 0,
              }}
            >
              ↑
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function BotGlyph({ accent }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 4.25V7"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="13" cy="3.1" r="1.2" fill={accent} />
      <rect
        x="6.25"
        y="7.75"
        width="13.5"
        height="10.5"
        rx="5.25"
        stroke={accent}
        strokeWidth="1.5"
      />
      <path
        d="M9.75 18.25V20.1L12 18.25"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.25 18.25V20.1L14 18.25"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10.25" cy="12.9" r="1.2" fill={accent} />
      <circle cx="15.75" cy="12.9" r="1.2" fill={accent} />
      <path
        d="M10.3 15.9C11.15 16.55 12.03 16.85 13 16.85C13.97 16.85 14.85 16.55 15.7 15.9"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SuggestionChip({ suggestion, accent, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 10px',
        borderRadius: 20,
        background: hovered ? rgb(accent, 0.1) : rgb(accent, 0.04),
        border: `1px solid ${hovered ? rgb(accent, 0.35) : rgb(accent, 0.12)}`,
        color: hovered ? accent : C.t2,
        fontSize: 10,
        fontFamily: FONT_SANS,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 200ms ease',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 11 }}>{suggestion.icon}</span>
      <span>{suggestion.label}</span>
    </button>
  );
}
