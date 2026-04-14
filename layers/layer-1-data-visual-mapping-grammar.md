# Layer 1 — Data–Visual Mapping Grammar

> The foundational rule set that determines which visual encoding is appropriate for a given data shape. No widget gets rendered without passing through this grammar first. This layer is the highest priority in the constraint framework — a wrong encoding is always worse than a less pretty one.

---

## 1.1 — Core Principle

Every data variable maps to a visual channel. The grammar defines which mappings are valid, which are optimal, and which are forbidden. This is not a style guide — it is a type system for visual encoding. A violation here is a bug, not a preference.

The grammar draws from three foundational bodies of work:

- **Bertin's Semiology of Graphics** — the retinal variables (position, size, shape, value, color, orientation, texture) and their suitability for different data types
- **Cleveland & McGill's perceptual ranking** — empirical ordering of how accurately humans decode different visual channels
- **Mackinlay's APT (A Presentation Tool)** — automated encoding selection based on data type expressiveness and effectiveness

Enterprise Brain's grammar extends these into a machine-executable rule set that the GenUI pipeline evaluates at render time.

---

## 1.2 — Data Type Taxonomy

Before encoding, every variable in the dataset must be classified. The system recognises seven primitive data types and three compound types.

### Primitive Types

**Quantitative Continuous** — Numeric values on an unbroken scale. Revenue ($42,301.50), temperature (23.7°C), PM2.5 concentration (99 µg/m³), percentage (34.5%).

**Quantitative Discrete** — Countable integer values. Number of employees (142), defect count (7), page views (1,204).

**Categorical Nominal** — Unordered labels. Country name, product category, department, status label (active/inactive).

**Categorical Ordinal** — Ordered labels where the distance between ranks is undefined or unequal. Severity (low/medium/high/critical), education level, customer tier (bronze/silver/gold/platinum).

**Temporal Absolute** — Points or intervals on a calendar/clock. Date (2025-04-08), timestamp (14:32:07), fiscal quarter (Q3 FY25).

**Temporal Relative** — Durations or elapsed time. Response time (3.2s), project duration (14 weeks), time since last login (48 hours).

**Boolean** — Binary true/false, yes/no, on/off. Encoded as presence/absence or two-state indicator.

### Compound Types

**Hierarchical** — A categorical variable with parent-child nesting. Continent → country → city. Requires encoding that preserves level relationships.

**Geospatial** — Latitude/longitude pairs, region codes, or polygon boundaries. Requires projection-aware encoding.

**Relational** — Entity-to-entity connections with optional directionality and weight. Org chart (directed, unweighted), trade flows (directed, weighted), social network (undirected, weighted).

---

## 1.3 — Visual Channel Inventory

Channels listed in decreasing order of perceptual accuracy for quantitative data (per Cleveland & McGill):

| Rank | Channel | Best For | Avoid For | Capacity Limit |
|------|---------|----------|-----------|---------------|
| 1 | Position on common scale | Quantitative comparison | — | Unlimited (pixel density bound) |
| 2 | Position on non-aligned scale | Quantitative comparison (faceted) | — | Unlimited |
| 3 | Length | Quantitative comparison | Ordinal | ~50–100 values |
| 4 | Angle / Slope | Rate of change | Exact value comparison | 2–3 comparisons |
| 5 | Area | Approximate magnitude | Precise comparison | 4–6 steps |
| 6 | Color saturation / lightness | Quantitative intensity | Categorical distinction | 4–6 steps |
| 7 | Color hue | Categorical distinction | Quantitative ordering | 6–8 categories (12 max) |
| 8 | Shape | Categorical distinction (≤6) | Quantitative, ordinal | 5–6 shapes |
| 9 | Texture / Pattern | Categorical (accessibility fallback) | Quantitative | 3–4 patterns |

When the number of distinct values exceeds a channel's capacity, the system must either aggregate the data, switch to a higher-capacity channel, or introduce interactive filtering to reduce the simultaneous display count.

---

## 1.4 — Encoding Rules by Data Type

### Quantitative Continuous

