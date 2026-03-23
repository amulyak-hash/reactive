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
    set({ layer: returnTo, story: null, storyStep: 0, activeLens: 0, returnLayer: null, dashboardReady: false, plantBReady: false, zonesReady: false });
  },
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
