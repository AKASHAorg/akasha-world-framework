import getSdk from '@akashaorg/core-sdk';
import { GetAppsByIdDocument, GetAppsDocument } from '@akashaorg/ui-awf-hooks/lib/generated';
import {
  GetAppsByIdQuery,
  GetAppsQuery,
} from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';

export const getExtensionByName = async (decodedExtName: string) => {
  const { apolloClient } = getSdk().services.gql;
  const result = await apolloClient.query<GetAppsQuery>({
    query: GetAppsDocument,
    variables: {
      first: 1,
      filters: { where: { name: { equalTo: decodedExtName } } },
    },
  });
  return result.data;
};

export const getExtensionById = async (extensionId: string) => {
  // check if the extension id is coming from a draft extension, which use the crypto.randomUUID() method
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidV4Regex.test) {
    return null;
  }
  const { apolloClient } = getSdk().services.gql;
  const result = await apolloClient.query<GetAppsByIdQuery>({
    query: GetAppsByIdDocument,
    variables: {
      id: extensionId,
    },
  });
  return result;
};
