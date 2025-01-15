import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import { I18nextProvider, useTranslation } from 'react-i18next';

import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Modal from '@akashaorg/design-system-core/lib/components/Modal';

import { IRootExtensionProps } from '@akashaorg/typings/lib/ui';
import { useRootComponentProps, withProviders, useModalData } from '@akashaorg/ui-core-hooks';

const LoginModal = () => {
  const { t } = useTranslation('app-profile');
  const location = window.location;
  const { getCorePlugins } = useRootComponentProps();

  const { modalData } = useModalData();

  const message = React.useRef('To continue you need an AKASHA World account');
  if (modalData?.message) {
    message.current = modalData.message;
  }
  const messageTitle = React.useRef('AKASHA World');
  if (modalData?.title) {
    messageTitle.current = modalData.title;
  }

  React.useEffect(() => {
    return () => {
      message.current = null;
      messageTitle.current = null;
    };
  }, []);

  const handleModalClose = () => {
    window.history.replaceState(null, null, location.pathname);
  };

  const handleConnectClick = () => {
    getCorePlugins().routing.navigateTo?.(
      {
        appName: '@akashaorg/app-auth-ewa',
        getNavigationUrl: appRoutes => {
          const redirectTo = new URLSearchParams(location.search).get('redirectTo');
          return `${appRoutes.Connect}?${new URLSearchParams({
            redirectTo: redirectTo || location.pathname,
          }).toString()}`;
        },
      },
      true,
    );
  };

  return (
    <Modal
      show={modalData?.name === 'login'}
      title={{
        label: t('{{messageTitle}}', { messageTitle: messageTitle.current }),
        variant: 'h6',
      }}
      actions={[
        { label: t('Cancel'), variant: 'secondary', onClick: handleModalClose },
        { label: t('Connect'), variant: 'primary', onClick: handleConnectClick },
      ]}
      onClose={handleModalClose}
      customStyle="py-4 px-6 md:px-24"
    >
      <Stack align="center" fullWidth={true} spacing="gap-y-2">
        <Text variant="body1" align="center">
          {t('{{message}}', { message: message.current })}
        </Text>
      </Stack>
    </Modal>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Wrapped = (_: IRootExtensionProps) => {
  const { getTranslationPlugin } = useRootComponentProps();
  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <LoginModal />
    </I18nextProvider>
  );
};

const reactLifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: withProviders(Wrapped),
  errorBoundary: (err, errorInfo, props: IRootExtensionProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(err)}, ${errorInfo}`);
    }
    return <ErrorLoader type="script-error" title="Error in login modal" details={err.message} />;
  },
});

export const bootstrap = reactLifecycles.bootstrap;

export const mount = reactLifecycles.mount;

export const unmount = reactLifecycles.unmount;
