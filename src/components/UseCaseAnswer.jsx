import { useTyping } from '../hooks/useTyping';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';

// Highlight key numbers (£, %, days, weeks) with accent color
function highlightNumbers(text) {
  const parts = text.split(/(£[\d,.]+[KMBkmb]?|[\d,.]+%|\d+[\s-](?:days?|weeks?|months?)|\d+x)/g);
  return parts.map((part, i) => {
    if (/^£|^\d.*%$|^\d.*(?:day|week|month)|^\d+x$/i.test(part)) {
      return (
        <span key={i} style={{
          color: C.teal,
          fontFamily: FONT_MONO,
          fontWeight: 700,
          textShadow: '0 0 8px rgba(41, 207, 214, 0.3)',
        }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

const SEVERITY_STYLES = {
  CRITICAL: { bg: 'rgba(240, 96, 96, 0.08)', border: C.red, icon: '●', iconColor: C.red },
  WARNING: { bg: 'rgba(240, 129, 58, 0.08)', border: C.orange, icon: '▲', iconColor: C.orange },
  WATCH: { bg: 'rgba(251, 191, 36, 0.06)', border: C.amber, icon: '◆', iconColor: C.amber },
};

export default function UseCaseAnswer({ answer, accent, active }) {
  const { displayText, isDone } = useTyping(answer, 6, active);

  if (!answer) return null;

  const paragraphs = (isDone ? answer : displayText).split('\n').filter(l => l.trim());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {paragraphs.map((para, i) => {
        const isRec = para.startsWith('RECOMMENDATION:');
        const severityMatch = para.match(/^(CRITICAL|WARNING|WATCH)\s*—\s*/);
        const isSection = /^(SUPPORTING|AGAINST|VISIBLE|HIDDEN|TOTAL|OVERALL|DECISION)/.test(para);

        if (isRec) {
          return (
            <div key={i} style={{
              padding: '14px 16px', borderRadius: 16,
              background: `linear-gradient(135deg, ${rgb(accent, 0.08)}, ${rgb(accent, 0.03)})`,
              borderLeft: `3px solid ${accent}`,
              marginTop: 6,
              boxShadow: `0 0 20px ${rgb(accent, 0.06)}`,
              animation: 'fadeIn 400ms ease both',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 6,
                  background: rgb(accent, 0.15),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: accent,
                }}>
                  ⚡
                </span>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700,
                  color: accent, letterSpacing: '0.08em',
                }}>
                  RECOMMENDATION
                </span>
              </div>
              <div style={{
                fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
                color: C.t2, lineHeight: 1.55,
              }}>
                {highlightNumbers(para.replace('RECOMMENDATION: ', ''))}
              </div>
            </div>
          );
        }

        if (severityMatch) {
          const level = severityMatch[1];
          const style = SEVERITY_STYLES[level] || {};
          const content = para.replace(severityMatch[0], '');
          return (
            <div key={i} style={{
              padding: '12px 14px', borderRadius: 14,
              background: style.bg || 'transparent',
              borderLeft: `3px solid ${style.border || C.t4}`,
              animation: 'fadeIn 300ms ease both',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
              }}>
                <span style={{ color: style.iconColor, fontSize: 8 }}>{style.icon}</span>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700,
                  color: style.iconColor, letterSpacing: '0.06em',
                }}>
                  {level}
                </span>
              </div>
              <div style={{
                fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
                color: C.t2, lineHeight: 1.55,
              }}>
                {highlightNumbers(content)}
              </div>
            </div>
          );
        }

        if (isSection) {
          return (
            <div key={i} style={{
              fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700,
              color: C.t1, lineHeight: 1.5, marginTop: 6,
              paddingBottom: 4,
              borderBottom: `1px solid ${C.line}`,
            }}>
              {para}
            </div>
          );
        }

        // Numbered items
        const isNumbered = /^\d+\./.test(para.trim());

        return (
          <div key={i} style={{
            fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
            color: C.t2, lineHeight: 1.6,
            paddingLeft: isNumbered ? 4 : 0,
          }}>
            {highlightNumbers(para)}
          </div>
        );
      })}

      {!isDone && (
        <span style={{
          color: C.teal,
          animation: 'blink 1s step-end infinite',
          fontFamily: FONT_MONO, fontSize: 13,
        }}>|</span>
      )}
    </div>
  );
}
