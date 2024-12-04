import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';

import {
  BoltIcon,
  GlobeAltIcon,
  RectangleGroupIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import {
  Antenna,
  Profile,
  Vibes,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';

import NotificationCard from '@akashaorg/design-system-components/lib/components/NotificationCard';
import BasicInfoCard from '@akashaorg/design-system-components/lib/components/NotificationsCard/basic-info-card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import AppIcon from '@akashaorg/design-system-core/lib/components/AppIcon';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import DynamicInfiniteScroll from '@akashaorg/design-system-components/lib/components/DynamicInfiniteScroll';

import { notificationFormatRelativeTime } from '@akashaorg/design-system-core/lib/utils';
import {
  type PushOrgNotification,
  type FollowNotificationMetaData,
  type MentionNotificationMetaData,
  type ReflectionNotificationMetaData,
  ChannelOptionIndexes,
} from '@akashaorg/typings/lib/sdk';
import { type InboxNotification } from '@akashaorg/typings/lib/ui';
import getSDK from '@akashaorg/core-sdk';

const placeholderIcons = {
  [ChannelOptionIndexes.ANTENNA]: <Antenna />,
  [ChannelOptionIndexes.PROFILE]: <Profile />,
  [ChannelOptionIndexes.VIBES]: <Vibes />,
};

const NotificationsPage: React.FC = () => {
  const sdk = getSDK();
  const notificationService = sdk.services.common.notification;
  const { t } = useTranslation('app-notifications');

  const { getCorePlugins } = useRootComponentProps();
  const navigateTo = getCorePlugins().routing.navigateTo;

  // notificationsStore
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      await notificationService.initialize();

      const fetchedNotifications = await notificationService.getNotifications(currentPage, 20);
      if (fetchedNotifications.length === 0) {
        setHasNextPage(false);
      } else {
        const formattedNotifications = [];
        for (const notification of fetchedNotifications) {
          formattedNotifications.push(getPresentationDataFromNotification(notification));
        }
        setCurrentPage(currentPage + 1);
        setNotifications([...notifications, ...formattedNotifications]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  const getPresentationDataFromNotification = (
    notification: PushOrgNotification,
  ): InboxNotification => {
    const returnObj: InboxNotification = {
      title: notification.payload.data.asub,
      body: notification.payload.data.amsg,
      // Title and icon for broadcast TBD decided in future iterations
      notificationTypeIcon: <GlobeAltIcon />,
      notificationTypeTitle: t('BROADCAST'),
      notificationAppIcon: null,
      ctaLinkTitle: null,
      ctaLinkUrl: null,
      date: '',
      isSeen: !notification.isUnread,
    };

    // Set notification type title and icon
    switch (notification.payload.data.type) {
      case 3:
        returnObj.notificationTypeTitle = t('ACTIVITY');
        returnObj.notificationTypeIcon = <BoltIcon />;
        break;
      case 4:
        // Title and icon for group TBD decided in future iterations
        returnObj.ctaLinkTitle = t('GROUP');
        returnObj.notificationTypeIcon = <RectangleGroupIcon />;
    }

    const parsedMetaData = notification.payload.data.parsedMetaData;
    // set CTA/button title and url to navigate
    switch (returnObj.title) {
      case 'New mention':
        const beamId = (parsedMetaData.data as MentionNotificationMetaData).beamID;
        returnObj.appName = '@akashaorg/app-antenna';
        returnObj.ctaLinkUrl = `/beam/${beamId}`;
        returnObj.ctaLinkTitle = t('View');
        break;
      case 'New follow':
        const profileId = (parsedMetaData.data as FollowNotificationMetaData).follower;
        returnObj.appName = '@akashaorg/app-profile';
        returnObj.ctaLinkUrl = `/${profileId}`;
        returnObj.ctaLinkTitle = t('Go to profile');
        break;
      case 'New reflection':
        const reflectionId = (parsedMetaData.data as ReflectionNotificationMetaData).reflectionID;
        returnObj.appName = '@akashaorg/app-antenna';
        returnObj.ctaLinkUrl = `/reflection/${reflectionId}`;
        returnObj.ctaLinkTitle = t('Go to reflection');
        break;
    }
    const placeholderIcon =
      // This case happens only if we sent notification from PushOrgDashboard
      placeholderIcons[parsedMetaData?.channelIndex || ChannelOptionIndexes.ANTENNA];

    returnObj.notificationAppIcon = (
      <AppIcon
        iconColor={{ light: 'secondaryLight', dark: 'secondaryDark' }}
        size={{ width: 16, height: 16 }}
        backgroundSize={32}
        placeholderIcon={placeholderIcon}
        background={'grey5'}
        customStyle="min-w-[32px]"
        solid
      />
    );

    if (notification.timestamp) {
      // Format notification time
      returnObj.date = notificationFormatRelativeTime(notification.timestamp.toString());
    }

    return returnObj;
  };

  const clickNotification = (notification: InboxNotification) => {
    navigateTo({
      appName: notification.appName,
      getNavigationUrl: () => notification.ctaLinkUrl,
    });
  };

  return (
    <>
      <Stack direction="column" customStyle="pb-32">
        <Stack customStyle="py-4" direction="row">
          <Text variant="h5" align="center">
            <>{t('Notifications')}</>
          </Text>
        </Stack>
        <Stack>
          {notifications.length === 0 && notificationLoading && <Spinner />}
          {notifications.length === 0 && !notificationLoading && (
            <BasicInfoCard
              titleLabel="No new notifications"
              subtitleLabel="You’re all caught up! Any new notifications will appear here"
              image={'/images/no-notifications-found.webp'}
            />
          )}
          <Card radius={16} customStyle="p-0">
            <DynamicInfiniteScroll
              count={notifications.length}
              overScan={8}
              estimatedHeight={140}
              hasNextPage={hasNextPage}
              onLoadMore={async () => {
                if (notificationLoading || !hasNextPage) return;
                await fetchNotifications();
              }}
            >
              {({ itemIndex }) => {
                const notification = notifications[itemIndex];
                return (
                  <Stack padding="pl-4 pr-4 pt-4 gap-y-4">
                    <Stack key={itemIndex} customStyle="flex-row">
                      <NotificationCard
                        onClick={clickNotification}
                        title={notification.title}
                        body={notification.body}
                        date={notification.date}
                        isSeen={notification.isSeen}
                        notificationTypeIcon={notification.notificationTypeIcon}
                        notificationTypeTitle={notification.notificationTypeTitle}
                        notificationAppIcon={notification.notificationAppIcon}
                        ctaLinkTitle={notification.ctaLinkTitle}
                        ctaLinkUrl={notification.ctaLinkUrl}
                      />
                    </Stack>
                    {/* the last item does not need a divider */}
                    {itemIndex !== notifications.length - 1 && (
                      <Divider customStyle={`dark:border-grey5`} />
                    )}
                    {itemIndex == notifications.length - 1 && <Stack customStyle="pb-4" />}
                  </Stack>
                );
              }}
            </DynamicInfiniteScroll>
          </Card>
        </Stack>
      </Stack>
    </>
  );
};
export default NotificationsPage;
