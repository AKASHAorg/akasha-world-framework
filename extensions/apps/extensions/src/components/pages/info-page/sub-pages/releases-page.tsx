import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import {
  AkashaAppApplicationType,
  AppImageSource,
  SortOrder,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import InfoSubRouteHeader from '../InfoSubroutePageHeader';
import DynamicInfiniteScroll from '@akashaorg/design-system-components/lib/components/DynamicInfiniteScroll';
import { useGetAppsReleasesQuery } from '@akashaorg/ui-awf-hooks/lib/generated';
import { formatDate } from '@akashaorg/design-system-core/lib/utils';
import { NetworkStatus } from '@apollo/client';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';

type ReleasesPageProps = {
  appName: string;
  appId: string;
  extensionLogo: AppImageSource;
  extensionName: string;
  extensionDisplayName: string;
  extensionType: AkashaAppApplicationType;
  releasesCount: number;
};

export const ReleasesPage = (props: ReleasesPageProps) => {
  const {
    extensionDisplayName,
    extensionName,
    extensionLogo,
    extensionType,
    appId,
    releasesCount,
  } = props;
  const { t } = useTranslation('app-extensions');
  const [expandedRelease, setExpandedRelease] = useState(null);

  const releasesReq = useGetAppsReleasesQuery({
    variables: {
      first: Math.min(10, releasesCount),
      filters: { where: { applicationID: { equalTo: appId } } },
      sorting: { createdAt: SortOrder.Desc },
    },
  });

  const handleReadMoreClick = (releaseId?: string) => () => {
    if (releaseId) {
      setExpandedRelease(releaseId);
    }
  };

  const handleLoadMoreReleases = () => {
    if (releasesReq.data?.akashaAppReleaseIndex?.edges.length < releasesCount) {
      return;
    }
    releasesReq.fetchMore({
      variables: {
        after: releasesReq.data?.akashaAppReleaseIndex?.pageInfo.endCursor,
      },
    });
  };

  const releases = useMemo(() => {
    return releasesReq.data?.akashaAppReleaseIndex.edges;
  }, [releasesReq]);

  useEffect(() => {
    if (releases && releases.length > 0 && !expandedRelease) {
      setExpandedRelease(releases[0].node?.id);
    }
  }, [expandedRelease, releases]);

  const hasErrors = useMemo(() => {
    return releasesReq.networkStatus === NetworkStatus.error;
  }, [releasesReq]);

  return (
    <>
      <Card padding="p-4">
        <Stack spacing="gap-y-4">
          <InfoSubRouteHeader
            pageTitle={t('Releases')}
            appName={extensionDisplayName}
            packageName={extensionName}
            appLogo={extensionLogo}
            appType={extensionType}
          />
          {hasErrors && (
            <ErrorLoader
              type="list-not-available"
              title={t('Loading error')}
              details={t('There was an error loading the releases')}
            />
          )}
          {releases && releases.length > 0 && (
            <DynamicInfiniteScroll
              count={releasesCount}
              overScan={5}
              estimatedHeight={80}
              itemSpacing={16}
              onLoadMore={handleLoadMoreReleases}
              loading={releasesReq.loading}
              hasNextPage={releasesReq.data?.akashaAppReleaseIndex?.pageInfo.hasNextPage}
            >
              {item => {
                const release = releases[item.itemIndex];
                const isExpanded = expandedRelease === release?.node?.id;
                const description = release.node?.meta?.find(
                  m => m.property === 'description',
                )?.value;

                return (
                  <Stack direction="column">
                    <Divider />
                    <Stack direction="row" justify="between" customStyle="mt-3 mb-2">
                      <Text variant="h6">
                        {t('Version')} {release.node?.version}
                      </Text>
                      <Text variant="footnotes2" color={{ light: 'grey4', dark: 'grey6' }}>
                        {formatDate(release.node?.createdAt, 'DD MMM YYYY')}
                      </Text>
                    </Stack>
                    <Stack direction="row" justify="between">
                      <Text
                        variant="footnotes2"
                        customStyle={`${isExpanded ? 'whitespace-pre-line' : 'truncate max-w-[45ch]'}`}
                        color={
                          description
                            ? { light: 'black', dark: 'white' }
                            : { light: 'grey4', dark: 'grey6' }
                        }
                      >
                        {description}
                        {!description && t('This release has no description added')}
                      </Text>
                      {!isExpanded && description && (
                        <Button
                          plain={true}
                          variant="text"
                          onClick={handleReadMoreClick(release.node?.id)}
                        >
                          <Text
                            variant="footnotes2"
                            color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                            customStyle="whitespace-nowrap"
                          >
                            {t('Read More')}
                          </Text>
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                );
              }}
            </DynamicInfiniteScroll>
          )}
          {releasesReq.loading && (
            <Stack direction="column" align="center">
              <Spinner />
            </Stack>
          )}
        </Stack>
      </Card>
    </>
  );
};
