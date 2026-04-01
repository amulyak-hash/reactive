import type { Meta, StoryObj } from '@storybook/react';
import { NCETree } from './NCETree';
import { nceByContractor, nceCompensationData } from '../../mocks/workspace.mock';

const meta: Meta<typeof NCETree> = {
  title: 'Contract/NCETree',
  component: NCETree,
};
export default meta;

type Story = StoryObj<typeof NCETree>;

export const Default: Story = {
  args: {
    total: nceCompensationData.total,
    byContractor: nceByContractor,
    'data-testid': 'nce-tree',
  },
};
