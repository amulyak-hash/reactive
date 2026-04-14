# Salami Slicing Card — Design Spec

**Date:** 2026-04-14
**Card:** Salami Slicing Pattern Detection (`uc-02`)
**Approach:** Time-scrub investigation — user drags a timeline, watches a pattern emerge from noise

---

## Overview

Replace the traditional dashboard card for uc-02 with an investigative experience. The user drags a time scrubber and watches NCE dots accumulate on a shared scatter field. Other contractors submit occasional large claims above the £50K threshold. RHI Magnesita submits 7 small claims, all below threshold, spread across 3 clauses. The pattern is unmistakable by month 4. Analysis panels then slide in below.

### What gets replaced

| Killed | Reason |
|--------|--------|
| `SalamiSlicingBars.jsx` (primary viz) | Replaced by NCEScatterField |
| `CompanionViz.jsx` clause breakdown (for uc-02) | Replaced by ClauseSpreadPanel |
| KPI boxes (uc-02 block in ResponseCard) | Replaced by RealCostPanel + TrajectoryPanel |
| `UseCaseAnswer` text block | Replaced by the investigation experience itself |

### What gets added

| New | Purpose |
|-----|---------|
| `SalamiSlicingCard.jsx` | Top-level card component, replaces ResponseCard for uc-02 |
| `TimeScrubber.jsx` | Draggable timeline input, outputs 0-1 normalized value |
| `NCEScatterField.jsx` | Canvas scatter visualization driven by scrub value |
| `ClauseSpreadPanel.jsx` | Clause breakdown analysis panel |
| `RealCostPanel.jsx` | Bid vs projected cost comparison |
| `TrajectoryPanel.jsx` | NCE accumulation projection chart |

---

## Three Phases

### Phase 1: Noise (Month 0-1)

Scrubber starts at month 0. Field is empty. Centered instruction reads: "Drag the timeline to see NCE submissions appear" (12px, muted). As the user drags, dots appear for multiple contractors — scattered across clauses and values. Nothing looks unusual. Instruction fades out on first drag (300ms).

### Phase 2: Signal (Month 2-3)

RHI's dots keep coming — small, frequent, all below the £50K threshold, spread across all 3 clause zones. Other contractors go quiet. By month 3, a label fades in below RHI's cluster: "RHI Magnesita — 7 NCEs, all under £50K".

### Phase 3: Analysis (Month 4)

When the scrubber reaches ~90% of the track, three analysis panels slide in below the scatter with a staggered entrance. The scrubber stays interactive — the user can scrub back and forth while reading the analysis.

**No auto-play.** The user controls the pace entirely. This is the key difference from the NCE Story Card — that one performed for you, this one makes you the investigator.

---

## The Scatter Field

Canvas-based 2D scatter with clause type on X-axis and NCE value on Y-axis.

### Axes

- **X-axis:** Three clause zones — Access 60.1(2), Design 60.1(1), Physical 60.1(12). Not a continuous scale — three loose regions that dots cluster within.
- **Y-axis:** NCE value, £0 at bottom to £180K at top.
- **£50K threshold line:** Dashed horizontal line, subtle red (`rgba(240,96,96,0.25)`). The key visual anchor — everything RHI submits sits below it.

### Dots

Each NCE is a circle. Size scales with value (£18K = small dot, £180K = large dot).

**Color by contractor:**

| Contractor | Color | Token |
|-----------|-------|-------|
| RHI Magnesita | Amber | `C.amber` / `#FBBF24` |
| Keller Group | Blue | `C.blue` / `#5c83ff` |
| Severfield | Green | `C.green` / `#3bb88a` |
| William Hare | Purple | `C.purple` / `#a67bdb` |
| Tenova | Cyan | `C.cyan` / `#29CFD6` |

- Other contractors: low opacity (0.3-0.4). They're backdrop, not the story.
- RHI dots: brighter (0.7-0.8) with soft glow (`box-shadow`), glow intensifies as more dots appear.

### The pattern that emerges

