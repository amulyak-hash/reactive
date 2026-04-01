import type { Meta, StoryObj } from '@storybook/react';
import { VariationSplit } from './VariationSplit';
import { variationByContractor } from '../../mocks/workspace.mock';

const meta: Meta<typeof VariationSplit> = {
  title: 'Contract/VariationSplit',
  component: VariationSplit,
};
export default meta;

type Story = StoryObj<typeof VariationSplit>;

export const Default: Story = {
  args: { contractors: variationByContractor, 'data-testid': 'variation-split' },
};
