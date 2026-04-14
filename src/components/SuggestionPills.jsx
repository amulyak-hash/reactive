import { useStore } from '../store';
import { USE_CASES } from '../data/useCases';
import { C, FONT_SANS, EASE } from '../theme/tokens';

export default function SuggestionPills({ exclude = [] }) {
  const askByUseCase = useStore(s => s.askByUseCase);

  const pills = USE_CASES.filter(uc => !exclude.includes(uc.id));

  if (pills.length === 0) return null;

  return (
    <div className="pills-scroll" style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      overflowX: 'auto',
      overflowY: 'hidden',
      flexWrap: 'nowrap',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch',
      width: '100%',
    }}>
      {pills.map((uc, i) => (
        <button
          key={uc.id}
          onClick={() => askByUseCase(uc.id)}
          style={{
            padding: '8px 14px',
            borderRadius: 999,
            border: `1px solid ${i === 0 ? 'rgba(41, 207, 214, 0.24)' : 'rgba(255, 255, 255, 0.10)'}`,
            background: 'rgba(8, 14, 26, 0.82)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
            fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600,
            color: i === 0 ? '#d9feff' : 'rgba(245, 247, 251, 0.84)',
            cursor: 'pointer',
            transition: `transform 180ms ${EASE}, border-color 180ms ease, background 180ms ease`,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {uc.question}
        </button>
      ))}
    </div>
  );
}
