import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { RespondAdmin } from '../components/dashboard';
import routes, { DASHBOARD, SETTINGS } from '../routes';

export const RespondAdminPage: React.FC<unknown> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-vibes-console');
  const { uiEvents } = useRootComponentProps();

  const handleCancelButtonClick = () => {
    navigate({
      to: routes[SETTINGS],
    });
  };

  const handleConfirmButtonClick = () => {
    navigate({
      to: routes[DASHBOARD],
    });
    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Info,
        title: t('Pending confirmation from assigned admin'),
      },
    });
  };

  return (
    <RespondAdmin
      label={t('Admin Role Assignment')}
      introLabel={t(
        'has chosen you as their successor as they have to resign from their role. If you choose to accept, then you will have to assume the following responsibilities',
      )}
      tasks={[
        t('Review new moderators applications'),
        t("Revoke moderators for violating AKASHA's Code of Conduct"),
      ]}
      cancelButtonLabel="Reject"
      confirmButtonLabel="Accept"
      onCancelButtonClick={handleCancelButtonClick}
      onConfirmButtonClick={handleConfirmButtonClick}
    />
  );
};
