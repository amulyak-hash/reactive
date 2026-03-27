export function initWorkspace() {
  if (window.__reactiveWorkspaceInitialized) return;
  window.__reactiveWorkspaceInitialized = true;

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

    const historyThreads = [
      { id: 'current', title: 'Vendor Leaderboard', date: 'Mar 27', count: 0 }
    ];

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

    const app = document.getElementById('app');
    const canvas = document.getElementById('canvas');
    const landing = document.getElementById('landing');
    const landingFloater = document.getElementById('landingFloater');
    const workspaceTools = document.getElementById('workspaceTools');
    const workspaceMain = document.getElementById('workspaceMain');
    const thread = document.getElementById('thread');
    const emptyThread = document.getElementById('emptyThread');
    const inputZone = document.getElementById('inputZone');
    const composer = document.getElementById('composer');
    const composerInput = document.getElementById('composerInput');
    const composerStarters = document.getElementById('composerStarters');
    const timelineRail = document.getElementById('timelineRail');
    const timelineSegments = document.getElementById('timelineSegments');
    const timelineTooltip = document.getElementById('timelineTooltip');
    const historyList = document.getElementById('historyList');
    const historyDivider = document.getElementById('historyDivider');
    const panel = document.getElementById('drillPanel');
    const panelTitle = document.getElementById('panelTitle');
    const panelMeta = document.getElementById('panelMeta');
    const panelBody = document.getElementById('panelBody');
    const bookmarksSheet = document.getElementById('bookmarksSheet');
    const artifactsSheet = document.getElementById('artifactsSheet');
    const bookmarksList = document.getElementById('bookmarksList');
    const artifactsList = document.getElementById('artifactsList');
    const toggleHistoryIcon = document.getElementById('toggleHistoryIcon');
    const toggleHistoryLabel = document.getElementById('toggleHistoryLabel');

    const state = {
      mode: 'landing',
      currentThreadId: 'current',
      centeredInput: false,
      threads: { current: [] },
      historyOpen: false,
      landingProfileOpen: false,
      landingChipCursor: 1,
      landingChipsByThread: { current: [...chipPresets[0]] },
      activePanel: null,
      selectedEntity: null,
      panelResponseId: null,
      followupContext: null,
      exportOpenFor: null,
      bookmarks: new Set(),
      reviewed: new Set()
    };

    function currentResponses() {
      return state.threads[state.currentThreadId] || [];
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
      ensureLandingChipsForThread(nextThreadId);
      state.mode = 'landing';
      state.centeredInput = false;
      state.historyOpen = false;
      state.landingProfileOpen = false;
      resetPanels();
      composerInput.value = '';
      composerInput.placeholder = 'ask a follow-up...';
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
      if (question.toLowerCase() === 'supplier quality flow') {
        return {
          id: crypto.randomUUID(),
          topic: 'supplier-quality-flow',
          title: 'Supplier Quality Flow',
          question,
          format: 'flow',
          formatLabel: 'Flow',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Material quality is drifting at Supplier X, and the deviation is propagating downstream through BF-3 into CCM-3 before surfacing as Automotive grade risk.',
          lenses: [],
          options: [{ key: 'flow', label: 'flow', enabled: true }]
        };
      }
      if (question === 'Bid Evaluation summary' || question === 'contract spend tracking') {
        return {
          id: crypto.randomUUID(),
          topic: question.toLowerCase().replaceAll(' ', '-'),
          title: question,
          question,
          format: 'text',
          formatLabel: 'Text',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Starter context selected. This thread is ready for the next configured visualization.',
          lenses: [],
          options: [{ key: 'text', label: 'text', enabled: true }],
          rows: []
        };
      }
      return {
        id: crypto.randomUUID(),
        topic: 'vendor-leaderboard',
        title: 'Vendor Leaderboard',
        question,
        format: 'table',
        formatLabel: 'Table',
        insight: insightForLens(question),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lenses: ['NCE impact on rank', 'Filter by contract value', 'Compare by region', 'Timeline risk only'],
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

    function renderLanding() {
      landing.innerHTML = `
        <div class="landing-shell">
          <section class="landing-hero">
            <div class="landing-topbar">
              <div class="landing-topbar-right">
                <button class="landing-topbar-btn" type="button" data-landing-action="new-chat">+ New Chat</button>
                <button class="landing-topbar-btn" type="button" data-landing-action="history">⧗ History</button>
                <button class="landing-topbar-btn" type="button" data-landing-action="bookmarks">⊞ Bookmarks</button>
                <div class="landing-profile-wrap">
                  <button class="landing-topbar-btn landing-profile-btn" type="button" data-landing-profile aria-label="Profile">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="8" r="4"></circle>
                      <path d="M4 20c0-4.2 3.6-7 8-7s8 2.8 8 7"></path>
                    </svg>
                  </button>
                  <div class="landing-profile-menu" ${state.landingProfileOpen ? '' : 'hidden'}>
                    <button type="button" data-landing-signout>Sign out</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="landing-waves" aria-hidden="true"></div>

            <div class="landing-orb-zone">
              <div class="landing-brand">
                <div class="landing-brand-text"><span>Enterprise</span><strong>Brain</strong></div>
              </div>

              <div class="landing-head">
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

      const landingPromptForm = document.getElementById('landingPromptForm');
      const landingPromptInput = document.getElementById('landingPromptInput');
      if (landingPromptForm && landingPromptInput) {
        landingPromptForm.addEventListener('submit', event => {
          event.preventDefault();
          const value = landingPromptInput.value.trim();
          if (!value) {
            state.mode = 'empty';
            state.centeredInput = true;
            resetPanels();
            composerInput.value = '';
            composerInput.placeholder = 'What would you like to explore?';
            renderAll();
            setTimeout(() => composerInput.focus(), 180);
            return;
          }

          const next = baseResponse(value);
          state.mode = 'thread';
          state.centeredInput = false;
          state.threads[state.currentThreadId] = [next];
          resetPanels();
          composerInput.value = value;
          composerInput.placeholder = 'ask a follow-up...';
          renderAll();
          canvas.scrollTo({ top: 0, behavior: 'smooth' });
        });
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
      const points = rows.map((row, index) => `${80 + index * 130},${210 - row.pricing * 1.5}`).join(' ');
      return `
        <div class="line-view">
          <svg class="line-svg" viewBox="0 0 760 250" aria-hidden="true">
            <path class="line-track" d="M80 210 L680 210"></path>
            <polyline class="line-path" points="${points}"></polyline>
            ${rows.map((row, index) => `<circle cx="${80 + index * 130}" cy="${210 - row.pricing * 1.5}" r="8" fill="#cdaa58"></circle>`).join('')}
          </svg>
        </div>
      `;
    }

    function renderBarView(rows) {
      return `
        <div class="bar-view">
          <div class="bar-view-grid">
            ${rows.map((row, index) => `
              <button class="bar-col" type="button" data-entity="${row.id}">
                <div class="bar-visual" style="height:${Math.max(row.pricing * 2, 70)}px; animation-delay:${index * 60}ms"></div>
                <div class="bar-value">${row.pricing}</div>
                <div class="bar-label">${escapeHtml(row.vendor)}</div>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    function renderTextView() {
      return `
        <div class="text-view">
          <div>Vendor A is leading on overall rank, but the current mix is uneven. Pricing and headline position look strong, while NCE exposure and contract-level slippage create the main tension in the leaderboard.</div>
          <div>Vendor B and Vendor D look more operationally stable. Vendor E is currently the weakest on pricing and still carries a high-risk label, making it the least resilient position in the current set.</div>
        </div>
      `;
    }

    function renderFlowView() {
      return `
        <div class="flow-view ${state.selectedEntity ? 'selected-mode' : ''}">
          <svg class="flow-canvas" viewBox="0 0 1200 380" aria-hidden="true" preserveAspectRatio="none">
            <path class="flow-track" d="M130 246 C248 146, 320 122, 436 134"></path>
            <path class="flow-track" d="M436 134 C592 150, 666 224, 748 266"></path>
            <path class="flow-track" d="M748 266 C858 190, 960 158, 1068 132"></path>
            <path class="flow-line-blue" d="M130 246 C248 146, 320 122, 436 134"></path>
            <path class="flow-line-cyan" d="M436 134 C592 150, 666 224, 748 266"></path>
            <path class="flow-line-amber" d="M748 266 C858 190, 960 158, 1068 132"></path>
            <path class="flow-line-red" d="M748 266 C858 190, 960 158, 1068 132" style="opacity:.55"></path>
            <circle r="2.6" fill="#4cb0ff"><animateMotion dur="3.2s" repeatCount="indefinite" path="M130 246 C248 146, 320 122, 436 134"></animateMotion></circle>
            <circle r="2.2" fill="#4cb0ff" opacity=".82"><animateMotion dur="3.8s" begin="-1.1s" repeatCount="indefinite" path="M130 246 C248 146, 320 122, 436 134"></animateMotion></circle>
            <circle r="2.8" fill="#4cb0ff" opacity=".62"><animateMotion dur="4.1s" begin="-2.4s" repeatCount="indefinite" path="M130 246 C248 146, 320 122, 436 134"></animateMotion></circle>
            <circle r="2.3" fill="#4cb0ff" opacity=".58"><animateMotion dur="3.5s" begin="-0.7s" repeatCount="indefinite" path="M130 246 C248 146, 320 122, 436 134"></animateMotion></circle>
            <circle r="2.6" fill="#67efff"><animateMotion dur="3.4s" repeatCount="indefinite" path="M436 134 C592 150, 666 224, 748 266"></animateMotion></circle>
            <circle r="2.2" fill="#67efff" opacity=".76"><animateMotion dur="4s" begin="-1.4s" repeatCount="indefinite" path="M436 134 C592 150, 666 224, 748 266"></animateMotion></circle>
            <circle r="2.8" fill="#67efff" opacity=".60"><animateMotion dur="4.4s" begin="-2.8s" repeatCount="indefinite" path="M436 134 C592 150, 666 224, 748 266"></animateMotion></circle>
            <circle r="2.1" fill="#67efff" opacity=".52"><animateMotion dur="3.1s" begin="-0.9s" repeatCount="indefinite" path="M436 134 C592 150, 666 224, 748 266"></animateMotion></circle>
            <circle r="2.6" fill="#ff9c58"><animateMotion dur="3.0s" repeatCount="indefinite" path="M748 266 C858 190, 960 158, 1068 132"></animateMotion></circle>
            <circle r="2.4" fill="#ff9c58" opacity=".78"><animateMotion dur="3.7s" begin="-1.2s" repeatCount="indefinite" path="M748 266 C858 190, 960 158, 1068 132"></animateMotion></circle>
            <circle r="2.7" fill="#ff7474" opacity=".68"><animateMotion dur="4.0s" begin="-2.2s" repeatCount="indefinite" path="M748 266 C858 190, 960 158, 1068 132"></animateMotion></circle>
            <circle r="2.1" fill="#ff7474" opacity=".54"><animateMotion dur="3.3s" begin="-0.5s" repeatCount="indefinite" path="M748 266 C858 190, 960 158, 1068 132"></animateMotion></circle>
          </svg>
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
          id: crypto.randomUUID(),
          topic: 'furnace-exposure',
          title: 'Furnace Exposure Snapshot',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'BF-3 is carrying the main supplier quality burden while BF-5 remains within tolerance.',
          lenses: [],
          options: [{ key: 'bar', label: 'bar', enabled: true }],
          rows: [
            { id: 'bf3-superheat', vendor: 'BF-3', company: '22°C · out of spec', pricing: 78 },
            { id: 'bf5-superheat', vendor: 'BF-5', company: '33°C · within tolerance', pricing: 36 }
          ]
        },
        'Compare Supplier X with other silicon suppliers': {
          id: crypto.randomUUID(),
          topic: 'supplier-compare',
          title: 'Silicon Supplier Comparison',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Supplier X stands apart as the only source materially outside the normal silicon range.',
          lenses: [],
          options: [{ key: 'bar', label: 'bar', enabled: true }],
          rows: [
            { id: 'supplier-x', vendor: 'Supplier X', company: '+0.12% · high risk', pricing: 84 },
            { id: 'supplier-y', vendor: 'Supplier Y', company: '+0.01% · low risk', pricing: 18 },
            { id: 'supplier-z', vendor: 'Supplier Z', company: '−0.03% · negligible', pricing: 8 }
          ]
        },
        'Compare BF-3 with BF-5 superheat': {
          id: crypto.randomUUID(),
          topic: 'bf-compare',
          title: 'BF-3 vs BF-5 Superheat',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'The spread confirms BF-3 is the abnormal furnace, not the whole superheat system.',
          lenses: [],
          options: [{ key: 'bar', label: 'bar', enabled: true }],
          rows: [
            { id: 'bf3-superheat', vendor: 'BF-3', company: '22°C current', pricing: 22 },
            { id: 'bf5-superheat', vendor: 'BF-5', company: '33°C current', pricing: 33 }
          ]
        },
        'Show BF-3 impact on downstream CCMs': {
          id: crypto.randomUUID(),
          topic: 'bf-ccm-impact',
          title: 'Downstream CCM Exposure',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'CCM-3 is structurally more exposed because it receives most of BF-3 output.',
          lenses: [],
          options: [{ key: 'bar', label: 'bar', enabled: true }],
          rows: [
            { id: 'ccm3-solidification', vendor: 'CCM-3', company: '80% of BF-3 output', pricing: 80 },
            { id: 'ccm-1', vendor: 'CCM-1', company: '20% of BF-3 output', pricing: 20 }
          ]
        },
        'Which grades are most affected?': {
          id: crypto.randomUUID(),
          topic: 'grade-impact',
          title: 'Grade Exposure',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Automotive and High Tensile are taking the sharpest quality hit.',
          lenses: [],
          options: [{ key: 'bar', label: 'bar', enabled: true }],
          rows: [
            { id: 'grade-risk', vendor: 'Automotive', company: '74% pass rate', pricing: 74 },
            { id: 'high-tensile-risk', vendor: 'High Tensile', company: '81% pass rate', pricing: 81 },
            { id: 'structural-grade', vendor: 'Structural', company: '94% pass rate', pricing: 94 }
          ]
        },
        'Compare CCM-3 with CCM-1': {
          id: crypto.randomUUID(),
          topic: 'ccm-compare',
          title: 'CCM Comparison',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'CCM-1 is normal while CCM-3 is the only caster showing downstream quality breakdown.',
          lenses: [],
          options: [{ key: 'bar', label: 'bar', enabled: true }],
          rows: [
            { id: 'ccm3-solidification', vendor: 'CCM-3', company: '74% pass rate', pricing: 74 },
            { id: 'ccm-1', vendor: 'CCM-1', company: '93% pass rate', pricing: 93 }
          ]
        },
        'Quantify Automotive revenue risk': {
          id: crypto.randomUUID(),
          topic: 'revenue-risk',
          title: 'Automotive Revenue Risk',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'The combination of shortfall and premium-grade pricing is creating material revenue exposure.',
          lenses: [],
          options: [{ key: 'bar', label: 'bar', enabled: true }],
          rows: [
            { id: 'grade-risk', vendor: 'Shortfall value', company: '₹32.2 Cr at risk', pricing: 82 },
            { id: 'commitment-gap', vendor: 'Delivery gap', company: '~620 MT shortfall', pricing: 62 }
          ]
        },
        'Show commitment vs projected delivery': {
          id: crypto.randomUUID(),
          topic: 'delivery-gap',
          title: 'Commitment vs Projected Delivery',
          question: prompt,
          format: 'bar',
          formatLabel: 'Bar Chart',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insight: 'Projected delivery is now materially below the committed quarter volume.',
          lenses: [],
          options: [{ key: 'bar', label: 'bar', enabled: true }],
          rows: [
            { id: 'committed-volume', vendor: 'Committed', company: '2,400 MT', pricing: 100 },
            { id: 'projected-volume', vendor: 'Projected', company: '~1,780 MT', pricing: 74 }
          ]
        }
      };
      return map[prompt] || baseResponse(prompt);
    }

    function renderPrimaryVisual(response) {
      if (response.format === 'flow') return renderFlowView();
      if (response.format === 'line') return renderLineView(response.rows);
      if (response.format === 'bar') return renderBarView(response.rows);
      if (response.format === 'text') return renderTextView();
      return renderTable(response.rows);
    }

    function renderResponseCard(response) {
      const options = response.options || [
        { key: 'table', label: 'table', enabled: true },
        { key: 'bar', label: 'bar', enabled: true },
        { key: 'line', label: 'line', enabled: true },
        { key: 'text', label: 'text', enabled: true }
      ];
      const showSwitcher = options.length > 1;

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
              <div class="header-actions">
                <button class="icon-btn ${state.bookmarks.has(response.id) ? 'bookmarked' : ''}" type="button" data-bookmark="${response.id}" title="Bookmark">☆</button>
                <div class="export-wrap">
                  <button class="icon-btn" type="button" data-export="${response.id}" title="Export">⤴</button>
                  <div class="export-menu" ${state.exportOpenFor === response.id ? '' : 'hidden'}>
                    <button class="export-option" type="button">Download as PNG</button>
                    <button class="export-option" type="button">Download as CSV</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-block card-body">
            <div class="agent-insight">${escapeHtml(response.insight)}</div>
            ${renderPrimaryVisual(response)}
          </div>
        </article>
      `;
    }

    function renderThread() {
      const responses = currentResponses();
      thread.innerHTML = `<div class="thread-stack">${responses.map(response => `
        <div class="user-message">${escapeHtml(response.question)}</div>
        ${renderResponseCard(response)}
        ${renderFollowups(response)}
      `).join('')}</div>`;
    }

    function renderHistory() {
      if (!currentResponses().length) {
        historyDivider.style.display = 'none';
        historyList.innerHTML = '';
        return;
      }
      historyDivider.style.display = 'block';
      historyThreads[0].title = currentResponses()[0]?.question || 'Current Thread';
      historyThreads[0].count = currentResponses().length;
      historyList.innerHTML = historyThreads.map(item => `
        <button class="history-item ${item.id === state.currentThreadId ? 'active' : ''}" type="button" data-thread="${item.id}">
          <div class="history-title">${escapeHtml(item.title)}</div>
          <div class="history-meta">${escapeHtml(item.date)} · ${item.count} responses</div>
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
          <div class="saved-question">${escapeHtml(item.question)}</div>
          <div class="saved-meta">${escapeHtml(item.timestamp)}</div>
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
      const numeric = points.map(([label, value]) => {
        const match = String(value).match(/-?\d+(\.\d+)?/);
        return { label, value: match ? Number(match[0]) : 0 };
      });
      const values = numeric.map(item => item.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const span = Math.max(max - min, 1);
      const chartPoints = numeric.map((item, index) => {
        const x = 28 + (index * (224 / Math.max(numeric.length - 1, 1)));
        const normalized = (item.value - min) / span;
        const y = 76 - normalized * 44;
        return `${x},${y}`;
      }).join(' ');
      return `
        <div class="trend-chart">
          <svg viewBox="0 0 280 96" aria-hidden="true">
            <path d="M28 76 L252 76" stroke="rgba(148,163,184,0.14)" stroke-width="1"></path>
            <polyline points="${chartPoints}" fill="none" stroke="rgba(41, 207, 214, 0.92)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
            ${numeric.map((item, index) => {
              const x = 28 + (index * (224 / Math.max(numeric.length - 1, 1)));
              const normalized = (item.value - min) / span;
              const y = 76 - normalized * 44;
              return `<circle cx="${x}" cy="${y}" r="${index === numeric.length - 1 ? 4 : 3}" fill="${index === numeric.length - 1 ? '#9eb2ff' : '#7abeBA'}"></circle>`;
            }).join('')}
          </svg>
          <div class="trend-axis">
            ${numeric.map(item => `<span>${escapeHtml(item.label.replace('Day ', 'D'))}</span>`).join('')}
          </div>
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
        body = card.points ? renderTrendChart(card.points) : `<div class="mini-chart"></div>`;
      } else if (card.type === 'bars') {
        body = `
          <div class="mini-bars">
            ${card.rows.map(([label, value, status]) => `
              <div class="mini-bar-row">
                <span>${escapeHtml(label)}</span>
                <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${value}%"></div></div>
                <span>${escapeHtml(status)}</span>
              </div>
            `).join('')}
          </div>
        `;
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
      timelineSegments.innerHTML = responses.map((response, index) => `<button class="timeline-segment ${index === active ? 'active' : ''}" type="button" data-index="${index}"></button>`).join('');
      document.getElementById('scrollUp').disabled = active <= 0;
      document.getElementById('scrollDown').disabled = active >= responses.length - 1;
    }

    function openWorkspaceWithResponse(response) {
      state.mode = 'thread';
      state.centeredInput = false;
      state.threads[state.currentThreadId] = [response];
      resetPanels();
      composerInput.value = response.question;
      composerInput.placeholder = 'ask a follow-up...';
    }

    function renderVisibility() {
      app.classList.toggle('landing-mode', state.mode === 'landing');
      app.classList.toggle('history-open', state.historyOpen && state.mode !== 'landing');
      toggleHistoryIcon.textContent = state.historyOpen ? '◂' : '▸';
      toggleHistoryLabel.textContent = state.historyOpen ? 'Collapse' : 'Expand';
      landing.style.display = state.mode === 'landing' ? 'grid' : 'none';
      landing.classList.remove('exiting');
      landingFloater.style.display = state.mode === 'landing' ? 'block' : 'none';
      workspaceTools.style.display = state.mode === 'landing' ? 'none' : 'flex';
      thread.classList.toggle('active', state.mode === 'thread');
      emptyThread.classList.toggle('active', state.mode === 'empty');
      inputZone.classList.toggle('centered', state.centeredInput);
    }

    function renderPanels() {
      const drillOpen = state.mode !== 'landing' && state.activePanel === 'drill';
      const bookmarksOpen = state.mode !== 'landing' && state.activePanel === 'bookmarks';
      const artifactsOpen = state.mode !== 'landing' && state.activePanel === 'artifacts';
      panel.classList.toggle('open', drillOpen);
      bookmarksSheet.classList.toggle('open', bookmarksOpen);
      artifactsSheet.classList.toggle('open', artifactsOpen);
      workspaceMain.classList.toggle('with-panel', drillOpen);
      workspaceMain.classList.toggle('with-sheet', bookmarksOpen || artifactsOpen);
      inputZone.classList.toggle('with-panel', drillOpen);
      inputZone.classList.toggle('with-sheet', bookmarksOpen || artifactsOpen);
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
    }

    function switchFormat(responseId, nextFormat) {
      const response = currentResponses().find(item => item.id === responseId);
      if (!response) return;
      response.format = nextFormat;
      response.formatLabel = nextFormat === 'table' ? 'Table' : nextFormat === 'bar' ? 'Bar Chart' : nextFormat === 'line' ? 'Line Chart' : 'Text';
      state.exportOpenFor = null;
      renderAll();
    }

    function addLens(responseId, lens) {
      const next = baseResponse(lens);
      currentResponses().push(next);
      renderAll();
      requestAnimationFrame(() => scrollToResponse(next.id));
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

    function scrollToResponse(responseId) {
      const target = document.getElementById(`response-${responseId}`);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('highlight');
      setTimeout(() => target.classList.remove('highlight'), 500);
    }

    document.getElementById('starterButton').addEventListener('click', () => {
      state.mode = 'empty';
      state.centeredInput = true;
      resetPanels();
      composerInput.value = '';
      composerInput.placeholder = 'What would you like to explore?';
      renderAll();
      setTimeout(() => composerInput.focus(), 200);
    });

    document.getElementById('backToLanding').addEventListener('click', () => {
      state.mode = 'landing';
      state.centeredInput = false;
      state.historyOpen = false;
      resetPanels();
      composerInput.value = '';
      composerInput.placeholder = 'ask a follow-up...';
      renderAll();
      canvas.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('toggleHistory').addEventListener('click', () => {
      if (state.mode === 'landing') return;
      state.historyOpen = !state.historyOpen;
      renderAll();
    });

    document.getElementById('historyButton').addEventListener('click', () => {
      // Navigation is intentionally disabled for now while preserving the enabled UI affordance.
    });

    document.getElementById('newThread').addEventListener('click', () => {
      startNewChatAtLanding();
    });

    document.getElementById('bookmarksButton').addEventListener('click', () => {
      // Navigation is intentionally disabled for now while preserving the enabled UI affordance.
    });

    document.getElementById('artifactsButton').addEventListener('click', () => {
      if (state.mode === 'landing') return;
      state.activePanel = state.activePanel === 'artifacts' ? null : 'artifacts';
      renderAll();
    });

    composer.addEventListener('submit', event => {
      event.preventDefault();
      const value = composerInput.value.trim();
      if (!value) return;
      if (state.mode !== 'thread') {
        state.mode = 'thread';
        state.centeredInput = false;
      }
      const next = baseResponse(value);
      currentResponses().push(next);
      composerInput.value = '';
      composerInput.placeholder = 'ask a follow-up...';
      renderAll();
      requestAnimationFrame(() => scrollToResponse(next.id));
    });

    canvas.addEventListener('scroll', () => {
      renderTimeline();
      if (state.historyOpen) {
        state.historyOpen = false;
        renderAll();
      }
    });

    document.addEventListener('click', event => {
      const landingProfileToggle = event.target.closest('[data-landing-profile]');
      if (landingProfileToggle) {
        state.landingProfileOpen = !state.landingProfileOpen;
        renderAll();
        return;
      }

      const landingSignOut = event.target.closest('[data-landing-signout]');
      if (landingSignOut) {
        state.landingProfileOpen = false;
        state.mode = 'landing';
        state.centeredInput = false;
        state.historyOpen = false;
        resetPanels();
        composerInput.value = '';
        composerInput.placeholder = 'ask a follow-up...';
        renderAll();
        canvas.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const landingAction = event.target.closest('[data-landing-action]');
      if (landingAction) {
        const action = landingAction.dataset.landingAction;
        state.landingProfileOpen = false;
        if (action === 'new-chat') {
          startNewChatAtLanding();
          return;
        }

        if (action === 'history') {
          // Navigation is intentionally disabled for now while preserving the enabled UI affordance.
          return;
        }

        if (action === 'bookmarks') {
          // Navigation is intentionally disabled for now while preserving the enabled UI affordance.
          return;
        }
      }

      const startEmptyTrigger = event.target.closest('[data-start-empty]');
      if (startEmptyTrigger) {
        state.mode = 'empty';
        state.centeredInput = true;
        state.historyOpen = false;
        resetPanels();
        composerInput.value = '';
        composerInput.placeholder = 'What would you like to explore?';
        renderAll();
        setTimeout(() => composerInput.focus(), 180);
        return;
      }

      const topicCard = event.target.closest('[data-topic]');
      if (topicCard) {
        const card = landingCards.find(item => item.key === topicCard.dataset.topic);
        if (!card) return;
        state.reviewed.add(card.key);
        topicCard.classList.add('selected');
        landing.classList.add('exiting');
        setTimeout(() => {
          openWorkspaceWithResponse(baseResponse(card.title));
          renderAll();
          canvas.scrollTo({ top: 0, behavior: 'smooth' });
        }, 180);
        return;
      }

      const starterBtn = event.target.closest('[data-starter]');
      if (starterBtn) {
        const starter = starterBtn.dataset.starter;
        if (!starter) return;
        const next = baseResponse(starter);
        state.mode = 'thread';
        state.centeredInput = false;
        state.threads[state.currentThreadId] = [next];
        resetPanels();
        composerInput.value = starter;
        composerInput.placeholder = 'ask a follow-up...';
        renderAll();
        canvas.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const closeBtn = event.target.closest('[data-close]');
      if (closeBtn) {
        if (closeBtn.dataset.close === 'bookmarks' || closeBtn.dataset.close === 'artifacts' || closeBtn.dataset.close === 'panel') {
          state.activePanel = null;
          if (closeBtn.dataset.close === 'panel') {
            state.selectedEntity = null;
            state.panelResponseId = null;
          }
        }
        renderAll();
        return;
      }

      const switchBtn = event.target.closest('[data-switch]');
      if (switchBtn) {
        switchFormat(switchBtn.dataset.responseId, switchBtn.dataset.switch);
        return;
      }

      const lensBtn = event.target.closest('[data-lens]');
      if (lensBtn) {
        addLens(lensBtn.dataset.responseId, lensBtn.dataset.lens);
        return;
      }

      const followupSourceBtn = event.target.closest('[data-followup-source]');
      if (followupSourceBtn && state.activePanel === 'drill') {
        if (state.panelResponseId) {
          showFollowups(state.panelResponseId, followupSourceBtn.dataset.followupSource);
        }
        return;
      }

      const flowNode = event.target.closest('[data-flow-node]');
      if (flowNode) {
        const responseCard = flowNode.closest('.response-card');
        state.selectedEntity = flowNode.dataset.flowNode;
        state.panelResponseId = responseCard?.dataset.responseId || null;
        renderDrillPanel(flowNode.dataset.flowNode);
        state.activePanel = 'drill';
        if (state.panelResponseId) showFollowups(state.panelResponseId, flowNode.dataset.flowNode);
        renderAll();
        return;
      }

      const vendorRow = event.target.closest('[data-vendor]');
      if (vendorRow) {
        const responseCard = vendorRow.closest('.response-card');
        state.selectedEntity = vendorRow.dataset.vendor;
        state.panelResponseId = responseCard?.dataset.responseId || null;
        renderDrillPanel(vendorRow.dataset.vendor);
        state.activePanel = 'drill';
        if (state.panelResponseId) showFollowups(state.panelResponseId, vendorRow.dataset.vendor);
        renderAll();
        return;
      }

      const entityBtn = event.target.closest('[data-entity]');
      if (entityBtn) {
        const responseCard = entityBtn.closest('.response-card');
        state.selectedEntity = entityBtn.dataset.entity;
        state.panelResponseId = responseCard?.dataset.responseId || null;
        renderDrillPanel(entityBtn.dataset.entity);
        state.activePanel = 'drill';
        if (state.panelResponseId) showFollowups(state.panelResponseId, entityBtn.dataset.entity);
        renderAll();
        return;
      }

      const followupBtn = event.target.closest('[data-followup]');
      if (followupBtn) {
        const next = followupResponse(followupBtn.dataset.followup);
        state.activePanel = null;
        state.selectedEntity = null;
        state.panelResponseId = null;
        state.followupContext = null;
        currentResponses().push(next);
        composerInput.value = '';
        composerInput.placeholder = 'ask a follow-up...';
        renderAll();
        requestAnimationFrame(() => scrollToResponse(next.id));
        return;
      }

      const bookmarkBtn = event.target.closest('[data-bookmark]');
      if (bookmarkBtn) {
        toggleBookmark(bookmarkBtn.dataset.bookmark);
        return;
      }

      const exportBtn = event.target.closest('[data-export]');
      if (exportBtn) {
        state.exportOpenFor = state.exportOpenFor === exportBtn.dataset.export ? null : exportBtn.dataset.export;
        renderAll();
        return;
      }

      const jumpBtn = event.target.closest('[data-jump]');
      if (jumpBtn) {
        state.activePanel = null;
        renderAll();
        setTimeout(() => scrollToResponse(jumpBtn.dataset.jump), 180);
        return;
      }

      const historyBtn = event.target.closest('[data-thread]');
      if (historyBtn) {
        state.currentThreadId = historyBtn.dataset.thread;
        if (!state.threads[state.currentThreadId]) {
          state.threads[state.currentThreadId] = [baseResponse('Vendor Leaderboard')];
        }
        state.mode = 'thread';
        state.centeredInput = false;
        state.historyOpen = false;
        resetPanels();
        renderAll();
        return;
      }

      const timelineBtn = event.target.closest('[data-index]');
      if (timelineBtn) {
        const target = currentResponses()[Number(timelineBtn.dataset.index)];
        if (target) scrollToResponse(target.id);
      }

      if (state.landingProfileOpen && !event.target.closest('.landing-profile-wrap')) {
        state.landingProfileOpen = false;
        renderAll();
      }
    });

    timelineSegments.addEventListener('mouseover', event => {
      const segment = event.target.closest('[data-index]');
      if (!segment) return;
      const response = currentResponses()[Number(segment.dataset.index)];
      if (!response) return;
      timelineTooltip.innerHTML = `${escapeHtml(response.question)}<br>${escapeHtml(response.formatLabel)} · ${escapeHtml(response.timestamp)}`;
      timelineTooltip.style.top = `${segment.offsetTop + 12}px`;
      timelineTooltip.classList.add('visible');
    });

    timelineSegments.addEventListener('mouseout', event => {
      if (event.target.closest('[data-index]')) timelineTooltip.classList.remove('visible');
    });

    document.getElementById('scrollUp').addEventListener('click', () => {
      const responses = currentResponses();
      const active = visibleResponseIndex();
      if (active > 0) scrollToResponse(responses[active - 1].id);
    });

    document.getElementById('scrollDown').addEventListener('click', () => {
      const responses = currentResponses();
      const active = visibleResponseIndex();
      if (active < responses.length - 1) scrollToResponse(responses[active + 1].id);
    });

    window.addEventListener('resize', renderTimeline);

    renderAll();
}
