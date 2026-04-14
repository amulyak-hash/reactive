# Layer 4 — Interactions, Dependencies & Drill-Downs

> The behavioral layer that defines how the UI responds to user actions, how widgets communicate with each other, and how information is progressively disclosed. Layers 1–3 define what the user sees at rest. Layer 4 defines what happens when the user acts.

---

## 4.1 — Core Principle

Every interaction must have a visible affordance, a predictable outcome, and a reversible path back. If the user can't see that something is interactive, they won't try. If the outcome is surprising, they'll lose trust. If they can't undo it, they'll stop exploring.

Interaction is not decoration. Every interactive element must serve an analytical purpose — revealing hidden data, narrowing a hypothesis, or navigating to a related context. If an interaction exists but doesn't change the user's understanding, remove it.

---

## 4.2 — Interaction Taxonomy

### 4.2.1 — Passive Interactions (System-Initiated)

These happen without user action. The system detects a condition and responds.

**Conditional Formatting / Threshold Alerts**
When a data value crosses a defined threshold, the system changes the visual state of the affected element.

| Condition | Visual Response | Scope |
|-----------|----------------|-------|
| Value exceeds upper threshold | Background shifts to `var(--color-background-danger)`, text to danger color | KPI card, table cell, chart bar |
| Value below lower threshold | Background shifts to `var(--color-background-warning)` | Same as above |
| Value returns to normal range | Background resets to default | Same |
| Anomaly detected (statistical) | Dot/mark gains a pulsing ring or annotation flag | Chart data point |

**Rules:**
- Threshold definitions are part of the dashboard configuration, not hardcoded
- A maximum of 3 threshold levels per metric (warning, critical, emergency) — more levels create noise
- Threshold visual changes must not alter the data encoding — a red bar still encodes the same length; only the fill color changes
- Threshold alerts persist until the value returns to normal range. No auto-dismissal on timeout.

**Progressive Loading**
Large datasets load in stages:
1. Skeleton state — wireframe placeholder showing layout shape (100ms)
2. Summary data — KPI values and chart shapes appear (500ms)
3. Full detail — all data points, labels, and interactive elements load (1–3s)

**Rules:**
- Viewport-priority loading: above-the-fold widgets load first. Below-fold widgets render skeleton until scrolled into view.
- No layout shift: skeleton dimensions match final dimensions exactly. Content fills in without pushing other elements.
- Loading indicators: subtle pulse animation on skeleton shapes, not spinners. Spinners imply failure; pulse implies progress.

**Contextual Annotations**
System-generated insights that appear when the data warrants them.

| Annotation Type | Trigger | Visual |
|----------------|---------|--------|
| Statistical outlier | Value > 2σ from mean | Small flag/callout on the data point |
| Period-over-period change | >20% change from prior period | Delta arrow and percentage on KPI |
| Trend reversal | Direction change in 3+ period trend | Annotation label on the inflection point |
| Correlation alert | r² > 0.8 between two displayed variables | Dashed trend line with r² annotation |

**Rules:**
- Annotations are opt-out, not opt-in — they appear by default but the user can dismiss them
- Maximum 3 system annotations per widget — more than that becomes clutter
- Annotation text: 11px, italic, muted semantic color. Never larger than data labels.
- Annotations never occlude data marks — they are positioned in whitespace or attached by a thin leader line

### 4.2.2 — Active Interactions (User-Initiated)

**Filter**
Constrain the visible data across one or more dimensions.

| Filter Scope | Behavior | Visual |
|-------------|----------|--------|
| Local filter | Affects only the widget where the filter is applied | Filter control embedded in widget header |
| Pattern filter | Affects all linked widgets within the same pattern | Filter control in pattern header, all widgets update |
| Global filter | Affects all widgets on the dashboard | Filter bar at dashboard top |

**Filter control types:**
- Dropdown select (single or multi-select) — for categorical dimensions with ≤20 values
- Search/autocomplete — for categorical dimensions with >20 values
- Range slider — for quantitative dimensions
- Date range picker — for temporal dimensions
- Toggle group — for 2–4 categorical values (e.g., "Active / Inactive / All")

**Filter rules:**
- Active filters are always visible as removable chips/tags near the filter control
- Every filter has a "Clear all" affordance
- Filter state is preserved across drill-downs — if the user filters to "Region: Asia" and then drills into a city, the filter persists
- Filter options show count: "North America (42)" — the number in parentheses indicates how many records match
- Empty filter results show a clear "No data matches these filters" message, not a blank chart

**Sort**
Reorder data within a widget by any encoded dimension.

