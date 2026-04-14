import { C, FONT_MONO, FONT_SANS } from '../../theme/tokens';

export default function TrajectoryPanel({ contractor }) {
  const { trajectory, color, name, isFlagged } = contractor;
  const { values, months, nowIdx } = trajectory;
  const maxVal = Math.max(...values, 1);
  const nowVal = values[nowIdx];
  const finalVal = values[values.length - 1];

  const svgW = 200;
  const svgH = 80;
  const points = values.map((v, i) => ({
    x: (i / (values.length - 1)) * svgW,
    y: svgH - (v / maxVal) * svgH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${svgW},${svgH} L0,${svgH} Z`;
  const nowPoint = points[nowIdx];

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
        NCE Trajectory
      </div>

      {/* SVG chart */}
      <div style={{ position: 'relative', height: 80, marginBottom: 8 }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`trendFill-${contractor.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`${color}33`} />
              <stop offset="100%" stopColor={`${color}00`} />
            </linearGradient>
          </defs>

          <path d={areaPath} fill={`url(#trendFill-${contractor.id})`} />
          <path d={linePath} stroke={`${color}99`} strokeWidth="1.5" fill="none" />

          {/* Now marker */}
          <line
            x1={nowPoint.x} y1={nowPoint.y}
            x2={nowPoint.x} y2={svgH}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="2,3"
          />
          <circle cx={nowPoint.x} cy={nowPoint.y} r="3" fill={color} />
        </svg>

        {/* Now label */}
        {nowVal > 0 && (
          <div style={{
            position: 'absolute',
            left: `${(nowIdx / (values.length - 1)) * 100}%`,
            top: `${(nowPoint.y / svgH) * 100 + 8}%`,
            transform: 'translateX(-50%)',
            fontFamily: FONT_MONO, fontSize: 7, color: `${color}b3`,
            whiteSpace: 'nowrap',
          }}>
            now £{nowVal}K
          </div>
        )}

        {/* Final label */}
        {finalVal > 0 && (
          <div style={{
            position: 'absolute', right: 0, top: 0,
            fontFamily: FONT_MONO, fontSize: 7,
            color: isFlagged ? `${C.red}b3` : `${color}80`,
          }}>
            £{finalVal}K
          </div>
        )}
      </div>

      {/* Month labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: FONT_MONO, fontSize: 7,
        color: 'rgba(255,255,255,0.15)',
      }}>
        <span>{months[0]}</span>
        <span>{months[Math.floor(months.length / 3)]}</span>
        <span>{months[Math.floor(months.length * 2 / 3)]}</span>
        <span>{months[months.length - 1]}</span>
      </div>

      <div style={{
        fontFamily: FONT_SANS, fontSize: 8,
        color: isFlagged ? `${C.red}80` : 'rgba(255,255,255,0.25)',
        marginTop: 8, fontStyle: 'italic',
      }}>
        {isFlagged
          ? `At current rate: £${finalVal}K by month 14`
          : finalVal === nowVal
            ? 'No further NCE activity projected'
            : `Projected: £${finalVal}K by month 14`}
      </div>
    </div>
  );
}
