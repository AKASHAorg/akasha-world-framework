import {
  CreateAppMutation,
  GetAppsByPublisherDidQuery,
} from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { SortOrder } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { GetAppsByPublisherDidDocument } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { selectApps } from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-by-publisher-did-query';
import { ApolloCache } from '@apollo/client';

interface IUpdateCache {
  cache: ApolloCache<unknown>;
  authenticatedDID: string;
  data: CreateAppMutation['setAkashaApp']['document'];
}

export async function createAppMutationCache({ cache, authenticatedDID, data }: IUpdateCache) {
  const variables = {
    id: authenticatedDID,
    first: 10,
    sorting: { createdAt: SortOrder.Desc },
  };
  const query = cache.readQuery<GetAppsByPublisherDidQuery>({
    query: GetAppsByPublisherDidDocument,
    variables,
  });
  const apps = selectApps(query);
  const updatedApps = [data, ...apps];
  cache.writeQuery<GetAppsByPublisherDidQuery>({
    query: GetAppsByPublisherDidDocument,
    variables,
    data: {
      node: {
        ...query.node,
        akashaAppList: {
          edges: updatedApps.map(app => ({
            node: app,
            cursor: '',
          })),
          pageInfo: null,
        },
      },
    },
  });
}
