import { useRef, useCallback } from 'react';
import { landmarksRef } from './useHandTracking';

const SMOOTHING_FACTOR = 0.15;
const DEAD_ZONE = 0.003;
const DEPTH_DEAD_ZONE = 0.002;
const ROTATE_SENSITIVITY = 4.0;
const ZOOM_SENSITIVITY = 300.0; // scale-to-radius multiplier
const HYSTERESIS_FRAMES = 3;
const ZOOM_MIN = 5;
const ZOOM_MAX = 120;

function classifyRaw(landmarks) {
  const tips = [8, 12, 16, 20];
  const mcps = [6, 10, 14, 18];

  let openCount = 0;
  let closedCount = 0;

  for (let i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]].y < landmarks[mcps[i]].y) {
      openCount++;
    } else {
      closedCount++;
    }
  }

  if (openCount >= 3) return 'palm';
  if (closedCount >= 3) return 'fist';
  return 'idle';
}

// Use distance between wrist (0) and middle finger MCP (9) as a proxy for hand depth.
// Closer hand → larger apparent size → larger distance between these landmarks.
function handScale(landmarks) {
  const w = landmarks[0];
  const m = landmarks[9];
  const dx = w.x - m.x;
  const dy = w.y - m.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function useGestureCamera() {
  const smoothPalmRef = useRef({ x: 0, y: 0 });
  const prevPalmRef = useRef(null);
  const smoothScaleRef = useRef(0.15);
  const prevScaleRef = useRef(null);

  // Hysteresis state
  const gestureRef = useRef('idle');
  const candidateRef = useRef('idle');
  const candidateCountRef = useRef(0);

  const reset = useCallback(() => {
    smoothPalmRef.current = { x: 0, y: 0 };
    prevPalmRef.current = null;
    smoothScaleRef.current = 0.15;
    prevScaleRef.current = null;
    gestureRef.current = 'idle';
    candidateRef.current = 'idle';
    candidateCountRef.current = 0;
  }, []);

  const update = useCallback(() => {
    const landmarks = landmarksRef.current;

    if (!landmarks) {
      if (prevPalmRef.current !== null) reset();
      return { gesture: 'idle', thetaDelta: 0, phiDelta: 0, radiusDelta: 0 };
    }

    const rawGesture = classifyRaw(landmarks);

    // Gesture hysteresis (3 consecutive frames)
    if (rawGesture !== gestureRef.current) {
      if (rawGesture === candidateRef.current) {
        candidateCountRef.current++;
        if (candidateCountRef.current >= HYSTERESIS_FRAMES) {
          gestureRef.current = rawGesture;
          candidateCountRef.current = 0;
        }
      } else {
        candidateRef.current = rawGesture;
        candidateCountRef.current = 1;
      }
    } else {
      candidateCountRef.current = 0;
    }

    const gesture = gestureRef.current;

    // Fist = freeze. Clear prev refs so reopening palm starts fresh.
    if (gesture === 'fist' || gesture === 'idle') {
      prevPalmRef.current = null;
      prevScaleRef.current = null;
      return { gesture, thetaDelta: 0, phiDelta: 0, radiusDelta: 0 };
    }

    // Palm center (landmark 9)
    const palmRaw = landmarks[9];
    const scale = handScale(landmarks);

    // EMA smoothing
    smoothPalmRef.current = {
      x: smoothPalmRef.current.x + SMOOTHING_FACTOR * (palmRaw.x - smoothPalmRef.current.x),
      y: smoothPalmRef.current.y + SMOOTHING_FACTOR * (palmRaw.y - smoothPalmRef.current.y),
    };
    smoothScaleRef.current =
      smoothScaleRef.current + SMOOTHING_FACTOR * (scale - smoothScaleRef.current);

    let thetaDelta = 0;
    let phiDelta = 0;
    let radiusDelta = 0;

    if (gesture === 'palm' && prevPalmRef.current && prevScaleRef.current !== null) {
      // Orbit from X/Y movement
      const dx = smoothPalmRef.current.x - prevPalmRef.current.x;
      const dy = smoothPalmRef.current.y - prevPalmRef.current.y;
      thetaDelta = Math.abs(dx) > DEAD_ZONE ? dx * ROTATE_SENSITIVITY : 0;
      phiDelta = Math.abs(dy) > DEAD_ZONE ? dy * ROTATE_SENSITIVITY : 0;

      // Zoom from depth (hand scale change)
      // Hand closer → scale increases → zoom in (radius decreases)
      const ds = smoothScaleRef.current - prevScaleRef.current;
      radiusDelta = Math.abs(ds) > DEPTH_DEAD_ZONE ? -ds * ZOOM_SENSITIVITY : 0;
    }

    prevPalmRef.current = { ...smoothPalmRef.current };
    prevScaleRef.current = smoothScaleRef.current;

    // Clamp radiusDelta to prevent wild jumps
    radiusDelta = Math.max(-3, Math.min(3, radiusDelta));

    return { gesture, thetaDelta, phiDelta, radiusDelta };
  }, [reset]);

  return { update, reset };
}
