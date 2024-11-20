import { GetProfileByDidQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { AkashaProfile } from '@akashaorg/typings/lib/ui';
import { GetProfileByDidDocument } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { ApolloCache } from '@apollo/client';

interface IUpdateCache {
  cache: ApolloCache<unknown>;
  profileDID: string;
  data: AkashaProfile;
}

export async function updateProfileMutationCache({ cache, profileDID, data }: IUpdateCache) {
  const variables = {
    id: profileDID,
  };

  console.log(data, 'before cache update');

  const result = cache.updateQuery<GetProfileByDidQuery>(
    {
      query: GetProfileByDidDocument,
      variables,
    },
    profileQuery => ({ node: { ...profileQuery.node, akashaProfile: { ...data } } }),
  );

  console.log(result.node, 'after cache update');
}
