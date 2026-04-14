# Layer 5 — Adaptive Resolution

> The layer that makes Enterprise Brain's GenUI fundamentally different from static dashboards. This is where the system adapts its output based on *who* is looking, *what* decision they're making, and *what context* they're in. Layers 1–4 describe a universal design system. Layer 5 personalises it.

---

## 5.1 — Core Principle

The same data, presented to two different people making two different decisions, should produce two different interfaces. Not because the data changed, but because the optimal encoding, composition, richness, and interaction model differ by user and context.

A convergent thinker reviewing a monthly operations report needs a focused, linear, minimal-interaction monitoring dashboard. A divergent thinker exploring the same dataset for root causes needs a filter-heavy, high-density, cross-filtered analytical dashboard. The data is identical. The UI is not.

Adaptation is not "themes" or "layout preferences." It is the systematic modulation of Layers 1–4 based on a profile that describes the user's cognitive style, the decision they're making, and the environment they're in.

---

## 5.2 — Adaptation Dimensions

Three dimensions define the adaptation space. Each dimension has a set of archetypes or factors that the system evaluates.

### 5.2.1 — Cognitive Style Archetypes

How the user processes information. Derived from the Enterprise Brain specification's research streams on cognitive style theory (Witkin, Riding, Pask) and extended for data interface contexts.

**Archetype A — Analytical-Convergent**
Processes information sequentially and precisely. Prefers structured, focused views with clear hierarchy. Wants to see one thing at a time, deeply. Low tolerance for clutter. High tolerance for detail within a narrow scope.

| Layer | Modulation |
|-------|-----------|
| Layer 1 (Encoding) | Prefers standard, familiar encodings: bar, line, table. Avoids complex forms (parallel coordinates, network graphs) unless domain-fluent. |
| Layer 2 (Richness) | T2 default. T3 only when explicitly exploring. T4 rarely. |
| Layer 3 (Pattern) | Overview + Detail is the default pattern. Single focal widget with supporting context. No more than 2 patterns per view. |
| Layer 4 (Interaction) | Linear navigation: drill-down paths, not open-ended filters. Guided exploration (wizard-like). Minimal cross-filtering. |
| Information density | Standard to Spacious |
| Annotation level | High — the system explains what's happening |

**Archetype B — Holistic-Divergent**
Processes information in parallel, seeking patterns across dimensions. Prefers dense, multi-faceted views. Wants to see everything at once and find connections. High tolerance for complexity. Low tolerance for being constrained to one view.

| Layer | Modulation |
|-------|-----------|
| Layer 1 (Encoding) | Comfortable with complex encodings: scatter, heatmap, parallel coordinates, small multiples. |
| Layer 2 (Richness) | T3 default. T4 for structure discovery. T1 only as anchor points. |
| Layer 3 (Pattern) | Comparison Grid and Correlation Exploration are defaults. Multiple patterns per view (3–4). |
| Layer 4 (Interaction) | Open-ended: full filter bar, cross-filtering across all widgets, brush selection, toggle between dimensions. |
| Information density | Compact |
| Annotation level | Low — the system shows data, user interprets |

**Archetype C — Pragmatic-Operational**
Processes information in terms of actions and outcomes. Doesn't want to explore — wants to know what to do next. Prefers status indicators, queues, and alerts.

| Layer | Modulation |
|-------|-----------|
| Layer 1 (Encoding) | Simple: KPI cards, status badges, progress bars, queue tables. |
| Layer 2 (Richness) | T1 dominant. T2 for supporting context. |
| Layer 3 (Pattern) | Metric + Context and Flow + Breakdown. Monitoring and Operational dashboard archetypes. |
| Layer 4 (Interaction) | Minimal interaction on the dashboard itself. Actions are on the items (approve, escalate, assign), not on the data. Drill-down leads to the item, not to deeper data views. |
| Information density | Standard |
| Annotation level | Exception-only — annotations appear only when something needs attention |

