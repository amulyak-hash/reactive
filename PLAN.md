# Phase 1: Hand Gesture Control for 3D Factory Scene

## Context
The Enterprise Brain 3D factory scene currently uses mouse-only interaction (OrbitControls for rotate/zoom/pan, click for zone selection). We're adding MediaPipe hand tracking so users can orbit and zoom the factory model with hand gestures — like manipulating a hologram.

## Scope (Phase 1 only)
- **Open palm + drag** → orbit (rotate) the factory
- **Pinch (thumb+index) spread/close** → zoom in/out
- **Fist** → idle/disengage (no accidental input)
- Toggle button to enable/disable gesture mode
- Small webcam preview in corner for visual feedback
- **Explicitly out of scope:** lens system, archetype/cog-style state, story defaults — zero touch

## Package & Assets
- `@mediapipe/tasks-vision@0.10.22` — pinned in `package.json`
- WASM loaded from **pinned CDN**: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm`
- Model asset: `hand_landmarker.task` loaded from same pinned CDN (consistent with WASM source)
- **No offline claim** — gesture mode requires network on first load (WASM + model cached by browser afterward). If CDN fetch fails, `setGestureError('Failed to load hand tracking model')` and toggle shows error state.
- **Lazy loading** — MediaPipe WASM + model are NOT loaded at app startup. They are fetched only when the user first enables gesture mode. This keeps the default 3D scene load free of CDN fetches and avoids penalizing users who never use gestures.

## Camera Ownership Model

The camera has multiple consumers that must be serialized. Priority (highest wins):

| Priority | Owner | When Active | Gesture Behavior |
|----------|-------|-------------|-----------------|
| 1 | GSAP flyTo | `cameraAnimating === true` | **Hard suspend** — gesture writes blocked, smoothing reset immediately |
| 2 | Tour Engine | `tourState === 'active'` | **Suspend** — gestures ignored, detection still runs |
| 3 | Onboarding scan | `scanPhase !== 'complete'` | **Unavailable** — toggle hidden, detection off |
| 4 | Gesture control | `gestureMode === true` && none of above | **Active** — drives camera |
| 5 | OrbitControls | Default (mouse) | **Active** when gesture suspended/off |

**Gesture availability** (controls toggle visibility): `scanPhase === 'complete' && mode === '3d'`

**Gesture active** (controls camera input): `gestureMode && !cameraAnimating && tourState !== 'active' && scanPhase === 'complete'`

Computed via shared selector `selectGestureActive` — single source of truth used by all consumers.

**Camera arbitration for GSAP flyTo:**
- When `cameraTarget` changes (flyTo dispatched), `cameraAnimating` becomes `true` immediately
- GestureController checks `gestureActiveRef` at the TOP of each `useFrame` — if false, it returns immediately (no camera writes)
- Additionally, GestureController watches `cameraAnimating` via useEffect and calls `gestureCamera.reset()` on transition to `true`, ensuring smoothing state is cleared BEFORE the next GSAP tick

**OrbitControls stays the synchronization target** — even during gesture mode (when OrbitControls is disabled for user input), GestureController updates camera position AND calls `controls.update()` each frame, keeping OrbitControls' internal state in sync. This prevents snap/jump when switching back to mouse.

**GSAP tween interruption:** When a new `flyTo()` is dispatched while a previous one is in-flight, CameraRig must `gsap.killTweensOf(camera.position)` and `gsap.killTweensOf(controls.target)` before starting new tweens. This prevents stacking. `cameraAnimating` is set `true` on flyTo dispatch and cleared in the `onComplete` of the new tween (existing pattern). If tweens are killed mid-flight, `clearFlyTo()` is called in the new tween's setup to reset state.

**Reset contract:** ALL smoothing refs and previous-frame refs are cleared when:
- Hand tracking lost (no landmarks detected)
- `gestureActive` flips false (flyTo starts, tour starts, mode change, scan restart)
- `gestureMode` toggled off
- Component unmounts
- `selectGestureAvailable` becomes false (mode switches to 2D, scan restarts)

**Module-level ref cleanup:** `cameraRigRef.current` is nulled in CameraRig's useEffect cleanup (unmount). `landmarksRef.current` is nulled in useHandTracking's cleanup. Both survive HMR but are re-initialized on remount. Consumers always null-check before reading.

**Tour interaction:** Gesture input does NOT count as a "user grab" that pauses the tour. When tour is active, gestures are silently suspended (ignored). The user must pause/resume the tour via existing UI controls. This avoids accidental tour interruption from hand movements.

## Component Ownership Model

**`GestureSession`** (new component, mounted in `FactoryScene` OUTSIDE Canvas) is the single owner of all gesture resources:

```
FactoryScene
├── Canvas
│   ├── CameraRig (exports cameraRigRef)
│   └── GestureController (receives landmarksRef via module-level shared ref)
└── GestureSession (owns useHandTracking, renders GestureOverlay as CHILD)
    ├── calls useHandTracking() — single MediaPipe instance
    ├── owns videoRef, canvasRef, landmarksRef
    ├── exports landmarksRef via module-level shared ref (for GestureController)
    └── GestureOverlay (CHILD — toggle button + webcam preview)
        └── receives videoRef, canvasRef, landmarksRef as props
