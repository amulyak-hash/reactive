import { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import FactoryModel from './FactoryModel';
import CameraRig from './CameraRig';
import GestureController from './GestureController';
import GestureSession from './GestureSession';
import ZoneLabel from './overlays/ZoneLabel';
import AnomalyGlow from './overlays/AnomalyGlow';
import PostProcessing from './effects/PostProcessing';
import TourEngine from './tour/TourEngine';
import CinematicTourEngine from './tour/CinematicTourEngine';
import LayerManager from './layers/LayerManager';
import IntelBriefing from './overlays/IntelBriefing';
import IntelCards3D from './overlays/IntelCards3D';
import { ZONE_PRESETS, OVERVIEW_PRESET } from './utils/cameraPresets';
import { ZONES } from '../data/tataSteel';
import { useStore } from '../store';
import { C, rgb, FONT_MONO, FONT_SANS, FONT_SERIF } from '../theme/tokens';

const INTEL_DURATION = 16000; // 16s of intel feed before scan starts — enough time to read
const GREETING_MIN_DURATION = 5000; // 5s minimum greeting screen

// Boot-up loading screen — personalized greeting while model loads
function LoadingScreen() {
  const { progress, active } = useProgress();
  const [phase, setPhase] = useState('loading'); // loading → booting → ready
  const [greetingStep, setGreetingStep] = useState(0); // 0→1→2→3 staggered text
  const startIntel = useStore(s => s.startIntel);
  const scanPhase = useStore(s => s.scanPhase);
  const greetingStartRef = useRef(Date.now());

  // Stagger greeting text appearance
  useEffect(() => {
    const timers = [
      setTimeout(() => setGreetingStep(1), 400),   // "Hi Josh"
      setTimeout(() => setGreetingStep(2), 1800),   // subtitle
      setTimeout(() => setGreetingStep(3), 3200),   // "Welcome to Enterprise Brain"
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!active && progress === 100) {
      // Ensure minimum greeting duration
      const elapsed = Date.now() - greetingStartRef.current;
      const remaining = Math.max(0, GREETING_MIN_DURATION - elapsed);

      const t = setTimeout(() => {
        setPhase('booting');
        if (scanPhase === 'idle') startIntel();
        setTimeout(() => setPhase('ready'), 600);
      }, remaining);
      return () => clearTimeout(t);
    }
  }, [active, progress, scanPhase, startIntel]);

  if (phase === 'ready') return null;

  const isBooting = phase === 'booting';

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: C.bg,
      zIndex: 10,
      opacity: isBooting ? 0 : 1,
      transition: 'opacity 800ms ease',
      pointerEvents: isBooting ? 'none' : 'auto',
    }}>
      {/* Personalized greeting */}
      <div style={{
        fontFamily: FONT_SERIF,
        fontSize: 32,
        fontWeight: 300,
        color: C.t1,
        opacity: greetingStep >= 1 ? 1 : 0,
        transform: greetingStep >= 1 ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        marginBottom: 12,
      }}>
        Hi Josh
      </div>

      <div style={{
        fontFamily: FONT_SANS,
        fontSize: 14,
        color: C.t3,
        letterSpacing: '0.02em',
        opacity: greetingStep >= 2 ? 1 : 0,
        transform: greetingStep >= 2 ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        marginBottom: 32,
      }}>
        Your briefing for today is ready
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: greetingStep >= 3 ? 1 : 0,
        transform: greetingStep >= 3 ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
      }}>
        {/* Small diamond logo */}
        <div style={{
          width: 10, height: 10, background: C.orange,
          transform: 'rotate(45deg)',
        }} />
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          fontWeight: 600,
          color: C.cyan,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          Enterprise Brain
        </div>
      </div>

      {/* Subtle progress bar at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: rgb(C.cyan, 0.08),
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${rgb(C.cyan, 0.3)}, ${rgb(C.blue, 0.3)})`,
          borderRadius: 1,
          transition: 'width 200ms ease',
        }} />
      </div>
    </div>
  );
}

// Zone positions — calibrated from actual model clicks
const ZONE_POSITIONS = {
  bf:  [-5.43, 3.11, -12.11],
  sms: [3, 4, -5],
  cc:  [14.74, 3.13, -0.48],
  rm:  [-12, 4, -3],
  ql:  [-9.85, 3.19, 10.88],
};

// Flag to suppress onPointerMissed when a zone label (HTML overlay) was clicked
let _zoneClickedAt = 0;

function ZoneOverlays() {
  const flyTo = useStore(s => s.flyTo);
  const enterStory = useStore(s => s.enterStory);
  const pauseTour = useStore(s => s.pauseTour);
  const tourState = useStore(s => s.tourState);

  const handleZoneClick = (zone) => {
    _zoneClickedAt = Date.now();
    if (tourState === 'active') pauseTour();
    flyTo(ZONE_PRESETS[zone.id]);
    enterStory(zone.id);
  };

  return (
    <>
      {ZONES.map((zone) => {
        const pos = ZONE_POSITIONS[zone.id];
        if (!pos) return null;

        return (
          <group key={zone.id}>
            <ZoneLabel
              position={pos}
              label={zone.label}
              code={zone.code}
              status={zone.status}
              accent={zone.accent}
              onClick={() => handleZoneClick(zone)}
            />
            {zone.status === 'alert' && (
              <AnomalyGlow
                position={pos}
                color={zone.accent}
                intensity={1.5}
                radius={3}
              />
            )}
          </group>
        );
      })}
    </>
  );
}

function HoloToggle() {
  const holoMode = useStore(s => s.holoMode);
  const toggleHoloMode = useStore(s => s.toggleHoloMode);

  return (
    <button
      onClick={toggleHoloMode}
      style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: holoMode ? rgb(C.cyan, 0.15) : rgb(C.sf, 0.8),
        border: `1px solid ${holoMode ? rgb(C.cyan, 0.5) : C.bd}`,
        borderRadius: 8,
        color: holoMode ? C.cyan : C.t2,
        fontFamily: FONT_MONO,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        transition: 'all 300ms ease',
        boxShadow: holoMode ? `0 0 20px ${rgb(C.cyan, 0.2)}, inset 0 0 20px ${rgb(C.cyan, 0.05)}` : 'none',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1L1 5v6l7 4 7-4V5L8 1z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
          fill={holoMode ? rgb(C.cyan, 0.15) : 'none'}
        />
        <path d="M1 5l7 4m0 0l7-4M8 9v6" stroke="currentColor" strokeWidth="1.0" opacity="0.6" />
      </svg>
      {holoMode ? 'HOLOGRAPHIC' : 'HOLO VIEW'}
    </button>
  );
}

export default function FactoryScene() {
  const story = useStore(s => s.story);
  const exitStory = useStore(s => s.exitStory);
  const flyTo = useStore(s => s.flyTo);
  const holoMode = useStore(s => s.holoMode);
  const scanPhase = useStore(s => s.scanPhase);
  const startScan = useStore(s => s.startScan);
  const causalTourState = useStore(s => s.causalTourState);
  const isCausalActive = causalTourState === 'active' || causalTourState === 'paused';
  const isOnboarding = scanPhase === 'intel' || scanPhase === 'scanning';
  const scanDone = scanPhase === 'complete';

  // Auto-transition: intel → scanning after INTEL_DURATION
  useEffect(() => {
    if (scanPhase !== 'intel') return;
    const t = setTimeout(() => startScan(), INTEL_DURATION);
    return () => clearTimeout(t);
  }, [scanPhase, startScan]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#050910',
      transition: 'right 400ms cubic-bezier(0.22, 1, 0.36, 1)',
    }}>
      <Canvas
        camera={{ position: [30, 20, 30], fov: 45, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        onPointerMissed={() => {
          if (Date.now() - _zoneClickedAt < 100) return;
          const { cameraAnimating } = useStore.getState();
          if (cameraAnimating) return;
          if (story) exitStory();
          flyTo(OVERVIEW_PRESET);
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#050910');
          gl.localClippingEnabled = true;
        }}
      >
        <Suspense fallback={null}>
          {/* Scene fog — fades distant objects to black */}
          <fog attach="fog" args={['#070B12', 35, 90]} />
          <color attach="background" args={['#050910']} />

          {/* Distant starfield */}
          <Stars
            radius={120}
            depth={60}
            count={1500}
            factor={2.5}
            saturation={0.1}
            fade
            speed={0.3}
          />

          {/* Floating ambient particles near the model */}
          <Sparkles
            count={60}
            scale={[50, 25, 50]}
            size={1.5}
            speed={0.15}
            opacity={0.3}
            color="#22D3EE"
            noise={1}
          />

          <CameraRig />
          <GestureController />

          {(holoMode || isOnboarding) ? (
            <>
              <ambientLight intensity={scanPhase === 'intel' ? 0.08 : 0.15} />
              <pointLight position={[0, 30, 0]} intensity={scanPhase === 'intel' ? 0.2 : 0.4} color="#00e5ff" />
            </>
          ) : (
            <>
              <ambientLight intensity={isCausalActive ? 0.18 : 0.4} />
              <directionalLight
                position={[30, 40, 20]}
                intensity={isCausalActive ? 0.6 : 1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <hemisphereLight
                args={['#1a2a4a', '#070B12', isCausalActive ? 0.3 : 0.6]}
                position={[0, 50, 0]}
              />
              {/* Cinematic spotlight during causal tour */}
              {isCausalActive && (
                <pointLight position={[0, 20, 0]} intensity={0.5} color="#22D3EE" distance={60} decay={2} />
              )}
            </>
          )}

          <FactoryModel />
          <IntelCards3D />
          {/* Zone overlays only after scan completes */}
          {scanDone && <ZoneOverlays />}
          {scanDone && <LayerManager zonePositions={ZONE_POSITIONS} />}
          {/* Environment preset removed — works offline, lights are sufficient */}
          <PostProcessing />
          {scanDone && <TourEngine />}
          {scanDone && <CinematicTourEngine />}

          {/* Holographic ground grid */}
          <HoloGrid />
        </Suspense>
      </Canvas>

      <LoadingScreen />
      <IntelBriefing />
      {scanDone && <GestureSession />}
      {scanDone && <HoloToggle />}
    </div>
  );
}

