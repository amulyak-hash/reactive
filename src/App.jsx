import { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import Onboarding from './components/Onboarding';
import CommandCenter from './components/CommandCenter';
import PlantDrilldown from './components/PlantDrilldown';
import ZoneView from './components/ZoneView';
import StoryView from './components/StoryView';
import AIAgent from './components/AIAgent';

export default function App() {
  const layer = useStore(s => s.layer);
  const triggerDashboardAssembly = useStore(s => s.triggerDashboardAssembly);
  const triggerPlantBAssembly = useStore(s => s.triggerPlantBAssembly);
  const triggerZonesAssembly = useStore(s => s.triggerZonesAssembly);

  const [activeLayer, setActiveLayer] = useState(layer);
  const [opacity, setOpacity] = useState(1);
  const prevLayer = useRef(layer);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (layer === prevLayer.current) return;
    const fromOnboarding = prevLayer.current === 'onboarding';
    prevLayer.current = layer;

    if (fromOnboarding) {
      // Onboarding already faded itself out — just swap in dashboard and fade up
      setActiveLayer(layer);
      setOpacity(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOpacity(1);
          const t = setTimeout(() => {
            if (layer === 'dashboard') triggerDashboardAssembly();
          }, 200);
          cleanupRef.current = () => clearTimeout(t);
        });
      });
      return;
    }

    // Normal layer transition: fade out → swap → fade in
    setOpacity(0);

    const t1 = setTimeout(() => {
      setActiveLayer(layer);
      window.scrollTo(0, 0);
      setOpacity(1);

      const t2 = setTimeout(() => {
        if (layer === 'dashboard') triggerDashboardAssembly();
        if (layer === 'plantB') triggerPlantBAssembly();
        if (layer === 'zones') triggerZonesAssembly();
      }, 200);

      cleanupRef.current = () => clearTimeout(t2);
    }, 300);

    return () => {
      clearTimeout(t1);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [layer]);

  if (activeLayer === 'onboarding') {
    return <Onboarding />;
  }

  return (
    <>
      <div style={{
        opacity,
        transition: 'opacity 300ms ease',
        minHeight: '100vh',
      }}>
        {activeLayer === 'dashboard' && <CommandCenter />}
        {activeLayer === 'plantB' && <PlantDrilldown />}
        {activeLayer === 'zones' && <ZoneView />}
        {activeLayer === 'story' && <StoryView />}
      </div>
      <AIAgent />
    </>
  );
}
