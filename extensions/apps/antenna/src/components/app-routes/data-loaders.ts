import getSDK from '@akashaorg/core-sdk';
import {
  GetBeamByIdQuery,
  GetBeamStreamQuery,
  GetReflectionByIdQuery,
  GetReflectionStreamQuery,
} from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { AkashaBeamStreamModerationStatus } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { IRouterContext } from '@akashaorg/typings/lib/ui';
import { hasOwn } from '@akashaorg/ui-core-hooks';
import {
  GetBeamByIdDocument,
  GetBeamStreamDocument,
  GetReflectionByIdDocument,
  GetReflectionStreamDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';

/**
 * Gets beam data by specifying its id in the query's variable
 * @param param0 - an object containing the apolloClient and beamId
 * @returns an object containing the data and error values from the query
 * @example
 * ```typescript
 * const response = getBeamById({ apolloClient, beamId: 'kjzl6kcym7w8y7gyq' });
 * ```
 */
export async function getBeamById({ apolloClient, beamId }: IRouterContext & { beamId: string }) {
  const response = await apolloClient.query<GetBeamByIdQuery>({
    query: GetBeamByIdDocument,
    variables: { id: beamId },
    fetchPolicy: 'cache-first',
  });
  return response;
}

/**
 * Gets specific beam data from beam stream
 * @param param0 - an object containing the apolloClient and beamId
 * @returns an object containing the data and error values from the query
 * ```typescript
 * const response = getBeamStreamById({ apolloClient, beamId: 'kjzl6kcym7w8y7gyq' });
 * ```
 */
export async function getBeamStreamById({
  apolloClient,
  beamId,
}: IRouterContext & { beamId: string }) {
  const sdk = getSDK();
  const response = await apolloClient.query<GetBeamStreamQuery>({
    query: GetBeamStreamDocument,
    variables: {
      first: 1,
      indexer: sdk.services.gql.indexingDID,
      filters: { where: { beamID: { equalTo: beamId } } },
    },
    fetchPolicy: 'cache-first',
  });
  return response;
}

/**
 * Extracts beam data from the returned query result
 * @param beamByIdQuery - query response data
 * @returns an object containing the beam
 * @example
 * ```typescript
 * import type { GetBeamByIdQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
 * import { useGetBeamByIdQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
 *
 * const beamData: GetBeamByIdQuery = useGetBeamByIdQuery();
 * const beamNode: GetBeamByIdQuery['node'] = selectBeamNode(beamData);
 * ```
 */
export function selectBeamNode(beamByIdQuery: GetBeamByIdQuery) {
  if (beamByIdQuery?.node && hasOwn(beamByIdQuery.node, 'id')) {
    return { ...beamByIdQuery?.node, author: { id: beamByIdQuery?.node?.author?.id } };
  }
}

/**
 * Extracts the moderation status of a beam from a beam stream list
 * @param beamStream - query response data
 * @returns AkashaBeamStreamModerationStatus
 * @example
 * ```typescript
 * import type { GetBeamStreamQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
 * import { AkashaBeamStreamModerationStatus } from '@akashaorg/typings/lib/sdk/graphql-types-new';
 * import { useGetBeamStreamQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
 *
 * const beamStream: GetBeamStreamQuery = useGetBeamStreamQuery();
 * const beamStatus: AkashaBeamStreamModerationStatus = selectBeamStatusField(beamStream);
 * ```
 */
export function selectBeamStatusField(
  beamStream: GetBeamStreamQuery,
): AkashaBeamStreamModerationStatus {
  if (
    beamStream?.node &&
    hasOwn(beamStream.node, 'akashaBeamStreamList') &&
    beamStream.node.akashaBeamStreamList.edges?.[0]?.node &&
    hasOwn(beamStream.node.akashaBeamStreamList.edges[0].node, 'status')
  ) {
    return beamStream.node.akashaBeamStreamList.edges[0].node.status;
  }
}

/**
 * Extracts the active status of a beam from a beam stream list
 * @param streamData - query response data
 * @returns boolean
 * @example
 * ```typescript
 * import type { GetBeamStreamQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
 * import { useGetBeamStreamQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
 *
 * const beamStream: GetBeamStreamQuery = useGetBeamStreamQuery();
 * const beamActive: boolean = selectBeamActiveField(beamStream);
 * ```
 */
export function selectBeamActiveField(streamData: GetBeamStreamQuery) {
  return (
    streamData?.node &&
    hasOwn(streamData.node, 'akashaBeamStreamList') &&
    streamData.node.akashaBeamStreamList.edges?.[0]?.node?.active
  );
}

/**
 * Gets reflection data by specifying its id in the query's variable
 * @param param0 - an object containing the apolloClient and reflectionId
 * @returns an object containing the data and error values from the query
 * @example
 * ```typescript
 * const response = getReflectionById({
  apolloClient,
  reflectionId: 'kjzl6kcym7w8y8w8',
});
 * ```
 */
export async function getReflectionById({
  apolloClient,
  reflectionId,
}: IRouterContext & { reflectionId: string }) {
  const response = await apolloClient.query<GetReflectionByIdQuery>({
    query: GetReflectionByIdDocument,
    variables: { id: reflectionId },
    fetchPolicy: 'cache-first',
  });
  return response;
}

/**
 * Gets specific reflection data from reflection stream
 * @param param0 - an object containing the apolloClient and reflectionId
 * @returns an object containing the data and error values from the query
 * ```typescript
 * const response = getReflectionStreamById({
  apolloClient,
  reflectionId: 'kjzl6kcym7w8y8w8',
});
 * ```
 */
export async function getReflectionStreamById({
  apolloClient,
  reflectionId,
}: IRouterContext & { reflectionId: string }) {
  const sdk = getSDK();
  const response = await apolloClient.query<GetReflectionStreamQuery>({
    query: GetReflectionStreamDocument,
    variables: {
      first: 1,
      indexer: sdk.services.gql.indexingDID,
      filters: { where: { reflectionID: { equalTo: reflectionId } } },
    },
    fetchPolicy: 'cache-first',
  });
  return response;
}

/**
 * Extracts reflection data from the returned query result
 * @param reflectionByIdQuery - query response data
 * @returns an object containing the reflection
 * @example
 * ```typescript
 * import type { GetReflectionByIdQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
 * import { useGetReflectionByIdQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
 *
 * const reflectionData: GetReflectionByIdQuery = useGetReflectionByIdQuery();
 * const reflectionNode: GetReflectionByIdQuery['node'] = selectReflectionNode(reflectionData);
 * ```
 */
export function selectReflectionNode(reflectionByIdQuery: GetReflectionByIdQuery) {
  if (
    reflectionByIdQuery &&
    hasOwn(reflectionByIdQuery, 'node') &&
    hasOwn(reflectionByIdQuery.node, 'id')
  ) {
    return reflectionByIdQuery.node;
  }
}

/**
 * Extracts the active status of a reflection from a reflection stream list
 * @param streamData - query response data
 * @returns boolean value of the status
 * @example
 * ```typescript
 * import type { GetReflectionStreamQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
 * import { useGetReflectionStreamQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
 *
 * const reflectionStream: GetReflectionStreamQuery = useGetReflectionStreamQuery();
 * const reflectionActive: boolean = selectReflectionActiveField(reflectionStream);
 * ```
 */
export function selectReflectionActiveField(streamData: GetReflectionStreamQuery) {
  return (
    streamData?.node &&
    hasOwn(streamData.node, 'akashaReflectStreamList') &&
    streamData.node.akashaReflectStreamList?.edges?.[0].node?.active
  );
}
