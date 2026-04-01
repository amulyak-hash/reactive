import { render } from '@testing-library/react';
import { ContractBars } from './ContractBars';
import { contractData } from '../../mocks/workspace.mock';

describe('ContractBars', () => {
  it('renders canvas element', () => {
    const { container } = render(
      <ContractBars contractors={contractData.contractors} data-testid="contract-bars" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid to root', () => {
    const { getByTestId } = render(
      <ContractBars contractors={contractData.contractors} data-testid="contract-bars" />
    );
    expect(getByTestId('contract-bars')).toBeTruthy();
  });
});
