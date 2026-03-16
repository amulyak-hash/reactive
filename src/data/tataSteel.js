import { C } from '../theme/tokens';

export const NARRATIVES = {
  overview: "Evidence suggests enterprise production is tracking 8% below expected output. The primary deviation is concentrated in Plant B, Jamshedpur. Diagnostic analysis indicates repeated downtime events on Line 3, potentially compounded by a 12-hour supplier delay from Supplier X.",
  plantB: "Analysis of Plant B indicates Line 3 accounts for 73% of the production shortfall. Machine M21 shows repeated mechanical faults coinciding with the morning shift. Evidence suggests this is compounded by the delayed Supplier X shipment, which supplies the primary input material for Line 3.",
  line3: "Line 3 performance is affected across the BF-3 → CCM-3 chain. Blast furnace superheat has dropped to 22°C (target 34°C), and continuous casting speed has been reduced. Evidence suggests root cause traces to Supplier X batch variance.",
};

export const PLANTS = [
  { name: "Plant A · Jamshedpur",  expected: 92, actual: 89, color: C.blue },
  { name: "Plant B · Jamshedpur",  expected: 95, actual: 78, color: C.red },
  { name: "Plant C · Kalinganagar", expected: 88, actual: 86, color: C.blue },
  { name: "Plant D · Meramandali",  expected: 85, actual: 83, color: C.blue },
];

export const PLANT_B_LINES = [
  { name: "Line 1", output: 88 },
  { name: "Line 2", output: 91 },
  { name: "Line 3", output: 42 },
  { name: "Line 4", output: 85 },
  { name: "Line 5", output: 79 },
];

export const MACHINE_FAULTS = [
  { id: "M08", faults: 1 },
  { id: "M12", faults: 0 },
  { id: "M15", faults: 1 },
  { id: "M18", faults: 2 },
  { id: "M21", faults: 7 },
  { id: "M22", faults: 1 },
  { id: "M25", faults: 0 },
];

export const SUPPLIER_STATUS = {
  name: "Supplier X",
  material: "Iron Ore Batch 4471",
  status: "DELAYED 12h",
  transit: 65,
  dispatched: "Mar 11",
  expected: "Mar 13 18:00",
  revised: "Mar 14 06:00",
};

export const ZONES = [
  { id: "bf",  label: "Blast Furnace",      code: "BF-3",  metric: "1,502°C",   sub: "Coke rate 385 kg/t",   status: "alert", accent: C.orange,
    description: "Deviation detected — part of active causal chain",
    storyTitle: "Root Cause Analysis", storyDesc: "Why BF-3 superheat is dropping — traced from raw material to grade risk" },
  { id: "sms", label: "Steel Melting Shop",  code: "BOF-2", metric: "1,665°C",   sub: "Carbon: 0.04%",        status: "ok",    accent: C.red,
    description: "Operating within normal parameters",
    storyTitle: "Anomaly Detection", storyDesc: "Real-time signal monitoring across 40 BOF sensors" },
  { id: "cc",  label: "Continuous Casting",   code: "CCM-3", metric: "1.2 m/min", sub: "Superheat: 22°C ↓",    status: "alert", accent: C.cyan,
    description: "Deviation detected — part of active causal chain",
    storyTitle: "Adaptive Intelligence", storyDesc: "Same casting event — four different views for four different roles" },
  { id: "rm",  label: "Rolling Mill",         code: "HSM-1", metric: "97.1%",     sub: "Yield: 97.1%",         status: "ok",    accent: C.blue,
    description: "Operating within normal parameters",
    storyTitle: "Confidence Landscape", storyDesc: "Decision calibration across strip quality predictions" },
  { id: "ql",  label: "Quality Lab",          code: "QC",    metric: "94.2%",     sub: "Defect rate: 0.8/1K",  status: "ok",    accent: C.green,
    description: "Operating within normal parameters",
    storyTitle: "Decision Journal", storyDesc: "847 quality decisions tracked — calibration improving over 18 months" },
];

export const CAUSAL_CHAIN = [
  { label: "Supplier X",  confidence: "92%" },
  { label: "BF-3",        confidence: "87%" },
  { label: "CCM-3",       confidence: "74%" },
  { label: "Grade Risk",  confidence: "59%" },
];

export const STORIES = {
  bf: [
    { t: "Raw Material Variance", c: "Supplier X's latest iron ore batch has silicon content 0.12% above specification. The deviation enters BF-3's input stream." },
    { t: "Superheat Impact", c: "Silicon variance propagates into hot metal chemistry. BF-3 superheat drops from 34°C to 22°C. 92% confidence in this causal link." },
    { t: "Downstream Cascade", c: "Reduced superheat alters solidification behavior in CCM-3. The stream thins — 87% confidence. Each link compounds uncertainty." },
    { t: "Grade Risk Assessment", c: "Full chain: 0.92 × 0.87 × 0.74 = 59% compound confidence that automotive-grade spec will be met. Honest uncertainty, not false precision." },
  ],
  sms: [
    { t: "The Sensor Field", c: "40 sensors monitor BOF-2 in real-time. Lance position, bath temperature, off-gas analysis, vessel tilt. The field breathes — all within normal range." },
    { t: "Operating Threshold", c: "The red line at 1,700°C marks the tap temperature ceiling. Above this, refractory lining degradation accelerates. Below 1,640°C, carbon removal stalls." },
    { t: "Signal Deviation", c: "Sensor 27 — off-gas CO₂ ratio — begins diverging. Color shifts from cyan to amber to red. An alert ring expands. This is the leading indicator." },
    { t: "Causal Cluster", c: "Neighboring sensors react. Lance position correlates at 89%. Bath temperature follows at 82%. The system identifies the cluster, not just the symptom." },
  ],
  cc: [
    { t: "One Casting Event", c: "CCM-3 superheat has dropped to 22°C during an automotive-grade sequence. This single event needs to reach four different decision-makers." },
    { t: "The Operator's View", c: "Real-Time Responder: '22°C — below target.' Red indicator. One acknowledge button. Decision budget: 2-3 seconds. Nothing else on screen." },
    { t: "Four Simultaneous Views", c: "Operator gets the alert. Shift supervisor sees the coordination queue. Process engineer sees the causal chain. Plant director sees the quarterly narrative." },
    { t: "Live Adaptation", c: "When superheat recovers to 28°C, all four views update simultaneously — each in its own language. The operator's red turns amber. The narrative rewrites itself." },
  ],
  rm: [
    { t: "The Quality Terrain", c: "Every strip quality prediction maps to a confidence level. High peaks: the model is certain. Deep valleys: genuine uncertainty about the outcome." },
    { t: "Quantile Distribution", c: "17 of 20 modeled scenarios predict the current coil meets thickness specification. Each dot is one simulation. The cluster tells the probability story." },
    { t: "The Uncertainty Valley", c: "At the edges of grade transitions, confidence drops. This isn't a failure — it's honest reporting. The system says 'I don't know' rather than guessing." },
    { t: "Decision Threshold", c: "Above the line: proceed to shipping. Below: route to re-inspection. The threshold is calibrated from 847 past decisions, not set arbitrarily." },
  ],
  ql: [
    { t: "The Decision Trail", c: "18 months of quality decisions — each one a node on the timeline. Recent decisions are bright and close. Older ones fade." },
    { t: "Calibration Revealed", c: "Green: your prediction matched the outcome. Orange: miscalibrated. The pattern shows where your judgment is strong and where it needs data support." },
    { t: "Natural Frequencies", c: "'Out of 10 times you said automotive grade would pass, it passed 7 times.' Not probabilities — natural frequencies that humans actually understand." },
    { t: "Process Improvement", c: "'Your strategy of early superheat monitoring improved detection time by 23%.' Process-level feedback, never self-level. Trajectories, not snapshots." },
  ],
};

