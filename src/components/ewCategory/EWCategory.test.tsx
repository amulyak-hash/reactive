import { render } from '@testing-library/react';
import { EWCategory } from './EWCategory';
import { ewCategoryData } from '../../mocks/workspace.mock';

describe('EWCategory', () => {
  it('renders canvas', () => {
    const { container } = render(
      <EWCategory categories={ewCategoryData} data-testid="ew-category" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <EWCategory categories={ewCategoryData} data-testid="ew-category" />
    );
    expect(getByTestId('ew-category')).toBeTruthy();
  });
});
