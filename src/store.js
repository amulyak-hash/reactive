import { create } from 'zustand';
import { COMBO_DEFAULTS } from './data/tataSteel';

export const useStore = create((set, get) => ({
  layer: 'onboarding',
  dashboardReady: false,
  plantBReady: false,
  zonesReady: false,
  hoveredZone: null,

  // Story mode state
  story: null,       // zone id (bf, sms, cc, rm, ql) or card id (downtime, prod_trend, etc.)
  storyStep: 0,
  activeLens: 0,     // 0, 1, or 2 — which narrative lens is selected
  returnLayer: null,  // layer to return to when exiting story
  storyDetail: null,

  // Lens menu state
  lensMenuOpen: false,
  pendingArchetype: null,
  pendingCogStyle: null,
  activeArchetype: null,
  activeCogStyle: null,

  enterDashboard: () => set({ layer: 'dashboard', dashboardReady: false }),
  triggerDashboardAssembly: () => set({ dashboardReady: true }),
  goToPlantB: () => set({ layer: 'plantB', plantBReady: false, story: null, storyStep: 0, activeLens: 0, returnLayer: null }),
  triggerPlantBAssembly: () => set({ plantBReady: true }),
  goToZones: () => set({ layer: 'zones', zonesReady: false, story: null, storyStep: 0, activeLens: 0, returnLayer: null }),
  triggerZonesAssembly: () => set({ zonesReady: true }),
  goBack: (to) => set({ layer: to, dashboardReady: false, plantBReady: false, zonesReady: false, story: null, storyStep: 0 }),

  // Story actions
  enterStory: (storyId) => {
    const { layer, activeArchetype, activeCogStyle } = get();
    // Only snapshot returnLayer if we're NOT already in story mode
    // This prevents story→story navigation from losing the original layer
    const returnLayer = layer === 'story' ? get().returnLayer : layer;

    // Combo-specific default lens (#4)
    let defaultLens = 0;
    if (activeArchetype && activeCogStyle) {
      const comboKey = `${activeArchetype}:${activeCogStyle}`;
      defaultLens = COMBO_DEFAULTS[comboKey]?.[storyId] ?? 0;
    }

    set({
      returnLayer,
      layer: 'story',
      story: storyId,
      storyStep: 0,
      activeLens: defaultLens,
    });
  },
  exitStory: () => {
    const returnTo = get().returnLayer || 'dashboard';
    set({ layer: returnTo, story: null, storyStep: 0, activeLens: 0, returnLayer: null, storyDetail: null, dashboardReady: false, plantBReady: false, zonesReady: false });
  },
  enterStoryDetail: (detail) => {
    const { layer } = get();
    const returnLayer = layer === 'storyDetail' ? (get().returnLayer || 'story') : layer;
    set({
      layer: 'storyDetail',
      returnLayer,
      storyDetail: detail,
    });
  },
  exitStoryDetail: () => set({
    layer: 'story',
    storyDetail: null,
  }),
  setLens: (lens) => set({ activeLens: lens, storyStep: 0 }),
  setStoryStep: (step) => set({ storyStep: step }),
  nextStoryStep: () => set((s) => ({ storyStep: s.storyStep + 1 })),
  prevStoryStep: () => set((s) => ({ storyStep: Math.max(0, s.storyStep - 1) })),

  // Lens menu actions
  toggleLensMenu: () => set(s => ({ lensMenuOpen: !s.lensMenuOpen })),
  closeLensMenu: () => set({ lensMenuOpen: false }),
  setPendingArchetype: (key) => set({ pendingArchetype: key }),
  setPendingCogStyle: (key) => set({ pendingCogStyle: key }),
  applyLens: () => set(s => ({
    activeArchetype: s.pendingArchetype,
    activeCogStyle: s.pendingCogStyle,
    lensMenuOpen: false,
  })),
  resetLens: () => set({
    activeArchetype: null, activeCogStyle: null,
    pendingArchetype: null, pendingCogStyle: null,
    lensMenuOpen: false,
  }),

  // 3D Mode
  mode: '3d',  // '2d' | '3d'
  setMode: (m) => set({ mode: m, gestureMode: false, gestureError: null }),

  // Gesture control
  gestureMode: false,
  gestureError: null,
  toggleGestureMode: () => set(s => ({ gestureMode: !s.gestureMode, gestureError: null })),
  setGestureError: (err) => set({ gestureError: err, gestureMode: false }),

  // Holographic mode
  holoMode: false,
  toggleHoloMode: () => set(s => ({ holoMode: !s.holoMode })),

  // Scan onboarding: 'idle' → 'intel' → 'scanning' → 'materializing' → 'complete'
  scanPhase: 'idle',
  scanProgress: 0, // 0..1
  startIntel: () => set({ scanPhase: 'intel', scanProgress: 0 }),
  startScan: () => set({ scanPhase: 'scanning', scanProgress: 0 }),
  setScanProgress: (v) => set({ scanProgress: v }),
  setScanPhase: (p) => set({ scanPhase: p }),

  // Camera (3D scene)
  zoomLevel: 'orbit',  // orbit | wing | machine | story
  cameraAnimating: false,
  cameraTarget: null,   // { position: [x,y,z], lookAt: [x,y,z] } for flyTo
  setZoomLevel: (level) => set({ zoomLevel: level }),
  setCameraAnimating: (v) => set({ cameraAnimating: v }),
  flyTo: (preset) => set({ cameraTarget: preset, cameraAnimating: true }),
  clearFlyTo: () => set({ cameraTarget: null, cameraAnimating: false }),

  // Toggleable data layers (3D)
  activeLayers: { thermal: true, flow: true, financial: true, safety: true, timeline: true },
  toggleLayer: (name) => set(s => ({
    activeLayers: { ...s.activeLayers, [name]: !s.activeLayers[name] },
  })),
  timelineShift: 0,
  setTimelineShift: (v) => set({ timelineShift: v }),

  // AI Tour
  tourState: 'idle',  // idle | offered | active | paused
  tourWaypointIndex: 0,
  offerTour: () => set({ tourState: 'offered' }),
  startTour: () => set({ tourState: 'active', tourWaypointIndex: 0 }),
  pauseTour: () => set({ tourState: 'paused' }),
  resumeTour: () => set({ tourState: 'active' }),
  advanceTour: () => set(s => ({ tourWaypointIndex: s.tourWaypointIndex + 1 })),
  endTour: () => set({ tourState: 'idle', tourWaypointIndex: 0 }),

  // Cinematic Causal Tour
  causalTourState: 'idle',  // idle | briefing | active | paused | complete
  causalTourStep: -1,       // -1 = briefing/overview, 0-4 = tour steps
  causalTransitioning: false,
  startCausalTour: () => set({ causalTourState: 'active', causalTourStep: 0, causalTransitioning: true }),
  setCausalTourStep: (step) => set({ causalTourStep: step }),
  setCausalTransitioning: (v) => set({ causalTransitioning: v }),
  pauseCausalTour: () => set({ causalTourState: 'paused' }),
  resumeCausalTour: () => set({ causalTourState: 'active' }),
  advanceCausalTour: () => set(s => {
    const next = s.causalTourStep + 1;
    if (next > 4) return { causalTourState: 'complete', causalTourStep: 4 };
    return { causalTourStep: next, causalTransitioning: true };
  }),
  prevCausalTour: () => set(s => {
    const prev = Math.max(0, s.causalTourStep - 1);
    return { causalTourStep: prev, causalTransitioning: true };
  }),
  showCausalBriefing: () => set({ causalTourState: 'briefing', causalTourStep: -1 }),
  endCausalTour: () => set({ causalTourState: 'idle', causalTourStep: -1, causalTransitioning: false }),

  // AI Agent state
  aiOpen: false,
  aiContext: null,
  aiMessages: [],
  aiTyping: false,

  // AI Agent actions
  toggleAI: () => set(s => ({ aiOpen: !s.aiOpen })),
  setAIContext: (ctx) => {
    const prev = get().aiContext;
    if (prev?.id === ctx?.id && prev?.type === ctx?.type) return;
    set({ aiContext: ctx, aiMessages: [] });
  },
  pushAIMessage: (msg) => set(s => ({ aiMessages: [...s.aiMessages, msg] })),
  setAITyping: (v) => set({ aiTyping: v }),
}));

// Shared selectors for gesture system
export const selectGestureActive = (s) =>
  s.gestureMode && !s.cameraAnimating && s.tourState !== 'active' && s.scanPhase === 'complete';
export const selectGestureAvailable = (s) =>
  s.scanPhase === 'complete' && s.mode === '3d';
