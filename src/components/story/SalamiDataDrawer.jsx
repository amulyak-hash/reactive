import { motion, AnimatePresence } from 'framer-motion';
import { C, FONT_MONO, FONT_SANS } from '../../theme/tokens';

export default function SalamiDataDrawer({ contractors, drawerOpen, onToggle }) {
  return (
    <div style={{ borderTop: `1px solid ${C.line}`, padding: '12px 0 24px' }}>
      {/* Toggle */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          margin: '0 auto',
          padding: '6px 16px',
          background: 'transparent',
          border: `1px solid ${C.line}`,
          borderRadius: 6,
          cursor: 'pointer',
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: C.t3,
          transition: 'color 200ms ease, border-color 200ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = C.t1;
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = C.t3;
          e.currentTarget.style.borderColor = C.line;
        }}
      >
        {drawerOpen ? 'Hide' : 'View'} detailed data {drawerOpen ? '↑' : '↓'}
      </button>

      {/* Drawer content */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 0 0' }}>
              {/* Summary table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: FONT_SANS,
                fontSize: 11,
              }}>
                <thead>
                  <tr>
                    {['Contractor', 'NCE Count', 'Total NCE (£K)', 'Bid (£K)', 'Projected (£K)', 'Bid Gap', 'Status'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        fontFamily: FONT_MONO,
                        fontSize: 8,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: C.t3,
                        borderBottom: `1px solid ${C.line}`,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contractors.map((c, i) => {
                    const totalNCE = c.clauses.reduce((sum, cl) => sum + cl.total, 0);
                    const gap = c.bid.nextBidder - c.bid.winning;
                    return (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <td style={{
                          padding: '8px 10px',
                          borderBottom: `1px solid ${C.line}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}>
                          <img
                            src={c.logo}
                            alt={c.shortName}
                            style={{
                              width: 20, height: 20, borderRadius: 4,
                              objectFit: 'contain',
                              background: 'rgba(255,255,255,0.06)',
                              padding: 2,
                            }}
                          />
                          <span style={{
                            color: c.isFlagged ? c.color : C.t2,
                            fontWeight: c.isFlagged ? 600 : 400,
                          }}>
                            {c.name}
                          </span>
                        </td>
                        <td style={{
                          padding: '8px 10px',
                          borderBottom: `1px solid ${C.line}`,
                          fontFamily: FONT_MONO,
                          color: c.isFlagged ? C.amber : C.t2,
                        }}>
                          {c.nces.length}
                        </td>
                        <td style={{
                          padding: '8px 10px',
                          borderBottom: `1px solid ${C.line}`,
                          fontFamily: FONT_MONO,
                          color: c.isFlagged ? C.amber : C.t2,
                        }}>
                          £{totalNCE}K
                        </td>
                        <td style={{
                          padding: '8px 10px',
                          borderBottom: `1px solid ${C.line}`,
                          fontFamily: FONT_MONO,
                          color: C.t2,
                        }}>
                          £{c.bid.winning}K
                        </td>
                        <td style={{
                          padding: '8px 10px',
                          borderBottom: `1px solid ${C.line}`,
                          fontFamily: FONT_MONO,
                          color: c.bid.projected > c.bid.nextBidder ? C.red : C.t2,
                        }}>
                          £{c.bid.projected}K
                        </td>
                        <td style={{
                          padding: '8px 10px',
                          borderBottom: `1px solid ${C.line}`,
                          fontFamily: FONT_MONO,
                          color: C.t3,
                        }}>
                          £{gap}K
                        </td>
                        <td style={{
                          padding: '8px 10px',
                          borderBottom: `1px solid ${C.line}`,
                        }}>
                          {c.isFlagged ? (
                            <span style={{
                              fontFamily: FONT_MONO, fontSize: 8,
                              fontWeight: 700, letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: C.red,
                              background: `${C.red}18`,
                              padding: '2px 6px',
                              borderRadius: 3,
                              border: `1px solid ${C.red}30`,
                            }}>
                              Flagged
                            </span>
                          ) : (
                            <span style={{
                              fontFamily: FONT_MONO, fontSize: 8,
                              color: C.t3,
                            }}>
                              Normal
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Recommendation */}
              <div style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 8,
                background: `${C.amber}08`,
                border: `1px solid ${C.amber}22`,
              }}>
                <div style={{
                  fontFamily: FONT_MONO,
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: C.amber,
                  marginBottom: 6,
                }}>
                  Recommendation
                </div>
                <div style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  color: C.t2,
                  lineHeight: 1.5,
                }}>
                  Schedule forensic commercial review for KEC International. Bid-stage pricing assumptions vs actual site conditions need challenge. The £160K "saving" from choosing the lowest bidder is actually a £830K loss. Enterprise Brain reframes the real cost of procurement decisions.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
