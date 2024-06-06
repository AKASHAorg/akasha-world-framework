import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import {
  Akasha,
  Antenna,
  Vibes,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import { BellIcon, Cog8ToothIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { InstalledExtensions } from '../installed-extensions';
import routes, { EXTENSIONS } from '../../routes';

export const InstalledExtensionsPage: React.FC<unknown> = () => {
  const navigate = useNavigate();
  const { getRoutingPlugin } = useRootComponentProps();
  const { t } = useTranslation('app-extensions');

  const handleAppClick = (appName: string) => {
    getRoutingPlugin().navigateTo({
      appName,
    });
  };

  const handleClickDiscover = () => {
    navigate({
      to: routes[EXTENSIONS],
    });
  };

  const description = t(
    'Play with your friends in AKASHA World and enjoy a couple of puzzle games or drawing games or any kind of game!',
  );

  const installedExtensions = [];

  const defaultExtensions = [
    {
      id: '@akashaorg/app-antenna',
      name: t('Antenna'),
      description,
      icon: <Antenna />,
    },
    {
      id: '@akashaorg/app-vibes',
      name: t('Vibes'),
      description,
      icon: <Vibes />,
    },
    {
      id: '@akashaorg/app-extensions',
      name: t('Extensions'),
      description,
      icon: <Akasha />,
      isSolidIcon: true,
    },
    {
      id: '@akashaorg/app-search',
      name: t('Search'),
      description,
      icon: <MagnifyingGlassIcon />,
    },
    {
      id: '@akashaorg/app-notifications',
      name: t('Notifications'),
      description,
      icon: <BellIcon />,
    },
    {
      id: '@akashaorg/app-settings-ewa',
      name: t('Settings'),
      description,
      icon: <Cog8ToothIcon />,
    },
  ];

  const addAction = ext => ({
    ...ext,
    action: <Button variant="secondary" label={t('Open')} onClick={() => handleAppClick(ext.id)} />,
  });

  return (
    <InstalledExtensions
      titleLabel={t('Installed Extensions')}
      installedExtensions={installedExtensions.map(addAction)}
      defaultExtensions={defaultExtensions.map(addAction)}
      sections={[
        {
          assetName: 'longbeam-notfound',
          title: t('No extensions installed yet!'),
          discoverLabel: t('Discover'),
          description: t('cool extensions and install them'),
          description2: t('to customize your world'),
          onClickDiscover: handleClickDiscover,
        },
        {
          title: t('Default Extensions'),
          description: t(
            'The default extensions are the ones that come preinstalled with AKASHA World. You cannot uninstall them.',
          ),
        },
      ]}
      onAppClick={handleAppClick}
    />
  );
};