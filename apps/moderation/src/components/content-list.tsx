import React from 'react';
import SingleSpa from 'single-spa';
import { useTranslation } from 'react-i18next';
import DS from '@akashaproject/design-system';
import { ILocale } from '@akashaproject/design-system/lib/utils/time';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';
import {
  useGetCount,
  useInfiniteKept,
  useCheckModerator,
  useInfinitePending,
  useInfiniteDelisted,
} from '@akashaproject/ui-awf-hooks/lib/moderation-request';

import ContentTab from './content-tab';
import ContentCard from './content-card/content-card';
import NoItemsFound from './no-items-found';
import PromptAuthorization from './prompt-authorization';

const { Box, Spinner, SwitchCard, useIntersectionObserver } = DS;

interface IContentListProps {
  slotId: string;
  user: string | null;
  singleSpa: typeof SingleSpa;
}

interface IBaseItem {
  id: number;
  type: string;
  entryId: string;
  reasons: string[];
  description?: string;
  count: number;
  entryDate: string;
}

interface IProfile {
  avatar: string;
  ethAddress: string;
  pubKey: string;
  name: string;
  userName: string;
}

interface IPendingItem extends IBaseItem {
  reporter: string;
  reporterProfile: IProfile;
}

interface IModeratedItem extends IPendingItem {
  delisted: boolean;
  moderator: string;
  moderatorProfile: IProfile;
  evaluationDate: string;
}

export interface ICount {
  kept: number;
  pending: number;
  delisted: number;
}

const DEFAULT_LIMIT = 10;

