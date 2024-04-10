import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { AdminSettings } from '../components/dashboard';
import routes, { EDIT_MAX_MODERATORS, DASHBOARD } from '../routes';

export const Settings: React.FC<unknown> = () => {
  const navigate = useNavigate();

  const { t } = useTranslation('app-vibes');

  const handleChangeButtonClick = () => {
    navigate({
      to: routes[EDIT_MAX_MODERATORS],
    });
  };

  const handleCancelButtonClick = () => {
    navigate({
      to: routes[DASHBOARD],
    });
  };

  return (
    <AdminSettings
      label={t('Admin Settings')}
      changeLimitLabel={t('Change')}
      currentNumberLabel={t('Current number')}
      sections={{
        one: {
          title: t('Admin since'),
        },
        two: {
          title: t('Moderator limit'),
          description: t(
            'The current maximum number of moderators willlimit the number of applications until you set it to a higher / lower number.',
          ),
        },
        three: {
          title: t('Admin Duties'),
          description: t(
            'You can resign anytime from your role. By resigning you will not be able anymore to receive or approve new moderator applications. Before resigning, you need to assign a new admin.',
          ),
        },
      }}
      cancelButtonLabel="Back"
      confirmButtonLabel="Resign from admin role"
      confirmButtonVariant="secondary"
      onChangeButtonClick={handleChangeButtonClick}
      onCancelButtonClick={handleCancelButtonClick}
      onConfirmButtonClick={() => {
        /** */
      }}
    />
  );
};
