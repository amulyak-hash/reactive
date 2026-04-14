import { createContext, useContext, useState, useCallback, useRef } from 'react';

const VizContext = createContext(null);

/**
 * Shared selection state between primary + companion visualization in a ResponseCard.
 *
 * Selection model: click-to-lock + hover-to-preview.
 * - `hovered`: transient highlight on mousemove (clears on mouseleave)
 * - `selected`: locked highlight on click (clears on click-empty or different click)
 * - Both vizzes read `active` which is `selected ?? hovered` (selected takes priority)
 * - `dimOthers`: true when something is active (non-selected elements render at 30%)
 */
export function VizProvider({ children }) {
  const [hovered, setHovered] = useState(null);  // { source: 'primary'|'companion', key: string, data?: any }
  const [selected, setSelected] = useState(null); // same shape, persists until cleared

  const handleHover = useCallback((source, key, data) => {
    if (key === null) { setHovered(null); return; }
    setHovered({ source, key, data });
  }, []);

  const handleClick = useCallback((source, key, data) => {
    setSelected(prev => {
      // Click same element = deselect
      if (prev && prev.key === key && prev.source === source) return null;
      return { source, key, data };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(null);
  }, []);

  // Active = selected (locked) takes priority over hovered (transient)
  const active = selected || hovered;
  const dimOthers = active !== null;

  return (
    <VizContext.Provider value={{ active, selected, hovered, dimOthers, handleHover, handleClick, clearSelection }}>
      {children}
    </VizContext.Provider>
  );
}

export function useVizContext() {
  return useContext(VizContext);
}

/**
 * Helper: check if a given key matches the active selection.
 * Returns { isActive, isDimmed, isLocked } for rendering decisions.
 */
export function useVizHighlight(key) {
  const ctx = useVizContext();
  if (!ctx) return { isActive: false, isDimmed: false, isLocked: false };

  const { active, selected, dimOthers } = ctx;
  const isActive = active && active.key === key;
  const isLocked = selected && selected.key === key;
  const isDimmed = dimOthers && !isActive;

  return { isActive, isDimmed, isLocked };
}
