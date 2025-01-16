import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Link from '@akashaorg/design-system-core/lib/components/Link';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Toggle from '@akashaorg/design-system-core/lib/components/Toggle';
import { DeveloperMode } from '../developer-mode';
import { DEV_MODE_KEY } from '../../constants';
import appRoutes, { DEVELOPER_MODE, MY_EXTENSIONS } from '../../routes';

export enum DevMode {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export const DeveloperModePage: React.FC<unknown> = () => {
  const navigate = useNavigate();
  const { baseRouteName, uiEvents, getCorePlugins } = useRootComponentProps();
  const { t } = useTranslation('app-extensions');
  const {
    data: { authenticatedProfile },
  } = useAkashaStore();
  const navigateTo = getCorePlugins().routing.navigateTo;
  // get the dev mode preference, if any, from local storage
  const localValue = window.localStorage.getItem(DEV_MODE_KEY);

  const [devMode, setDevMode] = useState<string>(localValue);

  const handleToggleDevMode = () => {
    const value = devMode === DevMode.ENABLED ? DevMode.DISABLED : DevMode.ENABLED;
    setDevMode(value);
    window.localStorage.setItem(DEV_MODE_KEY, value);
    // show snackbar
    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Info,
        title:
          devMode !== DevMode.ENABLED
            ? t('Developer Mode is active. The page will reload now')
            : t('Developer Mode deactivated. The page will reload now'),
        dismissable: false,
      },
    });

    // allow one sec delay, then reload the page
    setTimeout(() => {
      window.location.reload();
    }, 2500);
  };

  const handleCTAClick = () => {
    navigate({
      to: appRoutes[MY_EXTENSIONS],
    });
  };

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${appRoutes[DEVELOPER_MODE]}`,
        }).toString()}`;
      },
    });
  };

  if (!authenticatedProfile?.did.id) {
    return (
      <ErrorLoader
        type="not-authenticated"
        title={`${t('Uh-oh')}! ${t('You are not connected')}!`}
        details={`${t('To toggle developer mode you must be connected')} ⚡️`}
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
    <DeveloperMode
      titleLabel={t('Developer Mode')}
      sections={[
        {
          title: t('Extensions Developer Mode'),
          toggleButtonNode: (
            <Toggle checked={devMode === DevMode.ENABLED} onChange={handleToggleDevMode} />
          ),
          descriptionNode: (
            <Text as="span" color={{ light: 'grey4', dark: 'grey6' }}>
              {`🌟 ${t("When you enable Dev Mode, you'll unlock the ability to create awesome extensions in the Extensions app! 🚀 Once enabled, a new sub menu item called")} `}
              <Text as="span" weight="bold">
                {`"${t('My Extensions')}"`}
              </Text>
              {` ${t('will appear on the sidebar')}. 💻✨`}
            </Text>
          ),
          ...(devMode === DevMode.ENABLED && {
            ctaNode: (
              <Button
                size="md"
                variant="text"
                label={t('Go to My Extensions')}
                customStyle="w-fit self-end"
                onClick={handleCTAClick}
              />
            ),
          }),
        },
        {
          title: t('AKASHA World Developer Guide'),
          descriptionNode: (
            <Text color={{ light: 'grey4', dark: 'grey6' }}>
              {`🌐 ${t('Become a developer in AKASHA World, create your first extension, and join our vibrant developer community! ')}🌐`}
            </Text>
          ),
          ctaNode: (
            <Link target="_blank" to="https://docs.akasha.world" customStyle="w-fit self-end">
              <Button size="md" variant="text" label={t('Read AW Developer Guide ')} />
            </Link>
          ),
        },
      ]}
    />
  );
};
