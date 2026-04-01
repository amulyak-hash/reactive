import { render } from '@testing-library/react';
import { CompensationGauge } from './CompensationGauge';
import { nceCompensationData } from '../../mocks/workspace.mock';

describe('CompensationGauge', () => {
  it('renders canvas', () => {
    const { container } = render(
      <CompensationGauge
        pct={nceCompensationData.pctConfirmed}
        confirmed={nceCompensationData.confirmed}
        total={nceCompensationData.total}
        data-testid="compensation-gauge"
      />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <CompensationGauge
        pct={nceCompensationData.pctConfirmed}
        confirmed={nceCompensationData.confirmed}
        total={nceCompensationData.total}
        data-testid="compensation-gauge"
      />
    );
    expect(getByTestId('compensation-gauge')).toBeTruthy();
  });
});