- Other contractors: few dots, large, scattered above the threshold — normal one-off claims.
- RHI: 7 dots, small, clustered below the threshold, spread across all 3 clause zones — deliberate fragmentation.

### Dot data

**RHI Magnesita (7 NCEs across 4 months):**

| Month | Clause | Value | Position hint |
|-------|--------|-------|--------------|
| Jan | Access 60.1(2) | £47K | Left zone, just below threshold |
| Feb | Design 60.1(1) | £38K | Center zone, below threshold |
| Mar | Access 60.1(2) | £28K | Left zone, lower |
| Mar | Physical 60.1(12) | £14K | Right zone, low |
| Apr | Design 60.1(1) | £42K | Center zone, just below threshold |
| Apr | Access 60.1(2) | £23K | Left zone, lower |
| Apr | Physical 60.1(12) | £29K | Right zone, below threshold |

**Other contractors:**

| Contractor | Month | Clause | Value | Notes |
|-----------|-------|--------|-------|-------|
| Keller | Feb | Design | £65K | Above threshold, single claim |
| Severfield | Mar | Design | £120K | Well above threshold, single claim |
| William Hare | Jan | Access | £25K | Below threshold but isolated |
| William Hare | Apr | Physical | £30K | Below threshold but isolated |
| Tenova | Apr | Design | £180K | Large single claim |

### Label emergence

When the scrubber passes month 3 (~75% of track), a label fades in below RHI's cluster: "RHI Magnesita — 7 NCEs, all under £50K" (9px mono, amber). This names what the user is already seeing.

---

## Time Scrubber

Draggable slider at the top of the card. Represents Jan through Apr.

### Visual

- Track: thin horizontal bar (6px), dark with amber fill showing progress.
- Thumb: small glowing amber circle (14px). Glow intensifies as more NCEs are on screen.
- Month labels below track: Jan, Feb, Mar, Apr.
- Current month indicator top-right: "Month 2 of 4" (10px mono, amber-muted).

### Behavior

- Continuous drag, not snapped to months. Values between months interpolate — e.g. halfway between Feb and Mar shows all Feb NCEs with Mar NCEs starting to fade in.
- Dots animate in with scale-up (`scale(0) → scale(1)`, 200ms, spring) when their month is reached.
- Dragging backwards fades dots out (reverse, 150ms, ease-in).
- Touch and mouse supported.
- Custom div with pointer event handlers (not `<input type="range">`) for full visual control.

### Instruction cue

On first render (scrubber at month 0, empty field), centered over the scatter field:

- "Drag the timeline to see NCE submissions appear"
- 12px, muted (`rgba(255,255,255,0.3)`), with a subtle animated arrow or pulse
- Fades out (opacity `1 → 0`, 300ms) on first `pointerdown` on the scrubber

---

## Analysis Panels

Three panels slide in below the scatter when the scrubber reaches ≥90% of the track. Staggered entrance, left to right, 120ms delay between each.

### Panel entrance animation

```
t=0ms     Divider line fades in (gradient amber, 300ms)
t=200ms   Panel 1 slides up (translateY(16)→0, opacity 0→1, 350ms, ease-out)
t=320ms   Panel 2 slides up (same)
t=440ms   Panel 3 slides up (same)
```

### Scrubbing back

If the user drags the scrubber back below month 3 (~75%), panels fade out (200ms) and the scatter returns to its earlier state. Dragging forward again brings them back.

### Panel 1: Clause Spread

Shows the 3 clauses RHI used, with count and total value per clause.

- Horizontal bars proportional to value
- Access: 3x — £98K (full width, amber)
- Design: 2x — £72K (~73% width, orange)
- Physical: 2x — £51K (~52% width, red)
- Caption: "Spread across 3 clauses to avoid detection" — italic, muted

### Panel 2: The Real Cost

Three stacked values showing the bid trap:

- RHI winning bid: £1.20M (green, `C.green`)
- Next bidder: £1.36M (muted white)
- Projected with NCEs: £2.19M (red, `C.red`, with glow)
- Punchline box (red tint background): "The £160K saving is actually an £830K loss"

