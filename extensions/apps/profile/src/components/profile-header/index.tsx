import React, { Suspense, useCallback, useMemo } from 'react';
import routes, { EDIT } from '../../routes';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import FollowProfileButton from '../follow-profile-button';
import {
  FlagIcon,
  LinkIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import {
  ProfileHeaderLoading,
  ProfileHeader as ProfileHeaderPresentation,
} from '@akashaorg/design-system-components/lib/components/Profile';
import { MenuProps } from '@akashaorg/design-system-core/lib/components/Menu';
import {
  IModalNavigationOptions,
  NotificationEvents,
  NotificationTypes,
} from '@akashaorg/typings/lib/ui';
import { useTranslation } from 'react-i18next';
import {
  transformSource,
  useValidDid,
  useRootComponentProps,
  useAkashaStore,
} from '@akashaorg/ui-awf-hooks';
import { useGetProfileByDidSuspenseQuery } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { selectProfileData } from '@akashaorg/ui-awf-hooks/lib/selectors/get-profile-by-did-query';

type ProfileHeaderProps = {
  profileDID: string;
  plain?: boolean;
  customStyle?: string;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = props => {
  const [activeOverlay, setActiveOverlay] = React.useState<'avatar' | 'coverImage' | null>(null);
  const { profileDID, plain, customStyle = '' } = props;
  const { t } = useTranslation('app-profile');
  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const { uiEvents, navigateToModal, getCorePlugins } = useRootComponentProps();

  const { data, error } = useGetProfileByDidSuspenseQuery({
    fetchPolicy:
      'cache-first' /*data is prefetched during route matching as a result we prefer reading cache first here  */,
    variables: { id: profileDID },
  });
  const { validDid, isEthAddress } = useValidDid(profileDID, !!data?.node);
  const profileData = selectProfileData(data);
  const showLoginModal = useCallback(
    (redirectTo?: { modal: IModalNavigationOptions }) => {
      navigateToModal({
        name: 'login',
        redirectTo,
      });
    },
    [navigateToModal],
  );
  const isViewer = !!authenticatedDID && profileDID === authenticatedDID;
  const navigateTo = getCorePlugins().routing.navigateTo;

  const handleClickAvatar = () => {
    if (!profileData?.avatar) return;
    setActiveOverlay('avatar');
  };

  const handleClickCoverImage = () => {
    if (!profileData?.background) return;
    setActiveOverlay('coverImage');
  };

  const handleCloseOverlay = () => {
    setActiveOverlay(null);
  };

  const handleCopy = () => {
    const profileUrl = new URL(location.pathname, location.origin).href;
    navigator.clipboard.writeText(profileUrl).then(() => {
      uiEvents.next({
        event: NotificationEvents.ShowNotification,
        data: {
          type: NotificationTypes.Success,
          title: t('Profile link copied'),
        },
      });
    });
  };

  const handleClickProfileName = () => {
    navigateTo({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: () => `/${profileDID}`,
    });
  };

  const handleEdit = () => {
    navigateTo({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: () => `/${profileDID}${routes[EDIT]}`,
    });
  };

  const handleFlagProfile = () => {
    navigateTo({
      appName: '@akashaorg/app-vibes',
      getNavigationUrl: () => `/report/profile/${profileDID}`,
    });
  };

  const menuItems: MenuProps['items'] = [
    {
      label: t('Copy link'),
      icon: <LinkIcon />,
      onClick: handleCopy,
    },
    ...(!isViewer
      ? ([
          {
            label: t('Flag'),
            icon: <FlagIcon />,
            onClick: handleFlagProfile,
            color: { light: 'errorLight', dark: 'errorDark' },
          },
        ] as MenuProps['items'])
      : []),
  ];

  const nsfwBadge = useMemo(
    () =>
      profileData?.nsfw
        ? [{ label: 'NSFW', toolTipLabel: t('This profile is marked as NSFW.') }]
        : [],
    [profileData?.nsfw, t],
  );

  if (error)
    return (
      <ErrorLoader
        type="script-error"
        title={t('There was an error loading the profile header')}
        details={t('We cannot show this profile header right now')}
      />
    );

  return (
    <ProfileHeaderPresentation
      profileId={profileData?.did?.id ? profileData.did.id : profileDID}
      validAddress={profileData ? true : isEthAddress || validDid}
      background={profileData?.background}
      avatar={profileData?.avatar}
      profileName={profileData?.name}
      viewerIsOwner={isViewer}
      menuItems={menuItems}
      copyLabel={t('Copy to clipboard')}
      copiedLabel={t('Copied')}
      followElement={
        <FollowProfileButton
          profileID={profileData?.id}
          showLoginModal={showLoginModal}
          iconOnly={true}
        />
      }
      badges={[...nsfwBadge]}
      activeOverlay={activeOverlay}
      plain={plain}
      customStyle={customStyle}
      onClickAvatar={handleClickAvatar}
      onClickCoverImage={handleClickCoverImage}
      onCloseOverlay={handleCloseOverlay}
      onClickProfileName={handleClickProfileName}
      handleEdit={handleEdit}
      transformSource={transformSource}
    />
  );
};

export default (props: ProfileHeaderProps) => (
  <>
    <Suspense fallback={<ProfileHeaderLoading plain={props.plain} />}>
      <ProfileHeader {...props} />
    </Suspense>
  </>
);
