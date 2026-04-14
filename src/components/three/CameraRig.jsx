import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store';

const PRESETS = {
  overview: { position: [0, 28, 45], lookAt: [0, 0, 0] },
  'command-table': { position: [0, 8, 48], lookAt: [0, 0, 0] },
};

const lerpSpeed = 3.0; // higher = faster transition

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function CameraRig() {
  const cameraRef = useRef();
  const cameraPreset = useStore(s => s.cameraPreset);
  const focusedEntity = useStore(s => s.focusedEntity);
  const rotationRef = useRef(0);
  const targetPos = useRef(new THREE.Vector3(0, 28, 45));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 28, 45));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    const preset = PRESETS[cameraPreset] || PRESETS.overview;

    if (cameraPreset === 'focus' && focusedEntity) {
      // Focus mode: position will be set by ConstellationGraph via store
      // For now, use a computed position based on entity
      // (ConstellationGraph will provide positions via window.__nodePositions)
      const positions = window.__nodePositions;
      if (positions && positions[focusedEntity]) {
        const entityPos = positions[focusedEntity];
        // Camera offset: back and slightly up from entity
        targetPos.current.set(
          entityPos[0] + 4,
          entityPos[1] + 6,
          entityPos[2] + 12
        );
        targetLookAt.current.set(entityPos[0], entityPos[1], entityPos[2]);
      }
    } else if (cameraPreset === 'overview') {
      // Slow auto-rotation
      rotationRef.current += delta * 0.05; // ~3 deg/sec
      const r = 52;
      const angle = rotationRef.current;
      targetPos.current.set(
        Math.sin(angle) * r,
        28,
        Math.cos(angle) * r
      );
      targetLookAt.current.set(0, 0, 0);
    } else {
      targetPos.current.set(...preset.position);
      targetLookAt.current.set(...preset.lookAt);
    }

    // Smooth lerp
    const t = 1 - Math.exp(-lerpSpeed * delta);
    currentPos.current.lerp(targetPos.current, t);
    currentLookAt.current.lerp(targetLookAt.current, t);

    cameraRef.current.position.copy(currentPos.current);
    cameraRef.current.lookAt(currentLookAt.current);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={50}
      near={0.1}
      far={200}
      position={[0, 28, 45]}
    />
  );
}
