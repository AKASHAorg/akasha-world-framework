import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { RouterProvider } from '@tanstack/react-router';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import { Helmet, helmetData } from '@akashaorg/design-system-core/lib/utils';
import { router } from './app-routes';

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof router>;
  }
}

const Application: React.FC<unknown> = () => {
  const { baseRouteName, getTranslationPlugin, worldConfig } = useRootComponentProps();

  return (
    <React.Suspense fallback={<Spinner />}>
      <I18nextProvider i18n={getTranslationPlugin().i18n}>
        <Helmet helmetData={helmetData}>
          <title>World Builder | {worldConfig.title}</title>
        </Helmet>
        <RouterProvider
          router={router({
            baseRouteName,
          })}
        />
      </I18nextProvider>
    </React.Suspense>
  );
};

export default Application;
