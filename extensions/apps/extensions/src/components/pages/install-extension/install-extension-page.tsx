import React, { useCallback, useEffect, useMemo, useState } from 'react';
import InstallApp, {
  InstallAppProps,
} from '@akashaorg/design-system-components/lib/components/InstallApp';
import { useTranslation } from 'react-i18next';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { useGetAppsByPublisherDidQuery } from '@akashaorg/ui-core-hooks/lib/generated';
import {
  selectAppDisplayName,
  selectAppPublisher,
  selectAppLogoImage,
  selectAppType,
} from '@akashaorg/ui-core-hooks/lib/selectors/get-apps-by-publisher-did-query';
import getSDK from '@akashaorg/core-sdk';
import { AkashaAppApplicationType, SortOrder } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { getReportedError, getReportedProgress } from './utils';
import { AkashaProfile } from '@akashaorg/typings/lib/ui';
import { useNavigate } from '@tanstack/react-router';

export const InstallExtensionPage = ({ appId }: { appId: string }) => {
  const { t } = useTranslation('app-extensions');
  const { decodeAppName, getCorePlugins, plugins, logger } = useRootComponentProps();
  const decodeName = React.useRef(decodeAppName);
  const installer = getCorePlugins().extensionInstaller;
  const installerStatusCodes = React.useRef(installer.getStaticStatusCodes());
  const isInstalling = React.useRef(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [reportedStatus, setReportedStatus] = useState<symbol>();
  const [reportedError, setReportedError] = useState<{ code: symbol; retryable: boolean }>(null);
  const [shouldRegisterResources, setShouldRegisterResources] = useState<boolean>(false);
  const [authorProfileData, setAuthorProfileData] = React.useState<AkashaProfile>(null);
  const idxDid = getSDK().services.gql.indexingDID;
  const navigate = useNavigate();

  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();

  const { data, loading, called, error } = useGetAppsByPublisherDidQuery({
    variables: {
      id: idxDid,
      first: 1,
      filters: { where: { name: { equalTo: decodeName.current(appId) } } },
      sorting: { createdAt: SortOrder.Desc },
    },
  });

  const appAuthorId = useMemo(() => {
    if (data) {
      return selectAppPublisher(data).id;
    }
  }, [data]);

  useEffect(() => {
    const getAuthorProfile = async () => {
      if (appAuthorId && plugins['@akashaorg/app-profile']) {
        const resp = await plugins['@akashaorg/app-profile'].profile.getProfileInfo({
          profileDID: appAuthorId,
        });
        if (resp.data) {
          setAuthorProfileData(resp.data);
        }
      }
    };
    getAuthorProfile().catch(err => logger.warn(err));
  }, [appAuthorId, logger, plugins]);

  const retryableError: symbol[] = useMemo(
    () => [
      installerStatusCodes.current.error.EXTENSION_FETCH_ERROR,
      installerStatusCodes.current.error.EXTENSION_IMPORT_ERROR,
      installerStatusCodes.current.error.EXTENSION_INITIALIZATION_FAILED,
      installerStatusCodes.current.error.EXTENSION_REGISTER_RESOURCES_FAILED,
      installerStatusCodes.current.error.EXTENSION_INFO_SAVE_FAILED,
      installerStatusCodes.current.error.EXTENSION_FINALIZATION_FAILED,
    ],
    [],
  );

  const handleLoginClick = useCallback(() => {
    getCorePlugins().routing.navigateTo({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (appRoutes: Record<string, string>) => {
        return `${appRoutes.Connect}?${new URLSearchParams({
          redirectTo: location.pathname,
        })}`;
      },
    });
  }, [getCorePlugins]);

  const triggerResourceRegistration = useCallback(() => {
    // handle signature;
  }, []);

  useEffect(() => {
    if (shouldRegisterResources /* && signedSuccessfully */) {
      // then continue the installation process
      installer.postInstallExtension();
    }
  }, [installer, shouldRegisterResources]);

  useEffect(() => {
    let timeout;
    if (isInstalled) {
      // navigation using replace it's important here
      // because we also want to refresh the page
      timeout = setTimeout(() => {
        window.location.replace(`/${decodeName.current(appId)}`);
      }, 3000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [appId, isInstalled]);

  useEffect(() => {
    const startInstaller = async () => {
      const appName = decodeName.current(appId);
      const sdk = getSDK();
      if (!isInstalling.current) {
        const appLocalData = await sdk.services.db
          .getCollections()
          .installedExtensions.where({ appName })
          .first();
        if (!appLocalData) {
          navigate({
            to: '/install/$appId/terms',
            params: { appId },
            replace: true,
          }).catch(err => logger.error('Failed to navigate: %o', err));
          return;
        }
        if (appLocalData?.termsAccepted) {
          isInstalling.current = true;
          await installer.installExtension(appName);
        } else {
          navigate({
            to: '/install/$appId/terms',
            params: { appId },
            replace: true,
          }).catch(err => logger.error('Failed to navigate: %o', err));
        }
      }
    };
    if (authenticatedDID) {
      startInstaller().catch(err => logger.error(err));
    }
  }, [appId, authenticatedDID, installer, logger, navigate]);

  useEffect(() => {
    return installer.subscribe(
      ({ currentStatus, errorStatus }: { currentStatus: symbol; errorStatus: symbol }) => {
        // the following steps will continue automatically
        // if there are no errors and if there are no resources to register
        switch (errorStatus) {
          case installerStatusCodes.current.error.USER_NOT_CONNECTED:
          case installerStatusCodes.current.error.EXTENSION_NOT_FOUND:
          case installerStatusCodes.current.error.EXTENSION_FETCH_ERROR:
          case installerStatusCodes.current.error.EXTENSION_DATA_INVALID:
          case installerStatusCodes.current.error.EXTENSION_IMPORT_ERROR:
          case installerStatusCodes.current.error.EXTENSION_INITIALIZATION_FAILED:
          case installerStatusCodes.current.error.EXTENSION_REGISTER_RESOURCES_FAILED:
          case installerStatusCodes.current.error.EXTENSION_REGISTRATION_FAILED:
          case installerStatusCodes.current.error.EXTENSION_INFO_SAVE_FAILED:
          case installerStatusCodes.current.error.EXTENSION_FINALIZATION_FAILED:
            if (retryableError.some(err => err === errorStatus)) {
              setReportedError({
                code: errorStatus,
                retryable: true,
              });
              break;
            }
            setReportedError({
              code: errorStatus,
              retryable: false,
            });
            break;
        }
        switch (currentStatus) {
          case installerStatusCodes.current.status.FETCHING_EXTENSION_DATA:
          case installerStatusCodes.current.status.IMPORTING_MODULE:
          case installerStatusCodes.current.status.INITIALIZING_EXTENSION:
          case installerStatusCodes.current.status.REGISTERING_EXTENSION:
          case installerStatusCodes.current.status.SAVING_EXTENSION_INFO:
          case installerStatusCodes.current.status.FINALIZING_INSTALL:
            setReportedStatus(currentStatus);
            break;
          // break the switch if there are resources to register.
          // it is required to call `postInstallExtension` after signature
          case installerStatusCodes.current.status.REGISTERING_RESOURCES:
            setReportedStatus(currentStatus);
            setShouldRegisterResources(true);
            break;
          case installerStatusCodes.current.status.REGISTERING_RESOURCES_SUCCESS:
            setReportedStatus(currentStatus);
            triggerResourceRegistration();
            break;
          case installerStatusCodes.current.status.INSTALL_SUCCESS:
            setReportedStatus(currentStatus);
            setIsInstalled(true);
            break;
        }
      },
    );
  }, [installer, retryableError, triggerResourceRegistration]);

  const installStatus = useMemo((): InstallAppProps['status'] => {
    if (isInstalled) {
      return 'complete';
    }
    if (reportedError?.code) {
      return 'error';
    }
    if (shouldRegisterResources && 1 < 0 /* successfullySigned */) {
      return 'complete';
    }
    if (shouldRegisterResources) {
      return 'authorize-request';
    }
    return 'in-progress';
  }, [isInstalled, reportedError?.code, shouldRegisterResources]);

  const progressInfo = useMemo(() => {
    if (isInstalled) {
      return `${t(
        'Extension {{displayName}} has been installed. The page will refresh and load it.',
        {
          displayName: selectAppDisplayName(data),
        },
      )}`;
    }
    if (reportedError?.code) {
      return getReportedError(reportedError, installerStatusCodes.current.error, t);
    }
    return getReportedProgress(reportedStatus, installerStatusCodes.current.status, t);
  }, [data, isInstalled, reportedError, reportedStatus, t]);

  const successLabel = useMemo(() => {
    if (isInstalled) {
      return t('Finished');
    }
    if (shouldRegisterResources && 1 < 0 /*successfullySigned*/) {
      return t('Request authorised');
    }
  }, [isInstalled, shouldRegisterResources, t]);

  const actions = useMemo(() => {
    if (isInstalled) {
      return;
    }
    const actions = [];
    if (shouldRegisterResources) {
      actions.push({
        label: t('Authorise'),
        onClick: () => {
          logger.info('Authorise new resources');
        },
      });
    }
    if (reportedError?.code && reportedError?.retryable) {
      actions.push({
        label: t('Retry'),
        onClick: () => installer.retryFromError(reportedError.code),
      });
    }
    return actions.concat({
      label: t('Cancel installation'),
      onClick: () => installer.cancelInstallation(),
    });
  }, [installer, isInstalled, logger, reportedError, shouldRegisterResources, t]);

  if (error) {
    return (
      <ErrorLoader
        type="no-apps"
        title={t('Error loading app')}
        details={t('Looks like this app is not available to install.')}
      />
    );
  }

  return (
    <>
      {!authenticatedDID && !isAuthenticating && called && !loading && (
        <ErrorLoader
          type="not-authenticated"
          title={t('Login Required')}
          details={t('You must be logged in to install {{appDisplayName}}', {
            appDisplayName: selectAppDisplayName(data),
          })}
        >
          <Button label={t('Login')} onClick={handleLoginClick} />
        </ErrorLoader>
      )}
      {authenticatedDID && called && !loading && (
        <InstallApp
          title={isInstalled ? t('Installation complete') : t('Installation in progress')}
          appName={selectAppDisplayName(data)}
          appAvatar={selectAppLogoImage(data)}
          publisherName={authorProfileData?.name}
          publisherDID={appAuthorId}
          appType={selectAppType(data) ?? AkashaAppApplicationType.App}
          progressInfo={progressInfo}
          status={installStatus}
          actions={actions}
          successLabel={successLabel}
        />
      )}
    </>
  );
};