**Primary encodings (priority order):**
1. Position on aligned x or y axis — bar chart, dot plot, scatter
2. Length from common baseline — bar chart
3. Position along continuous axis — line chart (when temporal dimension present)
4. Area — bubble chart (only when a second quantitative variable occupies position)
5. Color saturation — heatmap cell, choropleth fill (when position consumed by other encoding)

**Derived rules:**
- Range > 2 orders of magnitude → logarithmic scale, explicitly labeled
- Comparison against reference value → encode reference as distinct visual element (line, band), not as data series
- Proportion of whole → stacked encoding, but only if ≤6 categories in the stack
- Zero baseline mandatory for length encodings. Truncated axes permitted only for position encodings with visible axis break symbol
- Negative values → diverging encoding with center baseline

**Forbidden:** Pie/donut, shape, texture, 3D depth axis.

### Quantitative Discrete

Inherits all Quantitative Continuous rules, plus:
- Count ≤ 20 distinct values → dot plot may outperform bar chart for precise comparison
- Integer formatting — no decimal places, locale-appropriate thousand separators
- If count represents a small set (e.g., Likert 1–5), treat as ordinal

### Categorical Nominal

**Primary encodings (priority order):**
1. Spatial grouping — faceting, small multiples, row/column position
2. Color hue — distinct, maximally separated hues from categorical palette
3. Shape — when color is already assigned to another variable
4. Spatial clustering — node-link layout, force-directed positioning

**Derived rules:**
- Category count > 8 → aggregate into "Other" bucket or use spatial faceting instead of color
- Never connect nominal categories with lines — lines imply ordering
- Sort categories by associated quantitative variable (largest first) unless natural ordering exists
- Labels must always be readable — horizontal bars preferred over rotated text

**Forbidden:** Size (implies ordering), saturation (implies ordering), connected line.

### Categorical Ordinal

**Primary encodings (priority order):**
1. Ordered position — ranked bar chart, ordered dot plot
2. Sequential color ramp — lightest = lowest, darkest = highest
3. Size — smallest = lowest, largest = highest (sparingly)

**Derived rules:**
- Visual ordering must always mirror data ordering — no arbitrary sorting
- Heatmaps preferred for ordinal × ordinal matrices
- Irregular spacing (e.g., gap between "high" and "critical" is semantically larger) → encode as position with explicit spacing, not evenly-distributed color stops
- > 7 ordinal levels → treat as quantitative discrete

**Forbidden:** Unordered hues, shape (no natural ordering).

### Temporal Absolute

**Primary encodings (priority order):**
1. X-axis position, left-to-right = past-to-future
2. Animation / transition — time as playback (sparingly, storytelling only)
3. Radial position — for cyclical time (hour of day, day of week, month of year)

**Granularity ladder:**

| Data Span | Default Granularity | Axis Format |
|-----------|-------------------|-------------|
| < 24 hours | Minute or hour | HH:MM |
| 1–7 days | Hour | Day HH:MM |
| 1–12 weeks | Day | DD Mon |
| 3–24 months | Week or month | Mon YYYY |
| 2–10 years | Month or quarter | Q# YYYY |
| > 10 years | Year | YYYY |

**Derived rules:**
- X-axis reserved for temporal unless compelling reason to deviate
- Granularity must match data and analytical question
- Axis ticks must be regular, human-readable formats
- Missing time periods → visually indicated (broken line, gap), never interpolated
- Sparklines for compact trend awareness

**Forbidden:** Pie chart, unordered scatter.

### Temporal Relative (Duration)

**Primary encodings:** Length (Gantt bars), position (dot on duration axis).
Duration bars must start from common anchor. Format as human-readable units: "3h 24m" not "204 minutes."

### Boolean

**Primary encodings:** Presence/absence (filled vs empty), binary color (green/red, blue/gray), icon/symbol (checkmark/cross).
True state = visually prominent. False state = visually recessive. Never the sole axis dimension — used as filter or overlay.

### Hierarchical

**Primary encodings:** Treemap (area + nesting), sunburst (radial), indented tree (label-focused), icicle diagram (rectangular sunburst).
Max 3–4 visible levels. Parent labels always visible. Color encodes top-level category; children inherit hue with varying saturation.

