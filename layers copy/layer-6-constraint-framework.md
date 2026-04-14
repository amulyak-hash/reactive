# Layer 6 — Constraint Framework

> The orchestration layer that ensures all five preceding layers work together without contradiction. When guidelines from different layers conflict, this framework resolves them. This is where the Clingo/ASP constraint solver operates, and where the system's internal consistency is enforced.

---

## 6.1 — Core Principle

A GenUI configuration is a set of simultaneous decisions across five layers. Each layer generates constraints. Some constraints are compatible; some conflict. The constraint framework's job is to find a configuration that satisfies all hard constraints, maximises satisfaction of soft constraints, and degrades gracefully when the optimal configuration is infeasible.

This is not a priority list — it is a formal constraint satisfaction problem (CSP) solved at render time.

---

## 6.2 — Constraint Types

### Hard Constraints (Must Satisfy)

Violations of hard constraints make a configuration invalid. The solver eliminates any candidate that violates a hard constraint.

| ID | Source Layer | Constraint | Rationale |
|----|-------------|-----------|-----------|
| H1 | Layer 1 | Encoding must be valid for the data type | Wrong encoding is always wrong |
| H2 | Layer 1 | Zero baseline on length encodings | Truncated bars are deceptive |
| H3 | Layer 1 | No channel assigned to >1 variable (except accessibility) | Channel conflict corrupts readability |
| H4 | Layer 1 | Sequential data uses sequential ramp | Hue for intensity is perceptually wrong |
| H5 | Layer 2 | All text ≥ 11px | Accessibility minimum |
| H6 | Layer 2 | WCAG AA contrast ratio on all text | Accessibility requirement |
| H7 | Layer 2 | Colorblind-safe palette | Accessibility requirement |
| H8 | Layer 3 | Every pattern has exactly one focal widget | Composition integrity |
| H9 | Layer 3 | Shared dimensions within a pattern use consistent encoding | Internal consistency |
| H10 | Layer 4 | No circular cross-filter dependencies | Prevents infinite loops |
| H11 | Layer 4 | Every drill-down has a back path | Reversibility |
| H12 | Layer 4 | Every filter has a clear/reset path | Reversibility |
| H13 | Layer 4 | In-place drill-down depth ≤ 3 | Cognitive load limit |
| H14 | Layer 5 | Adaptation never suppresses data | EU AI Act compliance |
| H15 | Layer 5 | User can override adaptation | Transparency requirement |
| H16 | Cross-layer | Total widget count per visible view ≤ 12 | Cognitive overload prevention |
| H17 | Cross-layer | Every interactive element has visible affordance | Discoverability |

### Soft Constraints (Maximise Satisfaction)

Soft constraints express preferences. Violating a soft constraint doesn't invalidate the configuration but reduces its score. The solver tries to satisfy as many soft constraints as possible, weighted by importance.

| ID | Source Layer | Constraint | Weight | Rationale |
|----|-------------|-----------|--------|-----------|
| S1 | Layer 1 | Use highest-accuracy encoding for the data type | 0.9 | Perceptual accuracy |
| S2 | Layer 1 | Encoding matches user's task (compare → bar, trend → line) | 0.8 | Task alignment |
| S3 | Layer 2 | Richness tier matches decision context | 0.7 | Appropriate detail level |
| S4 | Layer 2 | Data ink ratio maximised | 0.5 | Visual clarity |
| S5 | Layer 3 | Pattern archetype matches decision context | 0.8 | Composition appropriateness |
| S6 | Layer 3 | Focal widget ≥ 50% of pattern area | 0.6 | Visual hierarchy |
| S7 | Layer 3 | ≤ 4 patterns per dashboard | 0.5 | Cognitive load |
| S8 | Layer 4 | Interaction latency within budget | 0.7 | Responsiveness |
| S9 | Layer 4 | Cross-filtering enabled for related widgets | 0.6 | Analytical continuity |
| S10 | Layer 5 | Cognitive style match ≥ 0.7 | 0.8 | Personalisation quality |
| S11 | Layer 5 | Decision context match ≥ 0.8 | 0.9 | Context appropriateness |
| S12 | Layer 5 | Viewport fit (no horizontal scroll, no truncation) | 0.7 | Layout quality |
| S13 | Cross-layer | Minimise total number of distinct color hues | 0.4 | Visual parsimony |
| S14 | Cross-layer | Maximise encoding consistency across patterns | 0.5 | Dashboard coherence |

