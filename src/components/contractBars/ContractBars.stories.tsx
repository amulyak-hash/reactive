import type { Meta, StoryObj } from '@storybook/react';
import { ContractBars } from './ContractBars';
import { contractData } from '../../mocks/workspace.mock';

const meta: Meta<typeof ContractBars> = {
  title: 'Contract/ContractBars',
  component: ContractBars,
};
export default meta;

type Story = StoryObj<typeof ContractBars>;

export const Default: Story = {
  args: { contractors: contractData.contractors, 'data-testid': 'contract-bars' },
};
