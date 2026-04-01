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
    };

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
