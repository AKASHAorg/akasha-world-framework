import React, { PropsWithChildren } from 'react';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { AnalyticsProvider } from '@akashaorg/ui-core-hooks/lib/use-analytics';
import { genAppProps } from './data-generator';

const getI18nInstance = () => {
  i18n.use(initReactI18next).init({
    fallbackLng: 'en',
    ns: ['translations'],
    defaultNS: 'translations',
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: { en: {}, es: {}, de: {} },
  });
  return i18n;
};

const TranslationProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <React.Suspense fallback="loading">
      <div id="test-translation-provider">
        <I18nextProvider i18n={getI18nInstance()}>{children}</I18nextProvider>
      </div>
    </React.Suspense>
  );
};

const AllProviders: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <AnalyticsProvider {...genAppProps()}>
      <TranslationProvider>{children}</TranslationProvider>
    </AnalyticsProvider>
  );
};

export { TranslationProvider, AllProviders };
