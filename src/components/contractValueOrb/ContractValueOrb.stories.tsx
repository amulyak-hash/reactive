import type { Meta, StoryObj } from '@storybook/react';
import { ContractValueOrb } from './ContractValueOrb';
import { contractData } from '../../mocks/workspace.mock';

const meta: Meta<typeof ContractValueOrb> = {
  title: 'Contract/ContractValueOrb',
  component: ContractValueOrb,
};
export default meta;

type Story = StoryObj<typeof ContractValueOrb>;

export const Default: Story = {
  args: { data: contractData, 'data-testid': 'contract-value-orb' },
};
