export const CHAT_PLACEHOLDER = 'ask a follow-up...';

export const FULL_VIZ_OPTIONS = [
  { key: 'bar', label: 'bar', enabled: true },
  { key: 'line', label: 'line', enabled: true },
  { key: 'area', label: 'area', enabled: true },
  { key: 'pie', label: 'pie', enabled: true },
  { key: 'donut', label: 'donut', enabled: true },
  { key: 'sankey', label: 'sankey', enabled: true },
  { key: 'text', label: 'text', enabled: true }
];

export const TABLE_PLUS_VIZ_OPTIONS = [{ key: 'table', label: 'table', enabled: true }, ...FULL_VIZ_OPTIONS];

export const RANGE_OPTIONS = ['7D', '30D', '90D', '1Y'];

export const landingCards = [
  { key: 'vendor-leaderboard', title: 'Vendor Leaderboard', description: 'Compare vendor performance across pricing, quality, timeline, and NCE risk.' },
  { key: 'downline-products', title: 'Downline Products', description: 'See which products are advancing, stalling, or clustering in the current pipeline.' },
  { key: 'nce-alerts', title: 'NCE Alerts', description: 'Surface recent change activity, escalation patterns, and the contracts driving them.' },
  { key: 'milestone-slippages', title: 'Milestone Slippages', description: 'Track where schedules are moving and where delivery slippage is accumulating.' },
  { key: 'bid-value-spread', title: 'Bid Value Spread', description: 'Inspect distribution shape, outliers, and high-value clusters across the bid set.' },
  { key: 'risk-flags', title: 'Risk Flags by Vendor', description: 'Rank open risk flags by vendor, severity, and concentration of exposure.' }
];

export const quickStartChips = [
  'What is the total contract value across all vendors?',
  'Show the contract value breakdown per vendor',
  'Which vendors have the highest total commitment percentage?',
];

export const chipPresets = [quickStartChips];

export const chatInterfaceQuestions = [
  'What is the total contract value across all vendors?',
  'Show the contract value breakdown per vendor',
  'Which vendors have the highest total commitment percentage?',
  'What is the EW status split and which category has the most Early Warnings?',
  'Which contractor has the most open EWs and what is the severity distribution?',
  'How many NCEs has each contractor raised?',
  'What % of NCEs are confirmed as compensation events?',
  'Show implemented vs unimplemented variations per contractor',
  'What is the total value of accepted vs submitted quotations?',
  'Show the trend of quotations submitted over time',
  'Show the full weekly report — base value, variations, and total commitment per contractor'
];

export const vendorRows = [
  {
    id: 'vendor-a',
    vendor: 'Vendor A',
    company: 'Tata Projects',
    pricing: 78,
    quality: 61,
    timeline: 44,
    risk: 'High',
    rank: '#1'
  },
  {
    id: 'vendor-b',
    vendor: 'Vendor B',
    company: 'L&T Construction',
    pricing: 65,
    quality: 91,
    timeline: 72,
    risk: 'Low',
    rank: '#2'
  },
  {
    id: 'vendor-c',
    vendor: 'Vendor C',
    company: 'Afcons Infra',
    pricing: 80,
    quality: 58,
    timeline: 76,
    risk: 'Medium',
    rank: '#3'
  },
  {
    id: 'vendor-d',
    vendor: 'Vendor D',
    company: 'NCC Ltd',
    pricing: 62,
    quality: 74,
    timeline: 88,
    risk: 'Low',
    rank: '#4'
  },
  {
    id: 'vendor-e',
    vendor: 'Vendor E',
    company: 'KEC International',
    pricing: 49,
    quality: 70,
    timeline: 63,
    risk: 'High',
    rank: '#5'
  }
];

