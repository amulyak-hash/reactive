# NCE Story Card — Design Spec

**Date:** 2026-04-14
**Card:** Contractor NCE Variation Analysis (`uc-00`)
**Approach:** Story-First with Data Drawer — full replacement of existing card

---

## Overview

Replace the traditional dashboard card (stacked bars, treemap, data table, KPI boxes) with a narrative-driven story experience. The card tells the NCE variation story through 5 beats that follow a three-act structure: **Alarm → Suspense → Clarity**.

### What gets replaced

| Killed | Reason |
|--------|--------|
| `NCEStackedBars.jsx` (primary viz) | Replaced by story beats 2-3 |
| `CompanionViz.jsx` treemap + trend (for uc-00) | Replaced by weighted streams (beat 3) + month blocks (beat 4) |
| `ContractorDrilldown.jsx` table | Replaced by data drawer |
| KPI boxes (uc-00 block in ResponseCard) | Replaced by cold open ratio (beat 1) |
| `UseCaseAnswer` text block | Replaced by micro-narration woven into beats |

### What gets added

| New | Purpose |
|-----|---------|
| `NCEStoryCard.jsx` | Top-level story component, replaces ResponseCard for uc-00 |
| `StoryBeat.jsx` | Reusable wrapper for scroll-triggered / sequenced beats |
| `WeightedStream.jsx` | Animated money-trail stream element |
| `MonthBlocks.jsx` | Acceleration visualization (beat 4) |
| `DataDrawer.jsx` | Collapsible raw data table at end of story |

---

## Delivery Model: Hybrid

- **Beats 1-2** — controlled sequence. Auto-plays on card enter. Click or scroll to advance between beats. Cinematic crossfade transitions (400ms ease-in-out).
- **Beats 3-5** — scrollable deep-dive. User controls pace. Each beat is scroll-triggered via IntersectionObserver (threshold 0.3). Content flows naturally into scrollable area after beat 2.
- **Data Drawer** — collapsible section after beat 5. Collapsed by default. Click "View raw data" to expand.

---

## Animation System

### Philosophy: Precision + Cinematic Hybrid

Two motion vocabularies, deployed based on story moment:

**Precision kinetics** (for data moments):
- Number counters with spring easing — `spring(1, 80, 10)`
- Text fade-up: `translateY(12px) → 0`, opacity `0 → 1`, 300ms ease-out
- Staggered reveals: 80ms delay between siblings
- Scale entrance: `scale(0.95) → scale(1.0)`

**Cinematic breath** (for emotional beats):
- Slow crossfades between scenes: 400-600ms, ease-in-out
- Glow pulses on key elements: box-shadow breathe, 2-2.5s loop
- Spotlight dimming: non-focus elements fade to 0.4 opacity over 300ms
- Parallax-lite on scroll (subtle, 5-10% offset differential)

### Implementation

CSS animations + Framer Motion (**new dependency** — `framer-motion`, ~40KB gzipped). Pure DOM + CSS transforms for 60fps. No canvas needed for the story card — keeps it simple and accessible. Framer Motion is chosen over GSAP because it's React-native (declarative `<motion.div>` API), works with the project's inline style pattern, and handles spring physics + scroll-triggered animations out of the box.

**Key easing curves:**
- Spring (data): `spring({ stiffness: 80, damping: 10, mass: 1 })`
- Ease-out (reveals): `cubic-bezier(0.16, 1, 0.3, 1)`
- Ease-in-out (transitions): `cubic-bezier(0.4, 0, 0.2, 1)`

---

## Beat-by-Beat Specification

### Beat 1: The Hook — "£1 contracted → 13p leaked"

**Act:** I (Alarm)
**Trigger:** Auto-plays on card enter
**Layout:** Full card takeover. Dark background. Content vertically and horizontally centered.

**Visual elements:**
- Stage label: "PORTFOLIO LEAKAGE" — mono font, 9px, uppercase, 0.15em tracking, `rgba(255,255,255,0.2)`
- The ratio: "£1" (64px mono, white 0.85) → arrow → "13p" (64px mono, `#F06060` with `text-shadow: 0 0 40px rgba(240,96,96,0.3)`)
- Sub-labels: "contracted" / "already leaked" — 11px, muted
- Context line: "Across 5 contractors. In 7 months." — 14px, `rgba(255,255,255,0.3)`
- Advance cue: subtle "▼" pulsing at bottom