**Archetype D — Narrative-Strategic**
Processes information as stories with context, causes, and implications. Prefers annotated, time-based, narrative-structured views. Wants to understand *why* before *what*.

| Layer | Modulation |
|-------|-----------|
| Layer 1 (Encoding) | Time-series dominant. Annotated charts. Scenario bands. |
| Layer 2 (Richness) | T2–T3. Heavy annotation layer. |
| Layer 3 (Pattern) | Temporal Narrative is the default pattern. Strategic dashboard archetype. |
| Layer 4 (Interaction) | Low interaction on the dashboard. Clicking annotations reveals commentary. Dashboard designed to be presentable (PDF/screenshot friendly). |
| Information density | Spacious |
| Annotation level | Maximum — every data point has context |

### Archetype Detection

The system determines the user's archetype through:

1. **Explicit profile** — user selects their preferred style during onboarding or in settings
2. **Role inference** — job title and department map to default archetypes (CFO → Narrative-Strategic, Data Analyst → Holistic-Divergent, Operations Manager → Pragmatic-Operational)
3. **Behavioral signal** — the system observes interaction patterns over time and adjusts:
   - User consistently applies multiple filters → shift toward Holistic-Divergent
   - User primarily reads KPIs and rarely interacts → shift toward Analytical-Convergent or Pragmatic-Operational
   - User spends time on annotations and commentary → shift toward Narrative-Strategic
4. **Session override** — the user can switch modes within a session ("Switch to exploration mode" / "Switch to presentation mode")

### Archetype Blending

Real users are not pure archetypes. The system supports weighted blends:

```
User Profile:
  Holistic-Divergent: 0.6
  Analytical-Convergent: 0.3
  Pragmatic-Operational: 0.1
```

The blend weights modulate each layer's parameters. A 60% Holistic-Divergent, 30% Analytical-Convergent user gets a T3-default dashboard with 3 patterns, cross-filtering enabled, but with slightly more annotation than a pure Holistic-Divergent user.

---

### 5.2.2 — Decision Context Archetypes

The nature of the decision being supported. A single user may operate in different decision contexts at different times — the same CFO uses a monitoring dashboard in the morning and a strategic dashboard for board prep.

**Monitoring Context**
Continuous awareness. Is everything within expected bounds?

| Factor | Value |
|--------|-------|
| Urgency | High (real-time or near-real-time) |
| Complexity | Low (single metrics against thresholds) |
| Reversibility | N/A (observing, not deciding) |
| Collaboration | Low (individual watch) |
| → Dashboard archetype | Monitoring |
| → Refresh rate | 30s – 5min |
| → Exception-first | Maximum |

**Diagnostic Context**
Root-cause investigation. Something went wrong — why?

| Factor | Value |
|--------|-------|
| Urgency | Medium-High (incident response) to Low (post-mortem) |
| Complexity | High (multi-dimensional, hypothesis-driven) |
| Reversibility | N/A (investigating, not deciding) |
| Collaboration | Medium (team troubleshooting) |
| → Dashboard archetype | Diagnostic |
| → Drill-down depth | Maximum (3 levels) |
| → Cross-filter scope | Global |

**Analytical Context**
Exploration and insight generation. What patterns exist in this data?

| Factor | Value |
|--------|-------|
| Urgency | Low |
| Complexity | High |
| Reversibility | N/A (exploring, not committing) |
| Collaboration | Low-Medium |
| → Dashboard archetype | Analytical |
| → Filter freedom | Maximum |
| → Richness tier | T3 dominant |

**Operational Context**
Execution and status tracking. What needs to happen next?

| Factor | Value |
|--------|-------|
| Urgency | Medium (SLA-driven) |
| Complexity | Low-Medium (process stages, queues) |
| Reversibility | Actions are reversible (re-assign, re-prioritise) |
| Collaboration | High (team queue) |
| → Dashboard archetype | Operational |
| → Action affordances | Maximum (approve, assign, escalate buttons on items) |

