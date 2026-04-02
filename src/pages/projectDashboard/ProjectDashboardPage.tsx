import { useEffect } from 'react';

import { ContractValueOrb }    from '../../components/contractValueOrb';
import { ContractBars }         from '../../components/contractBars';
import { CommitmentRace }       from '../../components/commitmentRace';
import { StatusArc }            from '../../components/statusArc';
import { EWCategory }           from '../../components/ewCategory';
import { ContractorRank }       from '../../components/contractorRank';
import { SeverityBands }        from '../../components/severityBands';
import { NCETree }              from '../../components/nceTree';
import { CompensationGauge }    from '../../components/compensationGauge';
import { VariationSplit }       from '../../components/variationSplit';
import { QuotationBalance }     from '../../components/quotationBalance';
import { QuotationTrend }       from '../../components/quotationTrend';
import { WeeklyFlow }           from '../../components/weeklyFlow';
import { KeyHighlights }        from '../../components/keyHighlights/KeyHighlights';

import {
  contractData,
  ewStatusData,
  ewCategoryData,
  ewSeverityData,
  ewOpenByContractor,
  nceByContractor,
  nceCompensationData,
  variationByContractor,
  quotationSummary,
  quotationTrend,
  NARRATIVE_CHAIN,
} from '../../mocks/workspace.mock';

import type { KeyHighlightBlock } from '../../types';
import { pageStyles as S } from './styles';

// ─── Highlights map ───────────────────────────────────────────────────────────
// All 13 visuals — expanded context with 4–5 data points and a Takeaway per block

