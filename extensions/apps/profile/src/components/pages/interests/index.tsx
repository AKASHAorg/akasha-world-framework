import React, { useEffect, useMemo, useState } from 'react';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { CheckIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import Pill from '@akashaorg/design-system-core/lib/components/Pill';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { ProfileInterestsLoading } from '@akashaorg/design-system-components/lib/components/Profile';
import { useTranslation } from 'react-i18next';
import {
  useGetInterestsByDidQuery,
  useCreateInterestsMutation,
  useUpdateInterestsMutation,
  GetInterestsByDidDocument,
} from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { hasOwn, useRootComponentProps, useAkashaStore } from '@akashaorg/ui-awf-hooks';
import getSDK from '@akashaorg/core-sdk';
import { useApolloClient } from '@apollo/client';
import { ProfileLabeled } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import EditInterests from '../../edit-interests';

type InterestsPageProps = {
  profileDID: string;
};

type Topic = {
  value: string;
  labelType: string;
};

const InterestsPage: React.FC<InterestsPageProps> = props => {
  const { profileDID } = props;
  const { t } = useTranslation('app-profile');
  const {
    data: { authenticatedDID, isAuthenticating: authenticating },
  } = useAkashaStore();
  const { getCorePlugins } = useRootComponentProps();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeInterests, setActiveInterests] = useState([]);
  const isLoggedIn = !!authenticatedDID;
  const navigateTo = getCorePlugins().routing.navigateTo;
  const apolloClient = useApolloClient();

  const { data: profileInterestsQueryData, loading: loadingProfileInterests } =
    useGetInterestsByDidQuery({
      variables: { id: profileDID },
      skip: !isLoggedIn,
    });

  const { data: loggedUserInterestsQueryData, loading: loadingLoggedUserInterests } =
    useGetInterestsByDidQuery({
      variables: { id: authenticatedDID },
      skip: !isLoggedIn,
    });

  // get interests for the profile being viewed
  const profileInterests = useMemo(() => {
    if (!isLoggedIn) return null;
    return profileInterestsQueryData &&
      hasOwn(profileInterestsQueryData.node, 'akashaProfileInterests') &&
      profileInterestsQueryData.node.akashaProfileInterests?.topics.length > 0
      ? profileInterestsQueryData.node.akashaProfileInterests?.topics.map(topic => ({
          value: topic.value,
          labelType: topic.labelType,
        }))
      : [];
  }, [isLoggedIn, profileInterestsQueryData]);

  // get interests for the logged profile
  const loggedUserInterests = useMemo(() => {
    if (!isLoggedIn) return null;
    return loggedUserInterestsQueryData &&
      hasOwn(loggedUserInterestsQueryData.node, 'akashaProfileInterests') &&
      loggedUserInterestsQueryData.node.akashaProfileInterests?.topics.length > 0
      ? loggedUserInterestsQueryData.node.akashaProfileInterests?.topics.map(topic => ({
          value: topic.value,
          labelType: topic.labelType,
        }))
      : [];
  }, [isLoggedIn, loggedUserInterestsQueryData]);

  useEffect(() => {
    if (loggedUserInterests && loggedUserInterests.length) {
      setActiveInterests(loggedUserInterests);
    }
  }, [loggedUserInterests]);

  const interestSubscriptionId = useMemo(() => {
    if (!isLoggedIn) return null;
    return loggedUserInterestsQueryData &&
      hasOwn(loggedUserInterestsQueryData.node, 'akashaProfileInterests')
      ? loggedUserInterestsQueryData.node.akashaProfileInterests?.id
      : null;
  }, [isLoggedIn, loggedUserInterestsQueryData]);

  const sdk = getSDK();

  const [createInterestsMutation] = useCreateInterestsMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
  });

  const [updateInterestsMutation] = useUpdateInterestsMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
  });

  const handleInterestClick = (topic: Topic) => {
    navigateTo?.({
      appName: '@akashaorg/app-antenna',
      getNavigationUrl: (navRoutes: { [key: string]: string }) =>
        `${navRoutes.Tags}/${topic.value}`,
    });
  };

  const navigateToProfileInfoPage = () => {
    navigateTo({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: () => `/${profileDID}`,
    });
  };

  const runMutations = (interests: ProfileLabeled[]) => {
    setIsProcessing(true);
    if (interestSubscriptionId) {
      updateInterestsMutation({
        variables: {
          i: {
            id: interestSubscriptionId,
            content: {
              topics: interests,
            },
          },
        },
        onCompleted: async () => {
          await apolloClient.refetchQueries({ include: [GetInterestsByDidDocument] });
          setActiveInterests(interests);
          setIsProcessing(false);
        },
        onError: () => {
          setIsProcessing(false);
        },
      });
    } else {
      createInterestsMutation({
        variables: {
          i: {
            content: {
              topics: interests,
            },
          },
        },
        onCompleted: async () => {
          await apolloClient.refetchQueries({ include: [GetInterestsByDidDocument] });
          setActiveInterests(interests);
          setIsProcessing(false);
        },
        onError: () => {
          setIsProcessing(false);
        },
      });
    }
  };

  if (loadingProfileInterests || loadingLoggedUserInterests || authenticating)
    return <ProfileInterestsLoading />;

  return (
    <Stack direction="column" spacing="gap-y-4" fullWidth>
      <Card radius={20} padding={'p-4'}>
        {profileDID !== authenticatedDID && (
          <Stack direction="column" spacing="gap-y-2.5">
            <Text variant="h5">{t('Interests')} </Text>
            <Text variant="subtitle2" color={{ light: 'grey4', dark: 'grey7' }}>
              {t(
                "Spot something interesting?  You can subscribe to any  of your fellow member interests and they'll shape the beams in your antenna! ",
              )}
            </Text>

            <Stack
              direction="row"
              align="center"
              justify="start"
              spacing="gap-2"
              customStyle="flex-wrap"
              fullWidth
            >
              {profileInterests?.map((interest, idx) => {
                const isActive = !!activeInterests.find(ac => ac.value === interest.value);
                return (
                  <Pill
                    key={`${idx}-${interest}`}
                    label={interest.value}
                    iconDirection="right"
                    size="sm"
                    onPillClick={() => handleInterestClick(interest)}
                    active={isActive}
                    type="action"
                    {...(isActive && { icon: <CheckIcon /> })}
                  />
                );
              })}
            </Stack>
          </Stack>
        )}
        {profileDID === authenticatedDID && (
          <EditInterests
            title={t('Your interests')}
            subTitle={t('(10 topics max.)')}
            description={t(
              'Your interests will help refine your social feed and throughout AKASHA World.',
            )}
            moreInterestTitle={t('Add more interests')}
            moreInterestDescription={t('Separate your interests by comma or space!')}
            moreInterestPlaceholder={t('Interests')}
            myInterests={loggedUserInterests}
            interests={[]} /* TODO: when indexed list of interests hook is ready connect it */
            maxInterests={10}
            labelType={sdk.services.gql.labelTypes.INTEREST}
            maxInterestsErrorMessage={t(
              'Max interests reached. Remove some interests to add more.',
            )}
            cancelButton={{
              label: t('Cancel'),
              disabled: isProcessing,
              handleClick: navigateToProfileInfoPage,
            }}
            saveButton={{
              label: t('Save'),
              loading: isProcessing,
              handleClick: interests => runMutations(interests),
            }}
            customStyle="h-full"
          />
        )}
      </Card>
    </Stack>
  );
};

export default InterestsPage;
