import React from 'react';
import ProfileAvatarButton from '@akashaorg/design-system-core/lib/components/ProfileAvatarButton';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import FollowProfileButton from '../follow-profile-button';
import { AkashaProfile, IModalNavigationOptions } from '@akashaorg/typings/lib/ui';
import { useGetProfileByIdQuery } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { selectProfileData } from '@akashaorg/ui-awf-hooks/lib/selectors/get-profile-by-id-query';
import { transformSource, useRootComponentProps } from '@akashaorg/ui-awf-hooks';

type EngagementsEntryProps = {
  profileID: string;
  profileInfo?: AkashaProfile;
  authenticatedDID: string;
  showNsfw: boolean;
  profileAnchorLink: string;
  customStyle?: string;
};

export const EngagementsEntry: React.FC<EngagementsEntryProps> = props => {
  const {
    profileID,
    profileInfo,
    authenticatedDID,
    showNsfw,
    profileAnchorLink,
    customStyle = '',
  } = props;
  const { getCorePlugins, navigateToModal } = useRootComponentProps();

  const { data } = useGetProfileByIdQuery({
    fetchPolicy: 'cache-and-network',
    variables: { id: profileID },
    skip: !!profileInfo,
  });

  const navigateTo = getCorePlugins().routing.navigateTo;

  const profileData = profileInfo ? profileInfo : selectProfileData(data);

  const onProfileClick = (profileDID: string) => {
    navigateTo?.({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: navRoutes => `${navRoutes.rootRoute}/${profileDID}`,
    });
  };

  const showLoginModal = (redirectTo?: { modal: IModalNavigationOptions }) => {
    navigateToModal({
      name: 'login',
      redirectTo,
    });
  };

  const profileDID = profileData?.did?.id;

  const viewerIsOwner = authenticatedDID === profileDID;

  return (
    <Stack
      direction="row"
      align="center"
      justify="between"
      padding="px-4"
      customStyle={customStyle}
      fullWidth
    >
      <ProfileAvatarButton
        profileId={profileDID ?? profileID}
        avatar={transformSource(profileData?.avatar?.default)}
        alternativeAvatars={profileData?.avatar?.alternatives?.map(alternative =>
          transformSource(alternative),
        )}
        label={profileData?.name}
        {...(profileData?.nsfw && {
          nsfwAvatar: !(viewerIsOwner || showNsfw),
          nsfwLabel: 'NSFW',
        })}
        href={profileDID ? `${profileAnchorLink}/${profileDID}` : ''}
        onClick={() => {
          if (profileDID) onProfileClick(profileDID);
        }}
      />
      <FollowProfileButton profileID={profileID} showLoginModal={showLoginModal} />
    </Stack>
  );
};
