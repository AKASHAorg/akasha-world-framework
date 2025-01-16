import React from 'react';
import ReactDOMClient from 'react-dom/client';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import singleSpaReact from 'single-spa-react';
import ProfileAvatar, { ProfileAvatarProps } from './profile-avatar';
import { useRootComponentProps, withProviders } from '@akashaorg/ui-core-hooks';
import { IRootExtensionProps } from '@akashaorg/typings/lib/ui';
import { I18nextProvider } from 'react-i18next';

const Index = (props: IRootExtensionProps<ProfileAvatarProps>) => {
  const { extensionData } = props;
  const { getTranslationPlugin } = useRootComponentProps();

  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <ProfileAvatar {...extensionData} />
    </I18nextProvider>
  );
};

const reactLifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: withProviders(Index),
  errorBoundary: (error, errorInfo, props: IRootExtensionProps<ProfileAvatarProps>) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(error)}, ${errorInfo}`);
    }
    return (
      <ErrorLoader type="script-error" title="Error in profile avatar" details={error.message} />
    );
  },
});

export const bootstrap = reactLifecycles.bootstrap;

export const mount = reactLifecycles.mount;

export const unmount = reactLifecycles.unmount;
