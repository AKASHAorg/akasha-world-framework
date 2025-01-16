import { GetFollowDocumentsByDidQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { AkashaProfile } from '@akashaorg/typings/lib/ui';
import { GetFollowDocumentsByDidDocument } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { selectFollowDocuments } from '@akashaorg/ui-core-hooks/lib/selectors/get-follow-documents-by-did-query';
import { ApolloCache } from '@apollo/client';

interface IUpdateCache {
  cache: ApolloCache<unknown>;
  authenticatedDID: string;
  profileID: string;
  data: { id: string; isFollowing: boolean; profile?: AkashaProfile };
}

export async function updateFollowMutationCache({
  cache,
  authenticatedDID,
  profileID,
  data: { id, isFollowing, profile },
}: IUpdateCache) {
  const variables = {
    id: authenticatedDID,
    following: [profileID],
    last: 1,
  };
  const query = await cache.readQuery<GetFollowDocumentsByDidQuery>({
    query: GetFollowDocumentsByDidDocument,
    variables,
  });
  const followDocuments = selectFollowDocuments(query);
  const newEdges = [
    {
      node: {
        id: id,
        isFollowing: isFollowing,
        profileID: profile?.id,
        profile,
      },
      cursor: '',
    },
    ...followDocuments,
  ];
  cache.writeQuery<GetFollowDocumentsByDidQuery>({
    query: GetFollowDocumentsByDidDocument,
    variables,
    data: {
      node: {
        ...query.node,
        akashaFollowList: {
          ...followDocuments,
          edges: newEdges,
          pageInfo: null,
        },
      },
    },
  });
}
