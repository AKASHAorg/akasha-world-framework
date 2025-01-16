import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import isEqual from 'lodash/isEqual';
import difference from 'lodash/difference';
import pullAll from 'lodash/pullAll';
import getSDK from '@akashaorg/core-sdk';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import {
  useCreateInterestsMutation,
  useUpdateInterestsMutation,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import TrendingWidgetLoadingCard from '@akashaorg/design-system-components/lib/components/TrendingWidgetLoadingCard';
import { TopicRow } from './topic-row';

export type LatestTopicsProps = {
  // data
  tags: string[];
  receivedTags?: string[] | null;
  tagSubscriptionsId: string | null;
  isLoadingTags?: boolean;
  isLoggedIn: boolean;
  authenticatedDID: string;
  // labels
  noTagsLabel?: string;
  titleLabel: string;
  tagSubtitleLabel: string;
  subscribeLabel: string;
  subscribedLabel: string;
  unsubscribeLabel: string;
  // handlers
  onClickTopic: (topic: string) => void;
  showLoginModal: () => void;
  refetchTagSubscriptions: () => void;
};

/**
 * This utility method compares two arrays of tags and returns the difference,
 * @param arr1 - first array to be compared
 * @param arr2 - second array to be compared
 * @returns an array of strings
 */
const getTagsDiff = (arr1: string[], arr2: string[]) => {
  const setA = new Set(arr1);
  const setB = new Set(arr2);

  return Array.from(setA.symmetricDifference(setB));
};

export const LatestTopics: React.FC<LatestTopicsProps> = props => {
  const {
    onClickTopic,
    titleLabel,
    tagSubtitleLabel,
    tags,
    isLoadingTags,
    noTagsLabel,
    subscribeLabel,
    subscribedLabel,
    unsubscribeLabel,
    receivedTags,
    tagSubscriptionsId,
    isLoggedIn,
    authenticatedDID,
    showLoginModal,
    refetchTagSubscriptions,
  } = props;

  const [tagsQueue, setTagsQueue] = useState([]);
  const [localSubscribedTags, setLocalSubscribedTags] = useState([]);
  const timer = useRef(null);
  const subscriptionId = useRef(null);
  const localTagsInitialized = useRef(null);
  const localSubscribedTagsRef = useRef([]);
  const { uiEvents } = useRootComponentProps();
  const { t } = useTranslation('ui-widget-trending');

  // reset state when user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      setLocalSubscribedTags([]);
      localSubscribedTagsRef.current = [];
      localTagsInitialized.current = null;
      subscriptionId.current = null;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (receivedTags && !localTagsInitialized.current) {
      setLocalSubscribedTags([...new Set(receivedTags)]);
      localTagsInitialized.current = true;
    }
    // prevents reseting interests with []
    if (receivedTags && tagsQueue.length === 0) {
      localSubscribedTagsRef.current = receivedTags;
    }
  }, [receivedTags, localTagsInitialized, tagsQueue.length]);

  useEffect(() => {
    if (tagSubscriptionsId) {
      subscriptionId.current = tagSubscriptionsId;
    }
  }, [tagSubscriptionsId]);

  const sdk = getSDK();

  const [createInterestsMutation, { loading }] = useCreateInterestsMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
  });

  const [updateInterestsMutation, { loading: updateLoading }] = useUpdateInterestsMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
  });

  useEffect(() => {
    if (!localTagsInitialized.current || receivedTags === null) return;
    if (loading || updateLoading) return;

    if (!isEqual(localSubscribedTagsRef.current, receivedTags)) {
      if (subscriptionId.current) {
        updateInterestsMutation({
          variables: {
            i: {
              id: subscriptionId.current,
              content: {
                topics: [...new Set(localSubscribedTagsRef.current)].map(tag => ({
                  value: tag,
                  labelType: sdk.services.gql.labelTypes.INTEREST,
                })),
              },
            },
          },
          optimisticResponse: {
            updateAkashaProfileInterests: {
              clientMutationId: null,
              document: {
                did: { id: authenticatedDID },
                topics: localSubscribedTagsRef.current.map(tag => ({
                  value: tag,
                  labelType: sdk.services.gql.labelTypes.INTEREST,
                })),
                id: subscriptionId.current,
              },
            },
          },
          onCompleted: data => {
            const returnedData = data.updateAkashaProfileInterests.document.topics.map(
              topic => topic.value,
            );

            const tagsDiff = getTagsDiff(returnedData, receivedTags);

            const subscribing = returnedData.length > receivedTags.length;

            showSuccessSnackbar(tagsDiff, subscribing);

            const arrDifference = difference(returnedData, receivedTags).concat(
              difference(receivedTags, returnedData),
            );

            setTagsQueue(prev => pullAll(prev, arrDifference));
          },
          onError: () => {
            const arrDifference = receivedTags
              .filter(x => !localSubscribedTags.includes(x))
              .concat(localSubscribedTags.filter(x => !receivedTags.includes(x)));

            setTagsQueue(prev => pullAll(prev, arrDifference));
            refetchTagSubscriptions();
          },
        });
      } else {
        createInterestsMutation({
          variables: {
            i: {
              content: {
                topics: [...new Set(localSubscribedTagsRef.current)].map(tag => ({
                  value: tag,
                  labelType: sdk.services.gql.labelTypes.INTEREST,
                })),
              },
            },
          },
          onCompleted: data => {
            subscriptionId.current = data.setAkashaProfileInterests?.document.id;

            const returnedData = data.setAkashaProfileInterests?.document.topics.map(
              topic => topic.value,
            );

            const tagsDiff = getTagsDiff(returnedData, localSubscribedTags);

            const subscribing = returnedData.length > localSubscribedTags.length;

            showSuccessSnackbar(tagsDiff, subscribing);

            const arrDifference = difference(returnedData, localSubscribedTags).concat(
              difference(localSubscribedTags, returnedData),
            );

            setTagsQueue(prev => pullAll(prev, arrDifference));
            refetchTagSubscriptions();
          },
          onError: () => {
            const arrDifference = difference(receivedTags, localSubscribedTags).concat(
              difference(localSubscribedTags, receivedTags),
            );

            setTagsQueue(prev => pullAll(prev, arrDifference));
            refetchTagSubscriptions();
          },
        });
      }
    }
  }, [localSubscribedTags, updateLoading, loading]);

  const showSuccessSnackbar = (tags: string[], subscribing: boolean) => {
    if (!tags.length) return;

    const tagsString = tags.join(', ');
    const pluralize = tags.length > 1;
    const modifier1 = pluralize ? t('topics') : t('topic');
    const modifier2 = pluralize ? t('have') : t('has');

    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Success,
        title: subscribing
          ? `${t('Subscribed to')} ${modifier1}`
          : `${t('Unsubscribed from')} ${modifier1}`,
        description: subscribing
          ? `"${tagsString}" ${modifier2} ${t('been added to your interests')}`
          : `"${tagsString}" ${modifier2} ${t('been removed from your interests')}`,
      },
    });
  };

  const handleTopicSubscription = (tag: string, subscribing = true) => {
    // if not logged in, show modal
    if (!isLoggedIn) {
      showLoginModal();
      return;
    }

    // if subscribing, and limit is already reached, return snackbar
    if (subscribing && localSubscribedTagsRef.current.length >= 10) {
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

    setTagsQueue(prev => [...prev, tag]);

    const newInterests = subscribing
      ? [...localSubscribedTagsRef.current, tag]
      : localSubscribedTagsRef.current.filter(topic => topic !== tag);

    localSubscribedTagsRef.current = newInterests;

    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(
      () => setLocalSubscribedTags(localSubscribedTagsRef.current),
      700,
    );
  };

  if (tags.length === 0 && isLoadingTags) return <TrendingWidgetLoadingCard />;

  return (
    <Card padding={16}>
      <Stack customStyle="mb-4">
        <Text variant="button-md" weight="bold">
          {titleLabel}
        </Text>
      </Stack>

      <Stack>
        <ul>
          {tags.length === 0 && !isLoadingTags && (
            <Stack direction="column" spacing="gap-y-6" align="start">
              <Stack align="center" justify="center">
                <Text>{noTagsLabel}</Text>
              </Stack>
            </Stack>
          )}

          <Stack spacing="gap-y-4">
            {tags.length > 0 &&
              tags
                .slice(0, 4)
                .map((tag, index) => (
                  <TopicRow
                    key={index}
                    tag={tag}
                    subscribedTags={receivedTags}
                    tagSubtitleLabel={tagSubtitleLabel}
                    subscribeLabel={subscribeLabel}
                    subscribedLabel={subscribedLabel}
                    unsubscribeLabel={unsubscribeLabel}
                    onClickTopic={onClickTopic}
                    isLoading={tagsQueue.includes(tag)}
                    handleTopicSubscription={handleTopicSubscription}
                  />
                ))}
          </Stack>
        </ul>
      </Stack>
    </Card>
  );
};
