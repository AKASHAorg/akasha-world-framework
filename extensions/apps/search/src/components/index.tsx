import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useRootComponentProps, withProviders } from '@akashaorg/ui-core-hooks';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './app-routes';
import { useApolloClient } from '@apollo/client';
import { Helmet, helmetData } from '@akashaorg/design-system-core/lib/utils';

const App: React.FC<unknown> = () => {
  const { getTranslationPlugin, baseRouteName, worldConfig } = useRootComponentProps();
  const apolloClient = useApolloClient();

  return (
    <React.Suspense fallback={<Spinner />}>
      <I18nextProvider i18n={getTranslationPlugin().i18n}>
        <Helmet helmetData={helmetData}>
          <title>Search | {worldConfig.title}</title>
        </Helmet>
        <Stack dataTestId="search-box">
          <RouterProvider
            router={router({
              baseRouteName,
              apolloClient,
            })}
          />
        </Stack>
      </I18nextProvider>
    </React.Suspense>
  );
};

export default withProviders(App);
