import { C } from '../theme/tokens';

// ─── Entity Graph: Intelligence Constellation Data Model ───
// Restructures use-case data into a graph of typed entities and edges
// for the 3D constellation visualization.

// ─── Severity thresholds ───
// contractor variation: >20% = critical, >10% = warning, >8% = watch, <8% = healthy

export const SEVERITY_COLORS = {
  critical: C.red,
  warning: C.orange,
  watch: C.amber,
  healthy: C.green,
};

// ─── Entities ───

export const ENTITIES = [
  // ── Hub ──
  {
    id: 'hub',
    type: 'hub',
    label: 'PORT TALBOT',
    shortLabel: 'PORT TALBOT',
    subtitle: 'EAF Programme',
    value: 93200, // £K total exposure
    severity: 'critical',
    metrics: {
      portfolioValue: 720600,
      totalNCE: 93200,
      avgVariation: 12.9,
      contractorCount: 5,
    },
    orbit: null, // origin
  },

  // ── Contractors (from uc-00 vizData.contractors) ──
  {
    id: 'contractor-afcons',
    type: 'contractor',
    label: 'Afcons Infra',
    shortLabel: 'Afcons',
    value: 35500, // £K NCE exposure
    severity: 'critical',
    metrics: {
      variationPct: 25,
      nceCount: 14,
      ewCount: 3,
      originalValue: 142000,
      trend: [0, 3.8, 8.2, 14.1, 19.5, 25.2, 30.1, 35.5],
    },
    orbit: { parent: 'hub', angle: -0.3, radius: 18 },
  },
  {
    id: 'contractor-tata',
    type: 'contractor',
    label: 'Tata Projects',
    shortLabel: 'Tata Proj',
    value: 18200,
    severity: 'watch',
    metrics: {
      variationPct: 9.8,
      nceCount: 22,
      ewCount: 1,
      originalValue: 186400,
      trend: [0, 2.1, 4.8, 7.2, 10.1, 13.5, 15.8, 18.2],
    },
    orbit: { parent: 'hub', angle: 0.1, radius: 17 },
  },
  {
    id: 'contractor-ncc',
    type: 'contractor',
    label: 'NCC Ltd',
    shortLabel: 'NCC',
    value: 15800,
    severity: 'warning',
    metrics: {
      variationPct: 16,
      nceCount: 11,
      ewCount: 2,
      originalValue: 98400,
      trend: [0, 1.1, 2.4, 4.2, 6.8, 9.5, 12.8, 15.8],
    },
    orbit: { parent: 'hub', angle: 0.5, radius: 17 },
  },
  {
    id: 'contractor-lt',
    type: 'contractor',
    label: 'L&T Construction',
    shortLabel: 'L&T',
    value: 12600,
    severity: 'healthy',
    metrics: {
      variationPct: 6,
      nceCount: 8,
      ewCount: 0,
      originalValue: 210600,
      trend: [0, 1.2, 2.8, 4.5, 6.2, 8.1, 10.4, 12.6],
    },
    orbit: { parent: 'hub', angle: 0.9, radius: 16 },
  },
  {
    id: 'contractor-kec',
    type: 'contractor',
    label: 'KEC International',
    shortLabel: 'KEC',
    value: 11100,
    severity: 'watch',
    metrics: {
      variationPct: 13.3,
      nceCount: 9,
      ewCount: 1,
      originalValue: 83200,
      trend: [0, 0.8, 2.1, 3.9, 5.8, 7.6, 9.2, 11.1],
    },
    orbit: { parent: 'hub', angle: -0.7, radius: 16 },
  },

  // ── Early Warnings (from uc-03 vizData.current) ──
  {
    id: 'ew-0042',
    type: 'early-warning',
    label: 'EW-0042',
    shortLabel: 'EW-42',
    subtitle: 'Transformer',
    value: 310, // £K projected CE cost
    severity: 'critical',
    metrics: { daysOpen: 19, subject: 'EAF Transformer delay', onCriticalPath: true },
    orbit: { parent: 'contractor-afcons', angle: -0.6, radius: 5 },
  },
  {
    id: 'ew-0058',
    type: 'early-warning',
    label: 'EW-0058',
    shortLabel: 'EW-58',
    subtitle: 'Piling',
    value: 350,
    severity: 'critical',
    metrics: { daysOpen: 22, subject: 'Piling foundation issues', onCriticalPath: true },
    orbit: { parent: 'contractor-afcons', angle: 0.3, radius: 5.5 },
  },
  {
    id: 'ew-0063',
    type: 'early-warning',
    label: 'EW-0063',
    shortLabel: 'EW-63',
    subtitle: 'Steelwork clash',
    value: 295,
    severity: 'critical',
    metrics: { daysOpen: 18, subject: 'Steelwork interface clash', onCriticalPath: true },
    orbit: { parent: 'contractor-ncc', angle: -0.4, radius: 5 },
  },
  {
    id: 'ew-0071',
    type: 'early-warning',
    label: 'EW-0071',
    shortLabel: 'EW-71',
    subtitle: 'Access delay',
    value: 190,
    severity: 'warning',
    metrics: { daysOpen: 14, subject: 'Site access restrictions', onCriticalPath: false },
    orbit: { parent: 'contractor-tata', angle: -0.5, radius: 5 },
  },
  {
    id: 'ew-0075',
    type: 'early-warning',
    label: 'EW-0075',
    shortLabel: 'EW-75',
    subtitle: 'Design change',
    value: 340,
    severity: 'critical',
    metrics: { daysOpen: 21, subject: 'Design revision impact', onCriticalPath: false },
    orbit: { parent: 'contractor-kec', angle: 0.4, radius: 5 },
  },
  {
    id: 'ew-0079',
    type: 'early-warning',
    label: 'EW-0079',
    shortLabel: 'EW-79',
    subtitle: 'HV interface',
    value: 280,
    severity: 'warning',
    metrics: { daysOpen: 16, subject: 'HV switchgear interface', onCriticalPath: false },
    orbit: { parent: 'contractor-ncc', angle: 0.5, radius: 5 },
  },

  // ── NCEs / Claims ──
  {
    id: 'nce-0127',
    type: 'nce',
    label: 'NCE-0127',
    shortLabel: 'NCE-127',
    subtitle: 'Ground conditions',
    value: 400, // £K claim value
    severity: 'critical', // flagged — validity issue
    flagged: true,
    metrics: { claimValue: 400, fairValue: 240, clause: '60.1(12)', contractor: 'McAlpine' },
    orbit: { parent: 'contractor-afcons', angle: 1.2, radius: 5.5 },
  },
  {
    id: 'nce-salami-cluster',
    type: 'nce',
    label: 'Salami Pattern',
    shortLabel: 'Salami',
    subtitle: '7 NCEs, £221K',
    value: 221,
    severity: 'warning',
    flagged: true,
    metrics: { claimCount: 7, totalValue: 221, contractor: 'RHI Magnesita', pattern: 'salami-slicing' },
    orbit: { parent: 'contractor-kec', angle: -0.5, radius: 5 },
  },
  {
    id: 'nce-design-change',
    type: 'nce',
    label: 'NCE-0098',
    shortLabel: 'NCE-98',
    subtitle: 'Design changes',
    value: 81,
    severity: 'watch',
    flagged: false,
    metrics: { claimValue: 81, clause: '60.1(1)', contractor: 'Tata Projects' },
    orbit: { parent: 'contractor-tata', angle: 0.6, radius: 5 },
  },

  // ── Packages (from uc-01 vizData.packages — bleeding ones highlighted) ──
  {
    id: 'pkg-ei01',
    type: 'package',
    label: 'Electrical Installation',
    shortLabel: 'EI-01',
    value: 1800, // £K projected overrun
    severity: 'critical', // bleeding — 34% over plan
    metrics: { overrunPct: 34, nceCount: 0, burnRate: 1.38, code: 'EI-01' },
    orbit: { parent: 'contractor-tata', angle: -1.0, radius: 5.5 },
  },
  {
    id: 'pkg-cvb',
    type: 'package',
    label: 'Civils Package B',
    shortLabel: 'CV-B',
    value: 117,
    severity: 'warning', // bleeding — £1,200/day above rate
    metrics: { overrunPct: 20, nceCount: 0, burnRate: 1.20, code: 'CV-B' },
    orbit: { parent: 'contractor-lt', angle: -0.3, radius: 5 },
  },
  {
    id: 'pkg-fe01',
    type: 'package',
    label: 'Fume Extraction Ductwork',
    shortLabel: 'FE-01',
    value: 500,
    severity: 'warning', // bleeding — 22% above BoQ rates
    metrics: { overrunPct: 22, nceCount: 0, burnRate: 1.22, code: 'FE-01' },
    orbit: { parent: 'contractor-ncc', angle: 1.0, radius: 5 },
  },
  {
    id: 'pkg-ss01',
    type: 'package',
    label: 'Structural Steel',
    shortLabel: 'SS-01',
    value: 5000,
    severity: 'healthy',
    metrics: { overrunPct: 0, nceCount: 5, burnRate: 1.00, code: 'SS-01' },
    orbit: { parent: 'contractor-lt', angle: 0.7, radius: 5 },
  },
];

