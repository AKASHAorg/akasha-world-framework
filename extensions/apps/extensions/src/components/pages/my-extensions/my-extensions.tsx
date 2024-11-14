import React, { useEffect, useMemo, useState } from 'react';
import { capitalize } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import {
  filterEvents,
  hasOwn,
  useAkashaStore,
  useRootComponentProps,
} from '@akashaorg/ui-awf-hooks';
import { useGetAppsByPublisherDidQuery } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import {
  EventTypes,
  Extension,
  ExtensionStatus,
  NotificationEvents,
  NotificationTypes,
  UIEventData,
} from '@akashaorg/typings/lib/ui';
import { SortOrder, AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Dropdown from '@akashaorg/design-system-core/lib/components/Dropdown';
import DefaultEmptyCard from '@akashaorg/design-system-components/lib/components/DefaultEmptyCard';
import DynamicInfiniteScroll from '@akashaorg/design-system-components/lib/components/DynamicInfiniteScroll';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Link from '@akashaorg/design-system-core/lib/components/Link';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { ExtensionElement } from './extension-element';
import appRoutes, { MY_EXTENSIONS } from '../../../routes';
import { DRAFT_EXTENSIONS } from '../../../constants';

const ENTRY_HEIGHT = 92;

export const MyExtensionsPage: React.FC<unknown> = () => {
  const { uiEvents, baseRouteName, getCorePlugins } = useRootComponentProps();
  const uiEventsRef = React.useRef(uiEvents);

  const { t } = useTranslation('app-extensions');

  const navigate = useNavigate();
  const navigateTo = getCorePlugins().routing.navigateTo;

  const showErrorNotification = React.useCallback((title: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
      },
    });
  }, []);

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const handleNavigateToCreateApp = () => {
    navigate({ to: '/create-extension' });
  };

  const extensionTypeMenuItems = [
    'All',
    capitalize(AkashaAppApplicationType.App),
    capitalize(AkashaAppApplicationType.Widget),
    capitalize(AkashaAppApplicationType.Plugin),
    capitalize(AkashaAppApplicationType.Other),
  ];

  const extensionStatusMenuItems = [
    'All',
    ExtensionStatus.LocalDraft,
    ExtensionStatus.Draft,
    ExtensionStatus.InReview,
    ExtensionStatus.Published,
  ];

  const [selectedType, setSelectedType] = React.useState<string>(extensionTypeMenuItems[0]);
  const [selectedStatus, setSelectedStatus] = React.useState<string>(extensionStatusMenuItems[0]);

  const handleResetClick = () => {
    setSelectedStatus(extensionStatusMenuItems[0]);
    setSelectedType(extensionTypeMenuItems[0]);
  };

  const {
    data: appsByPubReqData,
    error,
    loading,
    fetchMore,
    refetch,
  } = useGetAppsByPublisherDidQuery({
    variables: {
      id: authenticatedDID,
      first: 10,
      sorting: { createdAt: SortOrder.Desc },
    },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    skip: !authenticatedDID,
  });
  const appsList = useMemo(() => {
    return appsByPubReqData?.node && hasOwn(appsByPubReqData.node, 'akashaAppList')
      ? appsByPubReqData.node.akashaAppList
      : null;
  }, [appsByPubReqData]);

  const appsData = useMemo(() => {
    return appsList?.edges?.map(edge => edge.node) || [];
  }, [appsList]);

  const pageInfo = useMemo(() => {
    return appsList?.pageInfo;
  }, [appsList]);

  const appElements = useMemo(() => {
    return appsData?.filter(ext => {
      if (selectedType === 'All') {
        return true;
      }
      return ext?.applicationType === selectedType.toUpperCase();
    });
  }, [appsData, selectedType]);

  const [draftExtensions, setDraftExtensions] = useState([]);

  // fetch the draft extensions that are saved only on local storage

  const allMyExtensions = [...draftExtensions, ...appElements];

  const getDraftExtensions = () => {
    try {
      const existingDraftExtensions =
        JSON.parse(localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`)) ?? [];
      setDraftExtensions(existingDraftExtensions);
    } catch (error) {
      showErrorNotification(error);
      setDraftExtensions([]);
    }
  };

  useEffect(() => {
    getDraftExtensions();
    // subscribe and listen to events
    const eventsSub = uiEventsRef.current
      .pipe(filterEvents([EventTypes.RefetchMyExtensions]))
      .subscribe({
        next: (eventInfo: UIEventData) => {
          if (eventInfo.event === EventTypes.RefetchMyExtensions) {
            getDraftExtensions();
            refetch({
              id: authenticatedDID,
            });
          }
        },
      });

    return () => {
      if (eventsSub) {
        eventsSub.unsubscribe();
      }
    };
  }, []);

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${appRoutes[MY_EXTENSIONS]}`,
        }).toString()}`;
      },
    });
  };

  if (!authenticatedDID) {
    return (
      <ErrorLoader
        type="not-authenticated"
        title={`${t('Uh-oh')}! ${t('You are not connected')}!`}
        details={`${t('To check your extensions you must be connected')} ⚡️`}
      >
        <Button
          variant="primary"
          size="md"
          label={t('Connect')}
          onClick={handleConnectButtonClick}
        />
      </ErrorLoader>
    );
  }

  return (
    <Stack spacing="gap-y-4">
      <Stack direction="row" justify="between">
        <Text variant="h5">{t('My extensions')}</Text>
        <Link target="_blank" to="https://docs.akasha.world" customStyle="w-fit self-end">
          <Icon icon={<BookOpenIcon />} accentColor />
        </Link>
      </Stack>
      <Stack
        direction="row"
        justify="between"
        align="center"
        padding={12}
        background={{ light: 'grey9', dark: 'grey5' }}
        customStyle="rounded-[20px]"
      >
        <Text variant="body1">{t('Create an extension ✨ 🚀')}</Text>
        <Button variant="primary" label={t('Create')} onClick={handleNavigateToCreateApp} />
      </Stack>
      <Stack direction="row" justify="between" align="center" spacing="gap-4">
        <Dropdown
          menuItems={extensionTypeMenuItems}
          selected={selectedType}
          setSelected={setSelectedType}
          placeholderLabel={t('Type')}
          customStyle="grow"
        />
        <Dropdown
          menuItems={extensionStatusMenuItems}
          selected={selectedStatus}
          setSelected={setSelectedStatus}
          placeholderLabel={t('Status')}
          customStyle="grow"
        />
        <Button variant="text" onClick={handleResetClick} label={t('Reset')} />
      </Stack>
      {error && (
        <ErrorLoader
          type="script-error"
          title={'Sorry, there was an error when fetching apps'}
          details={error.message}
        />
      )}
      {!error && allMyExtensions?.length === 0 && (
        <DefaultEmptyCard
          noBorder={true}
          infoText={t("You haven't created any extensions yet")}
          assetName="longbeam-notfound"
        />
      )}
      {!error && allMyExtensions?.length > 0 && (
        <Card>
          <DynamicInfiniteScroll
            count={allMyExtensions.length}
            estimatedHeight={ENTRY_HEIGHT}
            overScan={1}
            itemSpacing={16}
            hasNextPage={pageInfo && pageInfo.hasNextPage}
            loading={loading}
            onLoadMore={() => {
              return fetchMore({
                variables: {
                  after: pageInfo.endCursor,
                },
              });
            }}
          >
            {({ itemIndex }) => {
              const extensionData = allMyExtensions[itemIndex];
              return (
                <ExtensionElement
                  extensionData={extensionData as Extension}
                  showDivider={itemIndex < allMyExtensions.length - 1}
                  filter={selectedStatus}
                  showMenu
                />
              );
            }}
          </DynamicInfiniteScroll>
        </Card>
      )}
    </Stack>
  );
};
