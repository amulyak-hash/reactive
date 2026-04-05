import { useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../store';

const MEDIAPIPE_VERSION = '0.10.21';
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL = `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`;

// Module-level shared ref — read by GestureController inside Canvas
export const landmarksRef = { current: null };

export function useHandTracking() {
  const videoRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const rafIdRef = useRef(null);
  const streamRef = useRef(null);
  const setGestureError = useStore(s => s.setGestureError);

  const stopTracking = useCallback(() => {
    // Cancel detection loop
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    // Stop webcam
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Close landmarker
    if (handLandmarkerRef.current) {
      handLandmarkerRef.current.close();
      handLandmarkerRef.current = null;
    }
    // Clear shared ref
    landmarksRef.current = null;
  }, []);

  const startTracking = useCallback(async () => {
    try {
      // Lazy-load MediaPipe
      const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');

      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      handLandmarkerRef.current = landmarker;

      // Start webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Detection loop (separate from R3F's useFrame)
      let lastTime = -1;
      const detect = () => {
        if (!videoRef.current || !handLandmarkerRef.current) return;
        const video = videoRef.current;

        if (video.readyState >= 2 && video.currentTime !== lastTime) {
          lastTime = video.currentTime;
          const result = handLandmarkerRef.current.detectForVideo(video, performance.now());

          if (result.landmarks && result.landmarks.length > 0) {
            landmarksRef.current = result.landmarks[0]; // first hand, 21 landmarks
          } else {
            landmarksRef.current = null;
          }
        }

        rafIdRef.current = requestAnimationFrame(detect);
      };
      rafIdRef.current = requestAnimationFrame(detect);
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera access denied'
        : `Hand tracking failed: ${err.message}`;
      setGestureError(msg);
      stopTracking();
    }
  }, [setGestureError, stopTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return { videoRef, landmarksRef, startTracking, stopTracking };
}
