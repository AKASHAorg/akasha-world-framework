import * as React from 'react';
import { useParams } from 'react-router-dom';
import DS from '@akashaproject/design-system';
import { ILoadItemDataPayload } from '@akashaproject/design-system/lib/components/VirtualList/interfaces';
import { useFeedReducer, useEntryBookmark } from '@akashaproject/ui-awf-hooks';
import { useTranslation } from 'react-i18next';
import { ILocale } from '@akashaproject/design-system/lib/utils/time';
import {
  mapEntry,
  uploadMediaToTextile,
  buildPublishObject,
  PROPERTY_SLATE_CONTENT,
} from '../../services/posting-service';
import { redirectToPost } from '../../services/routing-service';
import { combineLatest } from 'rxjs';
import PostRenderer from './post-renderer';
// import { getPostPageCustomEntities } from './post-page-custom-entities';

const {
  Box,
  MainAreaCardBox,
  EntryBox,
  ReportModal,
  ToastProvider,
  ModalRenderer,
  useViewportSize,
  VirtualList,
  Helmet,
  CommentEditor,
  EditorPlaceholder,
} = DS;

interface IPostPage {
  channels: any;
  globalChannel: any;
  logger: any;
  ethAddress: string | null;
  pubKey: string | null;
  slotId: string;
  flagged: string;
  reportModalOpen: boolean;
  setFlagged: React.Dispatch<React.SetStateAction<string>>;
  setReportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showLoginModal: () => void;
  navigateToUrl: (path: string) => void;
}