**Sort rules:**
- Sortable columns/dimensions have a visible indicator (▲/▼ icons in headers)
- Default sort: by the primary quantitative variable, descending (largest first)
- Three-state toggle: ascending → descending → default (unsorted)
- Sort state is local to the widget — sorting one table does not sort linked tables

**Hover / Focus**
Reveal detail and highlight relationships on pointer proximity.

**Hover rules:**
- Tooltip appears within 100ms of hover. Disappears within 200ms of mouse-out.
- Tooltip content: dimension label(s) + formatted value(s) + contextual info (rank, percentile, vs. benchmark)
- Tooltip position: follows mouse, offset 12px right and 8px below. Flips to left/above near container edges.
- Cross-highlighting: when hovering a data point in one widget, corresponding data in all linked widgets within the same pattern highlights at full opacity while non-matching data dims to 0.15 opacity.
- Focus ring: keyboard navigation shows a 2px focus ring (info color) on the focused element

**Select / Brush**
Click or lasso to isolate a subset of data.

**Select rules:**
- Single click selects one data point/bar/row. Second click deselects.
- Shift+click adds to selection.
- Lasso/brush: click-and-drag on scatter/line charts creates a rectangular selection. Selected points highlight; unselected dim.
- Selection propagates to linked widgets via cross-filtering (see 4.3 Dependency Model)
- Selection count displayed: "12 of 342 selected"
- "Clear selection" button appears whenever a selection is active

**Drill-Down**
Navigate from aggregate to constituent detail. See dedicated section 4.4.

**Zoom / Pan**
Spatial or temporal navigation within a widget.

**Zoom rules:**
- Scroll wheel zooms on time-series and scatter plots
- Click-and-drag pans the zoomed view
- Pinch-to-zoom on touch devices
- "Reset zoom" button appears whenever zoom level ≠ default
- Zoom level indicator (e.g., "Showing Jan–Mar of Jan–Dec") is visible
- Zoom does not change the data — it changes the viewport. All data is still loaded; only the visible window changes.

**Toggle / Switch**
Change the encoding, metric, or dimension within a widget without leaving the current view.

**Toggle rules:**
- Segmented control or tab group — for switching between 2–4 alternative views
- Dropdown — for switching between 5+ alternatives
- Toggling the metric updates the widget in place with a smooth transition (200ms ease)
- Axis labels and legends update to reflect the new metric
- Toggle state is local — switching one widget does not affect others

**Scroll / Scroll-Driven Narrative**
Scrolling through a vertical sequence of narrative cards triggers state changes in a sticky (pinned) visualization. The user's scroll position controls the narrative pace.

**Scroll-driven rules:**
- Implementation: use `IntersectionObserver` with `threshold: 0.5` (or equivalent) on each narrative step element. When a step crosses the viewport center, it becomes the active step.
- Active step: opacity 1.0, normal text color. All other steps: opacity 0.2-0.3, faded.
- When the active step changes, the paired sticky visualization smoothly transitions to the new state (300ms ease). This IS the one context where animating data encoding is permitted — the animation is the narrative device.
- The sticky visualization uses `position: sticky; top: 0` (or equivalent React positioning) and occupies either the left/right half of the viewport or the full background behind the narrative cards.
- Step min-height: 50-60vh to ensure only one step is active at a time during normal scrolling.
- Generous padding above the first step and below the last step (~40vh) so they can reach viewport center.
- Maximum 8 steps per scroll sequence. If the narrative needs more, split into multiple scroll sections separated by full-width content breaks.
- Each scroll sequence should end with a navigation affordance — clickable element that fires `navigateTo()` to a related detail view.

**Context Ribbon (persistent strip on drill-down views)**

The context ribbon is a passive interaction element that preserves home-view metrics while the user explores drill-downs. See Layer 2 §2.10 for visual spec.

