import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tw } from '@twind/core';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { useAkashaStore, useNotifications, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import appRoutes, { PREFERENCES } from '../../../routes';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import getSDK from '@akashaorg/core-sdk';
import { UserSettingType } from '@akashaorg/core-sdk/src/common/notification/notification-schemas';
import { UserSetting } from '@pushprotocol/restapi/src/lib';
import AntennaSetting from './antenna-setting';
import UnlockCard from './unlock-card';
import ProfileSetting from './profile-setting';
import EnableAllSetting from './enable-all-setting';
import { findAppIndex, preferencesObjectFactory } from './utils';

export enum AppName {
  ANTENNA = 'Antenna App',
  PROFILE = 'Profile App',
  VIBES = 'Vibes App',
}

const DEFAULT_PREFERENCES: UserSettingType[] = preferencesObjectFactory(true); // Default setting on
const ANTENNA_ARR_INDEX = findAppIndex(AppName.ANTENNA, DEFAULT_PREFERENCES);
const PROFILE_ARR_INDEX = findAppIndex(AppName.PROFILE, DEFAULT_PREFERENCES);

const NotificationsPreferencesOption: React.FC = () => {
  const sdk = getSDK();
  const { notificationsEnabled, waitingForSignature, enableNotifications } = useNotifications();
  const { baseRouteName, uiEvents, getCorePlugins } = useRootComponentProps();
  const _uiEvents = React.useRef(uiEvents);
  const navigateTo = getCorePlugins().routing.navigateTo;
  const { t } = useTranslation('app-settings-ewa');
  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;

  const [preferences, setPreferences] = useState<UserSettingType[]>(DEFAULT_PREFERENCES);
  const [enableAllChecked, setEnableAllChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (notificationsEnabled) {
      sdk.services.common.notification.getSettingsOfUser().then(preferences => {
        if (preferences) {
          setPreferences(preferences);
        }
      });
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    setEnableAllChecked(
      preferences[ANTENNA_ARR_INDEX].enabled && preferences[PROFILE_ARR_INDEX].enabled,
    );
  }, [preferences]);

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

  const handleUnlockPreferences = async () => {
    const enabled = await enableNotifications();
    if (!enabled) {
      _uiEvents.current.next({
        event: NotificationEvents.ShowNotification,
        data: {
          type: NotificationTypes.Error,
          title: t('Couldn’t unlock preferences'),
          description: enabled ? undefined : t('Signature verification failed. Please try again.'),
        },
      });
    }
  };

  const handleToggleAll = (val: boolean) => {
    setPreferences(preferencesObjectFactory(val));
    setEnableAllChecked(val);
  };

  const handleSetPreference = (value: boolean, index: number) => {
    setPreferences(prevState =>
      prevState.map((item, idx) => (idx === index ? { ...item, enabled: value } : item)),
    );
  };

  const handleReset = () => {
    setPreferences(preferencesObjectFactory(false));
  };

  const handleSave = async () => {
    let success: boolean = undefined;
    setLoading(true);
    const preferencesPayload: UserSetting[] = preferences?.map(({ enabled }) => ({
      enabled,
    }));

    success = await sdk.services.common.notification.setSettings(preferencesPayload);

    _uiEvents.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: success ? NotificationTypes.Success : NotificationTypes.Error,
        title: success ? t('Notification preferences saved') : t('Couldn’t save preferences'),
        description: success ? undefined : t('Signature verification failed. Please try again.'),
      },
    });
    setLoading(false);
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

  return (
    <Stack spacing="gap-y-4" customStyle="mb-2">
      <Text variant="h5">{t('Notification Preferences')}</Text>
      {!notificationsEnabled && (
        <UnlockCard onClick={handleUnlockPreferences} loading={waitingForSignature} />
      )}

      <Card
        padding="pb-3"
        customStyle={tw(`${!notificationsEnabled && 'opacity-50 pointer-events-none'}`)}
      >
        <Stack padding="px-3 pb-6">
          <EnableAllSetting
            isSelected={enableAllChecked}
            onChange={e => handleToggleAll(e.target.checked)}
          />
          <Text variant="h6">{t('Default Extensions')}</Text>

          <ProfileSetting
            isSelected={preferences[PROFILE_ARR_INDEX].enabled}
            onChange={e => handleSetPreference(e.target.checked, PROFILE_ARR_INDEX)}
          />

          <AntennaSetting
            isSelected={preferences[ANTENNA_ARR_INDEX].enabled}
            onChange={e => handleSetPreference(e.target.checked, ANTENNA_ARR_INDEX)}
          />
        </Stack>

        {/* Buttons */}
        <Stack direction="row" customStyle="border(t-1 solid grey8 dark:grey5) pt-4 px-3">
          <Button
            onClick={handleReset}
            variant="text"
            size="md"
            color="dark:secondaryLight secondaryDark"
            label={t('Reset')}
            customStyle="ml-auto"
          />
          <Button
            onClick={handleSave}
            variant="primary"
            size="md"
            color="dark:secondaryLight secondaryDark"
            label={t('Save')}
            customStyle="ml-4"
            loading={loading}
          />
        </Stack>
      </Card>
    </Stack>
  );
};

export default NotificationsPreferencesOption;
