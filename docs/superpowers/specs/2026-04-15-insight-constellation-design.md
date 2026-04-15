# Insight Constellation — Simplify Use Cases into Insights

> Transform the RiskConstellation from a use-case showcase into an insight feed. Same canvas aesthetic, same renderer — just cleaner content and a wider layout.

## Problem

Leadership likes the current constellation visual but it causes too much cognitive load. Each node shows a use case title ("NCE Variation"), a stage tag ("Contract + NCE"), and a £ figure — three pieces of information per node across 8 nodes, plus a hub. The viewer has to decode what each use case means before they can understand the dashboard.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Renderer | Keep 2D canvas (no R3F) | Leadership approved the current visual |
| Layout | Wide horizontal ellipse (~2.5:1) | Spread nodes across full viewport, reduce crowding |
| Node content | £ figure + one-word tag | Minimum viable content per node — scannable in <2 seconds |
| Hover | Expand node + show insight detail | Full context on demand, not forced |
| Click | Same — opens thread view | No change to thread system |
| Hub | £93.2M dominant, "PORT TALBOT" above | Same anchor, number more prominent |

## Layout Change

### Current
- Orbit radius: `Math.min(width, height) * 0.32` (circular)
- Node angles: hardcoded in `NODE_ANGLES` array spanning ~330° of circle

### New
- Orbit radii: `orbitRx = width * 0.4`, `orbitRy = height * 0.35` (elliptical, ~2.5:1 ratio on typical viewport)
- Node angles: redistribute evenly across full ellipse to maximize spacing
- Hub stays at center `(cx, cy)`

The ellipse stretches horizontally to use the full viewport width. Nodes that were stacked vertically in the circle now spread to the sides.

## Node Content

### Resting State (no hover)

Each node shows at most two elements:

1. **£ figure inside the node shape** — the key number for this insight
2. **One-word severity tag below the shape** — colored to match the node accent

### Text Overflow Rule

Text must never extend beyond the node circle boundary.

- Font size inside node: `Math.min(radius * 0.55, 14)` px
- Before drawing: measure text width with `ctx.measureText()`
- If `textWidth > radius * 1.6`: move the £ figure below the node alongside the tag. The shape renders as a clean circle with no text inside.
- Tag text: always positioned at `node.y + radius + 16`, never inside the shape

### Hover State

On hover (existing 1.2x scale-up):
- Node scales to 1.2x with white border (same as current)
- Tooltip appears at bottom-center showing:
  - **Insight headline** — 1 line, the specific finding in plain English
  - **Recommendation** — 1 line, what to do about it
  - **£ figure** — repeated for context, in accent color
- Tooltip styled same as current: dark panel, accent border, box shadow

### Click

Same as current: `onNodeClick(uc.id)` → triggers `askByUseCase()` → opens thread view. No change to the thread system, ResponseCard, or any downstream component.

## The 8 Insight Nodes

| # | Old shortTitle | New £ Figure | Tag | Tag Color | Insight Headline (hover) |
|---|---|---|---|---|---|
| # | Old shortTitle | New £ Figure | Tag | Tag Color | Insight Headline (hover) | Recommendation (hover) |
|---|---|---|---|---|---|---|
| 0 | NCE Variation | £35.5M | CRITICAL | C.red | Afcons at 25% variation — 2x portfolio average | Forensic review of Afcons. Monitor Tata NCE rate. |
| 1 | Budget Bleed | £2.4M | SILENT | C.red | 3 packages bleeding budget with zero NCEs | Raise PM Early Warning on all three. |
| 2 | Salami Slicing | £830K | PATTERN | C.amber | RHI: 7 small NCEs = £830K more than next bidder | Schedule forensic commercial review. |
| 3 | EW Response Cost | £59K/day | STALE | C.orange | 12 EWs sitting 19 days avg — £59K/day burn | Clear EW backlog within 5 working days. |
| 4 | Risk Cascade | £24M | CASCADE | C.purple | Transformer delay → 14 weeks → £24M exposure | Air-freight (£800K) or temp power (£1.2M). |
| 5 | NCE Validity | £180K | SAVE | C.cyan | £400K claim reducible to £220K via clause 63.7 | Accept NCE, apply clause 63.7 assessment. |
| 6 | Silence Alarm | 3 silent | SILENT | C.green | Keller, Severfield, W. Hare behind with no EWs | Raise proactive EWs on all three (clause 15.1). |
| 7 | Board Brief | 5 risks | BRIEF | C.blue | Top 5 risks to budget and timeline, ready now | Use as board preparation pack. |

## Data Changes

Add new fields to each use case object in `src/data/useCases.js`:

```js
{
  id: 'uc-00',
  // ... existing fields unchanged ...
  
  // New insight fields
  insightValue: '£35.5M',         // displayed inside node
  insightTag: 'CRITICAL',          // one-word tag below node
  insightTagColor: C.red,          // tag text color (defaults to accent if omitted)
  insightHeadline: 'Afcons at 25% variation — 2x portfolio average',
  insightRecommendation: 'Forensic review of Afcons. Tata Projects needs NCE rate monitoring.',
}
```

These fields are additive — no existing fields are removed or renamed. The constellation reads the new fields; all other components continue reading existing fields.

## Hub Node

- Position: center `(cx, cy)`, unchanged
- Size: unchanged (radius 34, same `hubR`)
- Content:
  - "PORT TALBOT" label: smaller (`500 10px`), positioned at `cy - 8`
  - "£93.2M" number: dominant (`700 15px`), positioned at `cy + 8`
  - "EAF Programme" removed from hub (redundant with header)
- Glow, pulse animation, border: unchanged

## Connections

No change. Same `CONNECTIONS` array, same quadratic bezier curves, same flow particles.

## Entry Animation

No change. Same 2000ms staggered reveal — hub first, connections, then nodes cascading in.

## What Changes (File Impact)

| File | Change | Scope |
|------|--------|-------|
| `src/data/useCases.js` | Add 5 new fields per use case | Additive only |
| `src/canvas/uc/RiskConstellation.jsx` | Elliptical layout, new node content, text overflow check, updated tooltip | Moderate — layout + rendering |

**No other files change.** Store, App, Dashboard, Thread, ResponseCard, CommandBar, tokens — all untouched.

## What Stays the Same

- Canvas-based rendering (`setupCanvas`, `drawGlow`, easing functions)
- Dark theme (#050914 background)
- Node accent colors per use case
- Node sizing based on `budgetImpact.withoutAction`
- Bezier connections with flow particles
- Hover: 1.2x scale, white border, cursor pointer
- Click: thread navigation via `onNodeClick`
- Hub: center position, pulse animation, glow
- Entry animation: staggered reveal over 2000ms
- Ambient dust particles
- Bottom tooltip positioning pattern

## Verification

1. `npm run dev` — constellation renders with elliptical layout
2. All 8 nodes visible, well-spaced, no overlap
3. Each node shows £ figure inside (or below if too small) + colored tag below
4. No text overflows any node shape
5. Hover any node — tooltip shows insight headline + recommendation + £ figure
6. Click any node — thread opens with correct use case response
7. Hub shows "£93.2M" prominently with "PORT TALBOT" above
8. Flow particles, connections, entry animation all work as before
9. `npm run build` — no errors
