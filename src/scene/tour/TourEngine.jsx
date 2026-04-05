import { useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { TOUR_WAYPOINTS, TOUR_OVERVIEW } from './tourWaypoints';

/**
 * TourEngine — invisible component that drives the AI-guided flythrough.
 *
 * State machine:
 *   idle → offered (on mount, if anomalies exist)
 *   offered → active (user accepts) | idle (user declines)
 *   active → paused (user grabs camera) | idle (tour complete)
 *   paused → active (user resumes)
 */
export default function TourEngine() {
  const tourState = useStore(s => s.tourState);
  const tourWaypointIndex = useStore(s => s.tourWaypointIndex);
  const flyTo = useStore(s => s.flyTo);
  const advanceTour = useStore(s => s.advanceTour);
  const endTour = useStore(s => s.endTour);
  const setAIContext = useStore(s => s.setAIContext);
  const offerTour = useStore(s => s.offerTour);
  const causalTourState = useStore(s => s.causalTourState);
  const dwellTimerRef = useRef(null);

  // On mount, offer the tour after a short delay (suppressed when cinematic tour is active)
  useEffect(() => {
    if (causalTourState !== 'idle') return;
    const t = setTimeout(() => {
      offerTour();
    }, 3000);
    return () => clearTimeout(t);
  }, [offerTour, causalTourState]);

  // When tour is active, fly to current waypoint
  useEffect(() => {
    if (tourState !== 'active') return;

    const waypoint = TOUR_WAYPOINTS[tourWaypointIndex];

    // Tour finished all waypoints — return to overview
    if (!waypoint) {
      flyTo({
        position: TOUR_OVERVIEW.cameraPosition,
        lookAt: TOUR_OVERVIEW.cameraLookAt,
      });
      setAIContext({
        type: 'tour-summary',
        id: 'tour-complete',
        layer: '3d',
        label: 'Tour Complete',
        narration: TOUR_OVERVIEW.narration,
      });

      dwellTimerRef.current = setTimeout(() => {
        endTour();
      }, TOUR_OVERVIEW.dwellTime);
      return;
    }

    // Fly to waypoint
    flyTo({
      position: waypoint.cameraPosition,
      lookAt: waypoint.cameraLookAt,
    });

    // Update AI context with narration
    setAIContext({
      type: 'tour-waypoint',
      id: waypoint.zoneId,
      layer: '3d',
      label: `Tour: ${waypoint.zoneId.toUpperCase()}`,
      accent: waypoint.accent,
      narration: waypoint.narration,
    });

    // After dwell time, advance to next waypoint
    dwellTimerRef.current = setTimeout(() => {
      advanceTour();
    }, waypoint.dwellTime + 2000); // +2s for camera flight

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [tourState, tourWaypointIndex, flyTo, advanceTour, endTour, setAIContext]);

  // Pause clears the dwell timer
  useEffect(() => {
    if (tourState === 'paused' && dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
    }
  }, [tourState]);

  return null; // Invisible — all logic, no rendering
}
