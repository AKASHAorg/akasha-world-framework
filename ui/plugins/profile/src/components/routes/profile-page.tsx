import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import DS from '@akashaproject/design-system';
import { constants, useErrors, usePosts, useProfile } from '@akashaproject/ui-awf-hooks';
import { RootComponentProps } from '@akashaproject/ui-awf-typings/src';
import {
  ModalState,
  ModalStateActions,
  MODAL_NAMES,
} from '@akashaproject/ui-awf-hooks/lib/use-modal-state';
import { UseLoginActions } from '@akashaproject/ui-awf-hooks/lib/use-login-state';
import FeedWidget, { ItemTypes } from '@akashaproject/ui-widget-feed/lib/components/App';
import { ILoadItemsPayload } from '@akashaproject/design-system/lib/components/VirtualList/interfaces';
import { IContentClickDetails } from '@akashaproject/design-system/lib/components/Cards/entry-cards/entry-box';

import { ProfilePageCard } from '../profile-cards/profile-card';
import menuRoute, { MY_PROFILE } from '../../routes';

const { Box, Helmet, ReportModal, ToastProvider, ModalRenderer } = DS;

export interface ProfilePageProps extends RootComponentProps {
  modalActions: ModalStateActions;
  modalState: ModalState;
  loggedEthAddress: string | null;
  loginActions: UseLoginActions;
  loggedProfileData: any;
  flagged: string;
  reportModalOpen: boolean;
  showLoginModal: () => void;
  setFlagged: React.Dispatch<React.SetStateAction<string>>;
  setReportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfilePage = (props: ProfilePageProps) => {
  const {
    loggedEthAddress,
    loginActions,
    loggedProfileData,
    flagged,
    reportModalOpen,
    setFlagged,
    showLoginModal,
    setReportModalOpen,
  } = props;
  const location = useLocation();

  let { pubKey } = useParams() as any;
  if (location.pathname.includes(menuRoute[MY_PROFILE])) {
    pubKey = loggedProfileData.pubKey;
  }
  const [errorState, errorActions] = useErrors({
    logger: props.logger,
  });

  const [profileState, profileActions, profileUpdateStatus] = useProfile({
    onError: errorActions.createError,
    ipfsService: props.sdkModules.commons.ipfsService,
    profileService: props.sdkModules.profiles.profileService,
    ensService: props.sdkModules.registry.ens,
  });

  const [postsState, postsActions] = usePosts({
    postsService: props.sdkModules.posts,
    ipfsService: props.sdkModules.commons.ipfsService,
    onError: errorActions.createError,
    user: loggedEthAddress,
  });

  React.useEffect(() => {
    // reset post ids and virtual list, if user logs in
    if (loggedEthAddress) {
      postsActions.resetPostIds();
    }
  }, [loggedEthAddress]);

  React.useEffect(() => {
    if (pubKey) {
      profileActions.resetProfileData();
      profileActions.getProfileData({ pubKey });
      postsActions.resetPostIds();
    }
  }, [pubKey]);

  /**
   * Hook used in the /profile/my-profile route
   * because we don't have the /:pubkey url param
   */
  React.useEffect(() => {
    if (
      loggedProfileData.pubKey &&
      pubKey === loggedProfileData.pubKey &&
      !postsState.postIds.length &&
      !postsState.isFetchingPosts
    ) {
      postsActions.getUserPosts({ pubKey: loggedProfileData.pubKey, limit: 5 });
    }
  }, [loggedProfileData.pubKey, pubKey]);

  const { t } = useTranslation();

  const handleLoadMore = (payload: ILoadItemsPayload) => {
    const req: { limit: number; offset?: string } = {
      limit: payload.limit,
    };
    if (!postsState.isFetchingPosts && pubKey) {
      postsActions.getUserPosts({ pubKey, ...req });
    }
  };

  const handleItemDataLoad = ({ itemId }: { itemId: string }) => {
    postsActions.getPost(itemId);
  };

  const handleNavigation = (itemType: ItemTypes, details: IContentClickDetails) => {
    let url;
    switch (itemType) {
      case ItemTypes.PROFILE:
        if (details.entryId === pubKey) {
          return;
        }
        url = `/profile/${details.entryId}`;
        break;
      case ItemTypes.TAG:
        url = `/AKASHA-app/tags/${details.entryId}`;
        break;
      case ItemTypes.ENTRY:
        url = `/AKASHA-app/post/${details.entryId}`;
        break;
      case ItemTypes.COMMENT:
        /* Navigate to parent post because we don't have the comment page yet */
        const parentId = postsState.postsData[details.entryId].postId;
        url = `/AKASHA-app/post/${parentId}`;
        break;
      default:
        break;
    }
    props.singleSpa.navigateToUrl(url);
  };

  const handleLoginModalOpen = () => {
    props.modalActions.show(MODAL_NAMES.LOGIN);
  };

  const handleRepostPublish = (entryData: any, embedEntry: any) => {
    postsActions.optimisticPublishPost(entryData, loggedProfileData, embedEntry, true);
  };

  const profileUserName = React.useMemo(() => {
    if (profileState.name) {
      return profileState.name;
    }
    if (profileState.ensName) {
      return profileState.ensName;
    }
    return pubKey;
  }, [profileState, pubKey]);

  const handleEntryFlag = (entryId: string, user?: string | null) => {
    if (!user) {
      // setting entryId to state first, if not logged in
      setFlagged(entryId);
      return showLoginModal();
    }
    setFlagged(entryId);
    setReportModalOpen(true);
  };

  const handleFlipCard = (entry: any, isQuote: boolean) => () => {
    const modifiedEntry = isQuote
      ? { ...entry, quote: { ...entry.quote, reported: false } }
      : { ...entry, reported: false };
    postsActions.updatePostsState(modifiedEntry);
  };

  const updateEntry = (entryId: string) => {
    const modifiedEntry = { ...postsState.postsData[entryId], reported: true };
    postsActions.updatePostsState(modifiedEntry);
  };

  return (
    <Box fill="horizontal">
      <Helmet>
        <title>
          {t('Profile')} | {t("{{profileUsername}}'s Page", { profileUsername: profileUserName })}
        </title>
      </Helmet>
      <ModalRenderer slotId={props.layout.app.modalSlotId}>
        {reportModalOpen && (
          <ToastProvider autoDismiss={true} autoDismissTimeout={5000}>
            <ReportModal
              titleLabel={t('Report a post')}
              successTitleLabel={t('Thank you for helping us keep Ethereum World safe! 🙌')}
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
              optionValues={[
                'Suspicious, deceptive, or spam',
                'Abusive or harmful to others',
                'Self-harm or suicide',
                'Illegal',
                'Nudity',
                'Violence',
              ]}
              descriptionLabel={t('Explanation')}
              descriptionPlaceholder={t('Please explain your reason(s)')}
              footerText1Label={t('If you are unsure, you can refer to our')}
              footerLink1Label={t('Code of Conduct')}
              footerUrl1={'https://akasha.slab.com/public/ethereum-world-code-of-conduct-e7ejzqoo'}
              cancelLabel={t('Cancel')}
              reportLabel={t('Report')}
              blockLabel={t('Block User')}
              closeLabel={t('Close')}
              user={loggedEthAddress ? loggedEthAddress : ''}
              contentId={flagged}
              contentType="post"
              baseUrl={constants.BASE_FLAG_URL}
              updateEntry={updateEntry}
              closeModal={() => {
                setReportModalOpen(false);
              }}
            />
          </ToastProvider>
        )}
      </ModalRenderer>
      <ProfilePageCard
        {...props}
        profileData={profileState as any}
        profileActions={profileActions}
        profileUpdateStatus={profileUpdateStatus}
        profileId={pubKey}
        loggedUserEthAddress={loggedEthAddress}
        modalActions={props.modalActions}
        modalState={props.modalState}
        loginActions={loginActions}
      />
      <FeedWidget
        // pass i18n from props (the i18next instance, not the react one!)
        i18n={props.i18n}
        itemType={ItemTypes.ENTRY}
        logger={props.logger}
        loadMore={handleLoadMore}
        loadItemData={handleItemDataLoad}
        getShareUrl={(itemId: string) => `${window.location.origin}/AKASHA-app/post/${itemId}`}
        itemIds={postsState.postIds}
        itemsData={postsState.postsData}
        errors={errorState}
        sdkModules={props.sdkModules}
        layout={props.layout}
        globalChannel={props.globalChannel}
        ethAddress={loggedEthAddress}
        onNavigate={handleNavigation}
        onLoginModalOpen={handleLoginModalOpen}
        totalItems={postsState.totalItems}
        profilePubKey={pubKey}
        modalSlotId={props.layout.app.modalSlotId}
        loggedProfile={loggedProfileData}
        onRepostPublish={handleRepostPublish}
        contentClickable={true}
        onReport={handleEntryFlag}
        handleFlipCard={handleFlipCard}
      />
    </Box>
  );
};

export default ProfilePage;
