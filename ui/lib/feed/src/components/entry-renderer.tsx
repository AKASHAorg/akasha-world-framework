import * as React from 'react';
import DS from '@akashaorg/design-system';
import { ILocale } from '@akashaorg/design-system/lib/utils/time';
import { useTranslation } from 'react-i18next';
import {
  AnalyticsCategories,
  TrackEventData,
  EventTypes,
  EntityTypes,
  NavigateToParams,
  RootComponentProps,
} from '@akashaorg/typings/ui';
import {
  usePost,
  useComment,
  useEditComment,
  mapEntry,
  useFollow,
  useIsFollowingMultiple,
  useUnfollow,
  getLinkPreview,
  uploadMediaToTextile,
  LoginState,
  useTagSearch,
  useMentionSearch,
} from '@akashaorg/ui-awf-hooks';
import { IContentClickDetails } from '@akashaorg/design-system/lib/components/EntryCard/entry-box';

const {
  Box,
  CommentEditor,
  ErrorLoader,
  EntryCardLoading,
  EntryCard,
  EntryCardHidden,
  ExtensionPoint,
} = DS;

export interface IEntryRenderer {
  itemId?: string;
  itemSpacing?: number;
  sharePostUrl: string;
  loginState: LoginState;
  locale: ILocale;
  style?: React.CSSProperties;
  onFlag?: (entryId: string, itemType: string, reporterEthAddress?: string | null) => () => void;
  onRepost: (withComment: boolean, entryId: string) => void;
  onEntryNavigate: (details: IContentClickDetails, itemType: EntityTypes) => void;
  navigateTo: (args: NavigateToParams) => void;
  contentClickable?: boolean;
  itemType: EntityTypes;
  onEntryRemove?: (entryId: string) => void;
  parentIsProfilePage?: boolean;
  removeEntryLabel?: string;
  removedByMeLabel?: string;
  removedByAuthorLabel?: string;
  uiEvents: RootComponentProps['uiEvents'];
  className?: string;
  modalSlotId: string;
  accentBorderTop?: boolean;
  trackEvent?: (event: Omit<TrackEventData, 'eventType'>) => void;
  index?: number;
  totalEntry?: number;
}

const commentStyleExt = {
  padding: '0 1rem',
  boxShadow: 'none',
};