export const drilldowns = {
  'vendor-a': {
    title: 'Vendor A — Tata Projects',
    meta: 'Selected from Vendor Leaderboard',
    selected: [
      ['Overall Rank', '#1'],
      ['Active Contracts', '5'],
      ['Total Contract Value', '₹142 Cr'],
      ['NCE Raised', '₹18.4 Cr (13% of contract value)'],
      ['Open Risk Flags', '3']
    ],
    cards: [
      {
        title: 'NCE History Over Time',
        type: 'line',
        note: 'NCE value has grown 15x in 6 months — the steepest escalation rate among all active vendors.'
      },
      {
        title: 'Milestone Completion Rate',
        type: 'bars',
        rows: [
          ['Contract #4471 — Blast Furnace Lining', 60, 'Behind'],
          ['Contract #4389 — Coke Oven Rebuild', 50, 'Behind'],
          ['Contract #4502 — Rolling Mill Upgrade', 75, 'On Track'],
          ['Contract #4611 — Slag Handling Unit', 34, 'Behind'],
          ['Contract #4498 — Water Treatment Plant', 72, 'On Track']
        ],
        note: '3 of 5 contracts are behind schedule — all three are in the heavy infrastructure category.'
      },
      {
        title: 'Active Risk Flags',
        type: 'flags',
        flags: [
          ['Ground condition variance found — soil report mismatch', '#4471', 'High', '14 Jun'],
          ['Labour shortage — monsoon impact on local workforce', '#4389', 'Medium', '02 Jun'],
          ['Material delivery delay — structural steel pending', '#4611', 'High', '20 Jun']
        ],
        note: 'Both high-severity flags have been open for more than 10 days without resolution update.'
      },
      {
        title: 'Bid Value vs NCE Raised',
        type: 'compare',
        compare: [
          ['Vendor A', '₹142 Cr', '₹18.4 Cr', '13%'],
          ['Group Average', '—', '—', '4.2%']
        ]
      }
    ]
  },
  'supplier-x': {
    title: 'Supplier X',
    meta: 'Selected from Supplier Quality Flow',
    selected: [
      ['Material', 'Silicon (Si)'],
      ['Current deviation', '+0.12% above spec'],
      ['Supplying to', 'BF-3, BF-5'],
      ['Contract value', '₹34 Cr'],
      ['Active since', 'Jan 2024']
    ],
    cards: [
      {
        title: 'Silicon deviation trend — last 30 days',
        type: 'line',
        points: [
          ['Week 1', '+0.02% (within tolerance)'],
          ['Week 2', '+0.05% (borderline)'],
          ['Week 3', '+0.09% (flagged)'],
          ['Week 4', '+0.12% (current — out of spec)']
        ],
        note: 'Deviation has been trending upward consistently for 4 weeks. Not a spike — a drift. Likely a batch composition issue at source.'
      },
      {
        title: 'Which furnaces are receiving this material',
        type: 'bars',
        rows: [
          ['BF-3', 68, '68% of Supplier X volume'],
          ['BF-5', 32, '32% of Supplier X volume']
        ],
        note: 'BF-3 is absorbing the majority of the deviated material — directly explaining the superheat anomaly downstream.'
      },
      {
        title: 'Supplier X vs other silicon suppliers',
        type: 'compare',
        compare: [
          ['Supplier X', '+0.12%', 'High', '₹1.8 Cr'],
          ['Supplier Y', '+0.01%', 'Low', '₹0.2 Cr'],
          ['Supplier Z', '−0.03%', 'Negligible', '₹0']
        ],
        note: 'Supplier X is the only vendor with an out-of-spec silicon reading this month.'
      },
      {
        title: 'NCE history for Supplier X',
        type: 'stats',
        stats: [
          ['Trend', '₹0 → ₹1.8 Cr in 3 months'],
          ['Inflection', 'Rising sharply since deviation crossed 0.08%']
        ]
      }
    ]
  },
  'bf3-superheat': {
    title: 'BF-3 Superheat',
    meta: 'Selected from Supplier Quality Flow',
    selected: [
      ['Current', '22°C'],
      ['Target', '34°C'],
      ['Gap', '−12°C (35% below target)'],
      ['Status', 'Out of spec'],
      ['Shift', 'Night shift, Operator team B']
    ],
    cards: [
      {
        title: 'Superheat reading over last 7 days',
        type: 'line',
        points: [
          ['Day 1', '33°C'],
          ['Day 2', '31°C'],
          ['Day 3', '28°C'],
          ['Day 4', '26°C'],
          ['Day 5', '24°C'],
          ['Day 6', '23°C'],
          ['Day 7', '22°C']
        ],
        note: 'Consistent downward trend over 7 days — not random variation. Correlates directly with the timing of Supplier X\'s silicon deviation increase.'
      },
      {
        title: 'BF-3 vs BF-5 superheat comparison',
        type: 'bars',
        rows: [
          ['BF-3', 22, '22°C (red — out of spec)'],
          ['BF-5', 33, '33°C (green — within tolerance)']
        ],
        note: 'BF-5 is receiving less of Supplier X\'s deviated material and is holding close to target — confirming the source of BF-3\'s issue.'
      },
      {
        title: 'Impact on downstream CCM assignment',
        type: 'bars',
        rows: [
          ['CCM-3', 80, '80% of BF-3 output'],
          ['CCM-1', 20, '20% of BF-3 output']
        ],
        note: 'CCM-3 is almost entirely dependent on BF-3 output — making it the most exposed unit to this quality chain failure.'
      },
      {
        title: 'Historical frequency of BF-3 going below 28°C',
        type: 'bars',
        rows: [
          ['Jan–Apr', 8, '0–1 days per month'],
          ['May', 24, '3 days'],
          ['Jun', 56, '7 days (current month, still open)']
        ],
        note: 'June is already the worst month on record for BF-3 superheat compliance.'
      }
    ]
  },
  'ccm3-solidification': {
    title: 'CCM-3 — Continuous Casting Machine 3',
    meta: 'Selected from Supplier Quality Flow',
    selected: [
      ['Issue', 'Solidification rate deviation'],
      ['Rate deviation', '−8% from standard'],
      ['Input', 'Primarily from BF-3'],
      ['Grades at risk', 'Automotive, High Tensile'],
      ['Shift affected', 'All shifts since 18 Jun']
    ],
    cards: [
      {
        title: 'Solidification rate deviation over time',
        type: 'line',
        points: [
          ['Before 18 Jun', 'Within normal band'],
          ['18 Jun', 'Dropped below band'],
          ['Current', 'Has not recovered']
        ],
        note: 'The deviation started 2 days after BF-3 superheat dropped below 26°C — the causal lag is consistent with typical furnace-to-caster transit time.'
      },
      {
        title: 'Grade output impact this month',
        type: 'compare',
        compare: [
          ['Automotive', '1,840 MT', '74%', 'At risk'],
          ['High Tensile', '960 MT', '81%', 'At risk'],
          ['Structural', '2,100 MT', '94%', 'Stable'],
          ['General', '3,400 MT', '97%', 'Stable']
        ],
        note: 'Premium grades (Automotive, High Tensile) are disproportionately affected — these carry the highest margin and the strictest customer specifications.'
      },
      {
        title: 'Rejected coil volume this month',
        type: 'stats',
        stats: [
          ['Total rejected', '487 MT'],
          ['Automotive share', '312 MT (64% of rejections)'],
          ['Estimated revenue impact', '₹2.3 Cr']
        ]
      },
      {
        title: 'CCM-3 vs CCM-1 comparison',
        type: 'stats',
        stats: [
          ['CCM-3 pass rate', '74%'],
          ['CCM-1 pass rate', '93%']
        ],
        note: 'CCM-1 is operating normally — the problem is isolated to CCM-3\'s input source, not a machine fault.'
      }
    ]
  },
  'grade-risk': {
    title: 'Grade at Risk: Automotive',
    meta: 'Selected from Supplier Quality Flow',
    selected: [
      ['Risk level', '74% pass rate (target: 98%)'],
      ['Gap', '−24 percentage points'],
      ['Customer commitment', '2,400 MT this quarter'],
      ['Current on-track volume', '1,776 MT'],
      ['Shortfall risk', '~624 MT']
    ],
    cards: [
      {
        title: 'Automotive grade pass rate — last 6 months',
        type: 'line',
        points: [
          ['Jan–May', '96–98% (within target)'],
          ['Jun', '74% (current)']
        ],
        note: 'This is the sharpest single-month drop in Automotive grade compliance in the last 6 months — and the month is not over.'
      },
      {
        title: 'Customer commitment vs projected delivery',
        type: 'stats',
        stats: [
          ['Committed', '2,400 MT'],
          ['Projected at current rate', '~1,780 MT'],
          ['Shortfall', '~620 MT']
        ],
        note: 'If the quality chain is not corrected in the next 10 days, the quarterly Automotive commitment cannot be met.'
      },
      {
        title: 'Revenue at risk',
        type: 'stats',
        stats: [
          ['Automotive grade price', '₹52,000 per MT'],
          ['Shortfall value', '₹32.2 Cr'],
          ['Penalty clause exposure', 'TBD from contract']
        ]
      }
    ]
  }
};

