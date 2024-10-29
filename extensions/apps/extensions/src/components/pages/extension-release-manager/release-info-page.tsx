import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { Extension, NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { ExtensionElement } from '../my-extensions/extension-element';
import { DRAFT_EXTENSIONS, PROPERTY, PROVIDER } from '../../../constants';
import {
  useGetAppReleaseByIdQuery,
  useGetAppsByIdQuery,
} from '@akashaorg/ui-awf-hooks/lib/generated';
import Pill from '@akashaorg/design-system-core/lib/components/Pill';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import { formatDate } from '@akashaorg/design-system-core/lib/utils';

type ExtensionReleaseInfoPageProps = {
  extensionId: string;
  releaseId: string;
};

export const ExtensionReleaseInfoPage: React.FC<ExtensionReleaseInfoPageProps> = ({
  extensionId,
  releaseId,
}) => {
  const { t } = useTranslation('app-extensions');
  const { uiEvents, baseRouteName, getCorePlugins, getTranslationPlugin } = useRootComponentProps();

  const locale = getTranslationPlugin().i18n?.languages?.[0] || 'en';

  const navigateTo = getCorePlugins().routing.navigateTo;
  const uiEventsRef = React.useRef(uiEvents);

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const showErrorNotification = React.useCallback((title: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
      },
    });
  }, []);

  const draftExtensions: Extension[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`)) || [];
    } catch (error) {
      showErrorNotification(error);
    }
  }, [authenticatedDID, showErrorNotification]);

  const localExtensionData = draftExtensions.find(ext => ext.id === extensionId);

  const {
    data: appsByIdReq,
    loading: loadingAppsByIdQuery,
    error: appsByIdError,
  } = useGetAppsByIdQuery({
    variables: { id: extensionId },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const publishedAppData = appsByIdReq?.node;

  const extensionData = useMemo(() => {
    if (publishedAppData && 'applicationType' in publishedAppData) {
      return publishedAppData;
    }
    return localExtensionData;
  }, [localExtensionData, publishedAppData]);

  const {
    data: releaseByIdReq,
    loading: loadingReleaseByIdQuery,
    error: releaseByIdError,
  } = useGetAppReleaseByIdQuery({
    variables: { id: releaseId },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const releaseData = useMemo(() => {
    if (releaseByIdReq?.node && 'id' in releaseByIdReq.node) {
      return releaseByIdReq.node;
    }
    return null;
  }, [releaseByIdReq]);

  const createdAt = releaseData ? formatDate(releaseData.createdAt, 'D MMM YYYY', locale) : '';

  const description = releaseData?.meta.find(
    metaProperty => metaProperty.property === PROPERTY && metaProperty.provider === PROVIDER,
  )?.value;

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/release-manager/${extensionId}/release-info/${releaseId}`,
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
        <Button variant="primary" label={t('Connect')} onClick={handleConnectButtonClick} />
      </ErrorLoader>
    );
  }

  return (
    <Card padding={16} background={{ light: 'white', dark: 'grey2' }}>
      <Stack spacing="gap-y-6">
        <Card padding={8} background={{ light: 'grey9', dark: 'grey3' }}>
          {loadingReleaseByIdQuery && (
            <Stack align="center" justify="center">
              <Spinner />
            </Stack>
          )}
          {!loadingReleaseByIdQuery && (
            <ExtensionElement extensionData={extensionData as Extension} />
          )}
        </Card>
        <Stack direction="row" justify="between">
          <Text variant="h6" weight="semibold">
            {t('Version Number')}
          </Text>
          <Stack direction="row" spacing="gap-x-2">
            <Text variant="body2">{releaseData?.version}</Text>
            {/* @TODO: find a way to tell this is the latest release */}
            {/* <Pill
              type="info"
              borderColor={{ light: 'secondaryLight', dark: 'secondaryDark' }}
              label={t('Current')}
            /> */}
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing="gap-y-4">
          <Text variant="h6" weight="semibold" breakWord>
            {t('Description')}
          </Text>
          <Text variant="body2" breakWord>
            {description}
          </Text>
        </Stack>

        <Divider />

        <Stack spacing="gap-y-4">
          <Text variant="h6" weight="semibold">
            {t('Source URL')}
          </Text>
          <Text variant="body2" color={{ light: 'secondaryLight', dark: 'secondaryDark' }} truncate>
            {releaseData?.source}
          </Text>
        </Stack>

        <Divider />

        <Stack direction="row" justify="between">
          <Text variant="h6" weight="semibold">
            {t('Published on')}
          </Text>
          <Text variant="body2">{createdAt}</Text>
        </Stack>
      </Stack>
    </Card>
  );
};
