import React, { useCallback, useRef } from 'react';
import InlineNotification from '@akashaorg/design-system-core/lib/components/InlineNotification';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { useTranslation } from 'react-i18next';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { Radius } from '@akashaorg/design-system-core/lib/components/types/common.types';

export const MAX_REFETCH_COUNT = 3;

type NetworkErrorCardProps = {
  title: string;
  message: string;
  reloadCount: number;
  borderRadius?: Radius;
  onReload: () => void;
};

export const NetworkErrorCard: React.FC<NetworkErrorCardProps> = props => {
  const { title, message, reloadCount, borderRadius, onReload } = props;
  const { t } = useTranslation('ui-lib-feed');
  const { uiEvents } = useRootComponentProps();
  const uiEventsRef = useRef(uiEvents);

  const showErrorNotification = useCallback((title: string, description: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
        description,
      },
    });
  }, []);

  return (
    <InlineNotification
      type="error"
      title={title}
      message={message}
      borderRadius={borderRadius}
      button={{
        label: t('Reload'),
        handleClick: () => {
          if (reloadCount < MAX_REFETCH_COUNT) {
            onReload();
            return;
          }
          showErrorNotification(
            t('Multiple reload attempts failed'),
            t('Please check your internet connection or try again later.'),
          );
        },
      }}
    />
  );
};
