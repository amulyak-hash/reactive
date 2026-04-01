import type { Meta, StoryObj } from '@storybook/react';
import { CommitmentRace } from './CommitmentRace';
import { contractData } from '../../mocks/workspace.mock';

const meta: Meta<typeof CommitmentRace> = {
  title: 'Contract/CommitmentRace',
  component: CommitmentRace,
};
export default meta;

type Story = StoryObj<typeof CommitmentRace>;

export const Default: Story = {
  args: { contractors: contractData.contractors, 'data-testid': 'commitment-race' },
};
