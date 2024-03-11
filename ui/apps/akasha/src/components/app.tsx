import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useGetLogin, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { router } from './app-routes';
import { RouterProvider } from '@tanstack/react-router';
import { useApolloClient } from '@apollo/client';

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof router>;
  }
}

const SocialApp: React.FC<unknown> = () => {
  const { getTranslationPlugin, baseRouteName } = useRootComponentProps();
  const apolloClient = useApolloClient();
  const login = useGetLogin();

  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <RouterProvider
        router={router({
          baseRouteName,
          apolloClient,
          authenticatedDID: login.data?.id ?? '',
        })}
      />
    </I18nextProvider>
  );
};

export default SocialApp;