export const genericDrilldown = (vendorId: string) => ({
  title: `${vendorRows.find((row) => row.id === vendorId)?.vendor || vendorId.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')}`,
  meta: 'Selected from current analysis',
  selected: [
    ['Overall Rank', vendorRows.find((row) => row.id === vendorId)?.rank || '#—'],
    ['Active Contracts', '4'],
    ['Total Contract Value', '₹96 Cr'],
    ['NCE Raised', '₹6.2 Cr'],
    ['Open Risk Flags', '2']
  ],
  cards: [
    { title: 'NCE History Over Time', type: 'line', note: 'The escalation curve is still manageable, but it has accelerated over the latest review period.' },
    { title: 'Milestone Completion Rate', type: 'bars', rows: [['Contract #4401', 74, 'On Track'], ['Contract #4522', 58, 'Behind'], ['Contract #4630', 66, 'Watching']], note: 'Delivery is mixed, with one contract creating most of the drag.' },
    { title: 'Active Risk Flags', type: 'flags', flags: [['Site readiness lag', '#4401', 'Medium', '10 Jun'], ['Material dependency', '#4522', 'High', '18 Jun']], note: 'The highest-severity issue is still unresolved.' }
  ]
});

export const followupMap: Record<string, string[]> = {
  'supplier-x': ['Which furnace is most exposed?', 'Compare Supplier X with other silicon suppliers'],
  'bf3-superheat': ['Compare BF-3 with BF-5 superheat', 'Show BF-3 impact on downstream CCMs'],
  'ccm3-solidification': ['Which grades are most affected?', 'Compare CCM-3 with CCM-1'],
  'grade-risk': ['Quantify Automotive revenue risk', 'Show commitment vs projected delivery'],
  'Superheat reading over last 7 days': ['Compare BF-3 with BF-5 superheat', 'Show BF-3 impact on downstream CCMs'],
  'BF-3 vs BF-5 superheat comparison': ['Which furnace is most exposed?', 'Show BF-3 impact on downstream CCMs'],
  'Impact on downstream CCM assignment': ['Compare CCM-3 with CCM-1', 'Which grades are most affected?'],
  'Historical frequency of BF-3 going below 28°C': ['Compare BF-3 with BF-5 superheat', 'Quantify Automotive revenue risk']
};

export const storyHeader = {
  title: 'Hidden Cost Overrun',
  subtitle: 'FY 2024 hidden manufacturing cost traced across procurement, operations, logistics, quality, supplier, planning, and contract performance.',
  context: 'Manufacturing hidden cost investigation'
};

export const storyActs = [
  { id: 'act-1', label: 'Act 1', name: 'Total Hidden Cost Magnitude', kicker: 'Scale first', blurb: 'Let the size of the overrun hit before the causes fragment into detail.' },
  { id: 'act-2', label: 'Act 2', name: 'Category Drill Down', kicker: 'Diagnosis', blurb: 'Move into one category at a time and isolate the three most expensive bleeding points.' },
  { id: 'act-3', label: 'Act 3', name: 'Risk Connection', kicker: 'Signals ignored', blurb: 'Show where early warning signals appeared months before the cost actually hit.' },
  { id: 'act-4', label: 'Act 4', name: 'Comparison & Recommendations', kicker: 'Decide what to do', blurb: 'Shift from analysis to priority, action, and execution windows.' }
];