const HIGHLIGHTS: Record<string, KeyHighlightBlock | undefined> = {

  // Q1 — ContractValueOrb: 5 portfolio-level stats + takeaway
  q1: {
    type: 'stats',
    items: [
      { value: '£752.2M', label: 'total portfolio commitment — base plus all approved variations', color: '#3B8BF6' },
      { value: '£659M',   label: 'base contract value across all 5 active contractors',            color: '#22D3EE' },
      { value: '£93.2M',  label: 'variations approved — 12.4% on top of base contract value',     color: '#FBBF24' },
      { value: 'L&T',     label: 'largest share at £210.6M total — 28% of the full portfolio',    color: '#A78BFA' },
      { value: 'KEC 42%', label: 'highest variation-to-base ratio — 3× the portfolio average',    color: '#34D399' },
    ],
    takeaway: 'L&T and NCC together anchor 50% of portfolio value. KEC\'s 42% variation ratio is 3× the average — the clearest single-contractor risk flag.',
  },

  // Q2 — ContractBars: all 5 contractors — base, variations, var % as a comparison table
  q2: {
    type: 'comparison-rows',
    columns: ['Base', 'Variations', 'Var %'],
    rows: [
      { label: 'L&T',    cells: ['£198M', '£12.6M', '6%'],  color: '#22D3EE' },
      { label: 'NCC',    cells: ['£156M', '£8.9M',  '6%'],  color: '#A78BFA' },
      { label: 'Tata',   cells: ['£142M', '£18.4M', '13%'], color: '#3B8BF6' },
      { label: 'Afcons', cells: ['£89M',  '£22.1M', '25%'], color: '#FBBF24' },
      { label: 'KEC',    cells: ['£74M',  '£31.2M', '42%'], color: '#34D399' },
    ],
    takeaway: 'KEC\'s 42% variation-to-base ratio is 7× higher than L&T and NCC — the most exposed contractor despite holding the smallest base.',
  },

  // Q3 — CommitmentRace: portfolio-level analytical view — avg, spread, threshold, cross-metric link
  q3: {
    type: 'chips',
    items: [
      { value: '84%',    label: 'portfolio-weighted average commitment — 16 points below full close', color: '#3B8BF6' },
      { value: '26 pts', label: 'spread from NCC (95%) to KEC (69%) — widest performance gap',       color: '#FBBF24' },
      { value: '2 of 5', label: 'contractors below the 80% target — Afcons at 78% and KEC at 69%',  color: '#F06060' },
    ],
    takeaway: 'The 26-point spread signals a deeply uneven portfolio — KEC\'s 42% variation ratio is the primary factor keeping its commitment furthest from the finish line.',
  },

  // Q4 — StatusArc: 4 chips — total count + all 3 statuses + resolution rate + takeaway
  q4: {
    type: 'chips',
    items: [
      { value: '40 EWs',  label: 'total Early Warnings active across all 5 contractors right now',      color: '#94A3B8' },
      { value: '18 Open', label: '45% still active and unresolved — risk actively in flight',           color: '#F06060' },
      { value: '10 Stuck',label: 'submitted but awaiting decision — in commercial or legal limbo',      color: '#FBBF24' },
      { value: '30%',     label: 'resolution rate — only 12 of 40 EWs fully closed to date',           color: '#34D399' },
    ],
    takeaway: '70% of EWs remain live — the combined open and pending backlog will convert to NCEs if commercial decisions are not accelerated across the portfolio.',
  },

  // Q5 — EWCategory: all 5 categories with relative bar + share sublabel + takeaway
  q5: {
    type: 'scorecard-rows',
    items: [
      { name: 'Ground',     value: '12 EWs', pct: 100, color: '#3B8BF6', sublabel: '30% of portfolio — dominant category' },
      { name: 'Design',     value: '8 EWs',  pct: 67,  color: '#22D3EE', sublabel: '20% — often contractor-caused' },
      { name: 'Employer',   value: '7 EWs',  pct: 58,  color: '#FBBF24', sublabel: '17.5% — slowest category to resolve' },
      { name: 'Weather',    value: '6 EWs',  pct: 50,  color: '#A78BFA', sublabel: '15% — force majeure risk profile' },
      { name: 'Regulatory', value: '5 EWs',  pct: 42,  color: '#34D399', sublabel: '12.5% — compliance-driven' },
    ],
    takeaway: 'Ground Conditions (30%) and Design Issues (20%) account for half of all EWs — both categories are strongly correlated with NCE escalation in construction contracts.',
  },

  // Q6 — ContractorRank: all 5 contractors with open EW count, bar, risk badge, share + takeaway
  q6: {
    type: 'scorecard-rows',
    items: [
      { name: 'Tata',   value: '7 open', pct: 100, color: '#3B8BF6', badge: 'High risk',   badgeSeverity: 'red',   sublabel: '39% of all open EWs' },
      { name: 'Afcons', value: '4 open', pct: 57,  color: '#FBBF24', badge: 'Elevated',    badgeSeverity: 'amber', sublabel: '22% — combined 61%' },
      { name: 'L&T',    value: '3 open', pct: 43,  color: '#22D3EE', badge: 'Moderate',    badgeSeverity: 'amber', sublabel: '17% share' },
      { name: 'NCC',    value: '2 open', pct: 29,  color: '#A78BFA', badge: 'Low risk',    badgeSeverity: 'green', sublabel: '11% — well managed' },
      { name: 'KEC',    value: '2 open', pct: 29,  color: '#34D399', badge: 'Low risk',    badgeSeverity: 'green', sublabel: '11% — well managed' },
    ],
    takeaway: 'Tata holds 39% of open EWs — resolving Tata\'s backlog alone would reduce the total portfolio open count by over a third in a single action.',
  },

  // Q7 — SeverityBands: 4 badges covering Critical / High / Medium / Low + takeaway
  q7: {
    type: 'badges',
    items: [
      { text: '5 Critical — all currently unresolved, highest escalation and adjudication risk in the portfolio', severity: 'red'   },
      { text: '14 High severity — at risk of escalating to Critical without active commercial intervention',      severity: 'amber' },
      { text: '13 Medium severity — significant volume, close monitoring required across all 5 contractors',      severity: 'amber' },
      { text: '8 Low severity — flagged for awareness only, no immediate financial or schedule exposure',         severity: 'green' },
    ],
    takeaway: 'Critical + High EWs (19 total) account for 47.5% of the portfolio — all 5 Critical items remain unresolved, sustaining elevated escalation risk.',
  },

  // Q8 — NCETree: all 5 contractors with NCE count, proportional bar, share sublabel + takeaway
  q8: {
    type: 'scorecard-rows',
    items: [
      { name: 'Tata',   value: '8 NCEs', pct: 100, color: '#3B8BF6', sublabel: '32% of total — highest raiser' },
      { name: 'Afcons', value: '6 NCEs', pct: 75,  color: '#FBBF24', sublabel: '24% — Tata + Afcons = 56%' },
      { name: 'L&T',    value: '4 NCEs', pct: 50,  color: '#22D3EE', sublabel: '16% share' },
      { name: 'NCC',    value: '4 NCEs', pct: 50,  color: '#A78BFA', sublabel: '16% share' },
      { name: 'KEC',    value: '3 NCEs', pct: 38,  color: '#34D399', sublabel: '12% — fewest despite highest var ratio' },
    ],
    takeaway: 'Tata\'s NCE concentration (32%) mirrors its EW exposure (39%) — both metrics converge on the same contractor as the portfolio\'s primary risk driver.',
  },

  // Q9 — CompensationGauge: 4 badges — 2 risk signals + 1 amber reading + 1 confirmed positive + takeaway
  q9: {
    type: 'badges',
    items: [
      { text: '10 NCEs unconfirmed — each a potential adjudication trigger and active financial liability', severity: 'red'   },
      { text: '40% dispute rate — above typical 25% benchmark, signals contractor commercial aggression',  severity: 'red'   },
      { text: '60% confirmation rate — at the amber-zone boundary, below the target performance threshold', severity: 'amber' },
      { text: '15 NCEs confirmed — obligations legally established, budgeted and approved for payment',     severity: 'green' },
    ],
    takeaway: 'The 40% dispute rate exceeds typical benchmarks — 10 contested NCEs represent the portfolio\'s most volatile and unpredictable financial exposure.',
  },

  // Q10 — VariationSplit: portfolio-level analytical view — overall rate, pending backlog, spread, concentration
  q10: {
    type: 'chips',
    items: [
      { value: '59%',    label: 'overall portfolio implementation rate — 42 of 71 variations actioned', color: '#34D399' },
      { value: '29',     label: 'variations still pending across all contractors — unresolved backlog',  color: '#F06060' },
      { value: '49 pts', label: 'spread from NCC (85%) to Afcons (36%) — largest discipline gap',       color: '#FBBF24' },
    ],
    takeaway: 'Afcons\' 9 and KEC\'s 8 pending variations together account for 59% of the entire unimplemented backlog — two contractors are driving most of the portfolio\'s delivery risk.',
  },

  // Q11 — QuotationBalance: 3-row comparison table (Accepted / Submitted / Gap) with Value, Count, Avg deal
  q11: {
    type: 'comparison-rows',
    columns: ['Value', 'Count', 'Avg deal'],
    rows: [
      { label: 'Accepted',  cells: ['£28.4M', '31 quotes', '~£916K'], color: '#34D399' },
      { label: 'Submitted', cells: ['£19.8M', '22 quotes', '~£900K'], color: '#FBBF24' },
      { label: 'Gap (+)',   cells: ['+£8.6M', '+9 quotes', '—'],       color: '#3B8BF6' },
    ],
    takeaway: 'The £19.8M pending pipeline represents 41% of already-accepted value — resolution of submitted quotations will define the quarter\'s commercial outcome.',
  },

  // Q12 — QuotationTrend: 5 stats — totals, peak week, growth factor, peak value, acceleration + takeaway
  q12: {
    type: 'stats',
    items: [
      { value: '57',    label: 'total submissions over the 12-week window',                    color: '#22D3EE' },
      { value: '9',     label: 'Week 12 peak — highest single-week volume on record',          color: '#3B8BF6' },
      { value: '4.5×',  label: 'W12 vs W1 growth factor — acceleration across 12 weeks',      color: '#FBBF24' },
      { value: '£8.3M', label: 'Week 12 value — highest-value week in the 12-week window',    color: '#34D399' },
      { value: '+80%',  label: 'W11→W12 final-week acceleration — sharpest single-step jump', color: '#F06060' },
    ],
    takeaway: 'Week 12 alone accounts for 16% of all 12-week submissions at the highest value on record — the claim period is entering its most active phase.',
  },

  // Q13 — WeeklyFlow: proportion split + 4 chips covering KEC, Afcons, total var value, concentration count
  q13: {
    type: 'proportion',
    leftPct: 88,
    leftLabel: 'Base Value',
    leftValue: '£659M',
    leftColor: '#3B8BF6',
    rightPct: 12,
    rightLabel: 'Variations',
    rightValue: '£93.2M',
    rightColor: '#FBBF24',
    chips: [
      { value: 'KEC 42%',    label: 'highest variation-to-base ratio — 3× the portfolio average',       color: '#34D399' },
      { value: 'Afcons 25%', label: 'second-highest — KEC + Afcons together drive 57% of variation value', color: '#FBBF24' },
      { value: '£93.2M',     label: 'total approved variations — equivalent to adding a 6th mid-size contractor', color: '#22D3EE' },
      { value: '2 of 5',     label: 'contractors above 20% variation rate — concentrated in the bottom tier', color: '#A78BFA' },
    ],
    takeaway: 'KEC and Afcons contribute 57% of all variation value despite holding only 23% of base contract value — the portfolio\'s primary financial concentration risk.',
  },
};

