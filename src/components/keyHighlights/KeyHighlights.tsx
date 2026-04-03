import type { KeyHighlightBlock, KeyHighlightChip, KeyHighlightBadge, KeyHighlightDot, ScorecardRow, FlagsListRow, ComparisonRow } from '../../types';

// ─── Shared palette & fonts ──────────────────────────────────────────────────
const C = {
  bg:     'rgba(255,255,255,0.025)',
  border: 'rgba(28,45,66,0.9)',
  t1:     '#F1F5F9',
  t2:     '#CBD5E1',
  t3:     '#94A3B8',
  t4:     '#64748B',
  red:    '#F06060',
  amber:  '#FBBF24',
  green:  '#34D399',
} as const;

const MONO = "'JetBrains Mono', monospace";
const SANS = "'DM Sans', sans-serif";

// ─── ChipRow — shared small chip row used by several block types ─────────────
function ChipRow({ chips }: { chips: KeyHighlightChip[] }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
      {chips.map((chip, i) => (
        <div
          key={i}
          style={{
            flex: 1, display: 'flex', alignItems: 'baseline', gap: 8,
            padding: '8px 12px',
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 5,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: chip.color ?? C.t1, fontFamily: MONO }}>
            {chip.value}
          </span>
          <span style={{ fontSize: 11, color: C.t4, fontFamily: SANS, lineHeight: 1.4 }}>
            {chip.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Stats ───────────────────────────────────────────────────────────────────
// 3 equal tiles — large number, small label, colored top border
// Used for: Q1, Q11, Q12
function Stats({ items }: { items: Array<{ value: string; label: string; color?: string }> }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            flex: 1, padding: '12px 16px',
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderTop: `2px solid ${item.color ?? C.t4}`,
            borderRadius: 7,
            textAlign: 'center' as const,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: item.color ?? C.t1, fontFamily: MONO, lineHeight: 1.15 }}>
            {item.value}
          </div>
          <div style={{ fontSize: 11, color: C.t4, fontFamily: SANS, marginTop: 5, lineHeight: 1.45 }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Ranked ──────────────────────────────────────────────────────────────────
// Name chip + value + description rows — each with colored left border
// Used for: Q2, Q5, Q6
function Ranked({ items }: { items: Array<{ name: string; value: string; color: string; kpiLabel?: string }> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 14px',
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${item.color}`,
            borderRadius: 6,
          }}
        >
          <span
            style={{
              fontSize: 11, fontWeight: 600, color: item.color,
              background: item.color + '22', padding: '2px 8px',
              borderRadius: 4, fontFamily: SANS, flexShrink: 0,
            }}
          >
            {item.name}
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, color: item.color, fontFamily: MONO, minWidth: 70, flexShrink: 0 }}>
            {item.value}
          </span>
          <span style={{ fontSize: 11, color: C.t4, fontFamily: SANS, flex: 1, lineHeight: 1.45 }}>
            {item.kpiLabel}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Chips ───────────────────────────────────────────────────────────────────
// Large value callout cards — value prominent, label below
// Used for: Q4, Q8
function Chips({ items }: { items: KeyHighlightChip[] }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            flex: 1, padding: '14px 16px',
            background: C.bg,
            border: `1px solid ${(item.color ? item.color + '30' : C.border)}`,
            borderRadius: 7,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 700, color: item.color ?? C.t1, fontFamily: MONO, lineHeight: 1.1 }}>
            {item.value}
          </div>
          <div style={{ fontSize: 14, color: C.t4, fontFamily: SANS, marginTop: 6, lineHeight: 1.5 }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────
// Severity-colored badge rows — red / amber / green
// Used for: Q7, Q9
const BADGE_COLOR: Record<KeyHighlightBadge['severity'], string> = {
  red:   C.red,
  amber: C.amber,
  green: C.green,
};

function Badges({ items }: { items: KeyHighlightBadge[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5 }}>
      {items.map((item, i) => {
        const color = BADGE_COLOR[item.severity];
        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 14px',
              background: color + '0C',
              border: `1px solid ${color}28`,
              borderLeft: `3px solid ${color}`,
              borderRadius: 6,
            }}
          >
            <span
              style={{
                width: 7, height: 7, borderRadius: '50%', background: color,
                flexShrink: 0, marginTop: 5,
              }}
            />
            <span style={{ fontSize: 12, color: C.t2, fontFamily: SANS, lineHeight: 1.6 }}>
              {item.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── DotStrip ────────────────────────────────────────────────────────────────
// Contractors as colored dots on a min→max range track
// Labels alternate above/below to avoid crowding at the high end
// Used for: Q3
function DotStrip({ min, max, unit, dots, chips }: {
  min: number; max: number; unit: string;
  dots: KeyHighlightDot[];
  chips?: KeyHighlightChip[];
}) {
  const range = max - min;
  return (
    <div>
      <div style={{ position: 'relative' as const, height: 90, marginTop: 4 }}>
        {/* Track line */}
        <div
          style={{
            position: 'absolute' as const, top: 38, left: 8, right: 8,
            height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1,
          }}
        />
        {/* Min / max labels */}
        <div style={{ position: 'absolute' as const, top: 43, left: 0, fontSize: 9, color: C.t4, fontFamily: MONO }}>
          {min}{unit}
        </div>
        <div style={{ position: 'absolute' as const, top: 43, right: 0, fontSize: 9, color: C.t4, fontFamily: MONO }}>
          {max}{unit}
        </div>
        {/* Dots */}
        {dots.map((dot, i) => {
          const pct = ((dot.val - min) / range) * 100;
          const above = i % 2 === 0; // alternate label side to reduce crowding
          return (
            <div
              key={i}
              style={{
                position: 'absolute' as const,
                left: `${pct}%`,
                top: 0,
                transform: 'translateX(-50%)',
              }}
            >
              {above && (
                <div style={{ textAlign: 'center' as const, marginBottom: 2 }}>
                  <div style={{ fontSize: 9, color: dot.color, fontFamily: SANS, whiteSpace: 'nowrap' as const }}>
                    {dot.name}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: dot.color, fontFamily: MONO, whiteSpace: 'nowrap' as const }}>
                    {dot.val}{unit}
                  </div>
                </div>
              )}
              {/* Dot */}
              <div
                style={{
                  width: 10, height: 10, borderRadius: '50%', background: dot.color,
                  boxShadow: `0 0 8px ${dot.color}70`,
                  margin: above ? '0 auto' : '26px auto 0',
                }}
              />
              {!above && (
                <div style={{ textAlign: 'center' as const, marginTop: 4 }}>
                  <div style={{ fontSize: 9, color: dot.color, fontFamily: SANS, whiteSpace: 'nowrap' as const }}>
                    {dot.name}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: dot.color, fontFamily: MONO, whiteSpace: 'nowrap' as const }}>
                    {dot.val}{unit}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {chips && chips.length > 0 && <ChipRow chips={chips} />}
    </div>
  );
}

// ─── Proportion ──────────────────────────────────────────────────────────────
// Horizontal split bar showing left/right percentage breakdown
// Used for: Q13
function Proportion({ leftPct, leftLabel, leftValue, leftColor, rightPct, rightLabel, rightValue, rightColor, chips }: {
  leftPct: number; leftLabel: string; leftValue: string; leftColor: string;
  rightPct: number; rightLabel: string; rightValue: string; rightColor: string;
  chips?: KeyHighlightChip[];
}) {
  return (
    <div>
      {/* Split bar */}
      <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 36, marginBottom: 8 }}>
        <div
          style={{
            width: `${leftPct}%`, background: leftColor + '38',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            paddingRight: 12,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: leftColor, fontFamily: MONO }}>
            {leftValue}
          </span>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
        <div
          style={{
            width: `${rightPct}%`, background: rightColor + '2A',
            display: 'flex', alignItems: 'center',
            paddingLeft: 12,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: rightColor, fontFamily: MONO }}>
            {rightValue}
          </span>
        </div>
      </div>
      {/* Labels */}
      <div style={{ display: 'flex', marginBottom: chips ? 4 : 0 }}>
        <div style={{ width: `${leftPct}%` }}>
          <span style={{ fontSize: 10, color: leftColor, fontFamily: SANS }}>
            {leftPct}% {leftLabel}
          </span>
        </div>
        <div style={{ width: `${rightPct}%`, paddingLeft: 10 }}>
          <span style={{ fontSize: 10, color: rightColor, fontFamily: SANS }}>
            {rightPct}% {rightLabel}
          </span>
        </div>
      </div>
      {chips && chips.length > 0 && <ChipRow chips={chips} />}
    </div>
  );
}

// ─── Ring ────────────────────────────────────────────────────────────────────
// Mini SVG donut ring showing an overall % + chips on the right
// Used for: Q10
function Ring({ pct, label, color, chips }: {
  pct: number; label: string; color: string;
  chips?: KeyHighlightChip[];
}) {
  const r      = 30;
  const cx     = 40;
  const cy     = 40;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      {/* Ring */}
      <div style={{ position: 'relative' as const, flexShrink: 0, width: 80, height: 80 }}>
        <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8} />
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={8}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            position: 'absolute' as const,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center' as const,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color, fontFamily: MONO }}>{pct}%</div>
        </div>
      </div>
      {/* Label + chips */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: C.t3, fontFamily: SANS, marginBottom: 10, lineHeight: 1.5 }}>
          {label}
        </div>
        {chips && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5 }}>
            {chips.map((chip, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'baseline', gap: 8,
                  padding: '7px 10px',
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 5,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: chip.color ?? C.t1, fontFamily: MONO }}>
                  {chip.value}
                </span>
                <span style={{ fontSize: 11, color: C.t4, fontFamily: SANS, lineHeight: 1.4 }}>
                  {chip.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ScorecardRows ───────────────────────────────────────────────────────────
// Per-item rows: name chip | mini bar | value | optional badge + sublabel
// Used for: Q3 (commitment), Q5 (EW categories), Q6 (open EWs), Q8 (NCEs), Q10 (variation implementation)
const BADGE_BG: Record<'green' | 'amber' | 'red', string> = {
  green: '#34D39918',
  amber: '#FBBF2418',
  red:   '#F0606018',
};
const BADGE_FG: Record<'green' | 'amber' | 'red', string> = {
  green: '#34D399',
  amber: '#FBBF24',
  red:   '#F06060',
};

function ScorecardRows({ items }: { items: ScorecardRow[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px',
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${item.color}`,
            borderRadius: 6,
          }}
        >
          {/* Name */}
          <span
            style={{
              fontSize: 11, fontWeight: 600, color: item.color,
              background: item.color + '1A', padding: '2px 7px',
              borderRadius: 4, fontFamily: SANS, flexShrink: 0, minWidth: 62,
              textAlign: 'center' as const,
            }}
          >
            {item.name}
          </span>

          {/* Mini bar */}
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${item.pct}%`,
                background: item.color,
                borderRadius: 2,
                opacity: 0.75,
              }}
            />
          </div>

          {/* Value */}
          <span style={{ fontSize: 13, fontWeight: 700, color: item.color, fontFamily: MONO, flexShrink: 0, minWidth: 52, textAlign: 'right' as const }}>
            {item.value}
          </span>

          {/* Badge */}
          {item.badge && item.badgeSeverity && (
            <span
              style={{
                fontSize: 10, fontWeight: 600,
                color: BADGE_FG[item.badgeSeverity],
                background: BADGE_BG[item.badgeSeverity],
                padding: '2px 7px', borderRadius: 4,
                fontFamily: SANS, flexShrink: 0, minWidth: 72,
                textAlign: 'center' as const,
              }}
            >
              {item.badge}
            </span>
          )}

          {/* Sublabel */}
          {item.sublabel && (
            <span style={{ fontSize: 10, color: C.t4, fontFamily: SANS, flexShrink: 0, minWidth: 80, textAlign: 'right' as const }}>
              {item.sublabel}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── FlagsList ───────────────────────────────────────────────────────────────
// Risk/alert rows: severity dot | description text | contract tag | date
// Used for: detailed risk context panels (vendor drill-downs, etc.)
const FLAG_COLOR: Record<FlagsListRow['severity'], string> = {
  red:   C.red,
  amber: C.amber,
  green: C.green,
};

function FlagsList({ items }: { items: FlagsListRow[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5 }}>
      {items.map((item, i) => {
        const color = FLAG_COLOR[item.severity];
        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '9px 12px',
              background: color + '0A',
              border: `1px solid ${color}25`,
              borderLeft: `3px solid ${color}`,
              borderRadius: 6,
            }}
          >
            <span
              style={{
                width: 7, height: 7, borderRadius: '50%', background: color,
                flexShrink: 0, marginTop: 5,
              }}
            />
            <span style={{ flex: 1, fontSize: 12, color: C.t2, fontFamily: SANS, lineHeight: 1.5 }}>
              {item.text}
            </span>
            <span
              style={{
                fontSize: 10, fontWeight: 600, color,
                background: color + '20', padding: '2px 7px',
                borderRadius: 4, fontFamily: SANS, flexShrink: 0,
              }}
            >
              {item.tag}
            </span>
            <span style={{ fontSize: 10, color: C.t4, fontFamily: MONO, flexShrink: 0, marginTop: 1 }}>
              {item.date}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── ComparisonRows ───────────────────────────────────────────────────────────
// Mini table: label column + N data columns, each row color-coded with a left border
// Used for: Q2 (contractor base/var breakdown), Q11 (quotation accepted vs submitted)
function ComparisonRows({ columns, rows }: { columns: string[]; rows: ComparisonRow[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5 }}>
      {/* Column headers */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 12px 6px',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ minWidth: 64 }} />
        {columns.map((col, i) => (
          <div
            key={i}
            style={{
              flex: 1, fontSize: 9, fontWeight: 600, color: C.t4,
              fontFamily: SANS, textTransform: 'uppercase' as const, letterSpacing: 0.6,
            }}
          >
            {col}
          </div>
        ))}
      </div>
      {/* Data rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px',
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${row.color ?? C.t4}`,
            borderRadius: 6,
          }}
        >
          <span
            style={{
              fontSize: 11, fontWeight: 600,
              color: row.color ?? C.t2,
              background: (row.color ?? C.t4) + '1A',
              padding: '2px 8px', borderRadius: 4,
              fontFamily: SANS, flexShrink: 0, minWidth: 64,
              textAlign: 'center' as const,
            }}
          >
            {row.label}
          </span>
          {row.cells.map((cell, j) => (
            <span key={j} style={{ flex: 1, fontSize: 13, fontWeight: 700, color: row.color ?? C.t1, fontFamily: MONO }}>
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Takeaway ─────────────────────────────────────────────────────────────────
// Synthesised insight sentence — rendered below any block that provides one
function Takeaway({ text }: { text: string }) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.015)',
        border: `1px solid ${C.border}`,
        borderLeft: '2px solid rgba(100,116,139,0.35)',
        borderRadius: 5,
      }}
    >
      <span
        style={{
          fontSize: 10, fontWeight: 700, color: C.t4,
          fontFamily: SANS, letterSpacing: 0.5,
          textTransform: 'uppercase' as const, marginRight: 8,
        }}
      >
        Takeaway
      </span>
      <span style={{ fontSize: 11, color: C.t3, fontFamily: SANS, lineHeight: 1.6 }}>
        {text}
      </span>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function KeyHighlights({ block }: { block?: KeyHighlightBlock }) {
  if (!block) return null;

  const inner = (() => {
    switch (block.type) {
      case 'stats':           return <Stats items={block.items} />;
      case 'ranked':          return <Ranked items={block.items} />;
      case 'chips':           return <Chips items={block.items} />;
      case 'badges':          return <Badges items={block.items} />;
      case 'dot-strip':       return <DotStrip min={block.min} max={block.max} unit={block.unit} dots={block.dots} chips={block.chips} />;
      case 'proportion':      return <Proportion leftPct={block.leftPct} leftLabel={block.leftLabel} leftValue={block.leftValue} leftColor={block.leftColor} rightPct={block.rightPct} rightLabel={block.rightLabel} rightValue={block.rightValue} rightColor={block.rightColor} chips={block.chips} />;
      case 'ring':            return <Ring pct={block.pct} label={block.label} color={block.color} chips={block.chips} />;
      case 'scorecard-rows':  return <ScorecardRows items={block.items} />;
      case 'flags-list':      return <FlagsList items={block.items} />;
      case 'comparison-rows': return <ComparisonRows columns={block.columns} rows={block.rows} />;
      default:                return null;
    }
  })();

  if (!block.takeaway) return inner;

  return (
    <div>
      {inner}
      <Takeaway text={block.takeaway} />
    </div>
  );
}
