import { render } from '@testing-library/react';
import { ContractorRank } from './ContractorRank';
import { ewOpenByContractor } from '../../mocks/workspace.mock';

describe('ContractorRank', () => {
  it('renders canvas', () => {
    const { container } = render(
      <ContractorRank contractors={ewOpenByContractor} data-testid="contractor-rank" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <ContractorRank contractors={ewOpenByContractor} data-testid="contractor-rank" />
    );
    expect(getByTestId('contractor-rank')).toBeTruthy();
  });
});
