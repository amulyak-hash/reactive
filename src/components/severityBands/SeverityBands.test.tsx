import { render } from '@testing-library/react';
import { SeverityBands } from './SeverityBands';
import { ewSeverityData } from '../../mocks/workspace.mock';

describe('SeverityBands', () => {
  it('renders canvas', () => {
    const { container } = render(
      <SeverityBands severities={ewSeverityData} data-testid="severity-bands" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <SeverityBands severities={ewSeverityData} data-testid="severity-bands" />
    );
    expect(getByTestId('severity-bands')).toBeTruthy();
  });
});
