import { useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import SuggestionPills from './SuggestionPills';
import { C, FONT_SANS } from '../theme/tokens';

export default function CommandBar() {
  const askQuestion = useStore(s => s.askQuestion);
  const view = useStore(s => s.view);
  const [inputVal, setInputVal] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const q = inputVal.trim();
    if (!q) return;
    askQuestion(q);
    setInputVal('');
  }, [inputVal, askQuestion]);

  const showPills = view === 'dashboard';

  return (
    <div style={{
      flexShrink: 0,
      padding: '20px clamp(18px, 2vw, 32px) 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      background: 'linear-gradient(180deg, transparent 0%, rgba(5, 9, 20, 0.6) 30%, rgba(5, 9, 20, 0.95) 100%)',
    }}>
    <div style={{
      maxWidth: 1000,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
    }}>
      {/* Input shell */}
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minHeight: 68,
          padding: '8px 8px 8px 18px',
          borderRadius: 999,
          border: '1px solid rgba(107, 115, 135, 0.14)',
          background: 'linear-gradient(135deg, rgba(12, 18, 30, 0.97), rgba(19, 24, 35, 0.96), rgba(14, 22, 38, 0.97))',
          boxShadow: [
            '0 0 0 1px rgba(41, 207, 214, 0.18)',
            '0 0 18px rgba(41, 207, 214, 0.22)',
            '0 24px 48px rgba(0, 0, 0, 0.28)',
          ].join(', '),
          backdropFilter: 'blur(18px)',
          overflow: 'hidden',
          isolation: 'isolate',
        }}>
          {/* Teal glow */}
          <div style={{
            position: 'absolute',
            inset: '-26px -34px -32px',
            borderRadius: 'inherit',
            background: 'radial-gradient(ellipse at center, rgba(41, 207, 214, 0.22) 0%, rgba(41, 207, 214, 0.12) 36%, rgba(41, 207, 214, 0.06) 58%, transparent 78%)',
            filter: 'blur(18px)',
            pointerEvents: 'none',
          }} />

          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="ask a follow-up..."
            autoComplete="off"
            style={{
              position: 'relative', zIndex: 1,
              minWidth: 0, flex: 1, border: 0, outline: 'none',
              background: 'transparent',
              padding: '0 6px 0 0',
              fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500,
              color: 'rgba(245, 247, 251, 0.88)',
            }}
          />

          <button
            type="submit"
            style={{
              position: 'relative', zIndex: 1,
              width: 48, height: 48, flex: '0 0 auto',
              borderRadius: 999,
              background: inputVal.trim() ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
              color: 'rgba(240, 244, 255, 0.9)',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
              fontSize: 20, border: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 160ms ease, background 160ms ease',
            }}
          >
            →
          </button>
        </div>
      </form>

      {/* Suggestion pills — only on dashboard, below input */}
      {showPills && <SuggestionPills exclude={[]} />}
    </div>
    </div>
  );
}
