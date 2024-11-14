import React, { createContext, useMemo } from 'react';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { Outlet } from '@tanstack/react-router';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import appRoutes, { EDIT_EXTENSION } from '../../../routes';
import { useTranslation } from 'react-i18next';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { AppImageSource } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { ExtensionEditStep2FormValues } from '@akashaorg/design-system-components/lib/components/ExtensionEditStep2Form';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';

export const AtomContext = createContext(null);

const storage = createJSONStorage(() => sessionStorage);

export type FormData = {
  lastCompletedStep?: number;
  sourceURL?: string;
  name?: string;
  displayName?: string;
  logoImage?: AppImageSource;
  coverImage?: AppImageSource;
  license?: string;
  contributors?: string[];
  keywords?: string[];
} & ExtensionEditStep2FormValues;

type ExtensionEditMainPageProps = {
  extensionId: string;
};

export const ExtensionEditMainPage: React.FC<ExtensionEditMainPageProps> = ({ extensionId }) => {
  const { t } = useTranslation('app-extensions');

  const { baseRouteName, getCorePlugins } = useRootComponentProps();

  const navigateTo = getCorePlugins().routing.navigateTo;

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const formData = useMemo(
    () =>
      atomWithStorage<FormData>(
        extensionId,
        {
          lastCompletedStep: 0,
          name: '',
          displayName: '',
          logoImage: { src: '' },
          coverImage: { src: '' },
          nsfw: false,
          description: '',
          gallery: null,
          links: [],
          contributors: [],
          license: '',
          keywords: [],
        },
        storage,
      ),
    [extensionId],
  );

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${appRoutes[EDIT_EXTENSION]}/${extensionId}/step1`,
        }).toString()}`;
      },
    });
  };

  if (!authenticatedDID) {
    return (
      <ErrorLoader
        type="not-authenticated"
        title={`${t('Uh-oh')}! ${t('You are not connected')}!`}
        details={`${t('To check your extensions you must be connected')} ⚡️`}
      >
        <Button
          variant="primary"
          size="md"
          label={t('Connect')}
          onClick={handleConnectButtonClick}
        />
      </ErrorLoader>
    );
  }

  return (
    <Card padding={0}>
      <AtomContext.Provider value={formData}>
        <Outlet />
      </AtomContext.Provider>
    </Card>
  );
};
