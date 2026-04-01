import type { QuotationSide } from '../../types';

export interface QuotationBalanceProps {
  accepted: QuotationSide;
  submitted: QuotationSide;
  'data-testid'?: string;
}
