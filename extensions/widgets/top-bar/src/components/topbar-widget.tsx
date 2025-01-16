import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { RouterProvider } from '@tanstack/react-router';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { router } from './widget-routes';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const TopbarWidget: React.FC<unknown> = () => {
  const { getTranslationPlugin } = useRootComponentProps();

  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  );
};

export default TopbarWidget;
