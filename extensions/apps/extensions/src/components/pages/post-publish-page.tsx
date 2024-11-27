import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { CREATE_EXTENSION } from '../../routes';
import { useRootComponentProps, useAkashaStore } from '@akashaorg/ui-awf-hooks';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import InfoCard from '@akashaorg/design-system-core/lib/components/InfoCard';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';

export const PostPublishPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');

  const { baseRouteName, getCorePlugins } = useRootComponentProps();

  const navigateTo = getCorePlugins().routing.navigateTo;

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${routes[CREATE_EXTENSION]}`,
        }).toString()}`;
      },
    });
  };

  const handleNavigate = () => {
    navigate({ to: '/my-extensions' });
  };

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
          {t('Extension Published')}
        </Text>
        <InfoCard
          bodyLabel={
            <>
              {t(
                'Your submission is under review, this process might take sometime to ensure that your extension doesn’t violate our Code of Conduct.',
              )}
            </>
          }
          bodyVariant="body1"
          assetName="under-review"
        />
        <Button variant="text" onClick={handleNavigate} label={t('Go to My Extensions')} />
      </Stack>
    </Card>
  );
};
