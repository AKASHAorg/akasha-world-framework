import React from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import routes, { DEVELOPER_MODE, EXTENSIONS } from '../../routes';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { Explore } from '../explore';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';

export const ExplorePage: React.FC<unknown> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');
  const { getCorePlugins, encodeAppName } = useRootComponentProps();
  const navigateTo = getCorePlugins().routing.navigateTo;

  const isInstalled = false;

  const handleButtonClick = (appId: string) => {
    if (!isInstalled) {
      navigate({
        to: '/info/$appId',
        params: {
          appId: encodeAppName(appId),
        },
      });
    } else {
      navigateTo({
        appName: '@akashaorg/app-vibes-console',
      });
    }
  };

  const handleViewAllLatestExtensions = () => {
    navigate({
      to: routes[EXTENSIONS],
    });
  };

  const handleCTAClick = () => {
    navigate({
      to: routes[DEVELOPER_MODE],
    });
  };

  const popularExtensions = [
    {
      id: '',
      coverImageSrc: null,
      displayName: t('Vibes Console'),
      description: `${t("Dive into AKASHA WORLD's Vibes Console!")} 💫 ${t("Your spot to become a moderator, explore applicants, and curate content. Together, let's shape our vibrant community!")} 🌟🔍✨`,
      applicationType: AkashaAppApplicationType.App,
    },
  ];

  return (
    <Explore
      titleLabel={t("What's new!")}
      cta={{
        title: t('Want to create your own extension?'),
        description: t(
          'Create awesome extensions, spark your imagination, and be part of an enthusiastic developer community!',
        ),
        action: (
          <Button
            size="md"
            variant="text"
            iconDirection="right"
            icon={<ArrowLongRightIcon />}
            label={t('Start your journey')}
            customStyle="w-fit self-end"
            onClick={handleCTAClick}
          />
        ),
      }}
      popularExtensionsLabel={t('Popular Extensions')}
      popularExtensions={popularExtensions.map(ext => ({
        ...ext,
        action: (
          <Button
            variant={isInstalled ? 'secondary' : 'primary'}
            label={isInstalled ? t('Installed') : t('Open')}
            onClick={() => handleButtonClick('@akashaorg/app-vibes-console')}
            customStyle="w-fit self-end"
          />
        ),
      }))}
      viewAllLabel={t('View All')}
      onViewAllClick={handleViewAllLatestExtensions}
    />
  );
};
