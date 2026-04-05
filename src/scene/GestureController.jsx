import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, selectGestureActive } from '../store';
import { useGestureCamera } from './hooks/useGestureCamera';
import { cameraRigRef } from './cameraRigRef';
import { OVERVIEW_PRESET } from './utils/cameraPresets';

const MIN_POLAR = 0.2;
const MAX_POLAR = Math.PI / 2.1;
const MIN_DISTANCE = 5;
const MAX_DISTANCE = 120;

export default function GestureController() {
  const { camera } = useThree();
  const gestureActiveRef = useRef(false);
  const prevActiveRef = useRef(false);
  const warmupRef = useRef(false);
  const warmupUntilRef = useRef(0);
  const { update, reset } = useGestureCamera();

  const gestureMode = useStore(s => s.gestureMode);
  const gestureActive = useStore(selectGestureActive);
  const cameraAnimating = useStore(s => s.cameraAnimating);

  // When gestureMode first turns on, snap camera to overview and start warmup
  useEffect(() => {
    if (gestureMode) {
      const controls = cameraRigRef.current?.controls;
      if (controls) {
        // Snap camera to overview instantly (no flyTo/GSAP)
        const { position, lookAt } = OVERVIEW_PRESET;
        camera.position.set(position[0], position[1], position[2]);
        controls.target.set(lookAt[0], lookAt[1], lookAt[2]);
        controls.update();
      }
      warmupRef.current = true;
      warmupUntilRef.current = performance.now() + 1000;
      reset();
    }
  }, [gestureMode, camera, reset]);

  // Track gestureActive for the useFrame guard
  useEffect(() => {
    gestureActiveRef.current = gestureActive;
    if (prevActiveRef.current && !gestureActive) {
      reset();
    }
    prevActiveRef.current = gestureActive;
  }, [gestureActive, reset]);

  useEffect(() => {
    if (cameraAnimating) reset();
  }, [cameraAnimating, reset]);

  const spherical = useRef(new THREE.Spherical());
  const offset = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!gestureActiveRef.current) return;

    // Grace period — keep resetting so first real frame is clean
    if (warmupRef.current) {
      if (performance.now() < warmupUntilRef.current) {
        reset();
        return;
      }
      warmupRef.current = false;
      reset(); // one final reset at warmup end
      return;
    }

    const controls = cameraRigRef.current?.controls;
    if (!controls) return;

    const target = controls.target;
    const { gesture, thetaDelta, phiDelta, radiusDelta } = update();

    if (gesture === 'fist' || gesture === 'idle') return;
    if (thetaDelta === 0 && phiDelta === 0 && radiusDelta === 0) return;

    offset.current.copy(camera.position).sub(target);
    spherical.current.setFromVector3(offset.current);

    spherical.current.theta += thetaDelta;
    spherical.current.phi += phiDelta;
    spherical.current.phi = THREE.MathUtils.clamp(spherical.current.phi, MIN_POLAR, MAX_POLAR);

    spherical.current.radius += radiusDelta;
    spherical.current.radius = THREE.MathUtils.clamp(spherical.current.radius, MIN_DISTANCE, MAX_DISTANCE);

    offset.current.setFromSpherical(spherical.current);
    camera.position.copy(target).add(offset.current);

    controls.update();
  });

  return null;
}
