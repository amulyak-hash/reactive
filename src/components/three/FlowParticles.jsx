import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EDGE_STYLES, getEntityById, getEntityColor } from '../../data/entityGraph';
import { C } from '../../theme/tokens';

const MAX_PARTICLES = 150;
const tempMatrix = new THREE.Matrix4();
const tempVec = new THREE.Vector3();
const tempVec2 = new THREE.Vector3();
const tempColor = new THREE.Color();

export default function FlowParticles({ edgeCurves, entryProgressRef }) {
  const meshRef = useRef();

  // Build particle state: allocate particles per edge based on density
  const particleState = useMemo(() => {
    const particles = [];
    let instanceIndex = 0;

    edgeCurves.forEach(edge => {
      const density = edge.flow?.density || 2;
      const speed = edge.flow?.speed || 0.4;
      const style = EDGE_STYLES[edge.type];

      // Determine color
      let color;
      if (style.color) {
        color = new THREE.Color(style.color);
      } else {
        const entity = getEntityById(edge.from);
        color = new THREE.Color(entity ? getEntityColor(entity) : C.teal);
      }

      for (let i = 0; i < density; i++) {
        if (instanceIndex >= MAX_PARTICLES) break;
        particles.push({
          index: instanceIndex++,
          curve: edge.curve,
          t: i / density, // evenly spaced
          speed: speed * (0.08 + Math.random() * 0.04), // slight variation
          color,
          direction: edge.flow?.direction === 'inward' ? -1 : 1,
        });
      }
    });

    return particles;
  }, [edgeCurves]);

  const totalParticles = particleState.length;

  useFrame((state, delta) => {
    if (!meshRef.current || !entryProgressRef.current) return;
    const mesh = meshRef.current;
    const progress = entryProgressRef.current;

    // Particles only visible after 80% entry
    if (progress < 0.8) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;

    const fadeIn = Math.min((progress - 0.8) / 0.2, 1);

    particleState.forEach(p => {
      // Advance along curve
      p.t = (p.t + p.speed * delta * p.direction + 1) % 1;

      const t = p.t;
      if (!p.curve) return;

      // Get position on curve
      p.curve.getPoint(t, tempVec);

      // Get direction for stretching
      const t2 = Math.min(t + 0.02, 0.99);
      p.curve.getPoint(t2, tempVec2);
      const dir = tempVec2.sub(tempVec).normalize();

      // Scale: slightly elongated along direction, fade at edges
      const edgeFade = Math.sin(t * Math.PI); // fade near endpoints
      const scale = 0.08 * edgeFade * fadeIn;

      tempMatrix.makeScale(scale * 2, scale, scale);
      // Align with direction
      const lookAt = new THREE.Matrix4().lookAt(
        tempVec.clone(),
        tempVec.clone().add(dir),
        new THREE.Vector3(0, 1, 0)
      );
      tempMatrix.premultiply(lookAt);
      tempMatrix.setPosition(tempVec.x, tempVec.y, tempVec.z);

      mesh.setMatrixAt(p.index, tempMatrix);
    });

    // Hide unused instances
    const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = totalParticles; i < MAX_PARTICLES; i++) {
      mesh.setMatrixAt(i, zeroMatrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, MAX_PARTICLES]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color={C.teal}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