// ─── Edges ───

export const EDGES = [
  // Hub → Contractors (contractual)
  { from: 'hub', to: 'contractor-afcons', type: 'contractual', flow: { speed: 0.4, density: 3, direction: 'inward' } },
  { from: 'hub', to: 'contractor-tata', type: 'contractual', flow: { speed: 0.4, density: 3, direction: 'inward' } },
  { from: 'hub', to: 'contractor-ncc', type: 'contractual', flow: { speed: 0.4, density: 2, direction: 'inward' } },
  { from: 'hub', to: 'contractor-lt', type: 'contractual', flow: { speed: 0.4, density: 2, direction: 'inward' } },
  { from: 'hub', to: 'contractor-kec', type: 'contractual', flow: { speed: 0.4, density: 2, direction: 'inward' } },

  // Contractor → EWs (risk)
  { from: 'contractor-afcons', to: 'ew-0042', type: 'risk', flow: { speed: 0.7, density: 5, direction: 'outward' } },
  { from: 'contractor-afcons', to: 'ew-0058', type: 'risk', flow: { speed: 0.7, density: 5, direction: 'outward' } },
  { from: 'contractor-ncc', to: 'ew-0063', type: 'risk', flow: { speed: 0.7, density: 4, direction: 'outward' } },
  { from: 'contractor-tata', to: 'ew-0071', type: 'risk', flow: { speed: 0.6, density: 3, direction: 'outward' } },
  { from: 'contractor-kec', to: 'ew-0075', type: 'risk', flow: { speed: 0.7, density: 4, direction: 'outward' } },
  { from: 'contractor-ncc', to: 'ew-0079', type: 'risk', flow: { speed: 0.6, density: 3, direction: 'outward' } },

  // Contractor → NCEs (risk)
  { from: 'contractor-afcons', to: 'nce-0127', type: 'risk', flow: { speed: 0.6, density: 4, direction: 'outward' } },
  { from: 'contractor-kec', to: 'nce-salami-cluster', type: 'pattern', flow: { speed: 0.3, density: 2, direction: 'outward' } },
  { from: 'contractor-tata', to: 'nce-design-change', type: 'risk', flow: { speed: 0.5, density: 2, direction: 'outward' } },

  // Contractor → Packages (contractual)
  { from: 'contractor-tata', to: 'pkg-ei01', type: 'contractual', flow: { speed: 0.4, density: 2, direction: 'outward' } },
  { from: 'contractor-lt', to: 'pkg-cvb', type: 'contractual', flow: { speed: 0.4, density: 2, direction: 'outward' } },
  { from: 'contractor-ncc', to: 'pkg-fe01', type: 'contractual', flow: { speed: 0.4, density: 2, direction: 'outward' } },
  { from: 'contractor-lt', to: 'pkg-ss01', type: 'contractual', flow: { speed: 0.3, density: 1, direction: 'outward' } },

  // Cascade lines (the "aha" connections)
  { from: 'ew-0042', to: 'ew-0058', type: 'cascade', flow: { speed: 1.0, density: 7, direction: 'outward' } },
  { from: 'ew-0063', to: 'pkg-fe01', type: 'cascade', flow: { speed: 0.8, density: 5, direction: 'outward' } },

  // Pattern: bleeding packages have no NCEs (budget bleed detection)
  { from: 'pkg-ei01', to: 'pkg-cvb', type: 'pattern', flow: { speed: 0.3, density: 2, direction: 'outward' } },
  { from: 'pkg-cvb', to: 'pkg-fe01', type: 'pattern', flow: { speed: 0.3, density: 2, direction: 'outward' } },
];