const ContentList: React.FC<IContentListProps & RootComponentProps> = props => {
  const { user } = props;

  const [isPending, setIsPending] = React.useState<boolean>(true);
  const [isDelisted, setIsDelisted] = React.useState<boolean>(true);
  const [activeButton, setActiveButton] = React.useState<string>('Delisted');

  const { t, i18n } = useTranslation();
  const locale = (i18n.languages[0] || 'en') as ILocale;

  const getCountQuery = useGetCount();
  const count = getCountQuery.data;

  const checkModeratorQuery = useCheckModerator(user);
  const checkModeratorResp = checkModeratorQuery.data;
  const isAuthorised = React.useMemo(() => {
    if (checkModeratorResp === 200) {
      return true;
    } else return false;
  }, [checkModeratorResp]);

  const pendingItemsQuery = useInfinitePending(DEFAULT_LIMIT);
  const pendingItemPages = React.useMemo(() => {
    if (pendingItemsQuery.data) {
      return pendingItemsQuery.data.pages;
    }
    return [];
  }, [pendingItemsQuery.data]);

  const keptItemsQuery = useInfiniteKept(DEFAULT_LIMIT);
  const keptItemPages = React.useMemo(() => {
    if (keptItemsQuery.data) {
      return keptItemsQuery.data.pages;
    }
    return [];
  }, [keptItemsQuery.data]);

  const delistedItemsQuery = useInfiniteDelisted(DEFAULT_LIMIT);
  const delistedItemPages = React.useMemo(() => {
    if (delistedItemsQuery.data) {
      return delistedItemsQuery.data.pages;
    }
    return [];
  }, [delistedItemsQuery.data]);

  React.useEffect(() => {
    if (!user) {
      // if not authenticated, prompt to authenticate
      props.singleSpa.navigateToUrl('/moderation-app/unauthenticated');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLoadMorePending = React.useCallback(() => {
    if (!pendingItemsQuery.isLoading && pendingItemsQuery.hasNextPage) {
      pendingItemsQuery.fetchNextPage();
    }
  }, [pendingItemsQuery]);

  const handleLoadMoreKept = React.useCallback(() => {
    if (!keptItemsQuery.isLoading && keptItemsQuery.hasNextPage) {
      keptItemsQuery.fetchNextPage();
    }
  }, [keptItemsQuery]);

  const handleLoadMoreDelisted = React.useCallback(() => {
    if (!delistedItemsQuery.isLoading && delistedItemsQuery.hasNextPage) {
      delistedItemsQuery.fetchNextPage();
    }
  }, [delistedItemsQuery]);

  // loadmore refs
  const loadmorePendingRef = React.createRef<HTMLDivElement>();
  const loadmoreKeptRef = React.createRef<HTMLDivElement>();
  const loadmoreDelistedRef = React.createRef<HTMLDivElement>();

  // intersection observers
  useIntersectionObserver({
    target: loadmorePendingRef,
    onIntersect: handleLoadMorePending,
    threshold: 0,
  });

  useIntersectionObserver({
    target: loadmoreKeptRef,
    onIntersect: handleLoadMoreKept,
    threshold: 0,
  });

  useIntersectionObserver({
    target: loadmoreDelistedRef,
    onIntersect: handleLoadMoreDelisted,
    threshold: 0,
  });

  const handleButtonClick = (entryId: string, itemType: string) => {
    props.navigateToModal({
      name: 'moderate-modal',
      status: isPending ? 'pending' : 'moderated',
      entryId,
      itemType,
    });
  };

  const buttonLabels = [t('Kept'), t('Delisted')];

  const buttonValues = ['Kept', 'Delisted'];

  const onTabClick = (value: string) => {
    // set active button state
    setActiveButton(buttonValues[buttonLabels.indexOf(value)]);
    // toggle list accordingly
    if (value === 'Kept') {
      setIsDelisted(false);
    } else if (value === 'Delisted') {
      setIsDelisted(true);
    }
  };

  if (!isAuthorised) {
    return (
      <PromptAuthorization
        titleLabel={t('You must be an Ethereum World Moderator to access this page')}
        subtitleLabel={t(
          'The wallet you connected does not match a moderator account in our system. Please try again with the correct wallet.',
        )}
      />
    );
  }

  return (
    <Box>
      <ContentTab
        isPending={isPending}
        pendingLabel={t('Pending')}
        moderatedLabel={t('Moderated')}
        countKept={count.kept}
        countPending={count.pending}
        countDelisted={count.delisted}
        setIsPending={setIsPending}
      />
      {!isPending && (
        <SwitchCard
          count={isDelisted ? count.delisted : count.kept}
          activeButton={activeButton}
          countLabel={!isDelisted ? buttonLabels[0] : buttonLabels[1]}
          buttonLabels={buttonLabels}
          buttonValues={buttonValues}
          onTabClick={onTabClick}
          buttonsWrapperWidth={'40%'}
          loggedUser={user}
        />
      )}
      {!pendingItemsQuery.isLoading &&
        isPending &&
        (pendingItemPages.length ? (
          <>
            {pendingItemPages.map((page, index) => (
              <Box key={index} flex={false}>
                {page.results.map((pendingItem: IPendingItem, index: number) => (
                  <ContentCard
                    {...props}
                    key={index}
                    isPending={isPending}
                    locale={locale}
                    showExplanationsLabel={t('Show explanations')}
                    hideExplanationsLabel={t('Hide explanations')}
                    reportedLabel={t('reported')}
                    itemType={pendingItem.type}
                    forLabel={t('for')}
                    reportedByLabel={t('Reported by')}
                    originallyReportedByLabel={t('Initially reported by')}
                    entryId={pendingItem.entryId}
                    reasons={pendingItem.reasons.map((el: string) => t(el))}
                    reporter={pendingItem.reporter}
                    reporterAvatar={pendingItem.reporterProfile.avatar}
                    reporterName={pendingItem.reporterProfile.name}
                    reporterENSName={pendingItem.reporterProfile.userName}
                    andLabel={t('and')}
                    otherReporters={
                      pendingItem.count
                        ? `${pendingItem.count} ${
                            pendingItem.count === 1 ? `${t('other')}` : `${t('others')}`
                          }`
                        : ''
                    }
                    reportedOnLabel={t('On')}
                    reportedDateTime={pendingItem.entryDate}
                    makeADecisionLabel={t('Make a Decision')}
                    handleButtonClick={handleButtonClick}
                  />
                ))}
              </Box>
            ))}
            {/* fetch indicator for load more on scroll */}
            {pendingItemsQuery.isLoading && pendingItemPages.length < 1 && (
              <Box pad="large">
                <Spinner />
              </Box>
            )}
            {/* triggers intersection observer */}
            <Box pad="xxsmall" ref={loadmorePendingRef} />
          </>
        ) : (
          <NoItemsFound activeTab={'pending'} />
        ))}
      {!delistedItemsQuery.isLoading &&
        !isPending &&
        (isDelisted && delistedItemPages.length ? (
          <>
            {delistedItemPages.map((page, index) => (
              <Box key={index} flex={false}>
                {page.results.map((moderatedItem: IModeratedItem, index: number) => (
                  <ContentCard
                    {...props}
                    key={index}
                    isPending={isPending}
                    locale={locale}
                    showExplanationsLabel={t('Show explanations')}
                    hideExplanationsLabel={t('Hide explanations')}
                    determinationLabel={t('Determination')}
                    determination={moderatedItem.delisted ? t('Delisted') : t('Kept')}
                    reportedLabel={t('reported')}
                    itemType={moderatedItem.type}
                    forLabel={t('for')}
                    reportedByLabel={t('Reported by')}
                    originallyReportedByLabel={t('Initially reported by')}
                    entryId={moderatedItem.entryId}
                    reasons={moderatedItem.reasons.map(el => t(el))}
                    reporter={moderatedItem.reporter}
                    reporterAvatar={moderatedItem.reporterProfile.avatar}
                    reporterName={moderatedItem.reporterProfile.name}
                    reporterENSName={moderatedItem.reporterProfile.userName}
                    andLabel={t('and')}
                    otherReporters={
                      moderatedItem.count
                        ? `${moderatedItem.count} ${
                            moderatedItem.count === 1 ? `${t('other')}` : `${t('others')}`
                          }`
                        : ''
                    }
                    reportedOnLabel={t('On')}
                    reportedDateTime={moderatedItem.entryDate}
                    moderatorDecision={moderatedItem.description}
                    moderator={moderatedItem.moderator}
                    moderatorName={moderatedItem.moderatorProfile.name}
                    moderatorENSName={moderatedItem.moderatorProfile.userName}
                    moderatedByLabel={t('Moderated by')}
                    moderatedOnLabel={t('On')}
                    evaluationDateTime={moderatedItem.evaluationDate}
                    reviewDecisionLabel={t('Review decision')}
                    handleButtonClick={handleButtonClick}
                  />
                ))}
              </Box>
            ))}
            {/* fetch indicator for load more on scroll */}
            {delistedItemsQuery.isLoading && delistedItemPages.length < 1 && (
              <Box pad="large">
                <Spinner />
              </Box>
            )}
            {/* triggers intersection observer */}
            <Box
              pad="xxsmall"
              ref={loadmoreDelistedRef}
              border={{ color: 'red', size: '0.1rem' }}
            />
          </>
        ) : !isDelisted && keptItemPages.length ? (
          <>
            {keptItemPages.map((page, index) => (
              <Box key={index} flex={false}>
                {page.results.map((moderatedItem: IModeratedItem, index: number) => (
                  <ContentCard
                    {...props}
                    key={index}
                    isPending={isPending}
                    locale={locale}
                    showExplanationsLabel={t('Show explanations')}
                    hideExplanationsLabel={t('Hide explanations')}
                    determinationLabel={t('Determination')}
                    determination={moderatedItem.delisted ? t('Delisted') : t('Kept')}
                    reportedLabel={t('reported')}
                    itemType={moderatedItem.type}
                    forLabel={t('for')}
                    reportedByLabel={t('Reported by')}
                    originallyReportedByLabel={t('Initially reported by')}
                    entryId={moderatedItem.entryId}
                    reasons={moderatedItem.reasons.map(el => t(el))}
                    reporter={moderatedItem.reporter}
                    reporterAvatar={moderatedItem.reporterProfile.avatar}
                    reporterName={moderatedItem.reporterProfile.name}
                    reporterENSName={moderatedItem.reporterProfile.userName}
                    andLabel={t('and')}
                    otherReporters={
                      moderatedItem.count
                        ? `${moderatedItem.count} ${
                            moderatedItem.count === 1 ? `${t('other')}` : `${t('others')}`
                          }`
                        : ''
                    }
                    reportedOnLabel={t('On')}
                    reportedDateTime={moderatedItem.entryDate}
                    moderatorDecision={moderatedItem.description}
                    moderator={moderatedItem.moderator}
                    moderatorName={moderatedItem.moderatorProfile.name}
                    moderatorENSName={moderatedItem.moderatorProfile.userName}
                    moderatedByLabel={t('Moderated by')}
                    moderatedOnLabel={t('On')}
                    evaluationDateTime={moderatedItem.evaluationDate}
                    reviewDecisionLabel={t('Review decision')}
                    handleButtonClick={handleButtonClick}
                  />
                ))}
              </Box>
            ))}
            {/* fetch indicator for load more on scroll */}
            {keptItemsQuery.isLoading && keptItemPages.length < 1 && (
              <Box pad="large">
                <Spinner />
              </Box>
            )}
            {/* triggers intersection observer */}
            <Box pad="xxsmall" ref={loadmoreKeptRef} border={{ color: 'red', size: '0.1rem' }} />
          </>
        ) : (
          <NoItemsFound activeTab={'moderated'} />
        ))}
    </Box>
  );
};

export default ContentList;