**Strategic Context**
Scenario planning and forward-looking decisions. What should we do?

| Factor | Value |
|--------|-------|
| Urgency | Low (quarterly/annual cadence) |
| Complexity | High (multi-factor, scenario-based) |
| Reversibility | Low (resource commitments, strategy shifts) |
| Collaboration | High (boardroom, stakeholder alignment) |
| → Dashboard archetype | Strategic |
| → Annotation density | Maximum |
| → Exportability | Required (PDF/screenshot fidelity) |

---

### 5.2.3 — Environmental Factors

Contextual signals that modulate the adaptation independently of cognitive style and decision context.

**Device and Viewport**

| Viewport | Adaptation |
|----------|-----------|
| Desktop (>1200px) | Full fidelity, all tiers available |
| Tablet landscape (960–1200px) | Reduce pattern count (4→3). Small multiples columns reduce (4→3→2). |
| Tablet portrait (600–960px) | Max 2 patterns per view. Charts simplify to T2. Tables become scrollable. |
| Mobile (<600px) | T1 dominant. Charts collapse to sparklines + KPI cards. Tables become vertical card stacks. Progressive disclosure via "Show more." |

Responsive adaptation is not just "make it smaller." The system re-prioritises content. On mobile, the monitoring dashboard shows only the alert banner and KPI row. The user must explicitly expand to see charts.

**Session Context**

| Signal | Adaptation |
|--------|-----------|
| First visit | Default archetype for user's role. Guided onboarding hints ("Tip: click any bar to drill down"). |
| Returning user (same day) | Preserve session state from last visit (filters, drill-down position). Show "since you left" delta on KPI cards. |
| Returning user (new day) | Reset to default view. Show "overnight changes" summary in alert banner. |
| Shared/embedded view | Read-only mode. Filters visible but disabled. Annotations visible. No drill-down. |

**Time-Based Signals**

| Signal | Adaptation |
|--------|-----------|
| Morning (first session of day) | Monitoring context default. "Morning briefing" mode — exception-first, KPI-heavy. |
| Pre-meeting (calendar integration) | Surface data relevant to the meeting topic. Client dashboard if client meeting detected. |
| End of period (month-end, quarter-end) | Strategic context default. Period-over-period comparisons prominent. |

**In-Artifact Mode Toggle**

In a single-artifact navigable system, the user may need to switch between adaptation profiles without leaving the artifact. This is implemented as an explicit mode toggle — a UI control within the artifact that switches the active cognitive style + decision context, causing all views to re-render with different richness, density, annotation level, and language.

Common mode pairs:
| Mode A | Mode B | What Changes |
|--------|--------|-------------|
| Executive / CEO view | Investigation / Analyst view | Richness (T1-T2 → T3), density (Spacious → Compact), annotation (business language → technical metrics), interaction (minimal → cross-filtering enabled) |
| Monitoring | Diagnostic | Patterns (Metric+Context → Correlation Exploration), interaction (passive → active filtering), drill-down depth (1 level → 3 levels) |
| Presentation | Exploration | Interaction (read-only → full interactivity), annotation (narrative → minimal), exportability (PDF-safe → interactive) |

**Implementation rules:**
- The mode toggle is a segmented control or toggle switch, positioned at the top of the home view (typically in the header, next to the title or timestamp).
- Switching modes triggers a cross-fade transition (Layer 4 §4.6): outgoing content fades out (250ms), incoming content fades in (350ms), subtle container scale pulse (0.99→1.0, 400ms).
- Mode state is stored in React state and passed to all view components. Each component reads the mode and adjusts its rendering: which metrics to show, what labels to use, what richness tier to render at, whether filter controls are visible.
- Mode switching affects ALL views in the artifact simultaneously — not just the currently visible view. When the user navigates to a Level 1 view after switching modes, that view must already reflect the new mode.
- The AI analysis banner content may change between modes: CEO mode uses business language ("crop health declining, two contracts at risk"); Investigation mode uses technical language ("SPAD index dropped 12 points, root zone EC trending above 2.4 mS/cm").

