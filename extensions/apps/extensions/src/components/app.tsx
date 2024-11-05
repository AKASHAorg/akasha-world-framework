import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './app-routes/index';
import { useApolloClient } from '@apollo/client';
import { Helmet, helmetData } from '@akashaorg/design-system-core/lib/utils';

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof router>;
  }
}

const App: React.FC<unknown> = () => {
  const { getTranslationPlugin, baseRouteName, worldConfig, decodeAppName, plugins } =
    useRootComponentProps();
  const apolloClient = useApolloClient();

  return (
    <React.StrictMode>
      <React.Suspense fallback={<Spinner />}>
        <I18nextProvider i18n={getTranslationPlugin().i18n}>
          <Helmet helmetData={helmetData}>
            <title>Extensions | {worldConfig.title}</title>
          </Helmet>
          <RouterProvider
            router={router({
              baseRouteName,
              apolloClient,
              decodeAppName,
              plugins,
            })}
          />
        </I18nextProvider>
      </React.Suspense>
    </React.StrictMode>
  );
};

export default App;
