import singleSpaReact from 'single-spa-react';
import ReactDOMClient from 'react-dom/client';
import React from 'react';
import { useRootComponentProps, withProviders, useModalData } from '@akashaorg/ui-core-hooks';
import { IRootExtensionProps } from '@akashaorg/typings/lib/ui';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Modal from '@akashaorg/design-system-core/lib/components/Modal';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { useUpdateBeamMutation } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import getSDK from '@akashaorg/core-sdk';

const Component: React.FC<IRootExtensionProps> = () => {
  const sdk = getSDK();
  const { t } = useTranslation();
  const { modalData } = useModalData();
  const [updateBeam, updateBeamQuery] = useUpdateBeamMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
  });

  const handleModalClose = React.useCallback(() => {
    window.history.replaceState(null, null, location.pathname);
  }, []);

  const handleRemove = () => {
    updateBeam({
      variables: {
        i: {
          content: {
            active: false,
          },
          id: modalData['beamId'],
          options: {
            shouldIndex: false,
          },
        },
      },
    })
      .then(() => handleModalClose())
      .catch(err => console.error(err));
  };

  const isQueryCalled = updateBeamQuery.called && updateBeamQuery.loading;

  return (
    <Modal
      show={modalData?.name === 'remove-beam-confirmation'}
      actions={[
        {
          label: t('Cancel'),
          variant: 'secondary',
          disabled: isQueryCalled,
          onClick: handleModalClose,
        },
        { label: t('Remove'), variant: 'primary', disabled: isQueryCalled, onClick: handleRemove },
      ]}
      // optionally show title only when query is not yet called
      {...(!isQueryCalled && {
        title: {
          label: t('Are you sure you want to remove this beam?'),
          variant: 'h6',
        },
      })}
      customStyle="py-4 px-6 md:px-24"
      onClose={handleModalClose}
    >
      {updateBeamQuery.error && <Text variant="body2">{updateBeamQuery.error.message}</Text>}
      {isQueryCalled && <Text variant="body2">{t('Removing beam. Please wait')}</Text>}
      {!updateBeamQuery.error &&
        updateBeamQuery.called &&
        !updateBeamQuery.loading &&
        !updateBeamQuery.data?.updateAkashaBeam && <Text>{t('Beam successfully removed.')}</Text>}
    </Modal>
  );
};

const RemoveBeamModal = (props: IRootExtensionProps) => {
  const { getTranslationPlugin } = useRootComponentProps();
  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <Component {...props} />
    </I18nextProvider>
  );
};

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: withProviders(RemoveBeamModal),
  errorBoundary: (err, errorInfo, props: IRootExtensionProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(errorInfo)}, ${errorInfo}`);
    }

    return <ErrorLoader type="script-error" title="Error in editor" details={err.message} />;
  },
});
