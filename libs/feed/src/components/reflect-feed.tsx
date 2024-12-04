import React, { ReactElement, useEffect, useMemo } from 'react';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import DynamicInfiniteScroll from '@akashaorg/design-system-components/lib/components/DynamicInfiniteScroll';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import getSDK from '@akashaorg/core-sdk';
import { AnalyticsEventData, EntityTypes } from '@akashaorg/typings/lib/ui';
import {
  AkashaReflectStreamEdge,
  AkashaReflectStreamFiltersInput,
  AkashaReflectStreamModerationStatus,
  AkashaReflectStreamSortingInput,
  SortOrder,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import {
  GetReflectionStreamDocument,
  useGetReflectionStreamLazyQuery,
} from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { hasOwn, mapReflectEntryData, useAkashaStore } from '@akashaorg/ui-awf-hooks';
import { usePendingReflections } from '@akashaorg/ui-awf-hooks/lib/use-pending-reflections';
import { GetReflectionStreamQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { PendingReflect } from './pending-reflect';
import { useApolloClient } from '@apollo/client';

export type ReflectFeedProps = {
  reflectToId: string;
  header?: ReactElement;
  scrollRestorationStorageKey: string;
  lastScrollRestorationKey: string;
  itemType: EntityTypes;
  filters?: AkashaReflectStreamFiltersInput;
  sorting?: AkashaReflectStreamSortingInput;
  estimatedHeight: number;
  itemSpacing?: number;
  scrollOptions?: {
    overScan: number;
  };
  dataTestId?: string;
  scrollTopIndicator?: (listRect: DOMRect, onScrollToTop: () => void) => React.ReactNode;
  loadingIndicator?: () => ReactElement;
  renderItem: (data?: Omit<AkashaReflectStreamEdge['node'], 'id'>) => ReactElement;
  trackEvent?: (data: AnalyticsEventData['data']) => void;
};

const ReflectFeed: React.FC<ReflectFeedProps> = props => {
  const {
    reflectToId,
    header,
    scrollRestorationStorageKey,
    lastScrollRestorationKey,
    itemType,
    filters,
    sorting,
    estimatedHeight = 150,
    itemSpacing,
    scrollOptions = { overScan: 10 },
    dataTestId,
    loadingIndicator,
    renderItem,
  } = props;
  const apolloClient = useApolloClient();
  const { pendingReflections, removePendingReflection } = usePendingReflections();
  const indexingDID = React.useRef(getSDK().services.gql.indexingDID);
  const [fetchReflectionStream, reflectionStreamQuery] = useGetReflectionStreamLazyQuery();
  const reflectionStream = React.useMemo(() => {
    if (
      reflectionStreamQuery.data?.node &&
      hasOwn(reflectionStreamQuery.data.node, 'akashaReflectStreamList')
    ) {
      return reflectionStreamQuery.data.node?.akashaReflectStreamList;
    }
  }, [reflectionStreamQuery.data]);

  const reflections = React.useMemo(() => {
    if (reflectionStream) {
      if (itemType === EntityTypes.BEAM) {
        return reflectionStream?.edges?.filter(edge => edge.node.replyTo === null) || [];
      }

      if (itemType === EntityTypes.REFLECT) {
        return reflectionStream?.edges?.filter(edge => edge.node.replyTo !== null) || [];
      }
    }
    return [];
  }, [itemType, reflectionStream]);
  const pageInfo = React.useMemo(() => {
    return reflectionStream?.pageInfo;
  }, [reflectionStream]);
  const loadingIndicatorRef = React.useRef(loadingIndicator);
  const {
    data: { isAuthenticating },
  } = useAkashaStore();

  const variables = React.useMemo(() => {
    return {
      first: 10,
      sorting: { createdAt: SortOrder.Desc, ...sorting },
      indexer: indexingDID.current,
      filters,
    };
  }, [filters, sorting]);

  useEffect(() => {
    fetchReflectionStream({
      variables,
      fetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
    });
  }, [fetchReflectionStream, variables]);

  useEffect(() => {
    const updateCache = async () => {
      for (const pendingReflection of pendingReflections) {
        if (pendingReflection.published) {
          const query = await apolloClient.cache.readQuery<GetReflectionStreamQuery>({
            query: GetReflectionStreamDocument,
            variables,
          });
          if (query?.node && hasOwn(query.node, 'akashaReflectStreamList')) {
            let newEdges = [...query.node.akashaReflectStreamList.edges];
            newEdges = [
              {
                node: {
                  reflectionID: pendingReflection.id,
                  beamID: pendingReflection.beam?.id,
                  status: pendingReflection.nsfw ? AkashaReflectStreamModerationStatus.Nsfw : null,
                  moderationID: null,
                  replyTo: itemType === EntityTypes.REFLECT ? pendingReflection.reflection : null,
                  active: pendingReflection.active,
                  createdAt: pendingReflection.createdAt,
                  isReply: !!pendingReflection.isReply,
                },
                cursor: '',
              },
              ...newEdges,
            ];
            apolloClient.cache.writeQuery({
              query: GetReflectionStreamDocument,
              variables,
              data: {
                node: {
                  ...query.node,
                  akashaReflectStreamList: {
                    ...query.node.akashaReflectStreamList,
                    edges: newEdges,
                  },
                },
              },
            });
            removePendingReflection(pendingReflection.id);
          }
        }
      }
    };
    updateCache();
  }, [pendingReflections, apolloClient, variables, itemType, removePendingReflection]);

  const filteredPendingReflections = useMemo(() => {
    if (itemType === EntityTypes.BEAM) {
      return pendingReflections.filter(
        content => content.beam?.id === reflectToId && !hasOwn(content, 'reflection'),
      );
    }
    if (itemType === EntityTypes.REFLECT) {
      return pendingReflections.filter(
        content => hasOwn(content, 'reflection') && content.reflection === reflectToId,
      );
    }
    return [];
  }, [itemType, pendingReflections, reflectToId]);

  if (!loadingIndicatorRef.current) {
    loadingIndicatorRef.current = () => (
      <Stack align="center">
        <Spinner />
      </Stack>
    );
  }

  if (isAuthenticating) return <>{loadingIndicatorRef.current()}</>;

  return (
    <Card type="plain">
      {reflectionStreamQuery.error && (
        <ErrorLoader
          type="script-error"
          title={'Sorry, there was an error when fetching reflections'}
          details={reflectionStreamQuery.error.message}
        />
      )}
      {reflections && (
        <DynamicInfiniteScroll
          header={
            <Card type="plain" customStyle="min-h-[inherit]">
              {header}
              {filteredPendingReflections.map((content, index, arr) => (
                <PendingReflect
                  key={`pending-${index}-${reflectToId}`}
                  reflectionData={mapReflectEntryData(content)}
                  customStyle={`${!reflections.length && index === arr.length - 1 ? 'rounded-b-2xl' : ''}`}
                />
              ))}
            </Card>
          }
          dataTestId={dataTestId}
          scrollRestorationStorageKey={scrollRestorationStorageKey}
          lastScrollRestorationKey={lastScrollRestorationKey}
          enableScrollRestoration={true}
          count={reflections.length}
          estimatedHeight={estimatedHeight}
          overScan={scrollOptions.overScan}
          itemSpacing={itemSpacing}
          hasNextPage={pageInfo && pageInfo.hasNextPage}
          loading={reflectionStreamQuery.loading}
          onLoadMore={async () => {
            const lastCursor = reflections[reflections.length - 1]?.cursor;
            if (reflectionStreamQuery.loading || reflectionStreamQuery.error || !lastCursor) return;
            if (lastCursor) {
              await reflectionStreamQuery.fetchMore({
                variables: {
                  after: lastCursor,
                  sorting: { createdAt: SortOrder.Desc },
                  indexer: indexingDID.current,
                },
              });
            }
          }}
        >
          {({ itemIndex }) => {
            const reflection = reflections[itemIndex];
            if (!reflection?.node) return null;
            return <>{renderItem(reflection.node)}</>;
          }}
        </DynamicInfiniteScroll>
      )}
    </Card>
  );
};

export default ReflectFeed;
