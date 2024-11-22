import React from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import {
  useAkashaStore,
  useNotifications,
  useRootComponentProps,
  useTheme,
} from '@akashaorg/ui-awf-hooks';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import appRoutes, { PREFERENCES } from '../../routes';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import {
  LockLight,
  LockDark,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';

const NotificationsPreferencesOption: React.FC = () => {
  const { theme } = useTheme();

  const { notificationsEnabled, waitingForSignature, enableNotifications } = useNotifications();
  const { baseRouteName, uiEvents, getCorePlugins } = useRootComponentProps();
  const _uiEvents = React.useRef(uiEvents);
  const navigateTo = getCorePlugins().routing.navigateTo;
  const { t } = useTranslation('app-settings-ewa');
  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;

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

  const handleUnlockPreferences = async () => {
    const enabled = await enableNotifications();
    _uiEvents.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: enabled ? NotificationTypes.Success : NotificationTypes.Error,
        title: enabled ? t('Notification preferences saved') : t('Couldn’t save preferences'),
        description: enabled ? undefined : t('Signature verification failed. Please try again.'),
      },
    });
  };

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
              onClick={handleUnlockPreferences}
              variant="text"
              size="md"
              color="dark:secondaryLight secondaryDark"
              label={t('Unlock')}
              customStyle="mr-auto"
              loading={waitingForSignature}
            />
          }
        </Stack>
      </Stack>
    </Card>
  );

  return (
    <Stack spacing="gap-y-4" customStyle="mb-2">
      <Text variant="h5">{t('Preferences')}</Text>
      {!notificationsEnabled && unlockCard}
      <Text variant="body2" color={{ dark: 'white', light: 'black' }}>
        {t('Rest of settings ...')}
      </Text>
    </Stack>
  );
};

export default NotificationsPreferencesOption;