```

**Sharing mechanism:** `landmarksRef` is a module-level `{ current: null }` object created in `useHandTracking.js` and exported. Both `GestureSession` (which calls `useHandTracking`) and `GestureController` (inside Canvas) import and read it. No prop threading, no context, no duplication.

**Detection lifecycle:**
- Detection rAF loop runs ONLY when `gestureMode === true` (not just when gesture is "active")
- When gestures are suspended (flyTo/tour) but `gestureMode` is still true: detection keeps running (low overhead since we already paid for webcam), but GestureController ignores the landmarks
- When `gestureMode` is toggled off OR mode switches to 2D: detection stops, webcam stops, MediaPipe closes
- This means CPU is only spent when the user has explicitly opted into gesture mode

## Files to Create

### 1. `src/scene/hooks/useHandTracking.js` — Core MediaPipe integration
- Creates and exports module-level `landmarksRef = { current: null }`
- Initialize HandLandmarker with `detectForVideo` running mode, pinned WASM version
- Manage webcam stream lifecycle (getUserMedia / stop tracks)
- Run detection loop via its own requestAnimationFrame (separate from R3F)
- Write raw landmarks to `landmarksRef` (not state)
- **Hand-loss handling:** When `detectForVideo` returns empty landmarks, set `landmarksRef.current = null`
- **Error handling:** catch getUserMedia denial → `setGestureError`; catch MediaPipe/WASM init failure → `setGestureError`
- **Cleanup:** on unmount OR when gestureMode toggled off: close landmarker, stop all video tracks, cancel rAF, set `landmarksRef.current = null`
- Export: `{ videoRef, canvasRef, landmarksRef, startTracking, stopTracking }`

### 2. `src/scene/hooks/useGestureCamera.js` — Gesture → camera mapping (pure logic, no R3F dependency)
- Imports `landmarksRef` from useHandTracking
- Consume `landmarksRef.current` each call
- **Gesture detection:**
  - Open palm: all fingertips (8,12,16,20) have smaller y than their MCP joints (6,10,14,18)
  - Pinch: distance(landmark 4, landmark 8) < PINCH_THRESHOLD
  - Fist: all fingertips have larger y than MCP joints
- **Smoothing:** EMA (factor 0.15) on palm position and pinch distance, stored in refs
- **Dead zone:** deltas < 0.003 normalized → zeroed
- **Orbit output:** `{ thetaDelta, phiDelta }` from palm center (landmark 9) frame-to-frame delta
- **Zoom output:** `{ radiusDelta }` from pinch distance change
- **Reset on loss:** When `landmarksRef.current === null`, reset all EMA/previous-frame refs
- **Reset on deactivate:** Expose `reset()` function
- Returns: `{ gesture, orbitDelta, zoomDelta, reset }`

### 3. `src/scene/GestureController.jsx` — R3F component inside Canvas
- Imports `landmarksRef` from useHandTracking (reads only)
- Calls `useGestureCamera` to get deltas
- In `useFrame`:
  - Check `gestureActiveRef.current` — if false, return immediately (no camera writes)
  - Read current camera position relative to `cameraRigRef.controls.target`
  - Convert to spherical coordinates
  - Apply `thetaDelta`, `phiDelta` (clamped: minPolar 0.2, maxPolar PI/2.1)
  - Apply `radiusDelta` (clamped: min 5, max 120)
  - Convert back to cartesian, set `camera.position`
  - Call `controls.update()` to keep OrbitControls in sync
- **gestureActiveRef** updated via useEffect watching `selectGestureActive`
- **On `cameraAnimating` → true:** immediately call `gestureCamera.reset()` (before next GSAP tick)
- **On gestureActive → false:** call `gestureCamera.reset()`

### 4. `src/scene/GestureSession.jsx` — Owner component (outside Canvas)
- Calls `useHandTracking()` — single MediaPipe instance for the app
- Watches `gestureMode` from store: starts/stops tracking accordingly
- Renders `<GestureOverlay>` passing `videoRef`, `canvasRef`, `landmarksRef`
- Handles lifecycle: if mode changes to 2D while gesture is on, stops tracking

### 5. `src/scene/overlays/GestureOverlay.jsx` — Toggle button + webcam preview
- Receives `videoRef`, `canvasRef`, `landmarksRef` as props from GestureSession
- Toggle button styled like existing HoloToggle in FactoryScene.jsx
- Positioned above HoloToggle (bottom: 80, right: 24)
- **Only visible when** `selectGestureAvailable(store)` — i.e. `scanPhase === 'complete' && mode === '3d'`
- **`pointerEvents: 'auto'`** + `onPointerDown={e => e.stopPropagation()}` on container — prevents Canvas `onPointerMissed`
- When active: shows small webcam preview (140x105px) in bottom-left corner
  - `<video>` element: `opacity: 0; position: absolute; width: 1px; height: 1px` (NOT `display: none`)
  - Visible `<canvas>` for landmark overlay drawing
- **Preview render loop:** GestureOverlay owns a small rAF loop that:
  1. Draws `videoRef.current` frame onto the visible preview canvas (scaled down)
  2. If `landmarksRef.current` exists, draws landmark dots/connections overlay
  3. Loop only runs when `gestureMode === true`; cancelled on disable/unmount
- **Error state:** If webcam denied or MediaPipe fails, show error message, auto-disable
- Hand icon SVG for the button

## Files to Modify

### `src/store.js`
Add minimal gesture state (no per-frame data):
```js
// Gesture control
gestureMode: false,
gestureError: null,
toggleGestureMode: () => set(s => ({ gestureMode: !s.gestureMode, gestureError: null })),
setGestureError: (err) => set({ gestureError: err, gestureMode: false }),
```
Reset gesture on mode change:
```js
setMode: (m) => set({ mode: m, gestureMode: false, gestureError: null }),
```
Shared selectors (exported):
```js
export const selectGestureActive = (s) =>
  s.gestureMode && !s.cameraAnimating && s.tourState !== 'active' && s.scanPhase === 'complete';