**What changes per mode (expressed as Layer 5 modulation):**

```yaml
mode_executive:
  cognitive_style_override: pragmatic_operational
  decision_context_override: monitoring
  richness_cap: T2  # No T3/T4 widgets
  density: spacious
  annotation_level: business_language  # Translate technical metrics
  interaction_level: minimal  # No cross-filtering, minimal drill-down
  filter_bar: hidden
  technical_metrics: hidden  # Replace with business equivalents

mode_investigation:
  cognitive_style_override: holistic_divergent
  decision_context_override: diagnostic
  richness_cap: T4  # Full immersive available
  density: compact
  annotation_level: technical  # Raw metric names and units
  interaction_level: full  # Cross-filtering, brushing, zoom
  filter_bar: visible
  technical_metrics: visible
```

- The mode does not change the data or the underlying encoding decisions (Layer 1). It changes how data is presented and how much interaction is exposed (Layers 2, 3, 4).
- A maximum of 3 modes per artifact. Beyond that, the user loses track of which mode they're in. Most systems need exactly 2.

---

## 5.3 — Adaptation Pipeline

The system resolves adaptation through a five-stage pipeline:

### Stage 1 — Profile Assembly

Inputs:
- Cognitive style archetype (from user profile, role inference, or behavioral signal)
- Decision context archetype (from URL route, session intent, or explicit selection)
- Environmental factors (device, session history, time signals)

Output: A unified profile object:

```yaml
profile:
  cognitive_style:
    primary: holistic_divergent (0.6)
    secondary: analytical_convergent (0.3)
    tertiary: pragmatic_operational (0.1)
  decision_context: diagnostic
  environment:
    viewport: desktop_wide
    session: returning_same_day
    time_signal: morning_briefing
```

### Stage 2 — Candidate Generation

Layers 1–4 generate a set of candidate configurations. Each candidate is a complete specification:
- Encoding assignments (Layer 1)
- Richness tiers per widget (Layer 2)
- Pattern composition and dashboard archetype (Layer 3)
- Interaction model and dependency graph (Layer 4)

Typically 3–8 candidates are generated, representing different valid configurations for the same data.

### Stage 3 — Constraint Evaluation

The constraint solver (Clingo/ASP) evaluates each candidate against:
- The profile's cognitive style modulations (does this candidate match the user's density/complexity preferences?)
- The decision context requirements (does this candidate support the urgency/complexity/collaboration needs?)
- The environmental constraints (does this candidate fit the viewport? Is it exportable if needed?)
- The hard constraints from Layer 6 (no encoding violations, no circular dependencies, accessibility compliance)

Invalid candidates are eliminated. A candidate is invalid if it violates any hard constraint. Soft constraints (preferences) are used for scoring in Stage 4.

### Stage 4 — Scoring and Ranking

Surviving candidates are scored by fit to the profile. The scoring function weights each dimension:

```
Score = (w_cognitive × cognitive_fit) + (w_context × context_fit) + (w_environment × environment_fit)
```

Default weights:
- w_cognitive = 0.4
- w_context = 0.4
- w_environment = 0.2

Cognitive fit measures how well the candidate's density, richness, and interaction model match the cognitive style archetype blend.

Context fit measures how well the candidate's dashboard archetype, refresh rate, and annotation density match the decision context.

Environment fit measures viewport appropriateness, session context alignment, and time-signal relevance.

### Stage 5 — Rendering

The top-ranked candidate is rendered as the default view. The next 1–2 alternatives are available as user-switchable layout options:

- "Switch to compact view" (if the default is Standard density and a Compact alternative exists)
- "Switch to presentation mode" (if the default is interactive and a read-only exportable alternative exists)
- "Switch to exploration mode" (if the default is monitoring and an analytical alternative exists)

---

