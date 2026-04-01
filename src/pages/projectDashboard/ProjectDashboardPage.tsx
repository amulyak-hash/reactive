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
} from '../../mocks/workspace.mock';

import { pageStyles as S } from './styles';

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
            <span style={S.qNum}>{QUESTIONS[0].number}</span>
            <p style={S.qText}>{QUESTIONS[0].text}</p>
          </div>
          <div style={S.vizWrap}>
            <ContractValueOrb data={contractData} data-testid="viz-contract-value-orb" />
          </div>
          <p style={S.insight}>
            Total portfolio commitment is{' '}
            <strong style={S.highlight}>£{contractData.totals.totalCommitment}M</strong> — £{contractData.totals.base}M
            base value plus £{contractData.totals.variations}M in approved variations.
            Each bar shows one contractor's total; the solid segment is base value, the lighter segment is variations.
          </p>
        </section>

        {/* Q2 */}
        <section data-testid="dashboard-q2" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[1].number}</span>
            <p style={S.qText}>{QUESTIONS[1].text}</p>
          </div>
          <div style={S.vizWrap}>
            <ContractBars contractors={contractData.contractors} data-testid="viz-contract-bars" />
          </div>
          <p style={S.insight}>
            Each triangle maps three KPIs per contractor — Base value (top), Variations (lower-right),
            Commitment % (lower-left). <strong style={S.highlight}>L&T's constellation is the widest</strong>{' '}
            at £210.6M base; KEC's top corner is notably shorter, reflecting its smaller base relative to peers.
            Hover any star for the exact figure.
          </p>
        </section>

        {/* Q3 */}
        <section data-testid="dashboard-q3" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[2].number}</span>
            <p style={S.qText}>{QUESTIONS[2].text}</p>
          </div>
          <div style={S.vizWrap}>
            <CommitmentRace contractors={contractData.contractors} data-testid="viz-commitment-race" />
          </div>
          <p style={S.insight}>
            <strong style={S.highlight}>NCC Ltd leads at 95%</strong> commitment, closely followed by
            L&T at 92%. KEC International lags at 69% — the widest gap from the finish line and the
            highest variation-to-base ratio in the portfolio.
          </p>
        </section>

        {/* Q4 */}
        <section data-testid="dashboard-q4" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[3].number}</span>
            <p style={S.qText}>{QUESTIONS[3].text}</p>
          </div>
          <div style={{ ...S.vizWrap, justifyContent: 'center' }}>
            <StatusArc
              segments={ewStatusData}
              title="Early Warning Status Split"
              data-testid="viz-ew-status-arc"
            />
          </div>
          <p style={S.insight}>
            40 Early Warnings total. <strong style={S.highlight}>18 remain Open (45%)</strong> — the
            largest cohort — while 12 are Closed and 10 are Submitted awaiting decision.
            Hover each segment for counts and percentages.
          </p>
        </section>

        {/* Q5 */}
        <section data-testid="dashboard-q5" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[4].number}</span>
            <p style={S.qText}>{QUESTIONS[4].text}</p>
          </div>
          <div style={S.vizWrap}>
            <EWCategory categories={ewCategoryData} data-testid="viz-ew-category" />
          </div>
          <p style={S.insight}>
            <strong style={S.highlight}>Ground Conditions dominate with 12 EWs</strong> — 30% of all
            warnings. Design Issues follow at 8. Each dot in the column represents one Early Warning;
            the tallest column is the hotspot.
          </p>
        </section>

        {/* Q6 */}
        <section data-testid="dashboard-q6" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[5].number}</span>
            <p style={S.qText}>{QUESTIONS[5].text}</p>
          </div>
          <div style={S.vizWrap}>
            <ContractorRank contractors={ewOpenByContractor} data-testid="viz-contractor-rank" />
          </div>
          <p style={S.insight}>
            <strong style={S.highlight}>Tata Projects has 7 open EWs</strong> — more than the next two
            contractors combined. The red shading intensifies toward the right, marking the danger zone.
            Rank badges on the left show relative exposure.
          </p>
        </section>

        {/* Q7 */}
        <section data-testid="dashboard-q7" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[6].number}</span>
            <p style={S.qText}>{QUESTIONS[6].text}</p>
          </div>
          <div style={S.vizWrap}>
            <SeverityBands severities={ewSeverityData} data-testid="viz-severity-bands" />
          </div>
          <p style={S.insight}>
            The spectrum runs Critical → High → Medium → Low. <strong style={S.highlight}>High severity
            is the widest band at 14 EWs (35%)</strong>, with Medium close behind at 13. Only 5 are
            Critical — but those 5 are unresolved.
          </p>
        </section>

        {/* Q8 */}
        <section data-testid="dashboard-q8" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[7].number}</span>
            <p style={S.qText}>{QUESTIONS[7].text}</p>
          </div>
          <div style={S.vizWrap}>
            <NCETree
              total={nceCompensationData.total}
              byContractor={nceByContractor}
              data-testid="viz-nce-tree"
            />
          </div>
          <p style={S.insight}>
            25 NCEs total. <strong style={S.highlight}>Tata Projects raised 8 (32%)</strong> — the
            thickest branch in the tree. Branch thickness is proportional to NCE count; leaf node size
            reflects share of total.
          </p>
        </section>

        {/* Q9 */}
        <section data-testid="dashboard-q9" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[8].number}</span>
            <p style={S.qText}>{QUESTIONS[8].text}</p>
          </div>
          <div style={{ ...S.vizWrap, justifyContent: 'center' }}>
            <CompensationGauge
              pct={nceCompensationData.pctConfirmed}
              confirmed={nceCompensationData.confirmed}
              total={nceCompensationData.total}
              data-testid="viz-compensation-gauge"
            />
          </div>
          <p style={S.insight}>
            <strong style={S.highlight}>60% of NCEs (15 of 25) are confirmed compensation events.</strong>{' '}
            The needle sweeps to the amber-to-green boundary. The 10 unconfirmed NCEs remain contested
            and represent potential future claim value.
          </p>
        </section>

        {/* Q10 */}
        <section data-testid="dashboard-q10" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[9].number}</span>
            <p style={S.qText}>{QUESTIONS[9].text}</p>
          </div>
          <div style={S.vizWrap}>
            <VariationSplit contractors={variationByContractor} data-testid="viz-variation-split" />
          </div>
          <p style={S.insight}>
            <strong style={S.highlight}>NCC Ltd has the best implementation rate</strong> — 11 of 13
            variations actioned. Afcons Infra is the weakest: 9 unimplemented against only 5 completed,
            flagging contract delivery risk.
          </p>
        </section>

        {/* Q11 */}
        <section data-testid="dashboard-q11" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[10].number}</span>
            <p style={S.qText}>{QUESTIONS[10].text}</p>
          </div>
          <div style={{ ...S.vizWrap, justifyContent: 'center' }}>
            <QuotationBalance
              accepted={quotationSummary.accepted}
              submitted={quotationSummary.submitted}
              data-testid="viz-quotation-balance"
            />
          </div>
          <p style={S.insight}>
            The balance tips toward accepted: <strong style={S.highlight}>£28.4M accepted (31 quotations)</strong>{' '}
            vs £19.8M submitted and pending (22 quotations). The tilt of the beam encodes the value
            gap — a healthy acceptance rate.
          </p>
        </section>

        {/* Q12 */}
        <section data-testid="dashboard-q12" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[11].number}</span>
            <p style={S.qText}>{QUESTIONS[11].text}</p>
          </div>
          <div style={S.vizWrap}>
            <QuotationTrend trend={quotationTrend} data-testid="viz-quotation-trend" />
          </div>
          <p style={S.insight}>
            Submissions are accelerating. <strong style={S.highlight}>Week 12 hit 9 submissions</strong> —
            the highest in the 12-week window. The upward trend since W8 suggests contract activity
            is entering a peak claim period. Hover peaks to see weekly values.
          </p>
        </section>

        {/* Q13 */}
        <section data-testid="dashboard-q13" style={S.block}>
          <div style={S.questionRow}>
            <span style={S.qNum}>{QUESTIONS[12].number}</span>
            <p style={S.qText}>{QUESTIONS[12].text}</p>
          </div>
          <div style={S.vizWrap}>
            <WeeklyFlow contractors={contractData.contractors} data-testid="viz-weekly-flow" />
          </div>
          <p style={S.insight}>
            The flow shows each contractor's base and variation contributions converging into
            <strong style={S.highlight}> £752.2M total commitment</strong>. L&T and NCC anchor the
            base column; KEC contributes a disproportionately large variation stream relative to base.
            Hover contractor nodes for full breakdowns.
          </p>
        </section>

      </main>
    </div>
  );
}
