import React from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import { I18nextProvider } from 'react-i18next';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './app-routes';
import { useApolloClient } from '@apollo/client';

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof router>;
  }
}

const App: React.FC<unknown> = () => {
  const { getTranslationPlugin, baseRouteName } = useRootComponentProps();
  const apolloClient = useApolloClient();

  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <Stack direction="column" spacing="gap-y-4" customStyle="mb-4">
        <RouterProvider
          router={router({
            baseRouteName,
            apolloClient,
          })}
        />
      </Stack>
    </I18nextProvider>
  );
};

export default App;
