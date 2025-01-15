import React from 'react';
import ProfileAvatarButton, {
  ProfileAvatarButtonProps,
} from '@akashaorg/design-system-core/lib/components/ProfileAvatarButton';
import ProfileAvatarLoading from '@akashaorg/design-system-core/lib/components/ProfileAvatarButton/ProfileAvatarLoading';
import { hasOwn, transformSource } from '@akashaorg/ui-core-hooks';
import { useGetProfileByDidQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';

export type ProfileAvatarProps = Pick<
  ProfileAvatarButtonProps,
  'truncateText' | 'href' | 'metadata' | 'customStyle' | 'onClick'
> & { profileDID: string };

const ProfileAvatar = (props: ProfileAvatarProps) => {
  const { profileDID, ...rest } = props;
  const profileQuery = useGetProfileByDidQuery({
    variables: { id: profileDID },
    fetchPolicy: 'cache-first',
  });

  if (profileQuery?.loading) return <ProfileAvatarLoading />;

  if (profileQuery?.error) return null;

  const profileData =
    profileQuery.data?.node && hasOwn(profileQuery.data.node, 'isViewer')
      ? profileQuery.data.node.akashaProfile
      : null;

  return (
    <ProfileAvatarButton
      profileId={profileDID}
      label={profileData?.name}
      avatar={transformSource(profileData?.avatar?.default)}
      alternativeAvatars={profileData?.avatar?.alternatives?.map(alternative =>
        transformSource(alternative),
      )}
      {...rest}
    />
  );
};

export default ProfileAvatar;
