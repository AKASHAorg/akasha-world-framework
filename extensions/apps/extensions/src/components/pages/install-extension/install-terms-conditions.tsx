import React, { ChangeEvent, useCallback, useEffect, useRef } from 'react';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Checkbox from '@akashaorg/design-system-core/lib/components/Checkbox';
import { useTranslation } from 'react-i18next';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { useNavigate } from '@tanstack/react-router';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import AppAvatar from '@akashaorg/design-system-core/lib/components/AppAvatar';
import {
  AkashaAppApplicationType,
  AppImageSource,
  SortOrder,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import { useGetAppsByPublisherDidQuery } from '@akashaorg/ui-core-hooks/lib/generated';
import getSDK from '@akashaorg/core-sdk';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import {
  selectAkashaApp,
  selectAppDisplayName,
  selectAppLogoImage,
  selectPublisherName,
} from '@akashaorg/ui-core-hooks/lib/selectors/get-apps-by-publisher-did-query';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';

enum TermsFields {
  PRIVACY_POLICY = 'privacyPolicy',
  TERMS_OF_USE = 'termsOfUse',
  CODE_OF_CONDUCT = 'codeOfConduct',
  DISCLAIMERS = 'disclaimers',
}

const TermsLinks = {
  [TermsFields.PRIVACY_POLICY]: '/@akashaorg/app-legal/privacy-policy',
  [TermsFields.TERMS_OF_USE]: '/@akashaorg/app-legal/terms-of-use',
  [TermsFields.CODE_OF_CONDUCT]: '/@akashaorg/app-legal/code-of-conduct',
  [TermsFields.DISCLAIMERS]: '#',
};

type AcceptedTerms = {
  [TermsFields.PRIVACY_POLICY]: boolean;
  [TermsFields.TERMS_OF_USE]: boolean;
  [TermsFields.CODE_OF_CONDUCT]: boolean;
  [TermsFields.DISCLAIMERS]: boolean;
};

export const ExtensionInstallTerms = ({ appId }: { appId: string }) => {
  const { decodeAppName, getCorePlugins, uiEvents } = useRootComponentProps();
  const decodeName = useRef(decodeAppName);

  const installerPlugin = getCorePlugins().extensionInstaller;

  const idxDid = getSDK().services.gql.indexingDID;

  const {
    data: appInfo,
    loading: loadingAppInfo,
    called: appInfoQueryCalled,
    error: appInfoQueryError,
  } = useGetAppsByPublisherDidQuery({
    variables: {
      id: idxDid,
      first: 1,
      filters: { where: { name: { equalTo: decodeName.current(appId) } } },
      sorting: { createdAt: SortOrder.Desc },
    },
  });

  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();

  useEffect(() => {}, []);

  const navigate = useNavigate();
  const [acceptedTerms, setAcceptedTerms] = React.useState<AcceptedTerms>({
    [TermsFields.PRIVACY_POLICY]: false,
    [TermsFields.TERMS_OF_USE]: false,
    [TermsFields.CODE_OF_CONDUCT]: false,
    [TermsFields.DISCLAIMERS]: false,
  });

  const { t } = useTranslation();

  const handleCheckboxChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = ev.target;
    setAcceptedTerms(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleLoginClick = useCallback(() => {
    getCorePlugins().routing.navigateTo({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (appRoutes: Record<string, string>) => {
        return `${appRoutes.Connect}?${new URLSearchParams({
          redirectTo: location.pathname,
        })}`;
      },
    });
  }, [getCorePlugins]);

  const handleContinue = async () => {
    if (!allTermsAccepted) return;

    await installerPlugin.acceptUserAgreement(selectAkashaApp(appInfo));

    await navigate({
      to: '/install/$appId/progress',
      params: { appId },
      replace: true,
    });
  };

  const handleCancel = () => {
    navigate({
      to: `/info/$appId`,
      params: { appId },
      replace: true,
    }).catch(err => console.error('Failed to navigate!', err));

    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title: t('Installation cancelled'),
      },
    });
  };

  const allTermsAccepted = Object.values(acceptedTerms).every(Boolean);

  const fieldLabels = {
    [TermsFields.PRIVACY_POLICY]: t('Privacy Policy'),
    [TermsFields.TERMS_OF_USE]: t('Terms of Use'),
    [TermsFields.CODE_OF_CONDUCT]: t('Code of Conduct'),
    [TermsFields.DISCLAIMERS]: t('Disclaimers'),
  };

  const isAppInfoLoading = loadingAppInfo && appInfoQueryCalled;
  if (isAuthenticating) {
    return null;
  }

  if (!authenticatedDID && !isAuthenticating) {
    const appDisplayName = isAppInfoLoading ? t('this app') : selectAppDisplayName(appInfo);
    return (
      <ErrorLoader
        type="not-authenticated"
        title={t('Login Required')}
        details={t('You must be logged in to install {{appDisplayName}}', {
          appDisplayName,
        })}
      >
        <Button label={t('Login')} onClick={handleLoginClick} />
      </ErrorLoader>
    );
  }

  if (appInfoQueryError) {
    return (
      <ErrorLoader
        type={'no-apps'}
        title={t('Oops, failed to get extension info')}
        details={t('This error means we cannot get extension information at this moment.')}
      />
    );
  }

  return (
    <Card padding="p-0">
      <TermsHeader
        isLoading={isAppInfoLoading}
        appDisplayName={selectAppDisplayName(appInfo)}
        appPublisher={selectPublisherName(appInfo)}
        appLogo={selectAppLogoImage(appInfo)}
      />
      <Divider />
      <Text variant="subtitle2" selectable={false} customStyle="m-4">
        {t('I agree to:')}
      </Text>
      <Stack direction="column" spacing="gap-y-4" customStyle="mx-4 mb-4">
        {Object.keys(acceptedTerms).map(stateKey => (
          <Stack direction="row" spacing="gap-x-2" key={stateKey} align={'center'}>
            <Checkbox
              key={stateKey}
              id={stateKey}
              isSelected={acceptedTerms[stateKey]}
              name={stateKey}
              label={fieldLabels[stateKey]}
              handleChange={handleCheckboxChange}
              value={'value'}
              customStyle={'gap-x-3'}
            />
            <a
              href={TermsLinks[stateKey]}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5"
            >
              <Icon
                color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                icon={<ArrowTopRightOnSquareIcon />}
              />
            </a>
          </Stack>
        ))}
      </Stack>
      <Divider />
      <Stack
        customStyle="flex-column md:flex-row-reverse"
        justify="between"
        spacing="gap-y-4"
        padding="p-4"
      >
        <Button
          variant={'primary'}
          label={t('Continue')}
          disabled={!allTermsAccepted}
          onClick={handleContinue}
        />
        <Button variant="text" label={t('Cancel installation')} onClick={handleCancel} />
      </Stack>
    </Card>
  );
};

const TermsHeader = ({
  appDisplayName,
  appPublisher,
  appLogo,
  isLoading,
}: {
  appDisplayName: string;
  appPublisher: string;
  appLogo?: AppImageSource;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Stack padding="p-3">
      <Text variant="h5">{t('User Agreement')}</Text>
      <Stack direction="row" spacing="gap-x-2" customStyle="mt-3" align="center">
        {isLoading && <Icon icon={<ArrowPathIcon />} />}
        {!isLoading && (
          <AppAvatar
            customStyle="w-10 h-10 cursor-default"
            appType={AkashaAppApplicationType.App}
            avatar={appLogo}
          />
        )}
        <Stack direction="column" justify="between">
          {isLoading && (
            <Text variant="button-sm" selectable={false}>
              {t('Loading extension info...')}
            </Text>
          )}
          {!isLoading && (
            <>
              <Text variant="button-md" selectable={false}>
                {appDisplayName}
              </Text>
              <Text
                variant="footnotes2"
                color={{ light: 'grey7', dark: 'grey4' }}
                customStyle="max-w-[35ch] sm:max-w-full truncate"
                selectable={false}
              >
                {appPublisher}
              </Text>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
