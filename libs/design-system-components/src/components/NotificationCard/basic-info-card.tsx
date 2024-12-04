import React from 'react';

import Card from '@akashaorg/design-system-core/lib/components/Card';
import Image from '@akashaorg/design-system-core/lib/components/Image';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';

export type BasicInfoCardProps = {
  titleLabel: string;
  subtitleLabel?: string;
  image?: string;
  customStyle?: string;
};

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({
  titleLabel,
  subtitleLabel,
  image,
  customStyle = '',
}) => {
  return (
    <Card padding={'p-2'} customStyle={customStyle} elevation="none" border={false}>
      <Stack direction="column" align="center" justify="center" customStyle="mb-32">
        {image ? (
          <Image src={image} customStyle="w-[180px] h-[180px] m-auto my-4" />
        ) : (
          <Card
            customStyle="bg(grey8 dark:grey5) w-[180px] h-[180px] m-auto my-4"
            radius="rounded-xl"
          />
        )}
        <Stack customStyle="w-[70%] m-auto gap-4">
          {titleLabel && (
            <Text variant="h6" align="center">
              {titleLabel}
            </Text>
          )}

          {subtitleLabel && (
            <Text variant="subtitle2" align="center">
              {subtitleLabel}
            </Text>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
export default BasicInfoCard;
