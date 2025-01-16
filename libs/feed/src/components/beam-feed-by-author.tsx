import React, {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import DynamicInfiniteScroll from '@akashaorg/design-system-components/lib/components/DynamicInfiniteScroll';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import getSDK from '@akashaorg/core-sdk';
import { AnalyticsEventData } from '@akashaorg/typings/lib/ui';
import {
  AkashaBeamFiltersInput,
  AkashaBeamSortingInput,
  SortOrder,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { hasOwn, useAkashaStore } from '@akashaorg/ui-core-hooks';
import {
  useGetBeamsByAuthorDidLazyQuery,
  GetBeamStreamDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { useApolloClient } from '@apollo/client';
import {
  GetBeamByIdQuery,
  GetBeamsByAuthorDidQuery,
} from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';

export type BeamFeedByAuthorProps = {
  did: string;
  scrollRestorationStorageKey: string;
  filters?: AkashaBeamFiltersInput;
  sorting?: AkashaBeamSortingInput;
  estimatedHeight?: number;
  itemSpacing?: number;
  scrollOptions?: {
    overScan: number;
  };
  scrollTopIndicator?: (listRect: DOMRect, onScrollToTop: () => void) => React.ReactNode;
  loadingIndicator?: () => ReactElement;
  renderItem: (data?: GetBeamByIdQuery) => ReactElement;
  trackEvent?: (data: AnalyticsEventData['data']) => void;
};

const BeamFeedByAuthor = (props: BeamFeedByAuthorProps) => {
  const {
    did,
    scrollRestorationStorageKey,
    filters,
    sorting,
    estimatedHeight = 150,
    itemSpacing,
    scrollOptions = { overScan: 10 },
    loadingIndicator,
    renderItem,
  } = props;
  const indexingDID = React.useRef(getSDK().services.gql.indexingDID);
  const [fetchBeam, beamQuery] = useGetBeamsByAuthorDidLazyQuery();

  const beamList = React.useMemo(() => {
    if (beamQuery.data?.node && hasOwn(beamQuery.data.node, 'akashaBeamList')) {
      return beamQuery.data.node?.akashaBeamList;
    }
  }, [beamQuery.data]);

  const beams = React.useMemo(() => beamList?.edges || [], [beamList]);
  const pageInfo = React.useMemo(() => {
    return beamList?.pageInfo;
  }, [beamList]);
  const {
    data: { isAuthenticating },
  } = useAkashaStore();

  const loadingIndicatorRef = useRef(loadingIndicator);
  const variables = useMemo(() => {
    return {
      id: did,
      first: 10,
      sorting: { createdAt: SortOrder.Desc, ...sorting },
      indexer: indexingDID.current,
      ...(filters ? { filters } : {}),
    };
  }, [did, filters, sorting]);
  const hasLatestBeamsRef = useRef(false);
  const vListContainerRef = useRef<HTMLDivElement>(null);
  const vListContainerOffset = useRef(null);
  const apolloClientRef = useRef(useApolloClient());

  useLayoutEffect(() => {
    vListContainerOffset.current = vListContainerRef.current?.offsetTop ?? 0;
  }, []);

  useEffect(() => {
    fetchBeam({
      variables,
      fetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
    });
  }, [fetchBeam, variables]);

  const onLoadNewest = useCallback(() => {
    fetchBeam({
      variables,
      fetchPolicy: 'cache-and-network',
    });
  }, [fetchBeam, variables]);

  useEffect(() => {
    if (pageInfo?.startCursor) {
      apolloClientRef.current
        .query<GetBeamsByAuthorDidQuery>({
          query: GetBeamStreamDocument,
          variables,
          fetchPolicy: 'no-cache',
        })
        .then(result => {
          if (result.data?.node && hasOwn(result.data.node, 'akashaBeamList')) {
            const latestPageInfo = result.data.node.akashaBeamList?.pageInfo;
            if (latestPageInfo && latestPageInfo.startCursor !== pageInfo.startCursor) {
              if (scrollY <= vListContainerOffset.current) {
                onLoadNewest();
                return;
              }
              hasLatestBeamsRef.current = true;
            }
          }
        });
    }
  }, [onLoadNewest, pageInfo?.startCursor, variables]);

  React.useEffect(() => {
    const onScroll = () => {
      if (hasLatestBeamsRef.current && scrollY <= vListContainerOffset.current) {
        onLoadNewest();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [onLoadNewest]);

  if (!loadingIndicatorRef.current) {
    loadingIndicatorRef.current = () => (
      <Stack align="center">
        <Spinner />
      </Stack>
    );
  }

  if (isAuthenticating) return <>{loadingIndicatorRef.current()}</>;

  return (
    <>
      {beamQuery.loading && beams.length === 0 && loadingIndicatorRef.current()}
      {beamQuery.error && (
        <ErrorLoader
          type="script-error"
          title={'Sorry, there was an error when fetching beams'}
          details={beamQuery.error.message}
        />
      )}
      {beams.length > 0 && (
        <Card ref={vListContainerRef} type="plain">
          <DynamicInfiniteScroll
            count={beams.length}
            scrollRestorationStorageKey={scrollRestorationStorageKey}
            enableScrollRestoration={true}
            estimatedHeight={estimatedHeight}
            overScan={scrollOptions.overScan}
            itemSpacing={itemSpacing}
            hasNextPage={pageInfo && pageInfo.hasNextPage}
            loading={beamQuery.loading}
            onLoadMore={async () => {
              const lastCursor = beams[beams.length - 1]?.cursor;
              if (beamQuery.loading || beamQuery.error || !lastCursor) return;
              if (lastCursor) {
                await beamQuery.fetchMore({
                  variables: {
                    after: lastCursor,
                    sorting: { createdAt: SortOrder.Desc },
                    indexer: indexingDID.current,
                  },
                });
              }
            }}
            customStyle="mb-4"
          >
            {({ itemIndex }) => {
              const beam = beams[itemIndex];
              return renderItem(beam);
            }}
          </DynamicInfiniteScroll>
        </Card>
      )}
    </>
  );
};

export default BeamFeedByAuthor;
