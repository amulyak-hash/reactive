# Isometric Contract Lifecycle Flow — Design Spec

**Date**: 2026-04-15
**Status**: Draft
**Replaces**: RiskConstellation home page visualization

## Overview

The Dashboard home page becomes an isometric 3D scene showing the Tata Steel Talbot Port contract lifecycle as a series of floating planes descending from top-left to bottom-right. Each plane represents a stage (Bids, Contracts, Early Warnings, NCEs, Claims) with concrete 3D data visualizations on top. Animated particle flows connect the planes. The scene reveals with a cinematic stagger on page load. Clicking any stage opens the relevant use case thread.

## Architecture: Hybrid Three.js + CSS Overlay

Two layers stacked in a `position: relative` container:

1. **Three.js Canvas** (bottom) — `WebGLRenderer` with `OrthographicCamera` in isometric projection. Renders: floating planes, 3D data vizzes, flow tube geometry, animated particles, background grid, stars.

2. **CSS Overlay** (top) — absolutely positioned `<div>` elements for: stage labels, data callouts, split branch labels, clickable hit zones. `pointer-events: none` on the overlay container, `pointer-events: auto` on interactive elements only.

**Coordinate sync**: Each frame, project Three.js world positions to screen pixels using `Vector3.project(camera)` and update CSS `transform: translate()`:

```js
// Per the Three.js docs for aligning HTML to 3D
const tempV = new THREE.Vector3();
tempV.copy(worldPosition);
tempV.project(camera);
const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
```

### File Structure

```
src/components/Dashboard.jsx          — Container: Three.js canvas + CSS overlay
src/canvas/uc/IsometricScene.jsx      — Three.js scene setup, camera, renderer, animation loop
src/canvas/uc/isometric/
  terrain.js                          — Background grid + stars
  platforms.js                        — Floating plane geometry per stage
  vizzes.js                           — 3D data visualizations (bars, cubes, prisms, etc.)
  flows.js                            — TubeGeometry paths + animated particles
  reveal.js                           — Staggered reveal animation timeline
  project.js                          — 3D→screen coordinate projection utility
```

## Scene Composition

### Background: Grid + Stars

**Isometric grid**: Two sets of parallel lines at 30deg angles forming a diamond pattern. Very low opacity (0.03-0.06), cyan/white. Fades toward edges with a vignette effect. Rendered as `LineSegments` with `LineBasicMaterial({ transparent: true, opacity: 0.04 })`.

**Stars**: `BufferGeometry` + `Points` with custom size attribute. ~200 particles scattered in the background plane. Most static at low opacity (0.1-0.3). ~20 stars have a subtle twinkle (sinusoidal opacity oscillation in the animation loop). Slight parallax depth — stars sit far behind the planes.

**Depth stack** (back to front): grid → stars → flow paths → floating planes → 3D vizzes → CSS labels

### Floating Isometric Planes

Each stage is an independent platform floating in the void. No shared terrain. Platforms are `BoxGeometry` slabs (wide, shallow depth) with visible top face and side edges giving thickness.

**Isometric camera setup** (per Three.js OrthographicCamera docs):

```js
const frustumSize = 10;
const aspect = width / height;
const camera = new THREE.OrthographicCamera(
  frustumSize * aspect / -2,
  frustumSize * aspect / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1, 1000
);
// Standard isometric angles
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();
```

**Platform material**: `MeshStandardMaterial` with low opacity (0.15-0.25), accent-colored emissive glow, transparent. Side faces slightly darker for depth.

**Lighting**: 
- `AmbientLight(0x7c7c7c, 0.5)` — low ambient fill
- `DirectionalLight(0xffffff, 1.2)` — from top-left, soft shadows on platforms

### 5 Main Stages — Positions & 3D Vizzes

Platforms descend diagonally from top-left to bottom-right in world space:

