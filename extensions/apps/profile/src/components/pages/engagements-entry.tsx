import React from 'react';
import ProfileAvatarButton from '@akashaorg/design-system-core/lib/components/ProfileAvatarButton';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import FollowProfileButton from '../follow-profile-button';
import { AkashaProfile, IModalNavigationOptions } from '@akashaorg/typings/lib/ui';
import { useGetProfileByIdQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { selectProfileData } from '@akashaorg/ui-core-hooks/lib/selectors/get-profile-by-id-query';
import { transformSource, useRootComponentProps } from '@akashaorg/ui-core-hooks';

type EngagementsEntryProps = {
  profileID: string;
  profileDID: string;
  profileInfo?: AkashaProfile;
  authenticatedDID: string;
  showNsfw: boolean;
  profileAnchorLink: string;
  customStyle?: string;
};

export const EngagementsEntry: React.FC<EngagementsEntryProps> = props => {
  const {
    profileID,
    profileDID,
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

  /*
   ** @todo
   ** if DID info isn't available in the current profile model then filter out entry info
   ** this could change in the future if getting this info becomes necessary
   **/
  const entryProfileDID = profileDID ?? profileData?.did?.id;

  const viewerIsOwner = authenticatedDID === entryProfileDID;

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
        profileId={
          //@todo provide only the profile DID, if entryProfileDID is null then the entry info will be filtered out instead of displaying profile stream id
          entryProfileDID ?? profileID
        }
        avatar={transformSource(profileData?.avatar?.default)}
        alternativeAvatars={profileData?.avatar?.alternatives?.map(alternative =>
          transformSource(alternative),
        )}
        label={profileData?.name}
        {...(profileData?.nsfw && {
          nsfwAvatar: !(viewerIsOwner || showNsfw),
          nsfwLabel: 'NSFW',
        })}
        href={entryProfileDID ? `${profileAnchorLink}/${entryProfileDID}` : ''}
        onClick={() => {
          if (profileDID) onProfileClick(profileDID);
        }}
      />
      {!viewerIsOwner && (
        <FollowProfileButton profileID={profileID} showLoginModal={showLoginModal} />
      )}
    </Stack>
  );
};