export const storyCategories = [
  {
    key: 'procurement',
    label: 'Procurement',
    value: 18.2,
    valueLabel: '£18.2M',
    share: 39,
    tone: 'critical',
    factors: [
      { label: 'Spot purchasing', value: 7.1, valueLabel: '£7.1M', cause: 'Contracted supplier delivery failures in Q3', trend: 'worsening' },
      { label: 'Demurrage charges', value: 6.3, valueLabel: '£6.3M', cause: 'Port congestion Rotterdam and Immingham, 14 vessel delays', trend: 'worsening' },
      { label: 'Rejected material', value: 4.8, valueLabel: '£4.8M', cause: 'Off-spec iron ore, sulphur content exceeded tolerance', trend: 'stable' }
    ],
    insight: 'Spot purchasing alone is £7.1M — driven by 3 supplier failures. Single-source dependency is the root cause.'
  },
  {
    key: 'operations',
    label: 'Operations',
    value: 10.5,
    valueLabel: '£10.5M',
    share: 22,
    tone: 'critical',
    factors: [
      { label: 'Unplanned downtime', value: 4.9, valueLabel: '£4.9M', cause: '4 blast furnace stoppages in H2, avg 31 hours each', trend: 'worsening' },
      { label: 'Yield loss', value: 3.6, valueLabel: '£3.6M', cause: 'Hot rolling mill running 2.3% below target yield', trend: 'stable' },
      { label: 'Energy overconsumption', value: 2.0, valueLabel: '£2.0M', cause: 'Extended furnace reheat cycles after stoppages', trend: 'improving' }
    ],
    insight: 'Downtime doubled from FY23 — 2 stoppages to 4. Fixed costs kept running with zero output each time.'
  },
  {
    key: 'logistics',
    label: 'Logistics',
    value: 7.1,
    valueLabel: '£7.1M',
    share: 15,
    tone: 'elevated',
    factors: [
      { label: 'Freight variance', value: 3.2, valueLabel: '£3.2M', cause: 'Red Sea disruption pushed spot rates above contracted levels', trend: 'improving' },
      { label: 'Late delivery penalties', value: 2.6, valueLabel: '£2.6M', cause: '12 customer delivery failures in Q4, penalty clauses triggered', trend: 'worsening' },
      { label: 'Warehousing overflow', value: 1.3, valueLabel: '£1.3M', cause: 'Finished goods held longer than planned at third-party warehouses', trend: 'stable' }
    ],
    insight: 'Late delivery penalties trace directly back to Operations downtime — these two categories are connected.'
  },
  {
    key: 'quality',
    label: 'Quality',
    value: 4.7,
    valueLabel: '£4.7M',
    share: 10,
    tone: 'elevated',
    factors: [
      { label: 'Customer claims', value: 2.8, valueLabel: '£2.8M', cause: 'Below-spec HSLA steel delivered to 2 automotive customers', trend: 'worsening' },
      { label: 'Rework costs', value: 1.2, valueLabel: '£1.2M', cause: '8.4% of batches failed first-pass inspection', trend: 'stable' },
      { label: 'Compliance fines', value: 0.7, valueLabel: '£0.7M', cause: '2 environmental breaches, Port Talbot and Scunthorpe', trend: 'improving' }
    ],
    insight: 'Customer claims doubled from £1.4M in FY23. Concentrated in one product grade and two customers.'
  },
  {
    key: 'supplier',
    label: 'Supplier',
    value: 3.5,
    valueLabel: '£3.5M',
    share: 7,
    tone: 'monitor',
    factors: [
      { label: 'Short deliveries', value: 1.8, valueLabel: '£1.8M', cause: '6 suppliers delivered below contracted volumes', trend: 'worsening' },
      { label: 'Substitution costs', value: 1.1, valueLabel: '£1.1M', cause: '3 grade substitutions required at higher cost and disrupted schedule', trend: 'stable' },
      { label: 'Supplier financial distress', value: 0.6, valueLabel: '£0.6M', cause: '1 tier-2 supplier went into administration, emergency sourcing required', trend: 'watch' }
    ],
    insight: '2 more suppliers currently showing financial health flags in the risk register.'
  },
  {
    key: 'planning',
    label: 'Planning',
    value: 2.1,
    valueLabel: '£2.1M',
    share: 4,
    tone: 'monitor',
    factors: [
      { label: 'Demand forecast error', value: 1.1, valueLabel: '£1.1M', cause: 'Q2 demand overforecast by 14%, overproduction and inventory holding', trend: 'stable' },
      { label: 'Schedule change costs', value: 0.7, valueLabel: '£0.7M', cause: '11 last-minute production schedule changes, setup and overtime costs', trend: 'worsening' },
      { label: 'Inventory write-offs', value: 0.3, valueLabel: '£0.3M', cause: '2 specialist alloy batches obsolete after customer order cancellation', trend: 'stable' }
    ],
    insight: 'Schedule changes are increasing and directly amplify costs in Operations and Logistics downstream.'
  },
  {
    key: 'contract',
    label: 'Contract',
    value: 1.1,
    valueLabel: '£1.1M',
    share: 2,
    tone: 'monitor',
    factors: [
      { label: 'Escalation clause triggers', value: 0.5, valueLabel: '£0.5M', cause: '4 contracts with CPI-linked clauses triggered in H1 as inflation stayed elevated', trend: 'stable' },
      { label: 'Take-or-pay penalties', value: 0.4, valueLabel: '£0.4M', cause: 'Production shortfall meant minimum volumes not consumed in 2 utility agreements', trend: 'improving' },
      { label: 'Volume shortfall penalties', value: 0.2, valueLabel: '£0.2M', cause: 'Raw material purchase commitments not met due to schedule changes', trend: 'stable' }
    ],
    insight: 'Contract costs are the smallest category but are symptoms of failures in Planning and Operations.'
  }
];

export const storyCategoryPositions = {
  procurement: { size: 220, left: '8%', top: '20%' },
  operations: { size: 182, left: '38%', top: '14%' },
  logistics: { size: 144, left: '66%', top: '28%' },
  quality: { size: 120, left: '26%', top: '55%' },
  supplier: { size: 104, left: '54%', top: '54%' },
  planning: { size: 86, left: '73%', top: '57%' },
  contract: { size: 72, left: '14%', top: '68%' }
};

export const historicalRiskRows = [
  { title: 'Supplier X delivery failure', riskMonth: 'Feb', costMonth: 'Jul', gap: '5 months', costImpact: '£7.1M', risk: 'Single-source dependency on coking coal supplier, capacity constraint signals noted.', action: 'None.', outcome: 'Forced spot purchasing begins.', status: 'Still unresolved. Supplier X remains sole source.' },
  { title: 'Port congestion — Rotterdam and Immingham', riskMonth: 'Apr', costMonth: 'Jul', gap: '3 months', costImpact: '£6.3M', risk: 'Congestion alerts from port authority bulletins logged in logistics risk register.', action: 'Escalated June 2024 — too late to reroute.', outcome: 'Demurrage charges begin.', status: 'Partially resolved. Alternative berth arrangements for Q1 FY25.' },
  { title: 'Blast furnace reliability — Port Talbot Furnace 2', riskMonth: 'Feb', costMonth: 'Sep', gap: '7 months', costImpact: '£4.9M', risk: 'Overdue inspection flag, increasing vibration readings logged in maintenance risk log.', action: 'Escalated August 2024 after first stoppage — reactive not preventive.', outcome: 'Second and third stoppages drive cost spike.', status: 'Furnace 2 maintenance scheduled Q1 FY25.' },
  { title: 'HSLA steel quality — automotive customers', riskMonth: 'May', costMonth: 'Aug', gap: '3 months', costImpact: '£2.8M', risk: 'Borderline sulphur readings in quality control log.', action: 'None — never formally escalated.', outcome: 'First customer claim received.', status: 'Process parameters tightened but raw material root cause unresolved.' }
];

