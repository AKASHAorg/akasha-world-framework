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

  const notificationsEnabled2 = true;

  return (
    <Stack spacing="gap-y-4" customStyle="mb-2">
      <Text variant="h5">{t('Notification Preferences')}</Text>
      {!notificationsEnabled2 && unlockCard}

      <Card
        padding="pb-3"
        customStyle={tw(`${!notificationsEnabled2 && 'opacity-50 pointer-events-none'}`)}
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
                <svg
                  width="20"
                  height="24"
                  viewBox="0 0 20 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.875 12C1.875 7.51269 5.51269 3.875 10 3.875C14.4873 3.875 18.125 7.51269 18.125 12C18.125 16.4873 14.4873 20.125 10 20.125C5.51269 20.125 1.875 16.4873 1.875 12ZM9.1302 10.7987C10.0854 10.3211 11.1609 11.1839 10.9019 12.2199L10.3111 14.5833L10.3456 14.566C10.6544 14.4116 11.0298 14.5368 11.1842 14.8455C11.3385 15.1542 11.2134 15.5297 10.9046 15.684L10.8701 15.7013C9.91488 16.1789 8.83936 15.3162 9.09838 14.2801L9.68922 11.9167L9.65465 11.934C9.34591 12.0884 8.97049 11.9633 8.81612 11.6545C8.66175 11.3458 8.78689 10.9704 9.09563 10.816L9.1302 10.7987ZM10 9.5C10.3452 9.5 10.625 9.22018 10.625 8.875C10.625 8.52982 10.3452 8.25 10 8.25C9.65482 8.25 9.375 8.52982 9.375 8.875C9.375 9.22018 9.65482 9.5 10 9.5Z"
                    fill="#BA9AE0"
                  />
                </svg>

                <Text variant="body1" customStyle='text-sm'>
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