const PostPage: React.FC<IPostPage> = props => {
  const {
    slotId,
    channels,
    flagged,
    reportModalOpen,
    setFlagged,
    setReportModalOpen,
    showLoginModal,
    logger,
    navigateToUrl,
    ethAddress,
  } = props;

  const { postId } = useParams<{ userId: string; postId: string }>();
  const { t, i18n } = useTranslation();

  const [feedState, feedStateActions] = useFeedReducer({});
  const [isLoading, setIsLoading] = React.useState(false);

  const { size } = useViewportSize();

  const locale = (i18n.languages[0] || 'en') as ILocale;

  const [bookmarks, bookmarkActions] = useEntryBookmark({
    ethAddress: ethAddress,
    onError: () => {
      return;
    },
    sdkModules: channels,
    logger: logger,
  });

  const [entryData, setEntryData] = React.useState<any>(null);

  const handleLoadMore = async (payload: any) => {
    const req: { limit: number; offset?: string; postID: string } = {
      limit: payload.limit,
      postID: postId,
    };
    if (!isLoading) {
      setIsLoading(true);
      fetchComments(req);
    }
  };

  const fetchComments = async (payload: { limit: number; offset?: string; postID: string }) => {
    const getCommentsCall = channels.posts.comments.getComments({
      ...payload,
      offset: payload.offset || feedState.nextItemId,
    });
    const ipfsGatewayCall = channels.commons.ipfsService.getSettings({});
    const call = combineLatest([ipfsGatewayCall, getCommentsCall]);
    call.subscribe((resp: any) => {
      const ipfsGateway = resp[0].data;
      const {
        data,
      }: {
        channelInfo: any;
        data: { getComments: { nextIndex: string; results: any[]; total: number } };
      } = resp[1];
      const { nextIndex, results } = data.getComments;
      const commentIds: { entryId: string }[] = [];
      results.forEach(entry => {
        // filter out entries without content in slate format
        // currently entries can display only content in slate format
        // this can be changed later
        if (entry.content.findIndex((elem: any) => elem.property === PROPERTY_SLATE_CONTENT) > -1) {
          commentIds.push({ entryId: entry._id });
          const mappedEntry = mapEntry(entry, ipfsGateway);
          feedStateActions.setFeedItemData(mappedEntry);
        }
      });
      feedStateActions.setFeedItems({ items: commentIds, nextItemId: nextIndex });
      if (nextIndex === null) {
        feedStateActions.hasMoreItems(false);
      }
      setIsLoading(false);
    });
  };

  const loadItemData = async (payload: ILoadItemDataPayload) => {
    const commentCall = channels.posts.comments.getComment({ commentID: payload.itemId });
    const ipfsGatewayCall = channels.commons.ipfsService.getSettings({});
    const getCommentCall = combineLatest([ipfsGatewayCall, commentCall]);
    getCommentCall.subscribe((resp: any) => {
      const ipfsGateway = resp[0].data;
      const comment = resp[1].data?.getComment;
      if (comment) {
        const mappedComment = mapEntry(comment, ipfsGateway);
        feedStateActions.setFeedItemData(mappedComment);
      }
    });
  };

  React.useEffect(() => {
    const entryCall = channels.posts.entries.getEntry({ entryId: postId });
    const ipfsGatewayCall = channels.commons.ipfsService.getSettings({});
    const call = combineLatest([ipfsGatewayCall, entryCall]);
    call.subscribe((resp: any) => {
      const ipfsGateway = resp[0].data;
      const entry = resp[1].data?.getPost;
      if (entry) {
        const mappedEntry = mapEntry(entry, ipfsGateway, logger);
        setEntryData(mappedEntry);
      }
    });
  }, [postId]);

  const bookmarked = false;

  const handleMentionClick = (profileEthAddress: string) => {
    navigateToUrl(`/profile/${profileEthAddress}`);
  };

  const handleAvatarClick = (ev: React.MouseEvent<HTMLDivElement>, authorEth: string) => {
    navigateToUrl(`/profile/${authorEth}`);
    ev.preventDefault();
  };

  const handleEntryBookmark = (entryId: string) => {
    if (!ethAddress) {
      return showLoginModal();
    }
    bookmarkActions.addBookmark(entryId);
  };
  const handleEntryRepost = () => {
    // todo
  };
  const handleEntryFlag = (entryId: string, user?: string | null) => () => {
    /* todo */
    if (!user) {
      setFlagged(entryId);
      return showLoginModal();
    }
    setFlagged(entryId);
    setReportModalOpen(true);
  };
  const handleClickReplies = () => {
    // todo
  };
  const handleFollow = () => {
    // todo
  };
  const handleUnfollow = () => {
    // todo
  };
  const handleEntryShare = (service: 'twitter' | 'facebook' | 'reddit', _entryId: string) => {
    let shareUrl;
    switch (service) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${window.location.href}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`;
        break;
      case 'reddit':
        shareUrl = `http://www.reddit.com/submit?url=${window.location.href}`;
        break;
      default:
        break;
    }
    window.open(shareUrl, '_blank');
  };
  const handlePublish = async (data: {
    metadata: {
      app: string;
      version: number;
      quote?: string;
      tags: string[];
      mentions: string[];
    };
    author: string;
    content: any;
    textContent: any;
  }) => {
    if (!ethAddress) {
      showLoginModal();
      return;
    }

    try {
      const publishObj = buildPublishObject(data, postId);
      const publishCommentCall = channels.posts.comments.addComment(publishObj);
      publishCommentCall.subscribe((postingResp: any) => {
        const publishedCommentId = postingResp.data.addComment;
        feedStateActions.setFeedItems({
          reverse: true,
          items: [{ entryId: publishedCommentId }],
        });
      });
    } catch (err) {
      logger.error('Error publishing comment %j', err);
    }
  };

  const [tags, setTags] = React.useState([]);
  const handleGetTags = (query: string) => {
    const tagsService = channels.posts.tags.searchTags({ tagName: query });
    tagsService.subscribe((resp: any) => {
      if (resp.data?.searchTags) {
        const filteredTags = resp.data.searchTags;
        setTags(filteredTags);
      }
    });
  };

  const [mentions, setMentions] = React.useState([]);
  const handleGetMentions = (query: string) => {
    const mentionsService = channels.profiles.profileService.searchProfiles({ name: query });
    mentionsService.subscribe((resp: any) => {
      if (resp.data?.searchProfiles) {
        const filteredMentions = resp.data.searchProfiles;
        setMentions(filteredMentions);
      }
    });
  };

  const handleNavigateToPost = redirectToPost(navigateToUrl);

  const onUploadRequest = uploadMediaToTextile(
    channels.profiles.profileService,
    channels.commons.ipfsService,
  );
  return (
    <MainAreaCardBox style={{ height: 'auto' }}>
      <Helmet>
        <title>AKASHA Post | Ethereum.world</title>
      </Helmet>
      <ModalRenderer slotId={slotId}>
        {reportModalOpen && (
          <ToastProvider autoDismiss={true} autoDismissTimeout={5000}>
            <ReportModal
              titleLabel={t('Report a Post')}
              successTitleLabel={t('Thank you for helping us keep Ethereum World Safe! 🙌')}
              successMessageLabel={t('We will investigate this post and take appropriate action.')}
              optionsTitleLabel={t('Please select a reason')}
              optionLabels={[
                t('Suspicious, deceptive, or spam'),
                t('Abusive or harmful to others'),
                t('Self-harm or suicide'),
                t('Illegal'),
                t('Nudity'),
                t('Violence'),
              ]}
              descriptionLabel={t('Explanation')}
              descriptionPlaceholder={t('Please explain your reason(s)')}
              footerText1Label={t('If you are unsure, you can refer to our')}
              footerLink1Label={t('Code of Conduct')}
              footerUrl1={'https://akasha.slab.com/public/ethereum-world-code-of-conduct-e7ejzqoo'}
              footerText2Label={t('and')}
              footerLink2Label={t('Terms of Service')}
              footerUrl2={'https://ethereum.world/terms-of-service'}
              cancelLabel={t('Cancel')}
              reportLabel={t('Report')}
              blockLabel={t('Block User')}
              closeLabel={t('Close')}
              user={ethAddress ? ethAddress : ''}
              contentId={flagged}
              size={size}
              closeModal={() => {
                setReportModalOpen(false);
              }}
            />
          </ToastProvider>
        )}
      </ModalRenderer>
      {entryData && (
        <>
          <Box
            margin={{ horizontal: 'medium' }}
            pad={{ bottom: 'small' }}
            border={{ side: 'bottom', size: '1px', color: 'border' }}
          >
            <EntryBox
              isBookmarked={bookmarked}
              entryData={entryData}
              sharePostLabel={t('Share Post')}
              shareTextLabel={t('Share this post with your friends')}
              sharePostUrl={'https://ethereum.world'}
              onClickAvatar={(ev: React.MouseEvent<HTMLDivElement>) =>
                handleAvatarClick(ev, entryData.author.ethAddress)
              }
              onEntryBookmark={handleEntryBookmark}
              repliesLabel={t('Replies')}
              repostsLabel={t('Reposts')}
              repostLabel={t('Repost')}
              repostWithCommentLabel={t('Repost with comment')}
              shareLabel={t('Share')}
              copyLinkLabel={t('Copy Link')}
              copyIPFSLinkLabel={t('Copy IPFS Link')}
              flagAsLabel={t('Report Post')}
              loggedProfileEthAddress={'0x00123123123123'}
              locale={locale}
              bookmarkLabel={t('Save')}
              bookmarkedLabel={t('Saved')}
              onRepost={() => {
                return;
              }}
              onEntryShare={handleEntryShare}
              onEntryFlag={handleEntryFlag(entryData.entryId, ethAddress)}
              onClickReplies={handleClickReplies}
              handleFollow={handleFollow}
              handleUnfollow={handleUnfollow}
              onContentClick={handleNavigateToPost}
              onMentionClick={handleMentionClick}
            />
          </Box>
          {!ethAddress && (
            <Box margin="medium">
              <EditorPlaceholder onClick={showLoginModal} ethAddress={null} />
            </Box>
          )}
          {ethAddress && (
            <Box margin="medium">
              <CommentEditor
                ethAddress={ethAddress}
                postLabel={t('Reply')}
                placeholderLabel={t('Write something')}
                onPublish={handlePublish}
                getMentions={handleGetMentions}
                getTags={handleGetTags}
                tags={tags}
                mentions={mentions}
                uploadRequest={onUploadRequest}
              />
            </Box>
          )}
        </>
      )}
      <VirtualList
        items={feedState.feedItems}
        itemsData={feedState.feedItemData}
        loadMore={handleLoadMore}
        loadItemData={loadItemData}
        hasMoreItems={feedState.hasMoreItems}
        itemCard={
          <PostRenderer
            bookmarks={bookmarks}
            ethAddress={ethAddress}
            locale={locale}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onBookmark={handleEntryBookmark}
            onNavigate={handleNavigateToPost}
            onRepliesClick={handleClickReplies}
            onFlag={handleEntryFlag}
            onRepost={handleEntryRepost}
            onShare={handleEntryShare}
            onAvatarClick={handleAvatarClick}
          />
        }
      />
    </MainAreaCardBox>
  );
};

export default PostPage;
