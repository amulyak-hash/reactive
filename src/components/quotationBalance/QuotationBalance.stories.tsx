import type { Meta, StoryObj } from '@storybook/react';
import { QuotationBalance } from './QuotationBalance';
import { quotationSummary } from '../../mocks/workspace.mock';

const meta: Meta<typeof QuotationBalance> = {
  title: 'Contract/QuotationBalance',
  component: QuotationBalance,
};
export default meta;

type Story = StoryObj<typeof QuotationBalance>;

export const Default: Story = {
  args: {
    accepted: quotationSummary.accepted,
    submitted: quotationSummary.submitted,
    'data-testid': 'quotation-balance',
  },
};
