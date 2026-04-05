import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useStore } from '../../store';

export default function PostProcessing() {
  const holoMode = useStore(s => s.holoMode);
  const scanPhase = useStore(s => s.scanPhase);
  const causalTransitioning = useStore(s => s.causalTransitioning);
  const causalTourState = useStore(s => s.causalTourState);

  const isOnboarding = scanPhase === 'intel' || scanPhase === 'scanning';
  const glowMode = holoMode || isOnboarding;
  const isCausalActive = causalTourState === 'active' || causalTourState === 'paused';

  const [bloomIntensity, setBloomIntensity] = useState(0.8);

  // Animate bloom during causal tour transitions
  useFrame(() => {
    let target;
    if (causalTransitioning) {
      target = 2.0 + Math.sin(Date.now() * 0.006) * 0.5;
    } else if (isCausalActive) {
      target = glowMode ? 1.4 : 1.0;
    } else {
      target = glowMode ? 1.2 : 0.8;
    }

    setBloomIntensity(prev => {
      const diff = Math.abs(prev - target);
      if (diff < 0.01) return prev;
      return prev + (target - prev) * 0.08;
    });
  });

  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={glowMode ? 0.35 : isCausalActive ? 0.45 : 0.6}
        luminanceSmoothing={glowMode ? 0.6 : 0.4}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={isCausalActive ? 0.85 : glowMode ? 0.75 : 0.6}
      />
    </EffectComposer>
  );
}
