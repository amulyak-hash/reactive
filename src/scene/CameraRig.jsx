import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { useStore, selectGestureActive } from '../store';
import { useZoomLevel } from './hooks/useZoomLevel';
import { useCameraContext } from './hooks/useCameraContext';

import { cameraRigRef } from './cameraRigRef';

export default function CameraRig() {
  const controlsRef = useRef();
  const { camera } = useThree();
  const cameraTarget = useStore(s => s.cameraTarget);
  const cameraAnimating = useStore(s => s.cameraAnimating);
  const clearFlyTo = useStore(s => s.clearFlyTo);
  const gestureActive = useStore(selectGestureActive);

  // Derive zoom level from camera distance
  useZoomLevel();

  // Feed camera position to AI context
  useCameraContext();

  // Keep module-level ref fresh
  useEffect(() => {
    cameraRigRef.current = { controls: controlsRef.current, camera };
    return () => {
      cameraRigRef.current = { controls: null, camera: null };
    };
  }, [camera]);

  // Update controls ref when it mounts
  useEffect(() => {
    if (controlsRef.current) {
      cameraRigRef.current.controls = controlsRef.current;
    }
  });

  // GSAP flyTo animation when cameraTarget changes
  useEffect(() => {
    if (!cameraTarget || !controlsRef.current) return;

    const { position, lookAt } = cameraTarget;
    const controls = controlsRef.current;

    // Kill any in-flight tweens to prevent stacking
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    // Animate camera position
    gsap.to(camera.position, {
      x: position[0],
      y: position[1],
      z: position[2],
      duration: 1.8,
      ease: 'power3.inOut',
      onUpdate: () => {
        camera.updateProjectionMatrix();
      },
    });

    // Animate controls target (lookAt point)
    gsap.to(controls.target, {
      x: lookAt[0],
      y: lookAt[1],
      z: lookAt[2],
      duration: 1.8,
      ease: 'power3.inOut',
      onUpdate: () => {
        controls.update();
      },
      onComplete: () => {
        clearFlyTo();
      },
    });
  }, [cameraTarget, camera, clearFlyTo]);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!cameraAnimating && !gestureActive}
      enableDamping
      dampingFactor={0.08}
      minDistance={5}
      maxDistance={120}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={0.2}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.5}
      enablePan
    />
  );
}
