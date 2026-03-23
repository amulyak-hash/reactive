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
    code: card?.code || zone?.code || '',
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

  const [orbHovered, setOrbHovered] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [typingResponse, setTypingResponse] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const explanation = getExplanation(aiContext, layer, activeArchetype);
  const contextMeta = getContextLabel(aiContext, layer);
  const suggestions = getSuggestions(aiContext, layer);

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

  const isStory = layer === 'story';
  const orbBottom = isStory ? 200 : 24;
  const panelBottom = isStory ? 256 : 80;

  return (
    <>
      {/* Floating Orb */}
      <button
        onClick={toggleAI}
        onMouseEnter={() => setOrbHovered(true)}
        onMouseLeave={() => setOrbHovered(false)}
        style={{
          position: 'fixed',
          bottom: orbBottom,
          right: 24,
          zIndex: 9999,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: aiOpen ? rgb(C.cyan, 0.12) : C.sf,
          border: `1px solid ${orbHovered || aiOpen ? rgb(C.cyan, 0.4) : C.bd}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 200ms ease, background 200ms ease, bottom 300ms ease',
          animation: !aiOpen ? 'orbGlow 3s ease-in-out infinite' : 'none',
          padding: 0,
        }}
        aria-label="Toggle AI Agent"
      >
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: C.cyan,
          animation: 'pulse-dot 1.5s ease-in-out infinite',
        }} />
      </button>

      {/* Panel */}
      <div style={{
        position: 'fixed',
        bottom: panelBottom,
        right: 24,
        width: 360,
        maxHeight: '65vh',
        background: C.bg,
        border: `1px solid ${C.bd}`,
        borderRadius: 14,
        opacity: aiOpen ? 1 : 0,
        transform: aiOpen ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 300ms cubic-bezier(0.22,1,0.36,1), transform 300ms cubic-bezier(0.22,1,0.36,1), bottom 300ms ease',
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

          {/* Typed explanation */}
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

          {/* Suggestion chips */}
          {isDone && suggestions.length > 0 && (
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
