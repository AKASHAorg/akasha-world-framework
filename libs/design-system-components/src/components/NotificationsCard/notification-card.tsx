import * as React from 'react';

import Text from '@akashaorg/design-system-core/lib/components/Text';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import { InboxNotification } from '@akashaorg/typings/lib/ui';

export interface NotificationCardEventProps {
  onClick?: (notification: InboxNotification) => void;
}

type NotificationCardProps = NotificationCardEventProps & {
  notification: InboxNotification;
};

const NotificationCard = React.forwardRef((props: NotificationCardProps) => {
  const { onClick, notification } = props;
  const {
    title,
    body,
    isSeen,
    date,
    notificationTypeTitle,
    notificationTypeIcon,
    notificationAppIcon,
    ctaLinkUrl,
    ctaLinkTitle,
  } = notification;

  return (
    <Stack customStyle="flex flex-col w-full" spacing="gap-y-2">
      {/* Notification type & Is notification 'seen' dot indicator */}
      <Stack customStyle="flex flex-row items-center justify-between w-full">
        <Stack customStyle="flex flex-row" spacing="gap-x-2">
          <Icon
            size="sm"
            icon={notificationTypeIcon}
            color={{ dark: 'grey6', light: 'black' }}
            customStyle="space-x-1"
          />
          <Text variant="footnotes1" color={{ dark: 'grey6', light: 'grey4' }} weight="bold">
            {notificationTypeTitle}
          </Text>
        </Stack>
        {!isSeen && (
          <Stack
            customStyle="w-2 h-2 rounded-full"
            background={{ light: 'secondaryLight', dark: 'secondaryDark' }}
          />
        )}
      </Stack>
      <Stack customStyle="flex flex-row" spacing="gap-x-2">
        {/* Notification Icon based on the which app the notification has been recieved */}
        {notificationAppIcon}
        {/* Title and body */}
        <Stack customStyle="flex flex-column" spacing="gap-x-2">
          <Text variant="h6" breakWord={true}>
            {title}
          </Text>
          <Text
            variant="subtitle2"
            breakWord={true}
            weight="normal"
            color={{ dark: 'white', light: 'black' }}
          >
            {body}
          </Text>
        </Stack>
      </Stack>

      {/* Date and Button Section */}
      <Stack customStyle="flex flex-row justify-between items-center ml-10">
        <Text variant="footnotes2" color={{ dark: 'grey6', light: 'grey4' }}>
          {date}
        </Text>
        {ctaLinkUrl && (
          <Button plain={true} onClick={() => onClick(notification)}>
            <Stack>
              <Text
                variant="footnotes2"
                weight="bold"
                align="center"
                color={{ dark: 'secondaryDark', light: 'secondaryLight' }}
              >
                {ctaLinkTitle}
              </Text>
            </Stack>
          </Button>
        )}
      </Stack>
    </Stack>
  );
});

export default NotificationCard;
