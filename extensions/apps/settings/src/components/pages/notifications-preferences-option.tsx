import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import PageLayout from './base-layout';
import { useAkashaStore, useRootComponentProps, useTheme } from '@akashaorg/ui-awf-hooks';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import appRoutes, { PREFERENCES } from '../../routes';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import {
  LockLight,
  LockDark,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';

const NotificationsPreferencesOption: React.FC = () => {
  const { theme } = useTheme();
  const { baseRouteName, getCorePlugins } = useRootComponentProps();
  const navigateTo = getCorePlugins().routing.navigateTo;
  const { t } = useTranslation('app-settings-ewa');
  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;
  const [loadingUnlock] = useState();

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${appRoutes[PREFERENCES]}`,
        }).toString()}`;
      },
    });
  };

  if (!isLoggedIn && !isAuthenticating) {
    return (
      <Stack>
        <ErrorLoader
          type={'not-authenticated'}
          title={t('Uh-oh! You are not connected!')}
          details={t('To check notifications preferences options you must be connected ⚡️')}
        >
          <Button
            label={t('Connect')}
            size="md"
            variant="primary"
            onClick={handleConnectButtonClick}
          />
        </ErrorLoader>
      </Stack>
    );
  }

  const unlockCard = (
    <Card background={{ light: 'grey9', dark: 'grey3' }} padding="p-3">
      <Stack direction="row" spacing="gap-x-3">
        {theme === 'Dark-Theme' ? <LockLight /> : <LockDark />}
        <Stack direction="column" spacing="gap-y-1">
          <Text variant="button-md" color={{ dark: 'white', light: 'black' }}>
            {t('Unlock preferences')}
          </Text>
          <Text variant="body2" color={{ dark: 'white', light: 'black' }}>
            {t('Click “Unlock” to unlock preferences. You will be prompted with 1 signature.')}
          </Text>
          {
            <Button
              onClick={() => {}}
              variant="text"
              size="md"
              color="dark:secondaryLight secondaryDark"
              label={t('Unlock')}
              customStyle="mr-auto"
              loading={loadingUnlock}
            />
          }
        </Stack>
      </Stack>
    </Card>
  );

  return <PageLayout title={t('Preferences')}>{unlockCard}</PageLayout>;
};

export default NotificationsPreferencesOption;
