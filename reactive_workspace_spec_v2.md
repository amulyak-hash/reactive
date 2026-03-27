# Reactive Workspace — Design & Interaction Specification

---

## Table of Contents

1. [Global Layout](#1-global-layout)
2. [Landing Screen](#2-landing-screen)
3. [Response Format — Universal Component](#3-response-format--universal-component)
4. [Drill-Down Panel](#4-drill-down-panel)
5. [Response Timeline](#5-response-timeline)
6. [Bookmarked Responses Panel](#6-bookmarked-responses-panel)
7. [Artifacts Panel](#7-artifacts-panel)
8. [Artifact Viewer](#8-artifact-viewer)
9. [Left Side Panel — Collapse / New Thread / History](#9-left-side-panel--collapse--new-thread--history)
10. [Interaction States & Animation Reference](#10-interaction-states--animation-reference)

---

## 1. Global Layout

### 1.1 Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│ LEFT PANEL     │         MAIN CANVAS                  │ RIGHT EDGE   │
│ (collapsed by  │                                      │              │
│  default)      │                                      │  Timeline    │
│                │                                      │  Rail        │
│ [≡] Collapse   │  [Content — landing / thread]        │  (when 2+    │
│ [+] New Thread │                                      │   responses) │
│ [⧗] History   │                                      │              │
│                │                                      │              │
│                │  [Input Zone — sticky bottom]        │              │
│                │                                      │              │
│                │              [⊞ Bookmarks] [◇ Artifacts] top-right │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 Left Panel
- Default state: **collapsed** — shows only 3 icons stacked vertically
- Icons from top to bottom: Collapse toggle `≡`, New Thread `+`, History `⧗`
- Width collapsed: 48px
- Width expanded (history open): 260px
- Expanding/collapsing animates (240ms ease)

### 1.3 Main Canvas
- Occupies remaining width after left panel
- Scrollable vertically
- Input zone sticky to bottom always
- Top-right corner: Bookmarks icon + Artifacts icon — always visible within the canvas

### 1.4 Right Edge — Timeline Rail
- Fixed to right edge of canvas
- Visible only when thread has 2 or more responses
- Does not push canvas content — overlays at edge

---

## 2. Landing Screen

### 2.1 Purpose
The first screen the user sees. The agent proactively surfaces 6 high-level data points so the user does not need to know what to ask first. User can pick any of the 6 to begin analysis, or choose to start their own conversation.

### 2.2 Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Want to check on...                                        │
│                                                              │
│   ┌──────────────────┐   ┌──────────────────┐               │
│   │ Vendor Leaderboard│   │ Downline Products │               │
│   └──────────────────┘   └──────────────────┘               │
│                                                              │
│   ┌──────────────────┐   ┌──────────────────┐               │
│   │   NCE Alerts     │   │Milestone Slippages│               │
│   └──────────────────┘   └──────────────────┘               │
│                                                              │
│   ┌──────────────────┐   ┌──────────────────┐               │
│   │ Bid Value Spread │   │Risk Flags by Vendor               │
│   └──────────────────┘   └──────────────────┘               │
│                                                              │
│   ╔══════════════════════════════════════════╗               │
│   ║  +  Start your own conversation          ║               │
│   ║     The agent will follow your lead      ║               │
│   ╚══════════════════════════════════════════╝               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.3 Header Text
- Text above the 6 cards: `Want to check on...`
- Style: small, muted, not a heading — reads as the agent speaking
- No large title, no dashboard heading

### 2.4 The 6 Data Point Cards

#### The 6 Cards
| # | Card Title |
|---|---|
| 1 | Vendor Leaderboard |
| 2 | Downline Products |
| 3 | NCE Alerts |
| 4 | Milestone Slippages |
| 5 | Bid Value Spread |
| 6 | Risk Flags by Vendor |

#### Card Anatomy
```
┌──────────────────────────────────┐
│                                  │
│  Card Title                      │
│  One line description            │
│                                  │
│  [Micro visual — sparkline /     │
│   mini bar / status indicator]   │
│                                  │
└──────────────────────────────────┘
```
- **Card title:** Clear, readable, not truncated
- **One line description:** What this data point is about in plain language
- **Micro visual:** Small non-interactive preview — gives a feel of the data shape. Not a full chart. A sparkline, a small bar cluster, or status dots are sufficient
- **Hover state:** Card border highlights, micro visual animates subtly
- **No explicit button** — the entire card is clickable

#### Card Click Behaviour
1. Selected card scales up slightly (180ms)
2. All 6 cards and the header text fade out (220ms)
3. Canvas transitions to response view
4. Agent response card appears with the data for that topic
5. Input zone activates at bottom with placeholder: `ask a follow-up...`
6. Response Timeline Rail appears on right edge (first node = this response)

#### Dynamic Card Behaviour
- Cards are **not static** — they update based on what the user has already explored in this workspace
- Once a card topic has been explored, that card is replaced by the next most relevant data point the agent identifies from the data
- Cards that were previously explored show a subtle `· reviewed` indicator instead of looking identical to unexplored cards
- On return to landing after exploring: the agent regenerates the card set to reflect what is most relevant now, not what was shown before

### 2.5 Start Your Own Conversation Badge

#### Appearance
- Full-width, visually distinct from the 6 cards
- Outlined style — not filled, not the same as the cards
- Dashed or dotted border to signal it is a different kind of action
- Icon: `+` to the left of the label
- Primary label: **Start your own conversation**
- Secondary label below (smaller, muted): `The agent will follow your lead`
- This secondary label is important — it explicitly tells the user that mode is different

#### Click Behaviour
1. All 6 cards, header text, and badge animate out (slide up + fade, 240ms)
2. Canvas becomes completely empty and clean
3. Input zone moves from bottom to **vertical center of canvas** — this is the moment of transition, it should feel significant
4. Placeholder text in input: `What would you like to explore?`
5. Cursor is auto-focused in the input
6. After user types and submits first message: input animates back to bottom position
7. Canvas becomes the standard thread view and behaves identically from that point

#### Why the Badge is Distinct
The 6 cards represent the agent leading. The badge represents the user leading. These are two fundamentally different starting modes and the visual treatment must communicate that clearly — same interface, different starting intent.

---

## 3. Response Format — Universal Component

Every response in the workspace — whether triggered by a landing card selection or a user's own typed question — renders as a Response Card. The structure is the same for all responses.

### 3.1 Response Card Anatomy

```
┌────────────────────────────────────────────────────────────────┐
│ HEADER                                                         │
│  [User question — italic, muted]                               │
│  [Format label — e.g. "Table"]    [Type Switcher]  [Bookmark]  │
├────────────────────────────────────────────────────────────────┤
│ BODY                                                           │
│                                                                │
│  [Primary visualisation — agent-chosen]                        │
│                                                                │
│  [Agent insight — 1 to 2 lines, interpretation not description]│
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ FOOTER                                                         │
│  [Perspective lens chips]             [Export]   [Bookmark]    │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Header

#### User Question Echo
- The question or topic that triggered this response
- Shown in small italic muted text at the top of the card
- Example: *"Which vendors have raised NCEs in the last 30 days?"*
- Purpose: anchors the user, especially useful when scrolling through a long thread

#### Format Label
- Small label showing the format the agent has chosen
- Example: `Table` / `Bar Chart` / `Line Chart` / `Leaderboard` / `Sankey` / `Text`
- Not interactive — just informational, so user knows what they are looking at

#### Type Switcher
- Row of compact toggle buttons next to the format label
- Options: `Table` `Bar` `Line` `Leaderboard` `Text`
- Agent's chosen format is highlighted/selected by default
- User can click any other option to switch
- On switch: visualisation transitions with a brief morph animation (280ms)
- Incompatible options for that response are visually dimmed and non-clickable
- Tooltip on hover for each button: e.g. `View as bar chart`

#### Bookmark Icon (Header)
- Top right of header
- Outline icon by default
- On click: fills solid (saved state), response is added to Bookmarks
- Synced with the Bookmark button in the footer — both reflect the same state

### 3.3 Body

#### Primary Visualisation
- Rendered based on agent's chosen format (or user-switched format)
- Visualisation types:

| Type | When Agent Uses It |
|---|---|
| Leaderboard table | Ranking vendors across multiple performance dimensions |
| Bar chart | Single dimension comparison across vendors or contracts |
| Line chart | Trend or change over a time period |
| Sankey chart | Flow of funds, bid-to-award pipeline, cost allocation |
| Distribution / dot plot | Bid value spread, outlier detection |
| Timeline / Gantt | Milestone schedule and slippage view |
| Priority list | Risk flags and alerts ranked by severity |
| Text | Qualitative or narrative responses |

#### Drill-Down on Visualisation Elements
- Every interactive element within a visualisation (a bar, a row, a dot, a node) shows a hover state indicating it is drillable
- On hover: element highlights, small directional indicator appears
- On click: Drill-Down Panel slides in from the right (see Section 4)
- The clicked element remains highlighted with a ring while the drill-down panel is open

#### Agent Insight
- 1–2 lines below the visualisation, inside the card body
- Written by the agent as an interpretation, not a description of what the chart shows
- Example: *"Vendor A accounts for 62% of total NCE value — significantly above the group average of 18%."*
- Style: slightly smaller text, muted color, left-aligned
- This is not a caption — it tells the user what to notice

### 3.4 Footer

#### Perspective Lens Chips
- Label: `also see →` (small, muted) followed by 2–4 chips
- Each chip is an alternate analytical angle the agent has identified without the user asking
- Example chips for a Vendor Leaderboard response:
  - `By region`
  - `NCE impact on rank`
  - `Compare to prior quarter`
  - `Filter by contract value`
- On chip click: a new response card appears below the current one, pre-answered with that lens applied
- The new card is clearly labeled as agent-suggested, not user-asked

#### Export Button
- Bottom right of card footer
- On click: small popover with options — `Download as PNG` / `Download as CSV`

#### Bookmark Button (Footer)
- Bottom right of card footer, left of Export
- Same behaviour and state as the Bookmark icon in the header
- Both are always in sync

### 3.5 Universal Applicability
This exact card structure — type switcher, perspective lens, export, bookmark — applies to every single response in the workspace regardless of:
- Whether it was triggered by a landing card or a typed question
- What visualisation format is shown
- What thread the user is in

There are no exceptions to this. Every response gets all of these.

---

## 4. Drill-Down Panel

### 4.1 Trigger
User clicks any interactive element within a response card's visualisation — a bar, a table row, a dot on a chart, a node in a Sankey diagram.

### 4.2 Behaviour on Trigger
1. Panel slides in from the **right side** of the canvas (300ms ease)
2. Main canvas does not navigate away — it stays exactly where it is
3. Canvas dims to approximately 60% opacity while panel is open
4. The clicked element in the visualisation gets a highlighted ring to show it is selected and connected to the open panel

### 4.3 Panel Layout

```
┌─────────────────────────────────────────────┐
│  Drill-down: [Name of selected element] [✕] │
├─────────────────────────────────────────────┤
│                                             │
│  WHAT YOU SELECTED                          │
│  ┌─────────────────────────────────────┐    │
│  │ Compact summary of the element      │    │
│  │ selected — key values, name, rank   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  INSIGHTS                                   │
│                                             │
│  [Insight card 1]                           │
│  [Insight card 2]                           │
│  [Insight card 3]                           │
│                                             │
│  [Export]  [Bookmark panel contents]        │
└─────────────────────────────────────────────┘
```

### 4.4 What You Selected Block
- First thing the user sees inside the panel
- A compact card summarising the element they clicked
- Immediately confirms: *yes, the agent understood what you selected*
- Example for a vendor row click on Leaderboard:
  - Vendor name + overall rank
  - Number of active contracts
  - Total NCE value raised
  - Number of open risk flags

### 4.5 Insights Block
- 2–4 insight cards below the selected element summary
- Each insight card uses a mini visualisation or clearly structured readable text — not a wall of plain text
- Insights are contextually relevant to the selected element
- Example for Vendor A selected:
  - NCE history over time (mini line chart)
  - Milestone completion rate (progress bars)
  - Risk flags list with severity indicators (color-coded)
  - Contract value vs NCE raised (mini bar comparison)
- Must be easy to scan — readable, visually interesting, digestible

### 4.6 Panel Close
- `✕` close button at top right of panel header — always visible
- Click outside the panel area also closes it
- On close: panel slides out (200ms), canvas returns to full opacity, element de-highlights
- Panel width: approximately 38% of total canvas width

---

## 5. Response Timeline

### 5.1 Purpose
When a user is in a thread and has asked multiple questions, the timeline appears on the right edge of the canvas. It lets the user jump to any specific response without manually scrolling.

### 5.2 When It Appears
- Only when the thread has 2 or more responses
- Not shown on the landing screen
- Not shown in the empty "own conversation" state before the first message is sent

### 5.3 Visual Structure

```
   ▲   ← Up chevron
   │
   ─   ← Response node / line
   │
   ─   ← Response node / line
   │
   ─   ← Response node / line
   │
   ─   ← Response node / line
   │
   ▼   ← Down chevron
```

- Vertical stack of horizontal lines between two chevrons
- Each line / segment represents one response in the thread
- The segment corresponding to the response currently visible in the center of the canvas is highlighted
- Rail is positioned at the far right edge, minimal width, does not push canvas content

### 5.4 Up Chevron `▲`
- Click: canvas smooth-scrolls to the response immediately **above** the one currently in view
- Disabled / grayed out state when the user is already at the first response

### 5.5 Down Chevron `▼`
- Click: canvas smooth-scrolls to the response immediately **below** the one currently in view
- Disabled / grayed out state when the user is already at the last response

### 5.6 Individual Line Segments (Between Chevrons)

#### Hover Behaviour
- Hovered segment **highlights** — brightens or fills with color
- A **preview tooltip** appears to the **left** of the rail
- Preview tooltip shows:
  - The user's question for that response (truncated if long)
  - The visualisation type used (e.g. `Bar Chart`)
  - Timestamp
- Tooltip animates in (fade + slight slide, 150ms)

#### Click Behaviour
- Canvas **smooth-scrolls** to that specific response (400ms ease)
- That response card **pulses briefly** (500ms highlight animation) to orient the user
- Preview tooltip disappears on click

#### Active Segment
- The segment for the response currently visible in the viewport is always highlighted
- Updates automatically as the user manually scrolls through the canvas

---

## 6. Bookmarked Responses Panel

### 6.1 Trigger
User clicks the **Bookmarks icon** in the top-right area of the main canvas.

### 6.2 Behaviour on Trigger
- Panel slides in from the right (300ms ease)
- Canvas dims to 60% opacity
- Panel overlays the canvas — does not push it

### 6.3 Panel Layout

```
┌──────────────────────────────────────┐
│  Saved Responses                [✕]  │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐    │
│  │ [Vis type] Response preview  │    │
│  │ Question echo — muted        │    │
│  │ Timestamp                    │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ [Vis type] Response preview  │    │
│  │ Question echo — muted        │    │
│  │ Timestamp                    │    │
│  └──────────────────────────────┘    │
│                                      │
│  ...                                 │
└──────────────────────────────────────┘
```

### 6.4 Each Item in List
- Visualisation type indicator (icon or small label)
- The user's question for that response — truncated, italic, muted
- Timestamp of when it was bookmarked
- Hover state: row highlights

### 6.5 Item Click Behaviour
1. Panel **slides out and closes** (200ms)
2. Canvas returns to full opacity
3. Canvas **auto-scrolls** to that bookmarked response (400ms ease)
4. That response card **pulses briefly** (highlight animation, 500ms) so the user knows exactly where they landed

### 6.6 Close
- `✕` button top right of panel — always visible
- Click outside panel also closes it
- On close: canvas returns to full opacity

---

## 7. Artifacts Panel

### 7.1 Trigger
User clicks the **Artifacts icon** in the top-right area of the main canvas.

### 7.2 Behaviour on Trigger
- Panel slides in from the right (300ms ease)
- Canvas dims to 60% opacity
- Panel overlays canvas — does not push it

### 7.3 Panel Layout

```
┌──────────────────────────────────────┐
│  Artifacts                      [✕]  │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐    │
│  │ [Icon] Artifact name         │    │
│  │ Created: date                │    │
│  │ [Small preview thumbnail]    │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ [Icon] Artifact name         │    │
│  │ Created: date                │    │
│  │ [Small preview thumbnail]    │    │
│  └──────────────────────────────┘    │
│                                      │
└──────────────────────────────────────┘
```

### 7.4 Each Item in List
- Artifact type icon
- Artifact name (agent-generated based on content)
- Created date
- Small static preview thumbnail — gives a sense of what the artifact contains

### 7.5 Item Click Behaviour
1. Artifact panel **stays open**
2. Artifact Viewer opens to the **right of the artifacts panel** (see Section 8)
3. User can close either independently

### 7.6 Close
- `✕` button top right of panel — always visible
- Click outside panel area closes it (if Artifact Viewer is not open)
- On close: canvas returns to full opacity

---

## 8. Artifact Viewer

### 8.1 What This Is
When a user selects an artifact from the Artifacts Panel, the artifact opens in a dedicated viewer that appears to the right of the Artifacts Panel.

### 8.2 Layout When Open

```
┌──────────────────┬────────────────────┬───────────────────┐
│                  │                    │                   │
│  MAIN CANVAS     │  ARTIFACTS PANEL   │  ARTIFACT VIEWER  │
│  (dimmed)        │                    │                   │
│                  │                    │  [Content]        │
│                  │                    │                   │
│                  │                    │  [✕ Close]        │
└──────────────────┴────────────────────┴───────────────────┘
```

### 8.3 Artifact Viewer Layout

```
┌────────────────────────────────────────┐
│  [Artifact name]                  [✕]  │
│  Created: date                         │
├────────────────────────────────────────┤
│                                        │
│  [Section heading]                     │
│  [Mini static visualisation]           │
│  [Agent narrative — short paragraph]   │
│                                        │
│  [Section heading]                     │
│  [Key metric callout]                  │
│  [Agent narrative]                     │
│                                        │
│  ...                                   │
│                                        │
├────────────────────────────────────────┤
│  [Export PDF]   [Share]                │
└────────────────────────────────────────┘
```

### 8.4 Content Format
- Structured like a brief report — not a wall of text
- Clear section headings
- Mini static visualisations (not interactive) of key data
- Short agent-written narrative between visuals
- Key metrics shown as highlighted callouts — easy to scan
- Must be readable, not dense

### 8.5 Close Behaviour
- `✕` button top right of viewer — always visible
- On close: viewer slides out (200ms)
- Artifacts panel (if still open) returns to full view
- Canvas opacity normalises based on whether Artifacts panel is still open

---

## 9. Left Side Panel — Collapse / New Thread / History

### 9.1 Default State
The left panel is **collapsed by default**. It shows only 3 icons stacked vertically. No labels visible in collapsed state.

```
┌────────┐
│  ≡     │  ← Collapse / expand toggle
│        │
│  +     │  ← New Thread
│        │
│  ⧗    │  ← History
└────────┘
```

### 9.2 Collapse Toggle `≡`

#### Behaviour
- Click: expands or collapses the left panel
- Collapsed state: 48px wide, icons only
- Expanded state (history open): 260px wide, shows history list
- Animation: smooth width transition (240ms ease)
- The icon itself does not change — it is always visible as the control

### 9.3 New Thread `+`

#### Behaviour on Click
- No panel opens
- Current thread is **automatically saved** in history
- Canvas resets to the **Landing Screen** (Section 2)
- The 6 data point cards regenerate to reflect the most current relevant data points
- The left panel returns to collapsed state

### 9.4 History `⧗`

#### Behaviour on Click
- Left panel **expands** to show the history list (240ms ease)
- This is the only case where the left panel expands

#### History Panel Layout (Expanded)

```
┌─────────────────────────────────────┐
│  ≡                                  │  ← Collapse toggle still visible
│                                     │
│  +  New Thread                      │
│                                     │
│  ⧗  History                        │
│  ─────────────────────────────────  │
│                                     │
│  [Thread title]                     │
│  Date · # responses                 │
│                                     │
│  [Thread title]                     │
│  Date · # responses                 │
│                                     │
│  [Thread title]                     │
│  Date · # responses                 │
│                                     │
│  ...                                │
└─────────────────────────────────────┘
```

#### Each History Item
- Thread title: auto-generated by agent based on dominant topic of that session
- Date of last activity
- Number of responses in that thread
- Hover state: row highlights

#### History Item Click Behaviour
1. That thread loads in the **main canvas**
2. Left panel **collapses back** to default icon state (240ms ease)
3. The thread is shown exactly as it was when last active

#### Collapse from Expanded State
- Click the `≡` icon again: panel collapses (240ms ease)
- Click anywhere on the main canvas: panel collapses

---

## 10. Interaction States & Animation Reference

### 10.1 Hover States
| Element | Hover State |
|---|---|
| Landing data point card | Border highlights, micro visual animates subtly |
| Start your own conversation badge | Border brightens, `+` shifts slightly right |
| Visualisation element (bar, row, dot) | Element highlights, drill-down indicator appears |
| Timeline rail segment | Segment fills / brightens, preview tooltip appears to left |
| Bookmark icon | Icon brightens |
| Perspective lens chip | Background brightens |
| History panel item | Row highlights |
| Bookmarks panel item | Row highlights |
| Artifacts panel item | Row highlights |

### 10.2 Active / Selected States
| Element | Active State |
|---|---|
| Landing card (clicked) | Brief scale up before transition |
| Visualisation element (drill-down open) | Highlighted ring maintained while panel is open |
| Bookmark icon / button | Fills solid (saved) |
| Type switcher button | Filled / selected background |
| Timeline segment (current response) | Highlighted / filled |

### 10.3 Animation Timing Reference
| Interaction | Duration | Easing |
|---|---|---|
| Landing cards fade out on card click | 220ms | ease-out |
| Response card enters canvas | 300ms | ease-out |
| Input zone moves to center (own conversation) | 280ms | ease-in-out |
| Input zone returns to bottom after first message | 280ms | ease-in-out |
| Drill-down panel slide in | 300ms | ease |
| Drill-down panel slide out | 200ms | ease-in |
| Right slide panels (bookmarks / artifacts) | 300ms | ease |
| Artifact viewer slide in | 300ms | ease |
| Canvas dim when any panel opens | 200ms | ease |
| Canvas undim when panel closes | 200ms | ease |
| Left panel expand (history) | 240ms | ease |
| Left panel collapse | 240ms | ease |
| Auto-scroll to response | 400ms | ease-in-out |
| Response highlight pulse on landing | 500ms | ease |
| Timeline preview tooltip appear | 150ms | ease |
| Bar chart bars animate in | 600ms staggered 50ms per bar | ease-out |
| Line chart draws left to right | 600ms | ease-in-out |
| Leaderboard score bars fill | 800ms staggered 80ms per row | ease-out |
| Type switcher visualisation morph | 280ms | ease |
| Menu / badge scale on click | 180ms | ease-out |
