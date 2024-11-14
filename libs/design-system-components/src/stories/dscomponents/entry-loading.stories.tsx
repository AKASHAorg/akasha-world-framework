import type { Meta, StoryObj } from '@storybook/react';
import EntryLoading from '../../components/Profile/placeholders/entry-loading';

EntryLoading.displayName = 'EntryLoading';

const meta: Meta = {
  title: 'DSComponents/Loaders/Profile/EntryLoading',
  component: EntryLoading,
};

type Story = StoryObj;

export const Default: Story = {
  args: {},
};

export default meta;
