import { C, FONT_SANS } from '../theme/tokens';

export default function QuestionBubble({ question }) {
  return (
    <div style={{
      alignSelf: 'flex-end',
      maxWidth: '70%',
      padding: '10px 16px',
      borderRadius: '16px 16px 4px 16px',
      background: 'rgba(92, 131, 255, 0.10)',
      border: '1px solid rgba(92, 131, 255, 0.18)',
      fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500,
      color: 'rgba(245, 247, 251, 0.92)',
      lineHeight: 1.45,
      animation: 'card-enter 250ms ease-out both',
    }}>
      {question}
    </div>
  );
}
