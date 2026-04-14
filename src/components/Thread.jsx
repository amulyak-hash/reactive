import { useRef, useEffect, useState, useCallback } from 'react';
import { useStore } from '../store';
import QuestionBubble from './QuestionBubble';
import ResponseCard from './ResponseCard';
import SuggestionPills from './SuggestionPills';
import { C, FONT_SANS, FONT_MONO } from '../theme/tokens';

function ThinkingIndicator() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px',
      animation: 'fadeIn 200ms ease both',
    }}>
      <div style={{
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 999,
            background: C.teal,
            opacity: 0.4,
            animation: `blink 1.4s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <span style={{
        fontFamily: FONT_MONO, fontSize: 11, fontWeight: 500,
        color: C.t3,
      }}>
        Analyzing...
      </span>
    </div>
  );
}

export default function Thread() {
  const thread = useStore(s => s.thread);
  const bottomRef = useRef(null);
  const [revealedCards, setRevealedCards] = useState(new Set());
  const [storyCompleteIds, setStoryCompleteIds] = useState(new Set());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length]);

  // Stagger card reveal: show thinking indicator, then card after delay
  useEffect(() => {
    if (thread.length === 0) return;
    const lastEntry = thread[thread.length - 1];
    if (revealedCards.has(lastEntry.id)) return;

    const t = setTimeout(() => {
      setRevealedCards(prev => new Set([...prev, lastEntry.id]));
    }, 800); // 800ms thinking delay
    return () => clearTimeout(t);
  }, [thread, revealedCards]);

  const handleStoryComplete = useCallback((entryId) => {
    setStoryCompleteIds(prev => {
      if (prev.has(entryId)) return prev;
      return new Set([...prev, entryId]);
    });
  }, []);

  const answeredIds = thread.map(t => t.useCaseId);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      padding: '20px clamp(18px, 2vw, 32px) 16px',
      maxWidth: 1100,
      margin: '0 auto',
      width: '100%',
    }}>
      {thread.map((entry, i) => {
        const excludeAtThisPoint = thread.slice(0, i + 1).map(t => t.useCaseId);
        const isRevealed = revealedCards.has(entry.id);
        const isLast = i === thread.length - 1;
        const isStoryCard = entry.useCaseId === 'uc-00';
        const showPills = isStoryCard ? storyCompleteIds.has(entry.id) : true;

        return (
          <div key={entry.id} style={{
            padding: '20px 0',
            borderBottom: i < thread.length - 1 ? `1px solid ${C.line}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            {/* Turn number — hidden for story cards */}
            {!isStoryCard && (
              <div style={{
                fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600,
                color: C.t4, letterSpacing: '0.06em',
              }}>
                TURN {i + 1}
              </div>
            )}

            {/* Question */}
            <QuestionBubble question={entry.question} />

            {/* Thinking or Response */}
            {isLast && !isRevealed ? (
              <ThinkingIndicator />
            ) : (
              <>
                <ResponseCard
                  useCaseId={entry.useCaseId}
                  onStoryComplete={() => handleStoryComplete(entry.id)}
                />
                {showPills && (
                  <div style={{
                    paddingTop: 4,
                    animation: 'fadeIn 400ms ease 200ms both',
                  }}>
                    <SuggestionPills exclude={excludeAtThisPoint} />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
