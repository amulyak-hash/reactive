import { Canvas } from '@react-three/fiber';
import CameraRig from './three/CameraRig';
import ConstellationGraph from './three/ConstellationGraph';
import ScenePostProcessing from './three/PostProcessing';
import EnvironmentEffects from './three/EnvironmentEffects';
import { useStore } from '../store';

export default function IntelligenceScene() {
  const unfocus = useStore(s => s.unfocus);
  const focusedEntity = useStore(s => s.focusedEntity);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => { if (focusedEntity) unfocus(); }}
        style={{ background: '#050914' }}
      >
        <color attach="background" args={['#050914']} />
        <CameraRig />
        <ConstellationGraph />
        <EnvironmentEffects />
        <ScenePostProcessing />
      </Canvas>
    </div>
  );
}
