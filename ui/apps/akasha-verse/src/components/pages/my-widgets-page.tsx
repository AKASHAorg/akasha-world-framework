import * as React from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import AppList from '@akashaorg/design-system-components/lib/components/AppList';
import { useTranslation } from 'react-i18next';
import { RootComponentProps } from '@akashaorg/typings/ui';
import { GetAppsQuery, GetAppsByIdQuery } from '@akashaorg/typings/sdk/graphql-operation-types-new';
import { INFO } from '../../routes';

export interface IWidgetsPage extends RootComponentProps {
  availableApps?: GetAppsQuery['akashaAppIndex']['edges'];
  installedAppsInfo?: GetAppsByIdQuery['node'][];
  defaultIntegrations?: string[];
  isFetching?: boolean;
}

const MyWidgetsPage: React.FC<IWidgetsPage> = props => {
  const { worldConfig, availableApps, isFetching, plugins } = props;

  const { t } = useTranslation('app-akasha-verse');

  const defaultWidgetNamesNormalized = React.useMemo(() => {
    return worldConfig?.defaultWidgets.map(app => {
      if (typeof app === 'string') {
        return {
          name: app,
        };
      }
      return app;
    });
  }, [worldConfig.defaultWidgets]);

  // select default widgets from list of installed integrations
  const filteredDefaultWidgets = availableApps?.filter(app => {
    if (
      defaultWidgetNamesNormalized?.some(defaultWidget => defaultWidget.name === app.node?.name)
    ) {
      return app;
    }
  });

  const handleAppClick = appId => {
    plugins['@akashaorg/app-routing']?.routing?.navigateTo?.({
      appName: '@akashaorg/app-akasha-verse',
      getNavigationUrl: routes => `${routes[INFO]}/${appId}`,
    });
  };

  /*@TODO: replace with the relevant hook once it's ready */
  const dummyNewestWidgets = [
    {
      name: 'Widget 1',
      description:
        'Send direct messages to your followers or people who have this application, you must be following each other to be able to send messages.',
      action: <Button label="Install" variant="primary" />,
    },
    {
      name: 'Widget 2',
      description:
        'Add some custom emojis to your posts, replies, Articles or even in your messages. Just so you know, for people to be able to see these ...',
      action: <Button label="Install" variant="primary" />,
    },
  ];

  return (
    <Stack spacing="gap-y-4">
      <Text variant="h6">{t('Newest Widgets')}</Text>
      <AppList
        apps={dummyNewestWidgets}
        onAppSelected={() => {
          /*TODO: get app id from new hooks when they are ready and navigate to info page*/
        }}
      />
    </Stack>
  );
};

export default MyWidgetsPage;
