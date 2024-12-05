import React from 'react';

import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Image from '@akashaorg/design-system-core/lib/components/Image';

const IMAGES = {
  notificationsDefault: '/images/notificationapp-welcome-min.webp',
  browserDefault: '/images/notification-browser.webp',
  browserEnabled: '/images/notification-browser-enabled.webp',
  browserDisabled: '/images/notification-browser-disabled.webp',
  noNotifications: '/images/notificationapp-welcome-min.webp',
};

export type NotificationsImageSrc = keyof typeof IMAGES;

export type NotificationSettingsCardProps = {
  // data
  title: string;
  text: string;
  image?: NotificationsImageSrc;
  isLoading?: boolean;
  showButton?: boolean;
  buttonLabel?: string;
  noWrapperCard?: boolean;
  // handlers
  handleButtonClick: () => void;
};

const NotificationSettingsCard: React.FC<NotificationSettingsCardProps> = ({
  title,
  text,
  image = IMAGES.notificationsDefault,
  isLoading,
  buttonLabel,
  noWrapperCard,
  showButton = true,
  handleButtonClick,
}) => {
  const content = (
    <Stack padding="p-5" align="center">
      <Image
        customStyle="w-[180px] h-[180px] object-contain mb-4"
        src={IMAGES[image]}
        alt="Notification illustration"
      />
      <Text variant="h5" customStyle="mb-2 text-center">
        {title}
      </Text>
      <Text variant="body2" customStyle="mb-4 text-center">
        {text}
      </Text>

      {showButton && (
        <Button
          label={buttonLabel}
          variant="primary"
          size="md"
          customStyle="w-fit"
          loading={isLoading}
          onClick={handleButtonClick}
        />
      )}
    </Stack>
  );

  return noWrapperCard ? (
    content
  ) : (
    <Card radius={16} customStyle="p-0 w-full grow flex-wrap">
      {content}
    </Card>
  );
};

export default NotificationSettingsCard;
