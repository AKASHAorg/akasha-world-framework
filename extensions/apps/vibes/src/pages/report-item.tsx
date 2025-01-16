import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useModerationCategory, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { ReportItem, ReportItemConfirmation } from '../components/report';
import routes, { HOME } from '../routes';
import { reasons, externalLinks } from '../utils';

export type ReportItemPageProps = {
  itemType: string;
  itemId: string;
};

export const ReportItemPage: React.FC<ReportItemPageProps> = props => {
  const { itemType } = props;
  const [step, setStep] = useState<number>(0);
  const { t } = useTranslation('app-vibes');
  const navigate = useNavigate();
  const { getCorePlugins } = useRootComponentProps();

  const navigateTo = getCorePlugins().routing.navigateTo;
  const moderationCategories = reasons.map(({ title }) => ({
    value: title,
    label: t('{{title}}', { title }),
  }));

  const allCategoriesLabel = t('All Categories');

  const { categories, handleCategoryClick } = useModerationCategory({
    moderationCategories,
    allCategoriesLabel,
    maxSelection: 1,
  });

  const handleCancelButtonClick = () => {
    if (step === 1) {
      return setStep(0);
    }
    navigate({
      to: routes[HOME],
    });
  };

  const handleConfirmButtonClick = () => {
    if (step < 2) {
      return setStep(step + 1);
    }
    /**
     * interact with api
     */
  };

  const handleContinueClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-antenna',
      getNavigationUrl: (routes: Record<string, string>) => routes.defaultRoute,
    });
  };

  const handleSubtitleLinkClick = (link: string) => {
    navigateTo?.({
      appName: '@akashaorg/app-legal',
      getNavigationUrl: () => link,
    });
  };

  const reportDetailsSubtitles = [
    {
      label: t('If you are unsure, you can refer to our'),
    },
    { label: t('Code of Conduct'), link: '/code-of-conduct' },
    { label: t('and') },
    { label: t('Terms of Service'), link: '/terms-of-service' },
  ];

  if (step === 2) {
    return (
      <ReportItemConfirmation
        titleLabel={t('Thank you for keeping the good vibes')}
        subtitleLabel={t('Our moderators will review the report as soon as possible')}
        continueLabel={t('Continue on Antenna')}
        footnoteLabel={t('Feel like you want to contribute more to improve our community?')}
        ctaLabel={t('Join our Moderation Discord channel')}
        onContinueClick={handleContinueClick}
        ctaUrl={externalLinks.discord}
      />
    );
  }

  return (
    <ReportItem
      label={t('Flagging {{type}}', {
        type: itemType[0].toUpperCase() + itemType.slice(1),
      })}
      step={step}
      introLabel={
        step === 0
          ? t('Can you please let us know why did this {{itemType}} bother you?', {
              itemType,
            })
          : t('Provide us with more details')
      }
      subTextLabel={step === 0 ? `${t('You can only choose one')}` : t('optional')}
      categories={categories}
      moderationCategories={moderationCategories}
      selectedReason={reasons.find(el => el.title === categories[0])} // since user can select only one category here
      reasonPlaceholderLabel={`${t('Place some details here, if any')}...`}
      subtitleLabels={reportDetailsSubtitles}
      cancelButtonLabel={t('Cancel')}
      confirmButtonLabel={step === 0 ? t('Proceed') : t('Submit')}
      confirmButtonDisabled={step === 0 && !categories.length}
      onPillClick={handleCategoryClick}
      onLinkClick={handleSubtitleLinkClick}
      onCancelButtonClick={handleCancelButtonClick}
      onConfirmButtonClick={handleConfirmButtonClick}
    />
  );
};
