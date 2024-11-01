import singleSpaReact from 'single-spa-react';
import ReactDOMClient from 'react-dom/client';
import React from 'react';
import {
  useRootComponentProps,
  withProviders,
  useModalData,
  useAkashaStore,
} from '@akashaorg/ui-awf-hooks';
import { Extension, IRootExtensionProps } from '@akashaorg/typings/lib/ui';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Modal from '@akashaorg/design-system-core/lib/components/Modal';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { useUpdateAppMutation } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import getSDK from '@akashaorg/core-sdk';
import { DRAFT_EXTENSIONS, DRAFT_RELEASES } from '../../constants';

const Component: React.FC<IRootExtensionProps> = () => {
  const sdk = getSDK();
  const { t } = useTranslation();
  const { modalData } = useModalData();
  const [updateApp, updateAppQuery] = useUpdateAppMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
  });

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const handleModalClose = React.useCallback(() => {
    window.history.replaceState(null, null, location.pathname);
  }, []);

  const getDraftExtensions = (): Extension[] => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`)) || [];
    } catch (error) {
      // @TODO: err handling
      console.error(error);
      return [];
    }
  };

  const getDraftReleases = () => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_RELEASES}-${authenticatedDID}`)) || [];
    } catch (error) {
      // @TODO: err handling
      console.error(error);
      return [];
    }
  };

  const clearExtensionLocalRelease = () => {
    const newLocalDraftReleases = getDraftReleases().filter(
      draftRelease => draftRelease.applicationID !== modalData['extensionId'],
    );
    localStorage.setItem(
      `${DRAFT_RELEASES}-${authenticatedDID}`,
      JSON.stringify(newLocalDraftReleases),
    );
  };

  const handleRemoveDraft = () => {
    const newDraftExtensions = getDraftExtensions().filter(
      draftExt => draftExt.id !== modalData['extensionId'],
    );
    localStorage.setItem(
      `${DRAFT_EXTENSIONS}-${authenticatedDID}`,
      JSON.stringify(newDraftExtensions),
    );
    clearExtensionLocalRelease();
    handleModalClose();
  };
  const handleRemove = () => {
    if (getDraftExtensions().some(ext => ext.id === modalData['extensionId'])) {
      handleRemoveDraft();
    } else {
      updateApp({
        variables: {
          i: {
            content: {},
            id: modalData['extensionId'],
            options: {
              shouldIndex: false,
            },
          },
        },
      })
        .then(() => {
          clearExtensionLocalRelease();
          handleModalClose();
        })
        // @TODO: err handling
        .catch(err => console.error(err));
    }
  };

  const isQueryCalled = updateAppQuery.called && updateAppQuery.loading;

  return (
    <Modal
      show={modalData?.name === 'remove-extension-confirmation'}
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
          label: t('Are you sure you want to remove this extension?'),
          variant: 'h6',
        },
      })}
      customStyle="py-4 px-6 md:px-24"
      onClose={handleModalClose}
    >
      {updateAppQuery.error && <Text variant="body2">{updateAppQuery.error.message}</Text>}
      {isQueryCalled && <Text variant="body2">{t('Removing Extension. Please wait')}</Text>}
      {!updateAppQuery.error &&
        updateAppQuery.called &&
        !updateAppQuery.loading &&
        !updateAppQuery.data?.updateAkashaApp && (
          <Text>{t('Extension successfully removed.')}</Text>
        )}
    </Modal>
  );
};

const RemoveAppModal = (props: IRootExtensionProps) => {
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
  rootComponent: withProviders(RemoveAppModal),
  errorBoundary: (err, errorInfo, props: IRootExtensionProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(errorInfo)}, ${errorInfo}`);
    }

    return (
      <ErrorLoader
        type="script-error"
        title="Error in remove extension modal"
        details={err.message}
      />
    );
  },
});
