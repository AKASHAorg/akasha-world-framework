import React, { useMemo } from 'react';
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
import { DRAFT_RELEASES } from '../../../constants';

type EditTestReleasePageProps = {
  extensionId: string;
};

export const EditTestReleasePage: React.FC<EditTestReleasePageProps> = ({ extensionId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');

  const { uiEvents, baseRouteName, getCorePlugins } = useRootComponentProps();
  const navigateTo = getCorePlugins().routing.navigateTo;
  const uiEventsRef = React.useRef(uiEvents);

  const {
    data: { authenticatedDID },
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

  const draftReleases = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_RELEASES}-${authenticatedDID}`)) || [];
    } catch (error) {
      showErrorNotification(error);
    }
  }, [authenticatedDID, showErrorNotification]);

  const localRelease = draftReleases.find(release => release.applicationID === extensionId);

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
    navigate({
      to: '/release-manager/$extensionId',
      params: { extensionId },
    });
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
    <Card padding={0}>
      <Stack spacing="gap-y-2">
        <Stack padding={16}>
          <Text variant="h5" weight="semibold" align="center">
            {t('Release Notes')}
          </Text>
          <ExtensionReleasePublishForm
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
  );
};
