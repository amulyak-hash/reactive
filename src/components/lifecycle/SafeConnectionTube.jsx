import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import ConnectionTube from '../iso/ConnectionTube';

const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);

/**
 * Wrapper around ConnectionTube that initializes instanced particle matrices
 * to zero scale, preventing the bright flash at origin before useFrame kicks in.
 */
export default function SafeConnectionTube({ edge, startRef }) {
  const groupRef = useRef();

  useEffect(() => {
    if (!groupRef.current) return;
    // Find the InstancedMesh inside ConnectionTube and zero out its matrices
    groupRef.current.traverse((child) => {
      if (child.isInstancedMesh) {
        for (let i = 0; i < child.count; i++) {
          child.setMatrixAt(i, zeroMatrix);
        }
        child.instanceMatrix.needsUpdate = true;
      }
    });
  }, []);

  return (
    <group ref={groupRef}>
      <ConnectionTube edge={edge} startRef={startRef} />
    </group>
  );
}
