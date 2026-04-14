# Intelligence Constellation — 3D Entity Network Redesign

> Redesign the Enterprise Brain dashboard's main visualization from a use-case showcase into a 3D entity network that surfaces real contractors, risks, early warnings, and their relationships.

## Problem

The current RiskConstellation is a canvas-rendered 2D orbital graph with 8 nodes representing **use cases** (product capabilities). It looks visually stunning but:

- Nodes are abstract features, not real things an operator cares about
- Connections are hardcoded and don't represent actual relationships
- Node sizing (budget exposure) is hard to read in a circular layout
- 8 nodes + hub + connections + particles + labels + stage tags = high cognitive load for what is functionally a menu

The dashboard answers "what can this tool do?" instead of "what do I need to know?"

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Node content | Real entities (contractors, EWs, NCEs, packages) | Operators think in situations, not use cases |
| Layout | Entity network (Approach A) | Best demo wow-factor with meaningful information |
| 3D approach | Full 3D with guided camera presets (Approach C) | Cinematic without letting users get lost |
| Interaction | Expand in-place | Keeps spatial context, avoids jarring view transitions |
| Primary audience | Demo/pitch (adaptable to PM and Commercial) | Needs to impress and demonstrate value simultaneously |
| Core "aha" | The intelligence network itself | Seeing relationships humans can't is the value prop |
| Flow particles | Preserved from current design, enhanced in 3D | Gives the constellation a living, breathing quality |

## Entity Types

### Hub (Centre)

The programme itself. Always visible. Glowing sphere at the origin.

- **Inside sphere:** Headline number (£93.2M) + one-word label ("exposure")
- **Outside (floating above):** Programme name "PORT TALBOT / EAF Programme" as HTML overlay
- **Severity arcs:** Colored ring segments (red/amber/green) orbiting the equator showing breakdown of total exposure
- **Rule:** Only the headline number + one word inside any sphere. Everything else floats outside.

### Contractor (Primary Orbital Nodes)

5 contractor entities orbiting the hub at radius 8-12 in 3D space.

- **Shape:** Large sphere (radius scales with total NCE exposure)
- **Color:** Severity-driven — red (>20% variation), orange (>10%), green (<8%)
- **Inner arc:** Partial ring showing % of variation vs portfolio average
- **Inside sphere:** £ value + variation %
- **Floating label:** Contractor name above

| Contractor | Exposure | Variation | Severity |
|-----------|----------|-----------|----------|
| Afcons Infra | £35.5M | 25% | critical (red) |
| Tata Projects | £18.2M | 9.8% | watch (blue) |
| NCC Ltd | £15.8M | 16% | warning (orange) |
| L&T Construction | £12.6M | 6% | healthy (green) |
| KEC International | £11.1M | 13.3% | watch (amber) |

### Early Warning

Small filled spheres orbiting their parent contractor.

- **Shape:** Filled sphere (radius scales with projected CE cost)
- **Color:** Purple (open), amber (stale >14 days), red (critical)
- **Animation:** Pulsing ring when stale
- **Inside:** Days open + status
- **Floating label:** EW ID + subject

### NCE / Claim

Rounded squares to visually distinguish from circular EWs.

- **Shape:** Rounded square (size scales with claim value)
- **Color:** Amber (normal), red (flagged — validity issue or salami pattern)
- **Inside:** £ value
- **Floating label:** NCE ID

### Package

Hexagons to distinguish from both spheres and squares.

- **Shape:** Hexagon (size scales with contract value)
- **Color:** Teal (on-track), amber (drifting), red (bleeding)
- **Inside:** £ value
- **Floating label:** Package code (e.g., EI-01)

## Connection Types

Four edge types, each with distinct visual treatment and flow particle behavior:

| Type | Visual | Particles | Meaning |
|------|--------|-----------|---------|
| **Contractual** | Solid teal line | Slow (0.4), 2-3 particles, steady | Hub ↔ contractor, contractor ↔ package |
| **Risk** | Solid, colored by severity | Medium (0.7), 4-5 particles | EW/NCE ↔ source entity |
| **Cascade** | Dashed purple | Fast (1.0), 6-8 particles, urgent pulse | Risk-to-risk dependency (the "aha" lines) |
| **Pattern** | Dotted amber | Slow (0.3), 1-2 particles | AI-detected relationship (salami slicing, budget bleed cluster) |

### Flow Particle Behavior

Particles flow along bezier curves between connected nodes. Enhanced from the current 2D version:

