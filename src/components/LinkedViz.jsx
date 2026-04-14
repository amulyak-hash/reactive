import { useVizContext } from './VizContext';
import UseCaseViz from './UseCaseViz';
import CompanionViz from '../canvas/uc/CompanionViz';

/**
 * Wrappers that bridge VizContext ↔ canvas components.
 * Canvas components receive `activeKey`, `dimOthers`, `onHover`, `onClick` as props.
 * They use refs internally to read these without re-mounting the animation loop.
 */

export function LinkedPrimaryViz({ vizType, vizData, accent }) {
  const ctx = useVizContext();
  const activeKey = ctx?.active?.key ?? null;
  const dimOthers = ctx?.dimOthers ?? false;
  const onHover = (key, data) => ctx?.handleHover('primary', key, data);
  const onClick = (key, data) => ctx?.handleClick('primary', key, data);

  return (
    <UseCaseViz
      vizType={vizType}
      vizData={vizData}
      accent={accent}
      activeKey={activeKey}
      dimOthers={dimOthers}
      onVizHover={onHover}
      onVizClick={onClick}
    />
  );
}

export function LinkedCompanionViz({ type, data, accent, width, height }) {
  const ctx = useVizContext();
  const activeKey = ctx?.active?.key ?? null;
  const dimOthers = ctx?.dimOthers ?? false;
  const onHover = (key, data) => ctx?.handleHover('companion', key, data);
  const onClick = (key, data) => ctx?.handleClick('companion', key, data);

  return (
    <CompanionViz
      type={type}
      data={data}
      accent={accent}
      width={width}
      height={height}
      activeKey={activeKey}
      dimOthers={dimOthers}
      onVizHover={onHover}
      onVizClick={onClick}
    />
  );
}
