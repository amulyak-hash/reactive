import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../../store';
import { ZONE_PRESETS, OVERVIEW_PRESET } from '../utils/cameraPresets';
import { cameraRigRef } from '../cameraRigRef';

// ─── Tour Step Definitions ───
// Each step: camera position, lookAt, layer activations, accent color, dwell timing

const ZONE_POSITIONS = {
  bf:  [-5.43, 3.11, -12.11],
  sms: [3, 4, -5],
  cc:  [14.74, 3.13, -0.48],
  rm:  [-12, 4, -3],
  ql:  [-9.85, 3.19, 10.88],
};

export const TOUR_STEPS = [
  {
    id: 'overview',
    zone: null,
    camera: { position: [35, 25, 35], lookAt: [0, 2, 0] },
    layers: {},
    dwellTime: 4000,
    narration: 'Active causal chain detected across 3 zones. Compound confidence: 59%. Let me walk you through it.',
    tag: 'OVERVIEW',
    accent: '#22D3EE',
  },
  {
    id: 'trigger',
    zone: 'rm',
    camera: {
      position: [-18, 10, -8],
      lookAt: [-12, 3.5, -3],
    },
    layers: { timeline: true },
    dwellTime: 5000,
    narration: '06:42 — Supplier X batch enters the raw material stream. Silicon content +0.12% above specification. The deviation is small but consequential.',
    tag: 'INCOMING',
    accent: '#FBBF24',
  },
  {
    id: 'propagation',
    zone: 'bf',
    camera: {
      position: [-2, 12, -20],
      lookAt: [-5.43, 2.5, -12.11],
    },
    layers: { thermal: true, flow: true },
    dwellTime: 6000,
    narration: 'BF-3 superheat drops from 34°C to 22°C — 12 degrees below the safe window. The silicon variance is propagating through the furnace chemistry.',
    tag: 'CAUSE',
    accent: '#F0813A',
  },
  {
    id: 'cascade',
    zone: 'cc',
    camera: {
      position: [22, 10, 8],
      lookAt: [14.74, 2.5, -0.48],
    },
    layers: { flow: true },
    dwellTime: 5000,
    narration: 'CCM-3 is forced to reduce casting speed to 1.2 m/min. Solidification behaviour is shifting — the deviation has now crossed two process boundaries.',
    tag: 'CASCADE',
    accent: '#22D3EE',
  },
  {
    id: 'impact',
    zone: 'ql',
    camera: {
      position: [-4, 10, 18],
      lookAt: [-9.85, 2.5, 10.88],
    },
    layers: { financial: true },
    dwellTime: 5000,
    narration: 'Automotive grade probability at 59%. Revenue exposure: 8.1 crore. The risk is not in any single metric — it is in the connections between zones.',
    tag: 'IMPACT',
    accent: '#F06060',
  },
];

// ─── Camera Spline Path ───
// Build a smooth CatmullRom curve through all tour stops

function buildCameraPath() {
  const positions = TOUR_STEPS.map(s => new THREE.Vector3(...s.camera.position));
  const targets = TOUR_STEPS.map(s => new THREE.Vector3(...s.camera.lookAt));

  return {
    positionCurve: new THREE.CatmullRomCurve3(positions, false, 'centripetal', 0.5),
    targetCurve: new THREE.CatmullRomCurve3(targets, false, 'centripetal', 0.5),
  };
}

// ─── Cinematic Tour Engine ───
// Drives camera along spline path, choreographs layers/lighting per step

