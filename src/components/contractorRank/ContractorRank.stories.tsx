import type { Meta, StoryObj } from '@storybook/react';
import { ContractorRank } from './ContractorRank';
import { ewOpenByContractor } from '../../mocks/workspace.mock';

const meta: Meta<typeof ContractorRank> = {
  title: 'Contract/ContractorRank',
  component: ContractorRank,
};
export default meta;

type Story = StoryObj<typeof ContractorRank>;

export const Default: Story = {
  args: { contractors: ewOpenByContractor, 'data-testid': 'contractor-rank' },
};
