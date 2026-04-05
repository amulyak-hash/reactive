import { C } from '../../theme/tokens';

// Tour waypoints for anomaly zones.
// The AI tour visits alert zones in order of severity.
// Each waypoint has camera positioning, narration text, and optional layer activation.

export const TOUR_WAYPOINTS = [
  {
    zoneId: 'bf',
    cameraPosition: [-1, 8, -16],
    cameraLookAt: [-5.43, 3.11, -12.11],
    narration: "BF-3 superheat has dropped to 22°C — 12°C below the safe operating window. Silicon content from Supplier X's latest batch is 0.12% above spec. This is the start of the causal chain.",
    dwellTime: 5000,
    accent: C.orange,
  },
  {
    zoneId: 'cc',
    cameraPosition: [19, 8, 4],
    cameraLookAt: [14.74, 3.13, -0.48],
    narration: "The superheat deviation propagates here to CCM-3. Casting speed is down to 1.2 m/min. Solidification behaviour is shifting — 74% confidence this affects automotive-grade output.",
    dwellTime: 5000,
    accent: C.cyan,
  },
  {
    zoneId: 'ql',
    cameraPosition: [-6, 8, 15],
    cameraLookAt: [-9.85, 3.19, 10.88],
    narration: "Quality Lab shows 94.2% compliance, but compound confidence across the chain is only 59%. The risk isn't visible in any single metric — it's in the connections between zones.",
    dwellTime: 5000,
    accent: C.green,
  },
];

// Overview return point after tour completes
export const TOUR_OVERVIEW = {
  cameraPosition: [30, 20, 30],
  cameraLookAt: [0, 0, 0],
  narration: "That's the full picture. Two anomaly sources, one causal chain. Toggle data layers to explore further, or click any zone to dig deeper.",
  dwellTime: 4000,
};
