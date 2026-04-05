import { useStore } from '../store';

const AUDIO_SRC = {
  briefing:     '/audio/briefing.mp3',
  overview:     '/audio/overview.mp3',
  trigger:      '/audio/trigger.mp3',
  propagation:  '/audio/propagation.mp3',
  cascade:      '/audio/cascade.mp3',
  impact:       '/audio/impact.mp3',
  complete:     '/audio/complete.mp3',
};

const STEP_TO_KEY = {
  0: 'overview',
  1: 'trigger',
  2: 'propagation',
  3: 'cascade',
  4: 'impact',
};

// ─── State ───

let currentAudio = null;
let isPlaying = false;
const listeners = new Set();

function notify() { listeners.forEach(fn => fn(isPlaying)); }
export function onPlayingChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function getIsPlaying() { return isPlaying; }

// Manual play — called from UI buttons (user gesture = autoplay unlocked)
export function playNarration(key) { play(key); }
export function stopNarration() { kill(); }

// ─── Playback ───

function kill() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio.removeAttribute('src');
    currentAudio = null;
  }
  isPlaying = false;
  notify();
}

function play(key) {
  kill();

  const src = AUDIO_SRC[key];
  if (!src) return;

  // Fresh Audio element every time — no stale queued plays
  const a = new Audio(src);
  a.volume = 0.85;
  currentAudio = a;

  a.addEventListener('playing', () => { isPlaying = true; notify(); });
  a.addEventListener('ended', () => { isPlaying = false; notify(); currentAudio = null; });
  a.addEventListener('pause', () => { isPlaying = false; notify(); });

  a.play().catch(() => {
    // Autoplay blocked — destroy this element so it can't fire later
    a.src = '';
    a.removeAttribute('src');
    currentAudio = null;
  });
}

// ─── State → audio key ───

function getKey(state, step) {
  // Briefing audio is triggered manually via play button (needs user gesture)
  if (state === 'complete') return 'complete';
  if (state === 'active' && step >= 0) return STEP_TO_KEY[step] || null;
  return null;
}

// ─── Store subscription ───

let prev = { state: null, step: null };

useStore.subscribe((store) => {
  const { causalTourState: state, causalTourStep: step } = store;
  if (state === prev.state && step === prev.step) return;

  const oldState = prev.state;
  prev = { state, step };

  if (state === 'idle') { kill(); return; }

  if (state === 'paused') {
    if (currentAudio) currentAudio.pause();
    return;
  }

  if (state === 'active' && oldState === 'paused' && currentAudio) {
    currentAudio.play().catch(() => {});
    return;
  }

  const key = getKey(state, step);
  if (key) play(key);
});
