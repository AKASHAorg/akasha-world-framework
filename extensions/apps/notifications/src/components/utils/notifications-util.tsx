import AppIcon from '@akashaorg/design-system-core/lib/components/AppIcon';
import {
  Antenna,
  Profile,
  Vibes,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import {
  ChannelOptionIndexes,
  FollowNotificationMetaData,
  MentionNotificationMetaData,
  PushOrgNotification,
  ReflectionNotificationMetaData,
} from '@akashaorg/typings/lib/sdk';
import { InboxNotification } from '@akashaorg/typings/lib/ui';
import { BoltIcon, GlobeAltIcon, RectangleGroupIcon } from '@heroicons/react/24/outline';
import React from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/ro';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
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
  // set CTA/button title and url to navigate
  switch (returnObj.title) {
    case 'New mention':
      const beamId = (parsedMetaData.data as MentionNotificationMetaData).beamID;
      returnObj.appName = '@akashaorg/app-antenna';
      returnObj.ctaLinkUrl = `/beam/${beamId}`;
      returnObj.ctaLinkTitle = 'View';
      break;
    case 'New reflection':
      const reflectionId = (parsedMetaData.data as ReflectionNotificationMetaData).reflectionID;
      returnObj.appName = '@akashaorg/app-antenna';
      returnObj.ctaLinkUrl = `/reflection/${reflectionId}`;
      returnObj.ctaLinkTitle = 'Go to reflection';
      break;
    case 'New follow':
      const profileId = (parsedMetaData.data as FollowNotificationMetaData).follower;
      returnObj.appName = '@akashaorg/app-profile';
      returnObj.ctaLinkUrl = `/${profileId}`;
      returnObj.ctaLinkTitle = 'Go to profile';
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

const notificationFormatRelativeTime = (date: string, locale?: string) => {
  if (dayjs(date).isValid()) {
    let time = dayjs(date);
    if (/^[0-9]*$/.test(date)) {
      time = date.length > 10 ? dayjs(+date) : dayjs.unix(+date);
    }

    if (locale) {
      time = time.locale(locale);
    }

    const now = dayjs();
    if (time.isSame(now, 'day')) {
      // If the date is today
      return time.fromNow();
    } else if (time.isSame(now.subtract(1, 'day'), 'day')) {
      // If the date is yesterday
      return time.calendar(null, {
        lastDay: '[Yesterday] HH:mm',
      });
    } else {
      // If the date is before yesterday
      return time.format('DD MMM HH:mm');
    }
  }
  return '';
};
