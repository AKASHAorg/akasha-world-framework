import React, { createContext, useMemo } from 'react';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { Outlet } from '@tanstack/react-router';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import appRoutes, { EDIT_PUBLISHED_EXTENSION } from '../../../routes';
import { useTranslation } from 'react-i18next';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { AppImageSource, AppLinkSource } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';

export const AtomContext = createContext(null);

const storage = createJSONStorage(() => sessionStorage);

export type FormData = {
  dataSavedToForm?: boolean;
  logoImage?: AppImageSource;
  coverImage?: AppImageSource;
  description?: string;
  gallery?: AppImageSource[];
  links?: AppLinkSource[];
};

type ExtensionEditPublishedMainPageProps = {
  extensionId: string;
};

export const formDefaultData = {
  dataSavedToForm: false,
  logoImage: { src: '' },
  coverImage: { src: '' },
  description: '',
  gallery: null,
  links: [],
};

export const ExtensionEditPublishedMainPage: React.FC<ExtensionEditPublishedMainPageProps> = ({
  extensionId,
}) => {
  const { t } = useTranslation('app-extensions');

  const { baseRouteName, getCorePlugins } = useRootComponentProps();

  const navigateTo = getCorePlugins().routing.navigateTo;

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const formData = useMemo(
    () => atomWithStorage<FormData>(extensionId, formDefaultData, storage),
    [extensionId],
  );

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${appRoutes[EDIT_PUBLISHED_EXTENSION]}/${extensionId}/form`,
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
