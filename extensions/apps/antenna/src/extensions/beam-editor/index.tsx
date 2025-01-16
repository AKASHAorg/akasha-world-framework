import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useRootComponentProps, withProviders } from '@akashaorg/ui-core-hooks';
import { BeamEditor } from './beam-editor';
import singleSpaReact from 'single-spa-react';
import ReactDOMClient from 'react-dom/client';
import { IRootExtensionProps } from '@akashaorg/typings/lib/ui';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';

const Wrapped = (_: IRootExtensionProps) => {
  const { getTranslationPlugin } = useRootComponentProps();
  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <BeamEditor />
    </I18nextProvider>
  );
};

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: withProviders(Wrapped),
  errorBoundary: (err, errorInfo, props: IRootExtensionProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(errorInfo)}, ${errorInfo}`);
    }

    return <ErrorLoader type="script-error" title="Error in editor" details={err.message} />;
  },
});
