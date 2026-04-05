import { useMemo, useRef } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const MODEL_PATH = '/models/factory_compressed.glb';
useGLTF.preload(MODEL_PATH);

// Model bounds (raw, pre-scale): Y from ~0 to ~127
// After 0.1 scale: Y from 0 to ~12.7
const MODEL_Y_MIN = -1;
const MODEL_Y_MAX = 14;
const SCAN_DURATION = 13.0;      // seconds — scan runs during intel phase (slower for readability)

export default function FactoryModel() {
  const { scene } = useGLTF(MODEL_PATH);
  const holoMode = useStore(s => s.holoMode);
  const scanPhase = useStore(s => s.scanPhase);
  const setScanPhase = useStore(s => s.setScanPhase);
  const setScanProgress = useStore(s => s.setScanProgress);

  const modelScale = 0.1;
  const scanTimeRef = useRef(0);
  const scanPlaneRef = useRef();

  // --- Materials ---

  // Wireframe for scan/holo modes
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#0a5c6b'),
    wireframe: true,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  }), []);

  // Wireframe that fades OUT above the scan line (clipped)
  const wireClippedMat = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#0a5c6b'),
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      side: THREE.DoubleSide,
      clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, -1, 0), MODEL_Y_MAX)],
    });
    return mat;
  }, []);

  // Solid model that appears BELOW the scan line (clipped)
  const solidClippedMat = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#8ab4c0'),
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, 1, 0), -MODEL_Y_MIN)],
    });
    return mat;
  }, []);

  // Scan ring glow material
  const scanRingMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#00e5ff'),
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  // --- Animation ---
  useFrame(({ clock }, delta) => {
    const phase = useStore.getState().scanPhase;

    // Intel phase — scan runs simultaneously with cards
    // Starts after a 1.5s delay, then sweeps for SCAN_DURATION
    if (phase === 'intel') {
      scanTimeRef.current += delta;
      const scanStart = 1.5; // delay before scan begins (first card appears)

      if (scanTimeRef.current < scanStart) {
        // Pre-scan: just pulse the wireframe
        wireClippedMat.opacity = 0.08 + 0.05 * Math.sin(clock.getElapsedTime() * 1.0);
        return;
      }

      const elapsed = scanTimeRef.current - scanStart;
      const t = Math.min(elapsed / SCAN_DURATION, 1.0);
      const scanY = MODEL_Y_MIN + t * (MODEL_Y_MAX - MODEL_Y_MIN);

      setScanProgress(t);

      // Clip planes
      wireClippedMat.clippingPlanes[0].constant = scanY;
      solidClippedMat.clippingPlanes[0].constant = -scanY;

      // Fade in solid as scan progresses
      solidClippedMat.opacity = Math.min(t * 1.5, 1.0);
      solidClippedMat.color.lerpColors(
        new THREE.Color('#8ab4c0'),
        new THREE.Color('#ffffff'),
        t
      );

      // Pulse wireframe above scan line
      wireClippedMat.opacity = 0.25 + 0.08 * Math.sin(clock.getElapsedTime() * 3.0);

      // Move scan ring
      if (scanPlaneRef.current) {
        scanPlaneRef.current.position.y = scanY;
        scanRingMat.opacity = 0.3 + 0.2 * Math.sin(clock.getElapsedTime() * 6.0);
      }
    }

    // Scanning phase — finish the materialize
    if (phase === 'scanning') {
      scanTimeRef.current += delta;
      const fadeT = Math.min(scanTimeRef.current / 3.0, 1.0);

      // Fade wireframe out
      wireClippedMat.opacity = 0.25 * (1.0 - fadeT);

      // Fade scan ring out
      if (scanPlaneRef.current) {
        scanRingMat.opacity = 0.5 * (1.0 - fadeT);
      }

      // Ensure solid is fully opaque
      solidClippedMat.opacity = 1.0;
      solidClippedMat.clippingPlanes[0].constant = -(MODEL_Y_MIN - 5); // reveal all

      if (fadeT >= 1.0) {
        setScanPhase('complete');
      }
    }

    // Holo mode pulse (when manually toggled, not during scan)
    if (holoMode && phase === 'complete') {
      const t = clock.getElapsedTime();
      wireMat.opacity = 0.3 + 0.08 * Math.sin(t * 1.5);
    }
  });

  const isOnboarding = scanPhase === 'intel' || scanPhase === 'scanning';

  return (
    <group scale={modelScale} dispose={null}>
      {isOnboarding ? (
        <>
          {/* Wireframe above scan line */}
          <Clone object={scene} inject={{ material: wireClippedMat }} />
          {/* Solid revealed below scan line */}
          <Clone object={scene} inject={{ material: solidClippedMat }} />
          {/* Scan ring */}
          <ScanRing ref={scanPlaneRef} />
        </>
      ) : holoMode ? (
        <Clone object={scene} inject={{ material: wireMat }} />
      ) : (
        <primitive object={scene} />
      )}
    </group>
  );
}

// Glowing horizontal ring that sweeps through the model
import { forwardRef } from 'react';

const ScanRing = forwardRef(function ScanRing(_props, ref) {
  return (
    <group ref={ref} position={[0, MODEL_Y_MIN, 0]}>
      {/* Thin scan line ring — just the edge, no fill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[38, 40, 64]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
});
