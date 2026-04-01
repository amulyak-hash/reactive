import { render } from '@testing-library/react';
import { ContractValueOrb } from './ContractValueOrb';
import { contractData } from '../../mocks/workspace.mock';

describe('ContractValueOrb', () => {
  it('renders canvas element', () => {
    const { container } = render(
      <ContractValueOrb data={contractData} data-testid="contract-value-orb" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid to root element', () => {
    const { getByTestId } = render(
      <ContractValueOrb data={contractData} data-testid="contract-value-orb" />
    );
    expect(getByTestId('contract-value-orb')).toBeTruthy();
  });
});
