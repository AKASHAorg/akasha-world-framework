import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAkashaStore, useNotifications, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { Cog8ToothIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';

import NotificationCard from '@akashaorg/design-system-components/lib/components/NotificationCard';
import BasicInfoCard from '@akashaorg/design-system-components/lib/components/NotificationCard/basic-info-card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import DynamicInfiniteScroll from '@akashaorg/design-system-components/lib/components/DynamicInfiniteScroll';

import { type InboxNotification } from '@akashaorg/typings/lib/ui';
import getSDK from '@akashaorg/core-sdk';
import NotificationSettingsCard from '@akashaorg/design-system-components/lib/components/NotificationSettingsCard';
import { getPresentationDataFromNotification } from '../utils/notifications-util';
import { UserSettingType } from '@akashaorg/typings/lib/sdk';

import { useGetAppsByPublisherDidQuery } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { selectApps } from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-by-publisher-did-query';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';

const NotificationsPage: React.FC = () => {
  const sdk = getSDK();
  const notificationService = sdk.services.common.notification;
  const { t } = useTranslation('app-notifications');
  const { baseRouteName, uiEvents, getCorePlugins, getDefaultExtensionNames } =
    useRootComponentProps();
  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;

  const defaultApps = getDefaultExtensionNames();
  const indexingDid = sdk.services.common.misc.getIndexingDID();
  const { data } = useGetAppsByPublisherDidQuery({
    variables: {
      id: indexingDid,
      first: defaultApps.length,
    },
    context: { source: sdk.services.gql.contextSources.default },
  });
  const apps = selectApps(data);

  const navigateTo = getCorePlugins().routing.navigateTo;
  const _uiEvents = useRef(uiEvents);

  // notification operations
  const [notifications, setNotifications] = useState<InboxNotification[]>([]);
  const [appOptions, setAppOptions] = useState<UserSettingType[]>([]);
  const { previouslyEnabled } = useNotifications();

  const [notificationLoading, setNotificationLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    const initData = async () => {
      /* Check first if the user has already subscribed to the channel */
      if (previouslyEnabled) {
        await notificationService.initialize();
        await getSubscribedAppsOptions();
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (appOptions.length > 0) {
      fetchNotifications();
    }
  }, [appOptions]);

  /**
   * On option change we need to fetch the notifications from that app.
   * If 'All' option is clicked then an empty array is sent.
   * The index of 'All' option is 0
   */
  const handleOptionChange = async (index: number) => {
    const updatedOptions = appOptions.map(option => ({
      ...option,
      active: option.index === index, // Set active true for the clicked button, false for others
    }));
    setCurrentPage(1);
    setNotifications([]);
    setAppOptions(updatedOptions);
  };

  /**
   *  Get the apps that the user has subscribed to
   *  Insert in the active options the option 'All' notifications which will fetch notification from each app
   *  */
  const getSubscribedAppsOptions = async () => {
    const userSettings = await sdk.services.common.notification.getSettingsOfUser();
    setAppOptions([
      {
        index: 0,
        appName: t('All'),
        active: true,
        enabled: false,
      },
      ...userSettings.filter(appOption => appOption.enabled),
    ]);
  };

  /**
   * Fetch notifications from Notification Service
   * Handle the pagination
   */
  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const fetchedNotifications = await notificationService.getNotifications(
        currentPage,
        20,
        appOptions.filter(option => option.index > 0 && option.active).map(option => option.index),
      );

      if (fetchedNotifications.length === 0) {
        setHasNextPage(false);
      } else {
        const formattedNotifications = fetchedNotifications.map(notification =>
          getPresentationDataFromNotification(notification, apps),
        );
        setCurrentPage(currentPage + 1);
        setNotifications([...notifications, ...formattedNotifications]);
      }
    } catch (error) {
      _uiEvents.current.next({
        event: NotificationEvents.ShowNotification,
        data: {
          type: NotificationTypes.Error,
          title: error instanceof Error ? error.message : t('An unexpected error occurred'),
        },
      });
    } finally {
      setNotificationLoading(false);
    }
  };

  const clickNotification = (notification: InboxNotification) => {
    navigateTo({
      appName: notification.appName,
      getNavigationUrl: () => notification.ctaLinkUrl,
    });
  };

  const goToSettings = () => {
    navigateTo?.({
      appName: '@akashaorg/app-settings-ewa',
      getNavigationUrl: navRoutes => navRoutes['Notifications'],
    });
  };

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/`,
        }).toString()}`;
      },
    });
  };

  if (!isLoggedIn) {
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
    <>
      <Stack direction="column" customStyle="pb-32">
        <Stack customStyle="pb-4 relative" direction="row">
          <Text variant="h5" align="center">
            <>{t('Notifications')}</>
          </Text>
          <Stack direction="column" spacing="gap-y-1" customStyle="absolute right-0">
            <Button
              iconOnly={true}
              variant="primary"
              icon={<Cog8ToothIcon />}
              greyBg={true}
              onClick={goToSettings}
            />
          </Stack>
        </Stack>
        {/** If the user has not subscribed to the notifications before show the button to navigate to settings*/}
        {!previouslyEnabled && (
          <NotificationSettingsCard
            image={'notificationsDefault'}
            isLoading={false}
            handleButtonClick={goToSettings}
            text={t('Receive personalised updates and community news.')}
            title={t('Turn on in-app notifications')}
            buttonLabel={t('Go to Settings')}
          />
        )}
        {/** If the user has previously subscribed show the App Options and notifications*/}
        {previouslyEnabled && (
          <>
            <Stack direction="row" spacing="gap-x-2" customStyle="pb-4">
              {appOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  active={option.active}
                  label={option.appName}
                  onClick={() => handleOptionChange(index)}
                ></Button>
              ))}
            </Stack>
            <Stack>
              {/** while notifications are being fetched show the spinner*/}
              {notifications.length === 0 && notificationLoading && <Spinner />}
              {/** if there is no notifications for this app option*/}
              {notifications.length === 0 && !notificationLoading && (
                <BasicInfoCard
                  titleLabel="No new notifications"
                  subtitleLabel="You’re all caught up! Any new notifications will appear here"
                  image={'/images/no-notifications-found.webp'}
                />
              )}
              <Card radius={16} customStyle="p-0">
                <DynamicInfiniteScroll
                  count={notifications.length}
                  overScan={8}
                  estimatedHeight={140}
                  hasNextPage={hasNextPage}
                  onLoadMore={async () => {
                    if (notificationLoading || !hasNextPage) return;
                    fetchNotifications();
                  }}
                >
                  {({ itemIndex }) => {
                    const notification = notifications[itemIndex];
                    return (
                      <Stack padding="pl-4 pr-4 pt-4 gap-y-4">
                        <Stack key={itemIndex} customStyle="flex-row">
                          <NotificationCard
                            onClick={() => clickNotification(notification)}
                            title={t(`{{title}}`, {
                              title: notification.title,
                            })}
                            body={t(`{{body}}`, {
                              body: notification.body,
                            })}
                            date={notification.date}
                            isSeen={notification.isSeen}
                            notificationTypeIcon={notification.notificationTypeIcon}
                            notificationTypeTitle={t(`{{notificationTypeTitle}}`, {
                              notificationTypeTitle: notification.notificationTypeTitle,
                            })}
                            notificationAppIcon={notification.notificationAppIcon}
                            ctaLinkTitle={
                              notification.ctaLinkTitle &&
                              t(`{{ctaLinkTitle}}`, {
                                ctaLinkTitle: notification.ctaLinkTitle,
                              })
                            }
                            ctaLinkUrl={notification.ctaLinkUrl}
                          />
                        </Stack>
                        {/* the last item does not need a divider */}
                        {itemIndex !== notifications.length - 1 && (
                          <Divider customStyle={`dark:border-grey5`} />
                        )}
                        {itemIndex == notifications.length - 1 && <Stack customStyle="pb-4" />}
                      </Stack>
                    );
                  }}
                </DynamicInfiniteScroll>
              </Card>
            </Stack>
          </>
        )}
      </Stack>
    </>
  );
};
export default NotificationsPage;
