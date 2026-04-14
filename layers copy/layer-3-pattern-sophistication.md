# Layer 3 — Pattern Sophistication

> How individual widgets combine into meaningful compositions. A pattern is a layout of multiple widgets that, together, answer a class of question better than any single widget could. This layer governs composition, not rendering (Layer 2) or encoding (Layer 1).

---

## 3.1 — Core Principle

A dashboard is not a collection of charts. It is a structured argument — a set of visual evidence arranged to guide the user toward an answer or a decision. Patterns are the grammar of that argument. Each pattern has a thesis (the question it answers), a focal widget (the primary evidence), and supporting widgets (context, comparison, detail).

A single widget can tell you *what* happened. A pattern can tell you *what happened, whether it matters, and where to look next.*

### The Composition Invention Principle

The six pattern archetypes and six dashboard archetypes in this layer are a **vocabulary of proven compositions, not a closed grammar.** When the data story demands a composition that doesn't fit these archetypes, compose a new one.

The process:

1. **Define the thesis.** What question does this composition answer? If you can't state it in one sentence, the composition is unfocused.

2. **Identify the focal element.** Every composition has one — the widget, canvas, or scroll sequence that carries the primary evidence. It gets ≥50% of the visual space. If there's no focal element, it's a grid of charts, not a composition.

3. **Satisfy the five composition principles (§3.2).** Spatial proximity = analytical proximity. Shared encoding consistency. Information hierarchy. Whitespace as structure. Reading order integrity. These are non-negotiable regardless of how novel the composition is.

4. **Document the composition.** When you invent a new pattern, add a brief comment: what thesis it answers, what the focal element is, what mode it uses (grid, scroll-driven, immersive), and why existing archetypes didn't fit.

**Examples of valid composition invention:**

- **Branching analysis path:** The user faces a diagnostic fork — "Is the issue supply-side or demand-side?" Two branches, each containing its own widget set. The user chooses a path and the relevant branch expands. Neither Overview + Detail nor Correlation Exploration covers this — it's a decision-tree composition.

- **Concentric zoom:** An immersive Canvas starts at the system level, the user clicks an entity to zoom in (smooth animated zoom, not a view switch), revealing a layer of sub-entities with their own metrics. Clicking further zooms to individual records. The entire experience is one continuous zoom on a single Canvas — not discrete views. This is a legitimate composition mode when the data is hierarchical and spatial.

- **Parallel investigation:** Two scroll-driven narratives run side by side, each telling the story of a different entity (Facility A vs Facility B). The user scrolls them in sync. Shared time axis, independent visualizations, cross-highlighting when both narratives reference the same variable. No existing archetype covers synchronized parallel narratives.

- **Reveal sequence:** A full-viewport Canvas visualisation starts almost empty. As the user scrolls, data points appear progressively — first the overall distribution, then clusters emerge, then outliers highlight, then connections form. The entire composition is a single progressive reveal. The Pudding does this constantly.

