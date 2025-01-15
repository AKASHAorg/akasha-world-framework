import singleSpaReact from 'single-spa-react';
import * as React from 'react';
import ReactDOMClient from 'react-dom/client';
import { useRootComponentProps, withProviders } from '@akashaorg/ui-core-hooks';
import { IRootComponentProps } from '@akashaorg/typings/lib/ui';
import CookieWidget from './cookie-widget';
import { I18nextProvider } from 'react-i18next';

const Widget = (props: IRootComponentProps) => {
  const { getTranslationPlugin } = useRootComponentProps();
  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <CookieWidget {...props} />
    </I18nextProvider>
  );
};

const reactLifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: withProviders(Widget),
  errorBoundary: (err, errorInfo, props: IRootComponentProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(err)}, ${errorInfo}`);
    }
    return <div>!</div>;
  },
});

export const bootstrap = reactLifecycles.bootstrap;

export const mount = reactLifecycles.mount;

export const unmount = reactLifecycles.unmount;