- **Speed encodes urgency** — cascade lines flow fastest
- **Direction encodes relationship** — particles flow from source of risk toward what it affects
- **Density encodes severity** — Afcons' connections have more particles than L&T's
- **Glow trails** — custom shader stretches each particle along its velocity vector, fragment shader applies gradient fade for comet-tail effect
- **Rendering:** Single `InstancedMesh` draw call for all particles across all edges. Each instance is a small billboard quad with additive blending. Bloom post-processing makes them glow beyond geometry.

## Camera System

Three guided presets. No free orbit — the camera always transitions smoothly to a preset.

### Overview (Default Landing)

- Elevated ~45° angle, sees the full network
- Slow auto-rotation (~0.1°/s)
- All nodes visible, all connections active
- Hub headline number prominently visible

### Command Table

- Low angle, almost flat — like looking across a strategy table
- Labels float above nodes with perspective
- Best for comparing contractors side-by-side
- Triggered by clicking the hub node (zooms out to table view) or pressing `T` key

### Focus

- Camera flies to clicked node
- Clicked node scales up, satellites spread outward revealing labels
- Background nodes fade + blur (depth-of-field)
- Triggered by clicking any node

### Camera Transitions

All transitions use smooth easing (~800ms). The camera stores its previous preset so Escape/click-empty returns to it.

## Expand-in-Place Interaction

### Click → Expand Sequence (~800ms)

1. Camera starts easing toward the clicked node (300ms)
2. Background nodes fade to 20% opacity + blur (200ms, concurrent)
3. Clicked node scales up ~1.5x, satellites spread outward on spring easing (400ms)
4. Expanded node shows richer detail: summary stats, severity arc, count badges (e.g., "14 NCEs · 3 EWs")

### Dismissal

Click empty space or press Escape → reverse animation, camera returns to previous preset.

### Nesting (Second-Level Focus)

From an expanded contractor, clicking a satellite (e.g., EW-0042):
- Camera zooms further to the satellite
- Satellite expands with its own detail
- AI thread panel slides in from the right edge as an HTML overlay
- Thread shows the AI's analysis for that specific entity (reuses existing thread/ResponseCard components)

## Entry Animation

On first load, the constellation builds itself in a staggered reveal (~2.5s total):

1. **Hub fades in** from center with scale-up + glow bloom (0-600ms)
2. **Contractual connections** draw outward from hub as glowing lines (400-1200ms)
3. **Contractor nodes** pop in at the end of each line with spring easing, staggered by 120ms each (800-1600ms)
4. **Satellite connections** draw from contractors to their EWs/NCEs (1200-2000ms)
5. **Event nodes** pop in, smallest last (1600-2500ms)
6. **Flow particles** begin flowing once all connections are drawn
7. **Auto-rotation** starts after full reveal completes

This mirrors the current 2D staggered reveal but leverages 3D depth — nodes appear to emerge from the hub outward in space.

## Demo Flow

The visualization supports a natural 4-step demo narrative:

1. **Land** — Overview camera. Full constellation. Auto-rotate. Hub pulses £93.2M. *"£93.2M exposure across 5 contractors"*
2. **Spot** — Audience sees Afcons is the largest + reddest node with the most connections. Click it → Focus camera. Satellites reveal 3 EWs, 14 NCEs. *"25% variation — 2x the portfolio average"*
3. **Connect** — Dashed cascade line visible between EW-0042 and EW-0058. Click it → see the £24M cascade path. *"A 6-week delay becomes 14 weeks and £24M"*
4. **Contrast** — Escape back to overview. Click L&T — clean, green, sparse satellites. *"This is what a well-managed contract looks like"*

## Tech Stack

### New Dependencies

| Package | Purpose |
|---------|---------|
| `@react-three/fiber` | React renderer for Three.js |
| `three` | WebGL 3D engine |
| `@react-three/drei` | Helpers: Billboard, Html, Float, OrbitControls |
| `@react-three/postprocessing` | Bloom, depth-of-field, vignette |

### Existing (No Change)

- React 19 + Vite
- Zustand (store.js — extended, not replaced)
- Theme tokens (src/theme/tokens.js — colors reused directly)
- CommandBar component
- Thread/ResponseCard components

### Retired

- `src/canvas/uc/RiskConstellation.jsx` — replaced by IntelligenceScene
- `src/components/Dashboard.jsx` — ResizeObserver wrapper not needed with R3F
- `src/canvas/utils.js` — canvas helpers replaced by Three.js
- `src/canvas/easing.js` — replaced by R3F/drei animation utilities

## Component Architecture

