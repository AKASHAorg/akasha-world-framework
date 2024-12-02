import React from 'react';

import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';

import BasicInfoCard from './basic-info-card';
import NotificationCard from './notification-card';

import { InboxNotification } from '@akashaorg/typings/lib/ui';

export type NotificationsCardProps = {
  notifications: InboxNotification[];
  isFetching?: boolean;
  clickNotification?: (notification: InboxNotification) => void;
};

const NotificationsCard: React.FC<NotificationsCardProps> = props => {
  const { notifications, isFetching, clickNotification } = props;

  const renderNotificationCard = (inboxNotification: InboxNotification, index: number) => {
    return (
      <Stack
        key={index}
        padding="pl-4 pr-4 pt-4 gap-y-4"
        customStyle={`${index === notifications.length - 1 ? 'basis-full' : ''}`}
      >
        <Stack key={index} customStyle="flex-row">
          <NotificationCard notification={inboxNotification} onClick={clickNotification} />
        </Stack>
        {index !== notifications.length - 1 && <Divider customStyle={`dark:border-grey5`} />}
        {index == notifications.length - 1 && <Stack customStyle="pb-4" />}
      </Stack>
    );
  };

  return (
    <Card radius={16} customStyle="p-0">
      {!isFetching && notifications.length === 0 && (
        <BasicInfoCard
          titleLabel="No new notifications"
          subtitleLabel="You’re all caught up! Any new notifications will appear here"
          image={'/images/no-notifications-found.webp'}
        />
      )}
      {notifications.length !== 0 && (
        <>
          {notifications.map((notif: InboxNotification, index: number) =>
            renderNotificationCard(notif, index),
          )}
        </>
      )}
      {isFetching && (
        <Stack padding="py-4">
          <Spinner />
        </Stack>
      )}
    </Card>
  );
};

export default NotificationsCard;
