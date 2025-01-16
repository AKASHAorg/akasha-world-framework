import React, { useEffect } from 'react';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import { useTranslation } from 'react-i18next';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import Button from '@akashaorg/design-system-core/lib/components/Button';

export const NotFoundComponent = (props: { error?: Error; reset?: (key: string) => void }) => {
  const { t } = useTranslation();
  const { getCorePlugins, logger, worldConfig } = useRootComponentProps();

  useEffect(() => {
    if (props.error) {
      logger.warn(`Error in Extensions app: ${props.error}`);
    }
  }, [logger, props.error]);

  const navigateHome = () => {
        getCorePlugins().routing.navigateTo({
      appName: worldConfig.homepageApp,
      getNavigationUrl: () => '/',
    });
  };

  return (
    <ErrorLoader
      type="page-not-found"
      title={`${t('Oops!')} ${t('Page not found')}`}
      details={t(
        'This error means that the webpage you were trying to reach does not exist on {{worldTitle}}. It may have been moved, deleted, or the URL might be incorrect.',
        { worldTitle: worldConfig.title },
      )}
    >
      <Button label={t('Home')} variant="primary" onClick={navigateHome} />
    </ErrorLoader>
  );
};
