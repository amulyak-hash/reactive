import { render } from '@testing-library/react';
import { ProjectDashboardPage } from './ProjectDashboardPage';

describe('ProjectDashboardPage', () => {
  it('renders the page root', () => {
    const { getByTestId } = render(<ProjectDashboardPage />);
    expect(getByTestId('project-dashboard-page')).toBeTruthy();
  });

  it('renders the header', () => {
    const { getByTestId } = render(<ProjectDashboardPage />);
    expect(getByTestId('project-dashboard-header')).toBeTruthy();
  });

  it('renders all 13 question sections', () => {
    const { getByTestId } = render(<ProjectDashboardPage />);
    for (let i = 1; i <= 13; i++) {
      expect(getByTestId(`dashboard-q${i}`)).toBeTruthy();
    }
  });

  it('renders all 13 visualizations', () => {
    const { getByTestId } = render(<ProjectDashboardPage />);
    const vizIds = [
      'viz-contract-value-orb',
      'viz-contract-bars',
      'viz-commitment-race',
      'viz-ew-status-arc',
      'viz-ew-category',
      'viz-contractor-rank',
      'viz-severity-bands',
      'viz-nce-tree',
      'viz-compensation-gauge',
      'viz-variation-split',
      'viz-quotation-balance',
      'viz-quotation-trend',
      'viz-weekly-flow',
    ];
    vizIds.forEach(id => expect(getByTestId(id)).toBeTruthy());
  });
});
