import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import {
  BoltIcon,
  GlobeAltIcon,
  RectangleGroupIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import NotificationsCard from '@akashaorg/design-system-components/lib/components/NotificationsCard';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import getSDK from '@akashaorg/core-sdk';
import AppIcon from '@akashaorg/design-system-core/lib/components/AppIcon';
import { notificationFormatRelativeTime } from '@akashaorg/design-system-core/lib/utils';
import {
  PushOrgNotification,
  ChannelOptionIndexes,
  FollowNotificationMetaData,
  MentionNotificationMetaData,
  ReflectionNotificationMetaData,
} from '@akashaorg/typings/lib/sdk';
import { InboxNotification } from '@akashaorg/typings/lib/ui';
import {
  Antenna,
  Profile,
  Vibes,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
// import DynamicInfiniteScroll from '@akashaorg/design-system-components/lib/components/DynamicInfiniteScroll';

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

  /**
   * 1. Navigate the click +++
   * 2. Infitine scroll
   * 3. End of notifications +++
   * 4. Connect with DEV 493
   * 5. Testing for Notification card.
   * 6. Update notification card story
   * 7. Translate the notification title body +++
   * 8. Go to the top Element --Lux---
   */

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      await notificationService.initialize();
      const notifications = await notificationService.getNotifications();
      const formattedNotifications = [];
      for (const notification of notifications) {
        formattedNotifications.push(getPresentationDataFromNotification(notification));
      }
      setNotifications(formattedNotifications);
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

  if (notificationLoading) return <Spinner />;

  return (
    <>
      <Stack direction="column" customStyle="pb-32">
        <Stack customStyle="py-4" direction="row">
          <Text variant="h5" align="center">
            <>{t('Notifications')}</>
          </Text>
        </Stack>
        <Stack>
          <NotificationsCard
            notifications={notifications}
            isFetching={false}
            clickNotification={clickNotification}
          />
        </Stack>
      </Stack>
    </>
  );
};
export default NotificationsPage;
