import type { Meta, StoryObj } from '@storybook/react';
import { QuotationTrend } from './QuotationTrend';
import { quotationTrend } from '../../mocks/workspace.mock';

const meta: Meta<typeof QuotationTrend> = {
  title: 'Contract/QuotationTrend',
  component: QuotationTrend,
};
export default meta;

type Story = StoryObj<typeof QuotationTrend>;

export const Default: Story = {
  args: { trend: quotationTrend, 'data-testid': 'quotation-trend' },
};
