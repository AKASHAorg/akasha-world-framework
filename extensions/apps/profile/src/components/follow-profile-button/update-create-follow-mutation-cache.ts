import {
  CreateFollowMutation,
  GetFollowDocumentsByDidQuery,
} from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { GetFollowDocumentsByDidDocument } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { selectFollowDocuments } from '@akashaorg/ui-awf-hooks/lib/selectors/get-follow-documents-by-did-query';
import { ApolloCache } from '@apollo/client';

interface IUpdateCache {
  cache: ApolloCache<unknown>;
  authenticatedDID: string;
  profileID: string;
  data: CreateFollowMutation;
}

export async function updateCreateFollowMutationCache({
  cache,
  authenticatedDID,
  profileID,
  data: { setAkashaFollow },
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
  const { id, isFollowing, profile } = setAkashaFollow.document;
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
        },
      },
    },
  });
}
