import type { Meta, StoryObj } from '@storybook/react';
import { StatusArc } from './StatusArc';
import { ewStatusData, ewSeverityData } from '../../mocks/workspace.mock';

const meta: Meta<typeof StatusArc> = {
  title: 'Contract/StatusArc',
  component: StatusArc,
};
export default meta;

type Story = StoryObj<typeof StatusArc>;

export const EWStatus: Story = {
  args: { segments: ewStatusData, title: 'Early Warning Status Split', 'data-testid': 'status-arc-ew' },
};

export const Severity: Story = {
  args: { segments: ewSeverityData, title: 'EW Severity Distribution', 'data-testid': 'status-arc-severity' },
};
