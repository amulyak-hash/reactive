import { C, FONT_MONO, FONT_SANS } from '../../theme/tokens';

export default function RealCostPanel({ contractor }) {
  const { bid, name, isFlagged } = contractor;
  const saving = bid.nextBidder - bid.winning;
  const projectedDiff = bid.projected - bid.nextBidder;
  const isLoss = bid.projected > bid.nextBidder;

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
        Bid vs Reality
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Winning bid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: FONT_SANS, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
            Winning bid
          </span>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 16,
            color: C.green, opacity: 0.85,
          }}>
            £{(bid.winning / 1000).toFixed(2)}M
          </span>
        </div>

        {/* Next bidder */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: FONT_SANS, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
            Next bidder
          </span>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
          }}>
            £{(bid.nextBidder / 1000).toFixed(2)}M
          </span>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

        {/* Projected */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{
            fontFamily: FONT_SANS, fontSize: 9,
            color: isLoss ? `${C.red}99` : 'rgba(255,255,255,0.4)',
          }}>
            Projected with NCEs
          </span>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 20,
            color: isLoss ? C.red : C.green,
            opacity: 0.9,
            textShadow: isLoss ? `0 0 20px ${C.red}33` : 'none',
          }}>
            £{(bid.projected / 1000).toFixed(2)}M
          </span>
        </div>
      </div>

      {/* Punchline — only if it's a loss */}
      {isLoss && isFlagged ? (
        <div style={{
          marginTop: 12, padding: 8,
          background: `${C.red}0f`, borderRadius: 6,
          border: `1px solid ${C.red}1f`,
        }}>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 9,
            color: `${C.red}b3`, textAlign: 'center',
          }}>
            The £{saving}K "saving" is actually an{' '}
            <strong style={{ color: `${C.red}f2` }}>£{projectedDiff}K loss</strong>
          </div>
        </div>
      ) : (
        <div style={{
          marginTop: 12, padding: 8,
          background: 'rgba(255,255,255,0.02)', borderRadius: 6,
          border: `1px solid ${C.line}`,
        }}>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 9,
            color: 'rgba(255,255,255,0.35)', textAlign: 'center',
          }}>
            {bid.projected <= bid.nextBidder
              ? 'Projected cost within expected range'
              : `£${projectedDiff}K above next bidder — monitor`}
          </div>
        </div>
      )}
    </div>
  );
}
