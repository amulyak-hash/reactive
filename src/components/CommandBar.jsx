import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store';
import { CARD_REGISTRY, AI_AGENT_DATA } from '../data/tataSteel';
import { ZONE_PRESETS } from '../scene/utils/cameraPresets';
import { C, rgb, FONT_SANS, FONT_MONO, FONT_SERIF } from '../theme/tokens';
import { useTyping } from '../hooks/useTyping';

const CAUSAL_CARDS = [
  { tag: 'INCOMING', value: 'Si +0.12%', title: 'Supplier X — Ore Variance', color: C.amber },
  { tag: 'CAUSE', value: '22°C', title: 'BF-3 Superheat Drop', color: C.orange },
  { tag: 'EFFECT', value: '₹8.1 Cr', title: 'Grade Risk — Automotive', color: C.red },
];

const SYSTEM_CARDS = [
  'downtime', 'prod_trend', 'machine_util', 'defect_rate', 'supplier',
  'plant_perf', 'factory_map', 'output_line', 'fault_count', 'material_dep',
];

const ZONE_CARDS = ['bf', 'sms', 'cc', 'rm', 'ql'];

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

export default function CommandBar() {
  const enterStory = useStore(s => s.enterStory);
  const flyTo = useStore(s => s.flyTo);
  const story = useStore(s => s.story);
  const zoomLevel = useStore(s => s.zoomLevel);

  const [inputVal, setInputVal] = useState('');
  const [focused, setFocused] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingResponse, setTypingResponse] = useState(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { displayText: chatTypingText, isDone: chatTypingDone } = useTyping(
    typingResponse, 10, !!typingResponse
  );

  useEffect(() => {
    if (chatTypingDone && typingResponse) {
      setMessages(prev => [...prev, { role: 'agent', text: typingResponse }]);
      setTypingResponse(null);
    }
  }, [chatTypingDone, typingResponse]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatTypingText]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const q = inputVal.trim();
    if (!q) return;
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInputVal('');
    setTimeout(() => setTypingResponse(matchCannedResponse(q)), 300);
  }, [inputVal]);

  const handleCardClick = useCallback((id) => {
    const isZone = ZONE_CARDS.includes(id);
    if (isZone && ZONE_PRESETS[id]) {
      flyTo(ZONE_PRESETS[id]);
    }
    enterStory(id);
  }, [flyTo, enterStory]);

  const causalTourState = useStore(s => s.causalTourState);
  const isCausalTourActive = causalTourState === 'active' || causalTourState === 'paused';

  if (story) return null;

  const showCards = messages.length === 0;
  const showChat = messages.length > 0 || typingResponse;

  return (
    <>
      {/* Gradient fade from bottom — taller to cover causal bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        background: `linear-gradient(to top, ${C.bg} 0%, ${C.bg}f0 25%, ${C.bg}aa 55%, transparent 100%)`,
        zIndex: 198,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'none',
        width: showChat ? 600 : 'auto',
      }}>

        {/* Chat thread */}
        {showChat && (
          <div
            className="liquid-glass"
            style={{
              width: '100%',
              maxHeight: 280,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 18,
              pointerEvents: 'auto',
              animation: 'fadeIn 300ms ease both',
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user'
                    ? 'rgba(59, 139, 246, 0.12)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${msg.role === 'user'
                    ? 'rgba(59, 139, 246, 0.2)'
                    : 'rgba(255, 255, 255, 0.06)'}`,
                }}>
                  <span style={{
                    fontFamily: msg.role === 'user' ? FONT_SANS : FONT_SERIF,
                    fontSize: 12,
                    color: C.t2,
                    fontStyle: msg.role === 'agent' ? 'italic' : 'normal',
                    lineHeight: 1.6,
                  }}>
                    {msg.text}
                  </span>
                </div>
              </div>
            ))}

            {typingResponse && !chatTypingDone && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '12px 12px 12px 4px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                  <span style={{
                    fontFamily: FONT_SERIF,
                    fontSize: 12,
                    color: C.t2,
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                  }}>
                    {chatTypingText}
                    <span style={{
                      color: C.cyan,
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

        {/* Central input */}
        <form onSubmit={handleSubmit} style={{ pointerEvents: 'auto', width: showChat ? '100%' : 'auto' }}>
          <div
            className="liquid-glass-strong"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              borderRadius: 16,
              padding: '0 4px 0 16px',
              borderColor: focused ? 'rgba(34, 211, 238, 0.25)' : undefined,
              transition: 'border-color 200ms ease',
              width: showChat ? '100%' : 620,
            }}
          >
            <span style={{
              color: C.t4,
              fontSize: 14,
              marginRight: 8,
              flexShrink: 0,
            }}>
              ⌘
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onFocus={() => {
                setFocused(true);
                const { causalTourState, showCausalBriefing } = useStore.getState();
                if (causalTourState === 'idle') showCausalBriefing();
              }}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Ask about the factory..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: C.t1,
                fontFamily: FONT_SANS,
                fontSize: 13,
                padding: '12px 0',
                letterSpacing: '0.01em',
              }}
            />
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => { setMessages([]); setTypingResponse(null); }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'transparent',
                  border: 'none',
                  color: C.t4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: FONT_SANS,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Clear chat"
              >
                ×
              </button>
            )}
            <button
              type="submit"
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: inputVal.trim() ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                border: 'none',
                color: inputVal.trim() ? C.cyan : C.t4,
                cursor: inputVal.trim() ? 'pointer' : 'default',
                fontSize: 14,
                fontFamily: FONT_SANS,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
              }}
            >
              ↑
            </button>
          </div>
        </form>

        {/* Causal chain now rendered as full-width CausalBar in App.jsx */}
      </div>
    </>
  );
}

function CardChip({ label, accent, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="liquid-glass-subtle"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        borderRadius: 10,
        borderColor: hovered ? `rgba(255, 255, 255, 0.18)` : undefined,
        color: hovered ? accent : C.t3,
        cursor: 'pointer',
        transition: 'all 150ms ease',
        fontFamily: FONT_SANS,
        fontSize: 11,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: accent,
        opacity: hovered ? 1 : 0.5,
      }} />
      {label}
    </button>
  );
}