**Animation timeline:**
```
t=0ms     "PORTFOLIO LEAKAGE" fades in (opacity 0→1, 400ms, ease-out)
t=300ms   "£1" counts from £0, translateY(20)→0 (600ms, spring)
t=500ms   "→" fades in (300ms)
t=700ms   "13p" counts from 0p, translateY(20)→0 (600ms, spring)
          + red glow pulse starts (box-shadow breathe, 2s loop)
t=1400ms  "contracted" / "already leaked" fade in (300ms)
t=2000ms  "Across 5 contractors..." fade in (500ms, ease-out)
t=3500ms  "▼" pulses (opacity 0.08→0.2, 1.5s loop)
```

**Advance:** Click anywhere or scroll down. Cinematic crossfade to beat 2 (400ms).

---

### Beat 2: The Fracture — "But the bleeding isn't equal"

**Act:** II begins (Suspense)
**Trigger:** Click/scroll advance from beat 1
**Layout:** Statement at top, contractor list centered below.

**Visual elements:**
- Statement: "But the bleeding isn't equal." — 18px, italic, `rgba(255,255,255,0.6)`
- Contractor list (sorted by variation ascending):
  - L&T Construction — 6% (green, dimmed to 0.4)
  - Tata Projects — 9.8% (blue, dimmed to 0.4)
  - KEC Intl — 13.3% (amber, dimmed to 0.45)
  - NCC Ltd — 16% (orange, dimmed to 0.55)
  - **Afcons Infra — 25%** (red, full brightness, glowing)
- Each row: name (right-aligned, 100px), thin progress bar (height proportional to %), percentage (mono font)
- Afcons bar: thicker (10px vs 6px), with `box-shadow: 0 0 20px rgba(240,96,96,0.2)`, glowing pulse
- Micro-narration: "One contractor. A quarter of every pound. What happened?" — 12px, red-muted

**Animation timeline:**
```
t=0ms     Crossfade from beat 1 (400ms, ease-in-out)
t=200ms   "But the bleeding..." fades in (400ms)
t=800ms   Contractors stagger in, top→bottom (80ms delay each)
          each: translateX(-12)→0, opacity 0→1 (300ms, ease-out)
          % numbers count up from 0
t=1600ms  Afcons enters last — slower (500ms), with glow ramp
t=2200ms  All others dim to 0.4 opacity (300ms)
          Afcons glow pulse begins (box-shadow breathe, 2.5s)
t=2800ms  "One contractor..." fades in (400ms)
```

**Transition to scroll mode:** After beat 2's animation sequence completes, the card transitions from fixed-viewport mode to scrollable. Mechanically: the card container switches from `overflow: hidden` (beats 1-2 fill the viewport) to `overflow-y: auto`. Beat 2 content remains pinned at the top of the scroll area as a contextual anchor. Beats 3-5 are already rendered below but hidden — they become visible as the user scrolls. The transition is signaled by a subtle scroll affordance (soft gradient fade at the bottom edge + the beat 2 "What happened?" line acting as a narrative pull into the scroll zone). No jarring height jump — the card animates from fixed height to expanded height over 400ms ease-out.

---

### Beat 3: The Villain — Afcons £35.5M breakdown

**Act:** II (Suspense deepens)
**Trigger:** Scroll-driven (IntersectionObserver, threshold 0.3)
**Layout:** Header with total, weighted streams stacked vertically below.

**Visual elements:**
- Header: "Afcons Infra — Where the money went" — 10px mono uppercase, red-muted
- Total: "£35.5M" — 36px mono bold, `#F06060` with glow, "on a £142M contract" beside it in muted 14px
- Weighted streams (4 causes, sorted by value descending):
  1. **Ground conditions** — £15.2M, dot 10px `#F06060` with glow, stream height 36px, full width
     - Caption: *"5 NCEs — the ground told a different story than the survey"*
  2. **Design changes** — £10.8M, dot 8px `#d4893a`, stream height 28px, ~71% width
     - Caption: *"4 NCEs — scope kept shifting under their feet"*
  3. **Access delays** — £6.1M, dot 6px `#FBBF24`, stream height 22px, ~40% width
  4. **Physical conditions** — £3.4M, dot 5px muted white, stream height 18px, ~22% width

