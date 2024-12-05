import { GetAppsByPublisherDidQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { SortOrder } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { GetAppsByPublisherDidDocument } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { selectApps } from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-by-publisher-did-query';
import { ApolloCache } from '@apollo/client';

interface IUpdateCache {
  cache: ApolloCache<unknown>;
  authenticatedDID: string;
  removedAppId: string;
}

export async function updateAppMutationCache({
  cache,
  authenticatedDID,
  removedAppId,
}: IUpdateCache) {
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
  const newEdges = apps
    .filter(app => app.id !== removedAppId)
    .map(app => ({ node: app, cursor: '' }));
  cache.writeQuery<GetAppsByPublisherDidQuery>({
    query: GetAppsByPublisherDidDocument,
    variables,
    data: {
      node: {
        ...query.node,
        akashaAppList: {
          // ...apps,
          edges: newEdges,
          pageInfo: null,
        },
      },
    },
  });
}
