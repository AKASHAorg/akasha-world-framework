import React from 'react';

import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Image from '@akashaorg/design-system-core/lib/components/Image';

export type NotificationSettingsCardProps = {
  // data
  title: string;
  text: string;
  imageSrc?: string;
  isLoading?: boolean;
  showButton?: boolean;
  // handlers
  handleButtonClick: () => void;
};

const NotificationSettingsCard: React.FC<NotificationSettingsCardProps> = ({
  title,
  text,
  isLoading,
  showButton = true,
  handleButtonClick,
}) => {
  return (
    <Card radius={16} customStyle="p-0 w-full grow flex-wrap">
      <Stack padding="p-5" align="center">
        <Image
          customStyle="w-[180px] h-[180px] object-contain mb-4"
          src={'/images/notificationapp-welcome-min.webp'}
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
            label="Go to Settings"
            variant="primary"
            size="md"
            customStyle="w-fit"
            loading={isLoading}
            onClick={handleButtonClick}
          />
        )}
      </Stack>
    </Card>
  );
};

export default NotificationSettingsCard;
