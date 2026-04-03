import type { ReactNode } from 'react';

export type VisualizationFrameProps = {
  className?: string;
};

export type VizRow = {
  id?: string;
  vendor: string;
  pricing?: number;
};

export type PointPair = [string, string | number];

export type MiniBarRow = [string, number, string];

export type SankeyNodeData = {
  id: string;
  name: string;
  valueLabel?: string;
};

export type SankeyLinkData = {
  source: string;
  target: string;
  value: number;
};

export type SeriesChartColors = {
  axisLine?: string;
  line?: string;
  areaFill?: string;
  point?: string;
};

export type BarChartColors = {
  axisLine?: string;
  bars?: string[];
  valueLabel?: string;
};

export type PieChartColors = {
  slices?: string[];
};

export type TrendChartColors = {
  axisLine?: string;
  line?: string;
  point?: string;
};

export type SankeyChartColors = {
  links?: string;
  activeLinks?: string;
  nodes?: string[];
  activeNodes?: string;
};

export type BarChartProps = {
  rows?: VizRow[];
  colors?: BarChartColors;
} & VisualizationFrameProps;

export type LineChartProps = {
  rows?: VizRow[];
  colors?: SeriesChartColors;
} & VisualizationFrameProps;

export type AreaChartProps = {
  rows?: VizRow[];
  colors?: SeriesChartColors;
} & VisualizationFrameProps;

export type PieChartProps = {
  rows?: VizRow[];
  variant: 'pie' | 'donut';
  colors?: PieChartColors;
} & VisualizationFrameProps;

export type DonutChartProps = {
  rows?: VizRow[];
  colors?: PieChartColors;
} & VisualizationFrameProps;

export type MiniBarsProps = {
  rows?: MiniBarRow[];
  colors?: PieChartColors;
} & VisualizationFrameProps;

export type ProcessSankeyProps = {
  selectedEntity?: string | null;
  colors?: SankeyChartColors;
} & VisualizationFrameProps;

export type RankingSankeyProps = {
  rows?: VizRow[];
  colors?: SankeyChartColors;
} & VisualizationFrameProps;

export type SankeySvgProps = {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
  width?: number;
  height?: number;
  ariaLabel: string;
  selectedEntity?: string | null;
  colors?: SankeyChartColors;
} & VisualizationFrameProps;

export type SeriesChartProps = {
  rows?: VizRow[];
  variant: 'line' | 'area';
  colors?: SeriesChartColors;
} & VisualizationFrameProps;

export type TrendChartProps = {
  points?: PointPair[];
  colors?: TrendChartColors;
} & VisualizationFrameProps;

export type ChartFrameProps = {
  children: ReactNode;
  className?: string;
};

export type BaseVisualizationConfig =
  | {
      type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'sankey';
      rows: VizRow[];
    }
  | {
      type: 'flow';
      selectedEntity?: string | null;
    }
  | {
      type: 'trend';
      points: PointPair[];
    }
  | {
      type: 'mini-bars';
      rows: MiniBarRow[];
    }
  | { type: 'contract-value-orb'; data: ContractData }
  | { type: 'contract-bars'; contractors: ContractorRow[] }
  | { type: 'commitment-race'; contractors: ContractorRow[] }
  | { type: 'status-arc'; segments: EWStatusRow[]; title?: string }
  | { type: 'ew-category'; categories: EWCategoryRow[]; title?: string }
  | { type: 'contractor-rank'; contractors: EWOpenContractorRow[]; title?: string }
  | { type: 'severity-bands'; severities: EWSeverityRow[]; title?: string }
  | { type: 'nce-tree'; total: number; byContractor: NCEContractorRow[] }
  | { type: 'compensation-gauge'; pct: number; confirmed: number; total: number }
  | { type: 'variation-split'; contractors: VariationRow[] }
  | { type: 'quotation-balance'; accepted: QuotationSide; submitted: QuotationSide }
  | { type: 'quotation-trend'; trend: QuotationTrendPoint[] }
  | { type: 'weekly-flow'; contractors: ContractorRow[] };

export type VisualizationRendererProps = {
  config: BaseVisualizationConfig;
  className?: string;
};

// ─── Contract Management Dashboard Types ─────────────────────────────────────

export type ContractorRow = {
  id: string;
  name: string;
  shortName: string;
  base: number;
  variations: number;
  totalCommitment: number;
  commitmentPct: number;
};

export type ContractData = {
  contractors: ContractorRow[];
  totals: { base: number; variations: number; totalCommitment: number };
};

export type EWStatusRow = { status: string; count: number };
export type EWCategoryRow = { category: string; fullName: string; count: number };
export type EWSeverityRow = { severity: string; count: number };
export type EWOpenContractorRow = { id: string; name: string; shortName: string; openCount: number };

export type NCEContractorRow = { id: string; name: string; shortName: string; count: number };
export type NCECompensationData = { total: number; confirmed: number; pctConfirmed: number };

export type VariationRow = {
  id: string;
  name: string;
  shortName: string;
  implemented: number;
  unimplemented: number;
};

export type QuotationSide = { value: number; count: number; label: string };
export type QuotationSummary = { accepted: QuotationSide; submitted: QuotationSide };
export type QuotationTrendPoint = { week: string; count: number; value: number };

// ─── Key Highlights Types ────────────────────────────────────────────────────

export type KeyHighlightChip = { value: string; label: string; color?: string };
export type KeyHighlightBadge = { text: string; severity: 'red' | 'amber' | 'green' };
export type KeyHighlightDot = { val: number; color: string; name: string };
export type FlagsListRow = { text: string; tag: string; date: string; severity: 'red' | 'amber' | 'green' };
export type ComparisonRow = { label: string; cells: string[]; color?: string };

export type ScorecardRow = {
  name: string;
  value: string;
  pct: number;        // 0–100, drives the inline bar width
  color: string;
  badge?: string;
  badgeSeverity?: 'green' | 'amber' | 'red';
  sublabel?: string;
};

export type KeyHighlightBlock =
  | { type: 'stats';           items: Array<{ value: string; label: string; color?: string }>; takeaway?: string }
  | { type: 'chips';           items: KeyHighlightChip[]; takeaway?: string }
  | { type: 'ranked';          items: Array<{ name: string; value: string; color: string; kpiLabel?: string }>; takeaway?: string }
  | { type: 'proportion';      leftPct: number; leftLabel: string; leftValue: string; leftColor: string; rightPct: number; rightLabel: string; rightValue: string; rightColor: string; chips?: KeyHighlightChip[]; takeaway?: string }
  | { type: 'ring';            pct: number; label: string; color: string; chips?: KeyHighlightChip[]; takeaway?: string }
  | { type: 'badges';          items: KeyHighlightBadge[]; textSize?: number; takeaway?: string }
  | { type: 'dot-strip';       min: number; max: number; unit: string; dots: KeyHighlightDot[]; chips?: KeyHighlightChip[]; takeaway?: string }
  | { type: 'scorecard-rows';  items: ScorecardRow[]; takeaway?: string }
  | { type: 'flags-list';      items: FlagsListRow[]; takeaway?: string }
  | { type: 'comparison-rows'; columns: string[]; rows: ComparisonRow[]; takeaway?: string };

// ─── Narrative Chain Types ──────────────────────────────────────────────────

export type NarrativeStep = {
  id: string;
  questionText: string;
  title: string;
  insight: string;
  vizConfigs: BaseVisualizationConfig[];
  followupIds: string[];
  keyInsights: string[];
  keyHighlights?: KeyHighlightBlock;
};
