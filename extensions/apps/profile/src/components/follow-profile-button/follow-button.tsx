import React from 'react';
import getSDK from '@akashaorg/core-sdk';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import DuplexButton, {
  DuplexButtonProps,
} from '@akashaorg/design-system-core/lib/components/DuplexButton';
import { Following } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import {
  CheckIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { useTranslation } from 'react-i18next';
import {
  IModalNavigationOptions,
  NotificationEvents,
  NotificationTypes,
} from '@akashaorg/typings/lib/ui';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import {
  useCreateFollowMutation,
  useUpdateFollowMutation,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { updateFollowMutationCache } from './update-follow-mutation-cache';

export type FollowButtonProps = Pick<DuplexButtonProps, 'activeVariant' | 'inactiveVariant'> & {
  profileID: string;
  followDocumentId: string;
  iconOnly?: boolean;
  isFollowing: boolean;
  isLoggedIn: boolean;
  showLoginModal: (redirectTo?: { modal: IModalNavigationOptions }) => void;
};
export const FollowButton = ({
  profileID,
  followDocumentId,
  iconOnly,
  activeVariant,
  inactiveVariant,
  isFollowing,
  isLoggedIn,
  showLoginModal,
}: FollowButtonProps) => {
  const { t } = useTranslation('app-profile');
  const { uiEvents } = useRootComponentProps();
  const sdk = getSDK();
  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const sendSuccessNotification = (profileName: string, following: boolean) => {
    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Success,
        title: t('{{message}} {{name}}', {
          message: following ? 'You are now following' : 'You are no longer following',
          name: profileName,
        }),
      },
    });
  };

  const [createFollowMutation, { loading: createFollowLoading }] = useCreateFollowMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
    /*
     ** When creating a new follow document, a cache is created for it in memory and the object doesn't contain
     ** profileID(stream id of a profile) field because such named field isn't available in the mutation result.
     ** As a result, when the query associated with this mutation is executed, it won't find it in the cache and returns null.
     ** Hence, the data this component receives is stale which requires a cache update on mutation
     **/
    update: async (
      cache,
      {
        data: {
          setAkashaFollow: { document },
        },
      },
    ) => {
      await updateFollowMutationCache({
        cache,
        authenticatedDID,
        profileID,
        data: { id: document.id, isFollowing: document.isFollowing, profile: document.profile },
      });
    },
    onCompleted: async ({ setAkashaFollow }) => {
      const document = setAkashaFollow.document;
      if (iconOnly) sendSuccessNotification(document.profile?.name, document.isFollowing);
    },
  });

  const [updateFollowMutation, { loading: updateFollowLoading }] = useUpdateFollowMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
    update: async (
      cache,
      {
        data: {
          updateAkashaFollow: { document },
        },
      },
    ) => {
      await updateFollowMutationCache({
        cache,
        authenticatedDID,
        profileID,
        data: { id: document.id, isFollowing: document.isFollowing, profile: document.profile },
      });
    },
    onCompleted: async ({ updateAkashaFollow }) => {
      const document = updateAkashaFollow.document;
      if (iconOnly) sendSuccessNotification(document.profile?.name, document.isFollowing);
    },
  });

  const loading = createFollowLoading || updateFollowLoading;

  const disableActions = !profileID;
  const disabledStyle = disableActions ? 'opacity-50' : '';

  const handleFollow = (profileID: string, followId: string, isFollowing: boolean) => {
    if (disableActions) {
      return;
    }
    if (!isLoggedIn) {
      return showLoginModal();
    }
    if (!followId) {
      createFollowMutation({
        variables: { i: { content: { isFollowing, profileID } } },
      });
    } else {
      updateFollowMutation({
        variables: {
          i: {
            id: followId,
            content: {
              isFollowing,
            },
          },
        },
      });
    }
  };

  return iconOnly ? (
    <Button
      aria-label="follow"
      onClick={() => handleFollow(profileID, followDocumentId, !isFollowing)}
      icon={isFollowing ? <Following role="img" aria-label="following" /> : <UserPlusIcon />}
      variant="primary"
      loading={loading}
      greyBg={true}
      iconOnly={true}
      customStyle={disabledStyle}
    />
  ) : (
    <DuplexButton
      inactiveLabel={t('Follow')}
      activeLabel={t('Following')}
      activeHoverLabel={t('Unfollow')}
      activeVariant={activeVariant ?? 'secondary'}
      active={isFollowing}
      iconDirection="left"
      activeIcon={<CheckIcon />}
      activeHoverIcon={<XMarkIcon />}
      inactiveVariant={inactiveVariant ?? 'secondary'}
      loading={loading}
      fixedWidth={'w-[7rem]'}
      customStyle={disabledStyle}
      onClickInactive={() => handleFollow(profileID, followDocumentId, !isFollowing)}
      onClickActive={() => handleFollow(profileID, followDocumentId, !isFollowing)}
    />
  );
};
