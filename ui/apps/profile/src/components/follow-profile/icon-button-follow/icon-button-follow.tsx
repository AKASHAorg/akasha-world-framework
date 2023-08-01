import React, { useState } from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { useGetLogin } from '@akashaorg/ui-awf-hooks';
import { ModalNavigationOptions } from '@akashaorg/typings/ui';
import { useFollowingsOfLoggedInProfile } from './use-followings-of-logged-in-profile';
import {
  useCreateFollowMutation,
  useGetMyProfileQuery,
  useUpdateFollowMutation,
} from '@akashaorg/ui-awf-hooks/lib/generated/hooks-new';
import { Follow } from '../type';

type IconButtonFollow = {
  profileId: string;
  showLoginModal: (redirectTo?: { modal: ModalNavigationOptions }) => void;
};

/* TODO: Some of the logic inside this component is a work around until we have a hook that fetches the isFollowing flag and stream id of a profile being viewed.
 **      The component will be refactored once the hook is ready.
 */
const IconButtonFollow: React.FC<IconButtonFollow> = props => {
  const { profileId, showLoginModal } = props;

  const loginQuery = useGetLogin();

  const isLoggedIn = React.useMemo(() => {
    return !!loginQuery.data?.id;
  }, [loginQuery.data]);

  const [loading, setLoading] = useState(false);

  const { followProfile, unFollowProfile, getFollowing } = useFollowingsOfLoggedInProfile(
    loginQuery.data?.id,
  );

  const following = getFollowing(loginQuery.data?.id, String(profileId));

  const createFollowMutation = useCreateFollowMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: ({ createFollow }) => {
      followProfile(loginQuery.data?.id, String(profileId), createFollow.document.id);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const updateFollowMutation = useUpdateFollowMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      if (!following) return null;

      if (following.isFollowing) {
        unFollowProfile(loginQuery.data?.id, String(profileId));
        return;
      }

      followProfile(loginQuery.data?.id, String(profileId), following.streamId);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const profileDataReq = useGetMyProfileQuery(null, {
    select: response => response?.viewer?.profile,
    enabled: isLoggedIn,
  });

  const handleFollow = (profileStreamId: string, following?: Follow) => {
    if (!isLoggedIn) {
      return showLoginModal();
    }
    if (!following) {
      createFollowMutation.mutate({
        i: { content: { isFollowing: true, profileID: profileStreamId } },
      });
    } else {
      updateFollowMutation.mutate({
        i: {
          id: following.streamId,
          content: { isFollowing: true, profileID: profileStreamId },
        },
      });
    }
  };

  const handleUnfollow = (profileStreamId: string, following?: Follow) => {
    if (!following) return null;
    if (!isLoggedIn) {
      return showLoginModal();
    }
    updateFollowMutation.mutate({
      i: {
        id: following.streamId,
        content: { isFollowing: false, profileID: profileStreamId },
      },
    });
  };

  return (
    <>
      {following?.isFollowing ? (
        <Button
          size="sm"
          icon="UserPlusIcon"
          onClick={() => handleUnfollow(profileDataReq.data?.id, following)}
          variant="primary"
          loading={loading}
          iconOnly
        />
      ) : (
        <Button
          onClick={() => handleFollow(profileDataReq.data?.id, following)}
          icon="UsersIcon"
          loading={loading}
          greyBg
          iconOnly
        />
      )}
    </>
  );
};

export default IconButtonFollow;
