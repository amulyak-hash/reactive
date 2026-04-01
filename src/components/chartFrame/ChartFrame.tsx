import type { ReactNode } from 'react';

import type { ChartFrameProps } from '../../types';

export function ChartFrame({ children, className = '' }: ChartFrameProps) {
  return <div className={`d3-chart ${className}`.trim()}>{children}</div>;
}
