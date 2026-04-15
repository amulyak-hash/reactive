import type { NCEBudgetInsight, NCEEWInsight } from '../../types';

export interface NCEInsightPanelsProps {
  budget: NCEBudgetInsight;
  ew: NCEEWInsight;
  'data-testid'?: string;
}
