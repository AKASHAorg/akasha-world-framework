import React, { useCallback, useEffect, useState } from 'react';
import getSDK from '@akashaorg/core-sdk';
import Modal, { ModalProps } from '@akashaorg/design-system-core/lib/components/Modal';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import { useTranslation } from 'react-i18next';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';

enum UninstallModalStates {
  CONFIRMATION = 'confirmation',
  LOADING = 'loading',
  ERROR = 'error',
  RELOAD_PAGE = 'reload-page',
}

type UninstallModalProps = {
  appName: string;
  appDisplayName: string;
  show: boolean;
  onModalClose: () => void;
};

export const UninstallModal: React.FC<UninstallModalProps> = props => {
  const { t } = useTranslation('app-extensions');
  const { logger } = useRootComponentProps();
  const { appName, appDisplayName, show, onModalClose } = props;
  const [modalState, setModalState] = useState<UninstallModalStates>(
    UninstallModalStates.CONFIRMATION,
  );

  const onUninstall = useCallback(async () => {
    const sdk = getSDK();
    try {
      setModalState(UninstallModalStates.LOADING);
      await sdk.services.appSettings.uninstall(appName);
      //uninstall executes instantly and the timeout is to allow smooth transition from confirmation to loading state
      setTimeout(() => {
        setModalState(UninstallModalStates.RELOAD_PAGE);
      }, 500);
      //allow some time to read the reload page info text
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      //uninstall executes instantly and the timeout is to allow smooth transition from confirmation to error state
      setTimeout(() => {
        setModalState(UninstallModalStates.ERROR);
      }, 500);
      logger.error(`uninstall failed: ${JSON.stringify(err)}`);
    }
  }, [appName, logger]);

  const modalProps: Pick<ModalProps, 'title' | 'actions'> = React.useMemo(() => {
    switch (modalState) {
      case UninstallModalStates.CONFIRMATION:
        return {
          title: { label: t('Uninstall extension'), variant: 'h5' },
          actions: [
            {
              variant: 'secondary',
              label: t('Cancel'),
              onClick: onModalClose,
            },
            {
              variant: 'primary',
              label: t('Uninstall'),
              onClick: onUninstall,
            },
          ],
        };
      case UninstallModalStates.ERROR:
        return {
          title: { label: t('Uninstall failed'), variant: 'h5' },
          actions: [
            {
              variant: 'secondary',
              label: t('OK'),
              onClick: onModalClose,
            },
          ],
        };
      case UninstallModalStates.RELOAD_PAGE:
        return {
          title: { label: t('Page reload'), variant: 'h5' },
        };
      case UninstallModalStates.LOADING:
      default:
        return {};
    }
  }, [onModalClose, onUninstall, t, modalState]);

  useEffect(() => {
    //ensure every time a modal is shown it starts from confirmation state
    if (show) {
      setModalState(UninstallModalStates.CONFIRMATION);
    }
  }, [show]);

  return (
    <Modal
      {...modalProps}
      onClose={() => {
        if (modalState !== UninstallModalStates.LOADING) {
          onModalClose();
        }
      }}
      show={show}
      customStyle="w-80 md:w-[38rem] md:px-6"
    >
      {modalState === UninstallModalStates.CONFIRMATION && (
        <Text variant="body1" align="center">
          {t(
            'Are you sure you want to uninstall {{appDisplayName}}? This action might affect the appearance of functionality of other apps',
            { appDisplayName },
          )}
        </Text>
      )}
      {
        //@TODO replace with Loader component once its created
      }
      {modalState === UninstallModalStates.LOADING && (
        <Stack spacing="gap-y-5" align="center">
          <Spinner />
          <Text variant="button-md">{t('Uninstalling extension...')}</Text>
        </Stack>
      )}
      {modalState === UninstallModalStates.RELOAD_PAGE && (
        <Text variant="body1" align="center">
          {t('The page will now reload to prevent possible technical issues. ')}
        </Text>
      )}
      {modalState === UninstallModalStates.ERROR && (
        <Text variant="body1" align="center">
          {t(
            'An error occurred while trying to uninstall the extension. Please check your network connection and try again.',
          )}
        </Text>
      )}
    </Modal>
  );
};
