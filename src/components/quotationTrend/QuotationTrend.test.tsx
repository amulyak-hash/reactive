import { render } from '@testing-library/react';
import { QuotationTrend } from './QuotationTrend';
import { quotationTrend } from '../../mocks/workspace.mock';

describe('QuotationTrend', () => {
  it('renders canvas', () => {
    const { container } = render(
      <QuotationTrend trend={quotationTrend} data-testid="quotation-trend" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <QuotationTrend trend={quotationTrend} data-testid="quotation-trend" />
    );
    expect(getByTestId('quotation-trend')).toBeTruthy();
  });
});
