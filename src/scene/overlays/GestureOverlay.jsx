import { useRef, useEffect, useState } from 'react';
import { useStore, selectGestureAvailable } from '../../store';
import { C, rgb, FONT_MONO } from '../../theme/tokens';

const PREVIEW_WIDTH = 140;
const PREVIEW_HEIGHT = 105;

// Landmark connections for drawing hand skeleton
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],     // thumb
  [0,5],[5,6],[6,7],[7,8],     // index
  [5,9],[9,10],[10,11],[11,12], // middle
  [9,13],[13,14],[14,15],[15,16], // ring
  [13,17],[17,18],[18,19],[19,20], // pinky
  [0,17],
];

function drawLandmarks(ctx, landmarks, width, height) {
  ctx.clearRect(0, 0, width, height);

  if (!landmarks) return;

  // Draw connections
  ctx.strokeStyle = rgb(C.cyan, 0.6);
  ctx.lineWidth = 1;
  for (const [i, j] of CONNECTIONS) {
    const a = landmarks[i];
    const b = landmarks[j];
    ctx.beginPath();
    // Mirror x for natural feel (webcam is mirrored)
    ctx.moveTo((1 - a.x) * width, a.y * height);
    ctx.lineTo((1 - b.x) * width, b.y * height);
    ctx.stroke();
  }

  // Draw dots
  ctx.fillStyle = C.cyan;
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc((1 - lm.x) * width, lm.y * height, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function GestureOverlay({ videoRef, landmarksRef, gestureMode }) {
  const available = useStore(selectGestureAvailable);
  const toggleGestureMode = useStore(s => s.toggleGestureMode);
  const gestureError = useStore(s => s.gestureError);
  const [hovered, setHovered] = useState(false);
  const previewCanvasRef = useRef(null);
  const previewRafRef = useRef(null);

  // Preview render loop
  useEffect(() => {
    if (!gestureMode || !previewCanvasRef.current) {
      if (previewRafRef.current) {
        cancelAnimationFrame(previewRafRef.current);
        previewRafRef.current = null;
      }
      return;
    }

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');

    const drawPreview = () => {
      // Draw video frame
      if (videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        ctx.translate(PREVIEW_WIDTH, 0);
        ctx.scale(-1, 1); // Mirror
        ctx.drawImage(videoRef.current, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
        ctx.restore();
      }

      // Draw landmarks overlay
      drawLandmarks(ctx, landmarksRef.current, PREVIEW_WIDTH, PREVIEW_HEIGHT);

      previewRafRef.current = requestAnimationFrame(drawPreview);
    };

    previewRafRef.current = requestAnimationFrame(drawPreview);

    return () => {
      if (previewRafRef.current) {
        cancelAnimationFrame(previewRafRef.current);
        previewRafRef.current = null;
      }
    };
  }, [gestureMode, videoRef, landmarksRef]);

  if (!available) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleGestureMode}
        onPointerDown={e => e.stopPropagation()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'absolute',
          bottom: 80,
          right: 24,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: gestureMode ? rgb(C.cyan, 0.15) : rgb(C.sf, 0.8),
          border: `1px solid ${gestureMode ? rgb(C.cyan, 0.5) : hovered ? C.bd : C.bd}`,
          borderRadius: 8,
          color: gestureMode ? C.cyan : hovered ? C.t2 : C.t2,
          fontFamily: FONT_MONO,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.05em',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          transition: 'all 300ms ease',
          boxShadow: gestureMode
            ? `0 0 20px ${rgb(C.cyan, 0.2)}, inset 0 0 20px ${rgb(C.cyan, 0.05)}`
            : 'none',
          pointerEvents: 'auto',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 11V6a2 2 0 0 0-4 0v3" strokeLinecap="round" />
          <path d="M14 10V4a2 2 0 0 0-4 0v7" strokeLinecap="round" />
          <path d="M10 10.5V7a2 2 0 0 0-4 0v9a8 8 0 0 0 16 0v-5a2 2 0 0 0-4 0" strokeLinecap="round" />
        </svg>
        {gestureMode ? 'GESTURE ON' : 'GESTURES'}
      </button>

      {/* Error display */}
      {gestureError && (
        <div
          onPointerDown={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 120,
            right: 24,
            zIndex: 20,
            padding: '6px 12px',
            background: rgb(C.red, 0.15),
            border: `1px solid ${rgb(C.red, 0.3)}`,
            borderRadius: 6,
            color: C.red,
            fontFamily: FONT_MONO,
            fontSize: 10,
            maxWidth: 200,
            pointerEvents: 'auto',
          }}
        >
          {gestureError}
        </div>
      )}

      {/* Hidden video element for webcam feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: 'absolute',
          opacity: 0,
          width: 1,
          height: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Webcam preview with landmark overlay */}
      {gestureMode && (
        <div
          onPointerDown={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            zIndex: 20,
            borderRadius: 10,
            overflow: 'hidden',
            border: `1px solid ${rgb(C.cyan, 0.3)}`,
            boxShadow: `0 4px 20px ${rgb(C.bg, 0.6)}`,
            pointerEvents: 'auto',
          }}
        >
          <canvas
            ref={previewCanvasRef}
            width={PREVIEW_WIDTH}
            height={PREVIEW_HEIGHT}
            style={{
              display: 'block',
              width: PREVIEW_WIDTH,
              height: PREVIEW_HEIGHT,
              background: '#000',
            }}
          />
          <div style={{
            position: 'absolute',
            top: 4,
            left: 6,
            fontFamily: FONT_MONO,
            fontSize: 8,
            color: C.cyan,
            letterSpacing: '0.1em',
            textShadow: `0 0 6px ${rgb(C.cyan, 0.5)}`,
          }}>
            HAND TRACKING
          </div>
        </div>
      )}
    </>
  );
}