export default function CinematicTourEngine() {
  const { camera } = useThree();
  const causalTourState = useStore(s => s.causalTourState);
  const causalTourStep = useStore(s => s.causalTourStep);
  const setCausalTransitioning = useStore(s => s.setCausalTransitioning);
  const advanceCausalTour = useStore(s => s.advanceCausalTour);
  const endCausalTour = useStore(s => s.endCausalTour);
  const flyTo = useStore(s => s.flyTo);
  const setAIContext = useStore(s => s.setAIContext);

  const dwellTimerRef = useRef(null);
  const tweenRef = useRef(null);

  // Micro-drift during dwell — subtle camera movement so it feels alive
  const driftActiveRef = useRef(false);
  const driftBaseRef = useRef({ x: 0, y: 0, z: 0 });

  const { positionCurve, targetCurve } = useMemo(() => buildCameraPath(), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, []);

  // ─── React to step changes ───
  useEffect(() => {
    if (causalTourState !== 'active' || causalTourStep < 0) return;

    const step = TOUR_STEPS[causalTourStep];
    if (!step) return;

    driftActiveRef.current = false;

    // Kill any in-flight tweens
    if (tweenRef.current) tweenRef.current.kill();
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);

    gsap.killTweensOf(camera.position);

    const controls = cameraRigRef.current?.controls;
    if (controls) {
      gsap.killTweensOf(controls.target);
    }

    // Set layers for this step
    const store = useStore.getState();
    const targetLayers = {
      thermal: false, flow: false, financial: false, safety: false, timeline: false,
      ...step.layers,
    };
    Object.entries(targetLayers).forEach(([name, shouldBeActive]) => {
      if (store.activeLayers[name] !== shouldBeActive) {
        store.toggleLayer(name);
      }
    });

    // Animate camera to step position
    const duration = causalTourStep === 0 ? 2.5 : 2.0;
    const ease = causalTourStep === 0 ? 'power2.inOut' : 'power3.inOut';

    const tl = gsap.timeline();

    // Camera position
    tl.to(camera.position, {
      x: step.camera.position[0],
      y: step.camera.position[1],
      z: step.camera.position[2],
      duration,
      ease,
      onUpdate: () => camera.updateProjectionMatrix(),
    }, 0);

    // LookAt target
    if (controls) {
      tl.to(controls.target, {
        x: step.camera.lookAt[0],
        y: step.camera.lookAt[1],
        z: step.camera.lookAt[2],
        duration,
        ease,
        onUpdate: () => controls.update(),
      }, 0);
    }

    tl.call(() => {
      // Camera arrived — start dwell
      setCausalTransitioning(false);
      driftActiveRef.current = true;
      driftBaseRef.current = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      };

      // Update AI context
      setAIContext({
        type: 'causal-tour',
        id: step.id,
        layer: '3d',
        label: `Causal Chain: ${step.tag}`,
        accent: step.accent,
        narration: step.narration,
      });
    });

    tweenRef.current = tl;

  }, [causalTourState, causalTourStep, camera, setCausalTransitioning, setAIContext]);

  // ─── Micro-drift during dwell ───
  useFrame(({ clock }) => {
    if (!driftActiveRef.current || causalTourState !== 'active') return;
    const t = clock.getElapsedTime();
    const base = driftBaseRef.current;
    camera.position.x = base.x + Math.sin(t * 0.4) * 0.08;
    camera.position.y = base.y + Math.cos(t * 0.6) * 0.04;
    camera.position.z = base.z + Math.sin(t * 0.5 + 1) * 0.06;
  });

  // ─── Pause: stop drift and timers ───
  useEffect(() => {
    if (causalTourState === 'paused') {
      driftActiveRef.current = false;
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    }
  }, [causalTourState]);

  // ─── Return to overview on tour end ───
  useEffect(() => {
    if (causalTourState === 'complete') {
      driftActiveRef.current = false;

      // Re-enable all layers
      const store = useStore.getState();
      Object.keys(store.activeLayers).forEach(name => {
        if (!store.activeLayers[name]) store.toggleLayer(name);
      });

      flyTo(OVERVIEW_PRESET);
      setAIContext({
        type: 'causal-tour-complete',
        id: 'causal-complete',
        layer: '3d',
        label: 'Causal Analysis Complete',
        narration: 'Full causal chain traced. Two anomaly sources, three affected zones. Compound confidence: 59%. Toggle layers to explore further, or click any zone to investigate.',
      });
    }
  }, [causalTourState, flyTo, setAIContext]);

  return null; // Invisible — all logic, no rendering
}
