import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import routes, { CREATE_EXTENSION, MY_EXTENSIONS } from '../../../routes';
import {
  useRootComponentProps,
  useAkashaStore,
  useValidateUniqueExtensionProp,
} from '@akashaorg/ui-awf-hooks';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import ExtensionCreationForm from '@akashaorg/design-system-components/lib/components/ExtensionCreationForm';
import { DRAFT_EXTENSIONS } from '../../../constants';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { Extension, NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';

export const ExtensionCreationPage: React.FC<unknown> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');

  const { uiEvents, baseRouteName, getCorePlugins } = useRootComponentProps();
  const uiEventsRef = React.useRef(uiEvents);
  const navigateTo = getCorePlugins().routing.navigateTo;

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${routes[CREATE_EXTENSION]}`,
        }).toString()}`;
      },
    });
  };

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

  const {
    loading: loadingAppInfo,
    error: appInfoQueryError,
    handleCheckExtProp,
    isDuplicateExtProp,
  } = useValidateUniqueExtensionProp(authenticatedDID, draftExtensions);

  useEffect(() => {
    if (appInfoQueryError) {
      showErrorNotification(appInfoQueryError.message);
    }
  }, [appInfoQueryError, showErrorNotification]);

  if (!authenticatedDID) {
    return (
      <ErrorLoader
        type="not-authenticated"
        title={`${t('Uh-oh')}! ${t('You are not connected')}!`}
        details={`${t('To create an extension you must be connected')} ⚡️`}
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
    <Card padding="py-4 px-0" margin="mb-2">
      <Stack spacing="gap-y-4">
        <Text variant="h5" weight="semibold" align="center">
          {t('Create an Extension')}
        </Text>
        <Divider />
        <Stack>
          <ExtensionCreationForm
            extensionDisplayNameFieldLabel={t('Extension Display Name')}
            extensionDisplayNamePlaceholderLabel={t('extension x')}
            extensionNameFieldLabel={t('Extension ID')}
            extensionNamePlaceholderLabel={t('unique extension identifier')}
            extensionLicenseFieldLabel={t('Extension License')}
            extensionLicenseOtherPlaceholderLabel={t('Please specify your license type')}
            extensionTypeFieldLabel={t('Extension Type')}
            disclaimerLabel={t(
              `📝 You can modify or update any details later when editing the extension.`,
            )}
            handleCheckExtProp={handleCheckExtProp}
            isDuplicateExtProp={isDuplicateExtProp}
            loading={loadingAppInfo}
            cancelButton={{
              label: t('Cancel'),
              disabled: false,
              handleClick: () => {
                navigate({
                  to: routes[MY_EXTENSIONS],
                });
              },
            }}
            createButton={{
              label: t('Create locally'),
              handleClick: data => {
                const extensionId = crypto.randomUUID();
                const newExtension = {
                  id: extensionId,
                  applicationType: data?.applicationType,
                  createdAt: new Date().toISOString(),
                  description: '',
                  displayName: data?.displayName,
                  license: data?.license,
                  name: data?.name,
                  localDraft: true,
                };

                localStorage.setItem(
                  `${DRAFT_EXTENSIONS}-${authenticatedDID}`,
                  JSON.stringify([...draftExtensions, newExtension]),
                );

                navigate({
                  to: `/create-extension/$extensionId`,
                  params: { extensionId: newExtension.id },
                });
              },
            }}
          />
        </Stack>
      </Stack>
    </Card>
  );
};
