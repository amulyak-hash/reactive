import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export default function ScenePostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        intensity={1.5}
        mipmapBlur
      />
      <Vignette darkness={0.4} offset={0.3} />
    </EffectComposer>
  );
}
