import getSDK from '@akashaorg/core-sdk';
import { hasOwn } from '@akashaorg/ui-awf-hooks';
import { GetProfileByDidQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { GetProfileByDidDocument } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { ApolloClient } from '@apollo/client';
import type { AkashaProfile, IProfilePlugin } from '@akashaorg/typings/lib/ui';

export class ProfilePlugin implements IProfilePlugin<AkashaProfile> {
  #apolloClient: ApolloClient<object>;
  constructor() {
    this.#apolloClient = getSDK().services.gql.queryClient;
  }

  /**
   * Fetch AKASHA profile info
   */
  getProfileInfo = async ({ profileDID }): Promise<{ data: AkashaProfile; error: string }> => {
    const profileQuery = await this.#apolloClient.query<GetProfileByDidQuery>({
      query: GetProfileByDidDocument,
      variables: {
        id: profileDID,
      },
      fetchPolicy: 'cache-first',
    });
    const error = JSON.stringify(profileQuery.errors?.map(error => error.message));
    const profileData =
      profileQuery.data?.node && hasOwn(profileQuery.data?.node, 'isViewer')
        ? profileQuery.data.node.akashaProfile
        : null;

    return { data: profileData, error };
  };
}
