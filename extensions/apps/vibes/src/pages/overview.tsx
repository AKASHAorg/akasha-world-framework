import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import VibesIntroCard from '@akashaorg/design-system-components/lib/components/VibesIntroCard';
import VibesValuesCard from '@akashaorg/design-system-components/lib/components/VibesValuesCard';
import BecomeModeratorCard from '../components/overview/become-moderator-card';
import { values } from '../services/values';
import { externalLinks } from '../utils';

export type BasePageProps = {
  user?: string | null;
};

export type OverviewPageProps = BasePageProps & {
  isModerator: boolean;
};

export const Overview: React.FC<OverviewPageProps> = props => {
  const { isModerator } = props;
  const navigate = useNavigate();
  const { getCorePlugins } = useRootComponentProps();
  const { t } = useTranslation('app-vibes');

  const navigateTo = getCorePlugins().routing.navigateTo;

  const handleClickApply = () => {
    navigateTo({
      appName: '@akashaorg/app-vibes-console',
      getNavigationUrl: (routes: Record<string, string>) => routes['Become Moderator'],
    });
  };

  const handleCodeOfConductClick = () => {
    navigateTo({
      appName: '@akashaorg/app-legal',
      getNavigationUrl: (routes: Record<string, string>) => routes.codeOfConduct,
    });
  };

  const handleValueClick = (path: string) => () => {
    navigate({
      to: '/overview/values/$value',
      params: {
        value: path,
      },
    });
  };

  const overviewCTAArr = [
    {
      label: `📖 ${t('Our Code of Conduct')} ✨`,
      url: externalLinks.discourse.CoC,
      handler: handleCodeOfConductClick,
    },
    {
      label: `🗣️ ${t('Code of Conduct Discussions')} 🚀`,
      url: externalLinks.discourse.CoC,
    },
    {
      label: `👉🏼 ${t('Vibes Thoughts')} 🧠`,
      url: externalLinks.discord,
    },
  ];

  return (
    <Stack spacing="gap-y-4">
      {/**
       * if logged user is not a moderator, show this prompt
       */}
      {!isModerator && (
        <BecomeModeratorCard
          titleLabel={t('Become a Moderator')}
          subtitleLabel={`🌈 ${t(
            'Dive into Akasha World as a moderator! Contribute, guide our community, and create impact. Your journey starts here',
          )}`}
          buttonLabel={t('Apply Now!')}
          onClickApply={handleClickApply}
        />
      )}

      <VibesIntroCard
        titleLabel={t('Welcome to AKASHA Vibes')}
        subtitleLabel={t(
          "The Vibes app encourages collaboration while safeguarding against misuse. It's an open and transparent platform, inviting you to actively participate in shaping our community's governance",
        )}
        overviewCTAArr={overviewCTAArr}
      />

      <VibesValuesCard
        titleLabel={t('Our Values')}
        subtitleLabel={t('The principles guiding our behaviour')}
        ctaLabel={t('Propose your own')}
        ctaUrl={externalLinks.discourse.values}
        values={values.map(value => ({
          path: value.path,
          title: t('{{title}}', { title: value.title }),
          assetName: value.assetName,
          description: value.description,
        }))}
        onValueClick={handleValueClick}
      />
    </Stack>
  );
};
