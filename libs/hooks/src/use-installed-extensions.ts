import getSDK from '@akashaorg/core-sdk';
import { useEffect, useState } from 'react';
import { selectApp } from './selectors/get-app-release-by-id-query';
import { useGetAppReleaseByIdLazyQuery } from './generated';
import { AkashaApp } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { InstalledExtensionSchema } from '@akashaorg/core-sdk/lib/db/installed-extensions.schema';
import { AkashaProfile } from '@akashaorg/typings/lib/ui';

export type InstalledExtension = Pick<
  AkashaApp,
  | 'id'
  | 'name'
  | 'displayName'
  | 'logoImage'
  | 'coverImage'
  | 'description'
  | 'applicationType'
  | 'description'
  | 'nsfw'
> & { author: AkashaProfile };

export const useInstalledExtensions = () => {
  const [appReleaseLazyQuery] = useGetAppReleaseByIdLazyQuery();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>(null);
  const [apps, setApps] = useState<InstalledExtension[]>(null);
  useEffect(() => {
    const getInstalledExtensions = async () => {
      setLoading(true);
      try {
        const sdk = getSDK();
        const installedExtensions =
          (await sdk.services.db.getCollections().installedExtensions?.toArray()) || [];

        const fetchAppData = async (installedExtension: InstalledExtensionSchema) => {
          const { data } = await appReleaseLazyQuery({
            variables: { id: installedExtension.releaseId },
          });
          const appInfo = selectApp(data);

          return data
            ? {
                ...appInfo,
                author: appInfo.author?.akashaProfile,
              }
            : null;
        };

        setApps(await Promise.all(installedExtensions.map(fetchAppData)));
      } catch (ex) {
        setError(ex);
      } finally {
        setLoading(false);
      }
    };
    getInstalledExtensions();
  }, [appReleaseLazyQuery]);

  return { error, loading, data: apps };
};
