import { render } from '@testing-library/react';
import { VariationSplit } from './VariationSplit';
import { variationByContractor } from '../../mocks/workspace.mock';

describe('VariationSplit', () => {
  it('renders canvas', () => {
    const { container } = render(
      <VariationSplit contractors={variationByContractor} data-testid="variation-split" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <VariationSplit contractors={variationByContractor} data-testid="variation-split" />
    );
    expect(getByTestId('variation-split')).toBeTruthy();
  });
});
