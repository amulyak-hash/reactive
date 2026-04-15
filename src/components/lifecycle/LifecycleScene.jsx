import { Canvas, useThree } from '@react-three/fiber';
import { Stars, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useEffect } from 'react';
import LifecycleFlow from './LifecycleFlow';

function CameraSetup() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(15, 12, 15);
    // Shift lookAt up-left so the diagonal flow is centered with header/command bar
    camera.lookAt(-1, 0, 1);
    // Fill viewport — divisor 16 balances size vs. clipping
    camera.zoom = Math.min(size.width, size.height) / 16;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export default function LifecycleScene({ onNodeClick }) {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      camera={{ position: [15, 12, 15], zoom: 40, near: -100, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ background: '#050914' }}
      onCreated={({ camera }) => { camera.lookAt(0, 0, 0); }}
    >
      <color attach="background" args={['#050914']} />
      <CameraSetup />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />
      <directionalLight position={[-5, 8, -5]} intensity={0.3} color="#29cfd6" />

      <LifecycleFlow onNodeClick={onNodeClick} />

      {/* Background */}
      <fog attach="fog" args={['#050914', 40, 90]} />
      <Stars radius={80} depth={60} count={1500} factor={3} saturation={0} fade speed={0.5} />
      <Grid
        position={[0, -0.5, 0]}
        args={[60, 60]}
        cellSize={1.5}
        cellThickness={0.4}
        cellColor="#29cfd6"
        sectionSize={6}
        sectionThickness={0.8}
        sectionColor="#29cfd6"
        fadeDistance={35}
        fadeStrength={1.5}
        infiniteGrid
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.6} intensity={0.4} mipmapBlur />
        <Vignette darkness={0.3} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}
