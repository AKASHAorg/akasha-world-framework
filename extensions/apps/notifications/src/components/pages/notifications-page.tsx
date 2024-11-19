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
  const [showMenu, setShowMenu] = useState(false);

  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;

  const navigate = useNavigate();

  const { data, isLoading } = useGetSettings('@akashaorg/app-notifications');

  const { t } = useTranslation('app-notifications');
  const { getCorePlugins, uiEvents } = useRootComponentProps();

  const navigateTo = getCorePlugins().routing.navigateTo;

  const _uiEvents = useRef(uiEvents);

  // mock data used for displaying something. Change when there's real data
  const allNotifications: Notification[] = [
    {
      id: '1',
      body: {
        value: {
          author: {
            name: 'Dr. Flynn',
            userName: 'thedrflynn',
            ethAddress: '0x003410490050000320006570034567114572000',
            avatar: { url: 'https://placebeard.it/360x360' },
          },
          follower: {
            name: 'Dr. Flynn',
            userName: 'thedrflynn',
            ethAddress: '0x003410490050000320006570034567114572000',
            avatar: { url: 'https://placebeard.it/360x360' },
          },
          postID: '01f3st44m5g3tc6419b92zyd21',
        },
        property: 'POST_MENTION',
      },
      createdAt: Date.now(),
    },
    {
      id: '2',
      body: {
        value: {
          author: {
            name: 'Dr. Cat',
            userName: 'thedrCat',
            ethAddress: '0x003410490050000320006570034567114572000',
            avatar: { url: 'https://placebeard.it/360x360' },
          },
          follower: {
            name: 'Dr. Flynn',
            userName: 'thedrflynn',
            ethAddress: '0x003410490050000320006570034567114572000',
            avatar: { url: 'https://placebeard.it/360x360' },
          },
          postID: '01f3st44m5g3tc6419b92zyd21',
        },
        property: 'POST_MENTION',
      },
      createdAt: Date.now(),
    },
    {
      id: '3',
      body: {
        value: {
          author: {
            name: 'Dr. Cat',
            userName: 'thedrCat',
            ethAddress: '0x003410490050000320006570034567114572000',
            avatar: { url: 'https://placebeard.it/360x360' },
          },
          follower: {
            name: 'Dr. Flynn',
            userName: 'thedrflynn',
            ethAddress: '0x003410490050000320006570034567114572000',
            avatar: { url: 'https://placebeard.it/360x360' },
          },
          postID: '01f3st44m5g3tc6419b92zyd21',
        },
        property: 'POST_MENTION',
      },
      createdAt: Date.now(),
      read: true,
    },
  ]; // notifReq.data;

  const unreadNotifications = allNotifications?.filter(notif => notif.read === undefined);
  const readNotifications = allNotifications?.filter(notif => notif.read === true);

  const handleAvatarClick = (id: string) => {
    navigateTo?.({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: navRoutes => `${navRoutes.rootRoute}/${id}`,
    });
  };

  const handleEntryClick = (itemId: string, itemType: EntityTypes) => {
    if (itemType === EntityTypes.BEAM) {
      navigateTo?.({
        appName: '@akashaorg/app-antenna',
        getNavigationUrl: navRoutes => `${navRoutes.Post}/${itemId}`,
      });
    } else if (itemType === EntityTypes.REFLECT) {
      navigateTo?.({
        appName: '@akashaorg/app-antenna',
        getNavigationUrl: navRoutes => `${navRoutes.Reply}/${itemId}`,
      });
    }
  };
  // Fetch the notification Apps/options that the user is subscribed
  const [options, setSelectedOption] = React.useState([]);
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        // by default we fetch 'All' notifications from each app
        fetchNotification();
        // We fetch available options from sdk
        const activeOptions = await getActiveOptions();
        setSelectedOption(activeOptions);
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
  const getActiveOptions = async (): Promise<UserSettingType[]> => {
    await sdk.services.common.notification.initialize();
    const activeOptions = await sdk.services.common.notification.getSettingsOfUser();
    activeOptions.unshift({
      index: 0,
      appName: t('All'),
      active: true,
      enabled: false,
    });
    return activeOptions;
  };

  const markAllAsRead = () => {
    unreadNotifications.map(() => {
      // @TODO to be implemented
    });
    setShowMenu(!showMenu);

    _uiEvents.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Success,
        title: 'Marked all as read successfully.',
      },
    });
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

  const redirectToSettingsPage = () => {
    // go to customization page
    navigate({ to: routes[SETTINGS_PAGE] });
  };

  const dropDownActions: MenuProps['items'] = [
    {
      label: 'Mark all as read',
      icon: <CheckCircleIcon />,
      onClick: () => markAllAsRead(),
    },
    {
      label: 'Settings',
      icon: <Cog8ToothIcon />,
      onClick: () => redirectToSettingsPage(),
    },
  ];

  if (isLoading) return <Spinner />;

  if (!isLoggedIn || !data) {
    navigate({ to: routes[CUSTOMISE_NOTIFICATION_WELCOME_PAGE] });
  }

  const filterShownNotifications = (selectedOption: number) => {
    switch (selectedOption) {
      case 0:
        return allNotifications;
      case 1:
        return unreadNotifications;
      case 2:
        return readNotifications;
      default:
        return null;
    }
  };
  return (
    <>
      <Stack direction="column" customStyle="pb-32 h-[calc(100vh-88px)]">
        <Stack customStyle="py-4 relative w-full" direction="row">
          <Text variant="h5" align="center">
            <>{t('Notifications')}</>
          </Text>
          <Stack direction="column" spacing="gap-y-1" customStyle="absolute right-0 top-5">
            <Menu
              anchor={{
                icon: <EllipsisHorizontalIcon />,
                variant: 'primary',
                greyBg: true,
                iconOnly: true,
                'aria-label': 'settings',
              }}
              items={dropDownActions}
              customStyle="w-max z-99"
            />
          </Stack>
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
        {/* Depricated */}
        {/* <Stack direction="column">
          <DropDownFilter
            dropdownMenuItems={dropDownMenuItems}
            selected={selectedOption}
            setSelected={setSelectedOption}
            resetLabel={t('Reset')}
            resetHandler={handleResetClick}
          />
        </Stack> */}
        <NotificationsCard
          notifications={allNotifications}
          followingLabel={'is now following you'}
          mentionedPostLabel={'mentioned you in a post'}
          mentionedCommentLabel={'mentioned you in a comment'}
          replyToPostLabel={'replied to your post'}
          replyToReplyLabel={'replied to your reply'}
          repostLabel={'reposted your post'}
          moderatedPostLabel={'moderated your post'}
          moderatedReplyLabel={'moderated your reply'}
          moderatedAccountLabel={'suspended your account'}
          markAsReadLabel={'Mark as read'}
          emptyTitle={'Looks like you don’t have any new notifications yet!'}
          handleMessageRead={() => {
            return;
          }} //@TODO to be implemented
          handleEntryClick={handleEntryClick}
          handleProfileClick={handleAvatarClick}
          transformSource={transformSource}
          loggedIn={true}
          isFetching={false}
        />
      </Stack>
    </>
  );
};
export default NotificationsPage;