export const forwardRiskRows = [
  { title: 'Furnace 1 vibration readings', riskMonth: 'Nov', exposure: '£4.9M', window: 'Estimated 3 months', detail: 'Identical early signals to Furnace 2 in February 2024.' },
  { title: 'Supplier financial health — 2 suppliers', riskMonth: 'Oct', exposure: '£2.2M', window: 'Immediate review', detail: '2 tier-2 suppliers showing deteriorating payment behaviour and credit score decline.' },
  { title: 'Freight contract renewal', riskMonth: 'Dec', exposure: '£1.8M', window: '60 days', detail: 'Current spot market rates are 22% above expiring contracted rates.' },
  { title: 'Automotive customer quality penalty clauses', riskMonth: 'Dec', exposure: '£1.2M', window: 'Before Q2 FY25', detail: 'Major automotive customer renewal includes tighter quality penalty clauses.' }
];

export const scoreMatrix = [
  { key: 'procurement', label: 'Procurement', magnitude: 5, fixability: 4, risk: 5, total: 14, priority: 'High' },
  { key: 'operations', label: 'Operations', magnitude: 4, fixability: 3, risk: 4, total: 11, priority: 'High' },
  { key: 'logistics', label: 'Logistics', magnitude: 3, fixability: 5, risk: 3, total: 11, priority: 'High' },
  { key: 'quality', label: 'Quality', magnitude: 2, fixability: 4, risk: 2, total: 8, priority: 'Medium' },
  { key: 'supplier', label: 'Supplier', magnitude: 2, fixability: 2, risk: 4, total: 8, priority: 'Medium' },
  { key: 'planning', label: 'Planning', magnitude: 1, fixability: 3, risk: 3, total: 7, priority: 'Monitor' },
  { key: 'contract', label: 'Contract', magnitude: 1, fixability: 3, risk: 2, total: 6, priority: 'Monitor' }
];

export const recommendationCards = [
  { order: '01', category: 'Procurement', priority: 'High', action: 'Dual-source the top 3 single-source supplier relationships before Q2 FY25.', detail: 'Supplier X for coking coal, Supplier Y for iron ore, Supplier Z for specialist alloys. Single-source dependency generated £7.1M in spot purchasing costs in FY24 alone.', timeframe: 'Within 90 days' },
  { order: '02', category: 'Operations', priority: 'High', action: 'Schedule Furnace 1 full maintenance in Q1 FY25.', detail: 'Vibration readings are 4 months into the same pattern that preceded Furnace 2 failure. There are approximately 3 months remaining before the pattern escalates.', timeframe: 'Schedule within 30 days' },
  { order: '03', category: 'Logistics', priority: 'High', action: 'Renegotiate outbound freight contracts before expiry.', detail: 'Current market rates are 22% above expiring contracted levels. This is the highest-fixability action in the dataset.', timeframe: 'Hard deadline — 60 days' },
  { order: '04', category: 'Systemic', priority: 'Monitor', action: 'Connect the risk register to the contract and procurement review cycle.', detail: 'The average 5-month gap between risk flag and cost impact is a process failure, not a data failure. £14–16M could have been avoided with a 30-day risk-to-action protocol.', timeframe: 'Before FY25 planning closes' }
];

// ─── Contract Management Dashboard Data ───────────────────────────────────────

export const contractData = {
  contractors: [
    { id: 'c1', name: 'Tata Projects',    shortName: 'Tata',   base: 142, variations: 18.4, totalCommitment: 160.4, commitmentPct: 87 },
    { id: 'c2', name: 'L&T Construction', shortName: 'L&T',    base: 198, variations: 12.6, totalCommitment: 210.6, commitmentPct: 92 },
    { id: 'c3', name: 'Afcons Infra',     shortName: 'Afcons', base: 89,  variations: 22.1, totalCommitment: 111.1, commitmentPct: 78 },
    { id: 'c4', name: 'NCC Ltd',          shortName: 'NCC',    base: 156, variations: 8.9,  totalCommitment: 164.9, commitmentPct: 95 },
    { id: 'c5', name: 'KEC International',shortName: 'KEC',    base: 74,  variations: 31.2, totalCommitment: 105.2, commitmentPct: 69 },
  ],
  totals: { base: 659, variations: 93.2, totalCommitment: 752.2 },
};

export const ewStatusData = [
  { status: 'Open',      count: 18 },
  { status: 'Submitted', count: 10 },
  { status: 'Closed',    count: 12 },
];

export const ewCategoryData = [
  { category: 'Ground',     fullName: 'Ground Conditions', count: 12 },
  { category: 'Design',     fullName: 'Design Issues',     count: 8  },
  { category: 'Employer',   fullName: 'Employer Risk',     count: 7  },
  { category: 'Weather',    fullName: 'Weather Events',    count: 6  },
  { category: 'Regulatory', fullName: 'Regulatory',        count: 5  },
  { category: 'Other',      fullName: 'Other',             count: 2  },
];

export const ewSeverityData = [
  { severity: 'Critical', count: 5  },
  { severity: 'High',     count: 14 },
  { severity: 'Medium',   count: 13 },
  { severity: 'Low',      count: 8  },
];

export const ewOpenByContractor = [
  { id: 'c1', name: 'Tata Projects',     shortName: 'Tata',   openCount: 7 },
  { id: 'c3', name: 'Afcons Infra',      shortName: 'Afcons', openCount: 4 },
  { id: 'c2', name: 'L&T Construction',  shortName: 'L&T',    openCount: 3 },
  { id: 'c5', name: 'KEC International', shortName: 'KEC',    openCount: 2 },
  { id: 'c4', name: 'NCC Ltd',           shortName: 'NCC',    openCount: 2 },
];

