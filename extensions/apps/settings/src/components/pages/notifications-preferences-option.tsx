import React, { useEffect, useState } from 'react';
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
import getSDK from '@akashaorg/core-sdk';
import { UserSettingType } from '@akashaorg/core-sdk/src/common/notification/notification-schemas';
import { UserSetting } from '@pushprotocol/restapi/src/lib';

const preferencesObjectFactory = (val: boolean): UserSettingType[] => {
  // Order of items in array determines the setting category in payload (PushOrg api requirement)
  return [
    {
      index: 1,
      appName: 'Antenna App',
      enabled: val,
    },
    {
      index: 2,
      appName: 'Profile App',
      enabled: val,
    },
    {
      index: 3,
      appName: 'Vibes App',
      enabled: val,
    }, 
  ];
};

const DEFAULT_PREFERENCES: UserSettingType[] = preferencesObjectFactory(true); // Default setting on
const ANTENNA_ARR_INDEX = DEFAULT_PREFERENCES.findIndex(e => e.appName == 'Antenna App');
const PROFILE_ARR_INDEX = DEFAULT_PREFERENCES.findIndex(e => e.appName == 'Profile App');

const NotificationsPreferencesOption: React.FC = () => {
  const sdk = getSDK();
  const { theme } = useTheme();
  const isDarkTheme = theme === 'Dark-Theme';
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
    _uiEvents.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: enabled ? NotificationTypes.Success : NotificationTypes.Error,
        title: enabled ? t('Notification preferences saved') : t('Couldn’t save preferences'),
        description: enabled ? undefined : t('Signature verification failed. Please try again.'),
      },
    });
  };

  const handleToggleAll = (val: boolean) => {
    setPreferences(preferencesObjectFactory(val));
    setEnableAllChecked(val);
  };

  const handleSetAntenna = (value: boolean) => {
    setPreferences(prevState =>
      prevState.map((item, idx) =>
        idx === ANTENNA_ARR_INDEX ? { ...item, enabled: value } : item,
      ),
    );
  };

  const handleSetProfile = (value: boolean) => {
    setPreferences(prevState =>
      prevState.map((item, idx) =>
        idx === PROFILE_ARR_INDEX ? { ...item, enabled: value } : item,
      ),
    );
  };

  const handleReset = () => {
    setPreferences(preferencesObjectFactory(false));
  };

  const handleSave = async () => {
    setLoading(true);
    const preferencesPayload: UserSetting[] = preferences?.map(({ enabled }) => ({
      enabled,
    }));
    await sdk.services.common.notification.setSettings(preferencesPayload);
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
        <UnlockCard
          onClick={handleUnlockPreferences}
          loading={waitingForSignature}
          isDarkTheme={isDarkTheme}
        />
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
            onChange={e => handleSetProfile(e.target.checked)}
          />

          <AntennaSetting
            isSelected={preferences[ANTENNA_ARR_INDEX].enabled}
            onChange={e => handleSetAntenna(e.target.checked)}
            isDarkTheme={isDarkTheme}
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

const AntennaSetting = ({ isSelected, onChange, isDarkTheme }) => {
  const { t } = useTranslation('app-settings-ewa');

  return (
    <Stack>
      <Stack direction="row" justify="between" align="center">
        <Text variant="body1">{t('Antenna')}</Text>
        <Checkbox
          id="antenna-checkbox"
          value="Antenna"
          name="antenna"
          isSelected={isSelected}
          handleChange={onChange}
          size="large"
          customStyle="w-6 h-6"
        />
      </Stack>

      <Text variant="footnotes2" weight="normal" customStyle="dark:text-grey6 text-grey4 mt-2">
        {t(
          'Get notifications about new reflections on your beams people you follow & your interests.',
        )}
      </Text>
      <Card padding="p-3" customStyle="mt-4" background={{ light: 'grey9', dark: 'grey3' }}>
        <Stack direction="row" spacing="gap-x-3">
          {isDarkTheme ? <InfoLight className="shrink-0" /> : <InfoDark className="shrink-0" />}
          <Text variant="body1" customStyle="text-sm">
            {t('Changing notifications preferences requires a signature')}
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
};

const ProfileSetting = ({ isSelected, onChange }) => {
  const { t } = useTranslation('app-settings-ewa');

  return (
    <Stack customStyle="border(b-1 solid grey8 dark:grey5) mb-4 pb-4">
      <Stack direction="row" justify="between" align="center" customStyle="mt-4">
        <Text variant="body1">{t('Profile')}</Text>
        <Checkbox
          id="profile-checkbox"
          value="Profile"
          name="profile"
          isSelected={isSelected}
          handleChange={onChange}
          size="large"
          customStyle="w-6 h-6"
        />
      </Stack>

      <Text variant="footnotes2" weight="normal" customStyle="dark:text-grey6 text-grey4 mt-2">
        {t('Get notifications about new followers')}
      </Text>
    </Stack>
  );
};

const EnableAllSetting = ({ isSelected, onChange }) => {
  const { t } = useTranslation('app-settings-ewa');

  return (
    <Stack customStyle="border(b-1 solid grey8 dark:grey5) mb-4">
      <Stack direction="row" justify="between" align="center" customStyle="my-4">
        <Text variant="body1">{t('Enable all')}</Text>
        <Checkbox
          id="enable-all-notifications-checkbox"
          value="Enable all"
          name="enable-all"
          isSelected={isSelected}
          handleChange={onChange}
          size="large"
          customStyle="w-6 h-6"
        />
      </Stack>
    </Stack>
  );
};

const UnlockCard = ({ isDarkTheme, loading, onClick }) => {
  const { t } = useTranslation('app-settings-ewa');

  return (
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

export default NotificationsPreferencesOption;
