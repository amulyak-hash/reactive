import { C, rgb, FONT_MONO, FONT_SERIF } from '../theme/tokens';
import { useTyping } from '../hooks/useTyping';

export default function NarrativeBlock({ text, accentColor = C.blue, label = 'AI ANALYSIS', active = false, embedded = false }) {
  const { displayText, isDone } = useTyping(text, 12, active);

  return (
    <div style={{
      ...(embedded ? {} : {
        background: C.sf,
        border: `1px solid ${C.bd}`,
        borderRadius: 10,
        borderLeft: `3px solid ${accentColor}`,
        marginBottom: 6,
        opacity: active ? 1 : 0,
        transition: 'opacity 400ms ease',
      }),
      padding: '14px 18px',
    }}>
      <div style={{
        fontFamily: FONT_MONO,
        fontSize: 9,
        color: rgb(accentColor, 0.6),
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: FONT_SERIF,
        fontStyle: 'italic',
        fontSize: 13,
        color: C.t2,
        lineHeight: 1.6,
      }}>
        {displayText}
        {!isDone && (
          <span style={{
            color: accentColor,
            animation: 'blink 1s step-end infinite',
            marginLeft: 1,
          }}>|</span>
        )}
      </div>
    </div>
  );
}