export const nceByContractor = [
  { id: 'c1', name: 'Tata Projects',     shortName: 'Tata',   count: 8 },
  { id: 'c3', name: 'Afcons Infra',      shortName: 'Afcons', count: 6 },
  { id: 'c2', name: 'L&T Construction',  shortName: 'L&T',    count: 4 },
  { id: 'c4', name: 'NCC Ltd',           shortName: 'NCC',    count: 4 },
  { id: 'c5', name: 'KEC International', shortName: 'KEC',    count: 3 },
];

export const nceCompensationData = { total: 25, confirmed: 15, pctConfirmed: 60 };

export const variationByContractor = [
  { id: 'c1', name: 'Tata Projects',     shortName: 'Tata',   implemented: 12, unimplemented: 4 },
  { id: 'c2', name: 'L&T Construction',  shortName: 'L&T',    implemented: 8,  unimplemented: 6 },
  { id: 'c3', name: 'Afcons Infra',      shortName: 'Afcons', implemented: 5,  unimplemented: 9 },
  { id: 'c4', name: 'NCC Ltd',           shortName: 'NCC',    implemented: 11, unimplemented: 2 },
  { id: 'c5', name: 'KEC International', shortName: 'KEC',    implemented: 6,  unimplemented: 8 },
];

export const quotationSummary = {
  accepted:  { value: 28.4, count: 31, label: '£28.4M' },
  submitted: { value: 19.8, count: 22, label: '£19.8M' },
};

export const quotationTrend = [
  { week: 'W1',  count: 2, value: 1.8 },
  { week: 'W2',  count: 3, value: 2.4 },
  { week: 'W3',  count: 1, value: 0.9 },
  { week: 'W4',  count: 4, value: 3.6 },
  { week: 'W5',  count: 5, value: 4.1 },
  { week: 'W6',  count: 3, value: 2.8 },
  { week: 'W7',  count: 6, value: 5.2 },
  { week: 'W8',  count: 4, value: 3.9 },
  { week: 'W9',  count: 7, value: 6.4 },
  { week: 'W10', count: 8, value: 7.1 },
  { week: 'W11', count: 5, value: 4.8 },
  { week: 'W12', count: 9, value: 8.3 },
];

// ─── Narrative Chain (Dashboard Questions → Chat Flow) ──────────────────────

import type { NarrativeStep } from '../types';

