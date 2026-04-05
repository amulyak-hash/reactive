import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import { ZONE_PRESETS } from '../utils/cameraPresets';

const ZONE_IDS = Object.keys(ZONE_PRESETS);
const DISTANCE_THRESHOLD = 20; // within this distance, camera is "near" a zone

/**
 * Watches camera position each frame and updates AI context
 * when the closest zone changes.
 */
export function useCameraContext() {
  const setAIContext = useStore(s => s.setAIContext);
  const prevZoneRef = useRef(null);

  useFrame(({ camera }) => {
    let closestZone = null;
    let closestDist = Infinity;

    for (const id of ZONE_IDS) {
      const preset = ZONE_PRESETS[id];
      const [lx, ly, lz] = preset.lookAt;
      const dx = camera.position.x - lx;
      const dy = camera.position.y - ly;
      const dz = camera.position.z - lz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < closestDist) {
        closestDist = dist;
        closestZone = id;
      }
    }

    // Only update context if close enough and zone changed
    if (closestDist < DISTANCE_THRESHOLD && closestZone !== prevZoneRef.current) {
      prevZoneRef.current = closestZone;
      setAIContext({
        type: 'zone-3d',
        id: closestZone,
        layer: '3d',
        label: ZONE_PRESETS[closestZone].label,
      });
    } else if (closestDist >= DISTANCE_THRESHOLD && prevZoneRef.current !== null) {
      prevZoneRef.current = null;
      setAIContext({
        type: 'overview-3d',
        id: 'factory',
        layer: '3d',
        label: 'Factory Overview',
      });
    }
  });
}
