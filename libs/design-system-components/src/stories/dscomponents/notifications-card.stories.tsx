import type { Meta, StoryObj } from '@storybook/react';
import NotificationsCard, { NotificationsCardProps } from '../../components/NotificationsCard';

const meta: Meta<NotificationsCardProps> = {
  title: 'DSComponents/Cards/NotificationsCard',
  component: NotificationsCard,
};

type Story = StoryObj<NotificationsCardProps>;

export const Default: Story = {
  args: {
    notifications: [],
    isFetching: false,
  },
};

export default meta;
