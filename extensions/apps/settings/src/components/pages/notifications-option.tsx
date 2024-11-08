import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import PageLayout from './base-layout';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { ISettingsItem, SettingsOption } from '../../utils/settings-items';

const notificationsSettingsItems: ISettingsItem[] = [
  {
    label: 'Browser Notifications',
    clickable: true,
  },
  {
    label: 'Preferences',
    clickable: true,
  },
];

const NotificationsOption: React.FC = () => {
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

  const handleSettingsOptionClick = (option: SettingsOption) => () => {
    return getCorePlugins().routing.navigateTo?.({
      appName: '@akashaorg/app-settings-ewa',
      getNavigationUrl: navRoutes => navRoutes[option],
    });
  };

  return (
    <PageLayout title={t('Notifications Settings')}>
      <Stack padding="p-4">
        {notificationsSettingsItems.map((item: ISettingsItem, idx: number) => {
          const baseStyle = `flex py-4 justify-between items-center ${
            idx !== notificationsSettingsItems.length - 1
              ? 'border(b-1 solid grey8 dark:grey5)'
              : 'border-none'
          }`;

          const children = (
            <>
              <Text>{`${t('{{itemLabel}}', { itemLabel: item.label as string })}`}</Text>
              {!item.isSubheading && <Icon icon={<ChevronRightIcon />} accentColor={true} />}
            </>
          );

          return (
            <React.Fragment key={`${idx}${item.label}`}>
              {item.clickable && (
                <Button
                  plain={true}
                  customStyle={`w-full ${baseStyle}`}
                  onClick={handleSettingsOptionClick(item.label)}
                >
                  {children}
                </Button>
              )}
              {!item.clickable && <Stack customStyle={baseStyle}>{children}</Stack>}
            </React.Fragment>
          );
        })}
      </Stack>
    </PageLayout>
  );
};

export default NotificationsOption;
