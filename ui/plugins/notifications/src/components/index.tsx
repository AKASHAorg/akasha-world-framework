import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';
import { withProviders } from '@akashaproject/ui-awf-hooks';
import { setupI18next } from '../i18n';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';
import DS from '@akashaproject/design-system';

const { ErrorLoader, ThemeSelector, darkTheme, lightTheme } = DS;

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: withProviders(App),
  errorBoundary: (error, errorInfo, props: RootComponentProps) => {
    if (props.logger) {
      props.logger.error(error, errorInfo);
    }
    return (
      <ThemeSelector
        availableThemes={[lightTheme, darkTheme]}
        settings={{ activeTheme: 'LightTheme' }}
      >
        <ErrorLoader
          type="script-error"
          title="Error in notifications plugin"
          details={error.message}
        />
      </ThemeSelector>
    );
  },
});

export const bootstrap = (props: RootComponentProps) => {
  return setupI18next({
    logger: props.logger,
    // must be the same as the one in ../../i18next.parser.config.js
    namespace: 'ui-plugin-notifications',
  });
};

export const mount = reactLifecycles.mount;

export const unmount = reactLifecycles.unmount;
