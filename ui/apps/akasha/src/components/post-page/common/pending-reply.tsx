import * as React from 'react';
import DS from '@akashaorg/design-system';

import { IEntryData, IProfileData, IPublishData, RootComponentProps } from '@akashaorg/typings/ui';
import {
  createPendingEntry,
  useFollow,
  useMutationListener,
  useUnfollow,
  useIsFollowingMultiple,
} from '@akashaorg/ui-awf-hooks';
import { useTranslation } from 'react-i18next';
import routes, { REPLY } from '../../../routes';
import { PUBLISH_PENDING_KEY } from '@akashaorg/ui-awf-hooks/lib/use-comments';

const { Box, EntryBox } = DS;

type Props = {
  postId: string;
  /* @Todo: Fix my type */
  loggedProfileData: any;
  layoutConfig: RootComponentProps['layoutConfig'];
  entryData?: IEntryData;
};

export function PendingReply({ postId, layoutConfig, loggedProfileData, entryData }: Props) {
  const { t } = useTranslation('app-akasha-integration');
  const publishComment = useMutationListener<IPublishData & { postID: string }>(
    PUBLISH_PENDING_KEY,
  );
  const followReq = useFollow();
  const unfollowReq = useUnfollow();
  const isFollowingMultipleReq = useIsFollowingMultiple(loggedProfileData?.pubKey, [
    entryData?.author?.pubKey,
  ]);
  const followedProfiles = isFollowingMultipleReq.data;
  const isFollowing = followedProfiles.includes(entryData?.author?.pubKey);

  const handleFollow = () => {
    if (entryData?.author?.pubKey) {
      followReq.mutate(entryData?.author?.pubKey);
    }
  };

  const handleUnfollow = () => {
    if (entryData?.author?.pubKey) {
      unfollowReq.mutate(entryData?.author?.pubKey);
    }
  };

  return (
    <>
      {publishComment &&
        publishComment.state.status === 'loading' &&
        publishComment.state.variables.postID === postId && (
          <Box
            pad={{ horizontal: 'medium' }}
            border={{ side: 'bottom', size: '1px', color: 'border' }}
            background="pendingEntryBackground"
            data-testid="pending-entry"
          >
            <EntryBox
              /* @Todo: Fix my type */
              entryData={
                createPendingEntry(loggedProfileData, publishComment.state.variables) as any
              }
              sharePostLabel={t('Share Post')}
              shareTextLabel={t('Share this post with your friends')}
              repliesLabel={t('Replies')}
              repostsLabel={t('Reposts')}
              repostLabel={t('Repost')}
              repostWithCommentLabel={t('Repost with comment')}
              shareLabel={t('Share')}
              copyLinkLabel={t('Copy Link')}
              flagAsLabel={t('Report Comment')}
              loggedProfileEthAddress={loggedProfileData.ethAddress}
              locale={'en'}
              showMore={true}
              profileAnchorLink={'/profile'}
              repliesAnchorLink={routes[REPLY]}
              handleFollowAuthor={handleFollow}
              handleUnfollowAuthor={handleUnfollow}
              isFollowingAuthor={isFollowing}
              contentClickable={false}
              hidePublishTime={true}
              disableActions={true}
              hideActionButtons={true}
              modalSlotId={layoutConfig.modalSlotId}
            />
          </Box>
        )}
    </>
  );
}
