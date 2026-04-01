import { createRoot, type Root } from 'react-dom/client';

import { VisualizationRenderer } from '../components/visualizationRenderer/VisualizationRenderer';
import type { BaseVisualizationConfig } from '../types';

const roots: Root[] = [];

function decodeConfig(encoded: string): BaseVisualizationConfig | null {
  try {
    return JSON.parse(decodeURIComponent(encoded)) as BaseVisualizationConfig;
  } catch {
    return null;
  }
}

export function cleanupVisualizationMounts() {
  while (roots.length) {
    const root = roots.pop();
    if (!root) continue;
    root.unmount();
  }
}

export function hydrateVisualizationMounts() {
  cleanupVisualizationMounts();
  document.querySelectorAll<HTMLElement>('[data-d3-viz]').forEach((node) => {
    const encodedConfig = node.dataset.d3Viz;
    if (!encodedConfig) return;
    const config = decodeConfig(encodedConfig);
    if (!config) return;
    const root = createRoot(node);
    roots.push(root);
    root.render(<VisualizationRenderer config={config} />);
  });
}

export function serializeVisualizationConfig(config: BaseVisualizationConfig) {
  return encodeURIComponent(JSON.stringify(config));
}