// ─── Entity → Use Case mapping (for AI thread bridging) ───

export const ENTITY_TO_USECASE = {
  // Hub → Board Brief
  'hub': 'uc-07',
  // Contractors → NCE Variation Analysis
  'contractor-afcons': 'uc-00',
  'contractor-tata': 'uc-00',
  'contractor-ncc': 'uc-00',
  'contractor-lt': 'uc-00',
  'contractor-kec': 'uc-00',
  // Stale EWs → EW Response Cost
  'ew-0042': 'uc-03',
  'ew-0058': 'uc-03',
  'ew-0063': 'uc-03',
  'ew-0071': 'uc-03',
  'ew-0075': 'uc-03',
  'ew-0079': 'uc-03',
  // Flagged NCEs → NCE Validity
  'nce-0127': 'uc-05',
  // Salami pattern → Salami Slicing
  'nce-salami-cluster': 'uc-02',
  // Normal NCE → NCE Variation
  'nce-design-change': 'uc-00',
  // Bleeding packages (no NCEs) → Budget Bleed
  'pkg-ei01': 'uc-01',
  'pkg-cvb': 'uc-01',
  'pkg-fe01': 'uc-01',
  // Healthy package → NCE Variation (general overview)
  'pkg-ss01': 'uc-00',
};

// ─── Edge type visual config ───

export const EDGE_STYLES = {
  contractual: { color: C.teal, opacity: 0.25, dashed: false, lineWidth: 1.0 },
  risk:        { color: null,   opacity: 0.35, dashed: false, lineWidth: 1.2 }, // color from severity
  cascade:     { color: C.purple, opacity: 0.4, dashed: true,  lineWidth: 1.0 },
  pattern:     { color: C.amber,  opacity: 0.2, dashed: true,  lineWidth: 0.8 },
};

// ─── Helpers ───

const entityMap = new Map(ENTITIES.map(e => [e.id, e]));

export function getEntityById(id) {
  return entityMap.get(id) || null;
}

export function getEntitiesByType(type) {
  return ENTITIES.filter(e => e.type === type);
}

export function getChildEntities(parentId) {
  return ENTITIES.filter(e => e.orbit?.parent === parentId);
}

export function getEdgesFor(entityId) {
  return EDGES.filter(e => e.from === entityId || e.to === entityId);
}

export function getEntityColor(entity) {
  return SEVERITY_COLORS[entity.severity] || C.teal;
}
