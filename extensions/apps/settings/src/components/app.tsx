import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';

import { RouterProvider } from '@tanstack/react-router';
import { router } from './app-routes/index';
import { Helmet, helmetData } from '@akashaorg/design-system-core/lib/utils';

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof router>;
  }
}

const Application: React.FC<unknown> = () => {
  const { getTranslationPlugin, baseRouteName, worldConfig } = useRootComponentProps();

  return (
    <React.StrictMode>
      <React.Suspense fallback={<Spinner />}>
        <I18nextProvider i18n={getTranslationPlugin().i18n}>
          <Helmet helmetData={helmetData}>
            <title>Settings | {worldConfig.title}</title>
          </Helmet>
          <RouterProvider
            router={router({
              baseRouteName,
            })}
          />
        </I18nextProvider>
      </React.Suspense>
    </React.StrictMode>
  );
};

export default Application;
