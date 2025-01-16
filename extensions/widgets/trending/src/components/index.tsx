import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { useRootComponentProps, withProviders } from '@akashaorg/ui-core-hooks';

import TrendingWidgetComponent from './trending-widget-component';

const TrendingWidgetRoot: React.FC<unknown> = () => {
  const { getTranslationPlugin } = useRootComponentProps();

  return (
    <>
      <I18nextProvider i18n={getTranslationPlugin().i18n} defaultNS="ui-widget-trending">
        <TrendingWidgetComponent />
      </I18nextProvider>
    </>
  );
};

export default withProviders(TrendingWidgetRoot);
