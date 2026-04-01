import { render } from '@testing-library/react';
import { StatusArc } from './StatusArc';
import { ewStatusData } from '../../mocks/workspace.mock';

describe('StatusArc', () => {
  it('renders canvas', () => {
    const { container } = render(
      <StatusArc segments={ewStatusData} data-testid="status-arc" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <StatusArc segments={ewStatusData} data-testid="status-arc" />
    );
    expect(getByTestId('status-arc')).toBeTruthy();
  });
});