**Stream anatomy:**
- Glowing dot (left) — diameter and glow intensity proportional to value
- Gradient bar — left-to-right gradient from cause color to transparent, rounded corners
- Cause name (inside bar, left-aligned) and value (inside bar, right-aligned, mono bold)
- Optional micro-narration caption below bar (italic, muted, 10px) — only on top 2 causes

**Animation timeline:**
```
Scroll-triggered (threshold 0.3)
t=0ms     "Afcons Infra" + "£35.5M" count up (800ms, spring)
t=400ms   Ground conditions stream: width 0→100%, opacity 0→1 (600ms, ease-out)
          Dot: scale(0)→scale(1) + glow ramp
t=600ms   Caption fades in beneath (300ms, translateY(8)→0)
t=800ms   Design changes stream (same pattern, 500ms)
t=1100ms  Access delays (400ms)
t=1350ms  Physical conditions (350ms)

Dot glow pulses continuously — larger dots pulse slower (2.5s), smaller faster (1.5s)
```

---

### Beat 4: The Twist — "And it's accelerating"

**Act:** II (Urgency)
**Trigger:** Scroll-driven (IntersectionObserver, threshold 0.3)
**Layout:** Statement, month blocks (horizontal), NCC secondary reveal below divider.

**Visual elements:**
- Statement: "And it's accelerating." — 16px, italic, `rgba(255,255,255,0.6)`
- Sub-label: "Afcons NCE accumulation — month by month" — 10px mono uppercase, purple-muted
- Month blocks (M1-M7): vertical rectangles, each taller than the last
  - Width: 48px each, 8px gap
  - Height: proportional to cumulative NCE value at that month
  - Background: increasing red opacity (0.1 → 0.45) as months progress
  - Final block (M7): border + glow (`box-shadow: 0 0 20px rgba(240,96,96,0.15)`)
  - Inside each block: monthly increment (e.g., "+£3.8M") in mono font, scaled to fit
  - Month labels below: "M1" through "M7"
- Cumulative label: "cumulative: £35.5M and climbing" — 12px mono, red-muted
- NCC secondary reveal (below divider):
  - "And there's a second story brewing..." — 12px, orange-muted
  - "NCC Ltd" name + "£9.5M → £12.8M → £15.8M in last 3 months" + "ACCELERATING" badge

**Month block data (from Afcons trend):**
| Month | Cumulative | Monthly Δ | Block height (relative) |
|-------|-----------|-----------|------------------------|
| M1 | £3.8M | +£3.8M | 11% |
| M2 | £8.2M | +£4.4M | 23% |
| M3 | £14.1M | +£5.9M | 40% |
| M4 | £19.5M | +£5.4M | 55% |
| M5 | £25.2M | +£5.7M | 71% |
| M6 | £30.1M | +£4.9M | 85% |
| M7 | £35.5M | +£5.4M | 100% |

**Animation timeline:**
```
Scroll-triggered (threshold 0.3)
t=0ms     "And it's accelerating" fades in (cinematic, 500ms)
t=600ms   Month blocks grow from height:0, left→right
          Stagger: 120ms per block (precision easing)
          Each block: height 0→final, opacity 0→1
          Increment labels count from £0 (300ms each)
t=1600ms  Final block gets glow ramp (400ms)
t=2000ms  "cumulative: £35.5M" fades in
t=2600ms  NCC section slides up (translateY(16)→0, 400ms)
          "ACCELERATING" badge pulses once then steady
```

---

### Beat 5: Clarity — "The benchmark exists"

**Act:** III (Resolution)
**Trigger:** Scroll-driven (IntersectionObserver, threshold 0.3)
**Layout:** Header, two comparison cards side-by-side, action line below divider.

