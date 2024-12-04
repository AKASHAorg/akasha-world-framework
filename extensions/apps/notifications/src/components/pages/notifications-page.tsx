import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useRootComponentProps,
  useGetSettings,
  transformSource,
  useAkashaStore,
} from '@akashaorg/ui-awf-hooks';
import Menu, { MenuProps } from '@akashaorg/design-system-core/lib/components/Menu';
import {
  CheckCircleIcon,
  Cog8ToothIcon,
  EllipsisHorizontalIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import NotificationsCard from '@akashaorg/design-system-components/lib/components/NotificationsCard';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import DropDownFilter from '@akashaorg/design-system-components/lib/components/DropDownFilter';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { EntityTypes, NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import routes, { SETTINGS_PAGE, CUSTOMISE_NOTIFICATION_WELCOME_PAGE } from '../../routes';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import getSDK from '@akashaorg/core-sdk';
import { useNavigate } from '@tanstack/react-router';
import { ChannelOptionIndexes, UserSettingType } from '@akashaorg/typings/lib/sdk/notification';

export type Notification = {
  id: string;
  [key: string]: unknown;
};

const NotificationsPage: React.FC = () => {
  const sdk = getSDK();
  const { isLoading } = useGetSettings('@akashaorg/app-notifications');

  const { t } = useTranslation('app-notifications');
  const { uiEvents } = useRootComponentProps();
  const _uiEvents = useRef(uiEvents);

  // Fetch the notification Apps/options that the user is subscribed
  const [options, setSelectedOption] = React.useState([]);
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        // by default we fetch 'All' notifications from each app
        fetchNotification();
        // We fetch subscribed options/apps
        const subscribedApps = await getSubscribedAppsOptions();
        setSelectedOption(subscribedApps);
      } catch (error) {
        _uiEvents.current.next({
          event: NotificationEvents.ShowNotification,
          data: {
            type: NotificationTypes.Error,
            title: error.message,
          },
        });
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  /**
   * On option change we need to fetch the notifications from that app.
   * If 'All' option is clicked then an empty array is sent.
   * The index of 'All' option is 0
   */
  const handleOptionChange = index => {
    const updatedOptions = options.map((option, i) => ({
      ...option,
      active: i === index, // Set active true for the clicked button, false for others
    }));
    setSelectedOption(updatedOptions);
    fetchNotification(index ? [index] : []);
  };

  /**
   *  Get the apps that the user has subscribed to
   *  Insert in the active options the option 'All' notifications which will fetch notification from each app
   *  */
  const getSubscribedAppsOptions = async (): Promise<UserSettingType[]> => {
    const userSettings = await sdk.services.common.notification.getSettingsOfUser();
    const activeOptions = userSettings.filter(appOption => appOption.enabled);
    activeOptions.unshift({
      index: 0,
      appName: t('All'),
      active: true,
      enabled: false,
    });
    return activeOptions;
  };

  /**
   * Fetch notification by specifying the array of ChannelOptionIndexes / Application indexes
   * If no array or an empty array is sent then the get notification will return notifications from all apps
   */
  const fetchNotification = async (optionsIndexes?: ChannelOptionIndexes[]) => {
    const notifications = await sdk.services.common.notification.getNotifications(
      1,
      10,
      optionsIndexes ? optionsIndexes : [],
    );
    // TODO: update the notifications and rerender
    return notifications || [];
  };

  if (isLoading) return <Spinner />;
  return (
    <>
      <Stack direction="column" customStyle="pb-32 h-[calc(100vh-88px)]">
        <Stack customStyle="py-4 relative w-full" direction="row">
          <Text variant="h5" align="center">
            <>{t('Notifications')}</>
          </Text>
        </Stack>
        <Stack direction="row" spacing="gap-x-2">
          {options.map((option, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              active={option.active}
              label={option.appName}
              onClick={() => handleOptionChange(index)}
            ></Button>
          ))}
          {loadingOptions && (
            <Stack align="center" justify="center">
              <Spinner />
            </Stack>
          )}
        </Stack>
      </Stack>
    </>
  );
};
export default NotificationsPage;
