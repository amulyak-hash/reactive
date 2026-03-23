# Enterprise Brain - CLAUDE.md

## Project Overview
Enterprise Brain is a React dashboard for Tata Steel that visualizes production data across plants, lines, and zones. It features a **2-axis lens system** that adapts the entire dashboard experience based on the viewer's role and cognitive style.

## Tech Stack
- **React 19** with Vite
- **Zustand** for state management (src/store.js)
- **Canvas-based visualizations** (src/canvas/) — custom 2D canvas components with requestAnimationFrame loops
- **Inline styles** — no CSS-in-JS library; uses inline style objects + a global index.css for data-attribute-driven morphing
- **Theme tokens** in src/theme/tokens.js (colors, fonts, utilities)

## Commands
- `npm run dev` — start dev server (Vite, port 5173)
- `npm run build` — production build
- `npm run lint` — ESLint
- No test suite currently

## Architecture

### Navigation Layers
`onboarding` → `dashboard` (CommandCenter) → `plantB` (PlantDrilldown) → `zones` (ZoneView) → `story` (StoryView)

### 2-Axis Lens System (Key Feature)
The dashboard adapts based on two axes selected via the Lens Menu:

**Axis 1 — Role Archetype** (`activeArchetype` in store):
- `rtr` (Real-Time Responder), `oo` (Ops Optimizer), `ap` (Analytical Planner), `sdm` (Strategic Decision Maker), `ss` (Safety Sentinel)

**Axis 2 — Cognitive Style** (`activeCogStyle` in store):
- Speed cluster: `rapid-decider`, `decisive-actor`
- Depth cluster: `deliberate-analyst`, `deep-investigator`
- Systems cluster: `systems-thinker`, `pattern-recognizer`
- People cluster: `collab-facilitator`, `consensus-builder`, `narrative-interpreter`, `intuitive-scanner`

**What changes per combination:**
1. **Signal packs** — AIBriefing shows different alert cards per archetype (ARCHETYPE_SIGNALS)
2. **KPI rails** — Header status pills change per archetype (ARCHETYPE_KPIS)
3. **Section topology** — Sections reorder/hide per archetype via render-array pattern (DASHBOARD_SECTIONS + ARCHETYPE_SECTION_OVERRIDES)
4. **Default story lens** — enterStory() picks combo-aware lens (COMBO_DEFAULTS)
5. **Zone metrics** — Intelligence cards show role-specific metrics (ZONE_ARCHETYPE_METRICS)
6. **Canvas emphasis** — FactoryMap adjusts flow arrows/pulses by cogCluster
7. **Combo transforms** — Specific combos get unique section treatments (COMBO_SECTION_TRANSFORMS)
8. **Surface badges** — Panel cards show archetype-specific metric badges (CARD_SURFACE_METRICS)
9. **Adaptive story steps** — Speed cluster compresses 4→2 steps via source-index mapping; depth/systems/people clusters add annotations (STORY_ADAPTIVE_CONFIG + STORY_ANNOTATIONS)
10. **Autoplay config** — Per-cogStyle autoplay on/off, interval, scrubber scale, instant display (COG_AUTOPLAY_CONFIG)

### Key Files
| File | Purpose |
|------|---------|
| `src/store.js` | Zustand store — layer nav, lens state, AI agent state |
| `src/data/tataSteel.js` | All data: zones, stories, card registry, archetype configs, lens configs |
| `src/components/CommandCenter.jsx` | Main dashboard — render-array sections, signals, KPIs, zone cards |
| `src/components/StoryView.jsx` | Story mode — adaptive steps, autoplay, annotations, canvas viz |
| `src/components/Panel.jsx` | Reusable card container — accepts `badges` prop |
| `src/components/AIAgent.jsx` | Floating AI assistant — archetype-aware explanations |
| `src/components/LensMenu.jsx` | 2-axis lens selector dropdown |
| `src/canvas/FactoryMap.jsx` | Factory flow visualization — cogCluster-aware rendering |
| `src/index.css` | Global CSS + data-attribute morphing rules |

### Data Flow for Lens System
```
Store (activeArchetype, activeCogStyle)
  → CommandCenter sets data-archetype/data-cogstyle/data-cogcluster on root div
  → CSS rules in index.css handle visual morphing (fonts, spacing, ordering)
  → Component logic handles content changes:
      - AIBriefing: ARCHETYPE_SIGNALS + ARCHETYPE_NARRATIVES
      - StatusPills: ARCHETYPE_KPIS
      - IntelligenceCard: ZONE_ARCHETYPE_METRICS
      - Panel: CARD_SURFACE_METRICS (badges prop)
      - Section ordering: DASHBOARD_SECTIONS + ARCHETYPE_SECTION_OVERRIDES
  → StoryView reads activeArchetype/activeCogStyle for:
      - Step compression (STORY_ADAPTIVE_CONFIG)
      - Annotations (STORY_ANNOTATIONS)
      - Autoplay behavior (COG_AUTOPLAY_CONFIG)
  → enterStory() picks combo-aware default lens (COMBO_DEFAULTS)
```

### Important Patterns
- **Render-array sections** — CommandCenter uses SECTION_RENDERERS map + sorted/filtered DASHBOARD_SECTIONS for reorderable layout
- **Source-index mapping** — StoryView compresses steps via `sourceIndices` array, NOT by filtering, to keep canvas step indices aligned
- **Ref-based props in RAF loops** — FactoryMap uses `cogClusterRef.current` inside the draw loop since useEffect closure would be stale
- **Null = default** — When activeArchetype/activeCogStyle is null, everything falls back to the original dashboard experience
- **CSS data-attribute morphing** — index.css has rules keyed on `[data-archetype="..."]` and `[data-cogcluster="..."]` for visual-only changes (font, spacing, ordering via CSS `order`)

## Style Notes
- Dark theme (#070B12 background)
- Three font families: DM Sans (sans), Newsreader (serif), JetBrains Mono (mono)
- Color tokens in src/theme/tokens.js: C.blue, C.cyan, C.red, C.orange, C.green, C.purple, C.amber
- All canvas components use custom hooks: useCanvasLoop, useCanvasInteraction
