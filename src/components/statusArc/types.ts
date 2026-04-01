export interface StatusSegment {
  status: string;
  count: number;
}

export interface StatusArcProps {
  segments: StatusSegment[];
  title?: string;
  'data-testid'?: string;
}