```
App.jsx
├── IntelligenceScene                  ← new: R3F Canvas wrapper
│   ├── CameraRig                      ← guided presets + smooth transitions
│   ├── ConstellationGraph             ← positions nodes, manages layout
│   │   ├── HubNode                    ← centre sphere + severity ring
│   │   ├── ContractorNode  ×5         ← sphere + floating label + arc
│   │   ├── EventNode  ×N              ← EW/NCE/Package, typed shape
│   │   └── ConnectionEdge  ×N         ← bezier tube + flow config
│   ├── FlowParticles                  ← instanced mesh, shader trails
│   ├── PostProcessing                 ← bloom + DOF + vignette
│   └── EnvironmentEffects             ← optional: subtle star field particles
│
├── HtmlOverlays                       ← HTML positioned via drei <Html>
│   ├── NodeTooltip                    ← hover detail
│   ├── ExpandedPanel                  ← in-place detail when node expanded
│   └── ThreadPanel                    ← AI thread (slides from right edge)
│
└── CommandBar                         ← existing, no change
```

## Data Model

The current `USE_CASES[]` array is restructured into a graph of typed entities and edges.

### New file: `src/data/entityGraph.js`

```js
// Entities (nodes)
{
  id: 'contractor-afcons',
  type: 'contractor',        // 'contractor' | 'early-warning' | 'nce' | 'package'
  label: 'Afcons Infra',
  shortLabel: 'Afcons',
  value: 35500,              // £K — drives node size
  severity: 'critical',      // 'critical' | 'warning' | 'watch' | 'healthy'
  metrics: {                 // type-specific data
    variationPct: 25,
    nceCount: 14,
    ewCount: 3,
    originalValue: 142000,
  },
  orbit: {                   // layout hint
    parent: 'hub',
    angle: -0.4,             // radians, used for initial position
  },
}

// Edges (connections)
{
  from: 'contractor-afcons',
  to: 'ew-0042',
  type: 'risk',              // 'contractual' | 'risk' | 'cascade' | 'pattern'
  flow: {
    speed: 0.7,              // particle speed (0-1 scale)
    density: 5,              // number of particles
    direction: 'outward',    // 'inward' | 'outward'
  },
}
```

The existing use case data (answers, vizData, companion visualizations) is preserved and linked by entity ID so the AI thread panel can still render detailed responses when a user drills into a specific entity.

### Mapping: Use Cases → Entity Context

Each use case's AI answer and visualization becomes accessible when the relevant entity is explored:

| Entity Interaction | Surfaces Use Case |
|---|---|
| Expand Afcons → see 25% variation | uc-00 (NCE Variation Analysis) |
| Click a bleeding package | uc-01 (Budget Bleed Detection) |
| See cluster of small NCEs from one contractor | uc-02 (Salami Slicing) |
| Click a stale EW | uc-03 (EW Response Cost) |
| Click a cascade edge | uc-04 (Coupled Risk Detection) |
| Click a flagged NCE | uc-05 (NCE Validity Pre-Assessment) |
| See contractor with zero EWs but behind schedule | uc-06 (Silence Alarm) |
| Click the hub | uc-07 (Board Brief) |

The use cases become the intelligence engine behind the entities rather than the navigation structure.

## Store Changes (Zustand)

New state slices added to existing `src/store.js`:

```js
// State
cameraPreset: 'overview',     // 'overview' | 'command-table' | 'focus'
focusedEntity: null,           // entity id or null
expandedEntity: null,          // entity id or null
hoveredEntity: null,           // entity id or null
threadEntity: null,            // entity id that opened the AI thread

// Actions
focusEntity(id)                // fly camera to entity, expand it
unfocus()                      // return to previous camera preset
openThread(entityId)           // slide in AI panel for entity
setCameraPreset(preset)        // transition camera to preset
```

Existing store slices (`view`, `thread`, `askQuestion`, `askByUseCase`) are preserved for backward compatibility with the thread system.

## Post-Processing Pipeline

| Effect | Purpose | Settings |
|--------|---------|----------|
| Bloom | Particle glow, node accents, hub aura | Low threshold (0.3), intensity 1.5, selective on emissive materials |
| Depth of Field | Focus camera blurs background | bokehScale 4, focusDistance to clicked node, only active in Focus preset |
| Vignette | Cinematic edge darkening | darkness 0.4, offset 0.3, always active |

## Performance Considerations

- **InstancedMesh** for all flow particles — single draw call regardless of particle count
- **LOD:** Event nodes beyond a distance threshold render as simple point sprites instead of full geometry
- **Frustum culling:** Three.js handles this natively
- **HTML overlays:** Only render labels for visible/nearby nodes using drei `<Html occlude>`
- **Target:** 60fps on mid-range hardware (integrated GPU laptop)

## Environment Effects (Optional Polish)

A sparse field of very faint, slowly drifting point sprites in the background — like distant stars. Purpose is to give depth cues when the camera moves (parallax) and prevent the background from feeling like a flat void. Implemented as a single `Points` geometry with ~200 particles. Skip if it hurts performance or distracts from the constellation.
