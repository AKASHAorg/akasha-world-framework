import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import PageLayout from './base-layout';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';

const BrowserNotificationsOption: React.FC = () => {
  const { t } = useTranslation('app-settings-ewa');

  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;

  const { getCorePlugins } = useRootComponentProps();
  const routingPlugin = useRef(getCorePlugins().routing);

  if (!isLoggedIn && !isAuthenticating) {
    // if not logged in, redirect to homepage
    routingPlugin.current?.navigateTo?.({
      appName: '@akashaorg/app-antenna',
      getNavigationUrl: () => '/',
    });
  }

  return (
    <PageLayout title={t('Browser notifications')}>
      <Text>TODO - add content</Text>s
    </PageLayout>
  );
};

export default BrowserNotificationsOption;