/* ─── CARD_REGISTRY ─── Multi-lens storytelling metadata for all cards ─── */
export const CARD_REGISTRY = {
  // ── Existing Intelligence Layers (lens 0 = existing canvas, lenses 1-2 = TBD) ──
  bf: {
    label: "Root Cause Analysis", code: "BF-3", accent: C.orange, sourceLayer: "zones",
    lenses: [
      { name: "Causal Chain", icon: "chain", stories: STORIES.bf },
      { name: "Heat Profile", icon: "terrain", stories: [
        { t: "The Temperature Map", c: "BF-3's thermal profile: a 3D landscape of temperature across the furnace hearth. Hot spots and cold zones tell the story of combustion efficiency." },
        { t: "The Cold Shoulder", c: "Zone 4 — the east wall — reads 1,471°C. 31°C below target. The cold spot correlates with the silicon-rich ore batch: different chemistry, different burn pattern." },
        { t: "Heat Migration", c: "Over 6 hours, the cold zone migrates clockwise. It's not static — the thermal anomaly follows the charge rotation pattern. Each cycle, it shifts 15°." },
        { t: "The Thermal Diagnosis", c: "Cold zone + silicon variance + charge rotation = the furnace is compensating for bad feedstock. It's working harder to achieve less. Efficiency loss: 8%." },
      ]},
      { name: "Feed Variance", icon: "dna", stories: [
        { t: "The Input Spectrum", c: "Five raw material parameters define BF-3's feed: Fe content, Si%, moisture, particle size, and basicity. Today, one parameter is off." },
        { t: "Silicon Outlier", c: "Si at 0.34% — 0.12% above spec. Plotted against 90 days of history, this batch is in the 96th percentile. Not catastrophic, but notable." },
        { t: "The Cascade Trigger", c: "Si variance changes slag chemistry. More silicon means more slag volume. More slag means less efficient heat transfer. The feed parameter cascades into thermal performance." },
        { t: "Feed-Forward Prediction", c: "Given this feed composition, the model predicts: superheat 22°C (actual: 22°C), hot metal Si 0.42% (actual: 0.44%). The feed told the story before the furnace did." },
      ]},
    ],
  },
  sms: {
    label: "Anomaly Detection", code: "BOF-2", accent: C.red, sourceLayer: "zones",
    lenses: [
      { name: "Sensor Field", icon: "sensor", stories: STORIES.sms },
      { name: "Signal Decay", icon: "trace", stories: [
        { t: "The Clean Signal", c: "Sensor 27 — off-gas CO₂ ratio — starts each heat at baseline. The signal is crisp: 14.2% CO₂, noise floor at ±0.1%. A healthy waveform." },
        { t: "The Drift Begins", c: "Minute 8: signal begins drifting. Not a spike — a slow, continuous rise. 14.2% → 14.5% → 14.9%. The drift rate: 0.04%/minute. Invisible to threshold alarms." },
        { t: "Decay Acceleration", c: "Minute 14: drift accelerates. 14.9% → 15.8% in 3 minutes. The exponential curve emerges. By the time it hits the 16% threshold, it's been decaying for 6 minutes." },
        { t: "The Early Warning Window", c: "Traditional alert fires at minute 14. Decay detection catches it at minute 8. That's 6 minutes of advance warning — enough to adjust lance position before the slag foams." },
      ]},
      { name: "Correlation Web", icon: "weave", stories: [
        { t: "The Isolated Signal", c: "One sensor deviates. Is it noise or signal? In isolation, impossible to tell. But sensors don't exist in isolation — they form a web." },
        { t: "First-Order Connections", c: "Sensor 27 (CO₂) connects to Sensor 12 (lance position) at 89% correlation and Sensor 31 (bath temp) at 82%. When 27 moves, 12 and 31 respond." },
        { t: "The Web Tightens", c: "Second-order connections emerge: lance position affects vessel tilt (74%), bath temp affects slag viscosity (68%). The web has depth — the anomaly propagates through layers." },
        { t: "Cluster vs Coincidence", c: "3 correlated sensors = meaningful cluster. The web analysis distinguishes: 'these are connected' from 'these happened to move at the same time.' Correlation is not causation — but clustered correlation is evidence." },
      ]},
    ],
  },
  cc: {
    label: "Adaptive Intelligence", code: "CCM-3", accent: C.cyan, sourceLayer: "zones",
    lenses: [
      { name: "Role Views", icon: "adapt", stories: STORIES.cc },
      { name: "Response Map", icon: "ripple", stories: [
        { t: "The Event Epicenter", c: "CCM-3 superheat drops to 22°C. This is the epicenter. How fast does the response propagate, and to whom?" },
        { t: "First Responders (< 30s)", c: "The casting operator sees the alert within 3 seconds. The automated speed controller reacts in 0.5 seconds. These are reflex responses — no decision required." },
        { t: "Second Ring (1-5 min)", c: "Shift supervisor notified at 45 seconds. Process engineer's causal display updates at 2 minutes. Material flow coordinator sees queue impact at 4 minutes." },
        { t: "The Outer Ring (5-60 min)", c: "Production scheduler recalculates at 8 minutes. Quality prediction model retrains at 15 minutes. Plant director's narrative updates in the next hourly cycle." },
      ]},
      { name: "Priority Stack", icon: "layers", stories: [
        { t: "Competing Priorities", c: "The 22°C event creates 7 simultaneous action items across 4 roles. They can't all be done first. The system must stack them." },
        { t: "Urgency Layer", c: "Top of stack: casting speed reduction (safety). Second: mold level adjustment (quality). Third: downstream notification (coordination). Urgency is not importance — it's time sensitivity." },
        { t: "Impact Layer", c: "Re-sorted by impact: grade risk assessment (₹2.1 Cr exposure) rises above mold adjustment (₹0.3 Cr). Same events, different ordering when you weight by consequence." },
        { t: "The Adaptive Stack", c: "As superheat recovers to 28°C: casting speed drops from urgent to monitoring. Grade risk drops from critical to watchlist. The stack reshuffles in real-time." },
      ]},
    ],
  },
  rm: {
    label: "Confidence Landscape", code: "HSM-1", accent: C.blue, sourceLayer: "zones",
    lenses: [
      { name: "Terrain View", icon: "terrain", stories: STORIES.rm },
      { name: "Decision Grid", icon: "spectrum", stories: [
        { t: "The Grid", c: "847 past quality decisions mapped on two axes: model confidence (x) and actual outcome (y). Each cell tells a story about when to trust the prediction." },
        { t: "The Green Zone", c: "High confidence + good outcome (top-right): 612 of 847 decisions. When the model says 'ship it' with >80% confidence, it's right 94% of the time." },
        { t: "The Danger Zone", c: "High confidence + bad outcome (bottom-right): 23 decisions. The model was confident but wrong. These are the expensive mistakes — false certainty." },
        { t: "The Honest Zone", c: "Low confidence + re-inspected (top-left): 188 decisions. The model said 'I'm not sure' and was right to be cautious. Honest uncertainty saved 31 defective shipments." },
      ]},
      { name: "Calibration Arc", icon: "journal", stories: [
        { t: "Month 1: Overconfident", c: "The model launches predicting 90% confidence on everything. Reality: only 72% of high-confidence predictions are correct. The arc starts steep — miscalibrated." },
        { t: "Month 6: Learning", c: "After 200 decisions, calibration improves. 85% confidence predictions are correct 81% of the time. The gap narrows. The model is learning its own uncertainty." },
        { t: "Month 12: The Valley", c: "A grade transition introduces new steel chemistry. Confidence drops to 65% across the board. But this time, the model knows it doesn't know. The valley is honest." },
        { t: "Month 18: Calibrated", c: "Current state: when the model says 80%, it means 80%. The calibration arc has flattened — predictions match outcomes. 847 decisions refined the model's self-awareness." },
      ]},
    ],
  },
  ql: {
    label: "Decision Journal", code: "QC", accent: C.green, sourceLayer: "zones",
    lenses: [
      { name: "Spiral Timeline", icon: "journal", stories: STORIES.ql },
      { name: "Outcome Map", icon: "stars", stories: [
        { t: "The Decision Field", c: "847 quality decisions scattered across a field. Each dot is one decision: position = parameters, color = outcome. Patterns emerge from the scatter." },
        { t: "The Green Clusters", c: "Correct decisions cluster in predictable zones: standard grades, normal chemistry, steady-state operations. These are the 'easy' decisions — 73% of total." },
        { t: "The Orange Scatter", c: "Incorrect decisions scatter at the edges: grade transitions, unusual chemistry, post-maintenance restarts. These are the boundary conditions where judgment fails." },
        { t: "The Decision Boundary", c: "A line separates green from orange. Above: ship with confidence. Below: re-inspect. The boundary isn't straight — it curves around the difficult zones, acknowledging complexity." },
      ]},
      { name: "Frequency Dial", icon: "pulse", stories: [
        { t: "The Natural Number", c: "Forget probabilities. 'Out of 10 times you said automotive grade would pass, it passed 7 times.' Natural frequencies — the way humans actually process uncertainty." },
        { t: "The Dial Reads 7/10", c: "Current automotive-grade prediction accuracy: 7 out of 10. Not 70% — seven out of ten. You can picture 10 coils, 7 pass, 3 fail. That's tangible." },
        { t: "Improving the Dial", c: "Six months ago the dial read 5/10. Now 7/10. The improvement trajectory: each month adds ~0.3 correct predictions per 10. The dial moves slowly but consistently." },
        { t: "The Target Dial", c: "Target: 9/10 by Q4. That means 1 out of 10 automotive coils still needs re-inspection. Not perfection — calibrated imperfection. The last 1/10 is the cost of honest uncertainty." },
      ]},
    ],
  },

  // ── Dashboard Cards ──
  downtime: {
    label: "Downtime Events", code: "LINE-3", accent: C.red, sourceLayer: "dashboard",
    lenses: [
      {
        name: "Incident Archaeology", icon: "layers",
        stories: [
          { t: "Surface Layer — The Latest Events", c: "8 downtime events across Line 3 in the last shift. The surface shows frequency and timing — but not cause. Let's dig." },
          { t: "Stratum 2 — The Recurring Machine", c: "M21 appears in 4 of 8 events. That's not random — that's a pattern buried in the geological record. The other machines are noise; M21 is signal." },
          { t: "Stratum 3 — The Root System", c: "Digging deeper: M21's faults cluster between hours 2-5. Morning shift, every time. Same operator rotation? Same warm-up sequence? The rock layers tell a story." },
          { t: "The Fossil — Origin Event", c: "First M21 fault traces to a bearing replacement 6 days ago. Maintenance log shows non-OEM part used. Every subsequent fault inherits from this decision." },
        ],
      },
      {
        name: "Pattern Weave", icon: "weave",
        stories: [
          { t: "The Individual Threads", c: "Each downtime event is a thread. Isolated, they look random — 8 separate incidents with separate timestamps and machines." },
          { t: "First Connections", c: "Thread M21-2:12 and M21-2:48 — 36 minutes apart. Too close to be independent. The loom reveals: same vibration signature preceded both." },
          { t: "The Emerging Pattern", c: "Four M21 threads weave together with one M18 thread. Shared root: upstream material feed irregularity triggers mechanical stress cascade." },
          { t: "The Fabric Complete", c: "Two distinct patterns emerge: M21 cluster (mechanical, 73% of downtime minutes) and M15/M08 scatter (electrical, 14%). Different looms, different fixes." },
        ],
      },
      {
        name: "Cost River", icon: "river",
        stories: [
          { t: "The Tributaries", c: "8 downtime events, each a stream of lost production. Small streams: M22 at 12 minutes. Large streams: M21 events totaling 96 minutes." },
          { t: "The Confluence", c: "M21's four tributaries merge into a single rushing channel — 96 minutes of lost output. That's 38 tonnes of steel that didn't get made." },
          { t: "The Downstream Flood", c: "96 minutes of Line 3 downtime backs up the CCM-3 queue, delays two rolling mill slots, and pushes one automotive shipment past its window." },
          { t: "The Full River Basin", c: "Total cost river: 127 minutes downtime → 51 tonnes lost → ₹4.2 Cr revenue impact → 1 customer delivery at risk. One bearing replacement decision." },
        ],
      },
    ],
  },

  prod_trend: {
    label: "Production Trend", code: "PROD", accent: C.blue, sourceLayer: "dashboard",
    lenses: [
      {
        name: "Shift Replay", icon: "clock",
        stories: [
          { t: "The Clean Start", c: "06:00 to 11:00 — production tracks expected output within 2%. Five green hours. The shift is running textbook." },
          { t: "The First Crack", c: "11:00 — the first deviation. Actual drops 3.5% below expected. Small enough to ignore. But the gap is opening." },
          { t: "The Fracture Spreads", c: "12:00 to 15:00 — each hour the gap widens. By 15:00, actual is 18% below expected. The segments are fracturing — amber turning red." },
          { t: "The Shift Post-Mortem", c: "8% total shortfall. Root cause concentration: 73% attributable to Line 3 downtime, 15% to material delay, 12% to quality holds." },
        ],
      },
      {
        name: "Pressure Map", icon: "pipe",
        stories: [
          { t: "Normal Flow", c: "Production as a pressurized system. Material enters at the left, flows through 5 processing stages. Pressure is even — 94% flow rate." },
          { t: "The Constriction", c: "Stage 3 (Line 3) narrows. Flow rate drops to 42%. Upstream pressure builds — inventory accumulates before the bottleneck." },
          { t: "Backpressure Wave", c: "BF-3 output has nowhere to go. Hot metal holding time increases 22 minutes. Temperature drops. Quality degrades. The pressure wave travels backwards." },
          { t: "System-Wide Impact", c: "One constriction, three consequences: upstream backpressure (temp loss), downstream starvation (CCM idle time), and lateral spillover (Line 4 absorbing overflow)." },
        ],
      },
      {
        name: "Gap Anatomy", icon: "tear",
        stories: [
          { t: "The Visible Gap", c: "Expected vs actual: a widening space between two lines. This is what the dashboard shows you. But what's inside the gap?" },
          { t: "Tearing It Open", c: "Inside the gap: three floating fragments. Equipment downtime (the largest), material shortage (medium), quality holds (smallest). Not one cause — three." },
          { t: "Weighing the Fragments", c: "Equipment: 73% of the gap (93 minutes lost). Material: 15% (Supplier X delay ripple). Quality: 12% (3 coils held for re-inspection)." },
          { t: "The Compound Fracture", c: "These aren't independent. Material delay stressed equipment → more downtime → more quality variance. The gap is a compound fracture, not three separate breaks." },
        ],
      },
    ],
  },

  machine_util: {
    label: "Machine Utilization", code: "UTIL", accent: C.amber, sourceLayer: "dashboard",
    lenses: [
      {
        name: "Breathing Factory", icon: "breath",
        stories: [
          { t: "The Healthy Rhythm", c: "Lines 1, 2, 4, 5 pulse steadily — 85-91% utilization. Regular heartbeat: load, process, release, repeat. The factory breathes." },
          { t: "The Arrhythmia", c: "Line 3 stutters. Its pulse is irregular — 42% utilization with gaps between beats. Each gap is a downtime event. The heart is skipping." },
          { t: "Compensating Organs", c: "When Line 3 drops, Line 4 spikes to 94%. It's compensating — absorbing overflow. But compensation has a cost: accelerated wear, quality variance." },
          { t: "The Vital Signs Report", c: "Factory health: 4 of 5 organs nominal, 1 critical. Compensation mask hides the problem in aggregate numbers. Overall looks 82%. Reality: bimodal." },
        ],
      },
      {
        name: "Shadow Shift", icon: "shadow",
        stories: [
          { t: "The Plan", c: "The ghost layer: what was supposed to happen. 5 lines, 12 hours, every cell planned at 85-95% utilization. An orderly grid of productive time." },
          { t: "Reality Overlaid", c: "The actual heatmap drops on top. Where plan and reality align: calm blue. Where they diverge: the shadow bleeds through in red." },
          { t: "The Worst Divergence", c: "Line 3, hours 2-5: planned 92%, actual 28%. A red wound in the grid. 64 percentage points of lost capacity in one zone." },
          { t: "The Ripple in the Grid", c: "The red zone at Line 3 created amber zones on neighboring cells. Hours 6-8 across Lines 2 and 4 show 8-12% deviation from plan. The shadow spreads." },
        ],
      },
      {
        name: "Domino Cascade", icon: "domino",
        stories: [
          { t: "The First Domino", c: "Hour 2, Line 3: utilization drops from 88% to 31%. One machine goes down. The first domino tilts." },
          { t: "The Local Wave", c: "The wave hits Line 3's downstream queue first. CCM-3 starves. Idle time appears at hours 3-4. The cascade is contained — for now." },
          { t: "Cross-Line Propagation", c: "Hour 5: Line 4 absorbs Line 3's overflow material. Its utilization spikes to 97%. The domino wave has crossed line boundaries." },
          { t: "The Cascade Map", c: "5 hours after the first domino: 3 lines affected, 2 schedule changes forced, 1 quality hold triggered. One machine failure → factory-wide ripple." },
        ],
      },
    ],
  },

  supplier: {
    label: "Supplier Status", code: "SUP-X", accent: C.red, sourceLayer: "dashboard",
    lenses: [
      {
        name: "Ripple Forward", icon: "ripple",
        stories: [
          { t: "The Delay Origin", c: "Supplier X: Iron Ore Batch 4471. Dispatched Mar 11, expected Mar 13 18:00. Revised: Mar 14 06:00. A 12-hour ripple begins." },
          { t: "First Impact — BF-3", c: "BF-3 iron ore buffer: 14 hours remaining. The 12-hour delay eats the margin. Buffer drops to 2 hours — triggering a feed rate reduction." },
          { t: "Second Impact — SMS/CCM", c: "Reduced BF-3 output starves BOF-2 by hour 16. CCM-3 casting sequence interrupted. Two automotive-grade slabs deferred to next shift." },
          { t: "Full Ripple Map", c: "One 12-hour supplier delay → BF-3 feed reduction → SMS throughput drop → CCM schedule slip → 2 automotive shipments at risk. ₹1.8 Cr exposure." },
        ],
      },
      {
        name: "Trust Erosion", icon: "trust",
        stories: [
          { t: "The Current Score", c: "Supplier X reliability: 78%. Down from 91% six months ago. Each late delivery is a crack in the trust foundation." },
          { t: "The Erosion Pattern", c: "6 months ago: one delay per quarter. Now: two per month. The spiral tightens. Each incident erodes the buffer you're willing to extend." },
          { t: "Compounding Impact", c: "Trust erosion isn't linear. At 91% reliability, you kept 8-hour buffers. At 78%, you need 16-hour buffers. Double the safety stock, double the carrying cost." },
          { t: "The Decision Point", c: "Current trajectory: Supplier X hits 70% reliability by Q3. Below 70% triggers automatic dual-sourcing protocol. Cost impact: +12% on raw materials." },
        ],
      },
      {
        name: "Alternatives Map", icon: "altmap",
        stories: [
          { t: "The Current Dependency", c: "Supplier X provides 68% of BF-3's iron ore. Single-source risk. If they fail completely, BF-3 has 14 hours before shutdown." },
          { t: "The Network", c: "Three alternative suppliers identified. Supplier Y: 94% reliability, +8% cost, 48h lead time. Supplier Z: 87% reliability, +3% cost, 72h lead time. Supplier W: 82%, -2% cost, 96h." },
          { t: "Switching Costs", c: "Immediate dual-source with Y: ₹2.1 Cr/year additional cost. But it eliminates single-source risk. Insurance premium vs guaranteed continuity." },
          { t: "The Optimal Split", c: "Recommended: 50/30/20 split (X/Y/Z). Eliminates single-source risk, adds ₹1.4 Cr/year cost, reduces total supply disruption probability from 22% to 3%." },
        ],
      },
    ],
  },

  defect_rate: {
    label: "Defect Rate", code: "QC-7D", accent: C.amber, sourceLayer: "dashboard",
    lenses: [
      {
        name: "Defect DNA", icon: "dna",
        stories: [
          { t: "The Weekly Strand", c: "7 days of defect data. Monday to Sunday. The bars show rate, but not composition. Each bar is a helix of defect types waiting to be unraveled." },
          { t: "Strand Separation", c: "Three defect types emerge: surface cracks (blue), thickness variance (amber), edge wave (red). Mon-Fri: surface cracks dominate. Weekend: edge wave spikes." },
          { t: "The Recurring Gene", c: "Surface cracks appear every day — the dominant gene. But edge wave only appears Sat-Sun. Shift change? Maintenance window? Weekend crew experience?" },
          { t: "The Mutation", c: "Sunday's 1.1% rate: 60% edge wave (up from 10% on Friday). Something mutated over the weekend. Investigation target: Saturday 22:00 shift handover." },
        ],
      },
      {
        name: "Upstream Trace", icon: "trace",
        stories: [
          { t: "The Defect Point", c: "Quality Lab catches the defect. But it didn't start here. Every defect has an origin upstream. Let's trace backwards." },
          { t: "Rolling Mill Origin", c: "42% of defects trace to HSM-1 pressure variance. The rolling mill is the most common birthplace. Temperature entry variance of ±8°C is the trigger." },
          { t: "Casting Origin", c: "31% trace further back to CCM-3. Solidification rate inconsistency propagates forward. By the time the strip reaches QC, it's already marked." },
          { t: "The Full Lineage", c: "BF-3 chemistry → CCM-3 solidification → HSM-1 pressure → QC detection. The defect is born in the blast furnace and raised through three generations." },
        ],
      },
      {
        name: "Batch Fingerprint", icon: "finger",
        stories: [
          { t: "The Fingerprint Gallery", c: "Every production batch leaves a fingerprint: a unique pattern of chemistry, temperature, speed, and pressure readings. Good batches look alike. Bad ones are distinct." },
          { t: "The Good Pattern", c: "Clean batches cluster: Si 0.22±0.02%, temp 1502±5°C, speed 1.21±0.03 m/min. A tight fingerprint. Predictable, repeatable." },
          { t: "The Anomalous Print", c: "Saturday's defective batch: Si 0.34%, temp 1488°C, speed 1.18 m/min. The fingerprint is smeared — every parameter slightly off-center." },
          { t: "Pattern Matching", c: "This fingerprint matches 3 other defective batches from the last month. Same smear pattern. Same supplier lot number. The fingerprint points to Supplier X Batch 4400-series." },
        ],
      },
    ],
  },

  plant_perf: {
    label: "Plant Performance", code: "PLANT", accent: C.blue, sourceLayer: "dashboard",
    lenses: [
      {
        name: "The Race", icon: "race",
        stories: [
          { t: "The Starting Line", c: "Q1 Day 1: four plants at the start. Jamshedpur A and B, Kalinganagar C, Meramandali D. Expected output targets set. The race begins." },
          { t: "The Pack Separates", c: "Week 4: Plant B falls behind. 78% vs 89-92% for the others. The gap wasn't sudden — it opened 2% per week. A slow fade, not a collapse." },
          { t: "Position Changes", c: "Plant A leads at 89%. Plant C closes in at 86%. Plant D holds steady at 83%. Plant B is alone at 78% — 11 points behind the leader." },
          { t: "The Race Analysis", c: "Plant B's deficit: 17 percentage points × 90 days = 1,530 tonnes below target. If Plant B ran at Plant A's pace, revenue gap closes by ₹12.4 Cr." },
        ],
      },
      {
        name: "Balance Sheet", icon: "balance",
        stories: [
          { t: "The Scales", c: "Each plant as a balance: output on the left pan, resource consumption on the right. When balanced, you're efficient. When tilted, you're burning." },
          { t: "The Efficient Plant", c: "Plant C: 86% output with 84% resource utilization. The scale tips slightly left — producing more than it consumes proportionally. Best efficiency ratio." },
          { t: "The Imbalanced Plant", c: "Plant B: 78% output but 93% resource utilization. The scale tips hard right — consuming disproportionately. Energy, labor, and materials flowing in; less coming out." },
          { t: "The Efficiency Gap", c: "Plant B's imbalance: 15% efficiency gap. If it matched Plant C's ratio, same resources would yield 91% output instead of 78%. It's not a capacity problem — it's a conversion problem." },
        ],
      },
      {
        name: "Constellation", icon: "stars",
        stories: [
          { t: "The KPI Stars", c: "Each plant is a cluster of stars — output, quality, efficiency, uptime, safety. Tight cluster: the plant is aligned. Scattered: something's off." },
          { t: "The Tight Cluster", c: "Plant A: all 5 stars within a tight radius. 89% output, 97% quality, 88% efficiency, 91% uptime, 99.2% safety. A healthy constellation." },
          { t: "The Scattered Cluster", c: "Plant B: output star drifts far left (78%). Uptime star drops low (72%). But quality is still tight (96%). The constellation is breaking apart along operational axes." },
          { t: "The Diagnostic Map", c: "Plant B's scatter pattern matches a known archetype: 'equipment-limited.' Quality holds but throughput suffers. Fix the uptime star, and the constellation tightens." },
        ],
      },
    ],
  },

  factory_map: {
    label: "Steel Production Flow", code: "FLOW", accent: C.cyan, sourceLayer: "dashboard",
    lenses: [
      {
        name: "Material Journey", icon: "journey",
        stories: [
          { t: "The Raw Ingredient", c: "Iron ore enters at the gate. Batch 4471 from Supplier X: 62% Fe content, Si 0.34%. This batch will become automotive-grade steel — or it won't." },
          { t: "The Transformation", c: "BF-3 reduces the ore. 1,502°C. Carbon bonds break. Slag separates. The ore becomes hot metal. Chemistry is set here — everything downstream inherits it." },
          { t: "The Refinement", c: "SMS → CCM → HSM. Liquid metal → solid slab → thin strip. Each stage narrows the material's destiny. By CCM, the automotive grade is at 74% probability." },
          { t: "The Final Product", c: "QC Lab stamps the coil. 18 hours from ore to product. 5 transformations, 847 sensor readings, 23 decision points. One batch's complete biography." },
        ],
      },
      {
        name: "Bottleneck Pulse", icon: "pulse",
        stories: [
          { t: "The Flow Rate", c: "Material moves through 5 zones. Each zone has a throughput pulse. When all zones pulse in sync, the factory flows. Right now, one zone stutters." },
          { t: "The Bottleneck", c: "BF-3 output: 1,502°C, 78% of target rate. The pulse is slow here. Upstream (ore yard) is backed up. Downstream (SMS) is starving." },
          { t: "The Pressure Differential", c: "Ore yard: 112% buffer. BF-3: 78% throughput. SMS: 64% feed rate. The pressure drops across BF-3 like a valve that's half-closed." },
          { t: "The Cardiovascular View", c: "Factory as circulatory system: BF-3 is the constricted artery. Blood (material) pools upstream, organs (downstream) are oxygen-deprived. Treatment: clear the constriction." },
        ],
      },
      {
        name: "Time Machine", icon: "time",
        stories: [
          { t: "Morning Shift — 06:00", c: "The factory wakes up. All 5 zones ramp simultaneously. By 07:00, steady state. Flow arrows pulse evenly. This is the golden hour." },
          { t: "The Disruption — 10:00", c: "M21 first fault. Line 3 flow stutters. The map shows the first amber zone. Production continues around it — but the pattern shifts." },
          { t: "Cascade — 14:00", c: "Four hours of accumulated disruption. BF-3 amber, CCM-3 red, HSM-1 compensating. The map is a mosaic of green, amber, and red." },
          { t: "End of Shift — 18:00", c: "12 hours elapsed. The time machine reveals: 6 hours of green, 2 hours of amber, 4 hours of red. The shift started perfect and ended fractured." },
        ],
      },
    ],
  },

  // ── PlantDrilldown Cards ──
  output_line: {
    label: "Output by Line", code: "PLT-B", accent: C.blue, sourceLayer: "plantB",
    lenses: [
      {
        name: "Rhythm Strip", icon: "ekg",
        stories: [
          { t: "Five Heartbeats", c: "Five production lines, five rhythms. Each line's output traces an EKG — steady beats mean steady production. Listen to the factory's pulse." },
          { t: "The Healthy Lines", c: "Lines 1, 2, 4, 5: steady rhythm, 79-91% output. Regular intervals, minimal variance. These hearts beat strong." },
          { t: "The Arrhythmia", c: "Line 3: 42% output. The rhythm is broken — long flatlines (downtime) interrupted by brief spikes (recovery attempts). Classic intermittent failure pattern." },
          { t: "Rhythm Correlation", c: "When Line 3 flatlines at hour 3, Line 4 shows a compensatory spike at hour 4. The rhythms are coupled — one line's silence makes another work harder." },
        ],
      },
      {
        name: "Capacity Glacier", icon: "glacier",
        stories: [
          { t: "The Ice Columns", c: "Each line as a glacier: full height is max capacity. Current output melts from the top. More melt = more wasted potential." },
          { t: "The Stable Ice", c: "Line 2: 91% — only 9% melted. A towering column of productive capacity. Minimal waste, near-theoretical output." },
          { t: "The Melting Column", c: "Line 3: 42% — more than half the glacier is gone. 58% of capacity melted away. The exposed rock beneath is pure lost production." },
          { t: "Headroom Analysis", c: "Total plant headroom: Lines 1-5 have 68 tonnes/shift of untapped capacity. 73% of that sits in Line 3 alone. Fix one line, recover most of the plant." },
        ],
      },
      {
        name: "Handoff Chain", icon: "handoff",
        stories: [
          { t: "The Chain", c: "Lines aren't islands — material flows between them. Line 1 feeds Line 2's input. Line 3 feeds Line 4. When one link weakens, the chain feels it." },
          { t: "The Healthy Handoff", c: "Line 1 → Line 2: clean handoff. 88% feeds 91%. Output matches input capacity. The chain link is strong." },
          { t: "The Broken Link", c: "Line 3 → Line 4: broken handoff. Line 3 outputs 42% — Line 4 expects 85%. A queue builds, then empties. Feast and famine." },
          { t: "Chain Tension Map", c: "Two chain segments under tension. Fix Line 3 and both segments relax. The entire plant's rhythm stabilizes from one repair." },
        ],
      },
    ],
  },

  fault_count: {
    label: "Fault Count", code: "24H", accent: C.red, sourceLayer: "plantB",
    lenses: [
      {
        name: "Fault Tree", icon: "tree",
        stories: [
          { t: "The Trunk", c: "12 faults in 24 hours. The trunk of the tree: one root system feeds all these branches. Let's trace downward." },
          { t: "The Main Branch", c: "7 faults on M21 form the dominant branch. This machine is responsible for 58% of all faults. The branch is heavy with fruit — bad fruit." },
          { t: "The Side Branches", c: "M18: 2 faults. M15, M22, M08: 1 each. Smaller branches, potentially independent. Or are they connected to the M21 trunk?" },
          { t: "Root Exposure", c: "The root: bearing assembly replaced 6 days ago with non-OEM part. M21's branch grows from this root. M18's branch shares the root — same maintenance window." },
        ],
      },
      {
        name: "Severity Spectrum", icon: "spectrum",
        stories: [
          { t: "The White Light", c: "12 faults enter the prism. They look the same in count. But severity is not count — let's split the light." },
          { t: "The Spectrum", c: "Red band (critical): 2 faults, 96 minutes downtime. Amber (moderate): 4 faults, 31 minutes. Green (minor): 6 faults, 11 minutes. Few but devastating vs many but trivial." },
          { t: "The Focused Beam", c: "The 2 critical faults are both M21. They account for 69% of all downtime minutes despite being only 17% of fault count. Severity concentrates." },
          { t: "The Priority Lens", c: "If you fix by count, you'd spread across 7 machines. If you fix by severity, you'd focus on 1 machine. The spectrum says: ignore the green scatter, fix the red beam." },
        ],
      },
      {
        name: "Repeat Offenders", icon: "mugshot",
        stories: [
          { t: "The Lineup", c: "7 machines involved in today's faults. Some are first-time offenders. Some have a record. Let's check the files." },
          { t: "The Serial Offender", c: "M21: 7 faults today, 12 in the past week, 23 in the past month. A clear escalation pattern. This machine has been crying for help." },
          { t: "The Associates", c: "M18 faults correlate with M21 at 73%. They share a material feed line. When M21 jams, M18 gets irregular input. Connected through infrastructure." },
          { t: "The Case File", c: "M21 case history: stable 18 months → bearing swap 6 days ago → fault rate 4x increase. Clear inflection point. Clear suspect. Clear fix." },
        ],
      },
    ],
  },

  material_dep: {
    label: "Material Dependency", code: "DEP", accent: C.cyan, sourceLayer: "plantB",
    lenses: [
      {
        name: "Vulnerability Scan", icon: "vuln",
        stories: [
          { t: "The Dependency Graph", c: "Line 3 depends on 4 material inputs: iron ore (Supplier X), coke (internal), flux (Supplier Y), alloy additions (Supplier Z). A web of dependencies." },
          { t: "Single Point of Failure", c: "Supplier X: sole source for iron ore. If they fail, buffer is 14 hours. No backup active. This node glows red — it's the vulnerability." },
          { t: "Cascade Simulation", c: "Simulating Supplier X failure: BF-3 stops at hour 14. SMS stops at hour 18. CCM idle by hour 20. Full line shutdown in 20 hours." },
          { t: "The Resilience Score", c: "Line 3 resilience: 2.1/5 (critical). Single-source dependency on primary input. Recommendation: activate dual-sourcing within 30 days." },
        ],
      },
      {
        name: "Cost Current", icon: "cost",
        stories: [
          { t: "The Input Costs", c: "Material flows carry cost. Iron ore: ₹8,400/tonne. Coke: ₹12,200/tonne. Flux: ₹3,100/tonne. The current starts with a price tag." },
          { t: "Value Addition", c: "BF-3 transforms ₹23,700 of inputs into hot metal worth ₹31,400. Value added: ₹7,700/tonne. This is where cost becomes product." },
          { t: "The Cost Spike", c: "Supplier X delay adds holding cost: ₹180/tonne/hour × 12 hours = ₹2,160/tonne premium. The cost current surges at the bottleneck." },
          { t: "Total Cost of Disruption", c: "Direct: ₹2,160/tonne premium. Indirect: ₹4,800/tonne in lost throughput. Total: ₹6,960/tonne. On 51 tonnes lost: ₹3.55 Cr impact." },
        ],
      },
      {
        name: "Quality Inheritance", icon: "quality",
        stories: [
          { t: "The Genetic Code", c: "Every material input carries quality DNA. Iron ore chemistry, coke reactivity, flux composition. These genes express themselves in the final product." },
          { t: "Dominant Genes", c: "Silicon content from Supplier X: dominant gene. It sets BF-3 chemistry, which sets superheat, which sets solidification. One input parameter → three generations of impact." },
          { t: "Mutation Amplification", c: "Si +0.12% at input (small mutation) → superheat -12°C at BF (amplified) → casting rate -8% at CCM (further amplified). Quality mutations don't dampen; they grow." },
          { t: "The Inheritance Map", c: "Full quality genealogy: Supplier X Si variance → BF-3 superheat drop → CCM-3 rate reduction → HSM-1 thickness variance → QC defect. 5 generations, one ancestor." },
        ],
      },
    ],
  },
};