---

## 6.3 — Conflict Classes

When constraints from different layers conflict, the framework classifies the conflict and applies a resolution strategy.

### Class 1 — Encoding vs. Richness

**Scenario:** Layer 1 determines a bar chart is the correct encoding. Layer 2's richness tier for this context demands T3 (explorable). But the dataset has 200 categories, making a T3 bar chart (with filtering and sorting) unwieldy.

**Resolution strategy:** Preserve the encoding (H1 takes precedence). Elevate the bar chart to T3 by adding a search filter and pagination rather than showing all 200 bars at once. The encoding stays correct; the richness adapts.

**Solver logic:**
```
:- encoding(bar), tier(T3), category_count > 50, NOT has_filter(search).
% If bar chart at T3 with >50 categories, a search filter is required.
```

### Class 2 — Pattern vs. Adaptation

**Scenario:** Layer 3 recommends a Comparison Grid pattern (6 facets). Layer 5's cognitive style profile is Analytical-Convergent (prefers 1–2 patterns, low density).

**Resolution strategy:** Reduce the grid to 3 facets (the top 3 by the primary metric). Add a "Show all 6" toggle for user-controlled expansion. The pattern archetype is preserved but its density is modulated.

**Solver logic:**
```
:- pattern(comparison_grid), facet_count(N), N > 3, 
   cognitive_style(analytical_convergent, W), W > 0.5,
   NOT has_toggle(show_all).
% Convergent users with >3 facets need a toggle to manage density.
```

### Class 3 — Interaction vs. Performance

**Scenario:** Layer 4 specifies cross-filtering across 8 linked widgets. The data volume is 500,000 rows, making real-time cross-filtering impractical within the 300ms budget.

**Resolution strategy:** Degrade interaction type. Cross-highlighting remains instant (CSS-only, no data re-query). Cross-filtering switches from on-hover to on-demand (button: "Apply filter"). This preserves the analytical link while respecting performance.

**Solver logic:**
```
:- interaction(cross_filter), linked_widget_count > 5, data_rows > 100000,
   NOT degraded_to(on_demand).
% Large datasets with many linked widgets must degrade cross-filter to on-demand.
```

### Class 4 — Richness vs. Viewport

**Scenario:** Layer 2 renders a T3 scatter plot with marginal distributions and linked table (Correlation Exploration pattern). Layer 5 detects a tablet viewport (960px).