### Panel 3: Trajectory

Mini area chart showing projected NCE accumulation:

- X-axis: M0 to M14
- Area fill: amber gradient fading to transparent
- "Now" marker at M4 (£221K) with dot
- Dashed projection continuing to £990K
- Caption: "At current rate: £990K by month 14"

---

## Animation System

Uses Framer Motion (same dependency as NCE Story Card).

### Key animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Dot entrance | `scale(0) → scale(1)` | 200ms | `spring({ stiffness: 80, damping: 10 })` |
| Dot exit (scrub back) | `scale(1) → scale(0)` | 150ms | ease-in |
| RHI glow ramp | `box-shadow` spread grows with dot count | continuous | linear interpolation |
| Label fade in | opacity `0→1`, `translateY(8)→0` | 300ms | ease-out |
| Panel slide-in | `translateY(16)→0`, opacity `0→1` | 350ms | ease-out, staggered 120ms |
| Instruction fade-out | opacity `1→0` | 300ms | ease-out |
| Divider fade-in | opacity `0→1` | 300ms | ease-out |

### Scatter rendering

Canvas-based using `requestAnimationFrame` loop (consistent with project's existing canvas pattern). Each dot stores target position, current scale, and opacity. The RAF loop interpolates toward targets when the scrub value changes. This keeps rendering smooth during continuous dragging.

Scrub value is read via ref inside the RAF loop (same `ref.current` pattern as FactoryMap) to avoid stale closures.

---

## Component Architecture

```
ResponseCard.jsx
  └─ (when useCaseId === 'uc-02')
     └─ SalamiSlicingCard.jsx       ← top-level card
        ├─ TimeScrubber              ← drag input, outputs 0-1 value
        ├─ NCEScatterField           ← canvas, reads scrub value via ref
        │   └─ InstructionCue        ← DOM overlay, fades on first drag
        └─ AnalysisPanels            ← visible when scrub ≥ 0.9
            ├─ ClauseSpreadPanel
            ├─ RealCostPanel
            └─ TrajectoryPanel
```

**Data flow:** `SalamiSlicingCard` reads `USE_CASE_MAP['uc-02']` for all data. Scrub value is local React state (`useState`). Canvas reads scrub value via ref (avoids stale closure in RAF loop). No Zustand changes needed.

**State:**
- `scrubValue` (0-1, local state)
- `hasStartedDragging` (boolean, controls instruction cue visibility)
- `showPanels` (derived: `scrubValue >= 0.9`)

---

## Design Tokens

Uses existing theme tokens from `src/theme/tokens.js`:

| Token | Usage |
|-------|-------|
| `C.amber` / `#FBBF24` | RHI dots, scrubber, primary accent |
| `C.orange` / `#d4893a` | Design clause bar |
| `C.red` / `#F06060` | Physical clause bar, projected cost, threshold line |
| `C.green` / `#3bb88a` | RHI winning bid (ironic — it looks good until it isn't) |
| `C.blue` / `#5c83ff` | Keller dots |
| `C.purple` / `#a67bdb` | William Hare dots |
| `C.cyan` / `#29CFD6` | Tenova dots |
| `C.t1`, `C.t2`, `C.t3` | Text hierarchy |
| `C.line` | Dividers |
| `FONT_SANS` | Body text, captions |
| `FONT_MONO` | Numbers, labels, axis text |

---

## Scope Boundaries

**In scope:**
- SalamiSlicingCard component (scrubber + scatter + 3 analysis panels)
- Canvas scatter with time-driven dot rendering
- Integration into ResponseCard (conditional render for uc-02)
- Instruction cue for first-time interaction

**Out of scope:**
- Applying time-scrub pattern to other use cases (future work)
- Mobile-specific layout (desktop-first, basic responsive)
- Modifying the use case data structure in `useCases.js`
- Audio or narration
- Hover tooltips on individual dots (could be a fast follow)
