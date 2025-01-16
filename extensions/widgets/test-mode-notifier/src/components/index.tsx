import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useAkashaStore, useRootComponentProps, withProviders } from '@akashaorg/ui-core-hooks';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { I18nextProvider, useTranslation } from 'react-i18next';
import {
  MinusIcon,
  BeakerIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import AppAvatar from '@akashaorg/design-system-core/lib/components/AppAvatar';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import { LocalReleaseData } from '@akashaorg/typings/lib/ui';

const TestModeWidget = () => {
  const [testExtensions, setTestExtensions] = useState<LocalReleaseData[]>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const { getCorePlugins, worldConfig, logger } = useRootComponentProps();
  const { t } = useTranslation();
  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const testModeLoaderPlugin = useRef(getCorePlugins().testModeLoader);

  useEffect(() => {
    if (!authenticatedDID) {
      return;
    }
    const sessionKey = testModeLoaderPlugin.current?.getTestSessionKey?.();
    const extensions = sessionStorage.getItem(sessionKey);
    if (extensions) {
      try {
        const ext: LocalReleaseData[] = JSON.parse(extensions);
        if (ext.length > 0) {
          // set extensions
          setTestExtensions(ext);
        }
      } catch (ex) {
        // set error
        logger.error(ex);
        setError(ex);
      }
    }
  }, [authenticatedDID, logger]);

  if (!testExtensions) {
    return null;
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const onLeave = async () => {
    await testModeLoaderPlugin.current?.unload();
    window.location.href = `${window.location.origin}/${worldConfig.homepageApp}`;
  };

  const onEdit = (applicationID: string) => () => {
    getCorePlugins().routing.navigateTo({
      appName: worldConfig.extensionsApp,
      getNavigationUrl: () => {
        return `/release-manager/${applicationID}/edit-test-release`;
      },
    });
  };

  return (
    <>
      {testExtensions.length > 0 && (
        <>
          {isMinimized && (
            <Button
              variant="primary"
              iconOnly={true}
              onClick={toggleMinimize}
              icon={<BeakerIcon />}
            />
          )}
          {!isMinimized && (
            <Card padding="p-4" fullWidth={true}>
              <Stack direction="row" justify="between" align={'baseline'}>
                <Text variant="h6">{t('Testing Environment')}</Text>
                <Button
                  icon={<MinusIcon />}
                  iconOnly={true}
                  plainIcon={true}
                  onClick={toggleMinimize}
                />
              </Stack>
              <Stack customStyle="my-2 rounded-xl" background={{ light: 'grey9', dark: 'grey3' }}>
                {error && (
                  <Text variant="subtitle2" color="error">
                    {t('Failed to load app info. Please check console for more details.')}
                  </Text>
                )}
                {testExtensions.map((ext, idx) => (
                  <Fragment key={ext.appName}>
                    <Stack
                      key={ext.appName}
                      direction="row"
                      padding="p-2"
                      spacing="gap-x-2"
                      align={'center'}
                      justify="between"
                    >
                      <Stack direction="row" align={'center'} spacing="gap-x-2">
                        <AppAvatar
                          height={2.5}
                          width={2.5}
                          customStyle={'rounded-md'}
                          appType={ext.applicationType}
                        />
                        <Stack direction="column" align="start">
                          <Text
                            variant={'button-lg'}
                            customStyle="max-w-[15ch]"
                            title={ext.appName}
                            key={ext.appName}
                            truncate={true}
                          >
                            {ext.appName}
                          </Text>
                          <Text
                            variant={'subtitle2'}
                            title={ext.source}
                            customStyle="max-w-[20ch]"
                            truncate={true}
                          >
                            {ext.source}
                          </Text>
                        </Stack>
                      </Stack>
                      <Button
                        variant={'text'}
                        label={t('Edit')}
                        customStyle="pr-2"
                        onClick={onEdit(ext.applicationID)}
                      />
                    </Stack>
                    {idx < testExtensions.length - 1 && (
                      <Divider customStyle="border-grey6 dark:border-grey5 px-2" />
                    )}
                  </Fragment>
                ))}
              </Stack>
              <Stack spacing="gap-y-2">
                <Stack customStyle="md:flex-row" fullWidth={true} spacing="gap-2">
                  <Button
                    label={t('Reload')}
                    customStyle="w-full"
                    onClick={() => window.location.reload()}
                  />
                </Stack>
                <Button
                  variant="text"
                  label={t('Leave Environment')}
                  customStyle="w-full py-2"
                  onClick={onLeave}
                />
              </Stack>
            </Card>
          )}
        </>
      )}
    </>
  );
};

const Widget = () => {
  const { getTranslationPlugin } = useRootComponentProps();
  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <TestModeWidget />
    </I18nextProvider>
  );
};

export default withProviders(Widget);
