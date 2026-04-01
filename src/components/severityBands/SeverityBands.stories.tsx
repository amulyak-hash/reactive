import type { Meta, StoryObj } from '@storybook/react';
import { SeverityBands } from './SeverityBands';
import { ewSeverityData } from '../../mocks/workspace.mock';

const meta: Meta<typeof SeverityBands> = {
  title: 'Contract/SeverityBands',
  component: SeverityBands,
};
export default meta;

type Story = StoryObj<typeof SeverityBands>;

export const Default: Story = {
  args: { severities: ewSeverityData, 'data-testid': 'severity-bands' },
};
