import {
  SetAppReleaseMutation,
  GetAppsReleasesQuery,
} from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { SortOrder } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { GetAppsReleasesDocument } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { ApolloCache } from '@apollo/client';

interface IUpdateCache {
  cache: ApolloCache<unknown>;
  document: SetAppReleaseMutation['setAkashaAppRelease']['document'];
  applicationID: string;
}

export async function createReleaseMutationCache({ cache, document, applicationID }: IUpdateCache) {
  cache.writeQuery<GetAppsReleasesQuery>({
    query: GetAppsReleasesDocument,
    variables: {
      first: 10,
      filters: { where: { applicationID: { equalTo: applicationID } } },
      sorting: { createdAt: SortOrder.Desc },
    },
    data: {
      akashaAppReleaseIndex: {
        edges: document.application.releases.edges.map(edge => ({
          ...edge,
          node: { ...edge.node, applicationID },
        })),
        pageInfo: null,
      },
    },
  });
}
