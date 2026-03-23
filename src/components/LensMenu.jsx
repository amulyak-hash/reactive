import { useStore } from '../store';
import { C, rgb, FONT_SANS, FONT_MONO } from '../theme/tokens';
import { ARCHETYPES, COG_STYLES, COG_CLUSTERS } from '../data/tataSteel';

const ARCHETYPE_ORDER = ['rtr', 'oo', 'ap', 'sdm', 'ss'];

export default function LensMenu() {
  const pendingArchetype = useStore(s => s.pendingArchetype);
  const pendingCogStyle = useStore(s => s.pendingCogStyle);
  const activeArchetype = useStore(s => s.activeArchetype);
  const activeCogStyle = useStore(s => s.activeCogStyle);
  const setPendingArchetype = useStore(s => s.setPendingArchetype);
  const setPendingCogStyle = useStore(s => s.setPendingCogStyle);
  const applyLens = useStore(s => s.applyLens);
  const resetLens = useStore(s => s.resetLens);
  const closeLensMenu = useStore(s => s.closeLensMenu);

  const canApply = pendingArchetype && pendingCogStyle;
  const hasActive = activeArchetype || activeCogStyle;

  // Build preview text
  const previewText = canApply
    ? `${ARCHETYPES[pendingArchetype].shortName} × ${COG_STYLES[pendingCogStyle].name}`
    : 'Select both axes to apply';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeLensMenu}
        style={{
          position: 'fixed', inset: 0, zIndex: 19,
          background: 'transparent',
        }}
      />

      {/* Menu Card */}
      <div style={{
        position: 'absolute', top: '100%', left: 0, zIndex: 20,
        width: 380, marginTop: 8,
        background: C.bg,
        border: `1px solid ${C.bd}`,
        borderRadius: 14,
        boxShadow: `0 12px 40px rgba(0,0,0,0.5)`,
        padding: '16px 18px',
        animation: 'lensMenuEnter 0.25s ease forwards',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: C.t1 }}>
            Configure Lens
          </span>
          <button
            onClick={closeLensMenu}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.t3, fontSize: 16, padding: '2px 6px', borderRadius: 4,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Current active indicator */}
        {hasActive && (
          <div style={{
            fontFamily: FONT_MONO, fontSize: 9, color: C.cyan,
            marginBottom: 12, padding: '4px 8px',
            background: rgb(C.cyan, 0.06), borderRadius: 4,
          }}>
            Active: {ARCHETYPES[activeArchetype]?.shortName || '—'} × {COG_STYLES[activeCogStyle]?.name || '—'}
          </div>
        )}

        {/* ─── Axis 1: Role Archetype ─── */}
        <div style={{
          fontFamily: FONT_MONO, fontSize: 8, color: C.t3,
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
        }}>
          Role Archetype
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          {ARCHETYPE_ORDER.map(key => {
            const a = ARCHETYPES[key];
            const selected = pendingArchetype === key;
            return (
              <button
                key={key}
                onClick={() => setPendingArchetype(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8,
                  background: selected ? rgb(a.accent, 0.1) : 'transparent',
                  border: `1px solid ${selected ? rgb(a.accent, 0.3) : 'transparent'}`,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 150ms ease',
                }}
              >
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 10, fontWeight: 800,
                  color: selected ? a.accent : C.t2,
                  minWidth: 32,
                }}>
                  {a.shortName}
                </span>
                <span style={{
                  fontFamily: FONT_SANS, fontSize: 11, color: selected ? C.t1 : C.t3,
                  flex: 1,
                }}>
                  {a.name}
                </span>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 8, color: C.t4,
                }}>
                  {a.timing}
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: `linear-gradient(to right, transparent, ${rgb(C.bd, 0.5)}, transparent)`,
          marginBottom: 16,
        }} />

        {/* ─── Axis 2: Cognitive Style ─── */}
        <div style={{
          fontFamily: FONT_MONO, fontSize: 8, color: C.t3,
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
        }}>
          Cognitive Style
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {COG_CLUSTERS.map(cluster => (
            <div key={cluster.id}>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 7, color: cluster.accent,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                marginBottom: 6, paddingLeft: 2,
              }}>
                {cluster.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {cluster.styles.map(styleKey => {
                  const cs = COG_STYLES[styleKey];
                  const selected = pendingCogStyle === styleKey;
                  return (
                    <button
                      key={styleKey}
                      onClick={() => setPendingCogStyle(styleKey)}
                      style={{
                        padding: '4px 10px', borderRadius: 6,
                        background: selected ? rgb(cluster.accent, 0.12) : rgb(C.sf, 0.6),
                        border: `1px solid ${selected ? rgb(cluster.accent, 0.3) : 'transparent'}`,
                        cursor: 'pointer',
                        fontFamily: FONT_SANS, fontSize: 10,
                        color: selected ? C.t1 : C.t3,
                        transition: 'all 150ms ease',
                      }}
                    >
                      {cs.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: `linear-gradient(to right, transparent, ${rgb(C.bd, 0.5)}, transparent)`,
          marginBottom: 12,
        }} />

        {/* Preview */}
        <div style={{
          fontFamily: FONT_MONO, fontSize: 9, color: canApply ? C.t1 : C.t4,
          marginBottom: 12, textAlign: 'center',
        }}>
          {previewText}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {hasActive && (
            <button
              onClick={resetLens}
              style={{
                flex: 1, padding: '8px 14px', borderRadius: 8,
                background: 'transparent',
                border: `1px solid ${rgb(C.bd, 0.5)}`,
                color: C.t2, fontSize: 11, fontFamily: FONT_SANS, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              Reset
            </button>
          )}
          <button
            onClick={canApply ? applyLens : undefined}
            style={{
              flex: 1, padding: '8px 14px', borderRadius: 8,
              background: canApply ? rgb(C.cyan, 0.15) : rgb(C.bd, 0.2),
              border: `1px solid ${canApply ? rgb(C.cyan, 0.3) : 'transparent'}`,
              color: canApply ? C.cyan : C.t4,
              fontSize: 11, fontFamily: FONT_SANS, fontWeight: 700,
              cursor: canApply ? 'pointer' : 'default',
              opacity: canApply ? 1 : 0.5,
              transition: 'all 150ms ease',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
