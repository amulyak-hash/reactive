import { useEffect } from 'react';
import markup from './legacyMarkup';
import { cleanupVisualizationMounts } from './d3Visualizations';
import { initWorkspace } from './initWorkspace';
import './styles.css';

export default function App() {
  useEffect(() => {
    const mount = document.getElementById('legacy-root');
    if (!mount) return;
    mount.innerHTML = markup;
    initWorkspace();

    return () => {
      cleanupVisualizationMounts();
      mount.innerHTML = '';
    };
  }, []);

  return <div id="legacy-root" />;
}
