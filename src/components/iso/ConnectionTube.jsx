import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substring(0, 2), 16) / 255, g: parseInt(h.substring(2, 4), 16) / 255, b: parseInt(h.substring(4, 6), 16) / 255 };
}

const PARTICLE_COUNT = 3;
const tempMatrix = new THREE.Matrix4();

export default function ConnectionTube({ edge, startRef }) {
  const tubeRef = useRef();
  const particlesRef = useRef();

  // Build curve
  const curve = useMemo(() => {
    const from = new THREE.Vector3(...edge.from);
    const to = new THREE.Vector3(...edge.to);
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    mid.y += 0.3; // slight arc above the ground plane
    return new THREE.QuadraticBezierCurve3(from, mid, to);
  }, [edge.from, edge.to]);

  const tubeGeometry = useMemo(() =>
    new THREE.TubeGeometry(curve, 32, 0.008, 4, false),
  [curve]);

  // Particle state
  const particleState = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      t: i / PARTICLE_COUNT,
      speed: 0.15 + Math.random() * 0.1,
    })),
  []);

  useFrame((state, delta) => {
    const elapsed = (performance.now() - startRef.current) / 1000;

    // Reveal tube with its target node
    const revealP = easeOutCubic(Math.min(Math.max((elapsed - edge.revealStart) / 1.5, 0), 1));

    if (tubeRef.current) {
      tubeRef.current.material.opacity = 0.06 * revealP;
    }

    // Animate particles along curve
    if (particlesRef.current && revealP > 0.5) {
      const fadeIn = Math.min((revealP - 0.5) / 0.5, 1);
      particleState.forEach((p, i) => {
        p.t = (p.t + p.speed * delta) % 1;
        const pos = curve.getPoint(p.t);
        const scale = Math.sin(p.t * Math.PI) * 0.06 * fadeIn;
        tempMatrix.makeScale(scale, scale, scale);
        tempMatrix.setPosition(pos.x, pos.y, pos.z);
        particlesRef.current.setMatrixAt(i, tempMatrix);
      });
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Tube */}
      <mesh ref={tubeRef} geometry={tubeGeometry}>
        <meshBasicMaterial
          color={edge.color}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Particles */}
      <instancedMesh ref={particlesRef} args={[null, null, PARTICLE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          color={edge.color}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
