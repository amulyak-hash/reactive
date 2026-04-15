import { C } from '../../theme/tokens';

// ─── Contract Lifecycle Stages ───
// Diagonal flow: screen top-left (Bids) → screen bottom-right (Implemented)
//
// Camera at (15,12,15) looking at origin. Screen mapping:
//   screenX ∝ (X - Z)    → +X goes right, +Z goes left
//   screenY ∝ -(X + Z)   → more negative (X+Z) = higher on screen
//
// To compute world coords from desired screen position:
//   X = (sX - sY) / 2
//   Z = -(sX + sY) / 2
//
// Main flow: screen top-left (sX=-11,sY=8) → bottom-right (sX=11,sY=-8)
// Branches fork perpendicular to the main flow

export const STAGES = [
  {
    // screen: (-12, 9) → far top-left
    id: 'bids',
    label: 'BIDS',
    subtitle: '5 contractors',
    ucId: 'uc-02',
    accent: C.blue,
    position: [-10, 0, 2],
    revealStart: 0.8,
    revealDur: 1.2,
    vizType: 'bid-bars',
    vizScale: 1.8,
    isSplitPoint: false,
  },
  {
    // screen: (-6, 4) → mid top-left
    id: 'contracts',
    label: 'CONTRACTS',
    subtitle: '£720.6M portfolio',
    ucId: 'uc-00',
    accent: C.cyan,
    position: [-5, 0, 1],
    revealStart: 1.8,
    revealDur: 1.2,
    vizType: 'contract-cubes',
    vizScale: 1.8,
    isSplitPoint: false,
  },
  {
    // screen: (0, 0) → center
    id: 'ew',
    label: 'EARLY WARNINGS',
    subtitle: '12 open, £820K risk',
    ucId: 'uc-03',
    accent: C.amber,
    position: [0, 0, 0],
    revealStart: 2.8,
    revealDur: 1.2,
    vizType: 'ew-prisms',
    vizScale: 1.8,
    isSplitPoint: true,
  },
  {
    // screen: (3, 7) → branch UP from EW, well separated from Claims
    id: 'not-nce',
    label: 'NOT NCE',
    subtitle: 'risk mitigated',
    ucId: 'uc-06',
    accent: C.green,
    position: [-2, 0, -5],
    revealStart: 4.2,
    revealDur: 1.2,
    vizType: 'resolved',
    vizScale: 1.6,
    isSplitPoint: false,
  },
  {
    // screen: (6, -4) → main flow continues down-right
    id: 'nces',
    label: 'NCEs',
    subtitle: '£93.2M deviation',
    ucId: 'uc-01',
    accent: C.red,
    position: [5, 0, -1],
    revealStart: 4.0,
    revealDur: 1.2,
    vizType: 'nce-rising',
    vizScale: 1.8,
    isSplitPoint: true,
  },
  {
    // screen: (12, -8) → far bottom-right
    id: 'implemented',
    label: 'IMPLEMENTED',
    subtitle: 'cost absorbed',
    ucId: 'uc-05',
    accent: C.purple,
    position: [10, 0, -2],
    revealStart: 5.5,
    revealDur: 1.2,
    vizType: 'settled',
    vizScale: 1.6,
    isSplitPoint: false,
  },
  {
    // screen: (10, -1) → branch right from NCE, clearly separate from Implemented
    id: 'rejected',
    label: 'REJECTED',
    subtitle: 'cost saved',
    ucId: 'uc-04',
    accent: C.orange,
    position: [5.5, 0, -5.5],
    revealStart: 5.5,
    revealDur: 1.2,
    vizType: 'x-mark',
    vizScale: 1.6,
    isSplitPoint: false,
  },
  {
    // screen: (8, 6) → branch far upper-right from EW, separated from Not-NCE
    id: 'claims',
    label: 'CLAIMS',
    subtitle: 'patterns detected',
    ucId: 'uc-09',
    accent: C.purple,
    position: [1, 0, -7],
    revealStart: 6.5,
    revealDur: 1.2,
    vizType: 'network',
    vizScale: 1.6,
    isSplitPoint: false,
  },
];

// Flow edges: [fromIndex, toIndex, optional label]
export const FLOW_EDGES = [
  { from: 0, to: 1 },                                    // Bids → Contracts
  { from: 1, to: 2 },                                    // Contracts → EW
  { from: 2, to: 3, label: 'Not NCE — 62%' },           // EW → Not-NCE
  { from: 2, to: 4, label: 'Became NCE — 38%' },        // EW → NCEs
  { from: 4, to: 5, label: 'Implemented' },              // NCEs → Implemented
  { from: 4, to: 6, label: 'Rejected' },                 // NCEs → Rejected
  { from: 2, to: 7 },                                    // EW → Claims
];
