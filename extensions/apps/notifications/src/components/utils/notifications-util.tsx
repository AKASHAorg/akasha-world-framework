import AppIcon from '@akashaorg/design-system-core/lib/components/AppIcon';
import {
  Antenna,
  Profile,
  Vibes,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import {
  ChannelOptionIndexes,
  NotificationMetaTypes,
  PushOrgNotification,
} from '@akashaorg/typings/lib/sdk';
import { InboxNotification } from '@akashaorg/typings/lib/ui';
import { BoltIcon, GlobeAltIcon, RectangleGroupIcon } from '@heroicons/react/24/outline';
import React from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/ro';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import { AkashaApp } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { formatRelativeDateTime } from '@akashaorg/design-system-core/lib/utils';
dayjs.extend(relativeTime);
dayjs.extend(calendar);
/**
 * Icons based on the APPs
 */
const placeholderIcons = {
  [ChannelOptionIndexes.ANTENNA]: <Antenna />,
  [ChannelOptionIndexes.PROFILE]: <Profile />,
  [ChannelOptionIndexes.VIBES]: <Vibes />,
};

/**
 * Transform notification, of type PushOrgNotification, to Inbox Notification
 * It adds the icons and other information based on the payload of the notification
 */
export const getPresentationDataFromNotification = (
  notification: PushOrgNotification,
  apps: AkashaApp[],
): InboxNotification => {
  // set Default data
  const returnObj: InboxNotification = {
    title: notification.payload.data.asub,
    body: notification.payload.data.amsg,
    // Title and icon for broadcast TBD decided in future iterations
    notificationTypeIcon: <GlobeAltIcon />,
    notificationTypeTitle: 'BROADCAST',
    notificationAppIcon: null,
    ctaLinkTitle: null,
    ctaLinkUrl: null,
    date: '',
    isSeen: !notification.isUnread,
    appName: '',
  };

  // Set notification type title and icon
  switch (notification.payload.data.type) {
    case 3:
      returnObj.notificationTypeTitle = 'ACTIVITY';
      returnObj.notificationTypeIcon = <BoltIcon />;
      break;
    case 4:
      // Title and icon for group TBD decided in future iterations
      returnObj.ctaLinkTitle = 'GROUP';
      returnObj.notificationTypeIcon = <RectangleGroupIcon />;
  }
  const parsedMetaData = notification.payload.data.parsedMetaData;
  const parsedData = parsedMetaData?.data;
  if (typeof parsedData !== 'string') {
    const linkDetails = generateLinkDetails(parsedData);
    if (linkDetails) {
      returnObj.appName = getAppName(parsedData.appId, apps);
      returnObj.ctaLinkUrl = linkDetails.url;
      returnObj.ctaLinkTitle = linkDetails.title;
    }
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
      customStyle="min-w-8"
      solid
    />
  );

  if (notification.timestamp) {
    // Format notification time
    returnObj.date = formatRelativeDateTime(notification.timestamp.toString());
  }

  return returnObj;
};

const generateLinkDetails = (
  data: NotificationMetaTypes,
): { url: string; title: string } | null => {
  switch (data.type) {
    case 'mention':
      return { url: `/beam/${data.beamID}`, title: 'View' };
    case 'reflection':
      return { url: `/reflection/${data.reflectionID}`, title: 'Go to reflection' };
    case 'following':
      return { url: `/${data.follower}`, title: 'Go to profile' };
    default:
      return null;
  }
};

const getAppName = (appId: string, apps: AkashaApp[]) => apps.find(app => app.id === appId)?.name;
