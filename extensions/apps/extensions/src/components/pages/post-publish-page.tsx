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

type PostPublishPageProps = {
  type: 'extension' | 'release';
  extensionId: string;
};

export const PostPublishPage: React.FC<PostPublishPageProps> = ({ type, extensionId }) => {
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
    if (type === 'extension') {
      navigate({ to: '/my-extensions' });
    } else if (type === 'release') {
      navigate({ to: '/release-manager/$extensionId', params: { extensionId } });
    }
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
          {type === 'extension' && t('Extension Published')}
          {type === 'release' && t('Release Published')}
        </Text>
        <InfoCard
          bodyLabel={
            <>
              {type === 'extension' &&
                t(
                  'Your submission is under review, this process might take sometime to ensure that your extension doesn’t violate our Code of Conduct.',
                )}
              {type === 'release' &&
                t('Your extension has been successfully updated with the latest release!')}
            </>
          }
          bodyVariant="body1"
          assetName="under-review"
        />
        <Button
          variant="text"
          onClick={handleNavigate}
          label={type === 'extension' ? t('Go to My Extensions') : t('Go to Release Manager')}
        />
      </Stack>
    </Card>
  );
};
