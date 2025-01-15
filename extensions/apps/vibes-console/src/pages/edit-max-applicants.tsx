import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { MaxApplicants } from '../components/dashboard';
import routes, { SETTINGS } from '../routes';

export const EditMaxApplicants: React.FC<unknown> = () => {
  const navigate = useNavigate();
  const { uiEvents } = useRootComponentProps();

  const { t } = useTranslation('app-vibes-console');

  const handleCancelButtonClick = () => {
    navigate({
      to: routes[SETTINGS],
    });
  };

  const handleConfirmButtonClick = () => {
    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Success,
        title: t('Moderator limit updated successfully'),
      },
    });
  };

  return (
    <MaxApplicants
      label={t('Moderator limit')}
      introLabel={t(
        'The current maximum number of moderators will limit the number of applications until you set it to a higher / lower number.',
      )}
      maxApplicantsLabel={t('Moderator Max')}
      maxApplicantsPlaceholderLabel={t('Please enter maximum number of applicants')}
      cancelButtonLabel={t('Cancel')}
      confirmButtonLabel={t('Update')}
      confirmButtonVariant="secondary"
      onCancelButtonClick={handleCancelButtonClick}
      onConfirmButtonClick={handleConfirmButtonClick}
    />
  );
};