export const selectGestureAvailable = (s) =>
  s.scanPhase === 'complete' && s.mode === '3d';
```

### `package.json` + `package-lock.json`
- Add `"@mediapipe/tasks-vision": "0.10.22"` to dependencies (exact pin, no caret)
- Lock file updated automatically by `npm install`

### `src/scene/CameraRig.jsx`
- Export `cameraRigRef` (module-level `{ current: { controls: null, camera: null } }`)
- Import and use `selectGestureActive` for `gestureActive`
- Pass `enabled={!cameraAnimating && !gestureActive}` to OrbitControls
- Update `cameraRigRef.current` in useEffect
- **GSAP tween interruption:** Before starting new flyTo tweens, kill existing ones:
  ```js
  gsap.killTweensOf(camera.position);
  gsap.killTweensOf(controls.target);
  ```
  This prevents tween stacking on rapid repeated flyTo calls

### `src/scene/FactoryScene.jsx`
- Import `GestureController` and `GestureSession`
- Add `<GestureController />` inside `<Canvas>` (sibling to `<CameraRig />`)
- Add `<GestureSession />` outside `<Canvas>`, gated by `scanDone`

### `src/scene/hooks/useZoomLevel.js` — CORE PHASE (not separate)
- Change from `camera.position.length()` to `camera.position.distanceTo(target)`
- Read target from `cameraRigRef.current.controls?.target` with origin fallback
- **Threshold re-calibration:** Current thresholds (35/18/8) were measured origin-to-camera. `distanceTo(target)` ≈ same when target is near origin (overview) but differs at zoomed positions. After implementation, verify at all zoom levels.
- **Downstream consumers that depend on `zoomLevel`:**
  - `CommandBar.jsx` — UI visibility/behavior based on zoomLevel
  - `OrbitCardRing.jsx` — card ring visibility/layout based on zoomLevel
  - Both must be tested at overview, zone flyTo, and story entry

### `src/scene/hooks/useCameraContext.js`
- **No changes needed** — already measures camera-to-zone distance per zone's lookAt point

## Gesture-to-Camera Math

**Orbit (spherical coordinates around controls.target):**
```
offset = camera.position - target
spherical = cartesianToSpherical(offset)

