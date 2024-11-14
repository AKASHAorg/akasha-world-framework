import React from 'react';
import singleSpaReact from 'single-spa-react';
import ReactDOMClient from 'react-dom/client';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { IRootExtensionProps } from '@akashaorg/typings/lib/ui';
import { useRootComponentProps, withProviders, useModalData } from '@akashaorg/ui-awf-hooks';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import UnsavedChangesModal from '@akashaorg/design-system-components/lib/components/UnsavedChangesModal';

const Component: React.FC<IRootExtensionProps> = () => {
  const { t } = useTranslation();
  const { modalData } = useModalData();
  const { getCorePlugins } = useRootComponentProps();
  const navigateTo = getCorePlugins().routing.navigateTo;

  const handleLeavePage = () => {
    navigateTo({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: () => `/${modalData?.message}`,
    });
  };

  const handleModalClose = React.useCallback(() => {
    window.history.replaceState(null, null, location.pathname);
  }, []);

  return (
    <UnsavedChangesModal
      showModal={['unsaved-changes_edit-profile', 'unsaved-changes_edit-interests'].includes(
        modalData?.name,
      )}
      cancelButtonLabel={t('Cancel')}
      leavePageButtonLabel={t('Leave page')}
      title={t('Unsaved changes')}
      description={t(
        "Are you sure you want to leave this page? The changes you've made will not be saved.",
      )}
      handleModalClose={handleModalClose}
      handleLeavePage={handleLeavePage}
    />
  );
};

const UnsavedChangesModalComponent = (props: IRootExtensionProps) => {
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
  rootComponent: withProviders(UnsavedChangesModalComponent),
  errorBoundary: (err, errorInfo, props: IRootExtensionProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(errorInfo)}, ${errorInfo}`);
    }

    return (
      <ErrorLoader
        type="script-error"
        title="Error in unsaved profile changes modal"
        details={err.message}
      />
    );
  },
});
