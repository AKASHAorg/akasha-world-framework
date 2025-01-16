import React from 'react';
import { useRootComponentProps, withProviders } from '@akashaorg/ui-core-hooks';
import { I18nextProvider } from 'react-i18next';
import SidebarComponent from './components/sidebar-component';

const Widget: React.FC<unknown> = () => {
  const { getTranslationPlugin } = useRootComponentProps();

  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <SidebarComponent />
    </I18nextProvider>
  );
};
export default withProviders(Widget);