palmDeltaX = currentPalm.x - prevPalm.x  (normalized 0-1, mirrored)
palmDeltaY = currentPalm.y - prevPalm.y

spherical.theta -= palmDeltaX * ROTATE_SENSITIVITY
spherical.phi   += palmDeltaY * ROTATE_SENSITIVITY
spherical.phi    = clamp(spherical.phi, 0.2, PI/2.1)

camera.position = target + sphericalToCartesian(spherical)
controls.update()
```

**Zoom (pinch distance):**
```
pinchDist = distance(landmark4, landmark8)
smoothedPinch = ema(pinchDist)
zoomDelta = (prevSmoothedPinch - smoothedPinch) * ZOOM_SENSITIVITY
spherical.radius = clamp(spherical.radius + zoomDelta, 5, 120)
```

**Smoothing:** `smoothed = smoothed + SMOOTHING_FACTOR * (raw - smoothed)`

**Dead zone:** `if (abs(delta) < DEAD_ZONE) delta = 0`

**Gesture hysteresis (prevents flickering):**
- Pinch: engage at distance < 0.06, release at distance > 0.09 (separate thresholds)
- Palm/fist transitions: require 3 consecutive frames of consistent classification before switching gesture state
- This prevents rapid toggling from noisy detection at gesture boundaries

## Overlay Stacking & Placement

The 3D scene has existing fixed-position overlays. Gesture UI must not collide:

| Element | Position | z-index |
|---------|----------|---------|
| HoloToggle | `bottom: 24, right: 24` | 20 |
| LayerToggleBar | `bottom: 24, left: 50%` (centered) | 100 |
| CommandBar | `top: 24, left: 50%` (centered) | 100 |
| IntelBriefing | `top/left/bottom` panels | 30 |
| **GestureToggle (new)** | `bottom: 80, right: 24` (above HoloToggle) | 20 |
| **Webcam Preview (new)** | `bottom: 24, left: 24` | 20 |

- GestureToggle stacks vertically above HoloToggle with 8px gap
- Webcam preview sits in bottom-left, clear of LayerToggleBar (which is centered)
- Both use `pointerEvents: 'auto'` + `onPointerDown stopPropagation` to avoid `onPointerMissed`
- Both share z-index 20 with HoloToggle (same layer of UI)

## Key Constants
```js
const ROTATE_SENSITIVITY = 4.0;
const ZOOM_SENSITIVITY = 80.0;
const SMOOTHING_FACTOR = 0.15;
const DEAD_ZONE = 0.003;
const PINCH_THRESHOLD = 0.06;
const WEBCAM_WIDTH = 640;
const WEBCAM_HEIGHT = 480;
const PREVIEW_WIDTH = 140;
const PREVIEW_HEIGHT = 105;
const MEDIAPIPE_VERSION = '0.10.22';
```

## Performance Considerations
- HandLandmarker runs on its own rAF loop, separate from R3F's useFrame
- ALL per-frame data via refs — zero Zustand writes per frame
- Detection loop only runs when `gestureMode === true` (user opted in)
- Webcam at 640x480, `maxNumHands: 1`, model complexity: 1
- `gestureActiveRef` pattern matches existing `cogClusterRef` RAF pattern

## Verification
1. `npm install` (installs `@mediapipe/tasks-vision@0.10.22`)
2. `npm run build` — verify clean build
3. `npm run lint` — verify no lint errors
4. `npm run dev` — manual testing:
   - Toggle hidden during onboarding scan
   - Toggle hidden in 2D mode
   - Toggle appears after scan completes in 3D mode
   - Enable gesture mode → webcam permission prompt
   - **Permission denied:** error shown, mode auto-disables
   - **CDN failure:** error shown, mode auto-disables
   - Open palm + move → factory rotates
   - Pinch → zoom in/out
   - Fist → no movement
   - Disable gesture mode → OrbitControls resume, webcam stops
   - Click zone label → flyTo works, gesture suspends during animation, **smoothing reset**, resumes after
   - Rapid repeated flyTo during gesture mode: no snap/jump (reset on each)
   - Start AI tour → gesture suspends during tour
   - Tour pause/resume with gestures: clean suspend/resume
   - Story entry/exit still works
   - Toggle holo mode while gesture active → both work
   - No jitter when hand is still (dead zone + smoothing)
   - **useZoomLevel validation:**
     - Overview → verify `orbit` level in CommandBar
     - FlyTo zone → verify `wing`/`machine` transitions
     - Enter story → verify `story` level
   - Switch 3D → 2D → 3D: gesture mode auto-disables, webcam stops, no stale state
   - Click gesture toggle/preview: does NOT trigger onPointerMissed
   - Click gesture UI while story panel is open: story stays open
   - **OrbitCardRing:** verify card ring shows/hides correctly at all zoom levels during gesture orbit
   - **Keyboard shortcuts:** Escape/T keys still work during gesture mode
   - **Repeated flyTo:** click zone → immediately click another zone → no tween stacking, smooth transition
   - **Module-level ref cleanup:** switch to 2D (unmounts scene), switch back to 3D → refs reinitialize cleanly

## Transition Validation Matrix

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 1 | Mid-gesture flyTo (click zone while orbiting) | Gesture suspends immediately, smoothing resets, flyTo animates smoothly |
| 2 | Active tour + gesture mode on | Gestures silently ignored, tour continues, no camera interference |
| 3 | 3D → 2D → 3D with gesture on | gestureMode auto-disables on 2D switch, webcam stops, refs nulled; returning to 3D starts clean |
| 4 | Scan complete → (hypothetical) scan restart | gestureAvailable becomes false, toggle hides, tracking stops |
| 5 | Rapid repeated flyTo during gesture mode | Previous GSAP tweens killed, no stacking, smooth transition to final target |
| 6 | Webcam denied then retry | Error shown, mode disables; user can re-enable toggle to re-prompt |
| 7 | Toggle gesture on/off rapidly | No leaked rAF loops, no duplicate MediaPipe sessions, clean start/stop |
| 8 | Tour pause → gesture input → tour resume | Gestures work during tour pause (tourState=paused ≠ active), suspend on resume |
