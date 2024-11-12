import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import appRoutes, { SUBMIT_EXTENSION } from '../../routes';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import ExtensionReviewAndPublish from '@akashaorg/design-system-components/lib/components/ExtensionReviewAndPublish';
import { transformSource, useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { Extension, NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { DRAFT_EXTENSIONS, DRAFT_RELEASES } from '../../constants';
import getSDK from '@akashaorg/core-sdk';
import {
  useCreateAppMutation,
  useGetAppsByPublisherDidQuery,
} from '@akashaorg/ui-awf-hooks/lib/generated';
import { SubmitType } from '../app-routes';
import { selectAkashaApp } from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-by-publisher-did-query';

type ExtensionPublishPageProps = {
  extensionId: string;
};

export const ExtensionPublishPage: React.FC<ExtensionPublishPageProps> = ({ extensionId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');

  const { uiEvents, baseRouteName, getCorePlugins } = useRootComponentProps();
  const uiEventsRef = React.useRef(uiEvents);

  const navigateTo = getCorePlugins().routing.navigateTo;
  const sdk = useRef(getSDK());

  const showErrorNotification = React.useCallback((title: string, description?: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
        description,
      },
    });
  }, []);

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  // fetch the draft extensions that are saved only on local storage
  const draftExtensions: Extension[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`)) || [];
    } catch (error) {
      showErrorNotification(error);
    }
  }, [authenticatedDID, showErrorNotification]);

  const extensionData = draftExtensions?.find(draftExtension => draftExtension.id === extensionId);

  const draftReleases = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_RELEASES}-${authenticatedDID}`)) || [];
    } catch (error) {
      showErrorNotification(error);
    }
  }, [authenticatedDID, showErrorNotification]);

  const localRelease = draftReleases?.find(
    draftRelease => draftRelease.applicationID === extensionId,
  );

  const [createAppMutation, { loading: loadingAppMutation }] = useCreateAppMutation({
    context: { source: sdk.current.services.gql.contextSources.composeDB },
    onCompleted: data => {
      // after the extension has been published to the ceramic model
      // search for it in the list of local draft extensions and
      // remove the published extension from list of local extensions
      const newLocalDraftExtensions = draftExtensions.filter(
        draftExtension => draftExtension.id !== extensionId,
      );
      // save the new list of local draft extensions in local storage
      localStorage.setItem(
        `${DRAFT_EXTENSIONS}-${authenticatedDID}`,
        JSON.stringify(newLocalDraftExtensions),
      );
      // remove the local release tied to the draft extension
      const newLocalDraftReleases = draftReleases.filter(
        draftRelease => draftRelease.applicationID !== extensionId,
      );
      // update the local draft release to reflect the published app id
      const newLocalRelease = { ...localRelease, applicationID: data?.setAkashaApp?.document?.id };
      // save the new list of local draft releases in local storage
      localStorage.setItem(
        `${DRAFT_RELEASES}-${authenticatedDID}`,
        JSON.stringify([...newLocalDraftReleases, newLocalRelease]),
      );
      navigate({
        to: '/post-publish/$extensionId',
        search: { type: SubmitType.EXTENSION },
        params: { extensionId },
      });
    },
    onError: error => {
      showErrorNotification(
        `${t(`Something went wrong when publishing the extension`)}.`,
        error.message,
      );
    },
  });

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${appRoutes[SUBMIT_EXTENSION]}/${extensionId}`,
        }).toString()}`;
      },
    });
  };

  const {
    data: appInfoName,
    loading: loadingAppInfoName,
    error: appInfoQueryErrorName,
    called: calledAppInfoName,
  } = useGetAppsByPublisherDidQuery({
    variables: {
      id: authenticatedDID,
      first: 1,
      filters: { where: { name: { equalTo: extensionData?.name } } },
    },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    skip: !extensionData?.name || !authenticatedDID,
  });

  const isDuplicatePublishedExtName = useMemo(() => !!selectAkashaApp(appInfoName), [appInfoName]);

  useEffect(() => {
    if (appInfoQueryErrorName) {
      showErrorNotification(appInfoQueryErrorName.message);
    }
  }, [appInfoQueryErrorName, showErrorNotification]);

  const handleClickPublish = () => {
    if (calledAppInfoName && !loadingAppInfoName && !isDuplicatePublishedExtName) {
      const extData = {
        applicationType: extensionData?.applicationType,
        contributors: extensionData?.contributors,
        coverImage: extensionData?.coverImage,
        createdAt: new Date().toISOString(),
        description: extensionData?.description,
        displayName: extensionData?.displayName,
        gallery: extensionData?.gallery,
        keywords: extensionData?.keywords,
        license: extensionData?.license,
        links: extensionData?.links,
        logoImage: extensionData?.logoImage,
        name: extensionData?.name,
        nsfw: extensionData?.nsfw,
      };
      createAppMutation({
        variables: {
          i: {
            content: extData,
          },
        },
      });
    }
  };

  const handleClickCancel = () => {
    navigate({
      to: '/my-extensions',
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
    <Card padding={0}>
      <Stack spacing="gap-y-2">
        <Stack padding={16}>
          <Text variant="h5" weight="semibold" align="center">
            {t('Review and Publish Extension')}
          </Text>
        </Stack>
        <ExtensionReviewAndPublish
          extensionData={extensionData}
          title={t('Review Extension')}
          subtitle={{
            part1: 'Please note that fields marked with',
            part2: 'are required and cannot be edited once submitted.',
          }}
          extensionNameLabel={t('Extension ID')}
          extensionDisplayNameLabel={t('Extension Display Name')}
          nsfwLabel={t('Extension NSFW')}
          nsfwDescription={t('You marked it as{{nsfw}} Safe For Work', {
            nsfw: extensionData?.nsfw ? ' Not' : '',
          })}
          descriptionLabel={t('Description')}
          galleryLabel={t('Gallery')}
          imageUploadedLabel={t('images uploaded')}
          viewAllLabel={t('View All')}
          usefulLinksLabel={t('Useful Links')}
          licenseLabel={t('License')}
          contributorsLabel={t('Contributors')}
          tagsLabel={t('Tags')}
          backButtonLabel={t('Cancel')}
          publishButtonLabel={t('Publish')}
          duplicateExtNameErrLabel={t('An extension with this name has already been published')}
          loading={loadingAppMutation || loadingAppInfoName}
          isDuplicateExtName={isDuplicatePublishedExtName}
          transformSource={transformSource}
          onClickCancel={handleClickCancel}
          onClickSubmit={handleClickPublish}
        />
      </Stack>
    </Card>
  );
};