**Visual elements:**
- Sub-label: "The proof that 25% isn't inevitable" — 10px mono uppercase, blue-muted
- Statement: "Same project. Same conditions. Different outcomes." — 16px, `rgba(255,255,255,0.6)`
- Comparison cards (side-by-side, equal width):
  - **Afcons** — red border/tint, "25%" in 36px `#F06060`, details below, "Needs forensic review" badge
  - **L&T** — green border/tint, "6%" in 36px `#3bb88a`, details below, "The benchmark" badge
  - "vs" text between cards
- Action line (below divider):
  - "If Afcons operated at L&T's rate, the portfolio would save **£27M**. The variation isn't the market — it's management."
  - "£27M" in green with glow

**Animation timeline:**
```
Scroll-triggered (threshold 0.3)
t=0ms     Header text fades in (400ms, ease-out)
t=400ms   Both cards enter simultaneously
          Afcons: from left, translateX(-20)→0 (500ms, ease-out)
          L&T: from right, translateX(20)→0 (500ms, ease-out)
t=600ms   % numbers count up (Afcons to 25, L&T to 6) (700ms, spring)
t=1200ms  Detail lines stagger in (80ms each, opacity 0→1)
t=1800ms  Action badges fade in (300ms)
t=2200ms  Bottom action line fades in (400ms)
          "£27M" counts up from 0 with green glow
```

---

### Data Drawer (Epilogue)

**Trigger:** User clicks "View raw data" link
**Layout:** Collapsed: single text link, centered. Expanded: compact data grid.

**Collapsed state:**
- "View raw data ↓" — 11px, muted, with subtle underline. Centered below beat 5.

**Expanded state:**
- 5-column grid: Contractor | Contract | NCE | % | Count
- All 5 contractors in rows
- Afcons row highlighted (name in red, values in red)
- L&T % in green (the benchmark)
- NCC % in orange

**Animation:**
- Expand: `max-height: 0 → auto` with 300ms ease-out, opacity 0→1
- Content staggers in row by row (60ms delay)

---

## Component Architecture

```
ResponseCard.jsx
  └─ (when useCaseId === 'uc-00')
     └─ NCEStoryCard.jsx          ← new top-level story component
        ├─ StorySequencer          ← manages beat 1-2 controlled sequence
        │  ├─ Beat1_Hook           ← the ratio
        │  └─ Beat2_Fracture       ← contractor reveal
        ├─ StoryScroll             ← scroll container for beats 3-5
        │  ├─ Beat3_Villain        ← weighted streams
        │  │  └─ WeightedStream[]  ← reusable stream element
        │  ├─ Beat4_Twist          ← month blocks
        │  │  └─ MonthBlocks       ← acceleration viz
        │  └─ Beat5_Clarity        ← comparison
        └─ DataDrawer              ← collapsible table
```

**Data flow:** `NCEStoryCard` receives `useCaseId`, reads `USE_CASE_MAP['uc-00']` for all data. No new data structures needed — all values derive from existing `vizData.contractors` and `vizData.totals`.

**State management:** Local React state only. No Zustand additions needed.
- `currentBeat` (1-2 for sequencer, null once scroll takes over)
- `drawerOpen` (boolean)

---

## Design Tokens

Uses existing theme tokens from `src/theme/tokens.js`:

| Token | Usage |
|-------|-------|
| `C.red` / `#F06060` | Afcons, alarm elements, high-severity streams |
| `C.orange` / `#d4893a` | NCC, medium-severity streams |
| `C.amber` / `#FBBF24` | KEC, warning accents |
| `C.green` / `#3bb88a` | L&T, benchmark, positive outcomes |
| `C.blue` / `#5c83ff` | Tata Projects, clarity/resolution accents |
| `C.purple` / `#a67bdb` | Twist/urgency accents |
| `C.t1`, `C.t2`, `C.t3` | Text hierarchy |
| `C.line` | Dividers |
| `FONT_SANS` | Body text, narration |
| `FONT_MONO` | Numbers, labels, data |

---

## Scope Boundaries

**In scope:**
- NCEStoryCard component (5 beats + data drawer)
- Animation system using Framer Motion
- Scroll-trigger orchestration
- Integration into ResponseCard (conditional render for uc-00)

**Out of scope:**
- Applying story pattern to other use cases (future work)
- Audio/narration
- Mobile-specific layout (desktop-first, basic responsive)
- Modifying the use case data structure in `useCases.js`
