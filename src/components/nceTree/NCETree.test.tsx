import { render } from '@testing-library/react';
import { NCETree } from './NCETree';
import { nceByContractor, nceCompensationData } from '../../mocks/workspace.mock';

describe('NCETree', () => {
  it('renders canvas', () => {
    const { container } = render(
      <NCETree total={nceCompensationData.total} byContractor={nceByContractor} data-testid="nce-tree" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <NCETree total={nceCompensationData.total} byContractor={nceByContractor} data-testid="nce-tree" />
    );
    expect(getByTestId('nce-tree')).toBeTruthy();
  });
});
