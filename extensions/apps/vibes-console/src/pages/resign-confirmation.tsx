import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { ResignConfirmation } from '../components/dashboard';

export const ResignConfirmationPage: React.FC<unknown> = () => {
  const { getCorePlugins } = useRootComponentProps();
  const navigateTo = getCorePlugins().routing.navigateTo;

  const { t } = useTranslation('app-vibes-console');

  const handleCloseButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-antenna',
      getNavigationUrl: (routes: Record<string, string>) => routes.defaultRoute,
    });
  };

  return (
    <ResignConfirmation
      titleLabel={t('You are no longer a moderator')}
      subtitleLabel={t(
        'Thank you for protecting our community from harm. Remember, you can always re-apply and be a moderator again anytime!',
      )}
      continueLabel={t('Continue reading on Antenna')}
      onContinueClick={handleCloseButtonClick}
    />
  );
};
