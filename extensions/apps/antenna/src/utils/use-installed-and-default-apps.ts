import getSDK from '@akashaorg/core-sdk';
import { SortOrder } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { useGetAppsByPublisherDidQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { useRef } from 'react';
import { useInstalledExtensions } from '@akashaorg/ui-core-hooks/lib/use-installed-extensions';
import { selectApps } from '@akashaorg/ui-core-hooks/lib/selectors/get-apps-by-publisher-did-query';

export const useInstalledAndDefaultApps = () => {
  const { getDefaultExtensionNames } = useRootComponentProps();
  const sdk = useRef(getSDK());
  const defaultApps = getDefaultExtensionNames();
  const installedExtensions = useInstalledExtensions();

  const { data } = useGetAppsByPublisherDidQuery({
    variables: {
      id: sdk.current.services.gql.indexingDID,
      filters: {
        or: defaultApps.map(app => ({ where: { name: { equalTo: app } } })),
      },
      first: defaultApps.length,
      sorting: { createdAt: SortOrder.Asc },
    },
  });

  return [...(installedExtensions.data || []), ...(selectApps(data) || [])];
};
