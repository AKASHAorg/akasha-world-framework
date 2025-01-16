import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { AssignAdmin } from '../components/dashboard';
import routes, { DASHBOARD, SETTINGS } from '../routes';

export const AssignAdminPage: React.FC<unknown> = () => {
  const [assignedAdmin, setAssignedAdmin] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('app-vibes-console');
  const { uiEvents } = useRootComponentProps();
  const handleAssignButtonClick = () => {
    setAssignedAdmin(true);
  };
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
  const introLabel = !assignedAdmin
    ? t(
        'Before resigning, you need to assign a new admin from the list below or you can search for a certain moderator',
      )
    : `${t(
        'Once the moderator accept the admin request you will be able to resign officially. The following moderator will be notified about assignment',
      )}:`;
  return (
    <AssignAdmin
      activeModerators={[]}
      label={t('Assign a New Admin')}
      introLabel={t('{{introLabel}}', { introLabel })}
      searchPlaceholderLabel={t('Search for a moderator')}
      assignButtonLabel={t('Assign')}
      assignedAdmin={assignedAdmin}
      onClickAssign={handleAssignButtonClick}
      {...(assignedAdmin && {
        cancelButtonLabel: 'Cancel',
        confirmButtonLabel: 'Confirm Assignment',
        onCancelButtonClick: handleCancelButtonClick,
        onConfirmButtonClick: handleConfirmButtonClick,
      })}
    />
  );
};
