import * as React from 'react';
import DS from '@akashaproject/design-system';
import { useTranslation } from 'react-i18next';

const { ErrorInfoCard, ErrorLoader, EntryBox, Box, EntryCardLoading } = DS;

export interface PostRendererProps {
  itemId?: string;
  itemData?: any;
  isBookmarked?: boolean;
  locale: any;
  ethAddress?: string | null;
  onFollow: () => void;
  onUnfollow: () => void;
  onBookmark: (entryId: string) => void;
  onNavigate: (details: any) => void;
  onLinkCopy?: () => void;
  onRepliesClick: () => void;
  onFlag: (entryId: string, user: string | null) => () => void;
  onRepost: (withComment: boolean, entryData: any) => void;
  onShare: (service: string, entryId: string) => void;
  onAvatarClick: (ev: React.MouseEvent<HTMLDivElement>, authorEth: string) => void;
  bookmarks?: Set<string>;
  style?: React.CSSProperties;
}

const PostRenderer = (props: PostRendererProps) => {
  const { itemData, isBookmarked, style } = props;
  const { t } = useTranslation();
  return (
    <ErrorInfoCard errors={{}}>
      {(errorMessages: any, hasCriticalErrors: boolean) => (
        <>
          {errorMessages && (
            <ErrorLoader
              type="script-error"
              title={t('There was an error loading the entry')}
              details={t('We cannot show this entry right now')}
              devDetails={errorMessages}
            />
          )}
          {!hasCriticalErrors && (
            <>
              {(!itemData || !itemData.author?.ethAddress) && <EntryCardLoading />}
              {itemData && itemData.author.ethAddress && (
                <Box
                  margin={{ horizontal: 'medium' }}
                  border={{ side: 'bottom', size: '1px', color: 'border' }}
                >
                  <EntryBox
                    isBookmarked={isBookmarked}
                    entryData={itemData}
                    sharePostLabel={t('Share Post')}
                    shareTextLabel={t('Share this post with your friends')}
                    sharePostUrl={'https://ethereum.world'}
                    onClickAvatar={(ev: React.MouseEvent<HTMLDivElement>) =>
                      props.onAvatarClick(ev, itemData.author.ethAddress)
                    }
                    onEntryBookmark={props.onBookmark}
                    repliesLabel={t('Replies')}
                    repostsLabel={t('Reposts')}
                    repostLabel={t('Repost')}
                    repostWithCommentLabel={t('Repost with comment')}
                    shareLabel={t('Share')}
                    copyLinkLabel={t('Copy Link')}
                    copyIPFSLinkLabel={t('Copy IPFS Link')}
                    flagAsLabel={t('Report Post')}
                    loggedProfileEthAddress={'0x00123123123123'}
                    locale={props.locale}
                    bookmarkLabel={t('Save')}
                    bookmarkedLabel={t('Saved')}
                    onRepost={props.onRepost}
                    onEntryShare={props.onShare}
                    onEntryFlag={props.onFlag(itemData.entryId, null)}
                    onClickReplies={props.onRepliesClick}
                    handleFollow={props.onFollow}
                    handleUnfollow={props.onUnfollow}
                    style={style}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </ErrorInfoCard>
  );
};

export default PostRenderer;
