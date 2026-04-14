import { C, FONT_MONO, FONT_SANS } from '../../theme/tokens';

export default function ClauseSpreadPanel({ contractor }) {
  const { clauses, name, isFlagged } = contractor;
  const maxTotal = Math.max(...clauses.map(c => c.total));

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${C.line}`,
      borderRadius: 8,
      padding: 14,
      height: '100%',
    }}>
      <div style={{
        fontFamily: FONT_MONO,
        fontSize: 8,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.25)',
        marginBottom: 12,
      }}>
        Clause Spread — {clauses.length} clause{clauses.length !== 1 ? 's' : ''}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {clauses.map((clause) => (
          <div key={clause.label}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 9,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 3,
              fontFamily: FONT_SANS,
            }}>
              <span>{clause.label}</span>
              <span style={{
                color: clause.color,
                fontFamily: FONT_MONO,
                opacity: 0.85,
              }}>
                {clause.count}x — £{clause.total}K
              </span>
            </div>
            <div style={{
              height: 4,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 2,
            }}>
              <div style={{
                height: '100%',
                width: `${(clause.total / maxTotal) * 100}%`,
                background: clause.color,
                opacity: 0.6,
                borderRadius: 2,
                transition: 'width 400ms ease-out',
              }} />
            </div>
          </div>
        ))}
      </div>

      {isFlagged && clauses.length >= 3 && (
        <div style={{
          fontFamily: FONT_SANS,
          fontSize: 8,
          color: `${C.red}99`,
          marginTop: 10,
          fontStyle: 'italic',
        }}>
          Spread across {clauses.length} clauses to avoid detection
        </div>
      )}
      {!isFlagged && (
        <div style={{
          fontFamily: FONT_SANS,
          fontSize: 8,
          color: 'rgba(255,255,255,0.25)',
          marginTop: 10,
          fontStyle: 'italic',
        }}>
          {clauses.length === 1 ? 'Single clause — no spread pattern' : 'Limited clause spread — no pattern'}
        </div>
      )}
    </div>
  );
}