const EntryRenderer = (props: IEntryRenderer) => {
  const {
    loginState,
    locale,
    itemId,
    itemType,
    style,
    onFlag,
    onEntryNavigate,
    navigateTo,
    sharePostUrl,
    onRepost,
    contentClickable,
    parentIsProfilePage,
    modalSlotId,
    accentBorderTop,
    trackEvent,
    itemSpacing,
  } = props;

  const [showAnyway, setShowAnyway] = React.useState<boolean>(false);
  const followProfileQuery = useFollow();
  const unfollowProfileQuery = useUnfollow();
  const [isEditingComment, setIsEditingComment] = React.useState<boolean>(false);

  const [mentionQuery, setMentionQuery] = React.useState(null);
  const [tagQuery, setTagQuery] = React.useState(null);
  const mentionSearch = useMentionSearch(mentionQuery);
  const tagSearch = useTagSearch(tagQuery);

  const handleMentionQueryChange = (query: string) => {
    setMentionQuery(query);
  };

  const handleTagQueryChange = (query: string) => {
    setTagQuery(query);
  };

  const { t } = useTranslation('ui-lib-feed');

  const postReq = usePost({ postId: itemId, enabler: itemType === EntityTypes.ENTRY });
  const commentReq = useComment(itemId, itemType === EntityTypes.COMMENT);
  const authorPubKey = React.useMemo(() => {
    if (itemType === EntityTypes.COMMENT && commentReq.status === 'success') {
      return commentReq.data.author.pubKey;
    }
    if (itemType === EntityTypes.ENTRY && postReq.status === 'success') {
      return postReq.data.author.pubKey;
    }
  }, [itemType, commentReq, postReq]);

  const followedProfilesReq = useIsFollowingMultiple(loginState.pubKey, [authorPubKey]);

  const postData = React.useMemo(() => {
    if (postReq.data && itemType === EntityTypes.ENTRY) {
      return mapEntry(postReq.data);
    }
    return undefined;
  }, [postReq.data, itemType]);

  const commentData = React.useMemo(() => {
    if (commentReq.data && itemType === EntityTypes.COMMENT) {
      /** @Todo: fix my type ;/ **/
      return mapEntry(commentReq.data as any);
    }
    return undefined;
  }, [commentReq.data, itemType]);

  const isFollowing = React.useMemo(() => {
    return (
      followedProfilesReq.status === 'success' && followedProfilesReq.data.includes(authorPubKey)
    );
  }, [authorPubKey, followedProfilesReq.data, followedProfilesReq.status]);

  /* @Todo: fix my type ;/ */
  const itemData: any = React.useMemo(() => {
    if (itemType === EntityTypes.ENTRY) {
      return postData;
    } else if (itemType === EntityTypes.COMMENT) {
      return commentData;
    }
  }, [postData, commentData, itemType]);

  const commentEditReq = useEditComment(itemData?.entryId, !!commentData);

  const [isReported, isAccountReported] = React.useMemo(() => {
    if (showAnyway) {
      return [false, false];
    }
    const reqSuccess = postReq.isSuccess || commentReq.isSuccess;
    return [reqSuccess && itemData?.reported, reqSuccess && itemData?.author?.reported];
  }, [itemData, showAnyway, postReq.isSuccess, commentReq.isSuccess]);

  const disablePublishing = React.useMemo(
    () => loginState.waitForAuth || !loginState.isReady,
    [loginState],
  );

  const handleFollow = React.useCallback(() => {
    if (authorPubKey) {
      followProfileQuery.mutate(authorPubKey);
    }
  }, [followProfileQuery, authorPubKey]);

  const handleUnfollow = React.useCallback(() => {
    if (authorPubKey) {
      unfollowProfileQuery.mutate(authorPubKey);
    }
  }, [unfollowProfileQuery, authorPubKey]);

  const handleEditClick = React.useCallback(() => {
    if (itemType === EntityTypes.COMMENT) {
      setIsEditingComment(true);
    }
  }, [itemType]);

  const handleAvatarClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: navRoutes => `${navRoutes.rootRoute}/${itemData?.author.pubKey}`,
    });
  };

  const handleContentClick = (details: IContentClickDetails) => {
    onEntryNavigate(details, itemType);
  };

  const handleMentionClick = (pubKey: string) => {
    navigateTo?.({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: navRoutes => `${navRoutes.rootRoute}/${pubKey}`,
    });
  };

  const handleTagClick = (name: string) => {
    navigateTo?.({
      appName: '@akashaorg/app-akasha-integration',
      getNavigationUrl: navRoutes => `${navRoutes.Tags}/${name}`,
    });
  };

  const handleExtensionMount = (name: string) => {
    props.uiEvents.next({
      event: EventTypes.ExtensionPointMount,
      data: {
        name,
        entryId: itemId,
        entryType: itemType,
        hideLabel: itemType === EntityTypes.ENTRY,
      },
    });
  };

  const handleExtensionUnmount = (name: string) => {
    props.uiEvents.next({
      event: EventTypes.ExtensionPointUnmount,
      data: {
        name,
        entryId: itemId,
        entryType: itemType,
      },
    });
  };
  const handleFlipCard = () => {
    setShowAnyway(true);
  };

  const itemTypeName = React.useMemo(() => {
    switch (itemType) {
      case EntityTypes.ENTRY:
        return t('post');
      case EntityTypes.PROFILE:
        return t('account');
      case EntityTypes.COMMENT:
        return t('reply');
      case EntityTypes.TAG:
        return t('tag');
      default:
        return t('unknown');
    }
  }, [t, itemType]);

  const accountAwaitingModeration =
    !itemData?.author?.moderated && isAccountReported && !parentIsProfilePage;
  const entryAwaitingModeration = !itemData?.moderated && isReported;

  const reportedTypeName = React.useMemo(() => {
    if (accountAwaitingModeration) return `the author of this ${itemTypeName}`;
    return `this ${itemTypeName}`;
  }, [accountAwaitingModeration, itemTypeName]);

  const handleCancelClick = () => {
    setIsEditingComment(false);
  };

  const handleEditComment = commentData => {
    if (trackEvent) {
      trackEvent({
        category: AnalyticsCategories.POST,
        action: 'Reply Edited',
      });
    }
    commentEditReq.mutate({ ...commentData, postID: itemData.postId });
    setIsEditingComment(false);
  };

  const showEditButton = React.useMemo(
    () => loginState.isReady && loginState.ethAddress === itemData?.author?.ethAddress,
    [itemData?.author?.ethAddress, loginState.ethAddress, loginState.isReady],
  );

  const isComment = React.useMemo(() => itemType === EntityTypes.COMMENT, [itemType]);

  return (
    <>
      {(postReq.isLoading || commentReq.isLoading) && <EntryCardLoading />}
      {(postReq.isError || commentReq.isError) && (
        <ErrorLoader
          type="script-error"
          title={t('There was an error loading the {{itemTypeName}}', { itemTypeName })}
          details={t('We cannot show this {{itemTypeName}} now', { itemTypeName })}
          devDetails={postReq.error}
        />
      )}
      {(postReq.isSuccess || commentReq.isSuccess) && (
        <>
          {(accountAwaitingModeration || entryAwaitingModeration) && (
            <EntryCardHidden
              reason={entryAwaitingModeration ? itemData.reason : itemData.author?.reason}
              headerTextLabel={t('You reported {{reportedTypeName}} for the following reason', {
                reportedTypeName,
              })}
              footerTextLabel={t('It is awaiting moderation.')}
              ctaLabel={t('See it anyway')}
              handleFlipCard={handleFlipCard}
            />
          )}
          {isEditingComment && (
            <Box margin="medium">
              <CommentEditor
                avatar={itemData.author.avatar}
                ethAddress={itemData.author.ethAddress}
                postLabel={t('Save')}
                placeholderLabel={t('Reply to {{itemDataAuthorName}}', {
                  itemDataAuthorName: itemData.author.name || '',
                })}
                emojiPlaceholderLabel={t('Search')}
                disablePublishLabel={t('Authenticating')}
                disablePublish={disablePublishing}
                onPublish={handleEditComment}
                linkPreview={itemData.linkPreview}
                getLinkPreview={getLinkPreview}
                getMentions={handleMentionQueryChange}
                getTags={handleTagQueryChange}
                /* @Todo: fix my type */
                tags={tagSearch.data as any}
                mentions={mentionSearch.data}
                uploadRequest={uploadMediaToTextile}
                editorState={itemData.slateContent}
                isShown={true}
                showCancelButton={true}
                onCancelClick={handleCancelClick}
                cancelButtonLabel={t('Cancel')}
              />
            </Box>
          )}
          {itemData &&
            !entryAwaitingModeration &&
            !accountAwaitingModeration &&
            !itemData.delisted &&
            !itemData.isRemoved && (
              <Box margin={{ bottom: itemSpacing ? `${itemSpacing}px` : null }}>
                <EntryCard
                  className={props.className}
                  isRemoved={itemData.isRemoved}
                  entryData={itemData}
                  sharePostUrl={sharePostUrl}
                  sharePostLabel={t('Share Post')}
                  shareTextLabel={t('Share this post with your friends')}
                  onClickAvatar={handleAvatarClick}
                  repliesLabel={itemType === EntityTypes.ENTRY ? '' : t('Replies')}
                  repostsLabel={t('Reposts')}
                  repostLabel={t('Repost')}
                  editedLabel={t('Last edited')}
                  repostWithCommentLabel={t('Repost with comment')}
                  shareLabel={t('Share')}
                  copyLinkLabel={t('Copy Link')}
                  flagAsLabel={t('Report {{itemTypeName}}', { itemTypeName })}
                  loggedProfileEthAddress={loginState.isReady && loginState.ethAddress}
                  locale={locale || 'en'}
                  style={{
                    ...(style as React.CSSProperties),
                    ...(commentData && commentStyleExt),
                    display: isEditingComment ? 'none' : 'block',
                  }}
                  showMore={true}
                  profileAnchorLink={'/@akashaorg/app-profile'}
                  repliesAnchorLink={`/@akashaorg/app-akasha-integration/${
                    isComment ? 'reply' : 'post'
                  }`}
                  onRepost={onRepost}
                  onEntryFlag={onFlag && onFlag(itemData.entryId, itemTypeName)}
                  handleFollowAuthor={handleFollow}
                  handleUnfollowAuthor={handleUnfollow}
                  isFollowingAuthor={isFollowing}
                  onContentClick={handleContentClick}
                  onMentionClick={handleMentionClick}
                  onTagClick={handleTagClick}
                  navigateTo={navigateTo}
                  contentClickable={contentClickable}
                  moderatedContentLabel={t('This content has been moderated')}
                  ctaLabel={t('See it anyway')}
                  handleFlipCard={handleFlipCard}
                  onEntryRemove={props.onEntryRemove}
                  removeEntryLabel={props.removeEntryLabel}
                  removedByMeLabel={props.removedByMeLabel}
                  removedByAuthorLabel={props.removedByAuthorLabel}
                  disableReposting={itemData.isRemoved || isComment}
                  disableReporting={loginState.waitForAuth || loginState.isSigningIn}
                  modalSlotId={modalSlotId}
                  bottomBorderOnly={isComment}
                  noBorderRadius={isComment}
                  noBorder={isComment && props.index === props.totalEntry}
                  accentBorderTop={accentBorderTop}
                  actionsRightExt={
                    <ExtensionPoint
                      name={`entry-card-actions-right_${itemId}`}
                      onMount={handleExtensionMount}
                      onUnmount={handleExtensionUnmount}
                    />
                  }
                  headerMenuExt={
                    showEditButton && (
                      <ExtensionPoint
                        style={{ width: '100%' }}
                        onClick={handleEditClick}
                        name={`entry-card-edit-button_${itemId}`}
                        onMount={handleExtensionMount}
                        onUnmount={handleExtensionUnmount}
                      />
                    )
                  }
                />
              </Box>
            )}
        </>
      )}
    </>
  );
};

export default React.memo(EntryRenderer);
