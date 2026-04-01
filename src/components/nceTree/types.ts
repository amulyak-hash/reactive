import type { NCEContractorRow } from '../../types';

export interface NCETreeProps {
  total: number;
  byContractor: NCEContractorRow[];
  'data-testid'?: string;
}
