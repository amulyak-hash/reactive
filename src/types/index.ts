import type { ReactNode } from 'react';
import type { SizedSankeyGraph } from '../components/sankey/sankeyUtils';

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
  graph: SizedSankeyGraph;
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
