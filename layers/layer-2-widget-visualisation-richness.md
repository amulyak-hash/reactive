# Layer 2 — Widget / Visualisation Richness

> The design language governing the quality, fidelity, and visual character of individual widgets and visualisations. This layer defines how a single chart, metric card, table, or visual element looks and feels in isolation — its rendering quality, not its data-encoding logic (which is Layer 1's domain).

---

## 2.1 — Core Principle

Every pixel must earn its place. Visual richness is not decoration — it is the calibrated application of typography, color, spacing, and detail that makes data easier to read, not harder. Richness scales with the complexity and stakes of the decision being supported.

This layer answers: "Given that Layer 1 has determined *what* to show, *how polished and detailed* should it be?"

### The Invention Principle

The widget catalogue in this layer is a **library of proven forms, not a constraint boundary.** When the data demands a visual form that does not exist in the catalogue, invent one.

The process for inventing a new form:

1. **Start with Layer 1.** The new form must satisfy Layer 1's encoding rules. Identify the data types involved, the channels being used, and verify that each mapping is valid. If the encoding violates Layer 1, the form is wrong regardless of how beautiful it is.

2. **Assign a richness tier.** Determine whether the new form is T1 (glanceable), T2 (readable), T3 (explorable), or T4 (immersive). This determines the rendering rules it must follow — typography scale, color system, interaction depth, accessibility requirements.

3. **Follow the design language.** The new form must use the same color palettes (§2.3), typography scale (§2.3), data ink ratio principles (§2.3), and accessibility rules (§2.5) as every other widget. Novel form does not mean novel styling — consistency is what makes a new form feel native to the system rather than grafted on.

4. **Document the form.** When you invent a new visualisation, add a brief comment in the code describing: what data types it encodes, which channels it uses, what tier it operates at, and what analytical task it serves. This is how the catalogue grows.

**Examples of valid invention:**
- A branching probability tree (hierarchical × quantitative, T3) — the catalogue has treemaps but not branching trees with probability-weighted edges
- A radial timeline (temporal × categorical × quantitative, T3-T4) — the catalogue has line charts and radial views but not a time-spiral
- A layered geological cross-section (geospatial × ordinal depth × quantitative, T4) — entirely novel, but the encoding is position × position × color saturation, which Layer 1 supports
- A divergence wedge (temporal × quantitative × categorical, T4) — expected vs actual lines diverging with contributing factor bubbles inside the gap. Not a standard form, but every channel maps correctly: time on x, value on y, bubble position inside the deviation area, bubble size for contribution proportion, bubble hue for category

**Invalid invention:**
- Using a novel form to bypass Layer 1 rules (e.g., a "creative" spiral chart for comparing categorical magnitudes — just because it looks unique doesn't make it a better encoding than a bar chart)
- A novel form that violates accessibility (no colorblind-safe palette, text below 11px, no affordance on interactive elements)

The best data experiences in the world (The Pudding, Visual Cinnamon, Shirley Wu) invent a new form for nearly every piece — but every invented form is grounded in perceptual science. The novelty is in the form, not in violating encoding rules.

---

## 2.2 — Richness Tiers

The system operates across four richness tiers. Each tier defines a target level of visual detail, interactivity, and information density. The tier is selected based on the decision context (Layer 5), the dashboard archetype (Layer 3), and the available viewport (Layer 5 environmental factors).

### Tier 1 — Glanceable

**Purpose:** Ambient awareness. "Is everything okay, or do I need to pay attention?"

**Characteristics:**
- Maximum information compression, minimum interaction
- Single metric focus — one number, one trend direction, one status
- Renders in ≤2 seconds, readable in ≤1 second
- No axes, no legends, no explicit labels beyond the metric value and its label
- Color encodes status (semantic: success/warning/critical), not data categories
- Typography: large metric value (24–32px), small label (12–13px)

**Widget types at T1:**
- KPI card — single number with trend indicator (▲/▼), optional sparkline
- Status indicator — colored dot or badge (green/amber/red)
- Mini gauge — radial or linear, single value against a range
- Sparkline — tiny inline time-series, no axes, hover-only value display
- Progress bar — single value against a target
- Intelligence layer card — a clickable portal card that previews a deeper analytical view. Contains: title + entity badge (small colored pill), one-line description, headline metric, and a Canvas-rendered mini-visualisation preview (sparkline, node cluster, curve, dot pattern). Clicking fires `sendPrompt()` to generate the full deep-dive view as a new artifact. See §2.8 for full specification.
- AI analysis banner — a narrative intelligence element (not a data widget). Contains the system's natural-language interpretation of the current state: what's happening, where deviation is, what evidence suggests. See §2.9 for full specification.

**Rendering rules:**
- No borders around the widget itself — T1 widgets float on surface cards
- Background: `var(--color-background-secondary)` surface, no border, `border-radius: md`
- Metric value: 500 weight, primary text color
- Label: 400 weight, secondary text color, 12–13px
- Trend indicator: semantic color (green for positive, red for negative, gray for neutral) — never use the data palette for T1 trends
- Sparkline: single color (muted blue or gray), 1.5px stroke, no fill, no points — except the terminal point which may be highlighted
- If a threshold is breached, the entire card background shifts to the semantic alert color (e.g., `var(--color-background-danger)`) — this is the "exception-first" principle from Layer 4

**Spacing:**
- Padding: 12–16px internal
- Grid: T1 widgets appear in rows of 2–4, with 12px gap
- Never standalone — T1 widgets are always part of a row or grid, never isolated

### Tier 2 — Readable

**Purpose:** Routine analysis and reporting. "Show me what happened."

**Characteristics:**
- Full axes, legends, and labels
- Hover tooltips for precise value inspection
- Standard chart types rendered with complete chrome
- Readable without interaction, but interaction adds precision
- No drill-downs — the chart shows a fixed dataset

**Widget types at T2:**
- Bar chart (horizontal or vertical, single or grouped)
- Line chart (single or multi-series)
- Scatter plot (without linked brushing)
- Data table (sortable, but not filterable)
- Heatmap (static, hover for values)
- Area chart (single or stacked)
- Donut/pie chart (≤6 slices only)

**Rendering rules:**
- Axes: 11px, secondary text color, grid lines at 0.5px in tertiary border color
- Grid lines: visually recessive — never stronger than the data marks
- Data marks: the loudest visual element. Bars have solid fills from the data palette. Lines are 2px stroke. Scatter dots are 5–6px radius.
- Legends: positioned above or below the chart (never overlapping data). Custom HTML legend preferred — 10px color swatch + 12px label + value.
- Tooltips: appear on hover. Background: primary surface. Border: 0.5px tertiary. Border-radius: md. Content: dimension label + formatted value. Font-size: 12px.
- Number formatting: locale-aware, magnitude-appropriate (K, M, B suffixes). Always include units.
- Axis labels: include the variable name and unit. "Revenue ($M)" not just "Revenue."
- Chart title: not embedded in the chart — the title lives in the pattern container (Layer 3). The widget itself is title-less.

**Spacing:**
- Chart area padding: 8–12px from axes to data marks
- Wrapper: no card border on the chart itself — the chart flows within the pattern layout
- Minimum height: 240px. Maximum aspect ratio: 3:1 (very wide charts lose readability)

### Tier 3 — Explorable

**Purpose:** Deeper investigation. "Let me look at this from different angles."

**Characteristics:**
- Everything in T2, plus interactive filtering, sorting, and faceting
- Cross-filtering with linked widgets (defined in Layer 4)
- Annotations — system-generated or user-added contextual callouts
- Zoomable and pannable (for time-series and scatter)
- Small multiples / faceted views
- Sortable and filterable data tables with search

**Widget types at T3:**
All T2 widgets, elevated with:
- Filter controls (dropdown, toggle, range slider) embedded in the widget header
- Brush selection on scatter/line for cross-filtering
- Sortable column headers on tables
- Search/filter input on tables
- Expandable rows on tables (reveal sub-detail)
- Zoom/pan on time-series with reset affordance
- Annotations: reference lines, event markers, threshold bands, callout labels

**Rendering rules — incremental over T2:**
- Filter controls: positioned in a compact header bar above the chart, not in a separate sidebar
- Active filters: displayed as removable tags/chips with a "clear all" affordance
- Brushing: selected range highlighted with a translucent overlay; unselected data dims to 0.15 opacity
- Annotations: reference lines are dashed, 1px, in a muted semantic color. Event markers are vertical lines with a small label flag. Threshold bands are shaded rectangles at 0.05 opacity.
- Small multiples: each facet shares the same axis scale. Individual facet titles in 13px secondary text. Grid gap: 12–16px.
- Table filters: text input with magnifying glass icon, inline above the table. Dropdown filters in column headers.
- Table pagination: show 25 rows per page with "Show all" option (only if ≤200 rows)

**Interaction affordances (must be visible):**
- Sortable columns: small arrow indicator in header (▲/▼)
- Filterable dimensions: funnel icon or filter icon in header
- Zoomable areas: cursor changes to grab/zoom icon on hover
- Brushable areas: crosshair cursor on scatter/line charts
- Every filter has a clear/reset path. Every zoom has a "fit to data" reset button.

### Tier 4 — Immersive

**Purpose:** Structure discovery and complex exploration. "Show me the shape of this system."

**Characteristics:**
- Full interactive canvases with physics simulation, animation, or 3D
- Used sparingly — only when the data's inherent structure (network, flow, geographic) demands spatial freedom
- High cognitive load — always paired with a T1 or T2 summary widget as an anchor
- May require onboarding or guided entry points

**Widget types at T4:**
- Network graph with force-directed layout, zoom/pan, node expand/collapse
- Animated Sankey / flow diagram with temporal transitions
- 3D scatter with rotation (rare — only for scientific/technical users)
- Geographic exploration canvas with multi-layer toggle
- Parallel coordinates plot (for high-dimensional exploration)

**Rendering rules — incremental over T3:**
- Canvas-based rendering (WebGL or Canvas 2D) for performance with large datasets
- Progressive rendering: show the overall structure first, then refine detail as the layout stabilises
- Node labels: hidden by default, appear on hover or zoom. At high zoom, show labels for visible nodes.
- Physics simulation: must settle within 3 seconds. Provide a "freeze layout" button.
- 3D views: always include axis markers and a "reset view" button. Disable by default — user must opt in.
- Performance budget: 60fps minimum. If frame rate drops below 30fps, reduce rendered element count (LOD system) or switch to raster.

**Canvas rendering rules (for React `useRef` + `useEffect` pattern):**
- Node rendering: use `ctx.createRadialGradient()` with multiple color stops for glowing/radiating node effects. Do not use CSS box-shadow or filter blur — these do not apply to Canvas content. Typical pattern: bright center → color midpoint → transparent edge, with a radius 2–3× the node's visual radius.
- Connection lines: use `ctx.createLinearGradient()` along the line path, inheriting the source node color at the start and the target node color at the end. Use quadratic or cubic bezier curves (`ctx.quadraticCurveTo()` / `ctx.bezierCurveTo()`), not straight lines — organic curves convey flow and relationship better than rigid geometry.
- Text rendering: all labels, metrics, and annotations are rendered via `ctx.fillText()` with explicit font size, weight, and family. Match the Layer 2 typography scale. Never use HTML overlays positioned on top of Canvas — they break during scroll, resize, and screenshot/PDF export.
- Hit-testing for interactivity: track node/entity positions in a data structure. On Canvas `click` / `mousemove` events, calculate distance from cursor to each entity center. Highlight on proximity (cursor within radius + padding). Change cursor to `pointer` when over a clickable entity. Fire `sendPrompt()` on click.
- Animation: use `requestAnimationFrame` for smooth transitions. Ease-out for node positioning. Keep animations under 500ms. Respect `prefers-reduced-motion` — skip all animation if set.
- Resolution: render at `window.devicePixelRatio` scale for crisp display on Retina/HiDPI screens. Set `canvas.width = containerWidth * dpr` and `canvas.height = containerHeight * dpr`, then `ctx.scale(dpr, dpr)`.

**Mandatory companion:**
T4 widgets never appear alone. They must be paired with a T1 or T2 summary that gives the user an anchor point before they enter the immersive view. The summary answers "what am I about to explore?" — the T4 widget answers "what does the structure look like?"

---

## 2.3 — Design Language

### Typography

All visualisation text follows a strict typographic scale. No ad-hoc font sizes.

| Element | Size | Weight | Color | Line Height |
|---------|------|--------|-------|-------------|
| Metric value (T1) | 22–32px | 500 | Primary | 1.2 |
| Metric label (T1) | 12–13px | 400 | Secondary | 1.4 |
| Chart axis label | 11px | 400 | Secondary | 1.3 |
| Chart axis title | 12px | 400 | Secondary | 1.3 |
| Tooltip title | 13px | 500 | Primary | 1.4 |
| Tooltip value | 12px | 400 | Secondary | 1.4 |
| Legend label | 12px | 400 | Secondary | 1.3 |
| Annotation label | 11px | 400 | Contextual (semantic) | 1.3 |
| Table header | 12px | 500 | Secondary | 1.3 |
| Table cell | 13px | 400 | Primary | 1.5 |
| Small multiples title | 13px | 500 | Secondary | 1.3 |
| Filter chip | 12px | 400 | Primary | 1.2 |
| AI analysis section label | 11px | 500 | Accent/semantic | 1.3 |
| AI analysis body | 15–16px | 400 | Primary (italic or serif) | 1.6 |
| Intelligence card title | 15px | 500 | Primary | 1.3 |
| Intelligence card description | 12px | 400 | Secondary | 1.4 |
| Intelligence card metric | 22–28px | 500 | Primary | 1.2 |
| Intelligence card badge | 11px | 500 | Badge-specific color | 1.1 |
| Breadcrumb text | 13px | 400 | Secondary | 1.3 |
| Breadcrumb current | 13px | 500 | Primary | 1.3 |
| Section label (small caps) | 11–12px | 500 | Secondary | 1.3 |
| Canvas node label | 13px | 500 | Primary (on dark) | — |
| Canvas node metric | 12px | 400 | Accent color | — |
| Canvas annotation | 11px | 400 | Secondary | — |

**Rules:**
- Only two weights: 400 (regular) and 500 (medium). Never 600 or 700 in visualisations.
- Sentence case everywhere. No Title Case, no ALL CAPS. This applies to axis labels, legends, titles, annotations.
- Number formatting: right-aligned in tables, left-aligned in tooltips. Use locale-aware formatting. Magnitudes: K (thousands), M (millions), B (billions). Always include the unit.
- No font-size below 11px anywhere in any tier.

### Color System

The color system is divided into four palettes, each with a distinct purpose. Palettes must never be mixed — data colors are not used for status, and status colors are not used for data.

**1. Data Palette (Categorical)**
6–8 distinguishable hues for encoding categorical dimensions. Selected for maximum perceptual distance, tested for deuteranopia and protanopia accessibility.

| Index | Name | Hex (Light) | Usage |
|-------|------|-------------|-------|
| D1 | Purple | #7F77DD | Primary category 1 |
| D2 | Teal | #1D9E75 | Primary category 2 |
| D3 | Coral | #D85A30 | Primary category 3 |
| D4 | Pink | #D4537E | Primary category 4 |
| D5 | Blue | #378ADD | Primary category 5 |
| D6 | Amber | #BA7517 | Primary category 6 |
| D7 | Green | #639922 | Primary category 7 (use sparingly — close to Teal) |
| D8 | Gray | #888780 | "Other" / "Unknown" category |

Assignment priority: D1 → D2 → D3 → ... Categories are assigned in the order they appear in the legend. D8 (Gray) is always reserved for "Other" or aggregated/unspecified categories.

**2. Sequential Palette (Quantitative Intensity)**
Single-hue ramps for encoding quantitative values on a continuous scale.

Available ramps (each with 5–7 perceptually even stops):
- Blue ramp: #E6F1FB → #0C447C
- Green ramp: #EAF3DE → #27500A
- Purple ramp: #EEEDFE → #26215C
- Amber ramp: #FAEEDA → #412402

Default: Blue ramp. Switch to others when blue is already consumed by the data palette or when the domain has a natural color association (e.g., green for vegetation, amber for temperature).

**3. Diverging Palette (Above/Below Reference)**
Two-hue ramps with a neutral midpoint for encoding deviation from a center value.

- Blue → Gray → Red: #0C447C → #D3D1C7 → #791F1F (default)
- Teal → Gray → Coral: #085041 → #D3D1C7 → #4A1B0C (alternative)

The midpoint must correspond to the reference value (zero, target, average). Values above the reference encode in one hue; values below encode in the other.

**4. Semantic Palette (Status)**
Fixed-meaning colors for operational status. These never change meaning and never overlap with the data palette.

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Success | var(--color-background-success) | var(--color-text-success) | var(--color-border-success) |
| Warning | var(--color-background-warning) | var(--color-text-warning) | var(--color-border-warning) |
| Danger | var(--color-background-danger) | var(--color-text-danger) | var(--color-border-danger) |
| Info | var(--color-background-info) | var(--color-text-info) | var(--color-border-info) |
| Neutral | var(--color-background-secondary) | var(--color-text-secondary) | var(--color-border-tertiary) |

**Palette isolation rule:** If a chart uses D5 (Blue) for a data category, the sequential palette must switch to a non-blue ramp. If a chart uses D3 (Coral) for data, the diverging palette must switch to the Teal–Coral alternative. Semantic colors (success green, danger red) must never be used as data encoding — a green bar does not mean "good" unless the variable is a status.

### Data Ink Ratio

Inspired by Tufte's principle: maximise the proportion of ink used to display data, minimise the proportion used for non-data elements.

**Rules:**
- Grid lines: 0.5px, tertiary border color, never darker than data marks
- Axis lines: 0.5px, secondary border color. On bar charts, the baseline axis is slightly stronger (1px) — all others are 0.5px.
- Chart background: transparent. No filled backgrounds, no gradient fills, no decorative patterns.
- Borders around the chart area: none. The chart floats in whitespace.
- Data marks: always the most visually prominent element. Bars have solid fills at full opacity. Lines are 2px. Dots are 5–6px.
- Decorative elements: zero. No icons in chart areas, no illustrated backgrounds, no watermarks.
- Legends: compact, positioned outside the chart area, never overlapping data.
- Annotations: dashed lines at 1px, muted colors. Annotation text smaller than data labels.

### Spacing and Layout

**Internal chart spacing:**
- Padding between axis and data: 8px minimum
- Bar gap ratio: 0.3–0.5 of bar width (grouped bars: 0.1 internal gap, 0.4 group gap)
- Scatter point spacing: no minimum (points may overlap) — if >30% overlap, introduce jitter or switch to hexbin
- Small multiples gap: 16px between facets

**Widget-level spacing:**
- T1 widget grid: 12px gap
- T2/T3 chart: flows naturally in the pattern layout, no card wrapper
- T4 canvas: full-width, 0px margin — the canvas IS the container

---

## 2.4 — Responsive Degradation

When viewport shrinks below breakpoints, richness degrades gracefully:

| Viewport Width | Max Tier | Adaptations |
|---------------|----------|-------------|
| > 1200px | T4 | Full fidelity |
| 960–1200px | T3 | Reduce small multiples columns (4 → 3 → 2) |
| 600–960px | T2 | Collapse facets into single chart + filter dropdown. Tables become scrollable. |
| < 600px | T1 | Charts simplify to sparklines + KPI cards. Tables become vertical card stacks. |

**Critical rule:** Responsive degradation never changes the encoding (Layer 1). A bar chart stays a bar chart — it just loses interactive features (T3 → T2) or collapses to a summary (T2 → T1). If the encoding requires more space than available (e.g., a 100-point scatter plot on a 320px screen), the system falls back to a sorted data table rather than rendering an unreadable chart.

---

## 2.5 — Accessibility

All tiers must meet these accessibility requirements:

- **WCAG AA contrast** — text on any background meets 4.5:1 ratio (3:1 for large text ≥18px)
- **Color alone never encodes meaning** — if color distinguishes categories, provide a secondary channel (pattern, label, position). At T2+, legend text serves as the secondary channel. At T1, metric labels serve as the secondary channel.
- **Colorblind-safe palette** — the data palette is tested against deuteranopia, protanopia, and tritanopia simulations. All 8 hues must remain distinguishable under simulation.
- **Focus indicators** — all interactive elements (sort headers, filter buttons, zoom controls) have visible focus rings (2px solid, info color)
- **Screen reader support** — charts include an `aria-label` summarising the key insight ("Bar chart showing revenue by region, highest in Asia at $42M"). Data tables use semantic `<table>` markup with `<th>` headers.
- **Reduced motion** — users with `prefers-reduced-motion` see no animations, transitions, or physics simulations. All state changes are instant.

---

## 2.6 — Widget Catalogue (Extensible)

The following catalogue documents proven forms. It is a starting point, not a boundary. When the data demands a form not listed here, invent one following the Invention Principle (§2.1). Add new forms to this table as they are created.

| Widget | Data Types | Tier | Primary Task | Encoding Channels |
|--------|-----------|------|-------------|-------------------|
| KPI Card | Single quant + trend | T1 | Monitor | Value + sparkline + semantic color |
| Sparkline | Temporal × quant | T1 | Trend awareness | X-position (time) + Y-position (value) |
| Status Badge | Boolean / categorical | T1 | Status check | Color hue (semantic) |
| Progress Bar | Quant (proportion) | T1 | Goal tracking | Length + semantic color |
| Bar Chart | Categorical × quant | T2 | Compare | X-position (category) + Y-length (value) + color (optional grouping) |
| Line Chart | Temporal × quant | T2 | Trend | X-position (time) + Y-position (value) + color (series) |
| Scatter Plot | Quant × quant | T2–T3 | Correlate | X-position + Y-position + color (category) |
| Data Table | Any | T2–T3 | Lookup | Row/column position + inline formatting |
| Heatmap | Ordinal × ordinal × quant | T2–T3 | Pattern detect | X-position + Y-position + color saturation |
| Area Chart | Temporal × quant | T2 | Trend + volume | X-position + Y-position + fill area |
| Stacked Bar | Cat × quant × cat | T2 | Part-to-whole | X-position + Y-length + color (stack segments) |
| Donut Chart | Cat × quant (≤6 slices) | T2 | Part-to-whole | Angle + color hue |
| Treemap | Hierarchical × quant | T3 | Part-to-whole (nested) | Area + nesting + color hue |
| Sankey | Relational + quant flow | T3–T4 | Flow analysis | Node position + link width (flow volume) + color |
| Small Multiples | Any (faceted by cat) | T3 | Compare across facets | Repeated encoding + spatial faceting |
| Bullet Chart | Quant vs target | T2 | Performance vs goal | Length (actual) + reference mark (target) + range bands |
| Box Plot | Quant distribution | T2–T3 | Distribution compare | Position + length (IQR) + marks (median, outliers) |
| Histogram | Quant (binned) | T2 | Distribution shape | X-position (bins) + Y-length (frequency) |
| Parallel Coords | Multi-quant | T4 | High-dim exploration | Multiple Y-axes + polylines |
| Network Graph | Relational | T4 | Structure discovery | Node position + link + color + size |
| Choropleth | Geospatial × quant | T2–T3 | Spatial distribution | Geographic position + color saturation |
| Symbol Map | Geospatial × quant | T2–T3 | Spatial comparison | Geographic position + size (or color) |
| Intelligence Layer Card | Any (preview of deeper analysis) | T1 | Navigate / orient | Metric + Canvas mini-viz + badge + sendPrompt |
| AI Analysis Banner | None (narrative element) | T1 | Situational awareness | Natural language text |
| Pipeline / Flow Bar | Relational + quant (sequential) | T3–T4 | Flow analysis | Canvas: node position + connection + metric overlay |
| Causal Chain | Relational (directed, weighted) | T4 | Root cause discovery | Canvas: node-link + gradient connections + annotations |
| Divergence Wedge | Temporal × quant × categorical | T4 | Variance decomposition | Canvas: expected/actual lines + area fill + factor bubbles |
| Adaptive Radial | Any × categorical (role/perspective) | T4 | Multi-perspective view | Canvas: central node + radiating role nodes |
| Context Ribbon | Multi-metric summary (3-5 KPIs) | T1 | Context preservation | Inline pills: value + trend + status dot |
| Scroll Narrative Card | None (narrative element) | T1 | Scroll-driven storytelling | Text card triggering viz state change via IntersectionObserver |

---

## 2.8 — Intelligence Layer Card (Detailed Spec)

The intelligence layer card is a T1 clickable portal that previews a deeper analytical view. It is the primary navigation element in the Enterprise Brain home view. Each card represents a distinct analytical lens on the data.

### Structure

```
┌─────────────────────────────────────────────────┐
│  Title ·  BADGE                    ┌──────────┐ │
│  One-line description              │ Canvas   │ │
│                                    │ mini-viz │ │
│  28px METRIC VALUE                 │ preview  │ │
│                                    └──────────┘ │
└─────────────────────────────────────────────────┘
```

### Component elements

**Title:** 15px, weight 500, primary text. The name of the analytical lens (e.g., "Root cause analysis", "Anomaly detection", "Confidence landscape").

**Badge:** Small colored pill (border-radius full, 11px text, weight 500, padding 2px 8px). Contains a short identifier for the entity or scope (e.g., "BF-3", "Q3", "APAC"). Badge color comes from the data palette — each entity gets a consistent hue across all views.

**Description:** 12px, weight 400, secondary text. One line describing what this lens analyses. Specific, not generic — "Why BF-3 superheat is dropping — traced from raw material to grade risk" not "Analyse root causes."

**Headline metric:** 22–28px, weight 500, primary text. The single most important number for this lens. Include unit. Use semantic color if the value is above/below threshold.

**Canvas mini-visualisation:** A tiny preview rendered in a `<canvas>` element (typically 80–120px wide, 40–60px tall) via `useEffect`. This is a sketch — just enough to hint at the visual form inside the full view. No axes, no labels, no interaction.

Mini-viz types (selected based on the data shape of the underlying lens):
- **Sparkline** — for temporal trends
- **Node cluster** — 3–5 dots with connecting lines, for relational/causal data
- **Curve / wave** — for confidence/probability distributions
- **Dot scatter** — for multi-point pattern data
- **Mini bar cluster** — for categorical comparison
- **Flow sketch** — 2–3 connected stages for pipeline data

### Rendering rules

- Card background: subtle surface differentiation from the page background. On dark theme: slightly lighter than the page (e.g., `rgba(255,255,255,0.04)`). On light theme: white with 0.5px border.
- Border-radius: lg (12px)
- Padding: 16–20px
- Cursor: pointer on hover. Subtle background brightness shift on hover.
- Grid layout: 2 columns for 4 cards, 2–3 columns for 5–6 cards. Gap: 16px.
- `onClick` fires `sendPrompt()` with a specific, detailed prompt describing the full view to generate.

### sendPrompt specificity rule

The prompt fired by each card must contain:
1. The lens name ("root cause analysis")
2. The entity scope ("for BF-3")
3. The specific visualisations expected ("show causal chain from raw material to grade risk, variable waterfall, and 7-day timeline")

---

## 2.9 — AI Analysis Banner (Detailed Spec)

The AI analysis banner is a narrative intelligence element — not a data widget. It contains the system's natural-language interpretation of the current situation. It appears at the top of every view (home and drill-down) and is scoped to that view's context.

### Structure

```
┌──────────────────────────────────────────────────────────┐
│ ▎ AI ANALYSIS                                            │
│ ▎                                                        │
│ ▎ Evidence suggests enterprise production is tracking 8% │
│ ▎ below expected output. The primary deviation is        │
│ ▎ concentrated in [Entity B]. Diagnostic analysis        │
│ ▎ indicates repeated downtime events on [Subprocess 3],  │
│ ▎ potentially compounded by a 12-hour delay from         │
│ ▎ [Supplier X].                                          │
└──────────────────────────────────────────────────────────┘
```

### Component elements

**Section label:** "AI ANALYSIS" (or scoped: "AI ANALYSIS · LINE 3"). 11px, weight 500, accent color (e.g., teal, coral, or contextual), letter-spacing 0.06em, uppercase. This is the only element in the system that uses uppercase — it is a deliberate exception to the sentence-case rule, used to distinguish the AI voice from data labels.

**Body text:** 15–16px, weight 400, primary text. Use a serif or italic style to distinguish this from data-driven text — this signals that the content is interpretive, not raw metric display. Line-height 1.6 for readability. 2–3 sentences maximum.

**Content rules:**
- Always specific: name entities, cite numbers, trace causal chains
- Always interpretive: this is the system's opinion, not a data dump. "Evidence suggests..." not "The value is..."
- Always scoped: home view banner discusses the enterprise-wide picture; drill-down view banners discuss only their specific entity/lens
- Never bullet points — flowing prose only

### Rendering rules

- Left border accent: 3–4px solid, accent color (matches the section label color)
- Background: muted, desaturated version of the accent color at very low opacity. On dark theme: `rgba(accentColor, 0.06)`. On light theme: `rgba(accentColor, 0.05)`.
- Padding: 16–20px
- Border-radius: 8px (md) or 0 with left border only
- Margin-bottom: 20–24px (separates from the content below)
- No interaction — the banner is read-only

---

## 2.10 — Context Ribbon (Detailed Spec)

The context ribbon is a persistent, compact strip pinned to the top of every drill-down view. It preserves the home view's critical metrics so the user never loses the big picture while exploring details.

### Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← Overview    Yield 71.2% ▼    Defects 2.4/cm² ▲    Contam. 3 ev. │
└──────────────────────────────────────────────────────────────────────┘
```

### Component elements

**Back label:** "← Overview" in accent color. Clicking navigates back to home view. Arrow animates on hover (shift 3px left).

**Metric pills:** 3-5 inline compact metrics from the home view. Each pill contains:
- Abbreviated metric label (11px, secondary text)
- Value in monospace (12px, 500 weight, primary text)
- Trend arrow (▲/▼, 10px, semantic color)
- Status dot (6px circle, semantic color: success/warning/danger)

Clicking any pill navigates back to the home view.

### Rendering rules

- Height: 36-40px. Position: sticky at top of drill-down view (pinned during scroll).
- Background: slightly elevated surface. Dark theme: `rgba(255,255,255,0.03)`. Light theme: `rgba(0,0,0,0.02)`.
- Bottom border: 1px subtle (`var(--color-border-tertiary)` equivalent).
- Pill gap: 16-20px. Pills are horizontally centered or left-aligned after the back label.
- Fade-in: 200ms delay after view transition completes, then 300ms opacity fade.
- Fade-out: when navigating back to home, ribbon fades (200ms) before home transition starts.
- **Threshold alert:** if a ribbon metric breaches a threshold while the user is in a drill-down, the pill's status dot briefly enlarges (6px→10px→6px, 400ms) and the pill border glows (accent color pulse, 2s, then settles).
- The ribbon does NOT appear on the home view itself — only on Level 1+ drill-down views.

### Which metrics to show

Select 3-5 metrics that are:
1. The most critical indicators of system health (the ones the AI analysis banner references)
2. Likely to change or breach thresholds (so the ribbon serves as a live ambient alert)
3. Relevant to the current drill-down context (if drilling into a specific entity, include that entity's headline metric alongside 2-3 enterprise-wide metrics)

---

## 2.11 — Scroll Narrative Card (Detailed Spec)

A text card used in scroll-driven storytelling sequences. Each card represents one step in a narrative, and its intersection with the viewport center triggers a state change in the paired sticky visualization.

### Structure

A simple text block with optional accent:
- **Step indicator:** small, muted (e.g., "01" or a subtle dot)
- **Headline:** 15px, 500 weight, primary text. One sentence describing what this step reveals.
- **Body (optional):** 13px, 400 weight, secondary text. 1-2 sentences of supporting evidence or explanation.

### Rendering rules

- Min-height: 50-60vh per step (ensures only one step is centered at a time during scroll).
- Active step (in viewport center): opacity 1.0. All other steps: opacity 0.2-0.3.
- Transition between active states: 400ms ease.
- Steps are positioned in a scrolling column alongside (or below) a sticky visualization.
- The scroll column has generous padding-top and padding-bottom (~40vh) so the first and last steps can reach the viewport center.

---

## 2.7 — Validation Checklist

Every widget rendering must pass before proceeding to Layer 3 composition:

- [ ] Widget tier matches the decision context requirements from Layer 5
- [ ] Typography follows the scale table exactly — no ad-hoc sizes
- [ ] Color assignments come from the correct palette (data/sequential/diverging/semantic)
- [ ] No palette mixing (data colors used for status or vice versa)
- [ ] Data marks are the most visually prominent element
- [ ] Grid lines and axes are visually recessive
- [ ] Number formatting is locale-aware with appropriate magnitude suffixes
- [ ] All text meets WCAG AA contrast ratio
- [ ] Data palette passes colorblind simulation
- [ ] Interactive elements have visible affordances and focus indicators
- [ ] Chart has `aria-label` summary
- [ ] No font-size below 11px
- [ ] Responsive degradation defined for all breakpoints
- [ ] Context ribbon: present on all drill-down views (not on home view)
- [ ] Context ribbon: contains 3-5 critical metrics with trend + status dot
- [ ] Context ribbon: fades in after drill-down transition completes
- [ ] Scroll narrative cards (if scroll-driven mode): min-height 50vh per step, active step opacity 1.0, inactive 0.2-0.3
- [ ] Canvas idle animations present: node drift, terminal dot pulse, edge breathing

---

**Version:** 0.4 — Added Invention Principle, context ribbon §2.10, scroll narrative card §2.11, marked catalogue as extensible
**Status:** Complete
**Dependencies:** Receives encoding decisions from Layer 1. Feeds rendered widgets into Layer 3 (composition) and Layer 6 (conflict resolution, where richness tier is the most degradable layer).
