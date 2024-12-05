import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import ExtensionReleasePublishForm from '@akashaorg/design-system-components/lib/components/ExtensionReleasePublishForm';
import { DRAFT_EXTENSIONS, DRAFT_RELEASES } from '../../../constants';
import { useGetAppsByIdQuery } from '@akashaorg/ui-awf-hooks/lib/generated';
import { NetworkStatus } from '@apollo/client';
import {
  selectAppId,
  selectApplicationType,
  selectAppName,
} from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-by-id-query';
import Modal from '@akashaorg/design-system-core/lib/components/Modal';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';

type EditTestReleasePageProps = {
  extensionId: string;
};

const getDraftExtension = (extensionId: string, authenticatedDID: string) => {
  try {
    const draftExtensions = JSON.parse(
      localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`),
    );
    if (!draftExtensions) {
      return null;
    }
    return draftExtensions.find(ext => ext.id === extensionId);
  } catch (error) {
    return error;
  }
};

export const EditTestReleasePage: React.FC<EditTestReleasePageProps> = ({ extensionId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');

  const { uiEvents, baseRouteName, getCorePlugins } = useRootComponentProps();
  const navigateTo = getCorePlugins().routing.navigateTo;
  const uiEventsRef = React.useRef(uiEvents);
  const [isLoadingTestMode, setIsLoadingTestMode] = useState(false);

  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();

  const showErrorNotification = React.useCallback((title: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
      },
    });
  }, []);

  const draftReleases = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_RELEASES}-${authenticatedDID}`)) || [];
    } catch (error) {
      showErrorNotification(error);
    }
  }, [authenticatedDID, showErrorNotification]);

  const localRelease = draftReleases.find(release => release.applicationID === extensionId);

  const draftExtension = getDraftExtension(extensionId, authenticatedDID);
  const draftExtensionError = draftExtension instanceof Error || false;

  const extensionDataReq = useGetAppsByIdQuery({
    variables: {
      id: extensionId,
    },
    fetchPolicy: 'cache-first',
    skip: !authenticatedDID && isAuthenticating,
  });

  const baseAppInfo = useMemo(() => {
    if (draftExtension) {
      return {
        id: draftExtension.id,
        name: draftExtension.name,
        applicationType: draftExtension.applicationType,
      };
    }

    if (extensionDataReq.networkStatus === NetworkStatus.ready && extensionDataReq.data) {
      // select app data
      return {
        id: selectAppId(extensionDataReq.data),
        name: selectAppName(extensionDataReq.data),
        applicationType: selectApplicationType(extensionDataReq.data),
      };
    }
  }, [draftExtension, extensionDataReq.data, extensionDataReq.networkStatus]);

  useEffect(() => {
    if (draftExtensionError) {
      showErrorNotification(draftExtension);
    }
  }, [draftExtension, draftExtensionError, showErrorNotification]);

  useEffect(() => {
    const testModeLoader = getCorePlugins().testModeLoader;
    let unsubscribe;
    let timeout;
    if (testModeLoader) {
      unsubscribe = testModeLoader.subscribe(({ currentStatus }) => {
        if (
          currentStatus &&
          currentStatus ===
            getCorePlugins().testModeLoader.getStaticStatusCodes().status
              .EXTENSION_TEST_LOAD_SUCCESS
        ) {
          timeout = setTimeout(() => {
            navigateTo({
              appName: baseAppInfo.name,
            });
          }, 3000);
        }
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [baseAppInfo.name, getCorePlugins, navigateTo]);

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/release-manager/${extensionId}/edit-test-release`,
        }).toString()}`;
      },
    });
  };

  const handleClickSubmit = appReleaseFormData => {
    // remove the old local test release so we can update it
    const newLocalDraftReleases = draftReleases.filter(
      draftRelease => draftRelease.applicationID !== extensionId,
    );
    // update the local draft release to reflect the form data
    const newLocalRelease = {
      ...localRelease,
      version: appReleaseFormData?.versionNumber,
      source: appReleaseFormData?.sourceURL,
      description: appReleaseFormData?.description,
    };
    // save the new list of local draft releases in local storage
    localStorage.setItem(
      `${DRAFT_RELEASES}-${authenticatedDID}`,
      JSON.stringify([...newLocalDraftReleases, newLocalRelease]),
    );
    const testModeLoader = getCorePlugins().testModeLoader;

    if (!baseAppInfo) {
      return showErrorNotification(`This release does not belong to an extension.`);
    }

    testModeLoader.load({
      appId: localRelease.appId,
      source: appReleaseFormData.sourceURL,
      appName: baseAppInfo.name,
      applicationType: baseAppInfo.applicationType,
    });
    setIsLoadingTestMode(true);
  };

  const handleClickCancel = () => {
    navigate({
      to: '/release-manager/$extensionId',
      params: { extensionId },
    });
  };

  if (!authenticatedDID) {
    return (
      <ErrorLoader
        type="not-authenticated"
        title={`${t('Uh-oh')}! ${t('You are not connected')}!`}
        details={`${t('To check your extensions you must be connected')} ⚡️`}
      >
        <Button
          variant="primary"
          size="md"
          label={t('Connect')}
          onClick={handleConnectButtonClick}
        />
      </ErrorLoader>
    );
  }

  return (
    <>
      <Modal show={isLoadingTestMode}>
        <Spinner />
        <Text variant="body2" customStyle="px-4 py-2">
          {t('Loading test mode')}
        </Text>
      </Modal>
      <Card padding={0}>
        <Stack spacing="gap-y-2">
          <Stack padding={16}>
            <Text variant="h5" weight="semibold" align="center">
              {t('Release Notes')}
            </Text>
            <ExtensionReleasePublishForm
              defaultValues={{
                versionNumber: '',
                sourceURL: '',
                description: '',
              }}
              versionNumberLabel={t('Version Number')}
              descriptionFieldLabel={t('Description')}
              descriptionPlaceholderLabel={t('A brief description about this release')}
              sourceURLFieldLabel={t('Source URL')}
              sourceURLPlaceholderLabel={t('Webpack dev server / ipfs')}
              cancelButton={{
                label: t('Cancel'),
                handleClick: handleClickCancel,
              }}
              nextButton={{
                label: t('Test Release'),
                handleClick: handleClickSubmit,
              }}
            />
          </Stack>
        </Stack>
      </Card>
    </>
  );
};
