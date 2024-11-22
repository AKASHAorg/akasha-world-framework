import React from 'react';
import { useTranslation } from 'react-i18next';
import { tw } from '@twind/core';
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
  InfoLight,
  InfoDark,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import Checkbox from '@akashaorg/design-system-core/lib/components/Checkbox';

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

  const isDarkTheme = theme === 'Dark-Theme';
  const unlockCard = (
    <Card background={{ light: 'grey9', dark: 'grey3' }} padding="p-3">
      <Stack direction="row" spacing="gap-x-3">
        {isDarkTheme ? <LockLight /> : <LockDark />}
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
      <Text variant="h5">{t('Notification Preferences')}</Text>
      {!notificationsEnabled && unlockCard}

      <Card
        padding="pb-3"
        customStyle={tw(`${!notificationsEnabled && 'opacity-50 pointer-events-none'}`)}
      >
        <Stack padding="px-3 pb-6">
          {/* Enable all */}
          <Stack customStyle="border(b-1 solid grey8 dark:grey5) mb-4">
            <Stack direction="row" justify="between" align="center" customStyle="my-4">
              <Text variant="body1">{t('Enable all')}</Text>
              <Checkbox
                id="enable-all-notifications-checkbox"
                value="Enable all"
                name="enable-all"
                isSelected={true}
                handleChange={() => {}}
                size="large"
                customStyle="w-6 h-6"
              />
            </Stack>
          </Stack>
          <Text variant="h6">{t('Default Extensions')}</Text>
          {/* Profile */}
          <Stack customStyle="border(b-1 solid grey8 dark:grey5) mb-4 pb-4">
            <Stack direction="row" justify="between" align="center" customStyle="mt-4">
              <Text variant="body1">{t('Profile')}</Text>
              <Checkbox
                id="profile-checkbox"
                value="Profile"
                name="profile"
                isSelected={true}
                handleChange={() => {}}
                size="large"
                customStyle="w-6 h-6"
              />
            </Stack>

            <Text
              variant="footnotes2"
              weight="normal"
              customStyle="dark:text-grey6 text-grey4 mt-2"
            >
              {t('Get notifications about new followers')}
            </Text>
          </Stack>

          {/* Antenna */}
          <Stack>
            <Stack direction="row" justify="between" align="center">
              <Text variant="body1">{t('Antenna')}</Text>
              <Checkbox
                id="antenna-checkbox"
                value="Antenna"
                name="antenna"
                isSelected={true}
                handleChange={() => {}}
                size="large"
                customStyle="w-6 h-6"
              />
            </Stack>

            <Text
              variant="footnotes2"
              weight="normal"
              customStyle="dark:text-grey6 text-grey4 mt-2"
            >
              {t(
                'Get notifications about new reflections on your beams people you follow & your interests.',
              )}
            </Text>
            <Card padding="p-3" customStyle="mt-4" background={{ light: 'grey9', dark: 'grey3' }}>
              <Stack direction="row" spacing="gap-x-3">
                {isDarkTheme ? (
                  <InfoLight className="shrink-0" />
                ) : (
                  <InfoDark className="shrink-0" />
                )}
                <Text variant="body1" customStyle="text-sm">
                  {t('Changing notifications preferences requires a signature')}
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Stack>

        {/* Buttons */}
        <Stack direction="row" customStyle="border(t-1 solid grey8 dark:grey5) pt-4 px-3">
          <Button
            onClick={() => {}}
            variant="text"
            size="md"
            color="dark:secondaryLight secondaryDark"
            label={t('Reset')}
            customStyle="ml-auto"
            loading={waitingForSignature}
          />
          <Button
            onClick={() => {}}
            variant="primary"
            size="md"
            color="dark:secondaryLight secondaryDark"
            label={t('Save')}
            customStyle="ml-4"
            loading={waitingForSignature}
          />
        </Stack>
      </Card>
    </Stack>
  );
};

export default NotificationsPreferencesOption;