## 5.4 — Vessey Lock Table (Overview)

The Vessey Lock Table is the core mapping mechanism that connects cognitive styles to decision contexts and resolves which Layer 1–4 configurations are valid for each combination. It is a matrix where:

- Rows = Cognitive Style Archetypes (A, B, C, D and their blends)
- Columns = Decision Context Archetypes (Monitoring, Diagnostic, Analytical, Operational, Strategic)
- Cells = The set of valid dashboard archetypes, pattern compositions, richness tiers, and interaction models

The full Lock Table is maintained in the core Enterprise Brain specification and is referenced by the constraint solver at Stage 3. Changes to the Lock Table are governed by the extension protocol in the GenUI Appendix.

**Example cell (Holistic-Divergent × Diagnostic):**
```
Dashboard: Diagnostic
Patterns: Correlation Exploration (focal), Overview + Detail (supporting)
Richness: T3 dominant, T1 anchor
Interaction: Full cross-filter, brush selection, 3-level drill-down
Density: Compact
Annotations: Low (user-driven interpretation)
```

**Example cell (Narrative-Strategic × Strategic):**
```
Dashboard: Strategic
Patterns: Temporal Narrative (focal), Metric + Context (supporting)
Richness: T2–T3, heavy annotation
Interaction: Low — click annotations for commentary. Exportable.
Density: Spacious
Annotations: Maximum — every data point contextualized
```

> Full Lock Table to be expanded in subsequent revision with all 20 cell definitions (4 archetypes × 5 contexts).

---

## 5.5 — EU AI Act Compliance

Enterprise Brain's adaptive resolution involves automated decision-making about how information is presented to users. Under the EU AI Act, this falls under "AI systems that interact with natural persons" and may qualify as "limited risk" requiring transparency obligations.

**Transparency requirements:**
- The user must be informed that the dashboard layout is AI-adapted to their profile
- The user must be able to see their current profile (cognitive style + context)
- The user must be able to override any adaptation (switch modes, reset to default)
- The user must be able to opt out of adaptive behaviour entirely (use a static default layout)

**Non-manipulation requirements:**
- Adaptation must serve the user's analytical effectiveness, never commercial interests (e.g., the system must never suppress negative data or emphasise positive data based on the user's cognitive profile)
- All data is equally accessible regardless of adaptation — adaptation changes presentation order and emphasis, never data availability

---

## 5.6 — Validation Checklist

- [ ] User profile is assembled from at least one source (explicit, role, behavioral)
- [ ] Cognitive style archetype weights sum to 1.0
- [ ] Decision context is determined for every session
- [ ] At least 2 candidate configurations are generated for scoring
- [ ] Constraint solver eliminates all hard-constraint violations before scoring
- [ ] Scoring weights are configurable per deployment
- [ ] At least 1 alternative layout is available as a user-switchable option
- [ ] User can see their current profile
- [ ] User can override adaptation (switch modes)
- [ ] User can opt out of adaptation entirely
- [ ] Adaptation never suppresses or reorders data to serve non-analytical interests
- [ ] EU AI Act transparency requirements met
- [ ] In-artifact mode toggle: if multiple user profiles are relevant, a mode toggle is provided
- [ ] In-artifact mode toggle: maximum 3 modes per artifact
- [ ] In-artifact mode toggle: mode switch triggers cross-fade transition (Layer 4 §4.6)
- [ ] In-artifact mode toggle: all views in the artifact respond to mode change (not just the current view)
- [ ] In-artifact mode toggle: AI analysis banner content adapts per mode (business vs technical language)
- [ ] In-artifact mode toggle: mode does not change data availability — only presentation, richness, density, and language

---

**Version:** 0.2 — Added in-artifact mode toggle specification
**Status:** Complete framework — Lock Table expansion pending
**Dependencies:** Receives user profile signals. Constrains Layers 1–4 via the constraint solver (Layer 6). References the Vessey Lock Table from the core Enterprise Brain specification.