**Invalid composition invention:**
- A layout with no focal element (five equal-sized charts in a grid — that's a report page, not a composition)
- A composition that violates reading order (detail above summary, conclusion before evidence)
- Using novelty to dodge the five composition principles

The five composition principles (§3.2) are the laws of physics. Archetypes are architectural styles. You can design a building that doesn't look like any historical style, but it still has to obey gravity.

---

## 3.2 — Composition Principles

These principles are mandatory. Every pattern must satisfy all five. If a proposed layout violates any principle, the constraint framework (Layer 6) must restructure it.

### 3.2.1 — Spatial Proximity = Analytical Proximity

Widgets placed near each other must share analytical context — the same entity, the same time range, the same question. If two widgets answer unrelated questions, they belong in separate patterns, not adjacent cells in the same grid.

**Test:** Can you write a single sentence that describes what *both* widgets contribute to? If yes, they belong together. If the sentence requires "and also, separately," they belong apart.

**Implementation:**
- Widgets within a pattern: 12–16px gap
- Patterns within a dashboard: 24–32px gap (or a subtle horizontal rule / whitespace band)
- Never place a revenue chart next to a hiring funnel unless the analytical question explicitly connects them

### 3.2.2 — Shared Encoding Consistency

When two widgets in a pattern encode the same dimension, they must use identical:
- Scale (same min/max, same axis range)
- Color mapping (same category → same hue)
- Number formatting (same units, same magnitude suffix)
- Time range (if both show temporal data, they cover the same period)

Inconsistency within a pattern is a defect, not a style choice. A user who reads "Q3" as blue in one chart and green in another will misread the data.

**Implementation:**
- Shared color map object passed to all widgets in the pattern
- Shared axis domain computed from the union of all datasets in the pattern
- If one widget has a different natural range (e.g., a percentage vs. an absolute number), use separate y-axes but synchronise the x-axis

### 3.2.3 — Information Hierarchy

Every pattern has exactly one focal widget and one or more supporting widgets. The focal widget answers the primary question. Supporting widgets provide context, comparison, or drill-down entry points.

**Focal widget:**
- Largest visual footprint (≥50% of pattern area)
- Highest richness tier in the pattern (if the pattern mixes T2 and T1, the focal is T2)
- Positioned at the top-left or center of the pattern (left-to-right, top-to-bottom reading order)

**Supporting widgets:**
- Smaller visual footprint
- Lower or equal richness tier
- Positioned around the focal widget — above (summary), below (detail), right (comparison)

**Test:** If you removed the focal widget, would the pattern still make sense? If yes, the focal widget is wrong — it should be the one that, if removed, makes the pattern meaningless.

### 3.2.4 — Whitespace as Structure

Grouping is established through proximity and shared headers, not boxes and borders. Card wrappers are used only for T1 metric cards and data record widgets. Charts and tables within a pattern flow in open whitespace.

**Implementation:**
- No card borders around individual charts within a pattern
- Pattern-level header: 16px, weight 500, primary text color, positioned above the pattern
- Pattern-level subtitle: 13px, weight 400, secondary text color, below the header
- Inter-widget gap within a pattern: 12–16px
- Inter-pattern gap: 24–32px

### 3.2.5 — Reading Order Integrity

The pattern must be readable in natural reading order (left-to-right, top-to-bottom for LTR locales). The user should encounter the focal widget first, then supporting context, then detail.

**Implementation:**
- Focal widget: top or top-left
- Summary/KPI row: above the focal (if present)
- Detail table or breakdown: below the focal
- Comparison/benchmark: right of the focal (or below on narrow viewports)
- Never place a detail view above its summary — this inverts the reading hierarchy

---

## 3.3 — Pattern Archetypes (Extensible)

Six canonical patterns cover the majority of analytical questions. Each archetype is defined by its thesis, its structure, and its component widgets. When the data demands a composition that doesn't fit these six, invent one per the Composition Invention Principle (§3.1).

### 3.3.1 — Overview + Detail

**Thesis:** "What's the headline, and what's the evidence?"

**Structure:**
```
┌──────────────────────────────────────┐
│ KPI Row (T1) — 3–5 summary metrics  │
├──────────────────────────────────────┤
│                                      │
│    Focal: Bar/Line Chart (T2/T3)     │
│                                      │
├──────────────────────────────────────┤
│ Detail: Data Table (T2/T3)           │
│ — sortable, expandable rows          │
└──────────────────────────────────────┘
```

**Component rules:**
- KPI row: 3–5 cards, each showing a different aggregate of the same dataset (total, average, max, change vs. prior period). Cards are linked — clicking a KPI card may filter the focal chart.
- Focal chart: encodes the primary dimension. Time-series line for temporal questions. Bar chart for categorical comparison.
- Detail table: shows the row-level data behind the chart. Sortable by any column. If the chart supports selection, the table filters to the selected subset.

**When to use:** Reporting dashboards, executive summaries, performance reviews. The default pattern when no specific analytical question is articulated.

**Widget inventory for this pattern:**

| Position | Widget | Tier | Role |
|----------|--------|------|------|
| Top row | 3–5 KPI Cards | T1 | Summary anchor |
| Center | Bar or Line Chart | T2–T3 | Focal evidence |
| Bottom | Data Table | T2–T3 | Detail / lookup |

### 3.3.2 — Comparison Grid

**Thesis:** "How does X vary across Y?"

**Structure:**
```
┌───────────┬───────────┬───────────┐
│  Facet A  │  Facet B  │  Facet C  │
│  (Chart)  │  (Chart)  │  (Chart)  │
├───────────┼───────────┼───────────┤
│  Facet D  │  Facet E  │  Facet F  │
│  (Chart)  │  (Chart)  │  (Chart)  │
└───────────┴───────────┴───────────┘
```

**Component rules:**
- All facets are the same chart type (same encoding, same scales, same axis ranges)
- Each facet represents one value of a categorical dimension (region, product, cohort)
- Maximum facets per view: 12 (4×3 grid). Beyond 12, introduce pagination or a filter dropdown to select visible facets
- Facet titles: 13px, secondary text, positioned above each mini-chart
- Shared legend: single legend above or below the grid, not repeated in each facet
- Shared axes: y-axis labels on the leftmost column only, x-axis labels on the bottom row only (to reduce repetition)

**When to use:** Regional comparison, cohort analysis, A/B test results across segments. The user wants to see the same question answered for multiple categories simultaneously.

### 3.3.3 — Metric + Context

**Thesis:** "What's the number, and should I care?"

**Structure:**
```
┌──────────────────┬─────────────────┐
│  KPI Card (T1)   │ Sparkline (T1)  │
│  Primary metric  │ Trend context   │
├──────────────────┴─────────────────┤
│ Comparison: Bar chart showing      │
│ metric vs. benchmark / prior period│
├────────────────────────────────────┤
│ Distribution: Histogram showing    │
│ where the metric sits in range     │
└────────────────────────────────────┘
```

**Component rules:**
- KPI card: the single most important number, rendered at maximum prominence
- Sparkline: 90-day or 12-month trend of the same metric, giving temporal context
- Comparison: bar chart or bullet chart showing the metric against a benchmark, target, or prior period. Uses diverging color (green if above target, red if below)
- Distribution: histogram or box plot showing where the current value sits within its historical or peer range

**When to use:** Single-metric deep-dive. Often the entry point when a user clicks a KPI on a monitoring dashboard.

### 3.3.4 — Flow + Breakdown

**Thesis:** "Where in the pipeline is the drop-off, and why?"

**Structure:**
```
┌────────────────────────────────────┐
│ Sankey / Funnel (T3)               │
│ — showing flow from stage to stage │
├──────────┬─────────────────────────┤
│ Stage 1  │ Stage 2 breakdown       │
│ breakdown│ (bar chart or table)    │
│ (table)  │                         │
└──────────┴─────────────────────────┘
```

**Component rules:**
- Focal: Sankey diagram or funnel chart showing the full process flow. Each stage is labeled with absolute count and conversion rate.
- Breakdown: one sub-widget per stage (or per selected stage, if interactive). Shows the dimensional breakdown within that stage — why are items dropping off? By channel? By segment?
- Clicking a stage in the Sankey/funnel activates the corresponding breakdown widget.

**When to use:** Sales pipeline, user onboarding funnel, supply chain tracking, incident resolution workflow.

### 3.3.5 — Correlation Exploration

**Thesis:** "What's the relationship between X and Y?"

**Structure:**
```
┌─────────────────────────────────────┐
│          ┌─────────────┐            │
│ Y-margin │             │            │
│ (histo)  │   Scatter   │            │
│          │   Plot      │            │
│          │   (T3)      │            │
│          └─────────────┘            │
│          X-margin (histogram)       │
├─────────────────────────────────────┤
│ Detail Table: selected points       │
│ (filters with brush selection)      │
├─────────────────────────────────────┤
│ Regression summary: r², slope,      │
│ trend line overlaid on scatter      │
└─────────────────────────────────────┘
```

**Component rules:**
- Focal: scatter plot with brush selection. Color encodes a third categorical dimension.
- Marginal distributions: histograms on x and y axes showing the distribution of each variable independently.
- Detail table: linked to the scatter — brushing a subset of points filters the table to those records.
- Regression overlay: optional trend line with r² annotation. Appears on toggle, not by default (to avoid implying causation).

**When to use:** Data exploration, hypothesis testing, identifying clusters and outliers.

### 3.3.6 — Temporal Narrative

**Thesis:** "What happened over time, and why?"

**Structure:**
```
┌────────────────────────────────────┐
│ Annotated Time-Series (T3)         │
│ — event markers, period highlights │
├──────────┬─────────────────────────┤
│ Period 1 │ Period 2 summary card   │
│ summary  │ (KPI delta from prior)  │
└──────────┴─────────────────────────┘
```

**Component rules:**
- Focal: annotated time-series line chart. Key events are marked with vertical lines and small label flags. Significant periods (e.g., "COVID lockdown," "product launch") are highlighted as shaded bands.
- Period summaries: T1 cards showing the aggregate metric for each annotated period, with change vs. prior period. Clicking a period card zooms the time-series to that interval.
- Annotations may be system-generated (anomaly detection flagging a spike) or user-defined (manually marking an event).

**When to use:** Post-mortem analysis, trend explanation, board reporting, any narrative that requires understanding *why* a metric changed at a specific time.

---

## 3.4 — Dashboard Archetypes

Dashboard archetypes are full-page compositions of multiple patterns. Each archetype serves a distinct analytical mode and maps to a decision context (Layer 5). These six cover common modes — extend when the data story demands a composition that doesn't fit.

### 3.4.1 — Monitoring Dashboard

**Decision context:** Operational, real-time, exception-driven.
**Target user:** Operations manager, SRE, control room operator.
**Primary richness:** T1 and T2.
**Primary patterns:** Metric + Context (repeated for each critical metric), Overview + Detail (for the primary operational flow).

**Layout:**
```
┌──────────────────────────────────────────┐
│ Alert Banner (if any threshold breached) │
├───────┬───────┬───────┬──────┬───────────┤
│ KPI 1 │ KPI 2 │ KPI 3 │KPI 4│ KPI 5     │
├───────┴───────┴───────┴──────┴───────────┤
│ Primary time-series (T2)                 │
├──────────────────┬───────────────────────┤
│ Secondary chart  │ Recent events table   │
└──────────────────┴───────────────────────┘
```

**Rules specific to monitoring:**
- Auto-refresh: data updates every 30s–5min depending on domain. No full-page reload — individual widgets update in place.
- Exception-first: breached thresholds elevate to the alert banner. Normal-state metrics are visually recessive. The most important thing on a monitoring dashboard is *what's wrong*, not *what's fine*.
- Color semantics dominate: green/amber/red status indicators on every KPI. Data palette is secondary.
- Minimal interaction: this dashboard is for watching, not exploring. T3 features are avoided — if the user needs to investigate, they drill into a dedicated analytical view.

### 3.4.2 — Analytical Dashboard

**Decision context:** Exploratory, filter-heavy, cross-dimensional.
**Target user:** Analyst, data scientist, product manager.
**Primary richness:** T2 and T3.
**Primary patterns:** Comparison Grid, Correlation Exploration.

**Layout:**
```
┌──────────────────────────────────────────┐
│ Filter Bar: dimension selectors, search  │
├───────────┬──────────────────────────────┤
│ Chart 1   │ Chart 2                      │
│ (faceted) │ (scatter / heatmap)          │
├───────────┴──────────────────────────────┤
│ Full data table (sortable, filterable)   │
└──────────────────────────────────────────┘
```

**Rules specific to analytical:**
- Filter bar is always visible at the top — this is the user's primary control surface
- All charts are cross-filtered: selecting a dimension in one chart propagates to all others
- Data table at the bottom shows the current filtered dataset — the user can always see the raw data
- No KPI row — the user doesn't want a summary, they want to explore

### 3.4.3 — Strategic Dashboard

**Decision context:** Scenario-based, forward-looking, narrative-driven.
**Target user:** Executive, board member, strategy lead.
**Primary richness:** T2 and T3.
**Primary patterns:** Temporal Narrative, Overview + Detail.

**Layout:**
```
┌──────────────────────────────────────────┐
│ KPI Row: 4-6 headline metrics            │
├──────────────────────────────────────────┤
│ Annotated time-series (focal)            │
│ — with scenario bands (optimistic/base)  │
├──────────────────────────────────────────┤
│ Commentary cards: narrative per period    │
└──────────────────────────────────────────┘
```

**Rules specific to strategic:**
- Annotation-heavy: every data point is contextualized with narrative text
- Scenario bands: future projections shown as confidence intervals or best/base/worst bands
- Minimal interaction — this is a read-once, present-to-others format. It should be legible as a static export (PDF/screenshot) without interaction.
- Time horizon: quarters or years, not days or hours

### 3.4.4 — Operational Dashboard

**Decision context:** Process-oriented, status-tracking, queue-based.
**Target user:** Team lead, project manager, service desk.
**Primary richness:** T1 and T2.
**Primary patterns:** Flow + Breakdown, Metric + Context.

**Layout:**
```
┌──────────────────────────────────────────┐
│ Pipeline / Funnel (T2)                   │
├───────┬──────┬──────┬────────────────────┤
│Stage 1│Stg 2 │Stg 3 │ Stage 4           │
│count  │count │count │ count              │
├───────┴──────┴──────┴────────────────────┤
│ Queue table: items awaiting action       │
└──────────────────────────────────────────┘
```

**Rules specific to operational:**
- Counts and statuses dominate — "how many items are in each stage?"
- SLA indicators: items approaching or breaching SLA deadlines are highlighted
- Actionable: each row in the queue table should link to the item's detail page

### 3.4.5 — Diagnostic Dashboard

**Decision context:** Root-cause, drill-down-intensive, hypothesis-driven.
**Target user:** Engineer, investigator, auditor.
**Primary richness:** T3 and T4.
**Primary patterns:** Correlation Exploration, Overview + Detail.

**Layout:**
```
┌──────────────────────────────────────────┐
│ Summary: what's the symptom?             │
├──────────────────────────────────────────┤
│ Scatter / heatmap: find the pattern      │
├──────────────────────────────────────────┤
│ Detail table: drill into anomalies       │
├──────────────────────────────────────────┤
│ Timeline: when did it start?             │
└──────────────────────────────────────────┘
```

**Rules specific to diagnostic:**
- Drill-down depth: 3 levels supported (summary → pattern → detail record)
- Cross-filtering is essential — the user narrows hypotheses by filtering
- Raw data access: the user expects to see individual records, not just aggregates
- No fixed time range — the user controls the window entirely

### 3.4.6 — Home View Orchestration

**Decision context:** Orientation, navigation, and situational awareness across an entire system.
**Target user:** Any user entering the Enterprise Brain environment — this is the Level 0 entry point.
**Primary richness:** T1 for navigation cards and KPIs, T2 for pulse charts, T3–T4 for immersive visualisations.

**What makes this archetype unique:**

Unlike the other five archetypes, the Home View Orchestration is not a destination — it is a navigation layer. Its purpose is not to answer questions directly, but to orient the user and route them to the right deep-dive view. Every element is a portal.

**Required elements (in any arrangement):**

1. **Narrative thread.** At least one AI narrative element — banner, inline callout, or scroll-step. The system's interpretation of the current state.

2. **Navigation portals.** 4-6 intelligence layer cards or equivalent elements that route the user to deeper views. Lenses are derived from the data, not prescribed.

3. **Exception-first signals.** At least one element that passively surfaces what's wrong or at risk, without requiring the user to filter or search.

**Optional elements (include when the data warrants):**

- Operational pulse charts (trend + comparison)
- Process/flow diagram (if pipeline structure exists)
- Scroll-driven storytelling sections (if the home view tells a narrative)
- Immersive Canvas overview (if the data has spatial/network structure)

**Lens derivation rules.** When determining the 4-6 analytical lenses:
1. Identify the primary entities (machines, suppliers, regions, products, accounts)
2. Identify the analytical modes (monitoring, diagnosis, prediction, comparison, risk)
3. Cross entities × modes for the 4-6 highest-value combinations
4. Each lens must be distinct — no two answering the same question

**Context ribbon.** The home view does NOT show the context ribbon (Layer 2 §2.10). The ribbon appears only on Level 1+ views, preserving the home view's key metrics while the user is drilling into detail.

**Flexibility principle.** The home view's structure is NOT a fixed grid template. It can be:
- A card grid with sections (the standard dashboard layout)
- A scroll-driven narrative that uses sticky visualisations to orient the user, with navigation portals interspersed
- An immersive Canvas with embedded navigation hotspots
- A combination of these

The data story determines the form. A dataset with a clear temporal narrative might use scroll-driven storytelling for the home view. A dataset with many independent entities might use a card grid. A dataset with complex relationships might use an immersive network Canvas as the home view's centerpiece.

---

## 3.6 — Scroll-Driven Composition

A distinct composition mode that can be used at any level (home, Level 1, Level 2). Instead of arranging widgets in a spatial grid, scroll-driven composition arranges insights along a vertical scroll axis with sticky visualisations.

### The Sticky Graphic Pattern

Borrowed from data journalism (The Pudding, New York Times Upshot, Reuters Graphics). A visualisation stays pinned in place while narrative cards scroll alongside it. Each card triggers a state change in the visualisation.

**Structure:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌──────────────┐  ┌─────────────────────┐  │
│  │              │  │ Step 1: narrative    │  │
│  │   STICKY     │  │ text explaining     │  │
│  │   CANVAS     │  │ what we see...      │  │
│  │              │  ├─────────────────────┤  │
│  │  (updates    │  │                     │  │
│  │   state as   │  │ Step 2: narrative   │  │
│  │   user       │  │ deepening the       │  │
│  │   scrolls)   │  │ analysis...         │  │
│  │              │  ├─────────────────────┤  │
│  │              │  │                     │  │
│  │              │  │ Step 3: the reveal  │  │
│  │              │  │                     │  │
│  └──────────────┘  └─────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### When to use scroll-driven composition

- **Root cause analysis:** The visualization is a causal chain. Each scroll step highlights a different link in the chain, progressively revealing how the root cause connects to the observed symptom.
- **Temporal narratives:** The visualization is a time-series. Each step annotates a different period, zooming in, highlighting events, showing before/after.
- **Progressive deepening:** Start with an overview, scroll to zoom into a cluster, scroll further to isolate an entity, scroll to reveal the detail.

### Composition rules

- The sticky visualisation is the focal element (≥50% of viewport width, or 100% in a full-width-above-narrative layout).
- Each narrative step has a clear thesis — one insight, one state change.
- The visualisation transition between steps should be animated (300ms ease) — bars grow, nodes move, highlights shift. This is the one place where animating data encoding IS appropriate, because the animation is the narrative device.
- Maximum 8 scroll steps per sequence. Beyond that, the user loses the thread.
- Each scroll sequence should end with a navigation affordance — "Explore deeper →" button or a card that fires `navigateTo()`.

### Scroll-driven views can coexist with standard grid views

A single artifact might have:
- Home view: card grid with intelligence portals (standard Mode 1 navigation)
- Root cause view (Level 1): scroll-driven sticky graphic (Mode 2)
- Stage detail view (Level 2): standard grid dashboard (Mode 1)
- Network view (Level 1): immersive full-canvas (Mode 3)

The modes mix freely. The data story determines which mode each view uses.

---

## 3.5 — Composition Validation Checklist

Every pattern and dashboard composition must pass:

- [ ] Every pattern has a clearly defined thesis (the question it answers)
- [ ] Every pattern has exactly one focal widget
- [ ] Focal widget occupies ≥50% of the pattern area
- [ ] Widgets within a pattern share analytical context (3.2.1)
- [ ] Shared dimensions use consistent encoding (3.2.2)
- [ ] Reading order flows naturally (3.2.5)
- [ ] Whitespace separates patterns from each other (3.2.4)
- [ ] No card borders around individual charts within a pattern
- [ ] Dashboard archetype matches the decision context from Layer 5
- [ ] If Home View Orchestration: at least one narrative element, 4-6 navigation portals, at least one exception-first signal
- [ ] Total widget count per visible view ≤ 12 (home view: ≤16 if navigation cards are T1)
- [ ] Context ribbon present on all Level 1+ views (Layer 2 §2.10)
- [ ] If scroll-driven composition: sticky visualisation + ≤8 narrative steps per sequence
- [ ] If scroll-driven: each step has one clear thesis and one visualisation state change
- [ ] Composition mode (grid / scroll-driven / immersive) is justified by the data story, not arbitrarily chosen

---

**Version:** 0.4 — Added Composition Invention Principle, marked archetypes as extensible
**Status:** Complete
**Dependencies:** Receives rendered widgets from Layer 2. Feeds into Layer 4 (which defines how widgets within patterns interact). Constrained by Layer 5 (adaptive resolution) and Layer 6 (conflict resolution).
