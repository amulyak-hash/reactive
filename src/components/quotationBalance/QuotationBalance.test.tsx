import { render } from '@testing-library/react';
import { QuotationBalance } from './QuotationBalance';
import { quotationSummary } from '../../mocks/workspace.mock';

describe('QuotationBalance', () => {
  it('renders canvas', () => {
    const { container } = render(
      <QuotationBalance
        accepted={quotationSummary.accepted}
        submitted={quotationSummary.submitted}
        data-testid="quotation-balance"
      />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <QuotationBalance
        accepted={quotationSummary.accepted}
        submitted={quotationSummary.submitted}
        data-testid="quotation-balance"
      />
    );
    expect(getByTestId('quotation-balance')).toBeTruthy();
  });
});
