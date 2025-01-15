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
  AkashaBeamStreamEdge,
  SortOrder,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { hasOwn, useAkashaStore } from '@akashaorg/ui-core-hooks';
import {
  useGetBeamStreamLazyQuery,
  GetBeamStreamDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { useApolloClient } from '@apollo/client';
import { GetBeamStreamQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';

export type BeamFeedProps = {
  scrollRestorationStorageKey: string;
  filters?: AkashaBeamFiltersInput;
  sorting?: AkashaBeamSortingInput;
  estimatedHeight?: number;
  itemSpacing?: number;
  scrollOptions?: {
    overScan: number;
  };
  dataTestId?: string;
  scrollTopIndicator?: (listRect: DOMRect, onScrollToTop: () => void) => React.ReactNode;
  loadingIndicator?: () => ReactElement;
  renderItem: (data?: Omit<AkashaBeamStreamEdge['node'], 'id'>) => ReactElement;
  trackEvent?: (data: AnalyticsEventData['data']) => void;
};

const BeamFeed = (props: BeamFeedProps) => {
  const {
    dataTestId,
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
  const [fetchBeamStream, beamStreamQuery] = useGetBeamStreamLazyQuery();
  const beamStream = React.useMemo(() => {
    if (beamStreamQuery.data?.node && hasOwn(beamStreamQuery.data.node, 'akashaBeamStreamList')) {
      return beamStreamQuery.data.node?.akashaBeamStreamList;
    }
  }, [beamStreamQuery.data]);
  const beams = React.useMemo(() => beamStream?.edges || [], [beamStream]);
  const pageInfo = React.useMemo(() => {
    return beamStream?.pageInfo;
  }, [beamStream]);
  const {
    data: { isAuthenticating },
  } = useAkashaStore();

  const loadingIndicatorRef = useRef(loadingIndicator);
  const variables = useMemo(() => {
    return {
      first: 10,
      sorting: { createdAt: SortOrder.Desc, ...sorting },
      indexer: indexingDID.current,
      ...(filters ? { filters } : {}),
    };
  }, [filters, sorting]);

  const hasLatestBeamsRef = useRef(false);
  const vListContainerRef = useRef<HTMLDivElement>(null);
  const vListContainerOffset = useRef(null);
  const apolloClientRef = useRef(useApolloClient());

  useLayoutEffect(() => {
    vListContainerOffset.current = vListContainerRef.current?.offsetTop ?? 0;
  }, []);

  useEffect(() => {
    fetchBeamStream({
      variables,
      fetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
    });
  }, [fetchBeamStream, variables]);

  const onLoadNewest = useCallback(() => {
    fetchBeamStream({
      variables,
      fetchPolicy: 'cache-and-network',
    });
    hasLatestBeamsRef.current = false;
  }, [fetchBeamStream, variables]);

  useEffect(() => {
    if (pageInfo?.startCursor) {
      /*
       * When feed mounts, check if there is latest data. There will be latest data if current start cursor differs from the one before.
       * If there is latest data and if scroll position is at the top then load latest data immediately otherwise flag hasLatestBeamsRef to use it to load data
       * when the scroll position is at the top.
       **/
      apolloClientRef.current
        .query<GetBeamStreamQuery>({
          query: GetBeamStreamDocument,
          variables,
          fetchPolicy: 'no-cache',
        })
        .then(result => {
          if (result.data?.node && hasOwn(result.data.node, 'akashaBeamStreamList')) {
            const latestPageInfo = result.data.node.akashaBeamStreamList?.pageInfo;
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
      /*
       * If there is latest data and the scroll position is at the top load the data.
       **/
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
      {beamStreamQuery.loading && beams.length === 0 && loadingIndicatorRef.current()}
      {beamStreamQuery.error && (
        <ErrorLoader
          type="script-error"
          title={'Sorry, there was an error when fetching beams'}
          details={beamStreamQuery.error.message}
        />
      )}
      {beams && (
        <Card ref={vListContainerRef} type="plain">
          <DynamicInfiniteScroll
            dataTestId={dataTestId}
            count={beams.length}
            scrollRestorationStorageKey={scrollRestorationStorageKey}
            enableScrollRestoration={true}
            estimatedHeight={estimatedHeight}
            overScan={scrollOptions.overScan}
            itemSpacing={itemSpacing}
            hasNextPage={pageInfo && pageInfo.hasNextPage}
            loading={beamStreamQuery.loading}
            onLoadMore={async () => {
              const lastCursor = beams[beams.length - 1]?.cursor;
              if (beamStreamQuery.loading || beamStreamQuery.error || !lastCursor) return;
              if (lastCursor) {
                await beamStreamQuery.fetchMore({
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
              return renderItem(beam.node);
            }}
          </DynamicInfiniteScroll>
        </Card>
      )}
    </>
  );
};

export default BeamFeed;
