import type { Meta, StoryObj } from '@storybook/react';
import { EWCategory } from './EWCategory';
import { ewCategoryData } from '../../mocks/workspace.mock';

const meta: Meta<typeof EWCategory> = {
  title: 'Contract/EWCategory',
  component: EWCategory,
};
export default meta;

type Story = StoryObj<typeof EWCategory>;

export const Default: Story = {
  args: { categories: ewCategoryData, 'data-testid': 'ew-category' },
};