### Geospatial

**Primary encodings:** Choropleth (area-based data), symbol map (point-based data), cartogram (when value comparison > geographic accuracy).
Choropleth uses sequential/diverging ramp, never categorical hues. Symbol maps use single channel (size OR color), not both. Always include projection-appropriate basemap.

### Relational

**Primary encodings:** Node-link (force-directed or hierarchical), adjacency matrix (dense networks), Sankey (directed weighted flow), chord diagram (bidirectional weighted), arc diagram (sequential relationships).
Node-link degrades beyond ~200 nodes / ~500 edges → aggregate or switch to matrix. Edge weight → thickness. Direction → arrowhead. Node size → quantitative attribute. Node color → categorical attribute. Sankey flows must be conservation-complete.

---

## 1.5 — Encoding Priority Stack

When multiple valid encodings exist:

1. **Accuracy** — lowest perceptual error. Non-negotiable. Bar > bubble for magnitude comparison.
2. **Task alignment** — match encoding to the user's analytical task:
   - Compare → aligned position (bar, dot plot)
   - Trend → connected position over time (line)
   - Correlate → dual position (scatter)
   - Part-to-whole → stacked length or area
   - Distribution → binned position (histogram, box plot)
   - Lookup → tabular (data table)
   - Geospatial → map projection
3. **Information density** — more signal per pixel without clutter.
4. **Familiarity** — when accuracy is equal, prefer what the user population is most fluent with.

---

## 1.6 — Multi-Variable Encoding

### Encoding Budget

Every view has an encoding budget — available channels. Once assigned, a channel is consumed.

**Example — 4 variables:**
| Variable | Type | Assigned Channel |
|----------|------|-----------------|
| Time | Temporal | X-axis position |
| Revenue | Quantitative | Y-axis position |
| Product Line | Categorical (5) | Color hue |
| Region | Categorical (4) | Facet (small multiples) |

Maximum practical limit: 4 variables per single view (position × 2, color, and one of size/facet). Beyond 4, use linked views or interactive filtering.

### Anti-Patterns (Comprehensive)

**Dual encoding** — single variable on two channels simultaneously (revenue as height AND color). Wastes a channel. Exception: accessibility redundancy (color + pattern for colorblind users).

**Channel overload** — more variables than the view can perceptually support.

**Dual-axis charts** — two y-axes with different scales. Permitted only when: (a) shared x-axis, (b) explicitly differentiated (solid vs dashed, different colors), (c) clearly labeled scales, (d) explicitly justified. If any condition fails, use two separate charts.

**Rainbow palette for sequential data** — sequential data requires single-hue ramp. Diverging data requires two-hue ramp with neutral midpoint.

**3D projection** — depth as encoding channel. Unreliable perception, occlusion, distortion. Exception: T4 immersive scatter with rotation.

**Pie/donut beyond 6 slices** — angular channel degrades rapidly. Switch to bar chart.

**Truncated y-axis on bar charts** — length encoding requires zero baseline. Permitted only on position encodings (dot plots, line charts) with visible break indicator.

---

## 1.7 — Validation Checklist

Every encoding configuration must pass before proceeding to Layer 2:

- [ ] Every data variable has exactly one assigned visual channel
- [ ] No channel assigned to more than one variable (except accessibility redundancy)
- [ ] Assigned channel is valid for the variable's data type (per 1.4)
- [ ] Channel capacity not exceeded (per 1.3)
- [ ] Temporal axes flow left-to-right
- [ ] Zero baselines present for all length encodings
- [ ] Sequential data uses sequential ramps, not categorical hues
- [ ] Categorical data uses distinct hues, not sequential ramps
- [ ] No forbidden encoding-type combination present
- [ ] Axis labels include units
- [ ] Number formatting matches data magnitude and locale
- [ ] Multi-variable views stay within 4-variable encoding budget

---

**Version:** 0.1 — Detailed spec
**Status:** Complete — ready for Layer 2 handoff
**Dependencies:** Feeds into Layer 2 (rendering) and Layer 6 (conflict resolution).
