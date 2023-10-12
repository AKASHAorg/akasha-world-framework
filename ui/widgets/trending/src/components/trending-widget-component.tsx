import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AnalyticsCategories } from '@akashaorg/typings/lib/ui';
import {
  useAnalytics,
  useRootComponentProps,
  getFollowList,
  useLoggedIn,
} from '@akashaorg/ui-awf-hooks';
import {
  useGetProfilesQuery,
  useGetInterestsStreamQuery,
  useGetInterestsByDidQuery,
  useCreateInterestsMutation,
  useGetFollowDocumentsQuery,
} from '@akashaorg/ui-awf-hooks/lib/generated/hooks-new';
import { useQueryClient } from '@tanstack/react-query';

import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';

import { LatestProfiles, LatestTopics } from './cards';
import { Extension } from '@akashaorg/ui-lib-extensions/lib/react/extension';

const TrendingWidgetComponent: React.FC<unknown> = () => {
  const { plugins, uiEvents, navigateToModal } = useRootComponentProps();
  const [loginModal, setLoginModal] = React.useState({ isActive: false, modalData: {} });
  const navigateTo = plugins['@akashaorg/app-routing']?.routing?.navigateTo;

  const { t } = useTranslation('ui-widget-trending');
  const { isLoggedIn, loggedInProfileId } = useLoggedIn();
  const queryClient = useQueryClient();

  const [processingTags, setProcessingTags] = useState([]);

  const [analyticsActions] = useAnalytics();
  const latestProfilesReq = useGetProfilesQuery(
    { last: 4 },
    { select: result => result?.akashaProfileIndex?.edges.map(profile => profile.node) },
  );
  const latestTopicsReq = useGetInterestsStreamQuery(
    { last: 4 },
    {
      select: result =>
        result?.akashaInterestsStreamIndex?.edges.flatMap(interest => interest.node),
    },
  );
  const tagSubscriptionsReq = useGetInterestsByDidQuery(
    { id: loggedInProfileId },
    {
      enabled: isLoggedIn,
      select: resp => {
        const { akashaProfileInterests } = resp.node as {
          akashaProfileInterests: { topics: { value: string; labelType: string }[] };
        };

        return akashaProfileInterests?.topics ?? [];
      },
    },
  );
  const latestProfiles = useMemo(() => latestProfilesReq.data || [], [latestProfilesReq.data]);
  const followProfileIds = useMemo(
    () => latestProfiles.map(follower => follower.id),
    [latestProfiles],
  );
  const followDocumentsReq = useGetFollowDocumentsQuery(
    {
      following: followProfileIds,
      last: followProfileIds.length,
    },
    { select: response => response.viewer?.akashaFollowList, enabled: isLoggedIn },
  );
  const createInterest = useCreateInterestsMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: useGetInterestsByDidQuery.getKey({ id: loggedInProfileId }),
      });
    },
  });

  const latestTopics = latestTopicsReq.data || [];
  const tagSubscriptions = tagSubscriptionsReq.data;
  const followList = isLoggedIn
    ? getFollowList(followDocumentsReq.data?.edges?.map(edge => edge?.node))
    : null;

  const showLoginModal = () => {
    setLoginModal(prev => ({
      ...prev,
      isActive: true,
    }));
  };

  const handleTopicClick = (topic: string) => {
    navigateTo?.({
      appName: '@akashaorg/app-akasha-integration',
      getNavigationUrl: navRoutes => `${navRoutes.Tags}/${topic}`,
    });
  };

  const handleTopicSubscribe = (topic: string) => {
    if (!isLoggedIn) {
      showLoginModal();
      return;
    }
    analyticsActions.trackEvent({
      category: AnalyticsCategories.TRENDING_WIDGET,
      action: 'Trending Topic Subscribed',
    });

    setProcessingTags(prevState => [...prevState, topic]);
    createInterest
      .mutateAsync({
        i: { content: { topics: [...tagSubscriptions, { labelType: 'TOPIC', value: topic }] } },
      })
      .then(() => {
        setProcessingTags(prevState => prevState.filter(value => value !== topic));
      });
  };

  const handleTopicUnSubscribe = (topic: string) => {
    if (!isLoggedIn) {
      showLoginModal();
      return;
    }
    analyticsActions.trackEvent({
      category: AnalyticsCategories.TRENDING_WIDGET,
      action: 'Trending Topic Unsubscribed',
    });

    setProcessingTags(prevState => [...prevState, topic]);

    createInterest
      .mutateAsync({
        i: { content: { topics: tagSubscriptions.filter(tag => tag.value !== topic) } },
      })
      .then(() => {
        setProcessingTags(prevState => prevState.filter(value => value !== topic));
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
      {loginModal.isActive && (
        <Extension isModal={true} name={'login'} extensionData={loginModal.modalData} />
      )}
      {(latestTopicsReq.isError || latestProfilesReq.isError) && (
        <ErrorLoader
          type="script-error"
          title={t('Oops, this widget has an error')}
          details={
            latestTopicsReq.isError
              ? t('Cannot load latest topics')
              : t('Cannot load latest profiles')
          }
        />
      )}

      {!latestTopicsReq.isError && (
        <LatestTopics
          titleLabel={t('Latest Topics')}
          tagSubtitleLabel={t('mentions')}
          subscribeLabel={t('Subscribe')}
          subscribedLabel={t('Subscribed')}
          unsubscribeLabel={t('Unsubscribe')}
          noTagsLabel={t('No topics found!')}
          isLoadingTags={latestTopicsReq.isFetching}
          isProcessingTags={processingTags}
          tags={latestTopics}
          subscribedTags={tagSubscriptions?.map(el => el.value)}
          onClickTopic={handleTopicClick}
          handleSubscribeTopic={handleTopicSubscribe}
          handleUnsubscribeTopic={handleTopicUnSubscribe}
        />
      )}

      {!latestProfilesReq.isError && (
        <LatestProfiles
          titleLabel={t('Start Following')}
          noProfilesLabel={t('No profiles found!')}
          isLoadingProfiles={latestProfilesReq.isFetching}
          profiles={latestProfiles}
          followList={followList}
          isLoggedIn={isLoggedIn}
          loggedInProfileId={loggedInProfileId}
          uiEvents={uiEvents}
          onClickProfile={handleProfileClick}
        />
      )}
    </Stack>
  );
};

export default TrendingWidgetComponent;
