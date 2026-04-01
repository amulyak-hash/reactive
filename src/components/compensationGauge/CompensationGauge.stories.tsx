import type { Meta, StoryObj } from '@storybook/react';
import { CompensationGauge } from './CompensationGauge';
import { nceCompensationData } from '../../mocks/workspace.mock';

const meta: Meta<typeof CompensationGauge> = {
  title: 'Contract/CompensationGauge',
  component: CompensationGauge,
};
export default meta;

type Story = StoryObj<typeof CompensationGauge>;

export const Default: Story = {
  args: {
    pct: nceCompensationData.pctConfirmed,
    confirmed: nceCompensationData.confirmed,
    total: nceCompensationData.total,
    'data-testid': 'compensation-gauge',
  },
};
