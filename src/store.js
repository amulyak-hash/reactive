import { create } from 'zustand';
import { USE_CASES } from './data/useCases';
import { ENTITY_TO_USECASE } from './data/entityGraph';

function matchUseCase(input) {
  const lower = input.toLowerCase();
  const words = lower.split(/\s+/);
  let bestScore = 0;
  let bestUC = null;
  for (const uc of USE_CASES) {
    let score = 0;
    for (const kw of uc.keywords) {
      if (words.some(w => w.includes(kw.toLowerCase()))) score++;
    }
    const qWords = uc.question.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (w.length > 3 && qWords.includes(w)) score += 0.5;
    }
    if (score > bestScore) { bestScore = score; bestUC = uc; }
  }
  return bestScore >= 2 ? bestUC : null;
}

export const useStore = create((set, get) => ({
  // View mode
  view: 'dashboard', // 'dashboard' | 'thread'

  // Thread — accumulating list of question/answer pairs
  thread: [],

  // Ask a question: match to a use case, add to thread, switch to thread view
  askQuestion: (question) => {
    const matched = matchUseCase(question);
    if (!matched) return null;
    set(s => ({
      view: 'thread',
      thread: [...s.thread, { question, useCaseId: matched.id, id: Date.now() }],
    }));
    return matched;
  },

  // Ask by use case id directly (from pill click)
  askByUseCase: (useCaseId) => {
    const uc = USE_CASES.find(u => u.id === useCaseId);
    if (!uc) return;
    set(s => ({
      view: 'thread',
      thread: [...s.thread, { question: uc.question, useCaseId: uc.id, id: Date.now() }],
    }));
  },

  // Return to dashboard
  goToDashboard: () => set({ view: 'dashboard' }),

  // Clear thread and return to dashboard
  newThread: () => set({ view: 'dashboard', thread: [] }),

  // ─── 3D Constellation State ───
  cameraPreset: 'overview', // 'overview' | 'command-table' | 'focus'
  previousCameraPreset: 'overview',
  focusedEntity: null,
  expandedEntity: null,
  hoveredEntity: null,
  threadEntity: null,

  focusEntity: (id) => set(s => ({
    previousCameraPreset: s.cameraPreset,
    cameraPreset: 'focus',
    focusedEntity: id,
    expandedEntity: id,
  })),

  unfocus: () => set(s => ({
    cameraPreset: s.previousCameraPreset || 'overview',
    focusedEntity: null,
    expandedEntity: null,
    threadEntity: null,
  })),

  hoverEntity: (id) => set({ hoveredEntity: id }),

  openThread: (entityId) => {
    const useCaseId = ENTITY_TO_USECASE[entityId];
    if (!useCaseId) return;
    const uc = USE_CASES.find(u => u.id === useCaseId);
    if (!uc) return;
    set(s => ({
      threadEntity: entityId,
      thread: [...s.thread, { question: uc.question, useCaseId, id: Date.now() }],
    }));
  },

  setCameraPreset: (preset) => set(s => ({
    previousCameraPreset: s.cameraPreset,
    cameraPreset: preset,
  })),
}));
