import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { ReviewItem } from '../components/dashboard';
import routes, { DASHBOARD, VIEW_ALL_REPORTS } from '../routes';

export type ReviewItemPageProps = {
  action: string;
  itemType: string;
  id: string;
};

export const ReviewItemPage: React.FC<ReviewItemPageProps> = props => {
  const { action, itemType } = props;

  const [selectedPeriod, setSelectedPeriod] = useState('');

  const navigate = useNavigate();
  const { t } = useTranslation('app-vibes-console');
  const { getCorePlugins, uiEvents } = useRootComponentProps();

  const navigateTo = getCorePlugins().routing.navigateTo;

  const handleReasonClick = (id: string) => {
    navigate({
      to: routes[VIEW_ALL_REPORTS],
      params: { id },
    });
  };

  const handleRadioChange = (value: string) => {
    setSelectedPeriod(value);
  };

  const handleCancelButtonClick = () => {
    navigate({
      to: routes[DASHBOARD],
    });
  };

  const handleConfirmButtonClick = () => {
    navigate({
      to: routes[DASHBOARD],
    });
    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Success,
        title: t('Content successfully reviewed'),
      },
    });
  };

  const handleSubtitleLinkClick = (link: string) => {
    navigateTo?.({
      appName: '@akashaorg/app-legal',
      getNavigationUrl: () => link,
    });
  };

  const footnoteLabels = [
    {
      label: t('If you are unsure, you can refer to our'),
    },
    { label: t('Code of Conduct'), link: '/code-of-conduct' },
    { label: t('and') },
    { label: t('Terms of Service'), link: '/terms-of-service' },
  ];

  return (
    <ReviewItem
      section1Label={t(
        'The {{itemType}} was reported for violating the following Code of Conduct',
        { itemType: itemType === 'Profile' ? 'user' : 'content' },
      )}
      section3Label={t('Please explain your decision')}
      {...(itemType === 'Profile' &&
        action === 'Suspend' && {
          section2Label: t('Select suspension period'),
          radioButtons: [
            { label: t('3 days'), value: '3 days' },
            { label: t('2 weeks'), value: '2 weeks' },
            { label: t('Indefinitely'), value: 'Indefinitely' },
            { label: t('Other'), value: 'Other' },
          ],
          selectedPeriod,
        })}
      datePlaceholderLabel={t('Select a Date Range')}
      reasonPlaceholderLabel={t('Write down some reason here')}
      subtitleLabels={footnoteLabels}
      cancelButtonLabel={t('Cancel')}
      confirmButtonLabel={t('{{action}}', { action })}
      handleReasonClick={handleReasonClick}
      handleRadioChange={handleRadioChange}
      onLinkClick={handleSubtitleLinkClick}
      onCancelButtonClick={handleCancelButtonClick}
      onConfirmButtonClick={handleConfirmButtonClick}
    />
  );
};
