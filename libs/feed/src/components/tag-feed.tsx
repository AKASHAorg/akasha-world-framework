import React, { ReactElement, useEffect, useRef } from 'react';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import DynamicInfiniteScroll from '@akashaorg/design-system-components/lib/components/DynamicInfiniteScroll';
import getSDK from '@akashaorg/core-sdk';
import { AnalyticsEventData } from '@akashaorg/typings/lib/ui';
import {
  SortOrder,
  AkashaIndexedStreamEdge,
  AkashaIndexedStreamSortingInput,
  AkashaIndexedStreamFiltersInput,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { hasOwn, useAkashaStore } from '@akashaorg/ui-core-hooks';
import { useGetIndexedStreamLazyQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';

export type TagFeedProps = {
  dataTestId?: string;
  estimatedHeight: number;
  itemSpacing?: number;
  scrollOptions?: {
    overScan: number;
  };
  scrollTopIndicator?: (listRect: DOMRect, onScrollToTop: () => void) => React.ReactNode;
  loadingIndicator?: () => React.ReactElement;
  renderItem: (data?: Omit<AkashaIndexedStreamEdge['node'], 'id'>) => ReactElement;
  trackEvent?: (data: AnalyticsEventData['data']) => void;
  filters?: AkashaIndexedStreamFiltersInput;
  sorting?: AkashaIndexedStreamSortingInput;
};

const TagFeed = (props: TagFeedProps) => {
  const {
    dataTestId,
    estimatedHeight = 150,
    itemSpacing,
    scrollOptions = { overScan: 10 },
    loadingIndicator,
    renderItem,
    filters,
  } = props;

  const sdkRef = useRef(getSDK());
  const indexingDID = React.useRef(sdkRef.current.services.gql.indexingDID);
  const {
    data: { isAuthenticating },
  } = useAkashaStore();

  const [fetchIndexedStream, indexedStreamQuery] = useGetIndexedStreamLazyQuery();
  const indexedBeamStream = React.useMemo(() => {
    if (
      indexedStreamQuery.data?.node &&
      hasOwn(indexedStreamQuery.data.node, 'akashaIndexedStreamList')
    ) {
      return indexedStreamQuery.data.node?.akashaIndexedStreamList;
    }
  }, [indexedStreamQuery.data]);
  // @TODO: replace with cache policy
  const beams = React.useMemo(
    () =>
      indexedBeamStream?.edges.filter(
        (beam, i, arr) => arr.findIndex(a => a.node.stream === beam.node.stream) === i,
      ) || [],
    [indexedBeamStream],
  );
  const pageInfo = React.useMemo(() => {
    return indexedBeamStream?.pageInfo;
  }, [indexedBeamStream]);

  useEffect(() => {
    fetchIndexedStream({
      variables: {
        indexer: indexingDID.current,
        first: 10,
        sorting: { createdAt: SortOrder.Desc },
        filters,
      },
    });
  }, [fetchIndexedStream, filters]);

  const loadingIndicatorRef = React.useRef(loadingIndicator);

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
      {indexedStreamQuery.loading && beams.length === 0 && loadingIndicatorRef.current()}
      {indexedStreamQuery.error && (
        <ErrorLoader
          type="script-error"
          title={'Sorry, there was an error when fetching beams'}
          details={indexedStreamQuery.error.message}
        />
      )}
      {beams.length > 0 && (
        <DynamicInfiniteScroll
          dataTestId={dataTestId}
          count={beams.length}
          estimatedHeight={estimatedHeight}
          overScan={scrollOptions.overScan}
          itemSpacing={itemSpacing}
          hasNextPage={pageInfo && pageInfo.hasNextPage}
          loading={indexedStreamQuery.loading}
          onLoadMore={async () => {
            const lastCursor = beams[beams.length - 1]?.cursor;
            if (indexedStreamQuery.loading || indexedStreamQuery.error || !lastCursor) return;
            if (lastCursor) {
              await indexedStreamQuery.fetchMore({
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
      )}
    </>
  );
};

export default TagFeed;