/* ─── AI_AGENT_DATA ─── Simulated AI agent responses ─── */
export const AI_AGENT_DATA = {
  explanations: {
    // Layer-level defaults
    dashboard: "You're viewing the Enterprise Command Center. Production is tracking 8% below expected output, concentrated in Plant B. Key risk signals: Line 3 downtime and a 12-hour Supplier X delay.",
    plantB: "Plant B, Jamshedpur — Line 3 accounts for 73% of the production shortfall. Machine M21 shows repeated mechanical faults. Compounded by Supplier X's delayed iron ore shipment.",
    zones: "Line 3 production zones — BF-3 and CCM-3 show alerts. They're connected through the active causal chain: Supplier X → BF-3 → CCM-3 → Grade Risk at 59% compound confidence.",
    // Zone / card explanations
    bf: "Blast Furnace BF-3 — superheat has dropped to 22°C (target 34°C). Root cause traces to Supplier X's silicon-rich iron ore batch. 92% confidence in this causal link.",
    sms: "Steel Melting Shop BOF-2 — operating within normal parameters. 40 sensors monitor the vessel in real-time. Sensor 27 (off-gas CO₂) is the leading indicator to watch.",
    cc: "Continuous Casting CCM-3 — casting speed reduced due to upstream superheat drop. This single event reaches four different decision-makers, each with their own view.",
    rm: "Rolling Mill HSM-1 — yield at 97.1%. Confidence landscape shows calibrated predictions: when the model says 80%, it means 80%. 847 past decisions refined this.",
    ql: "Quality Lab QC — 94.2% pass rate, defect rate 0.8/1K. Decision journal tracks 847 quality decisions over 18 months, showing improving calibration.",
    downtime: "8 downtime events on Line 3 in the last shift. Machine M21 accounts for 4 events (73% of downtime minutes). Root cause: non-OEM bearing replacement 6 days ago.",
    prod_trend: "Production tracking 8% below target today. The gap opened at 11:00 and widened through the afternoon. 73% attributable to Line 3 downtime.",
    machine_util: "Machine utilization across Line 3 is bimodal — Lines 1,2,4,5 pulse at 85-91%, while Line 3 stutters at 42%. Line 4 is compensating at 94%.",
    supplier: "Supplier X — Iron Ore Batch 4471 delayed 12 hours. BF-3 buffer drops to 2 hours, triggering feed rate reduction. Single-source dependency risk.",
    defect_rate: "Defect rate trending up on weekends — Sunday hit 1.1%. Edge wave defects spike during Saturday night shift handover. Investigation target: 22:00 crew change.",
    plant_perf: "Plant B at 78% vs 89-92% for other plants. The deficit: 17 percentage points × 90 days = 1,530 tonnes below target. Equipment-limited archetype.",
    factory_map: "Steel production flow: iron ore enters BF-3, transforms through SMS, CCM, HSM to QC. Current bottleneck at BF-3 due to feed composition variance.",
    output_line: "Line 3 output at 42% — the lowest of 5 lines. Lines 1,2,4,5 range 79-91%. Line 4 absorbing overflow at 94%, creating compensatory stress.",
    fault_count: "12 faults in 24 hours across Line 3. M21 dominates with 7 faults (58%). Severity concentration: 2 critical faults on M21 account for 69% of all downtime minutes.",
    material_dep: "Line 3 depends on Supplier X for 68% of iron ore. Single-source risk with 14-hour buffer. If they fail completely, full line shutdown in 20 hours.",
  },

  suggestions: {
    dashboard: [
      { label: "Plant B Drill-down", icon: "⇉", action: "goToPlantB" },
      { label: "Root Cause · BF-3", icon: "⊶", action: "enterStory", arg: "bf" },
      { label: "Downtime Events", icon: "⛏", action: "enterStory", arg: "downtime" },
      { label: "Supplier Risk", icon: "◎", action: "enterStory", arg: "supplier" },
    ],
    plantB: [
      { label: "Line 3 Zones", icon: "◎", action: "goToZones" },
      { label: "Fault Analysis", icon: "⌥", action: "enterStory", arg: "fault_count" },
      { label: "Material Dependency", icon: "⚡", action: "enterStory", arg: "material_dep" },
      { label: "Output by Line", icon: "≡", action: "enterStory", arg: "output_line" },
    ],
    zones: [
      { label: "BF-3 Causal Chain", icon: "⊶", action: "enterStory", arg: "bf" },
      { label: "CCM-3 Adaptive", icon: "✧", action: "enterStory", arg: "cc" },
      { label: "Quality Journal", icon: "◉", action: "enterStory", arg: "ql" },
    ],
    bf: [
      { label: "Heat Profile Lens", icon: "△", action: "enterStoryLens", arg: "bf", lens: 1 },
      { label: "Feed Variance Lens", icon: "◇", action: "enterStoryLens", arg: "bf", lens: 2 },
      { label: "CCM-3 Downstream", icon: "✧", action: "enterStory", arg: "cc" },
    ],
    sms: [
      { label: "Signal Decay Lens", icon: "~", action: "enterStoryLens", arg: "sms", lens: 1 },
      { label: "Correlation Web", icon: "◎", action: "enterStoryLens", arg: "sms", lens: 2 },
      { label: "BF-3 Upstream", icon: "⊶", action: "enterStory", arg: "bf" },
    ],
    cc: [
      { label: "Response Map Lens", icon: "◎", action: "enterStoryLens", arg: "cc", lens: 1 },
      { label: "Priority Stack", icon: "≡", action: "enterStoryLens", arg: "cc", lens: 2 },
      { label: "Rolling Mill Next", icon: "△", action: "enterStory", arg: "rm" },
    ],
    rm: [
      { label: "Decision Grid", icon: "▦", action: "enterStoryLens", arg: "rm", lens: 1 },
      { label: "Calibration Arc", icon: "◠", action: "enterStoryLens", arg: "rm", lens: 2 },
      { label: "Quality Lab", icon: "◉", action: "enterStory", arg: "ql" },
    ],
    ql: [
      { label: "Outcome Map", icon: "◎", action: "enterStoryLens", arg: "ql", lens: 1 },
      { label: "Frequency Dial", icon: "◑", action: "enterStoryLens", arg: "ql", lens: 2 },
      { label: "Defect Rate", icon: "◇", action: "enterStory", arg: "defect_rate" },
    ],
    downtime: [
      { label: "Pattern Weave", icon: "◎", action: "enterStoryLens", arg: "downtime", lens: 1 },
      { label: "Cost River", icon: "~", action: "enterStoryLens", arg: "downtime", lens: 2 },
      { label: "Fault Analysis", icon: "⌥", action: "enterStory", arg: "fault_count" },
    ],
    prod_trend: [
      { label: "Pressure Map", icon: "◎", action: "enterStoryLens", arg: "prod_trend", lens: 1 },
      { label: "Gap Anatomy", icon: "◇", action: "enterStoryLens", arg: "prod_trend", lens: 2 },
      { label: "Machine Utilization", icon: "▦", action: "enterStory", arg: "machine_util" },
    ],
    machine_util: [
      { label: "Shadow Shift", icon: "◐", action: "enterStoryLens", arg: "machine_util", lens: 1 },
      { label: "Domino Cascade", icon: "⬡", action: "enterStoryLens", arg: "machine_util", lens: 2 },
      { label: "Downtime Events", icon: "⛏", action: "enterStory", arg: "downtime" },
    ],
    supplier: [
      { label: "Trust Erosion", icon: "◎", action: "enterStoryLens", arg: "supplier", lens: 1 },
      { label: "Alternatives Map", icon: "⬢", action: "enterStoryLens", arg: "supplier", lens: 2 },
      { label: "Material Dependency", icon: "⚡", action: "enterStory", arg: "material_dep" },
    ],
    defect_rate: [
      { label: "Upstream Trace", icon: "⟵", action: "enterStoryLens", arg: "defect_rate", lens: 1 },
      { label: "Batch Fingerprint", icon: "⊞", action: "enterStoryLens", arg: "defect_rate", lens: 2 },
      { label: "Quality Lab", icon: "◉", action: "enterStory", arg: "ql" },
    ],
    plant_perf: [
      { label: "Balance Sheet", icon: "⚖", action: "enterStoryLens", arg: "plant_perf", lens: 1 },
      { label: "Constellation View", icon: "✦", action: "enterStoryLens", arg: "plant_perf", lens: 2 },
      { label: "Plant B Drill-down", icon: "⇉", action: "goToPlantB" },
    ],
    factory_map: [
      { label: "Bottleneck Pulse", icon: "◎", action: "enterStoryLens", arg: "factory_map", lens: 1 },
      { label: "Time Machine", icon: "◷", action: "enterStoryLens", arg: "factory_map", lens: 2 },
      { label: "Production Trend", icon: "△", action: "enterStory", arg: "prod_trend" },
    ],
    output_line: [
      { label: "Capacity Glacier", icon: "▲", action: "enterStoryLens", arg: "output_line", lens: 1 },
      { label: "Handoff Chain", icon: "⊶", action: "enterStoryLens", arg: "output_line", lens: 2 },
      { label: "Line 3 Zones", icon: "◎", action: "goToZones" },
    ],
    fault_count: [
      { label: "Severity Spectrum", icon: "◇", action: "enterStoryLens", arg: "fault_count", lens: 1 },
      { label: "Repeat Offenders", icon: "⊞", action: "enterStoryLens", arg: "fault_count", lens: 2 },
      { label: "Downtime Events", icon: "⛏", action: "enterStory", arg: "downtime" },
    ],
    material_dep: [
      { label: "Cost Current", icon: "~", action: "enterStoryLens", arg: "material_dep", lens: 1 },
      { label: "Quality Inheritance", icon: "◇", action: "enterStoryLens", arg: "material_dep", lens: 2 },
      { label: "Supplier Status", icon: "◎", action: "enterStory", arg: "supplier" },
    ],
  },

  cannedResponses: [
    { keywords: ["why", "downtime", "line 3"], response: "Line 3 downtime is primarily driven by Machine M21, which has 7 faults in 24 hours. The root cause is a non-OEM bearing installed 6 days ago. Fixing this single part could recover 73% of lost downtime minutes." },
    { keywords: ["supplier", "delay", "late"], response: "Supplier X's Iron Ore Batch 4471 is delayed 12 hours. This affects BF-3's feed buffer, dropping it to 2 hours and triggering a feed rate reduction. Estimated revenue exposure: ₹1.8 Cr." },
    { keywords: ["confidence", "causal", "chain"], response: "The active causal chain runs: Supplier X (92%) → BF-3 (87%) → CCM-3 (74%) → Grade Risk (59%). Compound confidence is 59% — honest uncertainty, not false precision." },
    { keywords: ["quality", "defect"], response: "Defect rate is trending up on weekends — Sunday hit 1.1%. Edge wave defects spike during Saturday night shift handover at 22:00. The defect DNA traces back to Supplier X's batch composition." },
    { keywords: ["machine", "M21", "fault"], response: "M21 has escalated from stable to 7 faults/day over 6 days. The inflection point: a bearing replacement with a non-OEM part. Fix: replace with OEM bearing. Expected recovery: 73% of Line 3 downtime." },
    { keywords: ["temperature", "superheat", "furnace"], response: "BF-3 superheat dropped from 34°C to 22°C. The thermal anomaly correlates with Supplier X's silicon-rich ore batch — different chemistry creates a cold zone that migrates clockwise in the furnace." },
    { keywords: ["plant", "performance", "compare"], response: "Plant A leads at 89%, followed by C (86%), D (83%), and B (78%). Plant B's deficit equals 1,530 tonnes below target over 90 days. The archetype is 'equipment-limited' — fix uptime, and throughput recovers." },
    { keywords: ["risk", "exposure", "cost"], response: "Current risk exposure: Supplier X delay (₹1.8 Cr), Line 3 downtime (₹4.2 Cr from 127 minutes lost production), and automotive grade risk (₹2.1 Cr). Total at-risk: approximately ₹8.1 Cr." },
    { keywords: ["sensor", "anomaly", "signal"], response: "Sensor 27 (off-gas CO₂) is diverging — a slow drift from 14.2% to 15.8%. Traditional alert fires at minute 14, but decay detection catches it at minute 8. That's 6 minutes of advance warning." },
    { keywords: ["casting", "CCM", "speed"], response: "CCM-3 casting speed reduced to 1.2 m/min due to superheat drop. Automotive-grade probability down to 74%. Four roles see this event differently — operator, supervisor, engineer, director." },
    { keywords: ["what", "looking", "this"], response: "You're exploring the Enterprise Brain — an adaptive intelligence platform monitoring Tata Steel Jamshedpur operations. Each panel tells a story. Click any highlighted area to dive deeper into its intelligence layer." },
    { keywords: ["help", "how", "navigate"], response: "Click any panel to enter its story mode. Stories have multiple lenses — different perspectives on the same event. Use the suggestion chips above to jump to related insights. The AI agent follows your context." },
    { keywords: ["silicon", "ore", "material", "feed"], response: "Supplier X's latest batch has silicon at 0.34% — 0.12% above spec (96th percentile). This changes slag chemistry in BF-3, reducing heat transfer efficiency by 8%. The feed told the story before the furnace did." },
    { keywords: ["shift", "weekend", "saturday", "sunday"], response: "Weekend pattern detected: edge wave defects spike from 10% (Friday) to 60% (Sunday). The mutation occurs around Saturday 22:00 shift handover. Crew experience differential is the likely trigger." },
    { keywords: [], response: "I can help with questions about production, downtime, supplier status, quality, machine faults, or any zone on Line 3. Try asking about a specific topic like 'why is Line 3 down?' or 'what's the supplier risk?'" },
  ],
};

