import React, { useState } from 'react';
import DefaultEmptyCard from '@akashaorg/design-system-components/lib/components/DefaultEmptyCard';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ProfileStatsView from '../../profile-stats';
import ProfileNotFound from '@akashaorg/design-system-components/lib/components/ProfileNotFound';
import NSFW from './nsfw';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import ProfileHeader from '../../profile-header';
import routes, { EDIT } from '../../../routes';
import {
  ProfileBio,
  ProfileLinks,
  ProfileLoading,
} from '@akashaorg/design-system-components/lib/components/Profile';
import { useTranslation } from 'react-i18next';
import { EventTypes, IModalNavigationOptions } from '@akashaorg/typings/lib/ui';
import {
  useAkashaStore,
  useNsfwToggling,
  useProfileStats,
  useRootComponentProps,
  useValidDid,
} from '@akashaorg/ui-core-hooks';
import { useGetProfileByDidSuspenseQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { selectProfileData } from '@akashaorg/ui-core-hooks/lib/selectors/get-profile-by-did-query';

type ProfileInfoPageProps = {
  profileDID: string;
};

const ProfileInfoPage: React.FC<ProfileInfoPageProps> = props => {
  const { profileDID } = props;
  const { t } = useTranslation('app-profile');
  const { getCorePlugins, navigateToModal, uiEvents } = useRootComponentProps();
  const {
    data: { authenticatedDID, isAuthenticating: authenticating },
  } = useAkashaStore();
  const { data, error } = useGetProfileByDidSuspenseQuery({
    fetchPolicy: 'cache-first',
    variables: {
      id: profileDID,
    },
    skip: !profileDID,
  });
  const { validDid, isLoading: validDidCheckLoading } = useValidDid(profileDID, !!data?.node);
  const { data: statData } = useProfileStats(profileDID, true);
  const profileData = selectProfileData(data);
  const isLoggedIn = !!authenticatedDID;
  const { showNsfw: showNsfwSetting } = useNsfwToggling();
  const [showNSFW, setShowNSFW] = useState(false);

  /* show the overlay or display the profile directly depending on the user's nsfw setting
  and whether they are logged in or not */
  React.useEffect(() => {
    if (isLoggedIn && showNsfwSetting) {
      setShowNSFW(true);
    }
  }, [isLoggedIn, showNsfwSetting]);

  const navigateTo = getCorePlugins().routing.navigateTo;

  const hasProfile = !!data?.node;
  const isViewer = !!authenticatedDID && profileDID === authenticatedDID;

  const showLoginModal = (redirectTo?: { modal: IModalNavigationOptions }) => {
    navigateToModal({
      name: 'login',
      redirectTo,
    });
  };

  const goToHomepage = () => {
    navigateTo({
      appName: '@akashaorg/app-antenna',
      getNavigationUrl: navRoutes => navRoutes.defaultRoute,
    });
  };

  if (
    authenticating /*check if authentication is in progress to prevent showing nsfw card to own profile during login */ ||
    validDidCheckLoading
  )
    return <ProfileLoading />;

  if (error)
    return (
      <ErrorLoader
        type="script-error"
        title={t('There was an error loading this profile')}
        details={t('We cannot show this profile right now')}
      />
    );

  if (!hasProfile && !validDid)
    return (
      <ProfileNotFound
        titleLabel={t('This profile doesn’t exist')}
        buttonLabel={t('Go back home')}
        onClickGoToHomepage={goToHomepage}
      />
    );

  const onViewNSFW = () => {
    if (!isLoggedIn) {
      showLoginModal({ modal: { name: location.pathname } });
      return;
    }
    setShowNSFW(true);
  };

  if (profileData?.nsfw && !showNSFW && authenticatedDID !== profileData?.did?.id)
    return (
      <Card>
        <NSFW
          sensitiveContentLabel={t('NSFW Profile')}
          descriptionFirstLine={t('This profile is marked as NSFW.')}
          descriptionSecondLine={t(
            'It means that the content of this profile has inappropriate content for some users.',
          )}
          clickToViewLabel={t('View Profile')}
          cancelLabel={t('Cancel')}
          onCancel={() => {
            uiEvents.next({
              event: EventTypes.GoBackToPreviousRoute,
            });
          }}
          onClickToView={() => {
            onViewNSFW();
          }}
        />
      </Card>
    );

  const goToEditProfile = () => {
    return navigateTo({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: () => `/${profileDID}${routes[EDIT]}`,
    });
  };

  return (
    <>
      <ProfileHeader profileDID={profileDID} />
      <Stack direction="column" spacing="gap-y-4" fullWidth>
        {profileData?.description && (
          <ProfileBio title={t('Bio')} biography={profileData.description} />
        )}
        {!isLoggedIn && !profileData && (
          <DefaultEmptyCard
            infoText={t("It seems this user hasn't filled in their information just yet. 🤔")}
            customCardSize={{ width: '140px', height: '85px' }}
            assetName="profile-not-filled"
          />
        )}
        {isLoggedIn && !profileData && isViewer && (
          <DefaultEmptyCard
            infoText={t('Uh-uh! it looks like you haven’t filled your information!')}
            buttonLabel={t('Fill my info')}
            buttonClickHandler={goToEditProfile}
            assetName="profile-not-filled"
          />
        )}
        {statData && (
          <ProfileStatsView
            profileDID={profileDID}
            totalBeams={statData.totalBeams}
            totalTopics={statData.totalTopics}
            totalFollowers={statData.totalFollowers}
            totalFollowing={statData.totalFollowing}
            navigateTo={navigateTo}
            showLoginModal={() => showLoginModal({ modal: { name: location.pathname } })}
          />
        )}
        {profileData?.links?.length > 0 && (
          <ProfileLinks
            title={t('Find me on')}
            copiedLabel={t('Copied')}
            copyLabel={t('Copy to clipboard')}
            links={profileData?.links}
          />
        )}
      </Stack>
    </>
  );
};

export default ProfileInfoPage;
