import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationTypes, NotificationEvents } from '@akashaorg/typings/lib/ui';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Toggle from '@akashaorg/design-system-core/lib/components/Toggle';
import PageLayout from './base-layout';
import { useAkashaStore, useNsfwToggling, useRootComponentProps } from '@akashaorg/ui-core-hooks';

const NsfwOption: React.FC = () => {
  const { t } = useTranslation('app-settings-ewa');

  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;

  const { getCorePlugins, uiEvents } = useRootComponentProps();
  const routingPlugin = useRef(getCorePlugins().routing);
  const _uiEvents = React.useRef(uiEvents);

  const { showNsfw, toggleShowNsfw } = useNsfwToggling();

  if (!isLoggedIn && !isAuthenticating) {
    // if not logged in, redirect to homepage
    routingPlugin.current?.navigateTo?.({
      appName: '@akashaorg/app-antenna',
      getNavigationUrl: () => '/',
    });
  }

  const handleNsfwToggle = () => {
    toggleShowNsfw(!showNsfw);
    const notifMsg = t(`NSFW Settings updated`);
    _uiEvents.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Success,
        title: notifMsg,
      },
    });
  };

  return (
    <PageLayout title={t('NSFW Content')}>
      <Stack padding="p-4">
        <Stack direction="row" justify="between" align="center" customStyle="mb-2">
          <Text weight="bold">{t('Show NSFW Content')}</Text>
          <Toggle checked={showNsfw} onChange={handleNsfwToggle} />
        </Stack>

        <Text>
          {t(
            'If you enable NSFW content, any sensitive content will show up in your search results when you lookup anything.',
          )}
        </Text>
      </Stack>
    </PageLayout>
  );
};

export default NsfwOption;
