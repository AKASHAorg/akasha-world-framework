import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { CREATE_EXTENSION } from '../../../routes';
import { useRootComponentProps, useAkashaStore } from '@akashaorg/ui-core-hooks';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import DidField from '@akashaorg/design-system-core/lib/components/DidField';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { DRAFT_EXTENSIONS } from '../../../constants';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import AppAvatar from '@akashaorg/design-system-core/lib/components/AppAvatar';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const PostExtensionCreationPage: React.FC<{ extensionId: string }> = ({ extensionId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');

  const { baseRouteName, getCorePlugins } = useRootComponentProps();

  const navigateTo = getCorePlugins().routing.navigateTo;

  const {
    data: { authenticatedDID, authenticatedProfile },
  } = useAkashaStore();

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${routes[CREATE_EXTENSION]}/${extensionId}`,
        }).toString()}`;
      },
    });
  };

  const handleNavigateToEdit = () => {
    navigate({ to: '/edit-extension/$extensionId/step1', params: { extensionId } });
  };

  const handleNavigateToReleaseManager = () => {
    navigate({ to: '/release-manager/$extensionId', params: { extensionId } });
  };

  const existingDraftExtensions =
    JSON.parse(localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`)) || [];
  const extensionData = existingDraftExtensions.find(ext => ext.id === extensionId);

  if (!authenticatedDID) {
    return (
      <ErrorLoader
        type="not-authenticated"
        title={`${t('Uh-oh')}! ${t('You are not connected')}!`}
        details={`${t('To view this page you must be connected')} ⚡️`}
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
    <Card padding="py-6 px-4">
      <Stack spacing="gap-y-8" align="center">
        <Text variant="h5" weight="semibold" align="center">
          {t('Your extension has been created locally')}
        </Text>

        <Stack
          background={{ light: 'grey9', dark: 'grey3' }}
          customStyle="rounded-[10px]"
          direction="row"
          align="center"
          spacing="gap-2"
          padding={8}
        >
          <AppAvatar avatar={extensionData.avatar} appType={extensionData.applicationType} />
          <Stack direction="column" justify="between">
            <Text variant="h6" truncate>
              {extensionData.displayName || extensionData.name}
            </Text>
            <Stack direction="column">
              <Text variant="footnotes1">{authenticatedProfile.name}</Text>
              <DidField did={authenticatedDID} />
            </Stack>
          </Stack>
        </Stack>

        <Text variant="subtitle2" align="center">
          {t(
            `You're almost there!
You can add more details to your extension, such as a description, gallery & more! You can also manage releases to set it up locally or submit a release when you're ready.`,
          )}
        </Text>

        <Stack direction="row" spacing="gap-4">
          <Button
            variant="secondary"
            size="md"
            label={t('Add Details')}
            onClick={handleNavigateToEdit}
          />
          <Button
            variant="primary"
            size="md"
            label={t('Manage Releases')}
            onClick={handleNavigateToReleaseManager}
          />
        </Stack>
        <Card background={{ light: 'grey9', dark: 'grey3' }}>
          <Stack direction="column" spacing="gap-2">
            <Stack direction="row" spacing="gap-1" align="center" justify="center">
              <Icon
                icon={<ExclamationTriangleIcon />}
                size="sm"
                color={{ light: 'warningLight', dark: 'warningDark' }}
              />
              <Text variant="subtitle2">{t('Important Note: ')}</Text>
            </Stack>
            <Text variant="subtitle2" align="center">
              {t(
                'Extensions that are saved locally will be lost if cache is cleared or if accessed from a different device.',
              )}
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
};
