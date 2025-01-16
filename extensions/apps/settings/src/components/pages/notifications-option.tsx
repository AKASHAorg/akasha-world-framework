import React from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import PageLayout from './base-layout';
import { useAkashaStore, useRootComponentProps, useNotifications } from '@akashaorg/ui-core-hooks';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { ISettingsItem, SettingsOption } from '../../utils/settings-items';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import NotificationSettingsCard from '@akashaorg/design-system-components/lib/components/NotificationSettingsCard';
import appRoutes, { NOTIFICATIONS } from '../../routes';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';

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
  const { baseRouteName, uiEvents, getCorePlugins } = useRootComponentProps();
  const { t } = useTranslation('app-settings-ewa');
  const _uiEvents = React.useRef(uiEvents);
  const navigateTo = getCorePlugins().routing.navigateTo;
  const { notificationsEnabled, waitingForSignature, enableNotifications } = useNotifications();

  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;

  const TOAST_TEXTS = {
    success: {
      title: t('In-app notifications enabled'),
      description: t('Notifications for all default apps are enabled. Manage them in preferences.'),
    },
    error: {
      title: t('Couldn’t enable notifications'),
      description: t('Signature verification failed. Please try again.'),
    },
  };

  const handleSettingsOptionClick = (option: SettingsOption) => () => {
    return getCorePlugins().routing.navigateTo?.({
      appName: '@akashaorg/app-settings-ewa',
      getNavigationUrl: navRoutes => navRoutes[option],
    });
  };

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${appRoutes[NOTIFICATIONS]}`,
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
          details={t('To check notifications options you must be connected ⚡️')}
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

  const handleEnableNotifications = async () => {
    const result: keyof typeof TOAST_TEXTS = (await enableNotifications()) ? 'success' : 'error';

    _uiEvents.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: result == 'success' ? NotificationTypes.Success : NotificationTypes.Error,
        title: TOAST_TEXTS[result].title,
        description: TOAST_TEXTS[result].description,
      },
    });
  };

  return (
    <PageLayout title={t('Notifications Settings')}>
      {!notificationsEnabled && (
        <Stack padding="p-4">
          <NotificationSettingsCard
            image={'notificationsDefault'}
            isLoading={waitingForSignature}
            noWrapperCard={true}
            handleButtonClick={handleEnableNotifications}
            text={t('You’ll be prompted with 1 signature')}
            title={t('Turn on in-app notifications')}
            buttonLabel={t('Turn on')}
          />
        </Stack>
      )}
      {notificationsEnabled && (
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
              <React.Fragment key={`${item.label}`}>
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
      )}
    </PageLayout>
  );
};

export default NotificationsOption;
