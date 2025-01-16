import React, { useMemo } from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ErrorBoundary from '@akashaorg/design-system-core/lib/components/ErrorBoundary';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import TrendingWidgetLoadingCard from '@akashaorg/design-system-components/lib/components/TrendingWidgetLoadingCard';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { useTranslation } from 'react-i18next';
import { hasOwn, useAkashaStore, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import {
  useGetInterestsByDidQuery,
  useGetInterestsStreamQuery,
  useGetProfileStreamQuery,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { LatestProfiles, LatestTopics } from './cards';
import { useGetIndexingDID } from '@akashaorg/ui-core-hooks/lib/use-settings';
import { SortOrder } from '@akashaorg/typings/lib/sdk/graphql-types-new';

const TrendingWidgetComponent: React.FC<unknown> = () => {
  const { t } = useTranslation('ui-widget-trending');
  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;
  const { uiEvents, logger, navigateToModal, getCorePlugins } = useRootComponentProps();
  const navigateTo = getCorePlugins().routing.navigateTo;

  const currentIndexingDID = useGetIndexingDID();
  const {
    data: latestTopicsReqData,
    loading: latestTopicsLoading,
    error: latestTopicsError,
  } = useGetInterestsStreamQuery({
    variables: {
      last: 4,
      indexer: currentIndexingDID,
    },
  });
  const { data: tagSubscriptionsData, refetch: refetchTagSubscriptions } =
    useGetInterestsByDidQuery({
      variables: { id: authenticatedDID },
      skip: !isLoggedIn,
    });
  const latestProfileStreamReq = useGetProfileStreamQuery({
    variables: {
      first: 4,
      indexer: currentIndexingDID,
      sorting: { createdAt: SortOrder.Desc },
    },
  });
  const latestProfileIDs: string[] = useMemo(() => {
    if (
      latestProfileStreamReq.data?.node &&
      hasOwn(latestProfileStreamReq.data.node, 'akashaProfileStreamList')
    ) {
      return (
        latestProfileStreamReq.data.node.akashaProfileStreamList?.edges?.map(
          edge => edge.node?.profileID || '',
        ) || []
      );
    }
    return [];
  }, [latestProfileStreamReq.data]);

  const latestTopics =
    latestTopicsReqData?.node && hasOwn(latestTopicsReqData.node, 'akashaInterestsStreamList')
      ? latestTopicsReqData?.node.akashaInterestsStreamList?.edges.map(edge => edge.node.value)
      : [];

  const tagSubscriptions = useMemo(() => {
    if (!isLoggedIn) return null;
    return tagSubscriptionsData &&
      hasOwn(tagSubscriptionsData.node, 'akashaProfileInterests') &&
      tagSubscriptionsData.node.akashaProfileInterests?.topics.length > 0
      ? tagSubscriptionsData.node.akashaProfileInterests?.topics.map(topic => topic.value)
      : [];
  }, [isLoggedIn, tagSubscriptionsData]);

  const tagSubscriptionsId = useMemo(() => {
    if (!isLoggedIn) return null;
    return tagSubscriptionsData && hasOwn(tagSubscriptionsData.node, 'akashaProfileInterests')
      ? tagSubscriptionsData.node.akashaProfileInterests?.id
      : null;
  }, [isLoggedIn, tagSubscriptionsData]);

  const showLoginModal = () => {
    navigateToModal({ name: 'login' });
  };

  const handleTopicClick = (topic: string) => {
    navigateTo?.({
      appName: '@akashaorg/app-antenna',
      getNavigationUrl: navRoutes => `${navRoutes.Tags}/${topic}`,
    });
  };

  const handleProfileClick = (did: string) => {
    navigateTo?.({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: navRoutes => `${navRoutes.rootRoute}/${did}`,
    });
  };

  return (
    <Stack spacing="gap-y-4">
      {(latestTopicsError || latestProfileStreamReq.error) && (
        <ErrorLoader
          type="script-error"
          title={t('Oops, this widget has an error')}
          details={
            latestTopicsError ? t('Cannot load latest topics') : t('Cannot load latest profiles')
          }
        />
      )}

      {!latestTopicsError && (
        <ErrorBoundary
          errorObj={{
            type: 'script-error',
            title: t('Error in latest topics widget'),
          }}
          logger={logger}
        >
          <LatestTopics
            titleLabel={t('Latest Topics')}
            tagSubtitleLabel={t('Beam')}
            subscribeLabel={t('Subscribe')}
            subscribedLabel={t('Subscribed')}
            unsubscribeLabel={t('Unsubscribe')}
            noTagsLabel={t('No topics found!')}
            isLoadingTags={latestTopicsLoading}
            tags={latestTopics}
            receivedTags={tagSubscriptions}
            tagSubscriptionsId={tagSubscriptionsId}
            isLoggedIn={isLoggedIn}
            authenticatedDID={authenticatedDID}
            onClickTopic={handleTopicClick}
            showLoginModal={showLoginModal}
            refetchTagSubscriptions={refetchTagSubscriptions}
          />
        </ErrorBoundary>
      )}

      {!latestProfileStreamReq.error && (
        <ErrorBoundary
          errorObj={{
            type: 'script-error',
            title: t('Error in latest profiles widget'),
          }}
          logger={logger}
        >
          <>
            {latestProfileStreamReq.loading && <TrendingWidgetLoadingCard />}
            {latestProfileStreamReq.data && (
              <>
                {latestProfileIDs?.length === 0 ? (
                  <Stack justify="center" align="center" customStyle="py-2">
                    <Text>{t('No profiles found!')}</Text>
                  </Stack>
                ) : (
                  <Card padding={16}>
                    <Stack customStyle="mb-4">
                      <Text variant="button-md" weight="bold">
                        {t('Start Following')}
                      </Text>
                    </Stack>
                    <Stack
                      customStyle={'ring(white opacity-60  offset(2 blue-400)) focus:outline-none'}
                    >
                      <Stack spacing="gap-y-4">
                        {latestProfileIDs.map(profileID => (
                          <LatestProfiles
                            key={profileID}
                            profileID={profileID}
                            authenticatedDID={authenticatedDID}
                            uiEvents={uiEvents}
                            onClickProfile={handleProfileClick}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                )}
              </>
            )}
          </>
        </ErrorBoundary>
      )}
    </Stack>
  );
};

export default TrendingWidgetComponent;
