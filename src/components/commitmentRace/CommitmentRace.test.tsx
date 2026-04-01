import { render } from '@testing-library/react';
import { CommitmentRace } from './CommitmentRace';
import { contractData } from '../../mocks/workspace.mock';

describe('CommitmentRace', () => {
  it('renders canvas', () => {
    const { container } = render(
      <CommitmentRace contractors={contractData.contractors} data-testid="commitment-race" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <CommitmentRace contractors={contractData.contractors} data-testid="commitment-race" />
    );
    expect(getByTestId('commitment-race')).toBeTruthy();
  });
});