// ─── Questions list ───────────────────────────────────────────────────────────
const QUESTIONS: Array<{ id: string; number: string; text: string }> = [
  { id: 'q1',  number: '01', text: 'What is the total contract value across all vendors?' },
  { id: 'q2',  number: '02', text: 'Show the contract value breakdown per vendor' },
  { id: 'q3',  number: '03', text: 'Which vendors have the highest total commitment percentage?' },
  { id: 'q4',  number: '04', text: 'What is the current split of Early Warnings by status (Open / Closed / Submitted)?' },
  { id: 'q5',  number: '05', text: 'Which category has the most Early Warnings?' },
  { id: 'q6',  number: '06', text: 'Which contractor has the most open Early Warnings?' },
  { id: 'q7',  number: '07', text: 'Show the distribution of Early Warning severity' },
  { id: 'q8',  number: '08', text: 'How many NCEs has each contractor raised?' },
  { id: 'q9',  number: '09', text: 'What % of NCEs are confirmed as compensation events?' },
  { id: 'q10', number: '10', text: 'Show implemented vs unimplemented variations per contractor' },
  { id: 'q11', number: '11', text: 'What is the total value of accepted vs submitted quotations?' },
  { id: 'q12', number: '12', text: 'Show the trend of quotations submitted over time' },
  { id: 'q13', number: '13', text: 'Show the full weekly report — base value, variations, and total commitment per contractor' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ProjectDashboardPage() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div data-testid="project-dashboard-page" style={S.page}>
      {/* Header */}
      <header data-testid="project-dashboard-header" style={S.header}>
        <div style={S.headerInner}>
          <p style={S.headerEyebrow}>Contract Intelligence</p>
          <h1 style={S.headerTitle}>Project Dashboard</h1>
          <p style={S.headerSubtitle}>
            13 questions. Contract values, Early Warnings, NCEs, Variations and Quotations — all in one view.
          </p>
        </div>
      </header>

      {/* Question stream */}
      <main data-testid="project-dashboard-main" style={S.main}>

        {/* Q1 */}
        <section data-testid="dashboard-q1" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[0]!.number}</span>
            <p style={S.qText}>{QUESTIONS[0]!.text}</p>
          </div>
          <div style={S.vizWrap}>
            <ContractValueOrb data={contractData} data-testid="viz-contract-value-orb" />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q1} />
          </div>
        </section>

        {/* Q2 */}
        <section data-testid="dashboard-q2" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[1]!.number}</span>
            <p style={S.qText}>{QUESTIONS[1]!.text}</p>
          </div>
          <div style={S.vizWrap}>
            <ContractBars contractors={contractData.contractors} data-testid="viz-contract-bars" />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q2} />
          </div>
        </section>

        {/* Q3 */}
        <section data-testid="dashboard-q3" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[2]!.number}</span>
            <p style={S.qText}>{QUESTIONS[2]!.text}</p>
          </div>
          <div style={S.vizWrap}>
            <CommitmentRace contractors={contractData.contractors} data-testid="viz-commitment-race" />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q3} />
          </div>
        </section>

        {/* Q4 */}
        <section data-testid="dashboard-q4" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[3]!.number}</span>
            <p style={S.qText}>{QUESTIONS[3]!.text}</p>
          </div>
          <div style={{ ...S.vizWrap, justifyContent: 'center' }}>
            <StatusArc
              segments={ewStatusData}
              title="Early Warning Status Split"
              data-testid="viz-ew-status-arc"
            />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q4} />
          </div>
        </section>

        {/* Q5 */}
        <section data-testid="dashboard-q5" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[4]!.number}</span>
            <p style={S.qText}>{QUESTIONS[4]!.text}</p>
          </div>
          <div style={S.vizWrap}>
            <EWCategory categories={ewCategoryData} data-testid="viz-ew-category" />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q5} />
          </div>
        </section>

        {/* Q6 */}
        <section data-testid="dashboard-q6" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[5]!.number}</span>
            <p style={S.qText}>{QUESTIONS[5]!.text}</p>
          </div>
          <div style={S.vizWrap}>
            <ContractorRank contractors={ewOpenByContractor} data-testid="viz-contractor-rank" />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q6} />
          </div>
        </section>

        {/* Q7 */}
        <section data-testid="dashboard-q7" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[6]!.number}</span>
            <p style={S.qText}>{QUESTIONS[6]!.text}</p>
          </div>
          <div style={S.vizWrap}>
            <SeverityBands severities={ewSeverityData} data-testid="viz-severity-bands" />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q7} />
          </div>
        </section>

        {/* Q8 */}
        <section data-testid="dashboard-q8" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[7]!.number}</span>
            <p style={S.qText}>{QUESTIONS[7]!.text}</p>
          </div>
          <div style={S.vizWrap}>
            <NCETree
              total={nceCompensationData.total}
              byContractor={nceByContractor}
              data-testid="viz-nce-tree"
            />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q8} />
          </div>
        </section>

        {/* Q9 */}
        <section data-testid="dashboard-q9" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[8]!.number}</span>
            <p style={S.qText}>{QUESTIONS[8]!.text}</p>
          </div>
          <div style={{ ...S.vizWrap, justifyContent: 'center' }}>
            <CompensationGauge
              pct={nceCompensationData.pctConfirmed}
              confirmed={nceCompensationData.confirmed}
              total={nceCompensationData.total}
              data-testid="viz-compensation-gauge"
            />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q9} />
          </div>
        </section>

        {/* Q10 */}
        <section data-testid="dashboard-q10" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[9]!.number}</span>
            <p style={S.qText}>{QUESTIONS[9]!.text}</p>
          </div>
          <div style={S.vizWrap}>
            <VariationSplit contractors={variationByContractor} data-testid="viz-variation-split" />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q10} />
          </div>
        </section>

        {/* Q11 */}
        <section data-testid="dashboard-q11" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[10]!.number}</span>
            <p style={S.qText}>{QUESTIONS[10]!.text}</p>
          </div>
          <div style={{ ...S.vizWrap, justifyContent: 'center' }}>
            <QuotationBalance
              accepted={quotationSummary.accepted}
              submitted={quotationSummary.submitted}
              data-testid="viz-quotation-balance"
            />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q11} />
          </div>
        </section>

        {/* Q12 */}
        <section data-testid="dashboard-q12" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[11]!.number}</span>
            <p style={S.qText}>{QUESTIONS[11]!.text}</p>
          </div>
          <div style={S.vizWrap}>
            <QuotationTrend trend={quotationTrend} data-testid="viz-quotation-trend" />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q12} />
          </div>
        </section>

        {/* Q13 */}
        <section data-testid="dashboard-q13" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[12]!.number}</span>
            <p style={S.qText}>{QUESTIONS[12]!.text}</p>
          </div>
          <div style={S.vizWrap}>
            <WeeklyFlow contractors={contractData.contractors} data-testid="viz-weekly-flow" />
          </div>
          <div style={S.highlightsWrap}>
            <p style={S.highlightsLabel}>Key Highlights</p>
            <KeyHighlights block={HIGHLIGHTS.q13} />
          </div>
        </section>

      </main>
    </div>
  );
}
