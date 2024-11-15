import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from './base-layout';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import appRoutes, { BROWSER_NOTIFICATIONS } from '../../routes';
import NotificationSettingsCard, {
  NotificationsImageSrc,
} from '@akashaorg/design-system-components/lib/components/NotificationSettingsCard';
import getSDK from '@akashaorg/core-sdk';

type BrowserNotificationsState = 'default' | 'enabled' | 'disabled';
type StatesContents = {
  [key in BrowserNotificationsState]: {
    title: string;
    description: string;
    image: NotificationsImageSrc;
  };
};

const BrowserNotificationsOption: React.FC = () => {
  const sdk = getSDK();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrowserNotificationsState>('default');

  const { baseRouteName, getCorePlugins } = useRootComponentProps();
  const navigateTo = getCorePlugins().routing.navigateTo;
  const { t } = useTranslation('app-settings-ewa');
  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;

  const STATES_CONTENT: StatesContents = {
    default: {
      title: t('Turn on browser notifications'),
      description: t('You will see a browser prompt to allow notifications'),
      image: 'browserDefault',
    },
    enabled: {
      title: t('Browser notifications Enabled'),
      description: t('You can disable them from your browser’s settings at any time.'),
      image: 'browserEnabled',
    },
    disabled: {
      title: t('Browser notifications disabled'),
      description: t('You can enable them from your browser’s settings at any time.'),
      image: 'browserDisabled',
    },
  };

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${appRoutes[BROWSER_NOTIFICATIONS]}`,
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
          details={t('To check browser notifications options you must be connected ⚡️')}
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

  const handleEnableBrowserNotifications = async () => {
    setLoading(true);
    const initResult = await sdk.api.profile.enableBrowserNotifications();
    setResult(initResult ? 'enabled' : 'disabled');
    setLoading(false);
  };

  return (
    <PageLayout title={t('Browser notifications')}>
      <Stack padding="p-4">
        <NotificationSettingsCard
          isLoading={loading}
          handleButtonClick={handleEnableBrowserNotifications}
          text={STATES_CONTENT[result].description}
          title={STATES_CONTENT[result].title}
          image={STATES_CONTENT[result].image}
          showButton={result === 'default'}
          buttonLabel={t('Turn on')}
        />
      </Stack>
    </PageLayout>
  );
};

export default BrowserNotificationsOption;
