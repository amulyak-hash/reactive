import { C } from '../theme/tokens';

// ─── Enterprise Brain: Use-Case-Driven Contract Intelligence ───
// 8 use cases for Port Talbot EAF Transformation
// Each use case: question, AI answer, visualization data, budget/timeline impact

export const USE_CASES = [
  {
    id: 'uc-00',
    title: 'Contractor NCE Variation Analysis',
    shortTitle: 'NCE Variation',
    stage: 'Contract + NCE',
    accent: C.blue,
    zone: 'overview',
    camera: null,
    question: 'How much has each contractor\'s contract value shifted because of NCEs?',
    keywords: ['contractor', 'NCE', 'variation', 'shift', 'contract', 'value', 'deviation', 'changed', 'how', 'much'],
    sampleQuestions: [
      'Show me NCE deviations by contractor',
      'Which contractors have the highest NCE variation?',
      'Contract value shifts from NCEs',
    ],
    answer: `Portfolio of £720.6M across 5 contractors showing +£93.2M in NCE deviation (12.9% avg):

Afcons Infra — highest risk at 25% variation (£35.5M on £142M contract). 14 NCEs across access, design, and ground conditions
Tata Projects — £18.2M variation on £186.4M (9.8%). Controlled but volume-driven with 22 NCEs
NCC Ltd — 16% variation (£15.8M on £98.4M). Accelerating trend in last 3 months

RECOMMENDATION: Forensic review of Afcons (25% variation is an outlier). Tata Projects needs NCE rate monitoring. L&T's 6% variation is benchmark for well-managed contracts.`,
    vizType: 'nce-stacked-bars',
    vizTitle: 'Contract Value + NCE Variation by Contractor',
    vizData: {
      contractors: [
        {
          name: 'Tata Projects',
          originalValue: 186.4,
          nceVariation: 18.2,
          nceCount: 22,
          color: C.blue,
          ncesByClause: [
            { clause: 'Design changes', count: 9, value: 8.1, trend: [0, 0.8, 1.9, 3.2, 4.5, 5.8, 7.0, 8.1] },
            { clause: 'Access delays', count: 6, value: 4.8, trend: [0, 0.6, 1.2, 2.0, 2.8, 3.5, 4.2, 4.8] },
            { clause: 'Physical conditions', count: 4, value: 3.4, trend: [0, 0.4, 0.9, 1.4, 2.0, 2.5, 3.0, 3.4] },
            { clause: 'Weather', count: 3, value: 1.9, trend: [0, 0.3, 0.7, 0.6, 0.8, 1.7, 1.6, 1.9] },
          ],
          trend: [0, 2.1, 4.8, 7.2, 10.1, 13.5, 15.8, 18.2],
        },
        {
          name: 'Afcons Infra',
          originalValue: 142.0,
          nceVariation: 35.5,
          nceCount: 14,
          color: C.red,
          ncesByClause: [
            { clause: 'Ground conditions', count: 5, value: 15.2, trend: [0, 1.8, 4.2, 6.8, 9.1, 11.5, 13.2, 15.2] },
            { clause: 'Design changes', count: 4, value: 10.8, trend: [0, 1.2, 2.4, 4.1, 6.0, 8.2, 9.5, 10.8] },
            { clause: 'Access delays', count: 3, value: 6.1, trend: [0, 0.5, 1.0, 2.2, 3.0, 4.1, 5.2, 6.1] },
            { clause: 'Physical conditions', count: 2, value: 3.4, trend: [0, 0.3, 0.6, 1.0, 1.4, 1.4, 2.2, 3.4] },
          ],
          trend: [0, 3.8, 8.2, 14.1, 19.5, 25.2, 30.1, 35.5],
        },
        {
          name: 'L&T Construction',
          originalValue: 210.6,
          nceVariation: 12.6,
          nceCount: 8,
          color: C.green,
          ncesByClause: [
            { clause: 'Design changes', count: 4, value: 6.8, trend: [0, 0.6, 1.5, 2.4, 3.5, 4.8, 5.8, 6.8] },
            { clause: 'Access delays', count: 2, value: 3.2, trend: [0, 0.3, 0.7, 1.2, 1.6, 2.0, 2.6, 3.2] },
            { clause: 'Weather', count: 2, value: 2.6, trend: [0, 0.3, 0.6, 0.9, 1.1, 1.3, 2.0, 2.6] },
          ],
          trend: [0, 1.2, 2.8, 4.5, 6.2, 8.1, 10.4, 12.6],
        },
        {
          name: 'NCC Ltd',
          originalValue: 98.4,
          nceVariation: 15.8,
          nceCount: 11,
          color: C.orange,
          ncesByClause: [
            { clause: 'Physical conditions', count: 4, value: 7.2, trend: [0, 0.5, 1.2, 2.1, 3.4, 4.8, 6.0, 7.2] },
            { clause: 'Design changes', count: 3, value: 4.1, trend: [0, 0.3, 0.8, 1.4, 2.0, 2.8, 3.5, 4.1] },
            { clause: 'Access delays', count: 2, value: 2.8, trend: [0, 0.2, 0.5, 0.4, 1.2, 1.8, 2.2, 2.8] },
            { clause: 'Contractor delays', count: 2, value: 1.7, trend: [0, 0.1, 0, 0.3, 0.2, 0.1, 1.1, 1.7] },
          ],
          trend: [0, 1.1, 2.4, 4.2, 6.8, 9.5, 12.8, 15.8],
        },
        {
          name: 'KEC International',
          originalValue: 83.2,
          nceVariation: 11.1,
          nceCount: 9,
          color: C.amber,
          ncesByClause: [
            { clause: 'Design changes', count: 3, value: 4.5, trend: [0, 0.4, 1.0, 1.8, 2.5, 3.2, 3.9, 4.5] },
            { clause: 'Access delays', count: 3, value: 3.8, trend: [0, 0.3, 0.7, 1.2, 1.9, 2.5, 3.1, 3.8] },
            { clause: 'Physical conditions', count: 2, value: 1.9, trend: [0, 0.1, 0.2, 0.5, 0.8, 1.1, 1.4, 1.9] },
            { clause: 'Weather', count: 1, value: 0.9, trend: [0, 0, 0.2, 0.4, 0.6, 0.8, 0.8, 0.9] },
          ],
          trend: [0, 0.8, 2.1, 3.9, 5.8, 7.6, 9.2, 11.1],
        },
      ],
      totals: { portfolioValue: 720.6, totalNCE: 93.2, avgPct: 12.9 },
    },
    companionVizType: 'nce-detail-breakdown',
    companionVizData: 'use-primary', // Signals to use primary vizData
    cognitiveLoad: { without: '2-3 days across 47 packages', with: '10 seconds' },
    budgetImpact: { value: '£93.2M', detail: 'Total NCE deviation across 5 contractors on £720.6M portfolio', withoutAction: 93200, withAction: 45000, unit: '£K', savingsLabel: 'Targeted review could reduce NCE run-rate by ~50%' },
    timelineImpact: { value: '25% outlier', detail: 'Afcons at 25% NCE variation — 2x portfolio average', monthlyRisk: [0, 3.8, 8.2, 14.1, 19.5, 25.2, 30.1, 35.5], months: ['M0','M1','M2','M3','M4','M5','M6','M7'], label: 'Afcons NCE accumulation trajectory (£M)' },
    businessValue: 'Instant portfolio-level view of which contractors are shifting contract value through NCEs. The 25% outlier (Afcons) would take weeks to surface manually across 47 packages.',
  },

  {
    id: 'uc-01',
    title: 'Silent Budget Bleed Detection',
    shortTitle: 'Budget Bleed',
    stage: 'Contract + NCE',
    accent: C.red,
    zone: 'overview',
    camera: { position: [35, 25, 35], lookAt: [0, 2, 0] },
    question: 'Which packages are eating budget without raising any NCEs?',
    keywords: ['budget', 'bleed', 'spend', 'overrun', 'silent', 'NCE', 'burning', 'packages', 'eating', 'money', 'leaking'],
    sampleQuestions: [
      'Where is money leaking?',
      'Which contracts are over budget?',
      'Show me burn rate anomalies',
    ],
    answer: `3 packages burning budget with zero NCEs raised — £2.4M exposure:

Electrical Installation — 34% over plan, £1.8M projected overrun by Aug 2027
Civils Package B — £1,200/day above contract rate, £117K cumulative silent overrun
Fume Extraction Ductwork — 22% above BoQ rates on stainless steel sections

RECOMMENDATION: Raise PM Early Warning on all three. Proactive engagement avoids £2.4M in surprise bulk claims.`,
    companionVizType: 'overrun-trajectory',
    companionVizData: {
      packages: ['Electrical', 'Civils B', 'Fume Extract'],
      colors: [C.red, C.orange, C.amber],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      planned: [120, 240, 360, 480, 600, 720, 840, 960],
      actuals: [
        [122, 252, 403, 566, 744, 936, 1126, 1325],
        [118, 242, 385, 528, 672, 828, 991, 1152],
        [124, 259, 403, 552, 708, 864, 1025, 1171],
      ],
    },
    vizType: 'heatmap',
    vizTitle: 'Budget Burn Rate vs Planned Spend by Package',
    vizData: {
      packages: [
        { name: 'Electrical Installation', code: 'EI-01', nces: 0 },
        { name: 'Civils Package A', code: 'CV-A', nces: 3 },
        { name: 'Civils Package B', code: 'CV-B', nces: 0 },
        { name: 'Structural Steel', code: 'SS-01', nces: 5 },
        { name: 'Mechanical Install', code: 'MI-01', nces: 2 },
        { name: 'Fume Extraction Duct', code: 'FE-01', nces: 0 },
        { name: 'Piling Works', code: 'PW-01', nces: 4 },
        { name: 'HV Switchgear', code: 'HV-01', nces: 1 },
        { name: 'Refractory Lining', code: 'RF-01', nces: 7 },
        { name: 'Instrumentation', code: 'IN-01', nces: 2 },
      ],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      // ratio of actual/planned spend: 1.0 = on track, >1.25 = red
      rates: [
        [1.02, 1.05, 1.12, 1.18, 1.24, 1.30, 1.34, 1.38], // Electrical - bleeding
        [0.98, 0.99, 1.01, 1.03, 1.02, 1.01, 1.00, 1.02], // Civils A - ok
        [1.00, 1.04, 1.07, 1.10, 1.12, 1.15, 1.18, 1.20], // Civils B - bleeding
        [0.95, 0.97, 0.99, 1.02, 1.05, 1.03, 1.01, 1.00], // Structural - ok
        [1.01, 1.00, 1.02, 1.03, 1.01, 0.99, 1.02, 1.04], // Mechanical - ok
        [1.03, 1.08, 1.12, 1.15, 1.18, 1.20, 1.22, 1.22], // Fume Extract - bleeding
        [0.96, 0.98, 1.01, 1.04, 1.06, 1.03, 1.01, 0.99], // Piling - ok
        [0.99, 1.00, 1.01, 1.00, 1.02, 1.01, 0.99, 1.00], // HV - ok
        [1.02, 1.05, 1.08, 1.06, 1.04, 1.03, 1.05, 1.07], // Refractory - mild
        [0.97, 0.99, 1.00, 1.01, 1.02, 1.01, 1.00, 1.01], // Instrumentation - ok
      ],
    },
    cognitiveLoad: { without: '4-6 hours across 47 packages', with: '8 seconds' },
    budgetImpact: { value: '£2.4M', detail: 'Prevents surprise bulk claims by enabling early intervention', withoutAction: 2400, withAction: 800, unit: '£K', savingsLabel: '£1.6M saved via early detection' },
    timelineImpact: { value: 'Scope gaps', detail: 'Catches scope gaps before they cascade into programme delays', monthlyRisk: [0, 100, 200, 400, 800, 1200, 1600, 2400], months: ['M1','M2','M3','M4','M5','M6','M7','M8'], label: 'Cumulative overrun if undetected (£K)' },
    businessValue: 'Every month of delayed detection adds £400K in accumulated silent overrun. Early detection at month 3 saves £1.6M vs detection at month 7.',
  },

  {
    id: 'uc-02',
    title: 'Salami Slicing Pattern Detection',
    shortTitle: 'Salami Slicing',
    stage: 'NCE',
    accent: C.amber,
    zone: 'ladle',
    camera: null, // uses ZONE_PRESETS.ladle
    question: 'Are any contractors submitting lots of small NCEs that add up to something big?',
    keywords: ['salami', 'slicing', 'small', 'NCE', 'claims', 'cumulative', 'threshold', 'contractor', 'pattern', 'lots'],
    sampleQuestions: [
      'Who is salami slicing?',
      'Show me cumulative NCE patterns',
      'Are small claims adding up?',
    ],
    answer: `Classic salami-slicing pattern detected — RHI Magnesita:

7 NCEs in 4 months, each £18K-£47K (all below £50K threshold). Combined: £221K
Bid was 12% below next bidder (£1.2M vs £1.36M). Projected total: £990K — effective cost £830K MORE than alternative
Claims spread across 3 different clauses to avoid detection: access (3x), design (2x), physical conditions (2x)

RECOMMENDATION: Schedule forensic commercial review. Bid-stage pricing assumptions vs actual site conditions need challenge.`,
    companionVizType: 'clause-breakdown',
    companionVizData: {
      clauses: [
        { label: 'Access delays (60.1(2))', count: 3, total: 98, color: C.amber },
        { label: 'Design changes (60.1(1))', count: 2, total: 72, color: C.orange },
        { label: 'Physical conditions (60.1(12))', count: 2, total: 51, color: C.red },
      ],
      bidComparison: { rhi: 1200, nextBidder: 1360, projected: 2190 },
    },
    vizType: 'stacked-bars',
    vizTitle: 'Cumulative NCE Value per Contractor Over Time',
    vizData: {
      contractors: [
        { name: 'RHI Magnesita', bidGap: 160, isFlagged: true },
        { name: 'Keller Group', bidGap: 80, isFlagged: false },
        { name: 'Severfield', bidGap: 220, isFlagged: false },
        { name: 'William Hare', bidGap: 45, isFlagged: false },
        { name: 'Tenova', bidGap: 340, isFlagged: false },
      ],
      months: ['Jan', 'Feb', 'Mar', 'Apr'],
      // NCE values per month per contractor (£K)
      values: [
        [47, 38, 42, 94],   // RHI - salami pattern (94 = 2 NCEs in Apr)
        [0, 65, 0, 0],       // Keller
        [0, 0, 120, 0],      // Severfield
        [25, 0, 0, 30],      // William Hare
        [0, 0, 0, 180],      // Tenova
      ],
      clauseBreakdown: {
        'RHI Magnesita': [
          { clause: '60.1(2)', label: 'Access delays', count: 3, total: 98 },
          { clause: '60.1(1)', label: 'Design changes', count: 2, total: 72 },
          { clause: '60.1(12)', label: 'Physical conditions', count: 2, total: 51 },
        ],
      },
      threshold: 50, // £K escalation threshold
    },
    cognitiveLoad: { without: '141 hours (impossible across 47 contractors)', with: '6 seconds' },
    budgetImpact: { value: '£830K', detail: 'Identifies hidden cost recovery and prevents continued margin erosion', withoutAction: 2190, withAction: 1360, unit: '£K', savingsLabel: 'Effective contract: £2.19M vs £1.36M next bidder' },
    timelineImpact: { value: 'Low direct', detail: 'Prevents commercial relationship breakdown causing contractor disengagement', monthlyRisk: [0, 47, 85, 127, 221, 340, 500, 700, 990], months: ['M0','M1','M2','M3','M4','M6','M8','M10','M14'], label: 'Projected cumulative NCEs (£K)' },
    businessValue: 'The £160K "saving" from choosing the lowest bidder is actually a £830K loss. Enterprise Brain reframes the real cost of procurement decisions.',
  },

  {
    id: 'uc-03',
    title: 'Early Warning Response Time vs Cost',
    shortTitle: 'EW Response Cost',
    stage: 'Early Warning + NCE',
    accent: C.orange,
    zone: 'meltshop',
    camera: null, // uses ZONE_PRESETS.meltshop
    question: 'We have 12 open early warnings sitting without meetings. What is that costing us?',
    keywords: ['early', 'warning', 'EW', 'open', 'stale', 'meeting', 'response', 'cost', 'costing', 'sitting', 'delay'],
    sampleQuestions: [
      'What is the cost of stale early warnings?',
      'How much do delayed EW meetings cost?',
      'Show me the EW backlog impact',
    ],
    answer: `EW response time directly predicts cost — every day of inaction costs £59K:

≤5 days response → £68K avg CE. 6-14 days → £145K. 15+ days → £310K (4.5x)
12 open EWs at 19 days avg. Act this week: £580K. Wait 2 more weeks: £1.4M
3 highest-risk: EW-0042 (transformer), EW-0058 (piling), EW-0063 (steelwork clash)

RECOMMENDATION: Clear the EW backlog within 5 working days. Prioritize EW-0042, 0058, 0063 for Risk Reduction Meetings this week.`,
    companionVizType: 'cost-escalation',
    companionVizData: {
      bands: [
        { label: '≤5 days', cost: 68, count: 8, color: C.green },
        { label: '6-14 days', cost: 145, count: 10, color: C.amber },
        { label: '15+ days', cost: 310, count: 8, color: C.red },
      ],
      conversionRate: 0.38,
      currentOpen: 12,
      avgAge: 19,
    },
    vizType: 'scatter',
    vizTitle: 'Response Days vs Final CE Cost',
    vizData: {
      // Historical EWs: [days to response, CE cost £K, became CE?]
      historical: [
        [2, 45, true], [3, 52, true], [4, 78, true], [5, 85, true],
        [3, 0, false], [4, 0, false], [1, 0, false], [5, 0, false],
        [7, 110, true], [8, 135, true], [10, 155, true], [12, 180, true],
        [6, 0, false], [9, 0, false], [7, 0, false], [11, 0, false],
        [14, 190, true], [16, 280, true], [18, 295, true], [21, 340, true],
        [24, 380, true], [19, 310, true], [22, 350, true],
        [15, 0, false], [17, 0, false], [20, 0, false],
      ],
      // Current 12 open EWs: [days open, projected cost £K, id]
      current: [
        [19, 310, 'EW-0042'], [22, 350, 'EW-0058'], [18, 295, 'EW-0063'],
        [14, 190, 'EW-0071'], [21, 340, 'EW-0075'], [16, 280, 'EW-0079'],
        [19, 310, 'EW-0082'], [15, 230, 'EW-0085'], [20, 320, 'EW-0088'],
        [17, 285, 'EW-0091'], [23, 360, 'EW-0094'], [18, 300, 'EW-0097'],
      ],
      trendLine: { slope: 14.5, intercept: 15 }, // cost = slope * days + intercept (£K)
    },
    cognitiveLoad: { without: '8-hour manual analysis', with: '10 seconds' },
    budgetImpact: { value: '£820K', detail: 'Acting this week saves £820K compared to a 2-week delay. £59K/day cost of inaction.', withoutAction: 1400, withAction: 580, unit: '£K', savingsLabel: 'Act this week: £580K vs 2-week delay: £1.4M' },
    timelineImpact: { value: '22 days', detail: '3 of the 12 EWs are on the critical path, risking commissioning push to Q1 2028', monthlyRisk: [68, 68, 145, 145, 310, 310], months: ['≤5d','≤5d','6-14d','6-14d','15+d','15+d'], label: 'CE cost by EW response time (£K avg)' },
    businessValue: 'Transforms the Early Warning process from a compliance checkbox into a quantified financial lever. £59K/day cost of inaction gives the PM hard evidence to prioritize meetings.',
  },

  {
    id: 'uc-04',
    title: 'Coupled Risk Detection',
    shortTitle: 'Risk Cascade',
    stage: 'Early Warning + Timeline',
    accent: C.purple,
    zone: 'meltshop',
    camera: { position: [-3, 10, -18], lookAt: [-5.43, 3.11, -12.11] },
    question: 'What happens to the commissioning date if the EAF transformer is 6 weeks late?',
    keywords: ['cascade', 'coupled', 'risk', 'transformer', 'delay', 'late', 'commissioning', 'what', 'happens', 'weeks', 'EAF'],
    sampleQuestions: [
      'Show me the cascade from transformer delay',
      'What are the coupled risks?',
      'If transformer is late, what breaks?',
    ],
    answer: `6-week transformer delay cascades to 14 weeks and £24M total exposure:

Wk 0-6: Transformer delayed → EAF electrical +6 weeks
Wk 6-8: HV switchgear demob/remob £340K, +3 weeks. Wk 8-10: Fume extraction pushed sequential, +2 weeks
Wk 10-14: Hot commissioning delayed. Extended prelims £5.04M. Lost production £16.8M

RECOMMENDATION: Air-freight transformer (£800K) or parallel temp power (£1.2M). Both 95% cheaper than the £24M cascade.`,
    companionVizType: 'cost-decomposition',
    companionVizData: {
      segments: [
        { label: 'HV Switchgear demob', value: 340, color: C.amber },
        { label: 'Extended prelims', value: 5040, color: C.orange },
        { label: 'Direct delay costs', value: 1820, color: C.red },
        { label: 'Lost production margin', value: 16800, color: C.purple },
      ],
      mitigations: [
        { label: 'Air-freight', cost: 800, saves: 23200 },
        { label: 'Temp power', cost: 1200, saves: 22800 },
      ],
    },
    vizType: 'cascade',
    vizTitle: 'Delay Propagation Across Packages',
    vizData: {
      packages: [
        { name: 'EAF Transformer', start: 0, originalEnd: 6, cascadedEnd: 12, cost: 0, color: C.purple },
        { name: 'EAF Electrical', start: 6, originalEnd: 12, cascadedEnd: 18, cost: 0, color: C.orange },
        { name: 'HV Switchgear (ABB)', start: 12, originalEnd: 16, cascadedEnd: 22, cost: 340, color: C.amber },
        { name: 'Fume Extraction', start: 14, originalEnd: 18, cascadedEnd: 24, cost: 0, color: C.green },
        { name: 'Hot Commissioning', start: 18, originalEnd: 20, cascadedEnd: 34, cost: 5040, color: C.red },
      ],
      dependencies: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
        { from: 3, to: 4 },
      ],
      totalCost: 24000, // £K
      initialDelay: 6,  // weeks
      totalDelay: 14,    // weeks
    },
    cognitiveLoad: { without: '2-3 days of multi-person rescheduling', with: '12 seconds' },
    budgetImpact: { value: '£24M', detail: 'Identifies £24M total exposure. Recommends £1.2M mitigation — a 19x return.', withoutAction: 24000, withAction: 1200, unit: '£K', savingsLabel: '£1.2M mitigation prevents £24M cascade (19x ROI)' },
    timelineImpact: { value: '14 weeks', detail: 'Without intervention: commissioning delayed to March 2028. With mitigation: 2 weeks max (January 2028).', monthlyRisk: [0, 0, 0, 0, 0, 0, 7200, 7200, 9740, 9740, 14780, 14780, 24000, 24000], months: ['W0','','W6','','W8','','W10','','W12','','W14','','',''], label: 'Cascade cost accumulation by week (£K)' },
    businessValue: 'Humans see single-package delays. Enterprise Brain sees system-level cascades. The transformer is not a £200K problem — it is a £24M problem.',
  },

  {
    id: 'uc-05',
    title: 'NCE Validity Pre-Assessment',
    shortTitle: 'NCE Validity',
    stage: 'NCE',
    accent: C.cyan,
    zone: 'fumetreat',
    camera: null, // uses ZONE_PRESETS.fumetreat
    question: 'McAlpine just submitted an NCE for £400K claiming unforeseen ground conditions. Is this valid?',
    keywords: ['NCE', 'valid', 'validity', 'claim', 'ground', 'conditions', 'unforeseen', 'McAlpine', 'assess', 'submitted', 'contamination'],
    sampleQuestions: [
      'Is this NCE claim valid?',
      'Assess the ground conditions claim',
      'Should we accept or reject the NCE?',
    ],
    answer: `£400K claim is VALID but OVERPRICED — fair value £220K-£260K:

SUPPORTING: No boreholes in Zone C (nearest BH-14 is 85m away). Zones B & D flagged contamination 3 months ago (EW-0031, EW-0039)
AGAINST: McAlpine didn't raise EW despite Zones B & D contamination. Prelims rate £2,400/day vs £1,600-£1,900 benchmark. Last 3 CEs 35% above PM estimate

RECOMMENDATION: Accept NCE (genuine survey gap), apply clause 63.7 — assess as if EW had been given. Fair value: £220K-£260K, not £400K.`,
    companionVizType: 'evidence-balance',
    companionVizData: {
      forClaim: [
        { label: 'No boreholes in Zone C', weight: 0.9 },
        { label: 'Adjacent zones contaminated', weight: 0.8 },
        { label: 'Consistent with site history', weight: 0.6 },
      ],
      againstClaim: [
        { label: 'No EW raised by contractor', weight: 0.85 },
        { label: 'Prelims rate 35% above benchmark', weight: 0.7 },
        { label: 'Pattern of overpricing', weight: 0.65 },
      ],
      claimValue: 400,
      fairValue: 240,
    },
    vizType: 'site-map',
    vizTitle: 'Borehole Locations, Contamination Zones & EW/NCE History',
    vizData: {
      zones: [
        { id: 'A', x: 0.15, y: 0.3, w: 0.2, h: 0.25, status: 'clear', label: 'Zone A' },
        { id: 'B', x: 0.35, y: 0.2, w: 0.18, h: 0.3, status: 'contaminated', label: 'Zone B' },
        { id: 'C', x: 0.55, y: 0.25, w: 0.2, h: 0.28, status: 'claimed', label: 'Zone C' },
        { id: 'D', x: 0.75, y: 0.18, w: 0.15, h: 0.35, status: 'contaminated', label: 'Zone D' },
      ],
      boreholes: [
        { id: 'BH-11', x: 0.18, y: 0.35, depth: '12m' },
        { id: 'BH-12', x: 0.28, y: 0.28, depth: '15m' },
        { id: 'BH-13', x: 0.38, y: 0.45, depth: '10m' },
        { id: 'BH-14', x: 0.48, y: 0.32, depth: '14m' },
        { id: 'BH-15', x: 0.72, y: 0.40, depth: '11m' },
        { id: 'BH-16', x: 0.82, y: 0.25, depth: '13m' },
      ],
      earlyWarnings: [
        { id: 'EW-0031', x: 0.40, y: 0.30, zone: 'B', date: '3 months ago' },
        { id: 'EW-0039', x: 0.78, y: 0.28, zone: 'D', date: '3 months ago' },
      ],
      nce: { id: 'NCE-0127', x: 0.60, y: 0.35, zone: 'C', value: 400 },
    },
    cognitiveLoad: { without: '4-6 hours multi-document, multi-person analysis', with: '15 seconds' },
    budgetImpact: { value: '£140-180K saved', detail: 'Reduces a £400K claim to £220K-£260K through proper application of clause 63.7', withoutAction: 400, withAction: 240, unit: '£K', savingsLabel: 'Claim: £400K → assessed at £220-260K' },
    timelineImpact: { value: 'Fast response', detail: 'Avoids 2-week deadline pressure and prevents contractor escalation to adjudication', monthlyRisk: [400, 400, 260, 240, 220], months: ['Claim','','Clause 63.7','','Fair value'], label: 'NCE assessment breakdown (£K)' },
    businessValue: 'The AI doesn\'t just say "accept" or "reject." It builds the legal and evidential case for a nuanced position that protects the client while maintaining fair commercial relationships.',
  },

  {
    id: 'uc-06',
    title: 'Contractor Silence Alarm',
    shortTitle: 'Silence Alarm',
    stage: 'Early Warning + Timeline',
    accent: C.green,
    zone: 'caster',
    camera: null, // uses ZONE_PRESETS.caster
    question: 'Which contractors are behind programme but haven\'t raised any early warnings?',
    keywords: ['silence', 'silent', 'behind', 'programme', 'contractors', 'early', 'warning', 'hiding', 'slip', 'slipping', 'float'],
    sampleQuestions: [
      'Who is silently slipping?',
      'Which contractors are behind schedule?',
      'Show me contractor silence patterns',
    ],
    answer: `3 contractors behind programme with NO Early Warnings raised:

CRITICAL — Keller (Piling): 11 days behind, 3 past critical float. Accelerating. No EW
WARNING — Severfield (Mechanical): 6 days behind, accelerating at 2d/week. Float gone in 3 weeks
WATCH — William Hare (Steelwork): 4 days behind, undermanned 23 vs 31 planned

RECOMMENDATION: PM to raise proactive EWs on all three (clause 15.1). Keller: Risk Reduction Meeting within 48 hours.`,
    companionVizType: 'resource-histogram',
    companionVizData: {
      contractors: [
        { name: 'Keller', planned: 28, actual: 24, color: C.red },
        { name: 'Severfield', planned: 42, actual: 38, color: C.orange },
        { name: 'W. Hare', planned: 31, actual: 23, color: C.amber },
        { name: 'ABB', planned: 18, actual: 17, color: C.green },
        { name: 'Tenova', planned: 35, actual: 36, color: C.green },
      ],
    },
    vizType: 'gauges',
    vizTitle: 'Float Consumption by Contractor',
    vizData: {
      contractors: [
        {
          name: 'Keller Group',
          role: 'Piling',
          severity: 'critical',
          floatTotal: 8,
          floatUsed: 11,
          trend: [0, 1, 2, 3, 5, 7, 9, 11], // days behind over 8 weeks
          resourcePlan: 28,
          resourceActual: 24,
          ewRaised: false,
        },
        {
          name: 'Severfield',
          role: 'Mechanical',
          severity: 'warning',
          floatTotal: 12,
          floatUsed: 6,
          trend: [0, 0, 0, 0, 0, 2, 4, 6], // accelerating
          resourcePlan: 42,
          resourceActual: 38,
          ewRaised: false,
        },
        {
          name: 'William Hare',
          role: 'Steelwork',
          severity: 'watch',
          floatTotal: 18,
          floatUsed: 4,
          trend: [0, 0, 1, 1, 2, 2, 3, 4], // steady drift
          resourcePlan: 31,
          resourceActual: 23,
          ewRaised: false,
        },
        {
          name: 'ABB Ltd',
          role: 'HV Switchgear',
          severity: 'ok',
          floatTotal: 15,
          floatUsed: 2,
          trend: [0, 0, 0, 1, 1, 1, 2, 2],
          resourcePlan: 18,
          resourceActual: 17,
          ewRaised: true,
        },
        {
          name: 'Tenova',
          role: 'EAF Equipment',
          severity: 'ok',
          floatTotal: 10,
          floatUsed: 0,
          trend: [0, 0, 0, 0, 0, 0, 0, 0],
          resourcePlan: 35,
          resourceActual: 36,
          ewRaised: true,
        },
      ],
    },
    cognitiveLoad: { without: '1 full day of programme analysis per review cycle', with: '8 seconds' },
    budgetImpact: { value: '£450K', detail: 'Proactive PM EW on Keller avoids a contested NCE and preserves right to reduced assessment', withoutAction: 450, withAction: 0, unit: '£K', savingsLabel: 'Proactive EW avoids £450K contested claim' },
    timelineImpact: { value: '3 days critical', detail: 'Catching now allows recovery. Catching in 4 weeks means commissioning moves.', monthlyRisk: [0, 1, 3, 5, 7, 9, 11, 15], months: ['W1','W2','W3','W4','W5','W6','W7','W8'], label: 'Projected critical path slippage (days)' },
    businessValue: 'Contractors don\'t always hide problems maliciously — sometimes they genuinely believe they can recover. Enterprise Brain removes reliance on contractor self-reporting.',
  },

  {
    id: 'uc-07',
    title: 'Board Meeting Preparation',
    shortTitle: 'Board Brief',
    stage: 'Cross-cutting',
    accent: C.blue,
    zone: 'overview',
    camera: null, // uses OVERVIEW_PRESET
    question: 'I have a board meeting in 2 hours. Give me the top 5 risks to budget and timeline right now.',
    keywords: ['board', 'meeting', 'top', 'risks', 'summary', 'executive', 'brief', 'preparation', 'prepare', 'present'],
    sampleQuestions: [
      'Prepare me for the board meeting',
      'What are the top risks right now?',
      'Give me the executive summary',
    ],
    answer: `Top 5 risks — £90M budget gap recoverable if acted on in 30 days:

1. EAF Transformer: 60% chance of 6wk delay → 14wk cascade, £24M. DECISION: approve £800K air-freight
2. NCE Trend: 6.2/month at £127K avg → £90M overrun. 60% in 3 packages. ACTION: commercial review
3. Piling Slip: Keller 3 days past critical, no EW. ACTION: Risk Reduction Meeting this week
4. Salami Slicing: RHI £221K cumulative, projected £990K. ACTION: forensic review
5. Stale EWs: 12 open, 19 days avg. This week: £580K. 2-week delay: £1.4M. ACTION: clear backlog

RECOMMENDATION: Board decision on air-freight is the single highest-leverage action. £800K spend prevents £24M cascade.`,
    companionVizType: 'budget-gap-waterfall',
    companionVizData: {
      target: 1250,
      projected: 1340,
      risks: [
        { label: 'Transformer cascade', value: 24, color: C.purple },
        { label: 'NCE overrun trend', value: 40, color: C.red },
        { label: 'Piling extended prelims', value: 2.5, color: C.orange },
        { label: 'Salami slicing', value: 0.83, color: C.amber },
        { label: 'EW backlog CEs', value: 1.4, color: C.amber },
      ],
    },
    vizType: 'risk-matrix',
    vizTitle: 'Executive Risk Matrix — Impact vs Probability',
    vizData: {
      risks: [
        { id: 1, label: 'EAF Transformer', probability: 0.6, impact: 0.95, cost: 24000, type: 'both' },
        { id: 2, label: 'NCE Trend', probability: 0.75, impact: 0.6, cost: 90000, type: 'budget' },
        { id: 3, label: 'Piling Slip', probability: 0.5, impact: 0.45, cost: 2500, type: 'timeline' },
        { id: 4, label: 'Salami Slicing', probability: 0.85, impact: 0.25, cost: 830, type: 'budget' },
        { id: 5, label: 'Stale EWs', probability: 0.9, impact: 0.35, cost: 1400, type: 'both' },
      ],
      summary: {
        budgetTarget: 1250, // £M
        budgetProjected: 1340,
        budgetGap: 90,
        timelineTarget: 'Dec 2027',
        timelineProjected: 'Feb 2028',
        timelineGap: '14 weeks',
      },
    },
    cognitiveLoad: { without: '1-2 full days of multi-team preparation', with: '15 seconds' },
    budgetImpact: { value: '£24M decision', detail: 'Enables £800K air-freight decision that prevents £24M cascade — a 30x return', withoutAction: 90000, withAction: 0, unit: '£K', savingsLabel: '£90M projected overrun recoverable in 30 days' },
    timelineImpact: { value: 'Jan 2028', detail: 'If all 5 actions taken within 2 weeks, commissioning recovers to within tolerance', monthlyRisk: [24000, 2500, 1400, 990, 830], months: ['Transformer','Piling','EW backlog','Salami','NCE trend'], label: 'Top 5 risks by £K exposure' },
    businessValue: 'The board needs 5 items, each with a number and an action. Enterprise Brain compresses an entire project into a decision-ready format.',
  },

  {
    id: 'uc-08',
    title: 'Daily Cost of Delay Calculator',
    shortTitle: 'Cost of Delay',
    stage: 'Timeline + Budget',
    accent: C.red,
    zone: 'scrapyard',
    camera: null, // uses ZONE_PRESETS.scrapyard
    question: 'What does every day of delay actually cost us?',
    keywords: ['cost', 'delay', 'daily', 'day', 'actually', 'every', 'acceleration', 'hidden', 'true', 'real'],
    sampleQuestions: [
      'What is the true cost of delay?',
      'How much does each day of delay cost?',
      'Is acceleration worth it?',
    ],
    answer: `Visible cost: £180K/day. Actual cost: £780K/day — 4.3x hidden multiplier:

VISIBLE: £180K/day — extended prelims across 12 active contractors
HIDDEN: £400K/day lost production margin + £120K/day carbon cost + £80K/day political/grant risk
At 3 months delay: £70.2M total. Air-freight saves 42 days at £19K/day = 41x ROI

RECOMMENDATION: Any acceleration under £780K/day saved is justified. Approve £800K air-freight immediately.`,
    companionVizType: 'duration-multiplier',
    companionVizData: {
      durations: [
        { label: '1 week', days: 7, cost: 5460, color: C.amber },
        { label: '1 month', days: 30, cost: 23400, color: C.orange },
        { label: '3 months', days: 90, cost: 70200, color: C.red },
      ],
      dailyRate: 780,
      visibleRate: 180,
    },
    vizType: 'waterfall',
    vizTitle: 'True Daily Cost of Delay',
    vizData: {
      segments: [
        { label: 'Extended Prelims', value: 180, color: C.blue, category: 'visible' },
        { label: 'Lost Production', value: 400, color: C.red, category: 'hidden' },
        { label: 'Carbon Cost', value: 120, color: C.amber, category: 'hidden' },
        { label: 'Political Risk', value: 80, color: C.purple, category: 'hidden' },
      ],
      total: 780,
      visibleOnly: 180,
      comparison: {
        label: 'Air-freight cost per day saved',
        value: 19,
      },
      durations: [
        { label: '1 week', days: 7, total: 5460 },
        { label: '1 month', days: 30, total: 23400 },
        { label: '3 months', days: 90, total: 70200 },
      ],
    },
    cognitiveLoad: { without: 'Cross-silo (impossible — data in 4+ departments)', with: '10 seconds' },
    budgetImpact: { value: '£780K/day', detail: 'Reframes every NCE and acceleration decision. A £500K acceleration saving 5 days = £3.4M saving.', withoutAction: 780, withAction: 180, unit: '£K/day', savingsLabel: 'True cost £780K vs visible £180K (4.3x hidden)' },
    timelineImpact: { value: 'Faster decisions', detail: 'When the board sees £780K/day, delay becomes intolerable. Weeks to hours.', monthlyRisk: [5460, 23400, 70200], months: ['1 week','1 month','3 months'], label: 'Cumulative delay cost at £780K/day (£K)' },
    businessValue: 'This is the single most valuable question. It transforms "should we spend more to go faster?" from a debate into arithmetic. The £180K visible cost undervalues delay by 4.3x.',
  },
];

export const USE_CASE_MAP = Object.fromEntries(USE_CASES.map(uc => [uc.id, uc]));

export const CUMULATIVE_VALUE = {
  budgetProtection: '£28M+',
  timelineProtection: '~20 weeks',
  packagesMonitored: 47,
  description: 'Across all 8 use cases, Enterprise Brain identifies and enables intervention on over £28M in budget exposure and approximately 20 weeks of cumulative programme risk.',
};
