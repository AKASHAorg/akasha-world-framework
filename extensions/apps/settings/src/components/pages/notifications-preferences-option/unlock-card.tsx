import React from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { Lock } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';

export interface IUnlockCardProps {
  // data
  loading?: boolean;
  // handlers
  onClick?: () => void;
}

const UnlockCard: React.FC<IUnlockCardProps> = ({ onClick, loading }) => {
  const { t } = useTranslation('app-settings-ewa');

  return (
    <Card background={{ light: 'grey9', dark: 'grey3' }} padding="p-3">
      <Stack direction="row" spacing="gap-x-3">
        <Icon
          icon={<Lock />}
          size="md"
          solid={true}
          color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
        />
        <Stack direction="column" spacing="gap-y-1">
          <Text variant="button-md" color={{ dark: 'white', light: 'black' }}>
            {t('Unlock preferences')}
          </Text>
          <Text variant="body2" color={{ dark: 'white', light: 'black' }}>
            {t('Click “Unlock” to unlock preferences. You will be prompted with 1 signature.')}
          </Text>
          {
            <Button
              onClick={onClick}
              variant="text"
              size="md"
              color="dark:secondaryLight secondaryDark"
              label={t('Unlock')}
              customStyle="mr-auto"
              loading={loading}
            />
          }
        </Stack>
      </Stack>
    </Card>
  );
};

export default UnlockCard;
