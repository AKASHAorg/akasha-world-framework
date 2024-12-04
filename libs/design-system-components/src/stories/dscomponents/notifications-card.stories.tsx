import type { Meta, StoryObj } from '@storybook/react';
import NotificationsCard, { NotificationCardProps } from '../../components/NotificationCard';
import React from 'react';
import { BoltIcon } from '@heroicons/react/24/outline';
import AppIcon from '@akashaorg/design-system-core/lib/components/AppIcon';
import { Antenna } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';

const meta: Meta<NotificationCardProps> = {
  title: 'DSComponents/Cards/NotificationsCard',
  component: NotificationsCard,
};

type Story = StoryObj<NotificationCardProps>;

export const Default: Story = {
  args: {
    title: 'New reflection',
    body: 'Someone reflected your beam',
    date: '1 hour ago',
    isSeen: true,
    notificationTypeIcon: <BoltIcon />,
    notificationTypeTitle: 'Activity',
    notificationAppIcon: (
      <AppIcon
        iconColor={{ light: 'secondaryLight', dark: 'secondaryDark' }}
        size={{ width: 16, height: 16 }}
        backgroundSize={32}
        placeholderIcon={<Antenna />}
        background={'grey5'}
        customStyle="min-w-[32px]"
        solid
      />
    ),
    ctaLinkUrl: 'Link',
    ctaLinkTitle: 'Go to reflection',
  },
};

export default meta;
