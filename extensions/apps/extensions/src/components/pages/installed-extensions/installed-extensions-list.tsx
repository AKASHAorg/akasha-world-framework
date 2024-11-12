import React from 'react';
import AppList from '@akashaorg/design-system-components/lib/components/AppList';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Image from '@akashaorg/design-system-core/lib/components/Image';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import appRoutes, { INSTALLED } from '../../../routes';
import { useTranslation } from 'react-i18next';
import {
  type InstalledExtension,
  useInstalledExtensions,
} from '@akashaorg/ui-awf-hooks/lib/use-installed-extensions';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { useNavigate } from '@tanstack/react-router';

const PUBLIC_IMAGE_PATH = '/images';

export const InstalledExtensionsList = () => {
  const navigate = useNavigate();
  const { getCorePlugins, encodeAppName, baseRouteName } = useRootComponentProps();
  const { t } = useTranslation('app-extensions');

  const navigateTo = getCorePlugins().routing.navigateTo;

  const handleAppClick = (appName: string) => {
    navigate({
      to: '/info/$appId',
      params: { appId: encodeAppName(appName) },
    });
  };

  const handleDiscoverClick = () => {
    navigate({
      to: '/extensions-hub',
    });
  };

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${appRoutes[INSTALLED]}`,
        }).toString()}`;
      },
    });
  };

  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();
  const { data, error, loading } = useInstalledExtensions();

  const addAction = (ext: InstalledExtension) => ({
    ...ext,
    action: (
      <Button variant="secondary" label={t('Open')} onClick={() => handleAppClick(ext.name)} />
    ),
  });

  const installedExtensions = data?.map(addAction);

  if (!authenticatedDID && !isAuthenticating)
    return (
      <ErrorLoader
        type="not-authenticated"
        title={`${t('Uh-oh')}! ${t('You are not connected')}!`}
        details={`${t('To check installed extensions you must be connected')} ⚡️`}
      >
        <Button
          variant="primary"
          size="md"
          label={t('Connect')}
          onClick={handleConnectButtonClick}
        />
      </ErrorLoader>
    );

  if (loading || isAuthenticating)
    return (
      <Card padding="p-4">
        {
          //@TODO replace with Loader component once its created
        }
        <Stack spacing="gap-y-5" align="center">
          <Spinner />
          <Text variant="button-md">{t('Loading installed extensions')}</Text>
        </Stack>
      </Card>
    );

  return (
    <>
      {error && (
        <ErrorLoader
          title={
            <Text variant="h5" align="center" selectable={false}>
              {t(`Uh-oh! We couldn't load`)} <br />
              {t(`the extensions list!`)}
            </Text>
          }
          details={
            <Text variant="body2" align="center" selectable={false} customStyle="w-60 sm:w-auto">
              {t('There might be an issue with the database. Please try again later!')}
            </Text>
          }
          type="list-not-available"
        />
      )}
      {installedExtensions && (
        <Card padding="p-4">
          <Stack spacing="gap-y-3" align="center">
            {!installedExtensions.length && (
              <>
                <Stack customStyle="h-52 w-52">
                  <Image
                    customStyle="object-contain"
                    src={`${PUBLIC_IMAGE_PATH}/longbeam-notfound.webp`}
                  />
                </Stack>
                <Text variant="h6">{t('No extensions installed yet!')}</Text>
                <Stack align="center">
                  <Text as="span" variant="body2" color={{ light: 'grey5', dark: 'grey6' }}>
                    <Button
                      variant="text"
                      size="md"
                      label={t('Discover')}
                      onClick={handleDiscoverClick}
                      customStyle="inline-block"
                    />{' '}
                    {t('cool extensions and install them')}
                  </Text>
                  <Text variant="body2" color={{ light: 'grey5', dark: 'grey6' }}>
                    {t('cool extensions and install them to customize your world')}
                  </Text>
                </Stack>
              </>
            )}
            {!!installedExtensions.length && (
              <AppList
                apps={installedExtensions}
                // implementation requires pagination support on installed extensions service on sdk
                onLoadMore={() => null}
              />
            )}
          </Stack>
        </Card>
      )}
    </>
  );
};
