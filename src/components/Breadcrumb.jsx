import { C, FONT_SANS, FONT_MONO } from '../theme/tokens';

export default function Breadcrumb({ items, current, onBack, backLabel }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
    }}>
      {backLabel && (
        <button
          onClick={onBack}
          style={{
            fontFamily: FONT_SANS,
            fontSize: 10,
            fontWeight: 600,
            color: C.t2,
            background: C.sf,
            border: `1px solid ${C.bd}`,
            borderRadius: 5,
            padding: '5px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← {backLabel}
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <span style={{ color: C.t4, fontSize: 10 }}>›</span>}
            <span style={{
              fontSize: item === current ? 11 : 10,
              fontWeight: item === current ? 700 : 400,
              color: item === current ? C.t1 : C.t4,
            }}>
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
