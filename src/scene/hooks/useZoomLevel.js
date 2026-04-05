import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import { cameraRigRef } from '../cameraRigRef';

// Zoom level thresholds — measured as camera-to-orbit-target distance.
// When target ≈ origin (overview), these match the original origin-based values.
const THRESHOLDS = {
  orbit: 35,    // > 35 = full factory overview
  wing: 18,     // 18-35 = section of factory
  machine: 8,   // 8-18 = individual equipment
  // < 8 = story mode (cinematic)
};

export function useZoomLevel() {
  const setZoomLevel = useStore(s => s.setZoomLevel);
  const prevLevel = useRef('orbit');

  useFrame(({ camera }) => {
    // Measure distance to orbit target (falls back to origin if controls not ready)
    const target = cameraRigRef.current?.controls?.target;
    const dist = target
      ? camera.position.distanceTo(target)
      : camera.position.length();

    let level;
    if (dist > THRESHOLDS.orbit) level = 'orbit';
    else if (dist > THRESHOLDS.wing) level = 'wing';
    else if (dist > THRESHOLDS.machine) level = 'machine';
    else level = 'story';

    if (level !== prevLevel.current) {
      prevLevel.current = level;
      setZoomLevel(level);
    }
  });
}
