import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hasOwn, useAkashaStore, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import {
  useGetIndexedStreamCountQuery,
  useGetInterestsByDidQuery,
  useCreateInterestsMutation,
  useUpdateInterestsMutation,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { AkashaIndexedStreamStreamType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import {
  IModalNavigationOptions,
  NotificationEvents,
  NotificationTypes,
} from '@akashaorg/typings/lib/ui';
import { BeamContentResolver, TagFeed } from '@akashaorg/ui-lib-feed';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import getSDK from '@akashaorg/core-sdk';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import TagProfileCard from '@akashaorg/design-system-components/lib/components/TagProfileCard';
import TagFeedHeaderLoader from './tag-feed-header-loader';
import ScrollTopWrapper from '@akashaorg/design-system-core/lib/components/ScrollTopWrapper';
import ScrollTopButton from '@akashaorg/design-system-core/lib/components/ScrollTopButton';
import InfoCard from '@akashaorg/design-system-core/lib/components/InfoCard';

type TagFeedPageProps = {
  tagName: string;
};

const TagFeedPage: React.FC<TagFeedPageProps> = props => {
  const { tagName } = props;
  const { t } = useTranslation('app-antenna');
  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const { uiEvents, worldConfig, navigateToModal } = useRootComponentProps();
  const isLoggedIn = !!authenticatedDID;
  const _navigateToModal = React.useRef(navigateToModal);
  const showLoginModal = React.useCallback(
    (redirectTo?: { modal: IModalNavigationOptions }, message?: string) => {
      _navigateToModal.current?.({
        name: 'login',
        redirectTo,
        message,
      });
    },
    [],
  );
  const sdk = React.useRef(getSDK());
  const tagFilters = useMemo(
    () => [
      { where: { streamType: { equalTo: AkashaIndexedStreamStreamType.Beam } } },
      { where: { indexType: { equalTo: sdk.current.services.gql.labelTypes.TAG } } },
      { where: { indexValue: { equalTo: tagName } } },
      { where: { active: { equalTo: true } } },
    ],
    [tagName],
  );
  const {
    data: beamCountData,
    loading: loadingCount,
    error: countQueryError,
  } = useGetIndexedStreamCountQuery({
    variables: {
      indexer: sdk.current.services.gql.indexingDID,
      filters: {
        and: tagFilters,
      },
    },
  });

  const beamCount = useMemo(() => {
    return beamCountData && hasOwn(beamCountData.node, 'akashaIndexedStreamListCount')
      ? beamCountData.node.akashaIndexedStreamListCount
      : 0;
  }, [beamCountData]);

  // fetch user's interest subscription
  const { data: tagSubscriptionsData, refetch: refetchTagSubscriptions } =
    useGetInterestsByDidQuery({
      variables: { id: authenticatedDID },
      skip: !isLoggedIn,
    });

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

  const [createInterestsMutation, { loading }] = useCreateInterestsMutation({
    context: { source: sdk.current.services.gql.contextSources.composeDB },
  });

  const [updateInterestsMutation, { loading: updateLoading }] = useUpdateInterestsMutation({
    context: { source: sdk.current.services.gql.contextSources.composeDB },
  });

  const showSuccessSnackbar = (subscribing: boolean) => {
    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Success,
        title: subscribing ? t('Subscribed to topic') : t('Unsubscribed from topic'),
        description: subscribing
          ? `"${tagName}" ${t('has been added to your interests')}`
          : `"${tagName}" ${t('has been removed from your interests')}`,
      },
    });
  };

  const handleTagClick = (tagName: string, subscribing = true) => {
    // if not logged in, show modal
    if (!isLoggedIn) {
      showLoginModal();
      return;
    }
    // if subscribing, and limit is already reached, return snackbar
    if (subscribing && tagSubscriptions.length >= 10) {
      uiEvents.next({
        event: NotificationEvents.ShowNotification,
        data: {
          type: NotificationTypes.Error,
          title: t('Interests limit reached'),
          description: t(
            'You have reached the limit of 10 interests. Please remove some interests from your profile to add new ones.',
          ),
        },
      });
      return;
    }
    const interests = subscribing
      ? [...tagSubscriptions, tagName]
      : tagSubscriptions.filter(tag => tag !== tagName);

    if (tagSubscriptionsId) {
      updateInterestsMutation({
        variables: {
          i: {
            id: tagSubscriptionsId,
            content: {
              topics: [...new Set(interests)].map(tag => ({
                value: tag,
                labelType: sdk.current.services.gql.labelTypes.INTEREST,
              })),
            },
          },
        },
        onCompleted: () => showSuccessSnackbar(subscribing),
        onError: () => {
          refetchTagSubscriptions();
        },
      });
    } else {
      createInterestsMutation({
        variables: {
          i: {
            content: {
              topics: [...new Set(tagSubscriptions)].map(tag => ({
                value: tag,
                labelType: sdk.current.services.gql.labelTypes.INTEREST,
              })),
            },
          },
        },
        onCompleted: () => showSuccessSnackbar(subscribing),
        onError: () => {
          refetchTagSubscriptions();
        },
      });
    }
  };

  const listOfTags = React.useMemo(() => [tagName], [tagName]);

  return (
    <HelmetProvider>
      <Stack fullWidth={true}>
        <Helmet>
          <title>{worldConfig.title}</title>
        </Helmet>
        {loadingCount && <TagFeedHeaderLoader />}
        {countQueryError && (
          <ErrorLoader
            type="script-error"
            title={t('Error loading tag data')}
            details={countQueryError?.message}
          />
        )}
        {!loadingCount && (
          <Stack customStyle="mb-2">
            <TagProfileCard
              tag={{
                name: tagName,
                totalPosts: beamCount,
              }}
              subscribeLabel={t('Subscribe')}
              subscribedLabel={t('Subscribed')}
              unsubscribeLabel={t('Unsubscribe')}
              subscribedTags={tagSubscriptions}
              isLoading={loading || updateLoading}
              mentionsLabel={`${beamCount} ${beamCount > 1 ? t('Beams') : t('Beam')}`}
              handleSubscribeTag={() => handleTagClick(tagName)}
              handleUnsubscribeTag={() => handleTagClick(tagName, false)}
            />
          </Stack>
        )}
        {beamCount === 0 && (
          <Stack customStyle="mt-8">
            <InfoCard
              titleLabel={
                <>
                  {t('There is no content found for the ')}
                  {t('{{topic}}', { topic: listOfTags.length > 1 ? 'topics' : 'topic' })}{' '}
                  {listOfTags.map(tag => (
                    <span key={tag}>#{tag} </span>
                  ))}
                </>
              }
              bodyLabel={
                <>
                  {t('Be the first one to create a beam for this topic')}
                  {'! 🚀'}
                </>
              }
              bodyVariant="body1"
              assetName="longbeam-notfound"
            />
          </Stack>
        )}
        {beamCount > 0 && (
          <TagFeed
            dataTestId="tag-feed"
            estimatedHeight={150}
            itemSpacing={8}
            filters={{
              and: tagFilters,
            }}
            scrollOptions={{ overScan: 10 }}
            scrollTopIndicator={(listRect, onScrollToTop) => (
              <ScrollTopWrapper placement={listRect.left}>
                <ScrollTopButton hide={false} onClick={onScrollToTop} />
              </ScrollTopWrapper>
            )}
            renderItem={itemData => <BeamContentResolver beamId={itemData.stream} />}
          />
        )}
      </Stack>
    </HelmetProvider>
  );
};

export default TagFeedPage;