export const HEATMAP_DATA = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 12 }, (_, col) => {
    if (row === 2 && col >= 1 && col <= 4) return 0.2 + Math.random() * 0.3;
    return 0.6 + Math.random() * 0.35;
  })
);

export const DOWNTIME_EVENTS = [
  { time: 2.2, duration: 0.3, machine: "M21" },
  { time: 2.8, duration: 0.5, machine: "M21" },
  { time: 3.5, duration: 0.4, machine: "M18" },
  { time: 4.1, duration: 0.6, machine: "M21" },
  { time: 5.0, duration: 0.3, machine: "M21" },
  { time: 5.5, duration: 0.2, machine: "M22" },
  { time: 9.2, duration: 0.3, machine: "M15" },
  { time: 14.0, duration: 0.2, machine: "M08" },
];

export const PRODUCTION_HOURS = Array.from({ length: 13 }, (_, i) => i + 6);
export const PRODUCTION_EXPECTED = PRODUCTION_HOURS.map(h => 40 + h * 4.2);
export const PRODUCTION_ACTUAL = PRODUCTION_HOURS.map((h, i) =>
  i < 5
    ? PRODUCTION_EXPECTED[i] - 1 + Math.random() * 2
    : PRODUCTION_EXPECTED[i] - (i - 4) * 3.5 + Math.random() * 2
);

export const DEFECT_DATA = [
  { day: "Mon", rate: 0.5 },
  { day: "Tue", rate: 0.4 },
  { day: "Wed", rate: 0.6 },
  { day: "Thu", rate: 0.5 },
  { day: "Fri", rate: 0.45 },
  { day: "Sat", rate: 0.8 },
  { day: "Sun", rate: 1.1 },
];