| # | Stage | World Position (approx) | Platform Color | 3D Visualization |
|---|-------|------------------------|----------------|------------------|
| 1 | **Bids** | (-6, 4, -6) | `C.blue` (#3B8BF6) | 5 isometric 3D bars — one per contractor, height = winning bid amount. Tallest = Tata Projects (£2,100K), shortest = NCC (£860K). `BoxGeometry` per bar. |
| 2 | **Contracts** | (-3, 2.5, -3) | `C.cyan` (#29CFD6) | Stacked isometric cubes — 5 layers, size proportional to contract value. Tata Projects largest (£210.6M base), Afcons glowing red edge (25% flag). `BoxGeometry` stacked. |
| 3 | **Early Warnings** | (0, 1, 0) | `C.amber` (#F59E0B) | Triangular prisms (`ConeGeometry` 3 sides) — 3 markers, height = avg days open per risk band. Critical ones pulse (emissive oscillation). |
| 4 | **NCEs** | (3, -0.5, 3) | `C.red` (#EF4444) | Rising stepped bars — 5 bars showing accumulation over time. Height increases left to right. Tallest bar glows (Afcons £35.5M). `BoxGeometry` per bar. |
| 5 | **Claims** | (6, -2, 6) | `C.purple` (#A855F7) | Interconnected spheres — `SphereGeometry` nodes connected by thin `CylinderGeometry` edges. Size = claim value. Network layout shows pattern clusters. |

### 3 Branch Endpoints

At two split points, the flow forks and smaller platforms branch off:

| Branch | Parent | World Position | Color | 3D Viz |
|--------|--------|---------------|-------|--------|
| **Not NCE** (resolved) | EW split | (2, 2, -1) — branches upper-right | `C.green` (#22C55E) | Flat settled blocks with checkmark-shaped wireframe geometry on top |
| **Implemented** | NCE split | (7, -3.5, 7) — continues diagonal | `C.purple` (#A855F7) | Solid absorbed cubes, stacked tight |
| **Rejected** | NCE split | (7, 0, 4) — branches upper-right | `C.orange` (#F4722B) | X-shaped crossed geometry (two rotated thin boxes) |

### Split Point Indicators

At each fork, a small glowing ring/sphere marks the decision point. `RingGeometry` or `TorusGeometry` with emissive material, oriented facing the camera.

- **Split 1** (after EW): amber ring, positioned between EW platform and the two branches
- **Split 2** (after NCE): red ring, positioned between NCE platform and Implemented/Rejected

## Flow Connections

### Path Geometry

Connections between platforms are curved 3D tubes using `TubeGeometry` + `CatmullRomCurve3`:

```js
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-6, 4, -6),    // Bids platform center
  new THREE.Vector3(-4.5, 3.5, -4.5), // midpoint with slight arc
  new THREE.Vector3(-3, 2.5, -3),  // Contracts platform center
], false, 'centripetal', 0.5);

const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.03, 8, false);
const tubeMat = new THREE.MeshBasicMaterial({
  color: sourceStageColor,
  transparent: true,
  opacity: 0.25
});
```

Tube radius is thin (0.03 world units). Low opacity — the tubes are guides, not the focus.

### Connections Map

```
Bids ──────────────→ Contracts
Contracts ─────────→ Early Warnings
Early Warnings ───→ [Split 1]
  [Split 1] ──────→ NCEs          (label: "Became NCE — 38%")
  [Split 1] ──────→ Not NCE       (label: "Not NCE — 62%")
NCEs ─────────────→ [Split 2]
  [Split 2] ──────→ Implemented   (label: "Implemented")
  [Split 2] ──────→ Rejected      (label: "Rejected")
```

### Animated Particles

Glowing dots travel along each flow path. Implemented as `Points` with custom `BufferGeometry`:

- ~5-8 particles per connection, staggered along the curve
- Each particle has a `t` parameter (0→1) that advances each frame
- Position sampled from the curve: `curve.getPointAt(t)`
- Particle color transitions from source accent to destination accent as `t` progresses
- Size: small (0.04-0.06 world units), additive blending for glow
- At split points, particles fork — some continue to branch A, others to branch B (weighted by the split ratio, e.g., 38/62 for the EW split)

## Staggered Reveal Animation

~8.5 seconds total. Auto-plays on page load. Each stage follows this reveal sequence:

1. Platform rises from below (Y translation, `easeOutBack`)
2. 3D viz builds on top (bars grow upward, cubes stack, spheres scale in)
3. CSS label fades in (opacity 0→1)
4. Flow connection to next stage activates (tube fades in, particles begin)

### Timeline

| Time | Event |
|------|-------|
| 0–0.5s | Background fades in — grid lines draw, stars appear |
| 0.5–2.0s | **Bids** platform rises, 5 bars grow, label appears |
| 2.0–3.5s | **Contracts** platform rises, cubes stack, label appears. Flow particles: Bids→Contracts begin |
| 3.5–5.0s | **Early Warnings** platform rises, prisms grow, label appears. Flow: Contracts→EW begins |
| 5.0–6.0s | **Split 1 activates** — fork ring appears, flow divides. **Not NCE** branch plane rises with green glow |
| 6.0–7.5s | **NCEs** platform rises, stepped bars grow, label appears. Flow: EW→NCE completes |
| 7.5–8.5s | **Split 2 activates** — fork ring appears. **Implemented** and **Rejected** planes rise simultaneously |

### Idle State (post-reveal)

After full reveal the scene stays alive:
- Particles continue flowing along all paths
- Stars twinkle (random subset, sinusoidal opacity)
- Critical stages pulse gently (emissive oscillation on Afcons bar, EW prisms)
- Subtle ambient drift — nothing moves position, just gentle material breathing

### Easing

Reuse existing easing functions from `src/canvas/easing.js`:
- `easeOutBack` — platform rise (slight overshoot for punch)
- `easeOutCubic` — viz element growth, opacity fades

## CSS Overlay Layer

### Label Elements

Each platform gets a CSS label positioned below it:

```html
<div class="iso-label" data-stage="bids">
  <span class="iso-label-title">BIDS</span>
  <span class="iso-label-subtitle">5 contractors</span>
</div>
```

**Styling** (inline styles, matching project pattern):
- Font: DM Sans (`FONT_SANS`), 600 weight
- Title color: stage accent color
- Subtitle: `#667788`, smaller font
- Opacity animated from 0→1 during reveal

### Split Branch Labels

At each fork, floating labels show the branch name and percentage:

```html
<div class="iso-branch-label" data-branch="became-nce">
  <span style="color: #EF4444; font-weight: 600;">Became NCE</span>
  <span style="color: #EF444488;">38% conversion</span>
</div>
```

### Data Callouts

Key numbers displayed near their stage:
- Bids: no extra callout (label subtitle suffices)
- Contracts: "£720.6M portfolio"
- Early Warnings: "12 open, £820K risk"
- NCEs: "£93.2M deviation"
- Claims: "patterns detected"
- Not NCE: "risk mitigated"
- Implemented: "cost absorbed"
- Rejected: "cost saved"

### Click Hit Zones

Invisible `<div>` elements positioned over each platform with `pointer-events: auto` and `cursor: pointer`. Sized to cover the platform footprint. On click, call `askByUseCase(ucId)`.

**Click → Use Case mapping:**

| Stage | Use Case ID | Thread Question |
|-------|-------------|-----------------|
| Bids | uc-02 | Salami slicing / bid-stage cost recovery |
| Contracts | uc-00 | NCE Variation Analysis |
| Early Warnings | uc-03 | EW Response Time vs Cost |
| Not NCE | uc-06 | Contractor Silence Alarm |
| NCEs | uc-01 | Budget Bleed Detection |
| Implemented | uc-05 | NCE Validity Assessment |
| Rejected | uc-04 | Coupled Risk Detection |
| Claims | uc-09 | Hidden Claim Patterns |

### Hover Behavior

On hover (detected via CSS `:hover` on hit zones, communicated to Three.js via a ref):
- Platform lifts slightly (+0.15 Y)
- Edge glow brightens (emissive intensity increases)
- Connected flow paths pulse brighter
- CSS label gains full opacity + shows one-line insight headline from use case data

## Dependencies

**New**: `three` (Three.js) — npm package. Only dependency added.

**Existing** (reused):
- `src/canvas/easing.js` — `easeOutBack`, `easeOutCubic`
- `src/canvas/utils.js` — `drawGlow` pattern referenced for glow style consistency
- `src/theme/tokens.js` — `C.blue`, `C.cyan`, `C.amber`, `C.red`, `C.purple`, `C.green`, `C.orange`, `FONT_SANS`, `FONT_MONO`
- `src/store.js` — `askByUseCase`, `view` state
- `src/data/useCases.js` — `USE_CASES` array for insight headlines, use case IDs

## Three.js Setup Pattern (React Integration)

```jsx
// IsometricScene.jsx — core pattern
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function IsometricScene({ width, height, onHover, onReady }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const frustumSize = 10;
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1, 1000
    );
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    // ... build scene, start animation loop ...

    sceneRef.current = { renderer, scene, camera };

    return () => {
      renderer.dispose();
      // dispose all geometries, materials, textures
    };
  }, [width, height]);

  return <canvas ref={canvasRef} />;
}
```

**Cleanup**: On unmount, dispose renderer, all geometries, materials, and textures to prevent WebGL context leaks.

## Responsive Behavior

- `Dashboard.jsx` uses a `ResizeObserver` to track container dimensions (existing pattern)
- On resize: update `OrthographicCamera` frustum, `renderer.setSize()`, reproject CSS labels
- Platforms and vizzes use relative world-space positions — the camera frustum adjustment handles scaling
- CSS labels reposition automatically via the projection sync running each frame

## Performance Considerations

- Total geometry count is low (~30-40 meshes) — well within WebGL budget
- Particles use `Points` with `BufferAttribute` updates (no per-particle mesh overhead)
- Flow tubes are static geometry after creation — only particle positions update per frame
- Stars are a single `Points` object with ~200 vertices
- Grid is a single `LineSegments` object
- CSS overlay updates are batched in `requestAnimationFrame`
- `renderer.setAnimationLoop(animate)` for the render loop — Three.js manages RAF internally