// Scan status overlay — HUD-like text during onboarding
function ScanOverlay() {
  const scanProgress = useStore(s => s.scanProgress);
  const scanPhase = useStore(s => s.scanPhase);
  const pct = Math.round(scanProgress * 100);
  const label = scanPhase === 'materializing' ? 'Rendering digital twin...' :
    pct < 25 ? 'Scanning structure...' :
    pct < 50 ? 'Mapping zones...' :
    pct < 75 ? 'Analyzing topology...' :
    'Calibrating sensors...';

  return (
    <div style={{
      position: 'absolute',
      bottom: 48,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: C.cyan,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        textShadow: `0 0 12px ${rgb(C.cyan, 0.5)}`,
      }}>
        {label}
      </div>
      {/* Progress bar */}
      <div style={{
        width: 200,
        height: 2,
        background: rgb(C.cyan, 0.15),
        borderRadius: 1,
        overflow: 'hidden',
      }}>
        <div style={{
          width: scanPhase === 'materializing' ? '100%' : `${pct}%`,
          height: '100%',
          background: C.cyan,
          borderRadius: 1,
          transition: 'width 100ms ease',
          boxShadow: `0 0 8px ${rgb(C.cyan, 0.6)}`,
        }} />
      </div>
      <div style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        color: rgb(C.cyan, 0.6),
      }}>
        {scanPhase === 'materializing' ? 'COMPLETE' : `${pct}%`}
      </div>
    </div>
  );
}

// Ground grid + radial glow disc beneath the factory
function HoloGrid() {
  const glowMat = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    // Radial gradient: cyan center fading to transparent
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, 'rgba(34, 211, 238, 0.12)');
    grad.addColorStop(0.3, 'rgba(34, 211, 238, 0.06)');
    grad.addColorStop(0.6, 'rgba(34, 211, 238, 0.02)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, []);

  return (
    <group>
      {/* Grid lines */}
      <gridHelper
        args={[100, 100, '#00e5ff', '#00e5ff']}
        position={[0, -0.01, 0]}
        material-transparent
        material-opacity={0.04}
        material-blending={2}
      />
      {/* Radial glow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={glowMat}>
        <planeGeometry args={[80, 80]} />
      </mesh>
    </group>
  );
}
