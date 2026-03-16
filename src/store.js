import { create } from 'zustand';

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

  enterDashboard: () => set({ layer: 'dashboard', dashboardReady: false }),
  triggerDashboardAssembly: () => set({ dashboardReady: true }),
  goToPlantB: () => set({ layer: 'plantB', plantBReady: false }),
  triggerPlantBAssembly: () => set({ plantBReady: true }),
  goToZones: () => set({ layer: 'zones', zonesReady: false }),
  triggerZonesAssembly: () => set({ zonesReady: true }),
  goBack: (to) => set({ layer: to, dashboardReady: false, plantBReady: false, zonesReady: false, story: null, storyStep: 0 }),

  // Story actions
  enterStory: (storyId) => set({
    returnLayer: get().layer,
    layer: 'story',
    story: storyId,
    storyStep: 0,
    activeLens: 0,
  }),
  exitStory: () => {
    const returnTo = get().returnLayer || 'dashboard';
    set({ layer: returnTo, story: null, storyStep: 0, activeLens: 0, returnLayer: null, dashboardReady: false, plantBReady: false });
  },
  setLens: (lens) => set({ activeLens: lens, storyStep: 0 }),
  setStoryStep: (step) => set({ storyStep: step }),
  nextStoryStep: () => set((s) => ({ storyStep: s.storyStep + 1 })),
  prevStoryStep: () => set((s) => ({ storyStep: Math.max(0, s.storyStep - 1) })),

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
