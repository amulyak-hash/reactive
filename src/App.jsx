import { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import Onboarding from './components/Onboarding';
import CommandCenter from './components/CommandCenter';
import PlantDrilldown from './components/PlantDrilldown';
import ZoneView from './components/ZoneView';
import StoryView from './components/StoryView';
import ProductionTrendDetailView from './components/ProductionTrendDetailView';
import AIAgent from './components/AIAgent';
import FactoryScene from './scene/FactoryScene';
import IntelligencePanel from './scene/overlays/IntelligencePanel';
import CommandBar from './components/CommandBar';
import LayerOrb from './components/LayerOrb';
import CausalBar from './components/CausalBar';
import CausalBriefingPanel from './components/CausalBriefingPanel';
import './audio/tourAudio'; // Activate tour audio subscription

export default function App() {
  const layer = useStore(s => s.layer);
  const mode = useStore(s => s.mode);
  const triggerDashboardAssembly = useStore(s => s.triggerDashboardAssembly);
  const triggerPlantBAssembly = useStore(s => s.triggerPlantBAssembly);
  const triggerZonesAssembly = useStore(s => s.triggerZonesAssembly);

  const toggleLayer = useStore(s => s.toggleLayer);
  const flyTo = useStore(s => s.flyTo);
  const exitStory = useStore(s => s.exitStory);
  const story = useStore(s => s.story);
  const tourState = useStore(s => s.tourState);
  const offerTour = useStore(s => s.offerTour);
  const endTour = useStore(s => s.endTour);
  const causalTourState = useStore(s => s.causalTourState);
  const endCausalTour = useStore(s => s.endCausalTour);

  const [activeLayer, setActiveLayer] = useState(layer);
  const [opacity, setOpacity] = useState(1);
  const prevLayer = useRef(layer);
  const cleanupRef = useRef(null);

  // Keyboard shortcuts in 3D mode
  useEffect(() => {
    if (mode !== '3d') return;
    const LAYER_KEYS = { '1': 'thermal', '2': 'flow', '3': 'financial', '4': 'safety', '5': 'timeline' };
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (LAYER_KEYS[e.key]) { toggleLayer(LAYER_KEYS[e.key]); return; }

      if (e.key === 'Escape') {
        if (causalTourState !== 'idle') { endCausalTour(); }
        if (story) { exitStory(); }
        flyTo({ position: [30, 20, 30], lookAt: [0, 0, 0] });
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        if (tourState === 'idle') offerTour();
        else if (tourState !== 'idle') endTour();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, toggleLayer, flyTo, exitStory, story, tourState, offerTour, endTour, causalTourState, endCausalTour]);

  useEffect(() => {
    if (layer === prevLayer.current) return;
    const fromOnboarding = prevLayer.current === 'onboarding';
    prevLayer.current = layer;

    if (fromOnboarding) {
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

  const scanPhase = useStore(s => s.scanPhase);
  const scanDone = scanPhase === 'complete';

  return (
    <>
      {mode === '3d' ? (
        <>
          <FactoryScene />
          {scanDone && <IntelligencePanel />}
          {/* CausalBar removed — 3D IntelCards3D now persists through all phases */}
          {scanDone && <CausalBriefingPanel />}
          {scanDone && <CommandBar />}
          {scanDone && <LayerOrb />}
        </>
      ) : (
        <div style={{
          opacity,
          transition: 'opacity 300ms ease',
          minHeight: '100vh',
        }}>
          {activeLayer === 'onboarding' && <Onboarding />}
          {activeLayer === 'dashboard' && <CommandCenter />}
          {activeLayer === 'plantB' && <PlantDrilldown />}
          {activeLayer === 'zones' && <ZoneView />}
          {activeLayer === 'story' && <StoryView />}
          {activeLayer === 'storyDetail' && <ProductionTrendDetailView />}
        </div>
      )}
      {mode === '2d' && <AIAgent visibleLayer={activeLayer} />}
    </>
  );
}
