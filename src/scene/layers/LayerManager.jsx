import { useStore } from '../../store';
import ThermalLayer from './ThermalLayer';
import FlowLayer from './FlowLayer';
import FinancialLayer from './FinancialLayer';
import SafetyLayer from './SafetyLayer';
import TimelineLayer from './TimelineLayer';

/**
 * Reads store.activeLayers and conditionally renders active data layers.
 * Each layer is a self-contained 3D visualization.
 */
export default function LayerManager({ zonePositions }) {
  const activeLayers = useStore(s => s.activeLayers);

  return (
    <group>
      {activeLayers.thermal && <ThermalLayer zonePositions={zonePositions} />}
      {activeLayers.flow && <FlowLayer zonePositions={zonePositions} />}
      {activeLayers.financial && <FinancialLayer zonePositions={zonePositions} />}
      {activeLayers.safety && <SafetyLayer zonePositions={zonePositions} />}
      {activeLayers.timeline && <TimelineLayer zonePositions={zonePositions} />}
    </group>
  );
}
