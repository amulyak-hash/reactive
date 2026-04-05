import { useEffect } from 'react';
import { useStore } from '../store';
import { useHandTracking } from './hooks/useHandTracking';
import GestureOverlay from './overlays/GestureOverlay';

export default function GestureSession() {
  const gestureMode = useStore(s => s.gestureMode);
  const { videoRef, landmarksRef, startTracking, stopTracking } = useHandTracking();

  // Start/stop tracking when gestureMode changes
  useEffect(() => {
    if (gestureMode) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [gestureMode, startTracking, stopTracking]);

  return (
    <GestureOverlay
      videoRef={videoRef}
      landmarksRef={landmarksRef}
      gestureMode={gestureMode}
    />
  );
}
