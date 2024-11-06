import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRootComponentProps, useSaveSettings, useAkashaStore } from '@akashaorg/ui-awf-hooks';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Image from '@akashaorg/design-system-core/lib/components/Image';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import routes, { CUSTOMISE_NOTIFICATION_OPTIONS_PAGE, SHOW_NOTIFICATIONS_PAGE } from '../../routes';

import { useNavigate } from '@tanstack/react-router';

export type WelcomePageProps = {
  finalStep?: boolean;
};

const WelcomePage: React.FC<WelcomePageProps> = props => {
  const { finalStep = false } = props;

  const navigate = useNavigate();
  const { baseRouteName, name: appName, uiEvents, getCorePlugins } = useRootComponentProps();
  const {
    data: { authenticatedProfile },
  } = useAkashaStore();
  const _uiEvents = useRef(uiEvents);
  const { t } = useTranslation('app-notifications');
  const navigateTo = getCorePlugins().routing.navigateTo;

  const { saveNotificationSettings } = useSaveSettings();

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}`,
        }).toString()}`;
      },
    });
  };

  const confirmCustomization = () => {
    if (finalStep) {
      _uiEvents.current.next({
        event: NotificationEvents.ShowNotification,
        data: {
          type: NotificationTypes.Success,
          title: t('Notification settings updated successfully'),
        },
      });

      navigate({ to: routes[SHOW_NOTIFICATIONS_PAGE] });
    } else {
      // navigate to next step
      navigate({ to: routes[CUSTOMISE_NOTIFICATION_OPTIONS_PAGE] });
    }
  };

  const skipCustomization = () => {
    saveNotificationSettings(
      { app: appName, options: { default: true } },
      { onComplete: () => navigate({ to: routes[SHOW_NOTIFICATIONS_PAGE] }) },
    );
  };

  const header = finalStep ? t('All Done') : t('Welcome to the Notifications App');
  const description = finalStep
    ? t(
        'You will receive notifications based on your choices now! You can always change that or even pause it from the notifications settings!',
      )
    : t(
        `Get the latest updates about what's going on with your world. You can personalize your notifications and get only what you want to see!`,
      );

  const rightButtonLabel = finalStep
    ? t('Go to my notifications')
    : t('Customize my notifications');

  if (!authenticatedProfile?.did.id)
    return (
      <ErrorLoader
        type="not-authenticated"
        title={`${t('Uh-oh')}! ${t('You are not connected')}!`}
        details={`${t('To check your notifications you must be connected')} ⚡️`}
        dataTestId="notifications"
      >
        <Button
          variant="primary"
          label={t('Connect')}
          size="md"
          onClick={handleConnectButtonClick}
        />
      </ErrorLoader>
    );

  return (
    <Card radius={16} padding={'p-2'} dataTestId="notifications">
      <Stack justify="center" align="center" customStyle="mb-32">
        <Image
          src={`/images/${finalStep ? 'notificationapp-success-min' : 'not-authenticated'}.webp`}
          customStyle="w-[180px] h-[180px] m-auto my-4"
        />

        <Text variant={finalStep ? 'h5' : 'h6'} align="center">
          {header}
        </Text>
        <Text variant="footnotes2" align="center" color={{ light: 'black', dark: 'grey6' }}>
          {description}
        </Text>
      </Stack>
      <Stack direction="row" fullWidth justify="end" spacing="gap-x-4" customStyle="pr-2 pb-2">
        {!finalStep && (
          <Button
            variant="text"
            label={t('Skip this step')}
            color="secondaryLight dark:secondaryDark"
            onClick={skipCustomization}
          />
        )}
        <Button variant="primary" label={rightButtonLabel} onClick={confirmCustomization} />
      </Stack>
    </Card>
  );
};
export default WelcomePage;