export const NARRATIVE_CHAIN: NarrativeStep[] = [
  {
    id: 'q1',
    questionText: 'What is the total contract value across all vendors?',
    title: 'Total Contract Value',
    insight: 'Total portfolio commitment is £752.2M — £659M base value plus £93.2M in approved variations. Each bar shows one contractor\'s total; the solid segment is base value, the lighter segment is variations.',
    vizConfigs: [{ type: 'contract-value-orb', data: contractData }],
    followupIds: ['q2'],
    keyInsights: [
      'L&T Construction holds the largest share at £210.6M total commitment.',
      'KEC International has the highest variation-to-base ratio at 42%.',
      'Total variations across all vendors account for 12.4% of the portfolio.',
    ],
    keyHighlights: {
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
  },
  {
    id: 'q2',
    questionText: 'Show the contract value breakdown per vendor',
    title: 'Contract Value Breakdown',
    insight: 'Each triangle maps three KPIs per contractor — Base value (top), Variations (lower-right), Commitment % (lower-left). L&T\'s constellation is the widest at £210.6M base; KEC\'s top corner is notably shorter, reflecting its smaller base relative to peers.',
    vizConfigs: [{ type: 'contract-bars', contractors: contractData.contractors }],
    followupIds: ['q3'],
    keyInsights: [
      'L&T has the highest base value at £198M, nearly triple KEC\'s £74M.',
      'KEC\'s variation load (£31.2M) is the largest despite having the smallest base.',
      'NCC shows the tightest base-to-commitment spread — disciplined delivery.',
    ],
    keyHighlights: {
      type: 'stats',
      items: [
        { value: '42%', label: 'KEC var ratio — 7× higher than L&T and NCC, most exposed despite smallest base',      color: '#F06060' },
        { value: '25%', label: 'Afcons var ratio — KEC + Afcons drive 57% of variation value on 23% of base',         color: '#FBBF24' },
        { value: '13%', label: 'Tata var ratio — above the 12.4% portfolio average, middle risk tier',                color: '#3B8BF6' },
        { value: '6%',  label: 'L&T var ratio — largest base at £198M with the tightest variation discipline',        color: '#34D399' },
        { value: '6%',  label: 'NCC var ratio — matched with L&T, best-controlled contractor at 95% commitment',      color: '#34D399' },
      ],
      takeaway: 'Variation ratio — not base value — is the real risk signal. KEC and Afcons are in the danger zone; L&T and NCC anchor portfolio stability.',
    },
  },
  {
    id: 'q3',
    questionText: 'Which vendors have the highest total commitment percentage?',
    title: 'Commitment Race',
    insight: 'NCC Ltd leads at 95% commitment, closely followed by L&T at 92%. KEC International lags at 69% — the widest gap from the finish line and the highest variation-to-base ratio in the portfolio.',
    vizConfigs: [{ type: 'commitment-race', contractors: contractData.contractors }],
    followupIds: ['q4q5'],
    keyInsights: [
      'NCC and L&T are both above 90% — nearing full commitment.',
      'KEC at 69% has the most headroom — and the most variation risk.',
      'The average commitment across all five contractors is 84%.',
    ],
    keyHighlights: {
      type: 'chips',
      items: [
        { value: '84%',    label: 'portfolio-weighted average commitment — 16 points below full close', color: '#3B8BF6' },
        { value: '26 pts', label: 'spread from NCC (95%) to KEC (69%) — widest performance gap',       color: '#FBBF24' },
        { value: '2 of 5', label: 'contractors below the 80% target — Afcons at 78% and KEC at 69%',  color: '#F06060' },
      ],
      takeaway: 'The 26-point spread signals a deeply uneven portfolio — KEC\'s 42% variation ratio is the primary factor keeping its commitment furthest from the finish line.',
    },
  },
  {
    id: 'q4q5',
    questionText: 'What is the EW status split and which category has the most Early Warnings?',
    title: 'Early Warning Overview',
    insight: '40 Early Warnings total. 18 remain Open (45%) — the largest cohort — while 12 are Closed and 10 are Submitted awaiting decision. Ground Conditions dominate with 12 EWs (30% of all warnings), followed by Design Issues at 8.',
    vizConfigs: [
      { type: 'status-arc', segments: ewStatusData, title: 'Early Warning by split' },
      { type: 'ew-category', categories: ewCategoryData, title: 'Early Warning by category' },
    ],
    followupIds: ['q6q7'],
    keyInsights: [
      'Nearly half of all Early Warnings are still Open — decision backlog is building.',
      'Ground Conditions account for 30% of all EWs — the single largest category.',
      'Design Issues (8) and Employer Risk (7) together rival Ground Conditions.',
    ],
    keyHighlights: {
      type: 'chips',
      items: [
        { value: '40 EWs',  label: 'total Early Warnings active across all 5 contractors right now',   color: '#94A3B8' },
        { value: '18 Open', label: '45% still active and unresolved — risk actively in flight',        color: '#F06060' },
        { value: '30%',     label: 'resolution rate — only 12 of 40 EWs fully closed to date',        color: '#34D399' },
        { value: 'Ground',  label: 'dominant category — 12 EWs, 30% of all warnings in the portfolio', color: '#3B8BF6' },
      ],
      takeaway: '70% of EWs remain live — Ground Conditions alone (30%) is the single largest driver, and is strongly correlated with NCE escalation.',
    },
  },
  {
    id: 'q6q7',
    questionText: 'Which contractor has the most open EWs and what is the severity distribution?',
    title: 'EW Contractor & Severity',
    insight: 'Tata Projects has 7 open EWs — more than the next two contractors combined. High severity is the widest band at 14 EWs (35%), with Medium close behind at 13. Only 5 are Critical — but those 5 are unresolved.',
    vizConfigs: [
      { type: 'contractor-rank', contractors: ewOpenByContractor, title: 'Open EWs' },
      { type: 'severity-bands', severities: ewSeverityData, title: 'Severity distribution for EWs' },
    ],
    followupIds: ['q8'],
    keyInsights: [
      'Tata alone holds 39% of all open Early Warnings.',
      'High + Critical severity makes up nearly half (19 of 40) of all EWs.',
      'NCC and KEC are the least exposed with 2 open EWs each.',
    ],
    keyHighlights: {
      type: 'proportion',
      leftPct: 70,
      leftLabel: 'Unresolved EWs',
      leftValue: '28 of 40',
      leftColor: '#F06060',
      rightPct: 30,
      rightLabel: 'Resolved EWs',
      rightValue: '12 of 40',
      rightColor: '#34D399',
      chips: [
        { value: 'Tata 39%',   label: 'share of open EWs — one contractor driving nearly 2-in-5 unresolved warnings',           color: '#F06060' },
        { value: '0% resolved', label: 'resolution rate for Critical-tier EWs — all 5 remain live with no closure on record',   color: '#F87171' },
        { value: '47.5%',      label: 'of all EWs are Critical or High severity — elevated risk dominates the active portfolio', color: '#FBBF24' },
      ],
      takeaway: '70% of EWs are unresolved and all 5 Critical items are still live — zero resolution at the top severity tier signals a systemic commercial response gap.',
    },
  },
  {
    id: 'q8',
    questionText: 'How many NCEs has each contractor raised?',
    title: 'NCE Distribution',
    insight: '25 NCEs total. Tata Projects raised 8 (32%) — the thickest branch in the tree. Branch thickness is proportional to NCE count; leaf node size reflects share of total.',
    vizConfigs: [{ type: 'nce-tree', total: nceCompensationData.total, byContractor: nceByContractor }],
    followupIds: ['q9'],
    keyInsights: [
      'Tata and Afcons together account for 56% of all NCEs.',
      'KEC has the fewest NCEs (3) despite the highest variation ratio.',
      'NCE concentration mirrors EW exposure — Tata leads both.',
    ],
    keyHighlights: {
      type: 'badges',
      textSize: 13,
      items: [
        { text: 'Tata: NCE share (32%) mirrors EW exposure (39%) — both risk channels converge on the same contractor, confirming systemic delivery failure, not isolated incidents',     severity: 'red'   },
        { text: 'Afcons: double exposure — 24% of NCEs combined with a 25% variation ratio — two overlapping financial risk channels from one contractor',                               severity: 'amber' },
        { text: 'KEC: fewest NCEs (3) yet highest variation ratio (42%) — risk surfaces through variations rather than NCEs, a different but equally material exposure profile',        severity: 'amber' },
        { text: 'NCC: 16% NCE share with only 6% variation ratio and 95% commitment — the lowest combined risk profile across all three metrics in the portfolio',                      severity: 'green' },
      ],
      takeaway: 'NCE count alone is misleading — cross-referencing with variation ratios and EW exposure reveals Tata and Afcons carry the highest combined dual-channel risk.',
    },
  },
  {
    id: 'q9',
    questionText: 'What % of NCEs are confirmed as compensation events?',
    title: 'Compensation Confirmation',
    insight: '60% of NCEs (15 of 25) are confirmed compensation events. The needle sweeps to the amber-to-green boundary. The 10 unconfirmed NCEs remain contested and represent potential future claim value.',
    vizConfigs: [{ type: 'compensation-gauge', pct: nceCompensationData.pctConfirmed, confirmed: nceCompensationData.confirmed, total: nceCompensationData.total }],
    followupIds: ['q10'],
    keyInsights: [
      '60% confirmation rate is moderate — 40% of claims are still disputed.',
      '10 unconfirmed NCEs represent material financial exposure.',
      'A rising confirmation rate would signal contractors are building stronger cases.',
    ],
    keyHighlights: {
      type: 'proportion',
      leftPct: 60,
      leftLabel: 'Confirmed NCEs',
      leftValue: '15 of 25',
      leftColor: '#34D399',
      rightPct: 40,
      rightLabel: 'Disputed NCEs',
      rightValue: '10 of 25',
      rightColor: '#F06060',
      chips: [
        { value: '1.6×',      label: 'above the 25% industry benchmark for dispute rates — elevated contractor commercial aggression', color: '#F06060' },
        { value: 'Amber zone', label: '60% confirmation sits at the threshold boundary — any new disputes push this into red territory', color: '#FBBF24' },
        { value: '10 open',   label: 'unconfirmed NCEs are each independent adjudication triggers — the most unpredictable liability in the portfolio', color: '#F87171' },
      ],
      takeaway: 'A 40% dispute rate is 1.6× above industry norms. The 10 unconfirmed NCEs are the portfolio\'s most volatile exposure — each can independently escalate to adjudication.',
    },
  },
  {
    id: 'q10',
    questionText: 'Show implemented vs unimplemented variations per contractor',
    title: 'Variation Implementation',
    insight: 'NCC Ltd has the best implementation rate — 11 of 13 variations actioned. Afcons Infra is the weakest: 9 unimplemented against only 5 completed, flagging contract delivery risk.',
    vizConfigs: [{ type: 'variation-split', contractors: variationByContractor }],
    followupIds: ['q11'],
    keyInsights: [
      'NCC leads with 85% implementation rate — most disciplined contractor.',
      'Afcons has the worst ratio at 36% implemented — 9 variations pending.',
      'KEC also lags with only 43% implementation despite heavy variation load.',
    ],
    keyHighlights: {
      type: 'stats',
      items: [
        { value: '59%',    label: 'portfolio implementation rate — 42 of 71 variations actioned across all contractors', color: '#34D399' },
        { value: '29',     label: 'variations still pending — unresolved backlog concentrated in Afcons and KEC',        color: '#F06060' },
        { value: '49 pts', label: 'discipline gap from NCC (85%) to Afcons (36%) — widest spread in the portfolio',     color: '#FBBF24' },
      ],
      takeaway: 'Afcons\' 9 and KEC\'s 8 pending variations together account for 59% of the entire unimplemented backlog — two contractors are driving most of the portfolio\'s delivery risk.',
    },
  },
  {
    id: 'q11',
    questionText: 'What is the total value of accepted vs submitted quotations?',
    title: 'Quotation Balance',
    insight: 'The balance tips toward accepted: £28.4M accepted (31 quotations) vs £19.8M submitted and pending (22 quotations). The tilt of the beam encodes the value gap — a healthy acceptance rate.',
    vizConfigs: [{ type: 'quotation-balance', accepted: quotationSummary.accepted, submitted: quotationSummary.submitted }],
    followupIds: ['q12'],
    keyInsights: [
      'Accepted quotations exceed submitted by £8.6M — a positive signal.',
      '59% of all quotation value has been accepted.',
      'The 22 pending quotations represent £19.8M in unresolved claim value.',
    ],
    keyHighlights: {
      type: 'chips',
      items: [
        { value: '59%',    label: 'acceptance rate — healthy majority cleared, but 41% of equivalent value still sits unresolved in the pending queue',                    color: '#34D399' },
        { value: '£19.8M', label: 'pending pipeline — equivalent to a mid-sized contractor\'s entire variation load left unresolved and accruing commercial pressure',     color: '#F06060' },
        { value: '~£900K', label: 'average value per pending quote — high-value claims dominate the queue, raising the cost of each delayed decision',                    color: '#FBBF24' },
        { value: 'Q close', label: 'resolution timing of the 22 pending quotes will determine the quarter\'s commercial outcome — the window to act is narrowing',        color: '#3B8BF6' },
      ],
      takeaway: 'The £19.8M pending pipeline is 41% of already-accepted value. At ~£900K per quote, delays are expensive — resolution timing defines the quarter.',
    },
  },
  {
    id: 'q12',
    questionText: 'Show the trend of quotations submitted over time',
    title: 'Quotation Trend',
    insight: 'Submissions are accelerating. Week 12 hit 9 submissions — the highest in the 12-week window. The upward trend since W8 suggests contract activity is entering a peak claim period.',
    vizConfigs: [{ type: 'quotation-trend', trend: quotationTrend }],
    followupIds: ['q13'],
    keyInsights: [
      'W8–W12 shows a clear acceleration in submission volume.',
      'Week 12 submissions (9) are 4.5× the Week 1 baseline.',
      'Value per submission is also trending up — larger claims are emerging.',
    ],
    keyHighlights: {
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
  },
  {
    id: 'q13',
    questionText: 'Show the full weekly report — base value, variations, and total commitment per contractor',
    title: 'Weekly Report',
    insight: 'The flow shows each contractor\'s base and variation contributions converging into £752.2M total commitment. L&T and NCC anchor the base column; KEC contributes a disproportionately large variation stream relative to base.',
    vizConfigs: [{ type: 'weekly-flow', contractors: contractData.contractors }],
    followupIds: [],
    keyInsights: [
      'L&T\'s base stream is the widest — anchoring the portfolio.',
      'KEC\'s variation stream is visually disproportionate to its base — highest risk.',
      'Total commitment converges at £752.2M — the full portfolio picture.',
    ],
    keyHighlights: {
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
        { value: 'KEC 42%',    label: 'highest variation-to-base ratio — 3× the portfolio average',             color: '#34D399' },
        { value: 'Afcons 25%', label: 'second-highest — KEC + Afcons together drive 57% of variation value',   color: '#FBBF24' },
        { value: '£93.2M',     label: 'total approved variations — equivalent to adding a 6th contractor',     color: '#22D3EE' },
        { value: '2 of 5',     label: 'contractors above 20% variation rate — concentrated in the bottom tier', color: '#A78BFA' },
      ],
      takeaway: 'KEC and Afcons contribute 57% of all variation value despite holding only 23% of base contract value — the portfolio\'s primary financial concentration risk.',
    },
  },
];

export const narrativeStepByQuestion = new Map<string, NarrativeStep>(
  NARRATIVE_CHAIN.map(step => [step.questionText.toLowerCase(), step])
);
