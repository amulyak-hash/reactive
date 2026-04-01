import type { Meta, StoryObj } from '@storybook/react';
import { WeeklyFlow } from './WeeklyFlow';
import { contractData } from '../../mocks/workspace.mock';

const meta: Meta<typeof WeeklyFlow> = {
  title: 'Contract/WeeklyFlow',
  component: WeeklyFlow,
};
export default meta;

type Story = StoryObj<typeof WeeklyFlow>;

export const Default: Story = {
  args: { contractors: contractData.contractors, 'data-testid': 'weekly-flow' },
};
