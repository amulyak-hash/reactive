import { hydrateVisualizationMounts } from './d3Visualizations';

declare global {
  interface Window {
    __reactiveWorkspaceInitialized?: boolean;
  }
}

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }
  return element as T;
}

export function initWorkspace() {
  const controller = new AbortController();
  const timeoutIds = new Set<number>();
  const animationFrameIds = new Set<number>();

  function scheduleTimeout(callback: () => void, delay: number) {
    const timeoutId = window.setTimeout(() => {
      timeoutIds.delete(timeoutId);
      callback();
    }, delay);
    timeoutIds.add(timeoutId);
    return timeoutId;
  }

  function scheduleAnimationFrame(callback: FrameRequestCallback) {
    const animationFrameId = window.requestAnimationFrame(timestamp => {
      animationFrameIds.delete(animationFrameId);
      callback(timestamp);
    });
    animationFrameIds.add(animationFrameId);
    return animationFrameId;
  }

  function makeId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  if (window.__reactiveWorkspaceInitialized) return () => {};
  window.__reactiveWorkspaceInitialized = true;
  const CHAT_PLACEHOLDER = 'ask a follow-up...';
  const FULL_VIZ_OPTIONS = [
    { key: 'bar', label: 'bar', enabled: true },
    { key: 'line', label: 'line', enabled: true },
    { key: 'area', label: 'area', enabled: true },
    { key: 'pie', label: 'pie', enabled: true },
    { key: 'donut', label: 'donut', enabled: true },
    { key: 'sankey', label: 'sankey', enabled: true },
    { key: 'text', label: 'text', enabled: true }
  ];
  const TABLE_PLUS_VIZ_OPTIONS = [{ key: 'table', label: 'table', enabled: true }, ...FULL_VIZ_OPTIONS];
  const RANGE_OPTIONS = ['7D', '30D', '90D', '1Y'];

    const landingCards = [
      { key: 'vendor-leaderboard', title: 'Vendor Leaderboard', description: 'Compare vendor performance across pricing, quality, timeline, and NCE risk.' },
      { key: 'downline-products', title: 'Downline Products', description: 'See which products are advancing, stalling, or clustering in the current pipeline.' },
      { key: 'nce-alerts', title: 'NCE Alerts', description: 'Surface recent change activity, escalation patterns, and the contracts driving them.' },
      { key: 'milestone-slippages', title: 'Milestone Slippages', description: 'Track where schedules are moving and where delivery slippage is accumulating.' },
      { key: 'bid-value-spread', title: 'Bid Value Spread', description: 'Inspect distribution shape, outliers, and high-value clusters across the bid set.' },
      { key: 'risk-flags', title: 'Risk Flags by Vendor', description: 'Rank open risk flags by vendor, severity, and concentration of exposure.' }
    ];

    const quickStartChips = [
      'supplier quality flow',
      'Bid Evaluation summary',
      'contract spend tracking'
    ];

    const chipPresets = [
      ['supplier quality flow', 'Bid Evaluation summary', 'contract spend tracking'],
      ['nce alerts summary', 'downline products status', 'milestone slippages overview'],
      ['risk flags by vendor', 'compare vendors by region', 'contract spend tracking'],
      ['timeline risk only', 'filter by contract value', 'vendor leaderboard snapshot']
    ];

    const vendorRows = [
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

    const drilldowns = {
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

    const genericDrilldown = vendorId => ({
      title: `${vendorRows.find(row => row.id === vendorId)?.vendor || vendorId.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')}`,
      meta: 'Selected from current analysis',
      selected: [
        ['Overall Rank', vendorRows.find(row => row.id === vendorId)?.rank || '#—'],
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

    const followupMap = {
      'supplier-x': ['Which furnace is most exposed?', 'Compare Supplier X with other silicon suppliers'],
      'bf3-superheat': ['Compare BF-3 with BF-5 superheat', 'Show BF-3 impact on downstream CCMs'],
      'ccm3-solidification': ['Which grades are most affected?', 'Compare CCM-3 with CCM-1'],
      'grade-risk': ['Quantify Automotive revenue risk', 'Show commitment vs projected delivery'],
      'Superheat reading over last 7 days': ['Compare BF-3 with BF-5 superheat', 'Show BF-3 impact on downstream CCMs'],
      'BF-3 vs BF-5 superheat comparison': ['Which furnace is most exposed?', 'Show BF-3 impact on downstream CCMs'],
      'Impact on downstream CCM assignment': ['Compare CCM-3 with CCM-1', 'Which grades are most affected?'],
      'Historical frequency of BF-3 going below 28°C': ['Compare BF-3 with BF-5 superheat', 'Quantify Automotive revenue risk']
    };

    const storyHeader = {
      title: 'Hidden Cost Overrun',
      subtitle: 'FY 2024 hidden manufacturing cost traced across procurement, operations, logistics, quality, supplier, planning, and contract performance.',
      context: 'Manufacturing hidden cost investigation'
    };

    const storyActs = [
      { id: 'act-1', label: 'Act 1', name: 'Total Hidden Cost Magnitude', kicker: 'Scale first', blurb: 'Let the size of the overrun hit before the causes fragment into detail.' },
      { id: 'act-2', label: 'Act 2', name: 'Category Drill Down', kicker: 'Diagnosis', blurb: 'Move into one category at a time and isolate the three most expensive bleeding points.' },
      { id: 'act-3', label: 'Act 3', name: 'Risk Connection', kicker: 'Signals ignored', blurb: 'Show where early warning signals appeared months before the cost actually hit.' },
      { id: 'act-4', label: 'Act 4', name: 'Comparison & Recommendations', kicker: 'Decide what to do', blurb: 'Shift from analysis to priority, action, and execution windows.' }
    ];

    const storyCategories = [
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

    const storyCategoryPositions = {
      procurement: { size: 220, left: '8%', top: '20%' },
      operations: { size: 182, left: '38%', top: '14%' },
      logistics: { size: 144, left: '66%', top: '28%' },
      quality: { size: 120, left: '26%', top: '55%' },
      supplier: { size: 104, left: '54%', top: '54%' },
      planning: { size: 86, left: '73%', top: '57%' },
      contract: { size: 72, left: '14%', top: '68%' }
    };

    const historicalRiskRows = [
      { title: 'Supplier X delivery failure', riskMonth: 'Feb', costMonth: 'Jul', gap: '5 months', costImpact: '£7.1M', risk: 'Single-source dependency on coking coal supplier, capacity constraint signals noted.', action: 'None.', outcome: 'Forced spot purchasing begins.', status: 'Still unresolved. Supplier X remains sole source.' },
      { title: 'Port congestion — Rotterdam and Immingham', riskMonth: 'Apr', costMonth: 'Jul', gap: '3 months', costImpact: '£6.3M', risk: 'Congestion alerts from port authority bulletins logged in logistics risk register.', action: 'Escalated June 2024 — too late to reroute.', outcome: 'Demurrage charges begin.', status: 'Partially resolved. Alternative berth arrangements for Q1 FY25.' },
      { title: 'Blast furnace reliability — Port Talbot Furnace 2', riskMonth: 'Feb', costMonth: 'Sep', gap: '7 months', costImpact: '£4.9M', risk: 'Overdue inspection flag, increasing vibration readings logged in maintenance risk log.', action: 'Escalated August 2024 after first stoppage — reactive not preventive.', outcome: 'Second and third stoppages drive cost spike.', status: 'Furnace 2 maintenance scheduled Q1 FY25.' },
      { title: 'HSLA steel quality — automotive customers', riskMonth: 'May', costMonth: 'Aug', gap: '3 months', costImpact: '£2.8M', risk: 'Borderline sulphur readings in quality control log.', action: 'None — never formally escalated.', outcome: 'First customer claim received.', status: 'Process parameters tightened but raw material root cause unresolved.' }
    ];

    const forwardRiskRows = [
      { title: 'Furnace 1 vibration readings', riskMonth: 'Nov', exposure: '£4.9M', window: 'Estimated 3 months', detail: 'Identical early signals to Furnace 2 in February 2024.' },
      { title: 'Supplier financial health — 2 suppliers', riskMonth: 'Oct', exposure: '£2.2M', window: 'Immediate review', detail: '2 tier-2 suppliers showing deteriorating payment behaviour and credit score decline.' },
      { title: 'Freight contract renewal', riskMonth: 'Dec', exposure: '£1.8M', window: '60 days', detail: 'Current spot market rates are 22% above expiring contracted rates.' },
      { title: 'Automotive customer quality penalty clauses', riskMonth: 'Dec', exposure: '£1.2M', window: 'Before Q2 FY25', detail: 'Major automotive customer renewal includes tighter quality penalty clauses.' }
    ];

    const scoreMatrix = [
      { key: 'procurement', label: 'Procurement', magnitude: 5, fixability: 4, risk: 5, total: 14, priority: 'High' },
      { key: 'operations', label: 'Operations', magnitude: 4, fixability: 3, risk: 4, total: 11, priority: 'High' },
      { key: 'logistics', label: 'Logistics', magnitude: 3, fixability: 5, risk: 3, total: 11, priority: 'High' },
      { key: 'quality', label: 'Quality', magnitude: 2, fixability: 4, risk: 2, total: 8, priority: 'Medium' },
      { key: 'supplier', label: 'Supplier', magnitude: 2, fixability: 2, risk: 4, total: 8, priority: 'Medium' },
      { key: 'planning', label: 'Planning', magnitude: 1, fixability: 3, risk: 3, total: 7, priority: 'Monitor' },
      { key: 'contract', label: 'Contract', magnitude: 1, fixability: 3, risk: 2, total: 6, priority: 'Monitor' }
    ];

    const recommendationCards = [
      { order: '01', category: 'Procurement', priority: 'High', action: 'Dual-source the top 3 single-source supplier relationships before Q2 FY25.', detail: 'Supplier X for coking coal, Supplier Y for iron ore, Supplier Z for specialist alloys. Single-source dependency generated £7.1M in spot purchasing costs in FY24 alone.', timeframe: 'Within 90 days' },
      { order: '02', category: 'Operations', priority: 'High', action: 'Schedule Furnace 1 full maintenance in Q1 FY25.', detail: 'Vibration readings are 4 months into the same pattern that preceded Furnace 2 failure. There are approximately 3 months remaining before the pattern escalates.', timeframe: 'Schedule within 30 days' },
      { order: '03', category: 'Logistics', priority: 'High', action: 'Renegotiate outbound freight contracts before expiry.', detail: 'Current market rates are 22% above expiring contracted levels. This is the highest-fixability action in the dataset.', timeframe: 'Hard deadline — 60 days' },
      { order: '04', category: 'Systemic', priority: 'Monitor', action: 'Connect the risk register to the contract and procurement review cycle.', detail: 'The average 5-month gap between risk flag and cost impact is a process failure, not a data failure. £14–16M could have been avoided with a 30-day risk-to-action protocol.', timeframe: 'Before FY25 planning closes' }
    ];

    const app = getRequiredElement<HTMLElement>('app');
    const canvas = getRequiredElement<HTMLElement>('canvas');
    const landing = getRequiredElement<HTMLElement>('landing');
    const landingFloater = getRequiredElement<HTMLElement>('landingFloater');
    const workspaceTools = getRequiredElement<HTMLElement>('workspaceTools');
    const workspaceMain = getRequiredElement<HTMLElement>('workspaceMain');
    const thread = getRequiredElement<HTMLElement>('thread');
    const emptyThread = getRequiredElement<HTMLElement>('emptyThread');
    const inputZone = getRequiredElement<HTMLElement>('inputZone');
    const composer = getRequiredElement<HTMLFormElement>('composer');
    const composerInput = getRequiredElement<HTMLInputElement>('composerInput');
    const composerStarters = getRequiredElement<HTMLElement>('composerStarters');
    const historyButtonEl = getRequiredElement<HTMLButtonElement>('historyButton');
    const bookmarksButtonEl = getRequiredElement<HTMLButtonElement>('bookmarksButton');
    const timelineRail = getRequiredElement<HTMLElement>('timelineRail');
    const timelineSegments = getRequiredElement<HTMLElement>('timelineSegments');
    const timelineTooltip = getRequiredElement<HTMLElement>('timelineTooltip');
    const historyList = getRequiredElement<HTMLElement>('historyList');
    const panel = getRequiredElement<HTMLElement>('drillPanel');
    const panelTitle = getRequiredElement<HTMLElement>('panelTitle');
    const panelMeta = getRequiredElement<HTMLElement>('panelMeta');
    const panelBody = getRequiredElement<HTMLElement>('panelBody');
    const bookmarksSheet = getRequiredElement<HTMLElement>('bookmarksSheet');
    const historySheet = getRequiredElement<HTMLElement>('historySheet');
    const artifactsSheet = getRequiredElement<HTMLElement>('artifactsSheet');
    const bookmarksList = getRequiredElement<HTMLElement>('bookmarksList');
    const artifactsList = getRequiredElement<HTMLElement>('artifactsList');
    const profileMenu = getRequiredElement<HTMLElement>('profileMenu');
    const starterButton = getRequiredElement<HTMLButtonElement>('starterButton');
    const historyButton = getRequiredElement<HTMLButtonElement>('historyButton');
    const newThreadButton = getRequiredElement<HTMLButtonElement>('newThread');
    const bookmarksButton = getRequiredElement<HTMLButtonElement>('bookmarksButton');
    const profileButton = getRequiredElement<HTMLButtonElement>('profileButton');
    const scrollUpButton = getRequiredElement<HTMLButtonElement>('scrollUp');
    const scrollDownButton = getRequiredElement<HTMLButtonElement>('scrollDown');

    const state = {
      mode: 'landing',
      currentThreadId: 'current',
      centeredInput: false,
      threads: { current: [] },
      threadMeta: {
        current: {
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      },
      historyOpen: false,
      profileMenuOpen: false,
      storyActIndex: 0,
      storyCategoryKey: 'procurement',
      storyDirection: 'next',
      landingChipCursor: 1,
      landingChipsByThread: { current: [...chipPresets[0]] },
      activePanel: null,
      selectedEntity: null,
      panelResponseId: null,
      followupContext: null,
      exportOpenFor: null,
      feedbackForResponseId: null,
      bookmarks: new Set(),
      liked: new Set(),
      reviewed: new Set()
    };

    function currentResponses() {
      return state.threads[state.currentThreadId] || [];
    }

    function formatThreadTime(value) {
      return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function formatResponseTime(response) {
      const created = response.createdAt ? new Date(response.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) return response.timestamp || '';
      const now = new Date();
      const isToday = created.getDate() === now.getDate()
        && created.getMonth() === now.getMonth()
        && created.getFullYear() === now.getFullYear();
      const time = created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) return `Today · ${time}`;
      const date = created.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${date} · ${time}`;
    }

    function formatLabelFor(format) {
      const map = {
        table: 'Table',
        bar: 'Bar Chart',
        line: 'Line Chart',
        area: 'Area Chart',
        pie: 'Pie Chart',
        donut: 'Donut Chart',
        sankey: 'Sankey Diagram',
        text: 'Text',
        flow: 'Flow',
        briefing: 'Briefing Card',
        insights: 'Insights'
      };
      return map[format] || 'View';
    }

    function supportsTimeRange(format) {
      return ['bar', 'line', 'area', 'pie', 'donut', 'sankey', 'flow'].includes(format);
    }

    function rangeFactor(range) {
      const map = { '7D': 0.88, '30D': 1, '90D': 1.08, '1Y': 1.18 };
      return map[range] || 1;
    }

    function rowsForRange(rows = [], range = '30D') {
      const factor = rangeFactor(range);
      return rows.map(row => ({
        ...row,
        pricing: Math.max(8, Math.min(100, Math.round((row.pricing || 0) * factor)))
      }));
    }

    function deriveInsights(response, rows = []) {
      if (Array.isArray(response.keyInsights) && response.keyInsights.length) return response.keyInsights.slice(0, 3);
      const sorted = [...rows].sort((a, b) => (b.pricing || 0) - (a.pricing || 0));
      const top = sorted[0];
      const bottom = sorted[sorted.length - 1];
      const avg = rows.length ? Math.round(rows.reduce((acc, row) => acc + (row.pricing || 0), 0) / rows.length) : null;
      const insights = [];
      if (top) insights.push(`${top.vendor} is leading this view at ${top.pricing}.`);
      if (bottom && bottom !== top) insights.push(`${bottom.vendor} is currently the weakest point at ${bottom.pricing}.`);
      if (avg !== null) insights.push(`The current portfolio average is ${avg}, indicating ${avg >= 70 ? 'strong' : avg >= 50 ? 'mixed' : 'weak'} overall performance.`);
      while (insights.length < 3) insights.push('This view indicates a meaningful distribution spread that warrants follow-up on the outliers.');
      return insights.slice(0, 3);
    }

    function ensureThreadMeta(threadId) {
      if (!state.threadMeta[threadId]) {
        state.threadMeta[threadId] = { createdAt: Date.now(), updatedAt: Date.now() };
      }
      return state.threadMeta[threadId];
    }

    function touchThread(threadId = state.currentThreadId) {
      const meta = ensureThreadMeta(threadId);
      meta.updatedAt = Date.now();
    }

    function setThreadResponses(threadId, responses) {
      state.threads[threadId] = responses.map(response => {
        if (!response.createdAt) response.createdAt = Date.now();
        if (!response.timestamp) response.timestamp = new Date(response.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return response;
      });
      touchThread(threadId);
    }

    function appendResponseToCurrentThread(response) {
      if (!response.createdAt) response.createdAt = Date.now();
      if (!response.timestamp) response.timestamp = new Date(response.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      currentResponses().push(response);
      touchThread(state.currentThreadId);
    }

    function summarizeText(value, max = 86) {
      if (!value) return '';
      return value.length > max ? `${value.slice(0, max - 1)}…` : value;
    }

    function ensureLandingChipsForThread(threadId) {
      if (!state.landingChipsByThread[threadId]) {
        const preset = chipPresets[state.landingChipCursor % chipPresets.length];
        state.landingChipCursor += 1;
        state.landingChipsByThread[threadId] = [...preset];
      }
      return state.landingChipsByThread[threadId];
    }

    function startNewChatAtLanding() {
      const nextThreadId = `chat-${Date.now()}`;
      state.currentThreadId = nextThreadId;
      state.threads[nextThreadId] = [];
      ensureThreadMeta(nextThreadId);
      ensureLandingChipsForThread(nextThreadId);
      state.mode = 'landing';
      state.centeredInput = false;
      state.historyOpen = false;
      state.profileMenuOpen = false;
      resetPanels();
      composerInput.value = '';
      composerInput.placeholder = CHAT_PLACEHOLDER;
      renderAll();
      canvas.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
    }

    function serializeVizConfig(config) {
      return encodeURIComponent(JSON.stringify(config));
    }

    function renderVizMount(config, className = 'd3-mount') {
      return `<div class="${className}" data-d3-viz="${serializeVizConfig(config)}"></div>`;
    }

    function rowsForLens(question) {
      const key = question.toLowerCase();
      if (key.includes('compare by region')) {
        return [
          { id: 'vendor-a', vendor: 'Vendor A', company: 'West Region', pricing: 72, quality: 66, timeline: 51, risk: 'High', rank: '#2' },
          { id: 'vendor-b', vendor: 'Vendor B', company: 'North Region', pricing: 68, quality: 84, timeline: 78, risk: 'Low', rank: '#1' },
          { id: 'vendor-c', vendor: 'Vendor C', company: 'South Region', pricing: 76, quality: 59, timeline: 70, risk: 'Medium', rank: '#3' },
          { id: 'vendor-d', vendor: 'Vendor D', company: 'East Region', pricing: 61, quality: 71, timeline: 82, risk: 'Low', rank: '#4' },
          { id: 'vendor-e', vendor: 'Vendor E', company: 'Central Region', pricing: 48, quality: 67, timeline: 61, risk: 'High', rank: '#5' }
        ];
      }
      if (key.includes('nce impact on rank')) {
        return [
          { id: 'vendor-a', vendor: 'Vendor A', company: 'Tata Projects', pricing: 78, quality: 61, timeline: 44, risk: 'High', rank: '#3' },
          { id: 'vendor-b', vendor: 'Vendor B', company: 'L&T Construction', pricing: 65, quality: 91, timeline: 72, risk: 'Low', rank: '#1' },
          { id: 'vendor-c', vendor: 'Vendor C', company: 'Afcons Infra', pricing: 80, quality: 58, timeline: 76, risk: 'Medium', rank: '#2' },
          { id: 'vendor-d', vendor: 'Vendor D', company: 'NCC Ltd', pricing: 62, quality: 74, timeline: 88, risk: 'Low', rank: '#4' },
          { id: 'vendor-e', vendor: 'Vendor E', company: 'KEC International', pricing: 49, quality: 70, timeline: 63, risk: 'High', rank: '#5' }
        ];
      }
      if (key.includes('filter by contract value')) {
        return [
          { id: 'vendor-a', vendor: 'Vendor A', company: 'Tata Projects', pricing: 82, quality: 64, timeline: 49, risk: 'High', rank: '#1' },
          { id: 'vendor-c', vendor: 'Vendor C', company: 'Afcons Infra', pricing: 77, quality: 60, timeline: 73, risk: 'Medium', rank: '#2' },
          { id: 'vendor-b', vendor: 'Vendor B', company: 'L&T Construction', pricing: 63, quality: 87, timeline: 69, risk: 'Low', rank: '#3' },
          { id: 'vendor-d', vendor: 'Vendor D', company: 'NCC Ltd', pricing: 58, quality: 72, timeline: 84, risk: 'Low', rank: '#4' }
        ];
      }
      if (key.includes('timeline risk only')) {
        return [
          { id: 'vendor-d', vendor: 'Vendor D', company: 'NCC Ltd', pricing: 62, quality: 74, timeline: 88, risk: 'Low', rank: '#1' },
          { id: 'vendor-c', vendor: 'Vendor C', company: 'Afcons Infra', pricing: 80, quality: 58, timeline: 76, risk: 'Medium', rank: '#2' },
          { id: 'vendor-b', vendor: 'Vendor B', company: 'L&T Construction', pricing: 65, quality: 91, timeline: 72, risk: 'Low', rank: '#3' },
          { id: 'vendor-e', vendor: 'Vendor E', company: 'KEC International', pricing: 49, quality: 70, timeline: 63, risk: 'High', rank: '#4' },
          { id: 'vendor-a', vendor: 'Vendor A', company: 'Tata Projects', pricing: 78, quality: 61, timeline: 44, risk: 'High', rank: '#5' }
        ];
      }
      return structuredClone(vendorRows);
    }

    function insightForLens(question) {
      const key = question.toLowerCase();
      if (key.includes('compare by region')) {
        return 'Viewed by region, the north group is currently the most balanced, while the west group still carries the highest NCE strain relative to its rank position.';
      }
      if (key.includes('nce impact on rank')) {
        return 'Once NCE exposure is weighted more strongly, Vendor A drops behind the more stable mid-pack operators, which suggests the original rank was flattering its true position.';
      }
      if (key.includes('filter by contract value')) {
        return 'When restricted to higher-value contracts, the leaderboard compresses and Vendor A still leads, but the gap is narrower than in the full portfolio view.';
      }
      if (key.includes('timeline risk only')) {
        return 'A timeline-only lens changes the order materially, with Vendor D moving to the top due to schedule resilience and Vendor A falling because of late-stage slippage.';
      }
      return 'Vendor A currently leads overall, but its NCE exposure is materially higher than the rest of the group and is likely masking a more fragile position than rank alone suggests.';
    }

    function baseResponse(question = 'Vendor Leaderboard') {
      const normalizedQuestion = question.toLowerCase().trim();
      if (normalizedQuestion.includes('hidden cost') && (normalizedQuestion.includes('overrun') || normalizedQuestion.includes('overruns'))) {
        return {
          id: makeId(),
          topic: 'hidden-cost-overrun',
          title: 'Hidden Cost Overrun',
          question,
          format: 'story',
          formatLabel: 'Story',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'This walkthrough traces total hidden cost, the worst categories, the missed risk signals, and the actions with the highest leverage.',
          options: [{ key: 'story', label: 'story', enabled: true }],
          storyActIndex: 0,
          storyCategoryKey: 'procurement',
          storyDirection: 'next',
          rows: [],
          lenses: [],
          keyInsights: []
        };
      }
      if (normalizedQuestion === 'show overall insights') {
        return {
          id: makeId(),
          topic: 'overall-insights',
          title: 'Overall Insights Briefing',
          question,
          format: 'briefing',
          formatLabel: 'Briefing Card',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Two contracts are approaching SLA breach and IT services spend is tracking 34% above plan, which should be treated as this week\'s highest-priority intervention.',
          options: [{ key: 'briefing', label: 'briefing', enabled: true }, ...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          briefing: {
            headline: 'Two contracts are approaching SLA breach and IT Services spend is 34% above plan, so this needs intervention before end of week.',
            tiles: [
              { domain: 'Vendors', status: 'amber', metric: '4/11 need action', note: 'Vendor A and C now carry repeated escalation patterns.' },
              { domain: 'Budget', status: 'red', metric: '+34% vs plan', note: 'IT Services overrun is driving most variance this cycle.' },
              { domain: 'Risk', status: 'red', metric: '7 open flags', note: 'Two high-severity flags are within 72-hour breach windows.' },
              { domain: 'Timelines', status: 'amber', metric: '3 slips this week', note: 'Milestone drift is clustered around procurement dependencies.' }
            ]
          },
          rows: [
            { id: 'vendors', vendor: 'Vendors', company: '4/11 need action', pricing: 64 },
            { id: 'budget', vendor: 'Budget', company: '+34% vs plan', pricing: 89 },
            { id: 'risk', vendor: 'Risk', company: '7 open flags', pricing: 82 },
            { id: 'timelines', vendor: 'Timelines', company: '3 slips this week', pricing: 58 }
          ],
          lenses: ['Drill into budget', 'Show the risk flags', 'What is causing the delays'],
          keyInsights: [
            'Budget and risk are currently the two most unstable domains and need immediate attention.',
            'Vendor and timeline issues are connected through procurement delay clusters.',
            'The current pattern suggests avoidable SLA breaches if no intervention is made this week.'
          ]
        };
      }

      if (question.toLowerCase() === 'supplier quality flow') {
        return {
          id: makeId(),
          topic: 'supplier-quality-flow',
          title: 'Supplier Quality Flow',
          question,
          format: 'flow',
          formatLabel: 'Flow',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Material quality is drifting at Supplier X, and the deviation is propagating downstream through BF-3 into CCM-3 before surfacing as Automotive grade risk.',
          lenses: [],
          options: [{ key: 'flow', label: 'flow', enabled: true }, ...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          rows: [
            { id: 'supplier-x', vendor: 'Supplier X', company: 'Source deviation', pricing: 84 },
            { id: 'bf3-superheat', vendor: 'BF-3', company: 'Thermal variance', pricing: 73 },
            { id: 'ccm3-solidification', vendor: 'CCM-3', company: 'Solidification risk', pricing: 67 },
            { id: 'grade-risk', vendor: 'Automotive Grade', company: 'Customer exposure', pricing: 74 }
          ],
          keyInsights: [
            'Supplier X remains the principal upstream trigger for this downstream chain.',
            'BF-3 and CCM-3 are the highest leverage control points for mitigation.',
            'Automotive grade risk is now a downstream symptom, not the root cause.'
          ]
        };
      }
      if (question === 'Bid Evaluation summary' || question === 'contract spend tracking') {
        return {
          id: makeId(),
          topic: question.toLowerCase().replaceAll(' ', '-'),
          title: question,
          question,
          format: 'text',
          formatLabel: 'Text',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Starter context selected. This thread is ready for the next configured visualization.',
          lenses: [],
          options: [...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          rows: []
        };
      }
      return {
        id: makeId(),
        topic: 'vendor-leaderboard',
        title: 'Vendor Leaderboard',
        question,
        format: 'table',
        formatLabel: 'Table',
        insight: insightForLens(question),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lenses: ['NCE impact on rank', 'Filter by contract value', 'Compare by region', 'Timeline risk only'],
        options: TABLE_PLUS_VIZ_OPTIONS,
        timeRanges: RANGE_OPTIONS,
        timeRange: '30D',
        rows: rowsForLens(question)
      };
    }

    function resetPanels() {
      state.activePanel = null;
      state.selectedEntity = null;
      state.panelResponseId = null;
      state.followupContext = null;
      state.exportOpenFor = null;
    }

    function createLandingOrb() {
      const totalDots = 600;
      const dotRadius = 1;
      const duration = 3;
      const dotColor = '#7ABEBA';
      const margin = 2;
      const minOpacity = 0.3;
      const maxOpacity = 1;
      const minScale = 0.5;
      const maxScale = 1.5;
      const angle = Math.PI * (3 - Math.sqrt(5));
      const center = 200;
      const maxRadius = center - margin - dotRadius;
      let circles = '';

      for (let index = 0; index < totalDots; index += 1) {
        const step = index + 0.5;
        const ratio = step / totalDots;
        const radius = Math.sqrt(ratio) * maxRadius;
        const theta = step * angle;
        const x = center + radius * Math.cos(theta);
        const y = center + radius * Math.sin(theta);
        const begin = (ratio * duration).toFixed(2);
        const radiusLow = (dotRadius * minScale).toFixed(2);
        const radiusHigh = (dotRadius * maxScale).toFixed(2);

        circles += `
          <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${dotRadius}" fill="${dotColor}" opacity="0">
            <animate attributeName="r" values="${radiusLow};${radiusHigh};${radiusLow}" dur="${duration}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
            <animate attributeName="opacity" values="${minOpacity};${maxOpacity};${minOpacity}" dur="${duration}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
          </circle>
        `;
      }

      return `
        <svg viewBox="0 0 400 400" aria-hidden="true" focusable="false">
          ${circles}
        </svg>
      `;
    }

    function storyToneClass(tone) {
      const map = {
        critical: 'tone-critical',
        elevated: 'tone-elevated',
        monitor: 'tone-monitor'
      };
      return map[tone] || 'tone-monitor';
    }

    function storyTrendMeta(trend) {
      const map = {
        worsening: { label: 'Worsening', icon: '↑', className: 'trend-worsening' },
        improving: { label: 'Improving', icon: '↓', className: 'trend-improving' },
        stable: { label: 'Stable', icon: '—', className: 'trend-stable' },
        watch: { label: 'Watch', icon: '•', className: 'trend-watch' }
      };
      return map[trend] || map.stable;
    }

    function monthToPercent(month) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const index = months.indexOf(month);
      if (index < 0) return 0;
      return (index / 11) * 100;
    }

    function renderStoryDotScore(count) {
      return `
        <div class="story-dot-score" aria-label="${count} out of 5">
          ${Array.from({ length: 5 }, (_, index) => `<span class="${index < count ? 'filled' : ''}"></span>`).join('')}
        </div>
      `;
    }

    function renderActOne() {
      return `
        <div class="story-panel story-panel-magnitude">
          <div class="magnitude-copy">
            <div class="magnitude-kicker">Operational hidden cost</div>
            <div class="magnitude-total">£47.2M</div>
            <div class="magnitude-meta">FY 2024</div>
            <div class="magnitude-delta-grid">
              <div class="magnitude-stat"><strong>18.4%</strong><span>above budgeted operational cost</span></div>
              <div class="magnitude-stat"><strong>48%</strong><span>up from £31.8M in FY 2023</span></div>
            </div>
            <div class="story-insight-card">
              <div class="story-insight-label">Lead signal</div>
              <div class="story-insight-text">Procurement and Operations together account for 61% of total hidden cost. Both are worsening year on year.</div>
            </div>
          </div>
          <div class="magnitude-bubble-field">
            ${storyCategories.map(category => {
              const pos = storyCategoryPositions[category.key];
              return `
                <div class="magnitude-bubble ${storyToneClass(category.tone)}" style="--bubble-size:${pos.size}px; --bubble-left:${pos.left}; --bubble-top:${pos.top};">
                  <span class="bubble-name">${escapeHtml(category.label)}</span>
                  <strong>${escapeHtml(category.valueLabel)}</strong>
                  <span>${category.share}%</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    function renderActTwo(response) {
      const category = storyCategories.find(item => item.key === response.storyCategoryKey) || storyCategories[0];
      const peak = Math.max(...category.factors.map(item => item.value));
      const toneColor = category.tone === 'critical' ? '#f46a72' : category.tone === 'elevated' ? '#f0b35f' : '#93a2bb';
      return `
        <div class="story-panel story-panel-drill">
          <div class="story-pill-row">
            ${storyCategories.map(item => `
              <button type="button" class="story-switch-pill ${item.key === category.key ? 'active' : ''}" data-story-category="${item.key}" data-response-id="${response.id}">
                ${escapeHtml(item.label)}
              </button>
            `).join('')}
          </div>
          <div class="drill-grid">
            <div class="drill-bars">
              ${category.factors.map((factor, index) => {
                const trend = storyTrendMeta(factor.trend);
                return `
                  <div class="drill-card">
                    <div class="drill-card-header">
                      <div>
                        <div class="drill-factor">${index + 1}. ${escapeHtml(factor.label)}</div>
                        <div class="drill-cause-pill">${escapeHtml(factor.cause)}</div>
                      </div>
                      <div class="drill-trend ${trend.className}">
                        <span>${trend.icon}</span>
                        <span>${trend.label}</span>
                      </div>
                    </div>
                    <div class="drill-track">
                      <div class="drill-fill ${storyToneClass(category.tone)}" style="width:${(factor.value / peak) * 100}%"></div>
                    </div>
                    <div class="drill-value">${escapeHtml(factor.valueLabel)}</div>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="drill-context-card">
              <div class="drill-context-meta">Share of £47.2M total</div>
              <div class="drill-donut" style="background: conic-gradient(${toneColor} 0 ${category.share}%, rgba(255,255,255,0.08) ${category.share}% 100%);">
                <div class="drill-donut-center">
                  <strong>${category.share}%</strong>
                  <span>${escapeHtml(category.label)}</span>
                </div>
              </div>
              <div class="drill-context-value">${escapeHtml(category.valueLabel)}</div>
              <div class="story-insight-card">
                <div class="story-insight-label">Most important finding</div>
                <div class="story-insight-text">${escapeHtml(category.insight)}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function renderActThreeRow(row, forward = false) {
      const riskPos = monthToPercent(row.riskMonth);
      const costPos = forward ? riskPos : monthToPercent(row.costMonth);
      return `
        <div class="timeline-row ${forward ? 'timeline-row-forward' : ''}">
          <div class="timeline-row-header">
            <div class="timeline-row-title">${escapeHtml(row.title)}</div>
            <div class="timeline-badges">
              ${forward ? `<span class="timeline-badge exposure">${escapeHtml(row.exposure)}</span>` : `<span class="timeline-badge gap">${escapeHtml(row.gap)}</span><span class="timeline-badge cost">${escapeHtml(row.costImpact)}</span>`}
            </div>
          </div>
          <div class="timeline-track-shell">
            <div class="timeline-track-line"></div>
            <div class="timeline-risk-dot" style="left:${riskPos}%"></div>
            ${forward ? '' : `<div class="timeline-gap-line" style="left:${riskPos}%; width:${Math.max(costPos - riskPos, 2)}%"></div><div class="timeline-cost-dot" style="left:${costPos}%"></div>`}
          </div>
          <div class="timeline-row-copy">
            ${forward
              ? `<span><strong>Detail:</strong> ${escapeHtml(row.detail)}</span><span><strong>Window to act:</strong> ${escapeHtml(row.window)}</span>`
              : `<span><strong>Risk flagged:</strong> ${escapeHtml(row.riskMonth)} — ${escapeHtml(row.risk)}</span><span><strong>Action taken:</strong> ${escapeHtml(row.action)}</span><span><strong>Cost hit:</strong> ${escapeHtml(row.outcome)} ${escapeHtml(row.status)}</span>`}
          </div>
        </div>
      `;
    }

    function renderActThree() {
      return `
        <div class="story-panel story-panel-risk">
          <div class="timeline-months">
            ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => `<span>${month}</span>`).join('')}
          </div>
          <div class="timeline-section">
            ${historicalRiskRows.map(row => renderActThreeRow(row)).join('')}
          </div>
          <div class="timeline-summary-card">£18.3M in cost was preceded by a known risk signal. Average gap between signal and cost: 5 months.</div>
          <div class="timeline-forward-heading">Forward risks — amber signal visible, cost window still open</div>
          <div class="timeline-section timeline-section-forward">
            ${forwardRiskRows.map(row => renderActThreeRow(row, true)).join('')}
          </div>
        </div>
      `;
    }

    function renderActFour() {
      const maxTotal = Math.max(...scoreMatrix.map(item => item.total));
      return `
        <div class="story-panel story-panel-recommend">
          <div class="scorecard-matrix">
            <div class="scorecard-head">Category</div>
            <div class="scorecard-head">Cost magnitude</div>
            <div class="scorecard-head">Fixability</div>
            <div class="scorecard-head">Forward risk</div>
            <div class="scorecard-head">Priority</div>
            ${scoreMatrix.map(item => `
              <div class="scorecard-cell scorecard-category">${escapeHtml(item.label)}</div>
              <div class="scorecard-cell">${renderStoryDotScore(item.magnitude)}</div>
              <div class="scorecard-cell">${renderStoryDotScore(item.fixability)}</div>
              <div class="scorecard-cell">${renderStoryDotScore(item.risk)}</div>
              <div class="scorecard-cell"><span class="priority-pill priority-${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</span></div>
            `).join('')}
          </div>
          <div class="scorecard-footnote">Cost magnitude is based on £ value relative to £47.2M total. Fixability reflects how much of the root cause sits within direct control. Forward risk reflects the number and severity of active FY25 signals.</div>
          <div class="priority-bars">
            ${scoreMatrix.map(item => `
              <div class="priority-bar-row">
                <div class="priority-bar-label">${escapeHtml(item.label)}</div>
                <div class="priority-bar-track">
                  <div class="priority-bar-fill priority-${item.priority.toLowerCase()}" style="width:${(item.total / maxTotal) * 100}%"></div>
                </div>
                <div class="priority-bar-score">${item.total}</div>
              </div>
            `).join('')}
          </div>
          <div class="recommendation-stack">
            ${recommendationCards.map(card => `
              <article class="recommendation-card priority-${card.priority.toLowerCase()}">
                <div class="recommendation-order">${card.order}</div>
                <div class="recommendation-body">
                  <div class="recommendation-meta">${escapeHtml(card.category)} · ${escapeHtml(card.timeframe)}</div>
                  <div class="recommendation-action">${escapeHtml(card.action)}</div>
                  <div class="recommendation-detail">${escapeHtml(card.detail)}</div>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      `;
    }

    function renderStoryStage(response) {
      const act = storyActs[response.storyActIndex || 0] || storyActs[0];
      if (act.id === 'act-1') return renderActOne();
      if (act.id === 'act-2') return renderActTwo(response);
      if (act.id === 'act-3') return renderActThree();
      return renderActFour();
    }

    function renderHiddenCostStory(response) {
      const actIndex = response.storyActIndex || 0;
      const act = storyActs[actIndex] || storyActs[0];
      const direction = response.storyDirection || 'next';
      return `
        <div class="story-shell response-story-shell">
          <section class="story-hero">
            <div class="story-overline">${escapeHtml(storyHeader.context)}</div>
            <div class="story-head-row">
              <div class="story-head-copy">
                <div class="story-title">${escapeHtml(storyHeader.title)}</div>
                <div class="story-subtitle">${escapeHtml(storyHeader.subtitle)}</div>
              </div>
              <div class="story-nav-cluster">
                <div class="story-act-marker">
                  <span>${escapeHtml(act.label)}</span>
                  <strong>${escapeHtml(act.name)}</strong>
                </div>
                <div class="story-nav-controls">
                  <button type="button" class="story-nav-btn" data-story-nav="prev" data-response-id="${response.id}" ${actIndex === 0 ? 'disabled' : ''}>Previous</button>
                  <button type="button" class="story-nav-btn" data-story-nav="next" data-response-id="${response.id}" ${actIndex === storyActs.length - 1 ? 'disabled' : ''}>Next</button>
                </div>
              </div>
            </div>
            <div class="story-act-tabs">
              ${storyActs.map((item, index) => `
                <button type="button" class="story-act-tab ${index === actIndex ? 'active' : ''}" data-story-act="${index}" data-response-id="${response.id}">
                  <span>${escapeHtml(item.label)}</span>
                  <strong>${escapeHtml(item.name)}</strong>
                </button>
              `).join('')}
            </div>
          </section>
          <section class="story-stage story-stage-${direction}">
            <div class="story-stage-copy">
              <div class="story-stage-kicker">${escapeHtml(act.kicker)}</div>
              <div class="story-stage-blurb">${escapeHtml(act.blurb)}</div>
            </div>
            ${renderStoryStage(response)}
          </section>
        </div>
      `;
    }

    function renderLanding() {
      landing.innerHTML = `
        <div class="landing-shell">
          <section class="landing-hero">
            <div class="landing-waves" aria-hidden="true"></div>

            <div class="landing-orb-zone">
              <div class="landing-head">
                <div class="landing-title">Hi, What would you like to explore today?</div>
                <div class="landing-subtitle">Start exploring your data, or pick a direction to begin.</div>
              </div>

              <div class="landing-orb-glow" aria-hidden="true"></div>
              <div class="landing-orb">${createLandingOrb()}</div>

              <div class="landing-prompt-area">
                <form class="landing-prompt" id="landingPromptForm">
                  <input
                    id="landingPromptInput"
                    class="landing-prompt-input"
                    type="text"
                    autocomplete="off"
                    placeholder="Choose a question or start your own workspace thread"
                  />
                  <button class="landing-prompt-send" type="submit" aria-label="Start conversation">→</button>
                </form>

                <div class="landing-chip-row">
                  ${ensureLandingChipsForThread(state.currentThreadId).map((chip, index) => `
                    <button class="landing-chip ${index === 0 ? 'strong' : ''}" type="button" data-starter="${escapeHtml(chip)}">
                      ${escapeHtml(chip)}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          </section>
        </div>
      `;

      const landingPromptForm = document.getElementById('landingPromptForm') as HTMLFormElement | null;
      const landingPromptInput = document.getElementById('landingPromptInput') as HTMLInputElement | null;
      if (landingPromptForm && landingPromptInput) {
        landingPromptForm.addEventListener('submit', event => {
          event.preventDefault();
          const value = landingPromptInput.value.trim();
          if (!value) {
            state.mode = 'empty';
            state.centeredInput = true;
            resetPanels();
            composerInput.value = '';
            composerInput.placeholder = CHAT_PLACEHOLDER;
            renderAll();
            scheduleTimeout(() => composerInput.focus(), 180);
            return;
          }

          const next = baseResponse(value);
          state.mode = 'thread';
          state.centeredInput = false;
          setThreadResponses(state.currentThreadId, [next]);
          resetPanels();
          composerInput.value = '';
          composerInput.placeholder = CHAT_PLACEHOLDER;
          renderAll();
          canvas.scrollTo({ top: 0, behavior: 'smooth' });
        }, { signal: controller.signal });
      }
    }

    function renderEmptyThread() {
      emptyThread.innerHTML = `
        <div class="empty-prompt">
          <div class="empty-copy">Use one of these quick starting points to begin a focused workspace thread.</div>
        </div>
      `;
    }

    function renderTable(rows) {
      return `
        <div class="table-shell">
          <div class="table-head">
            <div class="table-header">Vendor</div>
            <div class="table-header">Pricing Score</div>
            <div class="table-header">Quality Score</div>
            <div class="table-header hide-sm">Timeline Score</div>
            <div class="table-header hide-sm">NCE Risk</div>
            <div class="table-header">Rank</div>
          </div>
          ${rows.map((row, index) => `
            <button class="table-row" type="button" data-vendor="${row.id}">
              <div class="table-cell vendor-cell">
                <strong>${escapeHtml(row.vendor)}</strong>
                <span>${escapeHtml(row.company)}</span>
              </div>
              <div class="table-cell score-cell">
                <div class="score-track"><div class="score-fill" style="--score:${row.pricing}%; --delay:${index * 80}ms"></div></div>
                <div class="score-value">${row.pricing}</div>
              </div>
              <div class="table-cell score-cell">
                <div class="score-track"><div class="score-fill" style="--score:${row.quality}%; --delay:${index * 80 + 30}ms"></div></div>
                <div class="score-value">${row.quality}</div>
              </div>
              <div class="table-cell score-cell hide-sm">
                <div class="score-track"><div class="score-fill" style="--score:${row.timeline}%; --delay:${index * 80 + 60}ms"></div></div>
                <div class="score-value">${row.timeline}</div>
              </div>
              <div class="table-cell hide-sm ${row.risk === 'High' ? 'risk-high' : row.risk === 'Medium' ? 'risk-medium' : 'risk-low'}">${escapeHtml(row.risk)}</div>
              <div class="table-cell"><span class="rank-pill">${escapeHtml(row.rank)}</span></div>
            </button>
          `).join('')}
        </div>
      `;
    }

    function renderLineView(rows) {
      return `
        <div class="line-view viz-view">
          ${renderVizMount({ type: 'line', rows })}
        </div>
      `;
    }

    function renderAreaView(rows) {
      return `
        <div class="line-view area-view viz-view">
          ${renderVizMount({ type: 'area', rows })}
        </div>
      `;
    }

    function renderBarView(rows) {
      return `
        <div class="bar-view viz-view">
          ${renderVizMount({ type: 'bar', rows })}
          <div class="viz-action-list">
            ${rows.map(row => `
              <button class="viz-action-chip" type="button" data-entity="${row.id}">
                <strong>${escapeHtml(row.vendor)}</strong>
                <span>${row.pricing}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    function renderPieView(rows, mode = 'pie') {
      return `
        <div class="pie-view viz-view">
          ${renderVizMount({ type: mode, rows })}
        </div>
      `;
    }

    function renderSankeyView(rows) {
      return `
        <div class="sankey-view viz-view">
          ${renderVizMount({ type: 'sankey', rows })}
        </div>
      `;
    }

    function renderTextView(response) {
      const rows = rowsForRange(response.rows || [], response.timeRange || '30D');
      const docs = (rows.length ? rows : [
        { vendor: 'Portfolio', pricing: 68, company: 'Mixed operational pattern this cycle.' },
        { vendor: 'Risk', pricing: 74, company: 'Open flags are driving most volatility.' }
      ]).slice(0, 2).map((row, index) => ({
        title: `Report ${index + 1}: ${row.vendor} Review`,
        summary: `${row.vendor} is at ${row.pricing} for this period. ${row.company || 'Performance context captured from active workspace signal.'}`
      }));
      return `
        <div class="text-view">
          <div class="text-block">Vendor performance remains uneven across this period. The strongest performers are holding output quality, while weaker positions are driven by risk concentration and delivery slippage.</div>
          <div class="doc-list">
            ${docs.map(doc => `<article class="doc-card"><h5>${escapeHtml(doc.title)}</h5><p>${escapeHtml(doc.summary)}</p></article>`).join('')}
          </div>
        </div>
      `;
    }

    function renderBriefingView(response) {
      const briefing = response.briefing || { headline: '', tiles: [] };
      return `
        <div class="briefing-view">
          <div class="briefing-headline">${escapeHtml(briefing.headline || '')}</div>
          <div class="briefing-grid">
            ${briefing.tiles.map(tile => `
              <button class="briefing-tile" type="button" data-entity="${escapeHtml(tile.domain.toLowerCase())}">
                <div class="briefing-top">
                  <span class="status-dot ${escapeHtml(tile.status)}"></span>
                  <span class="status-label">${escapeHtml(tile.status)}</span>
                </div>
                <div class="briefing-domain">${escapeHtml(tile.domain)}</div>
                <div class="briefing-metric">${escapeHtml(tile.metric)}</div>
                <div class="briefing-note">${escapeHtml(tile.note)}</div>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    function renderInlineElementInsights(response) {
      return `
        <div class="inline-insights">
          <button class="selected-card" type="button" data-followup-source="${escapeHtml(response.followupSource || response.question)}">
            <div class="selected-title">${escapeHtml(response.title)}</div>
            <div class="metric-grid">
              ${(response.selected || []).map(([label, value]) => `<div class="metric-line">${escapeHtml(label)}<strong>${escapeHtml(value)}</strong></div>`).join('')}
            </div>
          </button>
          <div class="insights-stack">
            ${(response.cards || []).map(card => renderInsightCard(card)).join('')}
          </div>
        </div>
      `;
    }

    function renderFlowView() {
      return `
        <div class="flow-view ${state.selectedEntity ? 'selected-mode' : ''}">
          ${renderVizMount({ type: 'flow', selectedEntity: state.selectedEntity })}
          <div class="flow-node-list">
            <button class="flow-node ${state.selectedEntity === 'supplier-x' ? 'active' : ''}" type="button" data-flow-node="supplier-x">
              <div class="flow-orb blue"></div>
              <div class="flow-label">
                <div class="flow-title blue">Supplier X</div>
                <div class="flow-subtitle">Si +0.12%</div>
              </div>
            </button>
            <button class="flow-node ${state.selectedEntity === 'bf3-superheat' ? 'active' : ''}" type="button" data-flow-node="bf3-superheat">
              <div class="flow-orb cyan"></div>
              <div class="flow-label">
                <div class="flow-title cyan">BF-3 Superheat</div>
                <div class="flow-subtitle">22°C (target 34)</div>
              </div>
            </button>
            <button class="flow-node ${state.selectedEntity === 'ccm3-solidification' ? 'active' : ''}" type="button" data-flow-node="ccm3-solidification">
              <div class="flow-orb amber"></div>
              <div class="flow-label">
                <div class="flow-title amber">CCM-3 Solidification</div>
                <div class="flow-subtitle">Rate deviation</div>
              </div>
            </button>
            <button class="flow-node ${state.selectedEntity === 'grade-risk' ? 'active' : ''}" type="button" data-flow-node="grade-risk">
              <div class="flow-orb red"></div>
              <div class="flow-label">
                <div class="flow-title red">Grade Risk</div>
                <div class="flow-subtitle">Automotive 74%</div>
              </div>
            </button>
          </div>
        </div>
      `;
    }

    function renderFollowups(response) {
      if (!state.followupContext || state.followupContext.responseId !== response.id || !state.followupContext.prompts?.length) return '';
      return `
        <div class="followup-tray">
          <div class="followup-row">
            ${state.followupContext.prompts.map(prompt => `<button class="followup-chip" type="button" data-followup="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join('')}
          </div>
        </div>
      `;
    }

    function followupResponse(prompt) {
      const map = {
        'Which furnace is most exposed?': {
          id: makeId(),
          topic: 'furnace-exposure',
          title: 'Furnace Exposure Snapshot',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'BF-3 is carrying the main supplier quality burden while BF-5 remains within tolerance.',
          lenses: [],
          options: [...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          rows: [
            { id: 'bf3-superheat', vendor: 'BF-3', company: '22°C · out of spec', pricing: 78 },
            { id: 'bf5-superheat', vendor: 'BF-5', company: '33°C · within tolerance', pricing: 36 }
          ]
        },
        'Compare Supplier X with other silicon suppliers': {
          id: makeId(),
          topic: 'supplier-compare',
          title: 'Silicon Supplier Comparison',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Supplier X stands apart as the only source materially outside the normal silicon range.',
          lenses: [],
          options: [...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          rows: [
            { id: 'supplier-x', vendor: 'Supplier X', company: '+0.12% · high risk', pricing: 84 },
            { id: 'supplier-y', vendor: 'Supplier Y', company: '+0.01% · low risk', pricing: 18 },
            { id: 'supplier-z', vendor: 'Supplier Z', company: '−0.03% · negligible', pricing: 8 }
          ]
        },
        'Compare BF-3 with BF-5 superheat': {
          id: makeId(),
          topic: 'bf-compare',
          title: 'BF-3 vs BF-5 Superheat',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'The spread confirms BF-3 is the abnormal furnace, not the whole superheat system.',
          lenses: [],
          options: [...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          rows: [
            { id: 'bf3-superheat', vendor: 'BF-3', company: '22°C current', pricing: 22 },
            { id: 'bf5-superheat', vendor: 'BF-5', company: '33°C current', pricing: 33 }
          ]
        },
        'Show BF-3 impact on downstream CCMs': {
          id: makeId(),
          topic: 'bf-ccm-impact',
          title: 'Downstream CCM Exposure',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'CCM-3 is structurally more exposed because it receives most of BF-3 output.',
          lenses: [],
          options: [...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          rows: [
            { id: 'ccm3-solidification', vendor: 'CCM-3', company: '80% of BF-3 output', pricing: 80 },
            { id: 'ccm-1', vendor: 'CCM-1', company: '20% of BF-3 output', pricing: 20 }
          ]
        },
        'Which grades are most affected?': {
          id: makeId(),
          topic: 'grade-impact',
          title: 'Grade Exposure',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Automotive and High Tensile are taking the sharpest quality hit.',
          lenses: [],
          options: [...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          rows: [
            { id: 'grade-risk', vendor: 'Automotive', company: '74% pass rate', pricing: 74 },
            { id: 'high-tensile-risk', vendor: 'High Tensile', company: '81% pass rate', pricing: 81 },
            { id: 'structural-grade', vendor: 'Structural', company: '94% pass rate', pricing: 94 }
          ]
        },
        'Compare CCM-3 with CCM-1': {
          id: makeId(),
          topic: 'ccm-compare',
          title: 'CCM Comparison',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'CCM-1 is normal while CCM-3 is the only caster showing downstream quality breakdown.',
          lenses: [],
          options: [...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          rows: [
            { id: 'ccm3-solidification', vendor: 'CCM-3', company: '74% pass rate', pricing: 74 },
            { id: 'ccm-1', vendor: 'CCM-1', company: '93% pass rate', pricing: 93 }
          ]
        },
        'Quantify Automotive revenue risk': {
          id: makeId(),
          topic: 'revenue-risk',
          title: 'Automotive Revenue Risk',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'The combination of shortfall and premium-grade pricing is creating material revenue exposure.',
          lenses: [],
          options: [...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          rows: [
            { id: 'grade-risk', vendor: 'Shortfall value', company: '₹32.2 Cr at risk', pricing: 82 },
            { id: 'commitment-gap', vendor: 'Delivery gap', company: '~620 MT shortfall', pricing: 62 }
          ]
        },
        'Show commitment vs projected delivery': {
          id: makeId(),
          topic: 'delivery-gap',
          title: 'Commitment vs Projected Delivery',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Projected delivery is now materially below the committed quarter volume.',
          lenses: [],
          options: [...FULL_VIZ_OPTIONS],
          timeRanges: RANGE_OPTIONS,
          timeRange: '30D',
          rows: [
            { id: 'committed-volume', vendor: 'Committed', company: '2,400 MT', pricing: 100 },
            { id: 'projected-volume', vendor: 'Projected', company: '~1,780 MT', pricing: 74 }
          ]
        }
      };
      return map[prompt] || baseResponse(prompt);
    }

    function renderPrimaryVisual(response) {
      const scopedRows = rowsForRange(response.rows || [], response.timeRange || '30D');
      if (response.format === 'story') return renderHiddenCostStory(response);
      if (response.format === 'briefing') return renderBriefingView(response);
      if (response.format === 'insights') return renderInlineElementInsights(response);
      if (response.format === 'flow') return renderFlowView();
      if (response.format === 'line') return renderLineView(scopedRows);
      if (response.format === 'area') return renderAreaView(scopedRows);
      if (response.format === 'bar') return renderBarView(scopedRows);
      if (response.format === 'pie') return renderPieView(scopedRows, 'pie');
      if (response.format === 'donut') return renderPieView(scopedRows, 'donut');
      if (response.format === 'sankey') return renderSankeyView(scopedRows);
      if (response.format === 'text') return renderTextView(response);
      return renderTable(scopedRows);
    }

    function renderResponseCard(response) {
      const options = response.options || [
        { key: 'table', label: 'table', enabled: true },
        { key: 'bar', label: 'bar', enabled: true },
        { key: 'line', label: 'line', enabled: true },
        { key: 'text', label: 'text', enabled: true }
      ];
      const showSwitcher = response.format !== 'insights' && response.format !== 'story' && options.length > 1;
      const showRanges = response.format !== 'insights' && response.format !== 'story' && supportsTimeRange(response.format) && response.timeRanges?.length;
      const currentRows = rowsForRange(response.rows || [], response.timeRange || '30D');
      const showInsights = response.format !== 'table' && response.format !== 'insights' && response.format !== 'story';
      const insights = deriveInsights(response, currentRows);

      return `
        <article class="response-card" id="response-${response.id}" data-response-id="${response.id}">
          <div class="card-block card-header">
            <div class="question-echo">${escapeHtml(response.question)}</div>
            <div class="header-row">
              <div class="header-main">
                <div class="response-title">${escapeHtml(response.title)}</div>
                ${showSwitcher ? `<div class="type-switcher">
                  ${options.map(option => `<button class="type-pill ${response.format === option.key ? 'active' : ''}" type="button" data-switch="${option.key}" data-response-id="${response.id}">${option.label}</button>`).join('')}
                </div>` : ''}
              </div>
              ${showRanges ? `<div class="time-range-wrap"><span class="time-range-label">Time Range</span><div class="time-range-switch">
                ${response.timeRanges.map(range => `<button class="range-pill ${response.timeRange === range ? 'active' : ''}" type="button" data-range="${range}" data-response-id="${response.id}">${range}</button>`).join('')}
              </div></div>` : ''}
            </div>
          </div>
          <div class="card-block card-body">
            <div class="agent-insight">${escapeHtml(response.insight)}</div>
            ${renderPrimaryVisual(response)}
            ${showInsights ? `<ul class="key-insight-list">${insights.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
            <div class="response-footer">
              <div class="response-actions">
                <button class="icon-btn ${state.bookmarks.has(response.id) ? 'bookmarked' : ''}" type="button" data-bookmark="${response.id}" title="Bookmark">☆</button>
                <button class="icon-btn ${state.liked.has(response.id) ? 'active' : ''}" type="button" data-like="${response.id}" title="Like">👍</button>
                <button class="icon-btn" type="button" data-dislike="${response.id}" title="Dislike">👎</button>
                <button class="icon-btn" type="button" data-regenerate="${response.id}" title="Regenerate">↻</button>
              </div>
              <span class="response-time">${escapeHtml(formatResponseTime(response))}</span>
            </div>
          </div>
        </article>
      `;
    }

    function renderThread() {
      const responses = currentResponses();
      if (!responses.length) {
        thread.innerHTML = `
          <div class="thread-stack thread-stack-empty">
            <div class="thread-empty-note">Start with a prompt or select a suggested action to generate responses in this workspace.</div>
          </div>
        `;
        return;
      }
      thread.innerHTML = `<div class="thread-stack">${responses.map(response => `
        <div class="user-message">${escapeHtml(response.question)}</div>
        ${renderResponseCard(response)}
        ${renderFollowups(response)}
      `).join('')}
      ${state.feedbackForResponseId ? `
        <div class="agent-question">
          <div class="agent-question-label">Assistant</div>
          <div class="agent-question-copy">What was wrong with this response? Share your reason below and I will regenerate with your feedback.</div>
        </div>
      ` : ''}
      </div>`;
    }

    function renderHistory() {
      if (!historyList) return;
      const threadEntries = Object.entries(state.threads)
        .map(([id, responses]) => {
          const meta = ensureThreadMeta(id);
          const first = responses[0];
          const last = responses[responses.length - 1];
          return {
            id,
            title: first?.question || 'New Chat',
            preview: summarizeText(last?.insight || first?.insight || 'No responses yet.', 92),
            count: responses.length,
            updatedAt: meta.updatedAt
          };
        })
        .sort((a, b) => b.updatedAt - a.updatedAt);

      if (!threadEntries.length) {
        historyList.innerHTML = '';
        return;
      }

      historyList.innerHTML = threadEntries.map(item => `
        <button class="history-item ${item.id === state.currentThreadId ? 'active' : ''}" type="button" data-thread="${item.id}">
          <div class="history-title">${escapeHtml(item.title)}</div>
          <div class="history-meta">${escapeHtml(item.preview)}</div>
          <div class="history-meta">${escapeHtml(formatThreadTime(item.updatedAt))} · ${item.count} responses</div>
        </button>
      `).join('');
    }

    function renderComposerStarters() {
      composerStarters.innerHTML = state.mode === 'empty'
        ? ensureLandingChipsForThread(state.currentThreadId).map(chip => `<button class="starter-chip" type="button" data-starter="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`).join('')
        : '';
    }

    function followupsForSource(source) {
      if (followupMap[source]?.length) return followupMap[source];
      const title = source.replaceAll('-', ' ').replace(/\b\w/g, char => char.toUpperCase());
      return [
        `What changed most in ${title}?`,
        `Compare ${title} with the adjacent step`
      ];
    }

    function drilldownFor(vendorId) {
      return drilldowns[vendorId] || genericDrilldown(vendorId);
    }

    function appendElementInsightResponse(entityId, promptLabel) {
      const data = drilldownFor(entityId);
      const next = {
        id: makeId(),
        topic: entityId,
        title: data.title,
        question: promptLabel || `Selected: ${data.title}`,
        format: 'insights',
        formatLabel: 'Insights',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        insight: data.meta,
        selected: data.selected,
        cards: data.cards,
        followupSource: entityId,
        lenses: []
      };
      appendResponseToCurrentThread(next);
      showFollowups(next.id, entityId);
      renderAll();
      scheduleAnimationFrame(() => scrollToResponse(next.id, false));
    }

    function renderDrillPanel(vendorId) {
      const data = drilldownFor(vendorId);
      panelTitle.textContent = data.title;
      panelMeta.textContent = data.meta;
      panelBody.innerHTML = `
        <div>
          <div class="section-label">Insights</div>
          <div class="insights-stack">
            <button class="selected-card" type="button" data-followup-source="${escapeHtml(vendorId)}">
              <div class="selected-title">${escapeHtml(data.title)}</div>
              <div class="metric-grid">
                ${data.selected.map(([label, value]) => `<div class="metric-line">${escapeHtml(label)}<strong>${escapeHtml(value)}</strong></div>`).join('')}
              </div>
            </button>
            ${data.cards.map(card => renderInsightCard(card)).join('')}
          </div>
        </div>
      `;
    }

    function renderBookmarks() {
      const saved = currentResponses().filter(item => state.bookmarks.has(item.id));
      bookmarksList.innerHTML = saved.length ? saved.map(item => `
        <button class="saved-item" type="button" data-jump="${item.id}">
          <div class="saved-top">
            <span class="saved-badge">${escapeHtml(item.formatLabel)}</span>
          </div>
          <div class="saved-question">${escapeHtml(item.title)}</div>
          <div class="saved-meta">${escapeHtml(summarizeText(item.insight || item.question, 92))}</div>
          <div class="saved-meta">${escapeHtml(formatResponseTime(item))}</div>
        </button>
      `).join('') : `<div class="saved-item"><div class="saved-question">No bookmarked responses yet.</div><div class="saved-meta">Save a response from the thread to see it here.</div></div>`;
    }

    function renderArtifacts() {
      const generated = currentResponses().filter(item => item.format !== 'text');
      if (!generated.length) {
        artifactsList.innerHTML = `
          <div class="artifact-item">
            <div class="artifact-name">No artifacts generated yet.</div>
            <div class="artifact-meta">Generated outputs from this workspace will appear here once the thread produces them.</div>
          </div>
        `;
        return;
      }

      artifactsList.innerHTML = generated.map(item => `
        <button class="artifact-item" type="button" data-jump="${item.id}">
          <div class="artifact-top">
            <span class="artifact-badge">${escapeHtml(item.formatLabel)}</span>
          </div>
          <div class="artifact-name">${escapeHtml(item.title)}</div>
          <div class="artifact-meta">${escapeHtml(item.timestamp || '')}</div>
        </button>
      `).join('');
    }

    function renderTrendChart(points = []) {
      return `
        <div class="trend-chart viz-view">
          ${renderVizMount({ type: 'trend', points })}
        </div>
      `;
    }

    function renderInsightCard(card) {
      const conciseNotes = {
        'Silicon deviation trend — last 30 days': '4-week upward drift. This looks like source-batch instability, not a one-off spike.',
        'Which furnaces are receiving this material': 'Most of the deviated silicon is flowing to BF-3, so that is where the impact concentrates.',
        'Supplier X vs other silicon suppliers': 'Supplier X is the only out-of-spec silicon source this month.',
        'NCE history for Supplier X': 'NCE rose from zero to ₹1.8 Cr as deviation crossed 0.08%.',
        'Superheat reading over last 7 days': 'Seven straight days down. The decline lines up with the supplier deviation increase.',
        'BF-3 vs BF-5 superheat comparison': 'BF-3 is off target while BF-5 stays near normal, pointing to a localized upstream issue.',
        'Impact on downstream CCM assignment': 'CCM-3 takes most of BF-3 output, so it is carrying the main downstream exposure.',
        'Historical frequency of BF-3 going below 28°C': 'June is already the worst compliance month on record for BF-3.',
        'Solidification rate deviation over time': 'CCM-3 dropped out of band two days after BF-3 slipped, matching the expected process lag.',
        'Grade output impact this month': 'Premium grades are taking the hardest hit, which raises both quality and margin risk.',
        'CCM-3 vs CCM-1 comparison': 'CCM-1 is stable, so the issue reads as input-driven rather than machine-driven.',
        'Automotive grade pass rate — last 6 months': 'Automotive compliance stayed steady until June, then broke sharply.',
        'Customer commitment vs projected delivery': 'At the current run rate, the quarter finishes short unless the chain is corrected quickly.',
        'Revenue at risk': 'The shortfall is now large enough to create material revenue exposure.'
      };
      let body = '';
      if (card.type === 'line') {
        body = card.points ? renderTrendChart(card.points) : `<div class="mini-chart viz-placeholder"></div>`;
      } else if (card.type === 'bars') {
        body = renderVizMount({ type: 'mini-bars', rows: card.rows }, 'd3-mount d3-mount-mini');
      } else if (card.type === 'flags') {
        body = `
          <div class="mini-flags">
            ${card.flags.map(([label, contract, severity, date]) => `
              <div class="flag-row">
                <span class="flag-dot" style="background:${severity === 'High' ? 'var(--red)' : severity === 'Medium' ? 'var(--yellow)' : 'var(--teal)'}"></span>
                <span>${escapeHtml(label)}<br><span class="mini-note">${escapeHtml(contract)}</span></span>
                <span>${escapeHtml(date)}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else if (card.type === 'compare') {
        body = `
          <div class="mini-compare">
            ${card.compare.map(([name, bid, nce, percent]) => `
              <div class="compare-row">
                <span>${escapeHtml(name)}</span>
                <span>${escapeHtml(bid)}</span>
                <span>${escapeHtml(nce)}</span>
                <span>${escapeHtml(percent)}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else if (card.type === 'stats') {
        body = `
          <div class="mini-stats">
            ${card.stats.map(([label, value]) => `
              <div class="stat-row">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(value)}</strong>
              </div>
            `).join('')}
          </div>
        `;
      }

      return `
        <button class="insight-card" type="button" data-followup-source="${escapeHtml(card.followupSource || card.title)}">
          <h4>${escapeHtml(card.title)}</h4>
          ${body}
          ${(card.note || conciseNotes[card.title]) ? `<div class="insight-takeaway"><strong>Takeaway</strong>${escapeHtml(conciseNotes[card.title] || card.note)}</div>` : ''}
        </button>
      `;
    }

    function visibleResponseIndex() {
      const cards = [...thread.querySelectorAll('.response-card')];
      if (!cards.length) return 0;
      const canvasRect = canvas.getBoundingClientRect();
      const center = canvasRect.top + canvasRect.height / 2;
      let best = 0;
      let bestDistance = Infinity;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs((rect.top + rect.height / 2) - center);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      return best;
    }

    function renderTimeline() {
      const responses = currentResponses();
      const visible = state.mode === 'thread' && responses.length >= 2;
      timelineRail.classList.toggle('visible', visible);
      if (!visible) {
        timelineSegments.innerHTML = '';
        return;
      }
      const active = visibleResponseIndex();
      timelineSegments.innerHTML = responses.map((response, index) => `
        <button
          class="timeline-segment ${index === active ? 'active' : ''} ${state.bookmarks.has(response.id) ? 'bookmarked' : ''}"
          type="button"
          data-index="${index}"
          title="${state.bookmarks.has(response.id) ? 'Bookmarked response' : 'Response'}"
        ></button>
      `).join('');
      scrollUpButton.disabled = active <= 0;
      scrollDownButton.disabled = active >= responses.length - 1;
    }

    function openWorkspaceWithResponse(response) {
      state.mode = 'thread';
      state.centeredInput = false;
      setThreadResponses(state.currentThreadId, [response]);
      resetPanels();
      composerInput.value = '';
      composerInput.placeholder = CHAT_PLACEHOLDER;
    }

    function renderVisibility() {
      app.classList.toggle('landing-mode', state.mode === 'landing');
      app.classList.toggle('history-open', state.historyOpen && state.mode !== 'landing');
      landing.style.display = state.mode === 'landing' ? 'grid' : 'none';
      landing.classList.remove('exiting');
      landingFloater.style.display = state.mode === 'landing' ? 'block' : 'none';
      workspaceTools.style.display = 'flex';
      thread.classList.toggle('active', state.mode === 'thread');
      emptyThread.classList.toggle('active', state.mode === 'empty');
      inputZone.classList.toggle('centered', state.centeredInput);
      profileMenu.hidden = !state.profileMenuOpen;
      if (historyButtonEl) historyButtonEl.classList.toggle('active', state.activePanel === 'history');
      if (bookmarksButtonEl) bookmarksButtonEl.classList.toggle('active', state.activePanel === 'bookmarks');
    }

    function renderPanels() {
      const drillOpen = state.mode !== 'landing' && state.activePanel === 'drill';
      const bookmarksOpen = state.mode !== 'landing' && state.activePanel === 'bookmarks';
      const historyOpen = state.mode !== 'landing' && state.activePanel === 'history';
      const artifactsOpen = state.mode !== 'landing' && state.activePanel === 'artifacts';
      panel.classList.toggle('open', drillOpen);
      if (bookmarksSheet) bookmarksSheet.classList.toggle('open', bookmarksOpen);
      if (historySheet) historySheet.classList.toggle('open', historyOpen);
      if (artifactsSheet) artifactsSheet.classList.toggle('open', artifactsOpen);
      workspaceMain.classList.toggle('with-panel', drillOpen);
      workspaceMain.classList.toggle('with-sheet', bookmarksOpen || historyOpen || artifactsOpen);
      inputZone.classList.toggle('with-panel', drillOpen);
      inputZone.classList.toggle('with-sheet', bookmarksOpen || historyOpen || artifactsOpen);
      canvas.classList.remove('dimmed');
    }

    function renderAll() {
      renderLanding();
      renderEmptyThread();
      renderThread();
      renderHistory();
      renderComposerStarters();
      renderBookmarks();
      renderArtifacts();
      renderVisibility();
      renderPanels();
      renderTimeline();
      hydrateVisualizationMounts();
    }

    function switchFormat(responseId, nextFormat) {
      const response = currentResponses().find(item => item.id === responseId);
      if (!response) return;
      response.format = nextFormat;
      response.formatLabel = formatLabelFor(nextFormat);
      state.exportOpenFor = null;
      renderAll();
    }

    function addLens(responseId, lens) {
      const next = baseResponse(lens);
      appendResponseToCurrentThread(next);
      renderAll();
      scheduleAnimationFrame(() => scrollToResponse(next.id));
    }

    function toggleBookmark(responseId) {
      if (state.bookmarks.has(responseId)) state.bookmarks.delete(responseId);
      else state.bookmarks.add(responseId);
      renderAll();
    }

    function showFollowups(responseId, source) {
      const prompts = followupsForSource(source);
      state.followupContext = prompts.length ? { responseId, prompts, source } : null;
      renderAll();
    }

    function scrollToResponse(responseId, withHighlight = true) {
      const target = document.getElementById(`response-${responseId}`);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (!withHighlight) return;
      target.classList.add('highlight');
      scheduleTimeout(() => target.classList.remove('highlight'), 500);
    }

    starterButton.addEventListener('click', () => {
      state.mode = 'empty';
      state.centeredInput = true;
      resetPanels();
      composerInput.value = '';
      composerInput.placeholder = CHAT_PLACEHOLDER;
      renderAll();
      scheduleTimeout(() => composerInput.focus(), 200);
    }, { signal: controller.signal });

    historyButton.addEventListener('click', () => {
      if (state.mode === 'landing') return;
      state.activePanel = state.activePanel === 'history' ? null : 'history';
      renderAll();
    }, { signal: controller.signal });

    newThreadButton.addEventListener('click', () => {
      startNewChatAtLanding();
    }, { signal: controller.signal });

    bookmarksButton.addEventListener('click', () => {
      if (state.mode === 'landing') return;
      state.activePanel = state.activePanel === 'bookmarks' ? null : 'bookmarks';
      renderAll();
    }, { signal: controller.signal });

    profileButton.addEventListener('click', () => {
      state.profileMenuOpen = !state.profileMenuOpen;
      renderAll();
    }, { signal: controller.signal });

    composer.addEventListener('submit', event => {
      event.preventDefault();
      const value = composerInput.value.trim();
      if (!value) return;
      if (state.feedbackForResponseId) {
        const next = {
          id: makeId(),
          topic: 'feedback',
          title: 'Feedback Captured',
          question: value,
          format: 'text',
          formatLabel: 'Text',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Thanks, we captured your feedback and will use it to improve subsequent answers.',
          lenses: [],
          options: [{ key: 'text', label: 'text', enabled: true }],
          rows: []
        };
        appendResponseToCurrentThread(next);
        state.feedbackForResponseId = null;
        composerInput.value = '';
        composerInput.placeholder = CHAT_PLACEHOLDER;
        renderAll();
        scheduleAnimationFrame(() => scrollToResponse(next.id));
        return;
      }
      if (state.mode !== 'thread') {
        state.mode = 'thread';
        state.centeredInput = false;
      }
      const next = baseResponse(value);
      appendResponseToCurrentThread(next);
      composerInput.value = '';
      composerInput.placeholder = CHAT_PLACEHOLDER;
      renderAll();
      scheduleAnimationFrame(() => scrollToResponse(next.id));
    }, { signal: controller.signal });

    canvas.addEventListener('scroll', () => {
      renderTimeline();
      if (state.historyOpen) {
        state.historyOpen = false;
        renderAll();
      }
    }, { signal: controller.signal });

    document.addEventListener('click', event => {
      const clickTarget = event.target as HTMLElement | null;
      if (!clickTarget) return;

      const storyActBtn = clickTarget.closest('[data-story-act]') as HTMLElement | null;
      if (storyActBtn) {
        const nextIndex = Number(storyActBtn.dataset.storyAct);
        const response = currentResponses().find(item => item.id === storyActBtn.dataset.responseId);
        if (response && !Number.isNaN(nextIndex) && nextIndex >= 0 && nextIndex < storyActs.length) {
          response.storyDirection = nextIndex >= (response.storyActIndex || 0) ? 'next' : 'prev';
          response.storyActIndex = nextIndex;
          renderAll();
        }
        return;
      }

      const storyNavBtn = clickTarget.closest('[data-story-nav]') as HTMLElement | null;
      if (storyNavBtn) {
        const response = currentResponses().find(item => item.id === storyNavBtn.dataset.responseId);
        if (!response) return;
        const delta = storyNavBtn.dataset.storyNav === 'next' ? 1 : -1;
        const currentIndex = response.storyActIndex || 0;
        const nextIndex = Math.max(0, Math.min(storyActs.length - 1, currentIndex + delta));
        if (nextIndex !== currentIndex) {
          response.storyDirection = delta > 0 ? 'next' : 'prev';
          response.storyActIndex = nextIndex;
          renderAll();
        }
        return;
      }

      const storyCategoryBtn = clickTarget.closest('[data-story-category]') as HTMLElement | null;
      if (storyCategoryBtn) {
        const response = currentResponses().find(item => item.id === storyCategoryBtn.dataset.responseId);
        if (response) {
          response.storyCategoryKey = storyCategoryBtn.dataset.storyCategory;
          renderAll();
        }
        return;
      }

      const signOutBtn = clickTarget.closest('[data-sign-out]') as HTMLElement | null;
      if (signOutBtn) {
        state.profileMenuOpen = false;
        state.mode = 'landing';
        state.centeredInput = false;
        state.historyOpen = false;
        resetPanels();
        composerInput.value = '';
        composerInput.placeholder = CHAT_PLACEHOLDER;
        renderAll();
        canvas.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const startEmptyTrigger = clickTarget.closest('[data-start-empty]') as HTMLElement | null;
      if (startEmptyTrigger) {
        state.mode = 'empty';
        state.centeredInput = true;
        state.historyOpen = false;
        resetPanels();
        composerInput.value = '';
        composerInput.placeholder = CHAT_PLACEHOLDER;
        renderAll();
        scheduleTimeout(() => composerInput.focus(), 180);
        return;
      }

      const topicCard = clickTarget.closest('[data-topic]') as HTMLElement | null;
      if (topicCard) {
        const card = landingCards.find(item => item.key === topicCard.dataset.topic);
        if (!card) return;
        state.reviewed.add(card.key);
        topicCard.classList.add('selected');
        landing.classList.add('exiting');
        scheduleTimeout(() => {
          openWorkspaceWithResponse(baseResponse(card.title));
          renderAll();
          canvas.scrollTo({ top: 0, behavior: 'smooth' });
        }, 180);
        return;
      }

      const starterBtn = clickTarget.closest('[data-starter]') as HTMLElement | null;
      if (starterBtn) {
        const starter = starterBtn.dataset.starter;
        if (!starter) return;
        const next = baseResponse(starter);
        state.mode = 'thread';
        state.centeredInput = false;
        setThreadResponses(state.currentThreadId, [next]);
        resetPanels();
        composerInput.value = '';
        composerInput.placeholder = CHAT_PLACEHOLDER;
        renderAll();
        canvas.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const closeBtn = clickTarget.closest('[data-close]') as HTMLElement | null;
      if (closeBtn) {
        if (closeBtn.dataset.close === 'bookmarks' || closeBtn.dataset.close === 'artifacts' || closeBtn.dataset.close === 'history' || closeBtn.dataset.close === 'panel') {
          state.activePanel = null;
          if (closeBtn.dataset.close === 'panel') {
            state.selectedEntity = null;
            state.panelResponseId = null;
          }
        }
        renderAll();
        return;
      }

      const switchBtn = clickTarget.closest('[data-switch]') as HTMLElement | null;
      if (switchBtn) {
        switchFormat(switchBtn.dataset.responseId, switchBtn.dataset.switch);
        return;
      }

      const rangeBtn = clickTarget.closest('[data-range]') as HTMLElement | null;
      if (rangeBtn) {
        const response = currentResponses().find(item => item.id === rangeBtn.dataset.responseId);
        if (!response) return;
        response.timeRange = rangeBtn.dataset.range;
        renderAll();
        return;
      }

      const lensBtn = clickTarget.closest('[data-lens]') as HTMLElement | null;
      if (lensBtn) {
        addLens(lensBtn.dataset.responseId, lensBtn.dataset.lens);
        return;
      }

      const followupSourceBtn = clickTarget.closest('[data-followup-source]') as HTMLElement | null;
      if (followupSourceBtn) {
        const responseCard = followupSourceBtn.closest('.response-card') as HTMLElement | null;
        const responseId = responseCard?.dataset.responseId;
        if (responseId) {
          showFollowups(responseId, followupSourceBtn.dataset.followupSource);
        }
        return;
      }

      const flowNode = clickTarget.closest('[data-flow-node]') as HTMLElement | null;
      if (flowNode?.dataset.flowNode) {
        appendElementInsightResponse(flowNode.dataset.flowNode, flowNode.dataset.flowNode.replaceAll('-', ' '));
        return;
      }

      const vendorRow = clickTarget.closest('[data-vendor]') as HTMLElement | null;
      if (vendorRow?.dataset.vendor) {
        appendElementInsightResponse(vendorRow.dataset.vendor, vendorRow.dataset.vendor.replaceAll('-', ' '));
        return;
      }

      const entityBtn = clickTarget.closest('[data-entity]') as HTMLElement | null;
      if (entityBtn?.dataset.entity) {
        appendElementInsightResponse(entityBtn.dataset.entity, entityBtn.dataset.entity.replaceAll('-', ' '));
        return;
      }

      const followupBtn = clickTarget.closest('[data-followup]') as HTMLElement | null;
      if (followupBtn) {
        const next = followupResponse(followupBtn.dataset.followup);
        state.activePanel = null;
        state.selectedEntity = null;
        state.panelResponseId = null;
        state.followupContext = null;
        appendResponseToCurrentThread(next);
        composerInput.value = '';
        composerInput.placeholder = CHAT_PLACEHOLDER;
        renderAll();
        scheduleAnimationFrame(() => scrollToResponse(next.id));
        return;
      }

      const bookmarkBtn = clickTarget.closest('[data-bookmark]') as HTMLElement | null;
      if (bookmarkBtn) {
        toggleBookmark(bookmarkBtn.dataset.bookmark);
        return;
      }

      const likeBtn = clickTarget.closest('[data-like]') as HTMLElement | null;
      if (likeBtn) {
        const id = likeBtn.dataset.like;
        if (state.liked.has(id)) state.liked.delete(id);
        else state.liked.add(id);
        renderAll();
        return;
      }

      const dislikeBtn = clickTarget.closest('[data-dislike]') as HTMLElement | null;
      if (dislikeBtn) {
        state.feedbackForResponseId = dislikeBtn.dataset.dislike;
        composerInput.value = '';
        composerInput.placeholder = CHAT_PLACEHOLDER;
        renderAll();
        scheduleTimeout(() => composerInput.focus(), 100);
        return;
      }

      const regenerateBtn = clickTarget.closest('[data-regenerate]') as HTMLElement | null;
      if (regenerateBtn) {
        const target = currentResponses().find(item => item.id === regenerateBtn.dataset.regenerate);
        if (!target) return;
        const replacement = baseResponse(target.question);
        replacement.id = target.id;
        const list = currentResponses();
        const index = list.findIndex(item => item.id === target.id);
        if (index >= 0) list[index] = replacement;
        touchThread();
        renderAll();
        return;
      }

      const jumpBtn = clickTarget.closest('[data-jump]') as HTMLElement | null;
      if (jumpBtn) {
        scheduleTimeout(() => scrollToResponse(jumpBtn.dataset.jump), 120);
        return;
      }

      const historyBtn = clickTarget.closest('[data-thread]') as HTMLElement | null;
      if (historyBtn) {
        state.currentThreadId = historyBtn.dataset.thread;
        if (!state.threads[state.currentThreadId]) state.threads[state.currentThreadId] = [];
        ensureThreadMeta(state.currentThreadId);
        state.mode = 'thread';
        state.centeredInput = false;
        state.historyOpen = false;
        state.activePanel = 'history';
        renderAll();
        return;
      }

      const timelineBtn = clickTarget.closest('[data-index]') as HTMLElement | null;
      if (timelineBtn) {
        const target = currentResponses()[Number(timelineBtn.dataset.index)];
        if (target) scrollToResponse(target.id);
      }

      if (state.profileMenuOpen && !clickTarget.closest('.profile-wrap')) {
        state.profileMenuOpen = false;
        renderAll();
      }
    }, { signal: controller.signal });

    timelineSegments.addEventListener('mouseover', event => {
      const hoverTarget = event.target as HTMLElement | null;
      const segment = hoverTarget?.closest('[data-index]') as HTMLElement | null;
      if (!segment) return;
      const response = currentResponses()[Number(segment.dataset.index)];
      if (!response) return;
      timelineTooltip.innerHTML = `${escapeHtml(response.question)}<br>${escapeHtml(response.formatLabel)} · ${escapeHtml(response.timestamp)}`;
      timelineTooltip.style.top = `${segment.offsetTop + 12}px`;
      timelineTooltip.classList.add('visible');
    }, { signal: controller.signal });

    timelineSegments.addEventListener('mouseout', event => {
      const hoverTarget = event.target as HTMLElement | null;
      if (hoverTarget?.closest('[data-index]')) timelineTooltip.classList.remove('visible');
    }, { signal: controller.signal });

    scrollUpButton.addEventListener('click', () => {
      const responses = currentResponses();
      const active = visibleResponseIndex();
      if (active > 0) scrollToResponse(responses[active - 1].id);
    }, { signal: controller.signal });

    scrollDownButton.addEventListener('click', () => {
      const responses = currentResponses();
      const active = visibleResponseIndex();
      if (active < responses.length - 1) scrollToResponse(responses[active + 1].id);
    }, { signal: controller.signal });

    window.addEventListener('resize', renderTimeline, { signal: controller.signal });

    renderAll();

    return () => {
      controller.abort();
      timeoutIds.forEach(timeoutId => window.clearTimeout(timeoutId));
      animationFrameIds.forEach(animationFrameId => window.cancelAnimationFrame(animationFrameId));
      timeoutIds.clear();
      animationFrameIds.clear();
      window.__reactiveWorkspaceInitialized = false;
    };
}