**Context ribbon interaction rules:**
- Present on every Level 1+ view. Not present on the home view.
- Position: sticky at top of the view, above all other content (but below the browser chrome).
- Clicking the "← Overview" label triggers `navigateBack()` until the home view is reached, with a reverse-direction animated transition.
- Clicking any metric pill also navigates back to the home view.
- The ribbon does not participate in cross-widget interaction (it's read-only context, not a filter).
- If a ribbon metric changes while the user is in a drill-down (e.g., live data update causes a threshold breach), the affected pill animates: status dot enlarges (6px→10px→6px, 400ms), pill border glows (semantic color pulse, 2s). This is an ambient alert — it does not interrupt the user's flow but ensures they notice the change.

---

## 4.3 — Dependency Model

### Link Types

Widgets within a pattern can be linked or independent. Links define how state changes in one widget affect another.

**Cross-filter link**
Selecting/filtering data in Widget A filters the data in Widget B to the matching subset.

Direction: A → B (unidirectional). Widget A is the source; Widget B is the target.

Example: Selecting "North America" in a region bar chart (A) filters a revenue line chart (B) to show only North American revenue.

**Cross-highlight link**
Hovering a data element in Widget A highlights the corresponding elements in Widget B without filtering.

Direction: A ↔ B (bidirectional — either widget can trigger the highlight).

Example: Hovering the "Q3" bar in a quarterly chart highlights the Q3 data points in a linked scatter plot.

**Shared-axis link**
Widget A and Widget B share a common axis (typically time). Panning/zooming Widget A's axis synchronises Widget B's axis.

Direction: A ↔ B (bidirectional).

Example: Zooming into June–August on a revenue time-series also zooms the cost time-series below it to June–August.

**Shared-filter link**
A filter control (dropdown, slider) at the pattern or dashboard level applies to all linked widgets simultaneously.

Direction: Filter control → all linked widgets (one-to-many).

### Dependency Rules

1. **Default linking within patterns:** Widgets within the same pattern are cross-highlight linked by default. Cross-filter links must be explicitly declared.

2. **Default independence across patterns:** Widgets in different patterns are independent by default, unless they share a global filter.

3. **No circular dependencies:** A → B and B → A cross-filter links are forbidden. This creates infinite update loops. Cross-highlight is inherently bidirectional and safe; cross-filter is unidirectional and must be DAG-structured.

4. **Dependency declaration:** Every link is explicitly declared in the configuration. The declaration includes: source widget ID, target widget ID, link type, shared dimension(s).

5. **Cascading filters:** If A cross-filters B, and B cross-filters C, then a selection in A cascades through B to C. Maximum cascade depth: 3 levels. Beyond that, the system aggregates rather than cascading.

6. **Performance gate:** If a cross-filter operation affects >5 widgets or >100,000 data points, the update switches from real-time (on-hover) to on-demand (button click: "Apply filter").

### Dependency Configuration Schema

```yaml
dependencies:
  - source: widget_revenue_bar
    target: widget_detail_table
    type: cross_filter
    dimension: region
    direction: source_to_target
    
  - source: widget_revenue_bar
    target: widget_trend_line
    type: cross_highlight
    dimension: region
    direction: bidirectional
    
  - source: global_date_filter
    target: [widget_revenue_bar, widget_trend_line, widget_detail_table]
    type: shared_filter
    dimension: date_range
    direction: source_to_target
```

---

## 4.4 — Drill-Down Architecture

### Drill-Down Types

**In-place drill-down**
The widget itself transforms to show the next level of detail. The container does not change; the content within it changes.

Example: A bar chart showing revenue by region → click "Asia" → the same bar chart now shows revenue by country within Asia.

**Rules:**
- Back button (←) appears in the widget header, labeled with the prior level ("Back to Regions")
- Breadcrumb trail: "All Regions > Asia > Japan" — each breadcrumb is clickable
- Transition: 200ms ease-out, bars slide left to reveal the new level
- Maximum depth: 3 levels. Beyond this, cognitive context degrades — the user forgets where they are
- The deepest level (leaf) must be defined. The system must not generate infinite drill paths.

**Panel drill-down**
Selecting an element opens a side panel or overlay with detailed information. The parent widget remains visible.

Example: Click a data point on a scatter plot → a panel slides in from the right showing the full record for that entity.

**Rules:**
- Panel width: 320–400px, max 40% of viewport width
- Panel slides in from the right (LTR) with 200ms ease
- Parent widget dims slightly (0.7 opacity) but remains visible and interactive
- Panel has a close button (×) and clicking outside the panel closes it
- Panel content: entity title, key metrics, related mini-charts, action links
- Panel does not affect the parent widget's state — closing the panel returns to the exact prior state

**Navigational drill-down**
Selection triggers a full view change to a dedicated detail dashboard.

Example: Click "Customer: Acme Corp" → the entire dashboard navigates to the Acme Corp detail view.

**Rules:**
- Breadcrumb trail at the top of the target dashboard: "Dashboard > Customers > Acme Corp"
- Browser back button works (history state is pushed)
- The target dashboard receives the context (entity ID, filter state) from the source
- The target dashboard is a full dashboard (with its own patterns and widgets), not a single widget

**In-artifact navigational drill-down**
The primary drill-down type in Enterprise Brain. All views (home, Level 1 lenses, Level 2 details) are pre-built inside a single React artifact. Clicking a drill-down element changes React state to render a different view, with an animated transition. The user never leaves the artifact.

This is the default drill-down type for Enterprise Brain's navigable system. Use it for all navigation between pre-built views.

Example: Click an intelligence layer card "Root Cause Analysis · BF-3" → `navigateTo('root_cause_bf3')` → current view fades out + slides left (300ms) → target view fades in + slides from right (400ms) → user sees the root cause view.

**Rules:**

*View state management:*
- The artifact maintains a `currentView` state (string ID of the active view) and a `viewHistory` stack (array of view IDs the user has visited)
- `navigateTo(viewId)` pushes the new view ID onto the history stack and sets it as current
- `navigateBack()` pops the last entry from the history stack and sets the previous entry as current
- Every view is registered in a view map: `{ home: () => <HomeView />, root_cause_bf3: () => <RootCauseView entity="BF-3" />, ... }`

*Breadcrumb architecture:*
- Every non-home view displays a breadcrumb at the top: `← Back · [Level 0] > [Level 1] > [Current]`
- The `← Back` element calls `navigateBack()` with a reverse-direction transition
- Breadcrumb levels are derived from the viewHistory stack, not hardcoded
- Each intermediate breadcrumb is clickable — clicking it navigates to that level (popping all deeper entries from the history)

*Transition animations:*
- Forward (drilling deeper): current view fades out (opacity 1→0) + translates left (-20px) over 300ms ease-out. New view fades in (opacity 0→1) + translates from right (+30px→0) over 400ms ease-out.
- Back (going up): current view fades out + translates right (+20px) over 300ms ease-out. Previous view fades in + translates from left (-30px→0) over 400ms ease-out.
- During transition, both the exit and enter animations must not cause layout shift — use `position: absolute` or `opacity` changes, not `display: none` toggling.
- Respect `prefers-reduced-motion`: if set, transitions are instant (0ms duration).

*State coherence:*
- Data displayed at Level 1 must be consistent with Level 0. If the home view shows "Entity B: 78%", the Entity B detail view must show 78% for the same metric (or explain the discrepancy if the time scope differs).
- Color encodings must be consistent across all views. If Entity B is coral (#D85A30) on the home view, it's coral in every view where it appears.
- Entity naming must be consistent. "Plant B" does not become "Jamshedpur Plant" between views without context.

*View count guidance:*
- For a typical data problem: 1 home view + 4-6 Level 1 views + 2-4 Level 2 views = 7-11 views total
- Simple problems (< 5 variables, < 3 entities): 4-6 total views
- Complex problems (> 10 variables, many entities): up to 15 views, prioritised by analytical importance
- Not every possible drill-down needs a pre-built view. For deep or speculative explorations, include a generative drill-down button: "Ask Claude to explore this further ↗" (which fires `sendPrompt`)

**Generative drill-down**
Selection fires `sendPrompt()`, which sends a message to chat. Claude then generates an entirely new React artifact as the target view. The target view does not exist until the user clicks — it is created on demand.

This is fundamentally different from the other three types: the target is not pre-built. It is generated by the AI at interaction time, allowing infinite depth and context-sensitive views that adapt to what the user clicked.

Example: Click an intelligence layer card "Root Cause Analysis · BF-3" → `sendPrompt('Open root cause analysis for BF-3 — show causal chain from raw material to grade risk, variable waterfall, and 7-day timeline')` → Claude generates a new .jsx artifact with the requested visualisations.

**Rules:**

*Prompt specificity:*
- The `sendPrompt()` text must contain enough context for Claude to generate a complete view without asking follow-up questions
- Required components: (1) the lens or analytical question, (2) the entity scope, (3) the specific visualisations or data dimensions to include
- Bad: `sendPrompt('Show details')` — too vague. Good: `sendPrompt('Drill into Plant B — show line-by-line performance, downtime events last 7 days, shift comparison')` — specific, actionable.

*Breadcrumb architecture:*
- Every generated view must include a breadcrumb trail at the top: `← [Parent] · [Grandparent] > [Parent] > [Current View]`
- The back arrow (`←`) fires `sendPrompt('← Back to [parent view name]')` to regenerate the parent view
- Breadcrumb levels must match the user's actual navigation path — not the data hierarchy

*State coherence across levels:*
- Entities referenced at Level 1 must be consistent with Level 0. If the home view shows "Plant B: 78% performance," the Plant B drill-down must show the same 78% (or explain the discrepancy if it's a different time scope).
- Metrics, color encodings, and entity naming must remain consistent across all generated levels. "Plant B" must not become "Jamshedpur Plant" between levels without explanation.
- The AI analysis banner at each level must be scoped — it discusses only the current view's entity/lens, not the full enterprise picture.

*Visual continuity:*
- Each generated view is a standalone React artifact, but it should feel like part of the same system. Maintain consistent styling (same color palette, typography scale, section label treatment, card styles) across all levels.
- Deep-dive views generated via sendPrompt should use the same theme (dark/light) as the home view.

*Affordance rules:*
- Every element that fires `sendPrompt()` must have a visible affordance: "Explore →" button, pointer cursor, hover state change, or clickable label styling
- Elements that do NOT fire sendPrompt (e.g., pure-display widgets) must NOT have pointer cursors or button styling — false affordances are worse than no affordances
- On immersive Canvas visualisations, clickable nodes must show cursor: pointer and a subtle glow/scale increase on hover

### Drill-Down Depth Budget

| Drill-Down Type | Max Depth | Memory Load | Reversibility |
|----------------|-----------|-------------|---------------|
| In-place | 3 levels | Medium (user must track where they are) | Breadcrumb + back |
| Panel | Unlimited (panels can trigger panels) | Low (parent always visible) | Close panel |
| Navigational | 2 levels (dashboard → detail dashboard) | High (full context switch) | Breadcrumb + browser back |
| In-artifact navigational | 3 levels typical (home → lens → detail), up to 4 | Medium (breadcrumb + animated transitions maintain context) | viewHistory stack + animated back |
| Generative | No hard limit (each level is a new artifact) | Medium (breadcrumbs maintain context) | sendPrompt back + breadcrumb |

**Generative depth guidance:** While there is no hard limit, the system should provide increasingly specific views at each level. Level 0 is enterprise-wide. Level 1 is entity/lens-specific. Level 2 is sub-entity or sub-process specific. Level 3+ is individual record or event level. Beyond Level 3, the user is typically better served by a data table with export than by more generated views.

### Drill-Down Configuration Schema

```yaml
drill_downs:
  - source_widget: widget_revenue_bar
    type: in_place
    levels:
      - dimension: region
        label: "Regions"
      - dimension: country
        label: "{region} Countries"
      - dimension: city
        label: "{country} Cities"  # leaf level
        
  - source_widget: widget_scatter
    type: panel
    target_content:
      title: "{entity_name}"
      fields: [revenue, headcount, founded_date, industry]
      mini_charts: [revenue_sparkline, headcount_trend]
      
  - source_widget: widget_customer_table
    type: navigational
    target_dashboard: customer_detail_dashboard
    context_params: [customer_id, date_range]

  - source_widget: intelligence_card_root_cause
    type: in_artifact_navigational
    target_view_id: root_cause_bf3
    transition: forward
    breadcrumb_label: "Root cause · BF-3"

  - source_widget: pipeline_node_stage2
    type: in_artifact_navigational
    target_view_id: stage_2_detail
    transition: forward
    breadcrumb_label: "Stage 2 · Photolithography"

  - source_widget: entity_bar_plant_b
    type: in_artifact_navigational
    target_view_id: plant_b_detail
    transition: forward
    breadcrumb_label: "Plant B · Jamshedpur"

  - source_widget: intelligence_card_root_cause
    type: generative
    sendPrompt_template: "Open root cause analysis for {entity} — show causal chain, contributing factor breakdown, and 7-day variable trend"
    breadcrumb_label: "Root cause · {entity}"
    parent_view: "Enterprise overview"

  - source_widget: process_flow_node_bf3
    type: generative
    sendPrompt_template: "Drill into {stage_name} — show variable trends, threshold analysis, and upstream/downstream impact"
    breadcrumb_label: "{stage_name} detail"
    parent_view: "Enterprise overview"
```

---

## 4.5 — Progressive Disclosure

Not all information is shown at once. The system decides what to surface vs. suppress.

### Disclosure Priority Stack

1. **Exception-first** — anomalies, alerts, and threshold breaches surface before normal-state metrics. A KPI that's within range is gray; one that's breaching is red and elevated to the alert banner. The user's attention is directed to problems, not confirmation.

2. **Task relevance** — information directly tied to the current decision context is visible at full opacity. Tangential information is dimmed or one interaction away. Example: on a monitoring dashboard, the primary metric is at full prominence; supporting context is muted until hovered.

3. **Viewport priority** — above-the-fold content loads and renders first. Below-fold widgets show skeletons until scrolled into view. On narrow viewports, lower-priority patterns collapse into a "Show more" expandable section.

4. **Detail-on-demand** — the default state shows summary/aggregate. The user pulls detail by hovering (tooltip), clicking (panel), drilling (in-place), or expanding (table rows, accordion sections). The system never pushes raw detail unprompted.

### Disclosure Controls

| Control | Purpose | Behavior |
|---------|---------|----------|
| "Show more" / "Expand" | Reveal additional patterns below the fold | Section expands with 200ms ease, pushes content down |
| "View all" | Navigate to a dedicated full-screen view | Navigational drill-down |
| Tooltip | Reveal detail on hover | Appears/disappears with 100ms/200ms timing |
| Accordion row | Reveal sub-detail within a table | Row expands inline, nested content appears |
| Tab group | Switch between alternative views | Content swaps in-place, tab indicator moves |
| "Download data" | Provide raw data behind a widget | CSV export of the filtered dataset |

### Information Density Spectrum

The system adjusts information density based on the cognitive style profile (Layer 5):

| Density Level | Characteristics | Default For |
|--------------|-----------------|-------------|
| Compact | High data-to-chrome ratio, small spacing, dense grids, abbreviated labels | Analysts, data scientists |
| Standard | Balanced spacing, full labels, moderate grid density | Most users (default) |
| Spacious | Generous whitespace, large type, fewer widgets per view, narrative text between widgets | Executives, first-time users |

---

## 4.6 — View Transition Animations & Micro-Interactions

This section defines the animation and micro-interaction rules for in-artifact navigable systems. These are behavioral specifications — they describe how the UI communicates state changes, affordances, and spatial relationships through motion.

### View Transition Animations

Transitions between views communicate navigation direction and maintain spatial context.

**Forward navigation (drilling deeper):**

| Phase | Property | From | To | Duration | Easing |
|-------|----------|------|----|----------|--------|
| Exit (current view) | opacity | 1 | 0 | 300ms | ease-out |
| Exit (current view) | translateX | 0 | -20px | 300ms | ease-out |
| Enter (target view) | opacity | 0 | 1 | 400ms | ease-out |
| Enter (target view) | translateX | +30px | 0 | 400ms | ease-out |

**Back navigation (going up):**

| Phase | Property | From | To | Duration | Easing |
|-------|----------|------|----|----------|--------|
| Exit (current view) | opacity | 1 | 0 | 300ms | ease-out |
| Exit (current view) | translateX | 0 | +20px | 300ms | ease-out |
| Enter (previous view) | opacity | 0 | 1 | 400ms | ease-out |
| Enter (previous view) | translateX | -30px | 0 | 400ms | ease-out |

**Mode switch (e.g., CEO ↔ Investigation):**

| Phase | Property | From | To | Duration | Easing |
|-------|----------|------|----|----------|--------|
| Cross-fade | opacity (outgoing) | 1 | 0 | 250ms | ease |
| Cross-fade | opacity (incoming) | 0 | 1 | 350ms | ease |
| Scale pulse | scale (container) | 1.0 | 0.99 → 1.0 | 400ms | ease-out |

**Rules:**
- No layout shift during transitions. Use `opacity` and `transform` only — never `display: none`, `height: 0`, or `width` changes.
- During the transition gap (between exit complete and enter start), the container must not collapse to zero height. Use `position: absolute` overlay or maintain minimum height.
- Transitions are mandatory for all view changes. Instant jumps (no animation) are only acceptable when `prefers-reduced-motion` is set.
- `prefers-reduced-motion`: all durations set to 0ms, all idle animations stop, all loops freeze.

### Micro-Interaction Catalogue

Micro-interactions provide feedback on every user action. They communicate: "this element is interactive," "your action was registered," and "here's what changed." Every interactive element must have at least one micro-interaction.

**Intelligence layer cards:**

| Trigger | Response | Timing |
|---------|----------|--------|
| Hover enter | Background brightness +0.03 opacity, scale 1.01, cursor: pointer | 200ms ease |
| Hover exit | Revert to default | 200ms ease |
| Click | Scale pulse: 1.01 → 0.98 → 1.0, then trigger view transition | 150ms ease-out, then 300ms transition |
| Canvas mini-viz idle | Subtle animation loop: sparkline drawing, dots pulsing (opacity 0.5→1.0), nodes drifting ±1px | 2-4s loop, ease-in-out |

**KPI cards:**

| Trigger | Response | Timing |
|---------|----------|--------|
| Sparkline terminal dot | Gentle pulse: opacity 0.6 → 1.0, radius ±0.5px | 2s loop, ease-in-out |
| Threshold breach | Left-border glow: accent color opacity pulse 0.4 → 0.8 | 3s loop, ease-in-out |
| Hover (if clickable) | Background brightness shift, cursor: pointer | 200ms ease |

**Chart elements (bars, dots, lines):**

| Trigger | Response | Timing |
|---------|----------|--------|
| Hover | Element brightens (opacity → 1.0). Dots scale 1.05. Bars scale 1.02 (x-axis only). Tooltip fades in. Cross-highlight fires in linked widgets. | Scale: 150ms ease. Tooltip: 100ms fade-in. |
| Hover exit | Revert. Tooltip fades out. Cross-highlight clears. | 200ms ease |
| Click (if drill-down target) | Ripple/pulse at click point, then view transition | Ripple: 200ms, then 300ms transition |

**Canvas nodes (immersive visualisations):**

| Trigger | Response | Timing |
|---------|----------|--------|
| Idle | Subtle drift: ±1-2px random walk, different phase per node. Connected edges follow. | 4-6s per cycle, ease-in-out |
| Hover | Node radius +15-20%. Glow radius increases (radialGradient outer stop expands). Label fades in. Connected edges brighten. Unconnected elements dim to 0.3 opacity. Cursor: pointer. | 200ms ease |
| Hover exit | Revert all. Label fades out. All elements restore opacity. | 250ms ease |
| Click | Node pulse: scale 1.0 → 1.2 → 1.0. Glow flash (brief brightness spike). Then view transition triggers. | Pulse: 300ms ease-out, then 300ms transition |

**Pipeline / flow stages:**

| Trigger | Response | Timing |
|---------|----------|--------|
| Hover | Stage section brightens. Metric label scales up slightly. Flow lines from this stage pulse (opacity ripple traveling along the line). Cursor: pointer. | 200ms ease |
| Click | Stage node emits ripple ring expanding outward (radius 0 → 40px, opacity 1 → 0). Then view transition. | Ripple: 300ms, then 300ms transition |

**Breadcrumb / back button:**

| Trigger | Response | Timing |
|---------|----------|--------|
| Hover | Arrow shifts 3px left (for ←) or right (for →). Text underlines. | 200ms ease |
| Click | Arrow shifts 8px in direction, then reverse view transition triggers. | 150ms + 300ms transition |

**Explore → buttons:**

| Trigger | Response | Timing |
|---------|----------|--------|
| Hover | Arrow shifts 4px right. Background subtle brightness shift. | 200ms ease |
| Active (click) | Scale 0.97, then 1.0. Then navigation triggers. | 50ms down, 150ms up |

**Mode toggle (CEO / Investigation):**

| Trigger | Response | Timing |
|---------|----------|--------|
| Hover | Active option indicator brightens. | 150ms ease |
| Click | Toggle state changes. Active indicator slides to new position. Entire view content cross-fades to new mode. | Indicator: 250ms ease. Content: 350ms cross-fade. |

### Animation Rules (Mandatory)

1. All animations respect `prefers-reduced-motion`. If set: durations = 0ms, loops stop, drifts freeze.
2. User-triggered animations: max 500ms. Idle/ambient animations: 2-6s loops.
3. CSS transitions for DOM elements. `requestAnimationFrame` for Canvas.
4. **Never animate data encoding** (bar height, line position, color value, dot position on scatter). Data is read, not watched. Animate the chrome: opacity, scale, glow, container position. Exception: initial chart render may animate bars growing from zero or lines drawing in — this is a reveal, not a data transition.
5. Canvas idle animations must be GPU-friendly. Use `requestAnimationFrame` with delta-time, not `setInterval`. Batch all Canvas draws into a single animation loop.
6. Transitions must not block interaction. If the user clicks during a transition, the transition completes immediately (skip to end state) and the new action processes.

---

## 4.7 — State Management

### State Types

**Ephemeral state** — exists only during the current interaction. Hover highlights, tooltip visibility. Lost on mouse-out or focus change.

**Session state** — persists during the current dashboard session. Active filters, sort order, zoom level, expanded drill-down path. Lost on page refresh or session close.

**Persistent state** — saved across sessions. Saved filter presets, custom annotations, dashboard layout preferences. Stored in user profile.

### State Serialisation

Dashboard state must be serialisable to a URL query string or shareable link, enabling:
- Bookmarking a specific filtered view
- Sharing a link that opens the dashboard with the same filters, sort, and drill-down state
- "Reset to default" that clears all session state

### State Conflict Resolution

When multiple state changes occur simultaneously (e.g., a global filter change while a drill-down is active):
1. Global filters take precedence — they constrain the universe of data
2. Drill-down state is preserved if the filtered data still contains the drilled-into entity
3. If the filtered data no longer contains the drilled-into entity, the drill-down resets to the top level with a notification: "Filter change reset your drill-down view"

---

## 4.8 — Performance Budgets

| Interaction | Target Latency | Degradation Strategy |
|------------|---------------|---------------------|
| Tooltip appear | <100ms | Pre-render tooltip content for visible data points |
| Cross-highlight | <50ms | CSS-only opacity change (no data re-query) |
| Cross-filter | <300ms | If >300ms, show loading pulse on affected widgets |
| Sort | <200ms | Client-side sort for <10,000 rows; server-side for more |
| Drill-down (in-place) | <500ms | Show transition animation during data fetch |
| Drill-down (navigational) | <1000ms | Show skeleton of target dashboard immediately |
| Drill-down (generative) | Depends on Claude response time | Show "Generating view..." loading state in chat. Not controllable by the artifact — latency is in the AI response. |
| Filter (global) | <500ms | Parallel update of all affected widgets |
| Zoom/pan | <16ms (60fps) | Canvas-based rendering for large datasets |
| Full dashboard load | <3000ms | Progressive loading: skeleton → summary → detail |

---

## 4.9 — Validation Checklist

Every interaction configuration must pass:

- [ ] Every interactive element has a visible affordance (cursor change, icon, border change)
- [ ] Every filter has a "clear / reset" path
- [ ] Every drill-down has a "back" path (breadcrumb, close button, or browser back)
- [ ] Generative drill-downs (sendPrompt): prompt text includes lens/question, entity scope, and expected content
- [ ] Generative drill-downs: target view includes breadcrumb with back-navigation sendPrompt
- [ ] Generative drill-downs: entity names, metrics, and color encodings are consistent across levels
- [ ] No circular cross-filter dependencies
- [ ] Dependency direction explicitly declared for all cross-filter links
- [ ] Cascade depth ≤ 3 for cross-filters
- [ ] In-place drill-down depth ≤ 3 levels
- [ ] Every drill-down path has a defined leaf level
- [ ] Tooltip latency < 100ms
- [ ] Cross-filter latency < 300ms or degraded to on-demand
- [ ] Dashboard state is serialisable to URL
- [ ] Empty-state handling defined for all filterable widgets
- [ ] Selection count displayed when selection is active
- [ ] Keyboard navigation supported for all interactive elements
- [ ] In-artifact navigational drill-downs: view registry contains all pre-built views
- [ ] In-artifact navigational drill-downs: viewHistory stack drives breadcrumb rendering
- [ ] In-artifact navigational drill-downs: state coherence — entity names, metrics, and colors consistent across views
- [ ] View transitions: forward navigation animates exit-left + enter-from-right
- [ ] View transitions: back navigation animates exit-right + enter-from-left
- [ ] View transitions: no layout shift during animation (opacity + transform only)
- [ ] View transitions: respects prefers-reduced-motion (0ms if set)
- [ ] Micro-interactions: every clickable element has hover feedback (cursor, brightness, scale)
- [ ] Micro-interactions: every click has a registered feedback (pulse, ripple, or scale) before navigation triggers
- [ ] Micro-interactions: Canvas nodes have hover glow + label reveal + connected-element highlight
- [ ] Micro-interactions: Canvas idle animations present (subtle drift, pulse) and respect reduced-motion
- [ ] No data encoding is animated — exception: scroll-driven narrative transitions where animation IS the storytelling device
- [ ] Scroll-driven (if used): IntersectionObserver triggers step activation at viewport center
- [ ] Scroll-driven (if used): active step opacity 1.0, inactive 0.2-0.3, transition 400ms
- [ ] Scroll-driven (if used): sticky visualization transitions state on step change (300ms ease)
- [ ] Scroll-driven (if used): max 8 steps per sequence, ends with navigation affordance
- [ ] Context ribbon: present on all Level 1+ views, not on home view
- [ ] Context ribbon: position sticky at top, shows 3-5 critical metrics with trend + status
- [ ] Context ribbon: clicking any element navigates back to home
- [ ] Cross-widget hover state (hoveredEntity) is implemented for any view with 2+ widgets showing the same entities

---

**Version:** 0.3 — Added scroll-driven interaction, context ribbon behavior, reinforced idle animation and cross-widget requirements
**Status:** Complete
**Dependencies:** Receives composed patterns from Layer 3. Constrained by Layer 5 (which adjusts interaction density) and Layer 6 (which resolves interaction-vs-performance conflicts).