**Resolution strategy:** Drop marginal distributions (they don't fit). Collapse the linked table into a panel drill-down (appears on tap). The scatter plot remains T3 (interactive) but the composition simplifies to fit.

**Solver logic:**
```
:- pattern(correlation_exploration), viewport_width < 1000,
   has_marginal_distributions.
% Marginal distributions require >1000px viewport.
```

### Class 5 — Adaptation vs. Familiarity

**Scenario:** Layer 5's behavioral signal suggests the user is a Holistic-Divergent explorer (prefers parallel coordinates, dense views). But the user's explicit profile selection is "Simple view."

**Resolution strategy:** Explicit user preference always overrides behavioral inference. The system acknowledges the behavioral signal internally (for future adaptation if the user changes their preference) but renders according to the explicit selection.

**Solver logic:**
```
:- cognitive_style_source(behavioral), cognitive_style_source(explicit),
   behavioral_archetype != explicit_archetype,
   active_archetype = behavioral_archetype.
% Explicit profile always wins over behavioral inference.
```

### Class 6 — Encoding vs. Encoding (Multi-Variable)

**Scenario:** Two variables both have valid claims on the color channel. Variable A is categorical (needs hue). Variable B is quantitative (needs saturation). Both are in the same view.

**Resolution strategy:** Higher-priority variable (per task alignment) gets the contested channel. The other variable is reassigned:
- If the displaced variable is categorical, assign to shape or faceting.
- If the displaced variable is quantitative, assign to size or a secondary axis.
- If no valid reassignment exists, split into two linked views.

**Solver logic:**
```
:- channel(color, var_A), channel(color, var_B), var_A != var_B,
   NOT split_view.
% Two variables cannot share the color channel — reassign or split.
```

---

## 6.4 — Priority Rules

When constraints conflict and no graceful resolution exists (all resolution strategies exhausted), layers are prioritised in this order:

| Priority | Layer | Rationale |
|----------|-------|-----------|
| 1 (highest) | Layer 1 — Data-Visual Mapping Grammar | A wrong encoding is always worse than a less pretty one. Correctness is non-negotiable. |
| 2 | Layer 5 — Adaptive Resolution | Serving the wrong user profile defeats the purpose of GenUI. A correct chart for the wrong person is waste. |
| 3 | Layer 4 — Interactions & Dependencies | Broken interactions degrade trust faster than suboptimal layout. Users who click and nothing happens stop clicking. |
| 4 | Layer 3 — Pattern Sophistication | Composition can be simplified without breaking correctness. A single chart is better than a broken pattern. |
| 5 (lowest) | Layer 2 — Widget Richness | Visual fidelity is the most gracefully degradable layer. A T2 chart with the right encoding is always better than a T4 chart with the wrong encoding. |

**Application:** When the solver cannot satisfy all constraints:
1. Start with Layer 1 constraints (all hard, non-negotiable)
2. Add Layer 5 constraints (hard + soft)
3. Add Layer 4 constraints (hard + soft)
4. Add Layer 3 constraints (soft — can relax)
5. Add Layer 2 constraints (soft — can relax most aggressively)

At each stage, if adding the next layer's constraints makes the problem infeasible, relax the lowest-priority soft constraints first.

---

## 6.5 — Fallback Chain

When the constraint solver cannot find a valid configuration even after relaxation, the system falls through a deterministic fallback chain. Each step is tried in order; the first step that produces a valid configuration is used.

### Step 1 — Relax Richness Tier

Drop every widget by one tier: T4 → T3, T3 → T2, T2 stays T2 (T2 is the minimum for full charts), T1 stays T1.

**Effect:** Removes complex interactions, physics simulations, and advanced exploration. Charts become readable but not explorable.

### Step 2 — Simplify Pattern

Replace complex patterns with simpler alternatives:
- Comparison Grid (6 facets) → Single chart + dropdown filter
- Correlation Exploration → Scatter plot only (no marginals, no linked table)
- Flow + Breakdown → Funnel chart only (no stage breakdowns)
- Temporal Narrative → Line chart with minimal annotations

**Effect:** The analytical question is still answered, but with less sophistication. The user can still drill deeper manually.

### Step 3 — Reduce Linking

Decouple all widget dependencies:
- Cross-filtering → disabled (widgets operate independently)
- Cross-highlighting → disabled
- Shared-axis linking → disabled

**Effect:** Each widget stands alone. The user must manually apply filters to each widget. Analytical continuity is lost but individual widgets remain correct.

### Step 4 — Flatten Drill-Downs

Reduce all drill-down paths to 1 level (summary → detail only, no intermediate levels).

**Effect:** The user can still access detail but cannot navigate hierarchically. Deep investigation requires a separate analytical dashboard.

### Step 5 — Default Archetype

If all else fails, render the Monitoring Dashboard archetype:
- KPI row (T1) at the top
- Single bar or line chart (T2) in the center
- Data table (T2) at the bottom
- No cross-filtering, no drill-downs, no annotations

**Effect:** The safest, most universally legible layout. Works for any data, any user, any viewport. The system gracefully admits it cannot optimise and provides a working fallback.

---

## 6.6 — Solver Architecture

### Solver Choice — Clingo/ASP

Enterprise Brain uses Answer Set Programming (ASP) via the Clingo solver for constraint resolution. ASP is chosen over other constraint formalisms because:

1. **Declarative rule expression** — constraints are expressed as logical rules, not procedural code. This makes it easy to add, modify, and audit individual constraints without side effects.
2. **Enumeration of all valid solutions** — Clingo can enumerate all valid configurations (answer sets), which the scoring function in Stage 4 of the adaptation pipeline then ranks.
3. **Graceful degradation** — ASP supports optimisation statements that relax soft constraints incrementally, producing the "best available" solution when the ideal is infeasible.
4. **Modularity** — each layer's constraints are expressed as a separate ASP module. Modules can be loaded, combined, and tested independently.

### Solver Input

The solver receives:
```
% Facts: data about the current dataset and context
data_variable(revenue, quantitative_continuous).
data_variable(region, categorical_nominal).
data_variable(time, temporal_absolute).
category_count(region, 8).
data_rows(45000).
viewport_width(1200).
cognitive_style(holistic_divergent, 0.6).
decision_context(analytical).

% Rules: constraints from Layers 1-5 (loaded as modules)
#include "layer1_encoding_rules.lp".
#include "layer2_richness_rules.lp".
#include "layer3_pattern_rules.lp".
#include "layer4_interaction_rules.lp".
#include "layer5_adaptation_rules.lp".
#include "layer6_cross_layer_rules.lp".
```

### Solver Output

The solver produces one or more answer sets, each representing a valid configuration:
```
answer_set(1):
  encoding(revenue, y_position).
  encoding(region, color_hue).
  encoding(time, x_position).
  chart_type(bar).
  richness_tier(T3).
  pattern(comparison_grid).
  dashboard_archetype(analytical).
  interaction(cross_filter, enabled).
  interaction(brush_select, enabled).
  drill_down(in_place, depth_2).
  
answer_set(2):
  encoding(revenue, y_position).
  encoding(region, facet).
  encoding(time, x_position).
  chart_type(line).
  richness_tier(T3).
  pattern(temporal_narrative).
  ...
```

### Solver Performance Budget

| Dataset Size | Max Solver Time | Fallback |
|-------------|----------------|----------|
| < 10,000 rows | 200ms | — |
| 10,000 – 100,000 rows | 500ms | Reduce candidate count to 3 |
| 100,000 – 1,000,000 rows | 1000ms | Pre-compute encoding assignments, solve only composition + interaction |
| > 1,000,000 rows | 2000ms | Use cached configuration from prior session, solve delta only |

If the solver exceeds its time budget, it returns the best partial solution found so far (Clingo supports incremental solving with anytime optimality).

---

## 6.7 — VizLinter Integration

After the constraint solver produces a configuration, VizLinter performs a secondary validation pass. VizLinter checks for empirically-derived visualisation quality rules that are not captured in the formal constraint model.

### VizLinter Rules

| Rule ID | Check | Severity |
|---------|-------|----------|
| VL1 | Bar chart: bars should not be thinner than 8px | Warning |
| VL2 | Line chart: no more than 7 series without interactive legend | Warning |
| VL3 | Scatter: overlapping points > 30% → suggest jitter or hexbin | Suggestion |
| VL4 | Pie chart: no more than 6 slices | Error (hard) |
| VL5 | Dual axis: scales must not create misleading intersections | Error (hard) |
| VL6 | Color palette: all hues distinguishable at WCAG AA threshold | Error (hard) |
| VL7 | Legend: legend entries match data series 1:1 | Error (hard) |
| VL8 | Axis: numeric axis includes unit label | Warning |
| VL9 | Time axis: ticks at regular intervals | Warning |
| VL10 | Table: column count ≤ 10 without horizontal scroll | Suggestion |
| VL11 | Small multiples: all facets share axis scale | Error (hard) |
| VL12 | Treemap: no more than 4 hierarchy levels | Warning |

VizLinter errors (hard) trigger a solver re-run with the offending configuration excluded. VizLinter warnings are surfaced to the system log. VizLinter suggestions are applied as soft constraints in the next solver run.

---

## 6.8 — Vega-Lite Generation

Once the solver produces a valid, VizLinter-approved configuration, the final step is generating the Vega-Lite specification that will render the visualisation.

The configuration-to-Vega-Lite translation is deterministic:
- Encoding assignments map to Vega-Lite `encoding` channels
- Chart type maps to Vega-Lite `mark`
- Richness tier maps to Vega-Lite `selection`, `params`, and `layer` configurations
- Interaction model maps to Vega-Lite `selection` bindings and signal definitions
- Pattern composition maps to Vega-Lite `concat`, `facet`, or `repeat` operators

The generated Vega-Lite spec is validated against the Vega-Lite schema before rendering. Any schema violation triggers a fallback to a simpler spec.

---

## 6.9 — Extension Protocol

When new data types, widget types, patterns, or adaptation dimensions are added to the system:

1. **New data type** → Add encoding rules to Layer 1 module. Add VizLinter rules if needed.
2. **New widget type** → Add to Layer 2 catalogue with tier classification. Add encoding constraints to Layer 1. Add interaction constraints to Layer 4.
3. **New pattern archetype** → Add to Layer 3 catalogue with focal/supporting widget roles. Add dependency rules to Layer 4. Add dashboard archetype mapping if applicable.
4. **New cognitive style archetype** → Add to Layer 5 with modulation table. Add Vessey Lock Table entries. Add soft constraints to Layer 6.
5. **New decision context** → Add to Layer 5 with factor values. Add dashboard archetype mapping to Layer 3. Add Lock Table entries.

**No layer is modified in isolation.** Every change triggers a validation run across all affected layers. The solver is re-run with the new rules to ensure no new conflicts are introduced.

**Version control:** Each constraint module is versioned independently. The solver loads modules by version, enabling rollback of individual rule changes without affecting the rest of the system.

---

## 6.10 — Validation Checklist

Every configuration must pass the full validation stack:

**Layer 1 (Encoding):**
- [ ] All encoding-data type pairings valid
- [ ] No channel conflicts
- [ ] Zero baselines on length encodings
- [ ] Sequential ramps for sequential data

**Layer 2 (Richness):**
- [ ] WCAG AA contrast
- [ ] Colorblind-safe palette
- [ ] Font size ≥ 11px
- [ ] Richness tier consistent with decision context

**Layer 3 (Composition):**
- [ ] Every pattern has one focal widget
- [ ] Shared dimensions use consistent encoding
- [ ] Widget count per view ≤ 12
- [ ] Pattern count per dashboard ≤ 4

**Layer 4 (Interaction):**
- [ ] No circular dependencies
- [ ] Every drill-down has back path
- [ ] Every filter has clear path
- [ ] Performance budgets met

**Layer 5 (Adaptation):**
- [ ] User can override adaptation
- [ ] No data suppression
- [ ] Transparency requirements met

**Layer 6 (Cross-layer):**
- [ ] All hard constraints satisfied
- [ ] Soft constraint satisfaction maximised
- [ ] VizLinter errors resolved
- [ ] Vega-Lite spec validates against schema
- [ ] Solver completed within time budget
- [ ] Fallback chain has a terminal state

---

**Version:** 0.1 — Detailed spec
**Status:** Complete
**Dependencies:** Orchestrates all other layers. References the Clingo/ASP solver, VizLinter, and Vega-Lite generation pipeline. Governed by the extension protocol for future additions.
