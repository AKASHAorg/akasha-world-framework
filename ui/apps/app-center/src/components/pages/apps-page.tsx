import React from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { useTranslation } from 'react-i18next';
import { RootComponentProps } from '@akashaorg/typings/ui';
import { AppList } from '@akashaorg/design-system-components/lib/components/AppList';

const AppsPage: React.FC<RootComponentProps> = () => {
  const { t } = useTranslation('app-integration-center');

  /*@TODO: replace with the relevant hook once it's ready */
  const dummyNewestApps = [
    {
      name: 'Direct Messaging',
      description:
        'Send direct messages to your followers or people who have this application, you must be following each other to be able to send messages.',
      action: <Button label="Install" variant="primary" />,
    },
    {
      name: 'Emoji App',
      description:
        'Add some custom emojis to your posts, replies, Articles or even in your messages. Just so you know, for people to be able to see these ...',
      action: <Button label="Install" variant="primary" />,
    },
  ];
  return (
    <Stack direction="column" spacing="gap-y-4">
      <Text variant="h6">{t('Newest Apps')}</Text>
      <AppList apps={dummyNewestApps} />
    </Stack>
  );
};

export default AppsPage;
